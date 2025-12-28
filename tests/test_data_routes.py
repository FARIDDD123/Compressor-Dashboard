"""
Unit tests for data routes.
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from influxdb_client import InfluxDBClient
from backend.core.database import CompressorDatabase


class TestDataRoutes:
    """Test suite for data endpoints."""

    def test_get_live_data_success(self, client, mock_influxdb):
        """Test successfully getting live data from InfluxDB."""
        # Mock InfluxDB query response
        mock_record = MagicMock()
        mock_record.get_time.return_value.isoformat.return_value = "2024-01-01T00:00:00"
        mock_record.get_field.return_value = "Pressure_In"
        mock_record.get_value.return_value = 3.5
        
        mock_table = MagicMock()
        mock_table.records = [mock_record]
        
        mock_influxdb["query_api"].query.return_value = [mock_table]
        
        response = client.get("/api/data/get_live_data")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_live_data_influxdb_error(self, client):
        """Test handling InfluxDB errors."""
        with patch("influxdb_client.InfluxDBClient") as mock_client:
            mock_client.side_effect = Exception("Connection error")
            
            response = client.get("/api/data/get_live_data")
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert "error" in data

    def test_get_all_data_success(self, client, mock_db):
        """Test successfully getting all data from database."""
        mock_data = [
            {"Time": 1, "Pressure_In": 3.5, "Temperature_In": 20.0},
            {"Time": 2, "Pressure_In": 3.6, "Temperature_In": 21.0},
        ]
        
        with patch.object(CompressorDatabase, "connect") as mock_connect, \
             patch.object(CompressorDatabase, "load_data") as mock_load:
            mock_connect.return_value = True
            mock_load.return_value = True
            
            db = CompressorDatabase(
                host="localhost",
                port=3307,
                user="test",
                password="test",
                database="test",
            )
            db._data = mock_data
            
            with patch("backend.api.routes.data_routes.CompressorDatabase") as mock_db_class:
                mock_db_class.return_value = db
                
                response = client.get("/api/data/get_all_data")
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert len(data) == 2

    def test_get_all_data_connection_error(self, client):
        """Test handling database connection errors."""
        with patch.object(CompressorDatabase, "connect") as mock_connect:
            mock_connect.return_value = False
            
            with patch("backend.api.routes.data_routes.CompressorDatabase") as mock_db_class:
                mock_db_class.return_value.connect.return_value = False
                
                response = client.get("/api/data/get_all_data")
                
                assert response.status_code == 503

    def test_get_latest_validated_data_success(self, client, mock_influxdb):
        """Test getting latest validated DVR data."""
        mock_record = MagicMock()
        mock_record.values = {"_time": "2024-01-01T00:00:00", "Pressure_In": 3.5}
        
        mock_table = MagicMock()
        mock_table.records = [mock_record]
        
        mock_influxdb["query_api"].query.return_value = [mock_table]
        
        response = client.get("/api/data/dvr/latest?limit=10")
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_latest_validated_data_custom_limit(self, client, mock_influxdb):
        """Test getting validated data with custom limit."""
        mock_table = MagicMock()
        mock_table.records = []
        mock_influxdb["query_api"].query.return_value = [mock_table]
        
        response = client.get("/api/data/dvr/latest?limit=50")
        
        assert response.status_code == 200

    def test_get_latest_validated_data_invalid_limit(self, client, mock_influxdb):
        """Test handling invalid limit parameter."""
        mock_table = MagicMock()
        mock_table.records = []
        mock_influxdb["query_api"].query.return_value = [mock_table]
        
        response = client.get("/api/data/dvr/latest?limit=999")
        
        assert response.status_code == 200  # Should default to 10

    def test_get_latest_validated_data_influxdb_error(self, client):
        """Test handling InfluxDB API errors."""
        from influxdb_client.rest import ApiException
        
        with patch("influxdb_client.InfluxDBClient") as mock_client:
            mock_instance = MagicMock()
            mock_instance.__enter__.return_value = mock_instance
            mock_instance.query_api.side_effect = ApiException(status=503)
            mock_client.return_value = mock_instance
            
            response = client.get("/api/data/dvr/latest")
            
            assert response.status_code == 503

