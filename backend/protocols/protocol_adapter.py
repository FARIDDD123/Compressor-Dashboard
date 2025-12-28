"""
Protocol Adapter

Converts data from different protocol formats (MQTT, LoRaWAN, OPC-UA, Modbus)
into a standardized sensor data format for the Digital Twin system.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class ProtocolAdapter:
    """
    Adapter for converting different protocol data formats to standard format.
    
    Standard format includes:
    - timestamp
    - sensor readings (Pressure_In, Temperature_In, etc.)
    - metadata (_protocol, _device_id, etc.)
    """

    # Standard sensor field mappings
    SENSOR_FIELD_MAPPINGS = {
        # Pressure
        "pressure_in": "Pressure_In",
        "pressure_inlet": "Pressure_In",
        "p_in": "Pressure_In",
        "pressure_out": "Pressure_Out",
        "pressure_outlet": "Pressure_Out",
        "p_out": "Pressure_Out",
        # Temperature
        "temperature_in": "Temperature_In",
        "temp_in": "Temperature_In",
        "temperature_inlet": "Temperature_In",
        "temperature_out": "Temperature_Out",
        "temp_out": "Temperature_Out",
        "temperature_outlet": "Temperature_Out",
        # Flow
        "flow_rate": "Flow_Rate",
        "flow": "Flow_Rate",
        "mass_flow": "Flow_Rate",
        # Vibration
        "vibration": "Vibration",
        "vib": "Vibration",
        "vibration_axial": "Vibration",
        # Efficiency
        "efficiency": "Efficiency",
        "eff": "Efficiency",
        # Power
        "power": "Power",
        "power_consumption": "Power",
        # RPM
        "rpm": "RPM",
        "speed": "RPM",
        "rotational_speed": "RPM",
        # Torque
        "torque": "Torque",
        # Ambient
        "ambient_temp": "Ambient_Temp",
        "ambient_temperature": "Ambient_Temp",
        "env_temp": "Ambient_Temp",
    }

    @staticmethod
    def normalize_field_name(field_name: str) -> str:
        """
        Normalize field name to standard format.

        Args:
            field_name: Original field name

        Returns:
            Standardized field name
        """
        # Convert to lowercase for comparison
        field_lower = field_name.lower().strip()
        
        # Check direct mapping
        if field_lower in ProtocolAdapter.SENSOR_FIELD_MAPPINGS:
            return ProtocolAdapter.SENSOR_FIELD_MAPPINGS[field_lower]
        
        # Check if already in standard format
        if field_name in ProtocolAdapter.SENSOR_FIELD_MAPPINGS.values():
            return field_name
        
        # Return original if no mapping found
        return field_name

    @staticmethod
    def extract_timestamp(data: Dict[str, Any]) -> str:
        """
        Extract timestamp from data in various formats.

        Args:
            data: Input data dictionary

        Returns:
            ISO format timestamp string
        """
        # Try various timestamp field names
        timestamp_fields = [
            "timestamp", "Timestamp", "time", "Time", "ts", "TS",
            "_timestamp", "_received_at", "created_at", "date",
        ]

        for field in timestamp_fields:
            if field in data:
                timestamp = data[field]
                # Convert to ISO format if needed
                if isinstance(timestamp, str):
                    return timestamp
                elif isinstance(timestamp, (int, float)):
                    # Unix timestamp
                    try:
                        dt = datetime.fromtimestamp(timestamp)
                        return dt.isoformat()
                    except (ValueError, OSError):
                        pass
        
        # Return current timestamp if not found
        return datetime.utcnow().isoformat()

    @staticmethod
    def adapt_mqtt_data(topic: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adapt MQTT message data to standard format.

        Args:
            topic: MQTT topic
            data: MQTT message payload

        Returns:
            Standardized sensor data dictionary
        """
        standardized = {
            "timestamp": ProtocolAdapter.extract_timestamp(data),
            "_protocol": "mqtt",
            "_mqtt_topic": topic,
        }

        # Extract device ID from topic if possible
        # Common patterns: "sensors/device_id/data", "device_id/sensors", etc.
        topic_parts = topic.split("/")
        if len(topic_parts) > 1:
            standardized["_device_id"] = topic_parts[1] if topic_parts[0] == "sensors" else topic_parts[0]

        # Normalize and copy sensor fields
        for key, value in data.items():
            # Skip metadata fields
            if key.startswith("_") or key.lower() in ["timestamp", "time", "ts"]:
                if key not in standardized:
                    standardized[key] = value
                continue

            # Normalize field name
            normalized_key = ProtocolAdapter.normalize_field_name(key)
            standardized[normalized_key] = value

        return standardized

    @staticmethod
    def adapt_lorawan_data(device_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adapt LoRaWAN message data to standard format.

        Args:
            device_id: LoRaWAN device EUI
            data: LoRaWAN message payload

        Returns:
            Standardized sensor data dictionary
        """
        standardized = {
            "timestamp": ProtocolAdapter.extract_timestamp(data),
            "_protocol": "lorawan",
            "_device_id": device_id,
        }

        # Copy LoRaWAN metadata
        for key in ["_lorawan_rssi", "_lorawan_snr", "_lorawan_frequency", "_lorawan_gateway"]:
            if key in data:
                standardized[key] = data[key]

        # Normalize and copy sensor fields
        for key, value in data.items():
            # Skip metadata fields
            if key.startswith("_") or key.lower() in ["timestamp", "time", "ts"]:
                if key not in standardized:
                    standardized[key] = value
                continue

            # Normalize field name
            normalized_key = ProtocolAdapter.normalize_field_name(key)
            standardized[normalized_key] = value

        return standardized

    @staticmethod
    def adapt_opcua_data(node_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Adapt OPC-UA node data to standard format.

        Args:
            node_data: OPC-UA node data dictionary

        Returns:
            Standardized sensor data dictionary
        """
        standardized = {
            "timestamp": ProtocolAdapter.extract_timestamp(node_data),
            "_protocol": "opcua",
        }

        # Extract device/system identifier if available
        if "node_id" in node_data:
            standardized["_node_id"] = node_data["node_id"]

        # Normalize and copy sensor fields
        for key, value in node_data.items():
            if key.startswith("_") or key.lower() in ["timestamp", "time", "ts", "node_id"]:
                if key not in standardized:
                    standardized[key] = value
                continue

            normalized_key = ProtocolAdapter.normalize_field_name(key)
            standardized[normalized_key] = value

        return standardized

    @staticmethod
    def adapt_generic_data(data: Dict[str, Any], protocol: str = "unknown") -> Dict[str, Any]:
        """
        Adapt generic data to standard format.

        Args:
            data: Input data dictionary
            protocol: Protocol identifier

        Returns:
            Standardized sensor data dictionary
        """
        standardized = {
            "timestamp": ProtocolAdapter.extract_timestamp(data),
            "_protocol": protocol,
        }

        # Normalize and copy all fields
        for key, value in data.items():
            if key.startswith("_") or key.lower() in ["timestamp", "time", "ts"]:
                if key not in standardized:
                    standardized[key] = value
                continue

            normalized_key = ProtocolAdapter.normalize_field_name(key)
            standardized[normalized_key] = value

        return standardized

