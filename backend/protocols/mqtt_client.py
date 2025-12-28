"""
MQTT Client for Wireless Sensor Integration

Provides MQTT client functionality for receiving data from wireless sensors
and IoT devices. Supports QoS levels, retained messages, and TLS/SSL.
"""

import os
import json
import logging
from typing import Callable, Optional, Dict, Any
from datetime import datetime
import threading
import time

try:
    import paho.mqtt.client as mqtt
    MQTT_AVAILABLE = True
except ImportError:
    MQTT_AVAILABLE = False
    logging.warning("paho-mqtt not installed. MQTT support will be disabled.")

logger = logging.getLogger(__name__)


class MQTTClient:
    """
    MQTT Client for receiving sensor data from wireless IoT devices.
    
    Supports:
    - QoS 0, 1, 2
    - TLS/SSL encryption
    - Authentication (username/password)
    - Multiple topic subscriptions
    - Message callbacks
    """

    def __init__(
        self,
        broker_host: Optional[str] = None,
        broker_port: int = 1883,
        username: Optional[str] = None,
        password: Optional[str] = None,
        client_id: Optional[str] = None,
        use_tls: bool = False,
        ca_certs: Optional[str] = None,
        keepalive: int = 60,
    ):
        """
        Initialize MQTT Client.

        Args:
            broker_host: MQTT broker hostname/IP
            broker_port: MQTT broker port (default: 1883 for plain, 8883 for TLS)
            username: MQTT username (optional)
            password: MQTT password (optional)
            client_id: Client ID (auto-generated if None)
            use_tls: Enable TLS/SSL encryption
            ca_certs: Path to CA certificate file
            keepalive: Keepalive interval in seconds
        """
        if not MQTT_AVAILABLE:
            raise ImportError(
                "paho-mqtt is required for MQTT support. Install with: pip install paho-mqtt"
            )

        self.broker_host = broker_host or os.getenv("MQTT_BROKER_HOST", "localhost")
        self.broker_port = broker_port or int(os.getenv("MQTT_BROKER_PORT", "1883"))
        self.username = username or os.getenv("MQTT_USERNAME", None)
        self.password = password or os.getenv("MQTT_PASSWORD", None)
        self.client_id = client_id or f"digital-twin-mqtt-{os.getpid()}"
        self.use_tls = use_tls or os.getenv("MQTT_USE_TLS", "false").lower() == "true"
        self.ca_certs = ca_certs or os.getenv("MQTT_CA_CERTS", None)
        self.keepalive = keepalive

        self.client: Optional[mqtt.Client] = None
        self.connected = False
        self.message_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None
        self.subscribed_topics: set = set()

    def _on_connect(self, client, userdata, flags, rc):
        """Callback for when the client receives a CONNACK response from the server."""
        if rc == 0:
            self.connected = True
            logger.info(f"✅ Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
            
            # Re-subscribe to all topics
            for topic in self.subscribed_topics:
                client.subscribe(topic)
                logger.info(f"Re-subscribed to topic: {topic}")
        else:
            self.connected = False
            error_messages = {
                1: "Connection refused - incorrect protocol version",
                2: "Connection refused - invalid client identifier",
                3: "Connection refused - server unavailable",
                4: "Connection refused - bad username or password",
                5: "Connection refused - not authorized",
            }
            error_msg = error_messages.get(rc, f"Connection refused - error code {rc}")
            logger.error(f"❌ MQTT connection failed: {error_msg}")

    def _on_disconnect(self, client, userdata, rc):
        """Callback for when the client disconnects from the server."""
        self.connected = False
        if rc != 0:
            logger.warning(f"Unexpected MQTT disconnection (rc={rc}). Reconnecting...")
        else:
            logger.info("Disconnected from MQTT broker")

    def _on_message(self, client, userdata, msg):
        """
        Callback for when a PUBLISH message is received from the server.
        
        Args:
            client: The client instance
            userdata: User data
            msg: The message object with topic, payload, qos, retain
        """
        try:
            topic = msg.topic
            payload = msg.payload.decode("utf-8")
            
            # Parse JSON payload
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                logger.warning(f"Received non-JSON message on topic {topic}: {payload}")
                data = {"raw": payload}

            # Add metadata
            data["_mqtt_topic"] = topic
            data["_mqtt_qos"] = msg.qos
            data["_mqtt_retain"] = msg.retain
            data["_received_at"] = datetime.utcnow().isoformat()

            # Call user callback if set
            if self.message_callback:
                try:
                    self.message_callback(topic, data)
                except Exception as e:
                    logger.error(f"Error in message callback: {e}", exc_info=True)
            else:
                logger.debug(f"Received message on {topic}: {data}")

        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}", exc_info=True)

    def set_message_callback(self, callback: Callable[[str, Dict[str, Any]], None]):
        """
        Set callback function for received messages.

        Args:
            callback: Function(topic: str, data: dict) -> None
        """
        self.message_callback = callback

    def connect(self) -> bool:
        """
        Connect to MQTT broker.

        Returns:
            True if connection successful, False otherwise
        """
        try:
            self.client = mqtt.Client(client_id=self.client_id)
            
            # Set callbacks
            self.client.on_connect = self._on_connect
            self.client.on_disconnect = self._on_disconnect
            self.client.on_message = self._on_message

            # Set authentication if provided
            if self.username and self.password:
                self.client.username_pw_set(self.username, self.password)

            # Configure TLS if enabled
            if self.use_tls:
                if self.ca_certs:
                    self.client.tls_set(ca_certs=self.ca_certs)
                else:
                    self.client.tls_set()  # Use default CA certificates
                logger.info("TLS/SSL enabled for MQTT connection")

            # Connect to broker
            self.client.connect(self.broker_host, self.broker_port, self.keepalive)
            self.client.loop_start()

            # Wait for connection (with timeout)
            timeout = 5
            elapsed = 0
            while not self.connected and elapsed < timeout:
                time.sleep(0.1)
                elapsed += 0.1

            if not self.connected:
                logger.error("MQTT connection timeout")
                return False

            return True

        except Exception as e:
            logger.error(f"Error connecting to MQTT broker: {e}", exc_info=True)
            self.connected = False
            return False

    def disconnect(self):
        """Disconnect from MQTT broker."""
        if self.client:
            try:
                self.client.loop_stop()
                self.client.disconnect()
                self.connected = False
                logger.info("Disconnected from MQTT broker")
            except Exception as e:
                logger.error(f"Error disconnecting from MQTT broker: {e}")

    def subscribe(self, topic: str, qos: int = 0):
        """
        Subscribe to a topic.

        Args:
            topic: MQTT topic to subscribe to (supports wildcards: +, #)
            qos: Quality of Service level (0, 1, or 2)
        """
        if not self.client or not self.connected:
            logger.error("Not connected to MQTT broker. Cannot subscribe.")
            return False

        try:
            result, mid = self.client.subscribe(topic, qos)
            if result == mqtt.MQTT_ERR_SUCCESS:
                self.subscribed_topics.add(topic)
                logger.info(f"✅ Subscribed to topic: {topic} (QoS={qos})")
                return True
            else:
                logger.error(f"Failed to subscribe to topic {topic}")
                return False
        except Exception as e:
            logger.error(f"Error subscribing to topic {topic}: {e}")
            return False

    def unsubscribe(self, topic: str):
        """Unsubscribe from a topic."""
        if not self.client or not self.connected:
            logger.warning("Not connected to MQTT broker. Cannot unsubscribe.")
            return

        try:
            self.client.unsubscribe(topic)
            self.subscribed_topics.discard(topic)
            logger.info(f"Unsubscribed from topic: {topic}")
        except Exception as e:
            logger.error(f"Error unsubscribing from topic {topic}: {e}")

    def publish(self, topic: str, payload: Dict[str, Any] | str, qos: int = 0, retain: bool = False):
        """
        Publish a message to a topic.

        Args:
            topic: MQTT topic to publish to
            payload: Message payload (dict will be JSON-encoded, or string)
            qos: Quality of Service level
            retain: Whether to retain the message
        """
        if not self.client or not self.connected:
            logger.error("Not connected to MQTT broker. Cannot publish.")
            return False

        try:
            if isinstance(payload, dict):
                payload_str = json.dumps(payload)
            else:
                payload_str = str(payload)

            result = self.client.publish(topic, payload_str, qos=qos, retain=retain)
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.debug(f"Published message to topic: {topic}")
                return True
            else:
                logger.error(f"Failed to publish to topic {topic}")
                return False
        except Exception as e:
            logger.error(f"Error publishing to topic {topic}: {e}")
            return False

    def get_status(self) -> Dict[str, Any]:
        """Get client status."""
        return {
            "connected": self.connected,
            "broker": f"{self.broker_host}:{self.broker_port}",
            "client_id": self.client_id,
            "tls_enabled": self.use_tls,
            "subscribed_topics": list(self.subscribed_topics),
        }

