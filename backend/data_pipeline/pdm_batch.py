# backend/data_pipeline/pdm_batch.py

import os
import logging
import time
import numpy as np
import pandas as pd
import onnxruntime as ort
import pymysql
import pickle
from influxdb_client import InfluxDBClient, Point  # ADDED Point
from dotenv import load_dotenv
import json
from backend.core import config
from datetime import datetime  # ADDED datetime for timestamping

# --- Setup Logging and Load Env ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("PDM_Batch_Runner")

# --- Use Config Variables (Database Configs) ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}

# InfluxDB Config (for RUL Prediction Logs)
INFLUXDB_CONFIG = {
    "url": os.getenv("INFLUXDB_URL", "http://influxdb:8086"),
    "token": os.getenv("INFLUXDB_TOKEN"),
    "org": os.getenv("INFLUXDB_ORG"),
    "bucket": os.getenv("INFLUXDB_BUCKET"),
}


def fetch_latest_sensor_data_sequence(window_size: int) -> pd.DataFrame:
    """Fetches a sequence of the latest sensor data from InfluxDB as a DataFrame."""
    logger.info(f"Fetching latest {window_size} data points from InfluxDB...")
    with InfluxDBClient(
        url=os.getenv("INFLUXDB_URL"),
        token=os.getenv("INFLUXDB_TOKEN"),
        org=os.getenv("INFLUXDB_ORG"),
        timeout=30_000,
    ) as client:
        query_api = client.query_api()

        flux_query = f'''
            from(bucket: "{os.getenv("INFLUXDB_BUCKET")}")
              |> range(start: 0)
              |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
              |> filter(fn: (r) => contains(value: r._field, set: {json.dumps(config.RUL_MODEL_FEATURES)}))
              |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
              |> sort(columns: ["_time"], desc: true)
              |> limit(n: {window_size}) 
        '''

        tables = query_api.query(flux_query)
        if not tables or len(tables[0].records) < window_size:
            raise ValueError(
                f"Not enough data in InfluxDB to form a sequence of size {window_size}."
            )

        df = pd.DataFrame([rec.values for rec in tables[0].records])
        logger.info("✅ Successfully fetched latest sensor data sequence.")
        return df


def save_prediction_to_mysql(rul_value: float):
    # This function is now deprecated in favor of InfluxDB for RUL.
    # Keeping it for potential temporary backward compatibility or if 'rul_predictions'
    # is a small table used by a simple front-end.
    # In a full migration, this should be removed and the calling main() function updated.
    logger.info(f"Saving RUL value ({rul_value:.2f}) to MySQL...")
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            # We are using MySQL to store only the *latest* RUL value for quick lookups
            cursor.execute("DELETE FROM rul_predictions")
            sql = "INSERT INTO rul_predictions (rul_value) VALUES (%s)"
            cursor.execute(sql, (rul_value,))
        conn.commit()
        logger.info("✅ MySQL RUL prediction saved successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to save RUL prediction to MySQL: {e}")
        raise
    finally:
        if conn:
            conn.close()


def log_rul_to_influxdb(rul_value: float):
    """Logs the RUL prediction to InfluxDB as a time-series log."""
    logger.info(f"Logging RUL value ({rul_value:.2f}) to InfluxDB...")
    try:
        with InfluxDBClient(
            url=INFLUXDB_CONFIG["url"],
            token=INFLUXDB_CONFIG["token"],
            org=INFLUXDB_CONFIG["org"],
        ) as client:
            write_api = client.write_api()

            # Create the Point: log the RUL prediction
            point = (
                Point("rul_predictions_logs")  # Measurement name
                .tag("model_version", "LSTM_RUL_v1.0")  # Assuming version
                .field("rul_days", rul_value)
                .time(datetime.utcnow())  # Time of prediction run
            )
            write_api.write(bucket=INFLUXDB_CONFIG["bucket"], record=point)
            logger.info("✅ RUL prediction logged to InfluxDB.")

    except Exception as e:
        logger.error(f"❌ Failed to log RUL to InfluxDB: {e}")


def main():
    try:
        # --- 4. Use Config Variables for Model Paths and Features ---
        logger.info(f"Loading RUL model from {config.RUL_MODEL_PATH}...")
        session = ort.InferenceSession(config.RUL_MODEL_PATH)
        input_name = session.get_inputs()[0].name
        window_size, feature_count = session.get_inputs()[0].shape[1:3]

        logger.info(f"Loading scaler from {config.RUL_SCALER_PATH}...")
        with open(config.RUL_SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)

        latest_data_df = fetch_latest_sensor_data_sequence(window_size)

        latest_data_features = latest_data_df[scaler.get_feature_names_out()]
        data_scaled = scaler.transform(latest_data_features)
        input_tensor = data_scaled.reshape(1, window_size, feature_count).astype(
            np.float32
        )

        logger.info("Running RUL prediction...")
        prediction = session.run(None, {input_name: input_tensor})[0]
        rul_value = float(prediction[0][0])
        logger.info(f"Predicted RUL: {rul_value:.2f} days")

        # Save to MySQL (for simple frontend display of the LAST prediction)
        save_prediction_to_mysql(rul_value)

        # Log to InfluxDB (for historical trend analysis of all predictions)
        log_rul_to_influxdb(rul_value)

    except Exception as e:
        logger.critical(f"❌ A critical error occurred in the PDM batch script: {e}")


if __name__ == "__main__":
    time.sleep(200)
    main()
