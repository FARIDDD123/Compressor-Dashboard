# backend/api/routes/mlops_routes.py

import logging
from flask import Blueprint, jsonify
from backend.ml.rtm_module import AnomalyDetector
from backend.ml.base_predictor import BasePredictor  # <-- Import BasePredictor

mlops_bp = Blueprint("mlops_routes", __name__)


@mlops_bp.route("/status", methods=["GET"])
def get_models_status():
    """
    Provides a health check for all critical ML models loaded in the system.
    """
    try:
        # Check RTM model status using its own class
        rtm_detector = AnomalyDetector()
        rtm_status = rtm_detector.get_status()

        # Check RUL and RTO models by loading them with the generic BasePredictor
        rul_predictor = BasePredictor("artifacts/rul_model.onnx")
        rto_predictor = BasePredictor("artifacts/best_ppo_actor.onnx")

        final_status = {
            "rtm_anomaly_detector": rtm_status,
            "pdm_rul_predictor": rul_predictor.get_status(),
            "rto_optimizer": rto_predictor.get_status(),
        }

        # Check if all models and their scalers (if applicable) are fully loaded
        all_ok = all(
            status.get("model_loaded", False) and status.get("scaler_loaded", True)
            for status in final_status.values()
        )

        http_status = 200 if all_ok else 503
        return jsonify(final_status), http_status

    except Exception as e:
        logging.error(f"Error in /models/status endpoint: {e}")
        return jsonify({"error": "Failed to check model status"}), 500
