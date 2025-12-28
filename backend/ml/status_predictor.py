# backend/ml/status_predictor.py

import pymysql
import numpy as np
import onnxruntime as ort
from sklearn.preprocessing import StandardScaler
import pandas as pd

# CHANGED: Import for improved return type and json
from typing import Dict, Tuple


class CompressorStatusPredictor:
    def __init__(self, db_config, model_path):
        self.db_config = db_config
        self.model_path = model_path
        self.ort_session = ort.InferenceSession(model_path)
        self.features = [
            "vibration",
            "power_consumption",
            "efficiency",
            "ambient_temperature",
            "humidity",
            "air_pollution",
            "maintenance_quality",
            "fuel_quality",
            "load_factor",
        ]
        self.scaler = StandardScaler()
        self._fit_scaler()
        self.status_map = {
            0: "Normal",
            1: "Load Surge",
            2: "Temperature Overload",
            3: "Mechanical Imbalance",
            4: "Critical Fault",
        }

    def _fit_scaler(self):
        """Preparing standardization with raw data from the database."""
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data"
        df = pd.read_sql_query(query, conn)
        conn.close()
        self.scaler.fit(df.values)

    def fetch_latest_data(self):
        """Get the latest data from the database."""
        conn = pymysql.connect(**self.db_config)
        query = f"SELECT {', '.join(self.features)} FROM compressor_data ORDER BY timestamp DESC LIMIT 1"
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df.values

    # CHANGED: Predict method now returns status, confidence, and all class probabilities
    def predict(self) -> Tuple[str, float, Dict[str, float]]:
        """
        Compressor condition prediction returning status, confidence, and all probabilities.
        """
        data = self.fetch_latest_data()
        if data is None or len(data) == 0:
            return "No data available", 0.0, {}

        # Data normalization
        data_scaled = self.scaler.transform(data.astype(np.float32))

        # Making predictions with ONNX
        ort_inputs = {
            self.ort_session.get_inputs()[0].name: data_scaled.astype(np.float32)
        }
        ort_outs = self.ort_session.run(None, ort_inputs)

        # 1. Uncertainty Estimation: Use Softmax output (probabilities)
        probabilities = ort_outs[0].flatten()

        # Finding the class with the highest probability (Confidence/Trust)
        predicted_class_index = np.argmax(probabilities)
        confidence = float(probabilities[predicted_class_index])

        predicted_status = self.status_map[predicted_class_index]

        # Map probabilities to status labels
        prob_dict = {
            self.status_map[i]: float(probabilities[i])
            for i in range(len(probabilities))
        }

        return predicted_status, confidence, prob_dict
