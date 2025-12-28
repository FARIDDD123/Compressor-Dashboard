import pandas as pd
from kafka import KafkaProducer
import json
import time
import os
import argparse
import logging
from dotenv import load_dotenv

# --- 1. Configuration and Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def create_producer(server: str) -> KafkaProducer:
    """Creates a Kafka Producer instance."""
    try:
        producer = KafkaProducer(
            bootstrap_servers=[server],
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        )
        logger.info("✅ Kafka Producer connected successfully.")
        return producer
    except Exception as e:
        logger.critical(f"❌ Could not connect to Kafka server: {e}")
        return None


def stream_data(producer: KafkaProducer, file_path: str, topic: str):
    """Reads data from a CSV and streams it to a Kafka topic."""
    try:
        logger.info(f"Reading data from {file_path}...")
        df = pd.read_csv(file_path)
        logger.info(f"Starting to stream data to Kafka topic '{topic}'...")

        for index, row in df.iterrows():
            message = row.to_dict()
            producer.send(topic, value=message)
            logger.info(f"Sent message #{index + 1}")
            time.sleep(1)

        producer.flush()
        logger.info("\n✅ Finished streaming all data.")

    except FileNotFoundError:
        logger.error(f"❌ ERROR: The file '{file_path}' was not found.")
    except Exception as e:
        logger.error(f"❌ An error occurred during streaming: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kafka producer to stream CSV data.")
    parser.add_argument(
        "--server",
        default=os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        help="Kafka bootstrap server",
    )
    parser.add_argument(
        "--topic",
        default=os.getenv("KAFKA_RAW_TOPIC", "sensors-raw"),
        help="Kafka topic to produce to",
    )
    parser.add_argument(
        "--file",
        default="datasets/MASTER_DATASET.csv",
        help="Path to the CSV file to stream",
    )
    args = parser.parse_args()

    if not os.path.exists(args.file):
        logger.error(f"❌ The specified file does not exist: {args.file}")
    else:
        kafka_producer = create_producer(args.server)
        if kafka_producer:
            try:
                stream_data(kafka_producer, args.file, args.topic)
            finally:
                kafka_producer.close()
                logger.info("Kafka producer closed.")
