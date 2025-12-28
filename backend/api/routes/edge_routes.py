"""
Edge Computing API Routes

API endpoints for receiving data from edge devices and syncing with cloud.
"""

from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
from typing import Dict, Any

from backend.core.database import CompressorDatabase
from backend.core.config import config
from backend.core.enhanced_rate_limiter import gateway_rate_limit

logger = logging.getLogger(__name__)

edge_bp = Blueprint("edge", __name__, url_prefix="/api/edge")


@edge_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint for edge devices."""
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()}), 200


@edge_bp.route("/sensor-data", methods=["POST"])
@gateway_rate_limit
def receive_sensor_data():
    """
    Receive sensor data from edge devices.

    This endpoint accepts data synced from edge devices and stores it in the cloud database.
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ["timestamp"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing required fields: {required_fields}"}), 400

        # Store in database (you can integrate with your existing storage mechanism)
        # For now, we'll log it and return success
        logger.info(f"Received sensor data from edge: {data.get('timestamp')}")

        # TODO: Integrate with existing data storage (InfluxDB/Kafka)
        # Example: Send to Kafka topic or store in InfluxDB

        return jsonify({
            "status": "success",
            "message": "Sensor data received",
            "timestamp": data.get("timestamp")
        }), 200

    except Exception as e:
        logger.error(f"Error receiving edge sensor data: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@edge_bp.route("/alerts", methods=["POST"])
@gateway_rate_limit
def receive_alerts():
    """
    Receive alerts from edge devices.

    This endpoint accepts alerts generated at the edge and stores them in the cloud.
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ["timestamp", "alert_type", "severity", "message"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": f"Missing required fields: {required_fields}"}), 400

        logger.warning(f"Received alert from edge: {data.get('alert_type')} - {data.get('message')}")

        # TODO: Integrate with existing alert system
        # Example: Send to Kafka alerts topic or store in database

        return jsonify({
            "status": "success",
            "message": "Alert received",
            "alert_id": data.get("id")
        }), 200

    except Exception as e:
        logger.error(f"Error receiving edge alert: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@edge_bp.route("/status", methods=["GET"])
def get_edge_status():
    """
    Get edge device status information.

    This can be used by edge devices to check their connection status or
    by the cloud to query edge device status.
    """
    try:
        # TODO: Query edge device status from database or cache
        # For now, return a basic response

        return jsonify({
            "status": "connected",
            "timestamp": datetime.utcnow().isoformat(),
            "cloud_api_url": request.url_root,
        }), 200

    except Exception as e:
        logger.error(f"Error getting edge status: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

