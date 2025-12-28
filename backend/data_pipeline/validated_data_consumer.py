# backend/data_pipeline/validated_data_consumer.py

import os
import json
import logging
import time
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from influxdb_client import InfluxDBClient, Point, WriteOptions
from dotenv import load_dotenv

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_BROKER_URL = os.getenv("KAFKA_BROKER_URL", "kafka:9092")
VALIDATED_TOPIC_NAME = os.getenv("VALIDATED_TOPIC_NAME", "sensors-validated")

# InfluxDB Configuration
INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET_VALIDATED = "compressor-data-validated"


def connect_to_kafka():
    while True:
        try:
            consumer = KafkaConsumer(
                VALIDATED_TOPIC_NAME,
                bootstrap_servers=[KAFKA_BROKER_URL],
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="earliest",
            )
            logging.info(
                f"✅ Successfully connected to Kafka topic: {VALIDATED_TOPIC_NAME}"
            )
            return consumer
        except NoBrokersAvailable:
            logging.warning("Could not connect to Kafka. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logging.error(
                f"An unexpected error occurred while connecting to Kafka: {e}"
            )
            time.sleep(5)


def ensure_bucket_exists(client: InfluxDBClient, bucket_name: str, org_name: str):
    """Checks if a bucket exists, and creates it if it does not."""
    try:
        bucket_api = client.buckets_api()
        bucket = bucket_api.find_bucket_by_name(bucket_name)
        if not bucket:
            logger.info(f"Bucket '{bucket_name}' not found. Creating it...")
            bucket_api.create_bucket(bucket_name=bucket_name, org=org_name)
            logger.info(f"✅ Bucket '{bucket_name}' created successfully.")
        else:
            logger.info(f"Bucket '{bucket_name}' already exists.")
    except Exception as e:
        logger.error(f"Error ensuring bucket '{bucket_name}' exists: {e}")
        raise


def main():
    logging.info("Starting the consumer for validated data...")
    consumer = connect_to_kafka()
    if not consumer:
        logging.error("Could not connect to Kafka. Exiting.")
        return

    try:
        influx_client = InfluxDBClient(
            url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG
        )

        # --- FIX: Ensure the bucket exists before writing ---
        ensure_bucket_exists(influx_client, INFLUXDB_BUCKET_VALIDATED, INFLUXDB_ORG)

        write_api = influx_client.write_api(write_options=WriteOptions(batch_size=1))
        logger.info(
            f"Successfully connected to InfluxDB bucket: {INFLUXDB_BUCKET_VALIDATED}"
        )
    except Exception as e:
        logger.error(f"Error connecting to InfluxDB: {e}")
        return

    logger.info("Waiting for messages from Kafka...")
    for message in consumer:
        try:
            data = message.value
            logging.info(f"New message received: {data}")
            point = Point("validated_sensors").time(data.get("Timestamp"))

            for key, value in data.items():
                if key == "Timestamp":
                    continue
                if isinstance(value, str):
                    point.tag(key, value)
                elif isinstance(value, (int, float, bool)):
                    point.field(key, value)

            write_api.write(
                bucket=INFLUXDB_BUCKET_VALIDATED, org=INFLUXDB_ORG, record=point
            )
            logging.info("✅ Data point successfully written to InfluxDB.")
        except Exception as e:
            logging.error(f"Error processing message or writing to InfluxDB: {e}")


if __name__ == "__main__":
    main()
