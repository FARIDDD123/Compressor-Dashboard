import os
import json
import logging
import time
import pandas as pd
import numpy as np
from backend.ml.dvr_processor import DVRProcessor
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv
from backend.core.metrics import (
    record_dvr_validation,
    record_dvr_correction,
    start_metrics_server,
)
from backend.core.audit_logger import get_audit_logger

# --- 1. Configuration and Setup ---
load_dotenv()

# Setup structured logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
GROUP_ID = os.getenv("KAFKA_DVR_GROUP_ID", "dvr-group")
RAW_TOPIC = "sensors-raw"
VALIDATED_TOPIC = "sensors-validated"

# Processing Configuration
BATCH_SIZE = 5

# Start metrics server
try:
    start_metrics_server(port=8000)
except Exception as e:
    logger.warning(f"Could not start metrics server: {e}")

# --- 2. Initialize Components ---
try:
    # CHANGED: We now handle deserialization manually inside the loop
    consumer = KafkaConsumer(
        RAW_TOPIC,
        bootstrap_servers=KAFKA_SERVERS,
        auto_offset_reset="earliest",
        enable_auto_commit=False,  # CHANGED: Disable auto-commit for manual control
        group_id=GROUP_ID,
    )

    producer = KafkaProducer(
        bootstrap_servers=KAFKA_SERVERS,
        value_serializer=lambda m: json.dumps(m).encode("utf-8"),
    )

    processor = DVRProcessor()
    logger.info("Kafka consumer and producer initialized successfully.")

except Exception as e:
    logger.critical(f"Failed to initialize Kafka client. Exiting. Error: {e}")
    exit(1)  # Exit if we can't even connect to Kafka

# --- 3. Main Processing Loop ---
buffer = []
logger.info(
    f"Starting DVR consumer for topic '{RAW_TOPIC}' with batch size {BATCH_SIZE}..."
)

# CHANGED: Use a while True loop with consumer.poll() for better control
while True:
    # Poll for new messages with a timeout of 1 second (1000 ms)
    message_batch = consumer.poll(timeout_ms=1000, max_records=BATCH_SIZE)

    # If no messages are returned, the loop continues
    if not message_batch:
        continue

    # Process messages for each partition
    for topic_partition, messages in message_batch.items():
        for message in messages:
            try:
                raw_data = json.loads(message.value.decode("utf-8"))
                logger.debug(f"Received raw message: {raw_data}")
                buffer.append(raw_data)
            except json.JSONDecodeError:
                logger.warning(f"Skipping message with invalid JSON: {message.value}")
                continue

    # If buffer has data, process it (it might not be a full batch)
    if buffer:
        try:
            logger.info(f"Processing a batch of {len(buffer)} records...")
            df = pd.DataFrame(buffer)
            processed_df = processor.run_all_checks(df)
            
            # Record metrics
            rule_passed = processed_df.get("all_rules_pass", pd.Series([False])).sum()
            rule_failed = len(processed_df) - rule_passed
            record_dvr_validation("rule_based", rule_passed > 0)
            if rule_failed > 0:
                record_dvr_validation("rule_based", False)
            
            corrections_count = processed_df.get("Data_Corrected", pd.Series([False])).sum()
            if corrections_count > 0:
                record_dvr_correction("wls_reconciliation")

            # NEW: Apply WLS reconciliation if corrections were made
            if "Data_Corrected" in processed_df.columns and processed_df["Data_Corrected"].any():
                logger.info("Applying WLS reconciliation for corrected data...")
                # WLS correction is already applied in run_all_checks via correct_sensor_data
                # Use corrected values where available
                if "Power_Consumption_Corrected" in processed_df.columns:
                    correction_mask = processed_df["Data_Corrected"] == True
                    processed_df.loc[correction_mask, "Power_Consumption"] = processed_df.loc[
                        correction_mask, "Power_Consumption_Corrected"
                    ]

            for _, row in processed_df.iterrows():
                cleaned_data = row.to_dict()
                # Convert numpy types to native Python types for JSON serialization
                for key, value in cleaned_data.items():
                    if isinstance(value, np.bool_):
                        cleaned_data[key] = bool(value)
                    elif isinstance(value, (np.integer, np.floating)):
                        cleaned_data[key] = float(value) if isinstance(value, np.floating) else int(value)

                # NEW: Add data lineage metadata (NF-511)
                corrections_applied = cleaned_data.get("Data_Corrected", False)
                cleaned_data["_data_lineage"] = {
                    "source": "sensors-raw",
                    "processing_service": "dvr-consumer",
                    "processed_at": pd.Timestamp.now().isoformat(),
                    "corrections_applied": corrections_applied,
                }
                
                # NEW: Log to audit trail if correction was made (NF-512)
                if corrections_applied:
                    record_id = str(cleaned_data.get("Time", f"record-{time.time()}"))
                    audit_logger = get_audit_logger()
                    
                    # Log Power_Consumption correction if it was corrected
                    if "Power_Consumption_Corrected" in cleaned_data:
                        original = cleaned_data.get("Power_Consumption", 0)
                        corrected = cleaned_data.get("Power_Consumption_Corrected", original)
                        audit_logger.log_data_change(
                            record_id=record_id,
                            field_name="Power_Consumption",
                            original_value=original,
                            corrected_value=corrected,
                            algorithm_id="WLS",
                            service_name="dvr-consumer",
                            reason="WLS reconciliation applied",
                        )

                logger.debug(f"Producing validated message: {cleaned_data}")
                producer.send(VALIDATED_TOPIC, cleaned_data)

            producer.flush()
            consumer.commit()

            logger.info(
                f"Successfully processed and committed a batch of {len(buffer)} records."
            )

        except Exception as e:
            logger.error(f"Failed to process a batch. Error: {e}")
            logger.error(f"Problematic data batch: {buffer}")

        finally:
            buffer = []
