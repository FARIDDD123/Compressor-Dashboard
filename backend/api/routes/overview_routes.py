# backend/api/routes/overview_routes.py

from flask import Blueprint, jsonify
import logging

# Create a Blueprint
overview_bp = Blueprint("overview_routes", __name__)


@overview_bp.route("/overview", methods=["GET"])
def get_system_overview():
    """
    Provides a high-level overview of the system's status.
    This will be connected to real data sources later.
    """
    try:
        # NOTE: This is mock data for now.
        # Later, we will replace this with real calls to prediction scripts and databases.
        overview_data = {
            "status": "Normal",
            "rul": 118,
            "efficiency": 87.5,
            "alerts_24h": 5,
        }
        return jsonify(overview_data)
    except Exception as e:
        logging.error(f"Error in /overview endpoint: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
