"""
Pytest configuration and shared fixtures for all tests.
"""

import pytest
import os
from unittest.mock import Mock, MagicMock, patch
from flask import Flask
import jwt
from datetime import datetime, timedelta

# Set test environment variables
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "3307"
os.environ["DB_USER"] = "test_user"
os.environ["DB_PASSWORD"] = "test_password"
os.environ["DB_DATABASE"] = "test_db"
os.environ["TESTING"] = "true"
os.environ["KAFKA_BROKER_URL"] = "localhost:9092"
os.environ["INFLUXDB_URL"] = "http://localhost:8086"
os.environ["INFLUXDB_TOKEN"] = "test-token"
os.environ["INFLUXDB_ORG"] = "test-org"
os.environ["INFLUXDB_BUCKET"] = "test-bucket"
os.environ["CORS_ALLOWED_ORIGINS"] = "http://localhost:5173"


@pytest.fixture
def app():
    """Create a Flask application instance for testing."""
    from backend.api.app import create_app
    
    app = create_app()
    app.config["TESTING"] = True
    app.config["WTF_CSRF_ENABLED"] = False
    
    return app


@pytest.fixture
def client(app):
    """Create a test client for the Flask application."""
    return app.test_client()


@pytest.fixture
def auth_headers():
    """Generate authentication headers with JWT token."""
    secret_key = os.getenv("JWT_SECRET_KEY", "test-secret-key-for-testing-only")
    
    def _create_token(user_id=1, username="testuser", role="admin"):
        payload = {
            "user_id": user_id,
            "username": username,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=24),
            "iat": datetime.utcnow(),
        }
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        return {"Authorization": f"Bearer {token}"}
    
    return _create_token


@pytest.fixture
def mock_db():
    """Mock database connection."""
    with patch("backend.core.user_manager.UserManager._get_connection") as mock:
        connection = MagicMock()
        cursor = MagicMock()
        connection.cursor.return_value.__enter__.return_value = cursor
        mock.return_value = connection
        yield cursor


@pytest.fixture
def mock_influxdb():
    """Mock InfluxDB client."""
    with patch("influxdb_client.InfluxDBClient") as mock:
        client = MagicMock()
        write_api = MagicMock()
        query_api = MagicMock()
        client.write_api.return_value = write_api
        client.query_api.return_value = query_api
        client.__enter__.return_value = client
        mock.return_value = client
        yield {"client": client, "write_api": write_api, "query_api": query_api}


@pytest.fixture
def mock_kafka():
    """Mock Kafka producer and consumer."""
    with patch("kafka.KafkaProducer") as mock_producer, \
         patch("kafka.KafkaConsumer") as mock_consumer:
        producer = MagicMock()
        consumer = MagicMock()
        mock_producer.return_value = producer
        mock_consumer.return_value = consumer
        yield {"producer": producer, "consumer": consumer}


@pytest.fixture
def mock_opcua_client():
    """Mock OPC-UA client."""
    with patch("backend.opcua.opcua_client.OPCUAClient") as mock:
        client = MagicMock()
        client.connected = True
        client.read_control_parameters = MagicMock(return_value={
            "load_factor": 0.75,
            "pressure_setpoint": 85.0,
            "temperature_setpoint": 75.0,
        })
        client.get_system_status = MagicMock(return_value="running")
        client.write_control_setpoint = MagicMock(return_value=True)
        client.connect = MagicMock(return_value=True)
        mock.return_value = client
        yield client


@pytest.fixture
def sample_sensor_data():
    """Sample sensor data for testing."""
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
    }


@pytest.fixture
def sample_user():
    """Sample user data."""
    return {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "role": "admin",
        "is_active": True,
    }

