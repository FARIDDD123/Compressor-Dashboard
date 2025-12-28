# backend/ml/onnx_predictor.py

import os
import numpy as np
import onnxruntime as ort
from dotenv import load_dotenv
from typing import Dict, List, Tuple
import logging
import time  # NEW Import

# CORRECTED: Use an absolute import from the 'backend' package root
from backend.core.database import CompressorDatabase

DART_MODEL_FEATURES = [
    "Pressure_In",
    "Temperature_In",
    "Flow_Rate",
    "Pressure_Out",
    "Efficiency",
    "Vibration",
    "Ambient_Temperature",
    "Power_Consumption",
]


class ONNXPredictor:
    """A generic class to run predictions using an ONNX model and data from the database."""

    def __init__(self, onnx_model_path: str, db_config: Dict):
        self.logger = logging.getLogger("ONNXPredictor")

        try:
            self.session = ort.InferenceSession(onnx_model_path)
            self.input_name = self.session.get_inputs()[0].name
            # Check if model input shape matches our feature list
            model_input_shape = self.session.get_inputs()[0].shape
            self.expected_features = model_input_shape[1]
            if self.expected_features != len(DART_MODEL_FEATURES):
                self.logger.warning(
                    f"Model expects {self.expected_features} features, but {len(DART_MODEL_FEATURES)} are provided."
                )

            self.logger.info(f"Model loaded successfully from {onnx_model_path}")
        except Exception as e:
            self.logger.error(f"Error loading ONNX model from {onnx_model_path}: {e}")
            raise

        if not db_config:
            raise ValueError("db_config is required for ONNXPredictor.")
        self.db = CompressorDatabase(**db_config)
        self.scaler = None

    def _preprocess_data(self, records: List[Dict]) -> np.ndarray:
        """
        Extracts the required features from a list of records and converts them to a numpy array.
        """
        processed_data = []
        for record in records:
            try:
                # Extract features in the correct order
                feature_vector = [record[feature] for feature in DART_MODEL_FEATURES]
                processed_data.append(feature_vector)
            except KeyError as e:
                self.logger.error(
                    f"Required feature {e} not found in data record. Skipping record."
                )
                continue

        return np.array(processed_data, dtype=np.float32)

    # CHANGED: Added latency logging
    def predict_all_values(self) -> np.ndarray:
        """
        Loads data from the database, preprocesses it, and runs prediction for all entries.
        """
        if not self.db.connect():
            raise ConnectionError("Failed to connect to the database")

        if not self.db.load_data():
            raise ValueError("Failed to load data from the database")

        input_data = self._preprocess_data(self.db._data)

        if input_data.shape[0] == 0:
            self.logger.warning(
                "No valid data records found for prediction after preprocessing."
            )
            return np.array([])

        # Check if the number of features matches the model's expectation
        if input_data.shape[1] != self.expected_features:
            self.logger.error(
                f"Input data has {input_data.shape[1]} features, but model expects {self.expected_features}."
            )
            return np.array([])

        start_time = time.time()

        predictions = self.session.run(None, {self.input_name: input_data})[0]

        latency_ms = (time.time() - start_time) * 1000
        self.logger.info(
            f"Prediction inference time: {latency_ms:.2f} ms"
        )  # Log Latency

        return predictions.flatten()

    # NEW: Predict method for a single data point, returning prediction and latency
    def predict_single(
        self, input_data: np.ndarray, model_version: str
    ) -> Tuple[np.ndarray, float]:
        """Runs prediction for a single data point and returns latency."""
        if input_data.shape[0] != 1 or input_data.ndim != 2:
            raise ValueError(
                "Input data must be a single row (2D array: 1 row, N features)."
            )

        start_time = time.time()

        ort_inputs = {self.input_name: input_data.astype(np.float32)}
        predictions = self.session.run(None, ort_inputs)[0]

        latency_ms = (time.time() - start_time) * 1000
        self.logger.debug(f"Inference time for {model_version}: {latency_ms:.2f} ms")

        return predictions, latency_ms


if __name__ == "__main__":
    # This block allows for direct testing of the script
    load_dotenv()

    db_config = {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE", "compressor_db"),
        "table": "compressor_data",
    }

    # Use the correct path from the .env file or the default
    model_path = os.getenv("DART_MODEL_PATH", "artifacts/dart_model.onnx")

    if not all([db_config.get("password"), os.path.exists(model_path)]):
        print(
            "Database password not found in .env or model file does not exist. Exiting."
        )
        exit(1)

    try:
        predictor = ONNXPredictor(model_path, db_config)
        predicted_values = predictor.predict_all_values()

        print(f"Generated {len(predicted_values)} predictions.")
        for idx, value in enumerate(predicted_values[:10]):  # Print first 10
            print(f"Prediction for Entry {idx + 1}: {value:.4f}")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        if "predictor" in locals() and predictor.db:
            predictor.db.close()
