"""
Edge Real-Time Monitoring (RTM) Processor

Performs real-time anomaly detection and monitoring at the edge level
using ONNX models for low-latency inference.
"""

import numpy as np
import onnxruntime as ort
import logging
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from edge.config import (
    EDGE_MODELS_DIR,
    RTM_MODEL_PATH,
    RTM_SCALER_MEAN_PATH,
    RTM_SCALER_SCALE_PATH,
    RTM_FEATURE_COLUMNS,
)

logger = logging.getLogger(__name__)


class EdgeRTMProcessor:
    """
    Edge-level RTM processor for anomaly detection and monitoring.
    
    This processor uses ONNX models for fast inference and can operate
    independently of cloud connectivity.
    """

    def __init__(
        self,
        model_path: Optional[Path] = None,
        scaler_mean_path: Optional[Path] = None,
        scaler_scale_path: Optional[Path] = None,
    ):
        """
        Initialize the Edge RTM Processor.

        Args:
            model_path: Path to ONNX RTM model file
            scaler_mean_path: Path to scaler mean parameters
            scaler_scale_path: Path to scaler scale parameters
        """
        self.model_path = model_path or RTM_MODEL_PATH
        self.scaler_mean_path = scaler_mean_path or RTM_SCALER_MEAN_PATH
        self.scaler_scale_path = scaler_scale_path or RTM_SCALER_SCALE_PATH
        self.features = RTM_FEATURE_COLUMNS

        self.session = None
        self.scaler_mean = None
        self.scaler_scale = None
        self.input_name = None

        self._load_model()
        self._load_scaler_params()

    def _load_model(self):
        """Load the ONNX RTM model."""
        try:
            if not self.model_path.exists():
                logger.warning(f"RTM model not found at {self.model_path}, using fallback")
                # Try alternative path
                alt_path = EDGE_MODELS_DIR / "isolation_forest_model.onnx"
                if alt_path.exists():
                    self.model_path = alt_path
                else:
                    logger.error("No RTM model found, RTM processing will be disabled")
                    return

            self.session = ort.InferenceSession(str(self.model_path))
            self.input_name = self.session.get_inputs()[0].name
            logger.info(f"✅ Edge RTM model loaded from {self.model_path}")
        except Exception as e:
            logger.error(f"❌ Error loading Edge RTM model: {e}")
            self.session = None

    def _load_scaler_params(self):
        """Load scaler parameters for data normalization."""
        try:
            if self.scaler_mean_path.exists() and self.scaler_scale_path.exists():
                self.scaler_mean = np.load(self.scaler_mean_path)
                self.scaler_scale = np.load(self.scaler_scale_path)
                logger.info("✅ Edge RTM scaler parameters loaded")
            else:
                logger.warning("Scaler parameters not found, using default normalization")
        except Exception as e:
            logger.error(f"❌ Error loading scaler parameters: {e}")

    def _preprocess_data(self, data: Dict[str, Any]) -> Optional[np.ndarray]:
        """
        Preprocess sensor data for model input.

        Args:
            data: Dictionary containing sensor readings

        Returns:
            Preprocessed numpy array or None if preprocessing fails
        """
        try:
            # Extract features in the correct order
            feature_vector = []
            for feature in self.features:
                value = data.get(feature, 0.0)
                feature_vector.append(float(value))

            # Convert to numpy array
            input_array = np.array(feature_vector, dtype=np.float32).reshape(1, -1)

            # Normalize if scaler parameters are available
            if self.scaler_mean is not None and self.scaler_scale is not None:
                input_array = (input_array - self.scaler_mean) / self.scaler_scale

            return input_array
        except Exception as e:
            logger.error(f"Error preprocessing data: {e}")
            return None

    def predict(self, data: Dict[str, Any]) -> Tuple[Optional[bool], Optional[float], Dict[str, Any]]:
        """
        Perform anomaly detection on sensor data.

        Args:
            data: Dictionary containing sensor readings

        Returns:
            Tuple of (is_anomaly, anomaly_score, metadata)
            Returns (None, None, {}) if prediction fails
        """
        if not self.session:
            logger.warning("RTM model not loaded, skipping prediction")
            return None, None, {}

        try:
            # Preprocess data
            input_array = self._preprocess_data(data)
            if input_array is None:
                return None, None, {}

            # Run inference
            outputs = self.session.run(None, {self.input_name: input_array})

            # Extract prediction (assumes model outputs anomaly score or label)
            # Adjust based on your actual model output format
            prediction = outputs[0]

            # Handle different output formats
            if prediction.ndim > 1:
                prediction = prediction.flatten()

            # Assume binary classification: 0 = normal, 1 = anomaly
            # Or continuous score where higher = more anomalous
            if len(prediction) == 1:
                anomaly_score = float(prediction[0])
                is_anomaly = anomaly_score > 0.5  # Threshold may need adjustment
            else:
                # Multi-class output, use argmax or threshold
                anomaly_score = float(prediction[1]) if len(prediction) > 1 else float(prediction[0])
                is_anomaly = anomaly_score > 0.5

            metadata = {
                "model_path": str(self.model_path),
                "prediction_raw": prediction.tolist() if hasattr(prediction, 'tolist') else str(prediction),
            }

            return is_anomaly, anomaly_score, metadata

        except Exception as e:
            logger.error(f"Error during RTM prediction: {e}")
            return None, None, {}

    def get_status(self) -> Dict[str, Any]:
        """
        Get the status of the RTM processor.

        Returns:
            Dictionary containing status information
        """
        return {
            "model_loaded": self.session is not None,
            "scaler_loaded": self.scaler_mean is not None and self.scaler_scale is not None,
            "model_path": str(self.model_path),
            "features_count": len(self.features),
        }

