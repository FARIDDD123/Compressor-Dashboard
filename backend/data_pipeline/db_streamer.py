import os
import json
import time
import logging
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable
from dotenv import load_dotenv
from datetime import datetime, timezone
from backend.core.database import CompressorDatabase
from backend.core.metrics import (
    record_kafka_production,
    start_metrics_server,
)

# --- Configuration and Logging Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("DatabaseStreamer")


def create_kafka_producer():
    """Establishes a connection to Kafka, retrying if necessary."""
    producer = None
    while not producer:
        try:
            producer = KafkaProducer(
                bootstrap_servers=os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092"),
                value_serializer=lambda v: json.dumps(v, default=str).encode("utf-8"),
            )
            logger.info("✅ Kafka Producer connected successfully.")
            return producer
        except NoBrokersAvailable:
            logger.warning("Kafka broker not available. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logger.critical(f"❌ Could not connect to Kafka: {e}")
            time.sleep(5)


def stream_data_from_db():
    """
    Connects to the database, reads the master dataset, and streams it row by row
    to the 'sensors-raw' Kafka topic, simulating a live feed.
    """
    # Start metrics server
    try:
        start_metrics_server(port=8000)
    except Exception as e:
        logger.warning(f"Could not start metrics server: {e}")
    db_config = {
        "host": os.getenv("DB_HOST"),
        "port": int(os.getenv("DB_PORT", 3306)),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_DATABASE"),
    }

    db = CompressorDatabase(**db_config)

    while not db.connect():
        logger.warning("Failed to connect to the database. Retrying in 5 seconds...")
        time.sleep(5)

    if not db.load_data(query="SELECT * FROM compressor_data ORDER BY Time ASC"):
        logger.error("❌ Failed to load data from the database. Exiting.")
        return

    logger.info(f"Loaded {db.total_records} records from the database to stream.")
    producer = create_kafka_producer()
    topic = os.getenv("KAFKA_RAW_TOPIC", "sensors-raw")

    logger.info(f"Starting to stream data to Kafka topic '{topic}'...")
    try:
        while True:
            for record in db._data:
                # --- THIS IS THE FIX ---
                # Update the timestamp to the current time to make it "live"
                record["Timestamp"] = (
                    datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                )

                producer.send(topic, value=record)
                record_kafka_production(topic)
                logger.info(
                    f"Sent record with new LIVE timestamp for Time={record.get('Time')}"
                )
                time.sleep(2)

            logger.info("✅ Finished one full loop of the dataset. Restarting...")

    except Exception as e:
        logger.error(f"❌ An error occurred during streaming: {e}")
    finally:
        producer.close()
        db.close()


if __name__ == "__main__":
    stream_data_from_db()
