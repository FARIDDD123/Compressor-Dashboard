# backend/data_pipeline/rto_consumer.py

import os
import json
import logging
import time
import numpy as np
import pandas as pd
import onnxruntime as ort
import pymysql
import pickle

# Add KafkaProducer
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
from dotenv import load_dotenv
from backend.core import config
from backend.ml.digital_twin import DigitalTwin
from influxdb_client import InfluxDBClient
from typing import Optional

# --- 1. Setup Logging and Load Env ---
load_dotenv()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("RTO_Consumer")

# --- 2. Use Config Variables ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_DATABASE"),
}


def save_suggestion_to_mysql(suggestion: str):
    # This function remains unchanged
    logger.info(f"Saving suggestion: '{suggestion}' to MySQL...")
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM rto_suggestions")
            sql = "INSERT INTO rto_suggestions (suggestion_text) VALUES (%s)"
            cursor.execute(sql, (suggestion,))
        conn.commit()
        logger.info("✅ Suggestion saved successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to save suggestion to MySQL: {e}")
        raise
    finally:
        if conn:
            conn.close()


def initialize_digital_twin() -> Optional[DigitalTwin]:
    """Initialize Digital Twin Gas Turbine 1 with historical data from InfluxDB."""
    try:
        influx_url = os.getenv("INFLUXDB_URL")
        influx_token = os.getenv("INFLUXDB_TOKEN")
        influx_org = os.getenv("INFLUXDB_ORG")
        influx_bucket = os.getenv("INFLUXDB_BUCKET")
        
        if not all([influx_url, influx_token, influx_org, influx_bucket]):
            logger.warning("InfluxDB config missing, Digital Twin Gas Turbine 1 will not be initialized")
            return None
        
        twin = DigitalTwin()
        
        # Fetch recent historical data for training
        with InfluxDBClient(url=influx_url, token=influx_token, org=influx_org) as client:
            query_api = client.query_api()
            flux_query = f'''
                from(bucket: "{influx_bucket}")
                  |> range(start: -7d)
                  |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
                  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
                  |> limit(n: 1000)
            '''
            
            tables = query_api.query(flux_query)
            
            records = []
            for table in tables:
                for record in table.records:
                    records.append(record.values)
            
            if records:
                df = pd.DataFrame(records)
                twin.initialize(df)
                logger.info("✅ Digital Twin Gas Turbine 1 initialized with historical data")
                return twin
            else:
                logger.warning("No historical data found for Digital Twin Gas Turbine 1 initialization")
                return None
                
    except Exception as e:
        logger.error(f"Failed to initialize Digital Twin Gas Turbine 1: {e}")
        return None


def main():
    # Initialize Digital Twin Gas Turbine 1 (FR-342)
    digital_twin = initialize_digital_twin()
    
    try:
        # Use Config Variables for Model Paths and Features
        logger.info(f"Loading RTO model from {config.RTO_MODEL_PATH}...")
        session = ort.InferenceSession(config.RTO_MODEL_PATH)
        input_name = session.get_inputs()[0].name

        logger.info(f"Loading scaler from {config.RTO_SCALER_PATH}...")
        with open(config.RTO_SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)

    except Exception as e:
        logger.critical(f"❌ Failed to load model or scaler. Exiting. Error: {e}")
        return

    # --- Connect to Kafka Consumer & Producer ---
    consumer = None
    producer = None
    kafka_server = os.getenv("KAFKA_BROKER_URL", "kafka:9092")

    while not consumer or not producer:
        try:
            if not consumer:
                consumer = KafkaConsumer(
                    config.KAFKA_VALIDATED_TOPIC,
                    bootstrap_servers=[kafka_server],
                    auto_offset_reset="latest",
                    value_deserializer=lambda x: json.loads(x.decode("utf-8")),
                )
                logger.info("✅ RTO Kafka Consumer connected.")

            if not producer:
                producer = KafkaProducer(
                    bootstrap_servers=[kafka_server],
                    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                )
                logger.info("✅ RTO Kafka Producer connected.")

        except NoBrokersAvailable:
            logger.warning("Could not connect to Kafka. Retrying...")
            time.sleep(5)

    logger.info("Listening for validated sensor data to generate optimizations...")
    for message in consumer:
        try:
            data_row = message.value
            df_point = pd.DataFrame([data_row])

            # Use feature list from config
            feature_names = scaler.get_feature_names_out()
            input_features_df = df_point[feature_names]

            input_scaled = scaler.transform(input_features_df).astype(np.float32)

            prediction = session.run(None, {input_name: input_scaled})[0]
            action_value = prediction[0][0]

            current_load_factor = data_row.get("Load_Factor", 0.8)
            
            # NEW: Digital Twin Gas Turbine 1 Validation (FR-342)
            validated = False
            validation_message = "Digital Twin Gas Turbine 1 validation skipped (not initialized)"
            
            if digital_twin and digital_twin.initialized:
                proposed_action = {"Load_Factor": float(action_value)}
                current_state = {
                    "Pressure_In": data_row.get("Pressure_In", 0),
                    "Temperature_In": data_row.get("Temperature_In", 0),
                    "Flow_Rate": data_row.get("Flow_Rate", 0),
                    "Load_Factor": current_load_factor,
                    "Ambient_Temperature": data_row.get("Ambient_Temperature", 25),
                }
                
                predicted_state, is_safe, validation_message = digital_twin.simulate_action(
                    current_state, proposed_action
                )
                
                if is_safe:
                    validated = True
                    logger.info(f"✅ Digital Twin Gas Turbine 1 validated action: {validation_message}")
                    if predicted_state:
                        logger.info(f"Predicted outcomes: {predicted_state}")
                else:
                    validated = False
                    logger.warning(f"⚠️ Digital Twin Gas Turbine 1 rejected action: {validation_message}")
                    # Use a safer, conservative action value
                    action_value = current_load_factor * 1.05  # Small conservative increase
            
            efficiency_gain = (action_value - current_load_factor) * 10
            suggestion_text = (
                f"Adjust Load Factor to {action_value:.2%} for a potential "
                f"efficiency gain of {efficiency_gain:.1f}%."
            )
            
            if validated:
                suggestion_text += f" [Digital Twin Gas Turbine 1 Validated: {validation_message}]"
            elif digital_twin and not validated:
                suggestion_text += f" [Validation Failed: {validation_message} - Using conservative value]"

            # 1. Save to DB (as before)
            save_suggestion_to_mysql(suggestion_text)

            # 2. NEW: Produce to Kafka topic for real-time push
            rto_payload = {
                "suggestion_text": suggestion_text,
                "generated_at": pd.Timestamp.now(tz="UTC").isoformat(),  # Add timestamp
                "validated": validated,
                "validation_message": validation_message,
                "action_value": float(action_value),
                "current_load_factor": float(current_load_factor),
            }
            
            # Add data lineage
            rto_payload["_data_lineage"] = {
                "source": "sensors-validated",
                "processing_service": "rto-consumer",
                "processed_at": pd.Timestamp.now(tz="UTC").isoformat(),
                "digital_twin_validated": validated,
            }
            
            producer.send(config.KAFKA_RTO_SUGGESTIONS_TOPIC, value=rto_payload)
            producer.flush()
            
            # Record metrics
            from backend.core.metrics import (
                record_rto_suggestion,
                record_kafka_production,
            )
            record_rto_suggestion()
            record_kafka_production(config.KAFKA_RTO_SUGGESTIONS_TOPIC)
            
            logger.info(
                f"✅ Suggestion sent to Kafka topic '{config.KAFKA_RTO_SUGGESTIONS_TOPIC}'."
            )

        except KeyError as e:
            logger.warning(f"Skipping message due to missing feature: {e}")
        except Exception as e:
            logging.error(f"An error occurred in the RTO consumer loop: {e}")


if __name__ == "__main__":
    main()
