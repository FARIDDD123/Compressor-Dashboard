"""
Unit tests for RTO routes.
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from influxdb_client import InfluxDBClient


class TestRTORoutes:
    """Test suite for RTO endpoints."""

    def test_get_efficiency_history_success(self, client, auth_headers, mock_influxdb):
        """Test getting efficiency history."""
        headers = auth_headers()
        
        mock_record = MagicMock()
        mock_record.get_time.return_value.isoformat.return_value = "2024-01-01T00:00:00"
        mock_record.get_value.return_value = 0.85
        
        mock_table = MagicMock()
        mock_table.records = [mock_record]
        
        mock_influxdb["query_api"].query.return_value = [mock_table]
        
        response = client.get("/api/rto/efficiency_history", headers=headers)
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)

    def test_get_efficiency_history_unauthorized(self, client):
        """Test getting efficiency history without authentication."""
        response = client.get("/api/rto/efficiency_history")
        
        assert response.status_code == 401

    def test_get_efficiency_history_influxdb_error(self, client, auth_headers):
        """Test handling InfluxDB errors."""
        headers = auth_headers()
        
        with patch("influxdb_client.InfluxDBClient") as mock_client:
            mock_instance = MagicMock()
            mock_instance.__enter__.return_value = mock_instance
            mock_instance.query_api.side_effect = Exception("Connection error")
            mock_client.return_value = mock_instance
            
            response = client.get("/api/rto/efficiency_history", headers=headers)
            
            assert response.status_code == 500

