# scripts/train_rtm_model.py

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# For ONNX conversion
import skl2onnx
from skl2onnx.common.data_types import FloatTensorType

# Import configuration from the backend
# Assuming the script is run from the project root or the correct path is set
try:
    from backend.core.config import (
        RTM_FEATURE_COLUMNS,
        RTM_EXPLAIN_MODEL_PATH,
        RTM_MODEL_PATH,
        RTM_SCALER_MEAN_PATH,
        RTM_SCALER_SCALE_PATH,
    )
except ImportError:
    print(
        "Error: Could not import configuration. Ensure 'backend.core.config' is accessible."
    )
    # Use fallback paths for execution outside of a structured environment
    RTM_MODEL_PATH = "../artifacts/rtm_model.onnx"
    RTM_EXPLAIN_MODEL_PATH = "../artifacts/rtm_random_forest.joblib"
    RTM_SCALER_MEAN_PATH = "../artifacts/rtm_scaler_mean.npy"
    RTM_SCALER_SCALE_PATH = "../artifacts/rtm_scaler_scale.npy"
    RTM_FEATURE_COLUMNS = [
        "Pressure_In",
        "Temperature_In",
        "Flow_Rate",
        "Pressure_Out",
        "Temperature_Out",
        "Efficiency",
        "Power_Consumption",
        "Vibration",
        "Ambient_Temperature",
        "Humidity",
        "Air_Pollution",
        "Frequency",
        "Amplitude",
        "Phase_Angle",
        "Velocity",
        "Stiffness",
        "Vibration_roll_mean",
        "Power_Consumption_roll_mean",
        "Vibration_roll_std",
        "Power_Consumption_roll_std",
    ]


DATASET_PATH = (
    "datasets/MASTER_DATASET.csv"  # Adjusted path based on typical project structure
)
WINDOW_SIZE = 5


def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """Applies rolling mean and std features."""

    # Check if base columns for rolling window exist
    if "Vibration" not in df.columns or "Power_Consumption" not in df.columns:
        print(
            "Required columns 'Vibration' or 'Power_Consumption' not found for feature engineering."
        )
        return df

    df["Vibration_roll_mean"] = df["Vibration"].rolling(window=WINDOW_SIZE).mean()
    df["Power_Consumption_roll_mean"] = (
        df["Power_Consumption"].rolling(window=WINDOW_SIZE).mean()
    )
    df["Vibration_roll_std"] = df["Vibration"].rolling(window=WINDOW_SIZE).std()
    df["Power_Consumption_roll_std"] = (
        df["Power_Consumption"].rolling(window=WINDOW_SIZE).std()
    )

    # Fill NaN values created by the rolling window operation
    df.bfill(inplace=True)
    df.ffill(inplace=True)

    return df


def train_rtm_model():
    """Loads data, trains the RTM RandomForest model, evaluates it, and saves artifacts."""

    # --- 1. Load Data ---
    print("Loading data...")
    try:
        df = pd.read_csv(DATASET_PATH)
        print("✅ Data loaded successfully.")
    except FileNotFoundError:
        print(f"❌ Error: Dataset not found at {DATASET_PATH}. Aborting.")
        return

    # --- 2. Feature Engineering ---
    print("\n--- Starting Feature Engineering ---")
    df = feature_engineering(df)

    # Verify that all required feature columns are present after engineering
    missing_cols = [col for col in RTM_FEATURE_COLUMNS if col not in df.columns]
    if missing_cols:
        print(
            f"❌ Error: Missing required feature columns after engineering: {missing_cols}. Aborting."
        )
        return

    print(
        f"✅ Feature engineering complete. Total features: {len(RTM_FEATURE_COLUMNS)}"
    )

    # --- 3. Prepare Data for Supervised Learning ---
    print("\n--- Preparing data for supervised learning ---")
    X = df[RTM_FEATURE_COLUMNS]
    # Map "Normal" to 1 and all others (Anomaly/Failure) to -1
    y = df["Status"].apply(lambda x: 1 if x == "Normal" else -1)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print("✅ Data split and scaled successfully.")

    # --- 4. Train New RandomForest Model ---
    print("\n--- Training New RandomForest Model ---")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train_scaled, y_train)
    print("✅ New model trained successfully.")

    # --- 5. Evaluate the New Model ---
    print("\n--- Evaluating New Model Performance on Test Data ---")
    y_pred = model.predict(X_test_scaled)

    print("\n--- Model Performance Metrics ---")
    print(
        classification_report(
            y_test, y_pred, target_names=["Anomaly (-1)", "Normal (1)"]
        )
    )

    print("\n--- Confusion Matrix ---")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)

    # --- 6. Save New Models (ONNX & Sklearn) and Scaler ---
    print("\n--- Saving new models and scaler ---")

    # Save the model in ONNX format for fast prediction (RTM_MODEL_PATH)
    target_opset = {"": 15, "ai.onnx.ml": 3}
    initial_type = [("input", FloatTensorType([None, len(RTM_FEATURE_COLUMNS)]))]

    try:
        onnx_model = skl2onnx.convert_sklearn(
            model, initial_types=initial_type, target_opset=target_opset
        )
        with open(RTM_MODEL_PATH, "wb") as f:
            f.write(onnx_model.SerializeToString())
        print(f"✅ New ONNX model saved to: {RTM_MODEL_PATH}")
    except Exception as e:
        print(f"❌ Error saving ONNX model: {e}")

    # Save the original scikit-learn model using joblib (RTM_EXPLAIN_MODEL_PATH)
    try:
        joblib.dump(model, RTM_EXPLAIN_MODEL_PATH)
        print(f"✅ New Sklearn model saved to: {RTM_EXPLAIN_MODEL_PATH}")
    except Exception as e:
        print(f"❌ Error saving Sklearn model: {e}")

    # Save the scaler parameters
    try:
        np.save(RTM_SCALER_MEAN_PATH, scaler.mean_)
        np.save(RTM_SCALER_SCALE_PATH, scaler.scale_)
        print(
            f"✅ New scaler parameters saved to: {RTM_SCALER_MEAN_PATH} and {RTM_SCALER_SCALE_PATH}"
        )
    except Exception as e:
        print(f"❌ Error saving scaler parameters: {e}")


if __name__ == "__main__":
    train_rtm_model()
