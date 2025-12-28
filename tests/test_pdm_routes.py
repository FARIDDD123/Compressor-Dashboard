"""
Unit tests for predictive maintenance routes.
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from datetime import datetime
import pymysql


class TestPdMRoutes:
    """Test suite for PdM endpoints."""

    def test_get_latest_rul_success(self, client, mock_db):
        """Test successfully getting latest RUL prediction."""
        mock_cursor = mock_db
        mock_cursor.fetchone.return_value = {
            "rul_value": 45.5,
            "prediction_time": datetime(2024, 1, 1, 12, 0, 0),
        }
        
        with patch("pymysql.connect") as mock_connect:
            mock_conn = MagicMock()
            mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
            mock_connect.return_value = mock_conn
            
            response = client.get("/api/predict/rul")
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "rul_value" in data
            assert "recommendations" in data
            assert data["rul_value"] == 45.5

    def test_get_latest_rul_not_found(self, client, mock_db):
        """Test getting RUL when no prediction exists."""
        mock_cursor = mock_db
        mock_cursor.fetchone.return_value = None
        
        with patch("pymysql.connect") as mock_connect:
            mock_conn = MagicMock()
            mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
            mock_connect.return_value = mock_conn
            
            response = client.get("/api/predict/rul")
            
            assert response.status_code == 404

    def test_get_latest_rul_db_error(self, client):
        """Test handling database errors."""
        with patch("pymysql.connect") as mock_connect:
            mock_connect.side_effect = pymysql.Error("Connection failed")
            
            response = client.get("/api/predict/rul")
            
            assert response.status_code == 500

