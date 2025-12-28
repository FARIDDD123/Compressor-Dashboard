# backend/api/routes/pdm_routes.py

import logging
from flask import Blueprint, jsonify, current_app
from backend.core.auth import require_auth
import pymysql

pdm_bp = Blueprint("pdm_routes", __name__)


def generate_recommendations(rul_value):
    """Generates dynamic maintenance recommendations based on the RUL value."""
    recommendations = []

    # --- THIS IS THE FIX: Ensure rul_value is a float for comparison ---
    try:
        rul = float(rul_value)
    except (ValueError, TypeError):
        logging.warning(
            f"Could not convert RUL value '{rul_value}' to float. No recommendations generated."
        )
        return []

    logging.info(f"Generating recommendations for RUL value: {rul}")

    if rul < 10:
        recommendations.append(
            {
                "id": 1,
                "component": "Main Bearing",
                "action": "Critical: Replace immediately to prevent imminent failure.",
                "urgency": "High",
            }
        )
    elif rul < 30:
        recommendations.append(
            {
                "id": 2,
                "component": "Main Bearing",
                "action": "Inspect for wear and schedule replacement within 14 days.",
                "urgency": "High",
            }
        )
        recommendations.append(
            {
                "id": 3,
                "component": "Inlet Filter",
                "action": "Replace filter at the next opportunity.",
                "urgency": "Medium",
            }
        )
    elif rul < 90:
        recommendations.append(
            {
                "id": 4,
                "component": "Inlet Filter",
                "action": "Check for clogging and plan for replacement.",
                "urgency": "Medium",
            }
        )
        recommendations.append(
            {
                "id": 5,
                "component": "Lubrication System",
                "action": "Check oil levels and quality.",
                "urgency": "Low",
            }
        )
    else:
        recommendations.append(
            {
                "id": 6,
                "component": "System Health",
                "action": "No immediate maintenance required. Continue routine checks.",
                "urgency": "Low",
            }
        )

    return recommendations


@pdm_bp.route("/rul", methods=["GET"])
@require_auth
def get_latest_rul():
    """Fetches the latest RUL prediction and generates recommendations."""
    db_config = current_app.config["DB_CONFIG"]
    conn = None
    try:
        conn = pymysql.connect(**db_config, cursorclass=pymysql.cursors.DictCursor)
        with conn.cursor() as cursor:
            query = "SELECT rul_value, prediction_time FROM rul_predictions ORDER BY prediction_time DESC LIMIT 1"
            cursor.execute(query)
            prediction = cursor.fetchone()

        if not prediction:
            return jsonify({"error": "No RUL prediction found"}), 404

        recommendations = generate_recommendations(prediction["rul_value"])

        response_data = {
            "rul_value": prediction["rul_value"],
            "prediction_time": prediction["prediction_time"].isoformat(),
            "recommendations": recommendations,
        }

        return jsonify(response_data)

    except Exception as e:
        logging.error(f"Error in /rul endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    finally:
        if conn:
            conn.close()
