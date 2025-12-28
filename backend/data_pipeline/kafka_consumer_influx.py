# backend/data_pipeline/kafka_consumer_influx.py

import os
import json
import logging
import time
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from dotenv import load_dotenv
from backend.core.metrics import (
    record_kafka_consumption,
    start_metrics_server,
)

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_SERVER = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_RAW_TOPIC", "sensors-raw")
GROUP_ID = "influxdb-writer-group"

# InfluxDB Configuration
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET")


def main():
    """Main function to consume from Kafka and write to InfluxDB."""
    # Start metrics server
    try:
        start_metrics_server(port=8000)
    except Exception as e:
        logger.warning(f"Could not start metrics server: {e}")
    
    if not all([INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG, INFLUXDB_BUCKET]):
        logger.critical("❌ InfluxDB credentials not found in .env file. Exiting.")
        return

    # --- FIX: Add retry loop for Kafka connection ---
    consumer = None
    while not consumer:
        try:
            consumer = KafkaConsumer(
                KAFKA_TOPIC,
                bootstrap_servers=[KAFKA_SERVER],
                auto_offset_reset="earliest",
                enable_auto_commit=False,
                group_id=GROUP_ID,
            )
            logger.info("✅ Kafka Consumer for InfluxDB connected successfully.")
        except NoBrokersAvailable:
            logger.warning(
                "Could not connect to Kafka for InfluxDB writer. Retrying in 5 seconds..."
            )
            time.sleep(5)
        except Exception as e:
            logger.error(f"An unexpected error occurred while connecting to Kafka: {e}")
            time.sleep(5)

    try:
        with InfluxDBClient(
            url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG
        ) as client:
            write_api = client.write_api(write_options=SYNCHRONOUS)
            logger.info(
                f"✅ InfluxDB client connected. Writing to bucket '{INFLUXDB_BUCKET}'."
            )

            logger.info(f"Listening for messages from topic '{KAFKA_TOPIC}'...")
            for message in consumer:
                try:
                    data = json.loads(message.value.decode("utf-8"))
                    
                    # Record metrics
                    record_kafka_consumption(KAFKA_TOPIC, GROUP_ID)
                    
                    point = (
                        Point("compressor_metrics")
                        .tag("status", data.get("Status", "Unknown"))
                        .time(data.get("Timestamp"))
                    )

                    for key, value in data.items():
                        if key.lower() not in [
                            "timestamp",
                            "status",
                            "device_id",
                            "_data_lineage",  # Exclude lineage metadata from metrics
                        ] and isinstance(value, (int, float)):
                            point = point.field(key, value)

                    write_api.write(
                        bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point
                    )
                    logger.info(
                        f"Written message with Timestamp={data.get('Timestamp')} to InfluxDB."
                    )
                    consumer.commit()

                except json.JSONDecodeError:
                    logger.warning(
                        f"Skipping message with invalid JSON: {message.value}"
                    )
                    consumer.commit()
                except Exception as e:
                    logger.error(
                        f"❌ Failed to process message: {e}. Data: {message.value}"
                    )

    except Exception as e:
        logger.critical(f"❌ A critical error occurred in the main loop: {e}")
    finally:
        if consumer:
            consumer.close()
        logger.info("Kafka consumer closed.")


if __name__ == "__main__":
    main()
