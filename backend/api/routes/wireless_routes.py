"""
Wireless Protocol API Routes

API endpoints for receiving data from wireless protocols (LoRaWAN, MQTT via HTTP).
"""

from flask import Blueprint, request, jsonify
import logging
from typing import Dict, Any

from backend.protocols.lorawan_gateway import LoRaWANGateway
from backend.protocols.protocol_adapter import ProtocolAdapter
from backend.data_pipeline.kafka_producer import create_producer
from backend.core.enhanced_rate_limiter import gateway_rate_limit
from kafka import KafkaProducer
import os

logger = logging.getLogger(__name__)

wireless_bp = Blueprint("wireless", __name__, url_prefix="/api/wireless")

# Global LoRaWAN gateway instance
lorawan_gateway: LoRaWANGateway = None
kafka_producer: KafkaProducer = None


def init_wireless_routes(app):
    """Initialize wireless protocol routes."""
    global lorawan_gateway, kafka_producer
    
    # Initialize LoRaWAN gateway
    gateway_type = os.getenv("LORAWAN_GATEWAY_TYPE", "chirpstack")
    lorawan_gateway = LoRaWANGateway(gateway_type=gateway_type)
    
    # Initialize Kafka producer
    kafka_broker = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
    kafka_topic = os.getenv("KAFKA_RAW_TOPIC", "sensors-raw")
    
    kafka_producer = create_producer(kafka_broker)
    if kafka_producer:
        logger.info("✅ Kafka producer initialized for wireless routes")
    else:
        logger.error("❌ Failed to initialize Kafka producer")


def _forward_to_kafka(data: Dict[str, Any], topic: str = None):
    """
    Forward data to Kafka topic.

    Args:
        data: Sensor data dictionary
        topic: Kafka topic (defaults to sensors-raw)
    """
    if not kafka_producer:
        logger.warning("Kafka producer not initialized, cannot forward data")
        return False

    try:
        topic = topic or os.getenv("KAFKA_RAW_TOPIC", "sensors-raw")
        kafka_producer.send(topic, value=data)
        logger.debug(f"Forwarded data to Kafka topic: {topic}")
        return True
    except Exception as e:
        logger.error(f"Error forwarding to Kafka: {e}", exc_info=True)
        return False


@wireless_bp.route("/lorawan/webhook", methods=["POST"])
@gateway_rate_limit
def lorawan_webhook():
    """
    Webhook endpoint for LoRaWAN Network Server (ChirpStack, TTN).

    Receives uplink messages from LoRaWAN devices via webhook.
    """
    try:
        webhook_data = request.get_json()

        if not webhook_data:
            return jsonify({"error": "No data provided"}), 400

        if not lorawan_gateway:
            return jsonify({"error": "LoRaWAN gateway not initialized"}), 500

        # Process webhook
        sensor_data = lorawan_gateway.process_webhook(webhook_data)

        if not sensor_data:
            return jsonify({"error": "Failed to process webhook data"}), 400

        # Adapt to standard format
        standardized_data = ProtocolAdapter.adapt_lorawan_data(
            sensor_data.get("_lorawan_device_id", "unknown"),
            sensor_data
        )

        # Forward to Kafka
        if _forward_to_kafka(standardized_data):
            return jsonify({
                "status": "success",
                "message": "LoRaWAN data received and forwarded",
                "device_id": standardized_data.get("_device_id"),
            }), 200
        else:
            return jsonify({"error": "Failed to forward to Kafka"}), 500

    except Exception as e:
        logger.error(f"Error processing LoRaWAN webhook: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@wireless_bp.route("/mqtt/publish", methods=["POST"])
@gateway_rate_limit
def mqtt_publish_endpoint():
    """
    HTTP endpoint for publishing MQTT-style messages.

    This endpoint allows devices that cannot directly publish to MQTT
    to send data via HTTP (useful for devices behind firewalls).
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract topic from request
        topic = data.get("topic") or request.args.get("topic") or "sensors/unknown/data"
        payload = data.get("payload") or data

        # Adapt to standard format
        standardized_data = ProtocolAdapter.adapt_mqtt_data(topic, payload)

        # Forward to Kafka
        if _forward_to_kafka(standardized_data):
            return jsonify({
                "status": "success",
                "message": "Data received and forwarded",
                "topic": topic,
            }), 200
        else:
            return jsonify({"error": "Failed to forward to Kafka"}), 500

    except Exception as e:
        logger.error(f"Error processing MQTT HTTP publish: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@wireless_bp.route("/status", methods=["GET"])
def get_wireless_status():
    """Get status of wireless protocol integrations."""
    status = {
        "lorawan": {
            "enabled": lorawan_gateway is not None,
            "status": lorawan_gateway.get_status() if lorawan_gateway else None,
        },
        "kafka": {
            "producer_initialized": kafka_producer is not None,
        },
    }
    return jsonify(status), 200

