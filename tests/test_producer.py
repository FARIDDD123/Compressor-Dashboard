import unittest
import pandas as pd
from kafka import KafkaProducer
import json
import time
import os
import socket
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Read Kafka server from .env, with a default for local runs
KAFKA_SERVER = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = os.getenv("KAFKA_RAW_TOPIC", "sensors-raw")
# CORRECTED: Use a robust path relative to the tests directory
TEST_DATA_PATH = "tests/data/kafka_test_sample.csv"


def is_kafka_available(host="localhost", port=9092):
    """Checks if the Kafka service is available on the given host and port."""
    # This function is fine, but for Docker, we should check the service name if possible.
    # For now, 'localhost' works because the port is exposed from the container.
    try:
        with socket.create_connection((host, port), timeout=3):
            return True
    except OSError:
        return False


class TestKafkaProducer(unittest.TestCase):
    @unittest.skipUnless(
        is_kafka_available(), "Kafka service is not available on localhost:9092"
    )
    def test_send_data(self):
        """
        Tests reading sample data and sending it to the Kafka topic.
        This is an integration test.
        """
        self.assertTrue(
            os.path.exists(TEST_DATA_PATH),
            f"Test CSV file not found at: {TEST_DATA_PATH}",
        )

        df = pd.read_csv(TEST_DATA_PATH)

        # --- Producer Setup ---
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_SERVER],
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
        except Exception as e:
            self.fail(f"Failed to connect to Kafka Producer: {e}")

        # --- Send a few records for testing ---
        print(f"\nStreaming 5 records to Kafka topic '{KAFKA_TOPIC}'...")
        for idx, row in df.head(
            5
        ).iterrows():  # Send only the first 5 rows to keep the test fast
            data = row.to_dict()
            producer.send(KAFKA_TOPIC, value=data)
            time.sleep(0.5)  # Reduced sleep time for faster testing

        producer.flush()
        producer.close()
        print("Test completed successfully.")
