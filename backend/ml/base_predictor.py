# backend/ml/base_predictor.py

import onnxruntime as ort
import logging


class BasePredictor:
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.session = None
        self.load_model()

    def load_model(self):
        try:
            self.session = ort.InferenceSession(self.model_path)
            logging.info(f"✅ Model loaded successfully from {self.model_path}")
        except Exception as e:
            logging.error(f"❌ Error loading model from {self.model_path}: {e}")
            self.session = None

    def get_status(self):
        """Returns the loading status of the model."""
        return {"model_loaded": self.session is not None}
