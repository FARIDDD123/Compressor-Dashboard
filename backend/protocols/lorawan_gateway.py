"""
LoRaWAN Gateway Interface

Provides interface for LoRaWAN gateway integration. Since LoRaWAN requires
specialized hardware (LoRaWAN gateway), this module provides:
1. Interface for connecting to LoRaWAN Network Server (e.g., ChirpStack, TTN)
2. Data format conversion from LoRaWAN to standard sensor format
3. Support for different LoRaWAN network server APIs
"""

import os
import json
import logging
import requests
from typing import Callable, Optional, Dict, Any, List
from datetime import datetime
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class LoRaWANGatewayBase(ABC):
    """Base class for LoRaWAN gateway implementations."""

    @abstractmethod
    def connect(self) -> bool:
        """Connect to LoRaWAN Network Server."""
        pass

    @abstractmethod
    def receive_message(self, device_id: str, data: bytes) -> Dict[str, Any]:
        """
        Process received LoRaWAN message.
        
        Args:
            device_id: LoRaWAN device EUI
            data: Raw message payload (bytes)
            
        Returns:
            Parsed sensor data dictionary
        """
        pass


class ChirpStackGateway(LoRaWANGatewayBase):
    """
    ChirpStack LoRaWAN Network Server integration.
    
    Connects to ChirpStack API to receive uplink messages from LoRaWAN devices.
    """

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        application_id: Optional[str] = None,
    ):
        """
        Initialize ChirpStack gateway.

        Args:
            api_url: ChirpStack API URL
            api_key: API authentication key
            application_id: Application ID to monitor
        """
        self.api_url = api_url or os.getenv("LORAWAN_API_URL", "http://localhost:8080")
        self.api_key = api_key or os.getenv("LORAWAN_API_KEY", None)
        self.application_id = application_id or os.getenv("LORAWAN_APPLICATION_ID", None)
        
        self.connected = False
        self.message_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None

    def connect(self) -> bool:
        """Connect to ChirpStack API."""
        try:
            # Test connection with API health check
            headers = {"Grpc-Metadata-Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
            response = requests.get(f"{self.api_url}/api/internal/health", headers=headers, timeout=5)
            
            if response.status_code == 200:
                self.connected = True
                logger.info(f"✅ Connected to ChirpStack API at {self.api_url}")
                return True
            else:
                logger.error(f"Failed to connect to ChirpStack API: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error connecting to ChirpStack API: {e}")
            return False

    def receive_message(self, device_id: str, data: bytes) -> Dict[str, Any]:
        """
        Process LoRaWAN uplink message from ChirpStack webhook.
        
        This method is typically called from a webhook endpoint that receives
        uplink messages from ChirpStack.
        """
        try:
            # Parse LoRaWAN payload (format depends on your device)
            # Common formats: JSON, CBOR, custom binary
            
            # Try JSON first
            try:
                payload_dict = json.loads(data.decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError):
                # If not JSON, treat as binary and convert to hex
                payload_dict = {"raw": data.hex(), "format": "binary"}

            # Add LoRaWAN metadata
            sensor_data = {
                "_lorawan_device_id": device_id,
                "_lorawan_received_at": datetime.utcnow().isoformat(),
                "_lorawan_gateway": "chirpstack",
                **payload_dict,
            }

            return sensor_data

        except Exception as e:
            logger.error(f"Error processing LoRaWAN message: {e}", exc_info=True)
            return {}

    def set_message_callback(self, callback: Callable[[str, Dict[str, Any]], None]):
        """Set callback for received messages."""
        self.message_callback = callback

    def process_webhook(self, webhook_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Process webhook payload from ChirpStack.
        
        ChirpStack can send webhooks for uplink events. This method processes
        the webhook payload and extracts sensor data.
        
        Args:
            webhook_data: Webhook payload from ChirpStack
            
        Returns:
            Parsed sensor data dictionary
        """
        try:
            # Extract device info and payload
            device_info = webhook_data.get("deviceInfo", {})
            device_id = device_info.get("devEui", "")
            rx_info = webhook_data.get("rxInfo", [{}])[0]
            data_obj = webhook_data.get("data", {})
            
            # Decode base64 payload if present
            import base64
            if "data" in data_obj:
                payload_bytes = base64.b64decode(data_obj["data"])
            else:
                payload_bytes = b""

            # Process message
            sensor_data = self.receive_message(device_id, payload_bytes)
            
            # Add additional metadata
            sensor_data["_lorawan_rssi"] = rx_info.get("rssi", None)
            sensor_data["_lorawan_snr"] = rx_info.get("snr", None)
            sensor_data["_lorawan_frequency"] = rx_info.get("frequency", None)

            # Call callback if set
            if self.message_callback:
                self.message_callback(device_id, sensor_data)

            return sensor_data

        except Exception as e:
            logger.error(f"Error processing ChirpStack webhook: {e}", exc_info=True)
            return None


class TTNGateway(LoRaWANGatewayBase):
    """
    The Things Network (TTN) integration.
    
    Connects to TTN API to receive uplink messages from LoRaWAN devices.
    """

    def __init__(
        self,
        app_id: Optional[str] = None,
        app_key: Optional[str] = None,
    ):
        """
        Initialize TTN gateway.

        Args:
            app_id: TTN Application ID
            app_key: TTN Application Access Key
        """
        self.app_id = app_id or os.getenv("TTN_APP_ID", None)
        self.app_key = app_key or os.getenv("TTN_APP_KEY", None)
        
        self.connected = False
        self.message_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None

    def connect(self) -> bool:
        """Connect to TTN API."""
        # TTN typically uses webhooks, so connection test is not always applicable
        self.connected = True
        logger.info("✅ TTN gateway initialized (webhook-based)")
        return True

    def receive_message(self, device_id: str, data: bytes) -> Dict[str, Any]:
        """Process TTN uplink message."""
        try:
            # Parse payload
            try:
                payload_dict = json.loads(data.decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError):
                payload_dict = {"raw": data.hex(), "format": "binary"}

            sensor_data = {
                "_lorawan_device_id": device_id,
                "_lorawan_received_at": datetime.utcnow().isoformat(),
                "_lorawan_gateway": "ttn",
                **payload_dict,
            }

            return sensor_data

        except Exception as e:
            logger.error(f"Error processing TTN message: {e}", exc_info=True)
            return {}

    def process_webhook(self, webhook_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process webhook payload from TTN."""
        try:
            # TTN webhook format
            device_id = webhook_data.get("dev_id", "")
            payload_fields = webhook_data.get("payload_fields", {})
            metadata = webhook_data.get("metadata", {})
            
            sensor_data = {
                "_lorawan_device_id": device_id,
                "_lorawan_received_at": metadata.get("time", datetime.utcnow().isoformat()),
                "_lorawan_gateway": "ttn",
                "_lorawan_rssi": metadata.get("gateways", [{}])[0].get("rssi", None) if metadata.get("gateways") else None,
                **payload_fields,
            }

            if self.message_callback:
                self.message_callback(device_id, sensor_data)

            return sensor_data

        except Exception as e:
            logger.error(f"Error processing TTN webhook: {e}", exc_info=True)
            return None


class LoRaWANGateway:
    """
    Unified LoRaWAN Gateway interface.
    
    Provides a common interface for different LoRaWAN Network Server implementations.
    """

    def __init__(
        self,
        gateway_type: str = "chirpstack",
        **kwargs,
    ):
        """
        Initialize LoRaWAN Gateway.

        Args:
            gateway_type: Type of gateway ("chirpstack" or "ttn")
            **kwargs: Additional arguments passed to gateway implementation
        """
        self.gateway_type = gateway_type.lower()
        
        if self.gateway_type == "chirpstack":
            self.gateway = ChirpStackGateway(**kwargs)
        elif self.gateway_type == "ttn":
            self.gateway = TTNGateway(**kwargs)
        else:
            raise ValueError(f"Unsupported gateway type: {gateway_type}")

        self.message_callback: Optional[Callable[[str, Dict[str, Any]], None]] = None

    def connect(self) -> bool:
        """Connect to LoRaWAN Network Server."""
        return self.gateway.connect()

    def set_message_callback(self, callback: Callable[[str, Dict[str, Any]], None]):
        """Set callback for received messages."""
        self.message_callback = callback
        self.gateway.set_message_callback(callback)

    def process_webhook(self, webhook_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process webhook payload from LoRaWAN Network Server."""
        if hasattr(self.gateway, "process_webhook"):
            return self.gateway.process_webhook(webhook_data)
        else:
            logger.warning(f"Webhook processing not supported for {self.gateway_type}")
            return None

    def get_status(self) -> Dict[str, Any]:
        """Get gateway status."""
        return {
            "gateway_type": self.gateway_type,
            "connected": self.gateway.connected if hasattr(self.gateway, "connected") else False,
        }

