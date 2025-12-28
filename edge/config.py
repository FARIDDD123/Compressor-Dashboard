"""
Edge Computing Configuration

Configuration settings for the Edge Computing module including paths,
connection settings, and operational parameters.
"""

import os
from pathlib import Path

# Base paths
EDGE_BASE_DIR = Path(__file__).parent.parent
EDGE_DATA_DIR = EDGE_BASE_DIR / "edge_data"
EDGE_DATA_DIR.mkdir(exist_ok=True)

# Local storage (SQLite)
EDGE_DB_PATH = EDGE_DATA_DIR / "edge_storage.db"

# Model paths (ONNX models for edge inference)
EDGE_MODELS_DIR = EDGE_BASE_DIR / "artifacts"
RTM_MODEL_PATH = EDGE_MODELS_DIR / "best_ppo_model.pkl"  # Will be converted to ONNX
RTM_SCALER_MEAN_PATH = EDGE_MODELS_DIR / "rtm_scaler_mean.npy"
RTM_SCALER_SCALE_PATH = EDGE_MODELS_DIR / "rtm_scaler_scale.npy"

# Cloud connection settings
CLOUD_API_URL = os.getenv("CLOUD_API_URL", "http://localhost:5000")
CLOUD_KAFKA_BOOTSTRAP = os.getenv("CLOUD_KAFKA_BOOTSTRAP", "localhost:9092")
CLOUD_SYNC_ENABLED = os.getenv("CLOUD_SYNC_ENABLED", "true").lower() == "true"
CLOUD_SYNC_INTERVAL = int(os.getenv("CLOUD_SYNC_INTERVAL", "60"))  # seconds

# Edge operation settings
EDGE_MODE = os.getenv("EDGE_MODE", "auto")  # auto, online, offline
EDGE_RTM_ENABLED = os.getenv("EDGE_RTM_ENABLED", "true").lower() == "true"
EDGE_DVR_ENABLED = os.getenv("EDGE_DVR_ENABLED", "true").lower() == "true"
EDGE_ALERTS_ENABLED = os.getenv("EDGE_ALERTS_ENABLED", "true").lower() == "true"

# Data retention (for local storage)
EDGE_DATA_RETENTION_HOURS = int(os.getenv("EDGE_DATA_RETENTION_HOURS", "168"))  # 7 days

# Connection health check
CLOUD_HEALTH_CHECK_INTERVAL = int(os.getenv("CLOUD_HEALTH_CHECK_INTERVAL", "30"))  # seconds
CLOUD_HEALTH_CHECK_TIMEOUT = int(os.getenv("CLOUD_HEALTH_CHECK_TIMEOUT", "5"))  # seconds

# Feature columns for RTM
RTM_FEATURE_COLUMNS = [
    "Pressure_In",
    "Temperature_In",
    "Flow_Rate",
    "Pressure_Out",
    "Temperature_Out",
    "Vibration",
    "Efficiency",
    "Power",
    "Ambient_Temp",
    "RPM",
    "Torque",
]

# Logging
EDGE_LOG_LEVEL = os.getenv("EDGE_LOG_LEVEL", "INFO")
EDGE_LOG_FILE = EDGE_DATA_DIR / "edge.log"

