# backend/data_pipeline/rtm_consumer.py

import json
import logging
import os
import time
import pymysql
import pandas as pd
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from backend.ml.rtm_module import AnomalyDetector
from collections import deque
from backend.core.prediction_logger import log_prediction
from dotenv import load_dotenv
from datetime import datetime

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# --- Configs ---
KAFKA_SERVER = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
KAFKA_TOPIC_IN = "sensors-raw"
KAFKA_TOPIC_ALERTS_OUT = "alerts"
KAFKA_TOPIC_DATA_OUT = "sensors-processed"
WINDOW_SIZE = 5

# MySQL Config (for Alarms)
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}

# InfluxDB Config (for Prediction Logs)
INFLUXDB_CONFIG = {
    "url": os.getenv("INFLUXDB_URL", "http://influxdb:8086"),
    "token": os.getenv("INFLUXDB_TOKEN"),
    "org": os.getenv("INFLUXDB_ORG"),
    "bucket": os.getenv("INFLUXDB_BUCKET"),
}


# --- 2. Function to save alerts to the database ---
def save_alert_to_mysql(alert_data: dict):
    """Saves a new anomaly alert, including its causes, to the 'alarms' table in MySQL."""
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            # SQL query to insert alert data
            sql = """
                INSERT INTO alarms (time_id, timestamp, alert_type, details, causes)
                VALUES (%s, %s, %s, %s, %s)
            """

            # Ensure 'causes' key exists before accessing
            if "causes" not in alert_data:
                alert_data["causes"] = []

            timestamp_obj = datetime.fromisoformat(
                alert_data.get("timestamp").replace("Z", "+00:00")
            )

            # Convert the causes list to a JSON string for database storage
            causes_json = json.dumps(alert_data.get("causes"))

            cursor.execute(
                sql,
                (
                    alert_data.get("time_id"),
                    timestamp_obj,
                    alert_data.get("alert_type"),
                    alert_data.get("details"),
                    causes_json,
                ),
            )
        conn.commit()
        logging.info(
            f"✅ Alert for Time={alert_data.get('time_id')} saved to database."
        )
    except Exception as e:
        logging.error(f"❌ Failed to save alert to MySQL: {e}")
    finally:
        if conn:
            conn.close()


def connect_to_kafka():
    """Establishes a connection to Kafka Consumer and Producer."""
    while True:
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC_IN,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset="latest",
                value_deserializer=lambda x: json.loads(x.decode("utf-8")),
            )
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_SERVER],
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            logging.info("✅ RTM Kafka Consumer and Producer connected successfully.")
            return consumer, producer
        except NoBrokersAvailable:
            logging.warning(
                "Could not connect to Kafka for RTM. Retrying in 5 seconds..."
            )
            time.sleep(5)


def main():
    """Main function to consume sensor data, detect anomalies, and log alerts."""
    detector = AnomalyDetector()
    if not detector.session:
        logging.critical(
            "Stopping RTM consumer: Anomaly detector model could not be loaded."
        )
        return

    consumer, producer = connect_to_kafka()
    logging.info("Listening for messages to analyze...")

    data_buffer = deque(maxlen=WINDOW_SIZE)
    # Variable to prevent duplicate consecutive alerts
    last_reported_causes = set()

    for message in consumer:
        try:
            start_time = time.time()
            data_row = message.value
            data_buffer.append(data_row)

            if len(data_buffer) < WINDOW_SIZE:
                logging.info(
                    f"Buffer is filling up... ({len(data_buffer)}/{WINDOW_SIZE})"
                )
                continue

            df_window = pd.DataFrame(list(data_buffer))

            # Feature Engineering: Rolling window calculations
            last_row_index = len(df_window) - 1
            data_row["Vibration_roll_mean"] = (
                df_window["Vibration"]
                .rolling(window=WINDOW_SIZE)
                .mean()
                .iloc[last_row_index]
            )
            data_row["Power_Consumption_roll_mean"] = (
                df_window["Power_Consumption"]
                .rolling(window=WINDOW_SIZE)
                .mean()
                .iloc[last_row_index]
            )
            data_row["Vibration_roll_std"] = (
                df_window["Vibration"]
                .rolling(window=WINDOW_SIZE)
                .std()
                .iloc[last_row_index]
            )
            data_row["Power_Consumption_roll_std"] = (
                df_window["Power_Consumption"]
                .rolling(window=WINDOW_SIZE)
                .std()
                .iloc[last_row_index]
            )

            # Send the complete data point (including new features) to the data output stream
            producer.send(KAFKA_TOPIC_DATA_OUT, value=data_row)
            producer.flush()
            logging.debug(
                f"Data point for Time={data_row.get('Time')} sent to {KAFKA_TOPIC_DATA_OUT}."
            )

            # Unpack prediction and causes from the detector
            prediction, causes = detector.predict(data_row)
            latency = (time.time() - start_time) * 1000

            # Record metrics
            from backend.core.metrics import (
                record_rtm_anomaly,
                record_rtm_prediction_latency,
                record_kafka_consumption,
            )
            record_rtm_prediction_latency(latency / 1000.0)  # Convert to seconds
            record_kafka_consumption(KAFKA_TOPIC_IN, "rtm-group")
            
            # Record anomaly if detected (prediction == -1 means anomaly in isolation forest)
            if prediction == -1 or prediction == 1:
                record_rtm_anomaly("isolation_forest")

            # Log every prediction to InfluxDB (UPDATED CALL)
            log_prediction(
                influxdb_config=INFLUXDB_CONFIG,
                model_version="RandomForest_RTM_v1.0",
                input_data=data_row,
                prediction={"anomaly": int(prediction)},
                latency_ms=latency,
            )

            # If an anomaly is detected, send alert and save to DB
            if prediction == -1:
                # Logic to prevent sending duplicate consecutive alerts
                current_causes_set = set(causes)
                if current_causes_set == last_reported_causes:
                    logging.info(f"Skipping duplicate anomaly with causes: {causes}")
                    continue
                last_reported_causes = current_causes_set

                # Enhance the alert message with causes
                alert_message = {
                    "timestamp": data_row.get("Timestamp"),
                    "time_id": data_row.get("Time"),
                    "alert_type": "Anomaly Detected",
                    "details": f"Anomaly found. Main causes: {', '.join(causes)}",
                    "causes": causes,
                }

                # Send alert to the ALERTS OUT topic
                producer.send(KAFKA_TOPIC_ALERTS_OUT, value=alert_message)
                producer.flush()
                logging.warning(
                    f"🚨 ANOMALY DETECTED and published to '{KAFKA_TOPIC_ALERTS_OUT}'. (Time={data_row.get('Time')})"
                )

                # Call the function to save the alert
                save_alert_to_mysql(alert_message)

        except Exception as e:
            logging.error(f"An error occurred in the RTM consumer loop: {e}")


if __name__ == "__main__":
    main()
