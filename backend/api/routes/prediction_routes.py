# backend/routes/prediction_routes.py
import logging
from flask import Blueprint, jsonify, current_app
from backend.core.auth import require_auth

prediction_bp = Blueprint("prediction_routes", __name__)


# Helper function to handle common prediction errors
def handle_prediction_errors(e, endpoint_name):
    logging.error(f"Error in {endpoint_name}: {e}")
    if isinstance(e, (ConnectionError, RuntimeError)):
        return jsonify({"error": f"Service error: {e}"}), 503
    elif isinstance(e, (ValueError, KeyError)):
        return jsonify({"error": f"Invalid data for prediction: {e}"}), 400
    else:
        return jsonify(
            {"error": "An internal server error occurred during prediction"}
        ), 500


@prediction_bp.route("/predict_vibration", methods=["GET"])
@require_auth
def predict_vibration():
    try:
        vibration_predictor = current_app.config["VIBRATION_PREDICTOR"]
        results = vibration_predictor.predict_all()
        return (
            jsonify(results)
            if results
            else (jsonify({"message": "No predictions available"}), 404)
        )
    except Exception as e:
        return handle_prediction_errors(e, "/predict_vibration")


@prediction_bp.route("/predict_dart", methods=["GET"])
@require_auth
def predict_dart():
    try:
        dart_predictor = current_app.config["DART_PREDICTOR"]
        predicted_values = dart_predictor.predict_all_values()
        if not predicted_values:
            return jsonify({"message": "No predictions available"}), 404
        predictions_list = [
            {"Entry": idx + 1, "Predicted Value": float(value)}
            for idx, value in enumerate(predicted_values)
        ]
        return jsonify({"Dart Predictions": predictions_list})
    except Exception as e:
        return handle_prediction_errors(e, "/predict_dart")


@prediction_bp.route("/predict_status", methods=["GET"])
@require_auth
def predict_status():
    try:
        status_predictor = current_app.config["STATUS_PREDICTOR"]
        prediction = status_predictor.predict()
        if prediction is None:
            return jsonify({"error": "Prediction failed or no data available"}), 404
        return jsonify({"Predicted Status": prediction})
    except Exception as e:
        return handle_prediction_errors(e, "/predict_status")
