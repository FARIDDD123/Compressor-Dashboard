"""
MQTT Consumer for Wireless Sensor Data

Consumes sensor data from MQTT broker and publishes to Kafka for processing.
Integrates with Protocol Adapter for data standardization.
"""

import os
import logging
import json
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Import protocol modules
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.protocols.mqtt_client import MQTTClient
from backend.protocols.protocol_adapter import ProtocolAdapter
from backend.data_pipeline.kafka_producer import create_producer
from kafka import KafkaProducer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class MQTTConsumer:
    """
    MQTT Consumer that receives sensor data from MQTT broker
    and forwards it to Kafka for processing.
    """

    def __init__(
        self,
        mqtt_topics: list,
        kafka_topic: str = "sensors-raw",
        mqtt_broker: Optional[str] = None,
        mqtt_port: int = 1883,
        kafka_broker: Optional[str] = None,
    ):
        """
        Initialize MQTT Consumer.

        Args:
            mqtt_topics: List of MQTT topics to subscribe to
            kafka_topic: Kafka topic to publish to
            mqtt_broker: MQTT broker hostname
            mqtt_port: MQTT broker port
            kafka_broker: Kafka broker address
        """
        self.mqtt_topics = mqtt_topics
        self.kafka_topic = kafka_topic or os.getenv("KAFKA_RAW_TOPIC", "sensors-raw")
        self.kafka_broker = kafka_broker or os.getenv("KAFKA_BROKER_URL", "kafka:9092")
        
        # Initialize MQTT client
        self.mqtt_client = MQTTClient(
            broker_host=mqtt_broker or os.getenv("MQTT_BROKER_HOST", "localhost"),
            broker_port=mqtt_port or int(os.getenv("MQTT_BROKER_PORT", "1883")),
            username=os.getenv("MQTT_USERNAME", None),
            password=os.getenv("MQTT_PASSWORD", None),
            use_tls=os.getenv("MQTT_USE_TLS", "false").lower() == "true",
        )
        
        # Set message callback
        self.mqtt_client.set_message_callback(self._on_mqtt_message)
        
        # Initialize Kafka producer
        self.kafka_producer: Optional[KafkaProducer] = None

    def _on_mqtt_message(self, topic: str, data: dict):
        """
        Callback for MQTT messages.

        Args:
            topic: MQTT topic
            data: Message payload
        """
        try:
            # Adapt data to standard format
            standardized_data = ProtocolAdapter.adapt_mqtt_data(topic, data)
            
            # Publish to Kafka
            if self.kafka_producer:
                self.kafka_producer.send(
                    self.kafka_topic,
                    value=standardized_data
                )
                logger.debug(f"Forwarded MQTT message from {topic} to Kafka topic {self.kafka_topic}")
            else:
                logger.warning("Kafka producer not initialized, dropping message")

        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}", exc_info=True)

    def start(self):
        """Start the MQTT consumer."""
        try:
            # Connect to Kafka
            logger.info(f"Connecting to Kafka broker at {self.kafka_broker}...")
            self.kafka_producer = create_producer(self.kafka_broker)
            if not self.kafka_producer:
                logger.error("Failed to connect to Kafka. Exiting.")
                return False

            # Connect to MQTT broker
            logger.info(f"Connecting to MQTT broker...")
            if not self.mqtt_client.connect():
                logger.error("Failed to connect to MQTT broker. Exiting.")
                return False

            # Subscribe to topics
            for topic in self.mqtt_topics:
                self.mqtt_client.subscribe(topic, qos=1)
                logger.info(f"Subscribed to MQTT topic: {topic}")

            logger.info("✅ MQTT Consumer started successfully")
            return True

        except Exception as e:
            logger.error(f"Error starting MQTT consumer: {e}", exc_info=True)
            return False

    def stop(self):
        """Stop the MQTT consumer."""
        try:
            if self.mqtt_client:
                self.mqtt_client.disconnect()
            if self.kafka_producer:
                self.kafka_producer.close()
            logger.info("MQTT Consumer stopped")
        except Exception as e:
            logger.error(f"Error stopping MQTT consumer: {e}")

    def get_status(self) -> dict:
        """Get consumer status."""
        return {
            "mqtt_connected": self.mqtt_client.connected if self.mqtt_client else False,
            "kafka_producer": self.kafka_producer is not None,
            "subscribed_topics": self.mqtt_topics,
            "kafka_topic": self.kafka_topic,
        }


def main():
    """Main entry point."""
    # Get MQTT topics from environment (comma-separated)
    mqtt_topics_str = os.getenv("MQTT_TOPICS", "sensors/+/data,sensors/+/telemetry")
    mqtt_topics = [topic.strip() for topic in mqtt_topics_str.split(",")]

    consumer = MQTTConsumer(mqtt_topics=mqtt_topics)

    try:
        if consumer.start():
            # Keep running
            import time
            while True:
                time.sleep(1)
        else:
            logger.error("Failed to start MQTT consumer")
            return 1

    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1
    finally:
        consumer.stop()

    return 0


if __name__ == "__main__":
    exit(main())

