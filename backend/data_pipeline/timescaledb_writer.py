"""
TimescaleDB Writer

Writes sensor data from Kafka to TimescaleDB with batch processing
for optimal performance with high data volumes (10GB/day).
"""

import os
import json
import logging
import time
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.core.timescaledb_client import TimescaleDBClient
from backend.core.database_abstraction import UnifiedDatabaseClient, DatabaseType

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class TimescaleDBWriter:
    """
    TimescaleDB writer that consumes from Kafka and writes to TimescaleDB.
    
    Features:
    - Batch insertion for performance
    - Automatic batch flushing
    - Handles both raw and validated data
    """

    def __init__(
        self,
        kafka_topic: str = "sensors-raw",
        kafka_broker: str = None,
        batch_size: int = 1000,
        flush_interval: float = 5.0,  # seconds
        use_unified_client: bool = True,
    ):
        """
        Initialize TimescaleDB writer.

        Args:
            kafka_topic: Kafka topic to consume from
            kafka_broker: Kafka broker address
            batch_size: Batch size for inserts
            flush_interval: Time interval to flush batch (seconds)
            use_unified_client: Use unified client (supports both InfluxDB and TimescaleDB)
        """
        self.kafka_topic = kafka_topic
        self.kafka_broker = kafka_broker or os.getenv("KAFKA_BROKER_URL", "kafka:9092")
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.use_unified_client = use_unified_client

        # Initialize database client
        if use_unified_client:
            db_type = os.getenv("TIMESERIES_DB_TYPE", "timescaledb").lower()
            if db_type == "both":
                db_type_enum = DatabaseType.BOTH
            elif db_type == "influxdb":
                db_type_enum = DatabaseType.INFLUXDB
            else:
                db_type_enum = DatabaseType.TIMESCALEDB
            
            from backend.core.database_abstraction import UnifiedDatabaseClient
            self.db_client = UnifiedDatabaseClient(db_type=db_type_enum)
        else:
            self.db_client = TimescaleDBClient()

        # Batch buffer
        self.batch_buffer: List[Dict[str, Any]] = []
        self.last_flush_time = time.time()
        self.total_inserted = 0

    def _flush_batch(self, validated: bool = False):
        """Flush batch buffer to database."""
        if not self.batch_buffer:
            return

        try:
            if self.use_unified_client:
                # Use unified client
                for data in self.batch_buffer:
                    self.db_client.insert_sensor_data(data, validated=validated)
            else:
                # Use TimescaleDB client directly (batch insert)
                if hasattr(self.db_client, 'insert_batch'):
                    inserted = self.db_client.insert_batch(
                        self.batch_buffer, validated=validated
                    )
                    self.total_inserted += inserted
                else:
                    # Fallback to individual inserts
                    for data in self.batch_buffer:
                        if self.db_client.insert_sensor_data(data, validated=validated):
                            self.total_inserted += 1

            batch_size = len(self.batch_buffer)
            logger.info(f"Flushed batch of {batch_size} records to TimescaleDB (total: {self.total_inserted})")
            self.batch_buffer.clear()
            self.last_flush_time = time.time()

        except Exception as e:
            logger.error(f"Error flushing batch: {e}", exc_info=True)
            self.batch_buffer.clear()  # Clear buffer on error to prevent memory issues

    def _should_flush(self) -> bool:
        """Check if batch should be flushed."""
        if len(self.batch_buffer) >= self.batch_size:
            return True
        if time.time() - self.last_flush_time >= self.flush_interval:
            return True
        return False

    def start(self):
        """Start consuming from Kafka and writing to TimescaleDB."""
        # Connect to Kafka
        consumer = None
        logger.info(f"Connecting to Kafka broker at {self.kafka_broker}...")
        
        while not consumer:
            try:
                consumer = KafkaConsumer(
                    self.kafka_topic,
                    bootstrap_servers=[self.kafka_broker],
                    value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                    auto_offset_reset="latest",
                    group_id="timescaledb-writer",
                )
                logger.info(f"✅ Connected to Kafka. Consuming from topic: {self.kafka_topic}")
            except NoBrokersAvailable:
                logger.warning("Kafka broker not available. Retrying in 5 seconds...")
                time.sleep(5)
            except Exception as e:
                logger.error(f"Error connecting to Kafka: {e}")
                time.sleep(5)

        try:
            logger.info("Starting TimescaleDB writer...")
            
            for message in consumer:
                try:
                    data = message.value
                    
                    # Determine if data is validated (check topic or data field)
                    validated = self.kafka_topic.endswith("validated") or data.get("validated", False)
                    
                    # Add to batch buffer
                    self.batch_buffer.append(data)
                    
                    # Flush if needed
                    if self._should_flush():
                        self._flush_batch(validated=validated)
                        
                except json.JSONDecodeError:
                    logger.warning(f"Skipping message with invalid JSON")
                    consumer.commit()
                except Exception as e:
                    logger.error(f"Error processing message: {e}", exc_info=True)
                    consumer.commit()

        except KeyboardInterrupt:
            logger.info("Received shutdown signal")
        except Exception as e:
            logger.error(f"Fatal error: {e}", exc_info=True)
        finally:
            # Flush remaining batch
            if self.batch_buffer:
                logger.info("Flushing remaining batch before shutdown...")
                validated = self.kafka_topic.endswith("validated")
                self._flush_batch(validated=validated)
            
            if consumer:
                consumer.close()
            if self.db_client:
                self.db_client.close()
            logger.info("TimescaleDB writer stopped")


def main():
    """Main entry point."""
    # Get configuration
    kafka_topic = os.getenv("KAFKA_RAW_TOPIC", "sensors-raw")
    batch_size = int(os.getenv("TIMESCALEDB_BATCH_SIZE", "1000"))
    flush_interval = float(os.getenv("TIMESCALEDB_FLUSH_INTERVAL", "5.0"))
    use_unified = os.getenv("USE_UNIFIED_DB_CLIENT", "true").lower() == "true"

    writer = TimescaleDBWriter(
        kafka_topic=kafka_topic,
        batch_size=batch_size,
        flush_interval=flush_interval,
        use_unified_client=use_unified,
    )

    try:
        writer.start()
    except Exception as e:
        logger.error(f"Failed to start writer: {e}", exc_info=True)
        return 1

    return 0


if __name__ == "__main__":
    exit(main())

