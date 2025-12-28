# backend/core/prediction_logger.py

import logging
import json
from datetime import datetime
from influxdb_client import InfluxDBClient, Point

logger = logging.getLogger(__name__)


def log_prediction(
    influxdb_config: dict,
    model_version: str,
    input_data: dict,
    prediction: dict,
    latency_ms: float,
):
    """Logs a prediction event to the InfluxDB time-series database.

    Args:
        influxdb_config (dict): Dictionary containing InfluxDB connection details (url, token, org, bucket).
        model_version (str): The version of the model that generated the prediction.
        input_data (dict): The sensor data that was input to the model.
        prediction (dict): The result of the model's prediction.
        latency_ms (float): The time taken for the prediction in milliseconds.
    """
    try:
        # 1. Connect to InfluxDB using configuration
        with InfluxDBClient(
            url=influxdb_config["url"],
            token=influxdb_config["token"],
            org=influxdb_config["org"],
        ) as client:
            write_api = client.write_api()

            # Extract timestamp from input data (assuming 'Timestamp' key in ISO format)
            timestamp_str = input_data.get("Timestamp")

            point_time = datetime.utcnow()  # Default
            if timestamp_str:
                try:
                    # Convert ISO time string (e.g., with Z) to datetime object
                    point_time = datetime.fromisoformat(
                        timestamp_str.replace("Z", "+00:00")
                    )
                except ValueError:
                    pass  # Fallback to current UTC time on error

            # 2. Create Point for InfluxDB storage
            point = (
                Point("prediction_logs")  # Measurement name
                .tag("model_version", model_version)
                .tag("time_id", str(input_data.get("Time")))
                .field("latency_ms", latency_ms)
                # Store complex data (inputs and results) as JSON strings
                .field("prediction_result", json.dumps(prediction, default=str))
                .field("input_data", json.dumps(input_data, default=str))
                .time(point_time)  # Use sensor data time
            )

            # 3. Write the Point
            write_api.write(bucket=influxdb_config["bucket"], record=point)

            logger.debug(f"Prediction logged to InfluxDB for model: {model_version}")

    except Exception as e:
        logger.error(f"❌ Failed to log prediction to InfluxDB: {e}")
