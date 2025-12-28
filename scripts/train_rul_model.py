import os
import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
from pykalman import KalmanFilter
import pickle
import tensorflow as tf
from keras.models import Sequential
from keras.layers import LSTM, Dense, Input
from keras.callbacks import EarlyStopping
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import tf2onnx
from tqdm import tqdm

# --- 1. Setup Logging and Configuration ---
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Configuration ---
CONFIG = {
    "data_path": "datasets/MASTER_DATASET.csv",
    "artifacts_path": "artifacts",
    "window_size": 120,  # Increased from 60 for better temporal context
    "test_size": 0.2,
    "kalman_filter_columns": [
        "Pressure_In",
        "Temperature_In",
        "Vibration",
        "Temperature_Out",
    ],
    "target_column": "Label",
    "epochs": 100,  # Increased from 50
    "batch_size": 64,  # Reduced from 128 for better convergence
    "lstm_units": [128, 64],  # Multi-layer LSTM
    "dropout": 0.2,
    "recurrent_dropout": 0.2,
}


# --- 2. Data Loading and Preprocessing ---
def load_and_preprocess_data(config: dict):
    logger.info(f"Reading dataset from {config['data_path']}...")
    if not os.path.exists(config["data_path"]):
        logger.error(f"❌ Dataset not found at {config['data_path']}.")
        return None, None

    df = pd.read_csv(config["data_path"])
    logger.info("Dataset read successfully. Starting preprocessing...")

    logger.info("Applying Kalman Filter...")
    for col in tqdm(config["kalman_filter_columns"], desc="Applying Kalman Filter"):
        kf = KalmanFilter(initial_state_mean=df[col].mean(), n_dim_obs=1)
        em_kf = kf.em(df[col].values)
        smoothed_values = em_kf.smooth(df[col].values)[0]
        df[col] = smoothed_values.flatten()

    logger.info("Handling missing values with KNNImputer...")
    numeric_cols = df.select_dtypes(include=np.number).columns
    imputer = KNNImputer(n_neighbors=3)
    df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

    feature_cols = [
        col for col in numeric_cols if col not in [config["target_column"], "Time"]
    ]
    logger.info("Preprocessing complete.")
    return df, feature_cols


# --- 3. Feature Engineering and Model Training ---
def train_rul_model(config: dict):
    df, feature_cols = load_and_preprocess_data(config)
    if df is None:
        return

    logger.info("Scaling features...")
    scaler = StandardScaler()
    df[feature_cols] = scaler.fit_transform(df[feature_cols])

    logger.info(f"Creating sequences with window size {config['window_size']}...")

    def create_sequences(data, labels, window_size):
        Xs, ys = [], []
        for i in tqdm(range(len(data) - window_size), desc="Creating Sequences"):
            Xs.append(data[i : i + window_size])
            ys.append(labels[i + window_size])
        return np.array(Xs, dtype=np.float32), np.array(ys, dtype=np.float32)

    X, y = create_sequences(
        df[feature_cols].values,
        df[config["target_column"]].values,
        config["window_size"],
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config["test_size"], shuffle=False
    )
    logger.info(
        f"Train/Test split complete. Train shape: {X_train.shape}, Test shape: {X_test.shape}"
    )

    n_timesteps, n_features = X_train.shape[1], X_train.shape[2]

    # --- OPTIMIZED: Multi-layer LSTM with dropout ---
    model = Sequential(
        [
            Input(shape=(n_timesteps, n_features)),
            LSTM(
                config["lstm_units"][0],
                activation="relu",
                return_sequences=True,
                dropout=config["dropout"],
                recurrent_dropout=config["recurrent_dropout"],
            ),
            LSTM(
                config["lstm_units"][1],
                activation="relu",
                dropout=config["dropout"],
                recurrent_dropout=config["recurrent_dropout"],
            ),
            Dense(1),
        ]
    )
    model.compile(optimizer="adam", loss="mean_squared_error")

    early_stopping = EarlyStopping(
        monitor="val_loss", patience=5, restore_best_weights=True
    )

    logger.info("\n--- Starting Model Training ---")
    model.fit(
        X_train,
        y_train,
        epochs=config["epochs"],
        batch_size=config["batch_size"],
        validation_split=0.2,
        callbacks=[early_stopping],
        verbose=1,
    )
    logger.info("--- Training Complete ---")

    logger.info("\n--- Evaluating Model Performance ---")
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    logger.info(f"✅ Mean Absolute Error (MAE): {mae:.4f}")
    logger.info(f"✅ R-squared (R²) Score: {r2:.4f}")

    # --- Save Artifacts ---
    os.makedirs(config["artifacts_path"], exist_ok=True)

    scaler_path = os.path.join(config["artifacts_path"], "rul_scaler.pkl")
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    logger.info(f"✅ Scaler saved to '{scaler_path}'")

    # --- CORRECTED SECTION for ONNX Conversion ---
    logger.info("\n--- Converting Final Model to ONNX Format ---")
    try:
        # Wrap the Sequential model in a functional Model to define I/O names
        input_tensor = tf.keras.Input(
            shape=(n_timesteps, n_features), name="input_layer"
        )
        output_tensor = model(input_tensor)
        functional_model = tf.keras.Model(
            inputs=input_tensor, outputs=output_tensor, name="rul_model"
        )

        input_signature = [
            tf.TensorSpec(
                [None, n_timesteps, n_features], tf.float32, name="input_layer"
            )
        ]

        # Convert the new functional model
        model_proto, _ = tf2onnx.convert.from_keras(
            functional_model, input_signature, opset=13
        )

        onnx_model_path = os.path.join(config["artifacts_path"], "rul_model.onnx")
        with open(onnx_model_path, "wb") as f:
            f.write(model_proto.SerializeToString())

        logger.info(f"✅ Model successfully converted and saved to '{onnx_model_path}'")

    except Exception as e:
        logger.error(f"❌ An error occurred during ONNX conversion: {e}")


if __name__ == "__main__":
    train_rul_model(CONFIG)
