import numpy as np
import onnxruntime as ort
import logging
from typing import Dict, List

# Use an absolute import from the 'backend' package root
from backend.core.database import CompressorDatabase


class VibrationPredictor:
    """A class for predicting vibrations using a pre-trained ONNX Transformer model."""

    def __init__(
        self,
        db_config: Dict,
        model_path: str,
        scaler_mean_path: str,
        scaler_scale_path: str,
        window_size: int = 60,
    ):
        if not all([db_config, model_path, scaler_mean_path, scaler_scale_path]):
            raise ValueError("db_config and paths for model/scaler are required.")

        self.db = CompressorDatabase(**db_config)
        self.window_size = window_size
        self.data_window = []

        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("VibrationPredictor")

        # Load the model using the provided absolute path
        try:
            self.model = ort.InferenceSession(model_path)
            self.logger.info(f"Model loaded successfully from {model_path}")
        except Exception as e:
            self.logger.error(f"Error loading model from {model_path}: {e}")
            raise

        # Load scaler parameters using provided absolute paths
        try:
            self.scaler_mean = np.load(scaler_mean_path)
            self.scaler_scale = np.load(scaler_scale_path)
            self.logger.info("Normalization parameters loaded successfully.")
        except FileNotFoundError as e:
            self.logger.error(f"Could not find scaler files: {e}")
            raise

    def initialize(self) -> bool:
        """Initializes the system by connecting to the DB and filling the initial data window."""
        if not self.db.connect():
            return False
        # Load only enough data to fill the window
        query = (
            f"SELECT * FROM {self.db.table} ORDER BY Time ASC LIMIT {self.window_size}"
        )
        if not self.db.load_data(query=query):
            return False
        self._fill_initial_window()
        return True

    def _fill_initial_window(self) -> None:
        """Fills the initial time window with historical data from the database."""
        self.logger.info("Filling initial data window...")

    def _process_record(self, record: Dict) -> None:
        """Processes and normalizes a single record."""

    def predict_all(self) -> List[Dict]:
        """Performs predictions for all available records in the database."""
