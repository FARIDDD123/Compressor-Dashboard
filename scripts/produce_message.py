import json
import time
import random
from kafka import KafkaProducer

KAFKA_SERVER = "kafka:9092"
TOPIC_NAME = "sensors-raw"

print("--- Starting Sensor Simulator ---")

producer = KafkaProducer(
    bootstrap_servers=[KAFKA_SERVER],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
)

print(
    f"Connected to Kafka. Will start sending data to '{TOPIC_NAME}' topic every 5 seconds..."
)

message_count = 0
while True:
    try:
        # Create a new random data point for each message
        data = {
            "Timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "Time": int(time.time()),
            "Pressure_In": round(random.uniform(3.0, 4.0), 2),
            "Temperature_In": round(random.uniform(15.0, 25.0), 2),
            "Flow_Rate": round(random.uniform(11.5, 12.5), 2),
            "Pressure_Out": round(random.uniform(15.0, 16.0), 2),
            "Temperature_Out": round(random.uniform(180.0, 200.0), 2),
            "Efficiency": round(random.uniform(0.8, 0.9), 2),
            "Power_Consumption": round(random.uniform(5000, 6000), 2),
            "Vibration": round(random.uniform(0.8, 1.1), 2),
            "Status": "Normal",
            "Ambient_Temperature": round(random.uniform(20.0, 30.0), 2),
            "Humidity": round(random.uniform(50.0, 70.0), 2),
            "Air_Pollution": round(random.uniform(0.03, 0.05), 4),
            "Startup_Shutdown_Cycles": 300,
            "Maintenance_Quality": 80.0,
            "Fuel_Quality": 95.0,
            "Load_Factor": 0.88,
        }

        producer.send(TOPIC_NAME, value=data)
        message_count += 1
        print(f"Sent message #{message_count}: Flow_Rate = {data['Flow_Rate']}")

        # Wait for 5 seconds before sending the next message
        time.sleep(5)

    except Exception as e:
        print(f"An error occurred: {e}")
        time.sleep(10)  # Wait longer if there's an error
