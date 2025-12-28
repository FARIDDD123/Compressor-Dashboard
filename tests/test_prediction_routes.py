"""
Unit tests for prediction routes.
"""

import pytest
import json
from unittest.mock import patch, MagicMock


class TestPredictionRoutes:
    """Test suite for prediction endpoints."""

    def test_predict_vibration_success(self, client, app):
        """Test successful vibration prediction."""
        mock_predictor = MagicMock()
        mock_predictor.predict_all.return_value = [
            {"time": "2024-01-01", "prediction": 0.95},
        ]
        
        with app.app_context():
            app.config["VIBRATION_PREDICTOR"] = mock_predictor
            
            response = client.get("/api/predict/predict_vibration")
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert isinstance(data, list)

    def test_predict_vibration_no_data(self, client, app):
        """Test vibration prediction with no data."""
        mock_predictor = MagicMock()
        mock_predictor.predict_all.return_value = None
        
        with app.app_context():
            app.config["VIBRATION_PREDICTOR"] = mock_predictor
            
            response = client.get("/api/predict/predict_vibration")
            
            assert response.status_code == 404

    def test_predict_dart_success(self, client, app):
        """Test successful DART prediction."""
        mock_predictor = MagicMock()
        mock_predictor.predict_all_values.return_value = [1.0, 2.0, 3.0]
        
        with app.app_context():
            app.config["DART_PREDICTOR"] = mock_predictor
            
            response = client.get("/api/predict/predict_dart")
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "Dart Predictions" in data

    def test_predict_dart_no_data(self, client, app):
        """Test DART prediction with no data."""
        mock_predictor = MagicMock()
        mock_predictor.predict_all_values.return_value = None
        
        with app.app_context():
            app.config["DART_PREDICTOR"] = mock_predictor
            
            response = client.get("/api/predict/predict_dart")
            
            assert response.status_code == 404

    def test_predict_status_success(self, client, app):
        """Test successful status prediction."""
        mock_predictor = MagicMock()
        mock_predictor.predict.return_value = "Normal"
        
        with app.app_context():
            app.config["STATUS_PREDICTOR"] = mock_predictor
            
            response = client.get("/api/predict/predict_status")
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "Predicted Status" in data

    def test_predict_status_failure(self, client, app):
        """Test status prediction failure."""
        mock_predictor = MagicMock()
        mock_predictor.predict.return_value = None
        
        with app.app_context():
            app.config["STATUS_PREDICTOR"] = mock_predictor
            
            response = client.get("/api/predict/predict_status")
            
            assert response.status_code == 404

