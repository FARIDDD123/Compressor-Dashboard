# backend/ml/rtm_module.py

import numpy as np
import pandas as pd
import logging
import joblib
from treeinterpreter import treeinterpreter as ti
from .base_predictor import BasePredictor
from backend.core import config


class AnomalyDetector(BasePredictor):
    """
    Detects anomalies using an ONNX model and explains them using a separate
    tree-based model (e.g., RandomForest).
    """

    def __init__(
        self,
        model_path=config.RTM_MODEL_PATH,
        mean_path=config.RTM_SCALER_MEAN_PATH,
        scale_path=config.RTM_SCALER_SCALE_PATH,
        explain_model_path=config.RTM_EXPLAIN_MODEL_PATH,
    ):
        """Initializes the main model, scaler parameters, and the explanation model."""
        super().__init__(model_path)
        self.features = config.RTM_FEATURE_COLUMNS
        self.scaler_mean = None
        self.scaler_scale = None
        self.explain_model = None
        self.load_scaler_params(mean_path, scale_path)
        self.load_explain_model(explain_model_path)

    def load_scaler_params(self, mean_path, scale_path):
        """Loads the pre-computed mean and scale vectors for normalization."""
        try:
            self.scaler_mean = np.load(mean_path)
            self.scaler_scale = np.load(scale_path)
            logging.info("✅ RTM scaler parameters loaded successfully.")
        except FileNotFoundError:
            logging.error(
                f"❌ Scaler parameter files not found at {mean_path} or {scale_path}."
            )

    def load_explain_model(self, model_path):
        """Loads the explainable model for feature contribution analysis."""
        try:
            self.explain_model = joblib.load(model_path)
            logging.info("✅ RTM explainable model loaded successfully.")
        except FileNotFoundError:
            logging.error(f"❌ Explainable model file not found at {model_path}.")

    def get_status(self):
        """Returns the loading status of the model, scaler, and explainable model."""
        status = super().get_status()
        status["scaler_loaded"] = (
            self.scaler_mean is not None and self.scaler_scale is not None
        )
        status["explainer_loaded"] = self.explain_model is not None
        return status

    def explain_anomaly(self, input_tensor: np.ndarray) -> list:
        """
        Explains an anomaly by calculating feature contributions using treeinterpreter.
        """
        if not self.explain_model:
            return ["Explanation model not loaded"]
        try:
            _, _, contributions = ti.predict(self.explain_model, input_tensor)
            # Contributions for the anomaly class
            anomaly_contributions = contributions[0, :, 0]
            feature_contributions = {
                feature: contribution
                for feature, contribution in zip(self.features, anomaly_contributions)
            }
            # Sort features by their contribution (most negative are strongest causes)
            sorted_features = sorted(
                feature_contributions.items(), key=lambda item: item[1]
            )
            # Get the top 3 features with negative contributions
            top_causes = [
                feature
                for feature, contribution in sorted_features[:3]
                if contribution < 0
            ]
            return top_causes if top_causes else ["Contribution analysis failed"]
        except Exception as e:
            logging.error(f"❌ Error during anomaly explanation: {e}")
            return ["Explanation Error"]

    def predict(self, data_row: dict) -> tuple:
        """
        Performs a prediction and provides explanations for anomalies.
        Returns a tuple of (prediction, causes).
        """
        if not self.session or self.scaler_mean is None:
            logging.error("❌ Model or scaler not loaded. Cannot predict.")
            return None, []

        try:
            df_point = pd.DataFrame([data_row])
            input_data = df_point[self.features].values
            input_scaled = (input_data - self.scaler_mean) / self.scaler_scale
            input_tensor = input_scaled.astype(np.float32)

            input_name = self.session.get_inputs()[0].name

            # 1. Perform a quick prediction with the ONNX model
            prediction_result = self.session.run(None, {input_name: input_tensor})[0][0]
            prediction = int(prediction_result)

            # 2. If it's an anomaly, find the causes
            causes = []
            if prediction == -1:
                causes = self.explain_anomaly(input_tensor)

            return prediction, causes
        except KeyError as e:
            logging.error(
                f"❌ Prediction Error: Feature {e} is missing from the data row."
            )
            return None, []
        except Exception as e:
            logging.error(f"❌ Prediction Error: {e}")
            return None, []
