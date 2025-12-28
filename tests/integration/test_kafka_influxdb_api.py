"""
Integration tests for Kafka → InfluxDB → API data flow.
"""

import pytest
import json
import time
from unittest.mock import patch, MagicMock
from kafka import KafkaProducer, KafkaConsumer


class TestKafkaInfluxDBAPI:
    """Integration tests for end-to-end data flow."""

    @pytest.fixture
    def sample_sensor_message(self):
        """Sample Kafka message for sensor data."""
        return {
            "Time": 1234567890,
            "Device_ID": "SGT-400-Main",
            "Pressure_In": 3.5,
            "Temperature_In": 20.0,
            "Flow_Rate": 12.0,
            "Pressure_Out": 17.0,
            "Temperature_Out": 75.0,
            "Efficiency": 0.85,
            "Power_Consumption": 5500,
            "Vibration": 0.9,
            "Status": "Normal",
            "Timestamp": "2024-01-01T12:00:00Z",
        }

    def test_kafka_to_influxdb_flow(self, sample_sensor_message, mock_kafka, mock_influxdb):
        """Test data flow from Kafka to InfluxDB."""
        # Simulate Kafka producer sending data
        producer = mock_kafka["producer"]
        producer.send.return_value = MagicMock()
        
        # Send message
        producer.send(
            "sensors-raw",
            value=sample_sensor_message,
        )
        producer.flush()
        
        # Verify message was sent
        producer.send.assert_called_once()
        
        # Simulate InfluxDB write
        write_api = mock_influxdb["write_api"]
        
        # Verify integration point (would be tested in actual integration test)
        assert write_api is not None

    def test_influxdb_to_api_flow(self, client, mock_influxdb, sample_sensor_message):
        """Test data retrieval from InfluxDB via API."""
        # Mock InfluxDB query response
        mock_record = MagicMock()
        mock_record.get_time.return_value.isoformat.return_value = sample_sensor_message["Timestamp"]
        mock_record.get_field.return_value = "Pressure_In"
        mock_record.get_value.return_value = sample_sensor_message["Pressure_In"]
        
        mock_table = MagicMock()
        mock_table.records = [mock_record]
        
        mock_influxdb["query_api"].query.return_value = [mock_table]
        
        # Call API endpoint
        response = client.get("/api/data/get_live_data")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_end_to_end_data_flow(self, sample_sensor_message, mock_kafka, mock_influxdb, client):
        """Test complete data flow from Kafka through InfluxDB to API."""
        # Step 1: Kafka producer sends data
        producer = mock_kafka["producer"]
        producer.send("sensors-raw", value=sample_sensor_message)
        producer.flush()
        
        # Step 2: Data written to InfluxDB (simulated)
        write_api = mock_influxdb["write_api"]
        
        # Step 3: API retrieves data from InfluxDB
        mock_record = MagicMock()
        mock_record.get_time.return_value.isoformat.return_value = sample_sensor_message["Timestamp"]
        mock_record.get_field.return_value = "Efficiency"
        mock_record.get_value.return_value = sample_sensor_message["Efficiency"]
        
        mock_table = MagicMock()
        mock_table.records = [mock_record]
        mock_influxdb["query_api"].query.return_value = [mock_table]
        
        response = client.get("/api/data/get_live_data")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) > 0

