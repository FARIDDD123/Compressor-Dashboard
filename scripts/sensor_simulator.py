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
print(f"Connected. Sending data to '{TOPIC_NAME}'...")

msg_count = 0
while True:
    try:
        data = {
            "Timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "Time": int(time.time()),
            # Add all 16 features required by the AnomalyDetector
            "Pressure_In": round(random.uniform(3.0, 4.0), 2),
            "Temperature_In": round(random.uniform(15.0, 25.0), 2),
            "Flow_Rate": round(random.uniform(11.5, 12.5), 2),
            "Pressure_Out": round(random.uniform(15.0, 16.0), 2),
            "Temperature_Out": round(random.uniform(180.0, 200.0), 2),
            "Efficiency": round(random.uniform(0.8, 0.9), 2),
            "Power_Consumption": round(random.uniform(5000, 6000), 2),
            # Make vibration occasionally anomalous
            "Vibration": round(
                random.uniform(0.8, 1.1)
                if random.random() > 0.95
                else random.uniform(1.4, 1.6),
                2,
            ),
            "Ambient_Temperature": round(random.uniform(20.0, 30.0), 2),
            "Humidity": round(random.uniform(50.0, 70.0), 2),
            "Air_Pollution": round(random.uniform(0.03, 0.05), 4),
            "Frequency": round(random.uniform(48.0, 52.0), 2),
            "Amplitude": round(random.uniform(0.5, 1.5), 2),
            "Phase_Angle": round(random.uniform(0.1, 1.0), 2),
            "Velocity": round(random.uniform(3.0, 4.0), 2),
            "Stiffness": round(random.uniform(480000, 520000), 2),
        }
        producer.send(TOPIC_NAME, value=data)
        msg_count += 1
        print(f"Sent message #{msg_count} | Vibration: {data['Vibration']}")
        time.sleep(5)
    except Exception as e:
        print(f"Error: {e}")
        time.sleep(10)
