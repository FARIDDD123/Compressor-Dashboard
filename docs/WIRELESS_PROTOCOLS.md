# Wireless Protocol Support Documentation

## Overview

This document describes the wireless protocol support added to the Digital Twin Gas Turbine system. The system now supports:

- **MQTT**: Lightweight messaging protocol for IoT devices
- **LoRaWAN**: Low-power, long-range wireless protocol for remote sensors

## Architecture

### Protocol Flow

```
Wireless Sensors → MQTT Broker / LoRaWAN Gateway → Protocol Adapter → Kafka → Processing Pipeline
```

1. **Wireless Sensors** publish data via MQTT or LoRaWAN
2. **Protocol Adapters** convert data to standard format
3. **Kafka** receives standardized data for processing
4. **Processing Pipeline** handles RTM, DVR, PdM, RTO

## MQTT Support

### Features

- ✅ MQTT Client with QoS support (0, 1, 2)
- ✅ TLS/SSL encryption
- ✅ Authentication (username/password)
- ✅ Multiple topic subscriptions with wildcards
- ✅ Automatic reconnection
- ✅ Integration with Kafka pipeline

### Configuration

Environment variables:

```bash
# MQTT Broker
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_USERNAME=your_username  # Optional
MQTT_PASSWORD=your_password  # Optional
MQTT_USE_TLS=false           # Enable TLS/SSL
MQTT_CA_CERTS=/path/to/ca.crt  # CA certificate path

# Topics to subscribe
MQTT_TOPICS=sensors/+/data,sensors/+/telemetry
```

### Topic Patterns

- `sensors/+/data` - Matches: `sensors/device1/data`, `sensors/device2/data`, etc.
- `sensors/+/telemetry` - Matches: `sensors/device1/telemetry`, etc.
- `sensors/#` - Matches all topics under `sensors/`

### Usage

#### Starting MQTT Consumer Service

```bash
# With Docker Compose
docker-compose up mqtt-consumer

# Or standalone
python backend/data_pipeline/mqtt_consumer.py
```

#### Publishing Sensor Data (Example)

Using `mosquitto_pub`:

```bash
mosquitto_pub -h localhost -p 1883 -t "sensors/turbine1/data" -m '{
  "timestamp": "2025-01-01T12:00:00Z",
  "pressure_in": 3.5,
  "temperature_in": 25.0,
  "flow_rate": 12.0,
  "vibration": 0.8
}'
```

Using Python:

```python
import paho.mqtt.client as mqtt
import json

client = mqtt.Client()
client.connect("localhost", 1883, 60)

data = {
    "pressure_in": 3.5,
    "temperature_in": 25.0,
    "flow_rate": 12.0,
}
client.publish("sensors/turbine1/data", json.dumps(data))
```

### HTTP Endpoint for MQTT-style Messages

For devices behind firewalls that cannot publish directly to MQTT:

```bash
curl -X POST http://localhost:5000/api/wireless/mqtt/publish \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "sensors/device1/data",
    "payload": {
      "pressure_in": 3.5,
      "temperature_in": 25.0
    }
  }'
```

## LoRaWAN Support

### Features

- ✅ ChirpStack Network Server integration
- ✅ The Things Network (TTN) integration
- ✅ Webhook-based message reception
- ✅ Automatic data format conversion
- ✅ Integration with Kafka pipeline

### Configuration

Environment variables:

```bash
# LoRaWAN Gateway Type
LORAWAN_GATEWAY_TYPE=chirpstack  # or "ttn"

# ChirpStack Configuration
LORAWAN_API_URL=http://localhost:8080
LORAWAN_API_KEY=your_api_key
LORAWAN_APPLICATION_ID=your_app_id

# TTN Configuration
TTN_APP_ID=your_app_id
TTN_APP_KEY=your_app_key
```

### ChirpStack Integration

1. Configure ChirpStack to send webhooks to:
   ```
   http://your-server:5000/api/wireless/lorawan/webhook
   ```

2. Webhook payload format (example):
   ```json
   {
     "deviceInfo": {
       "devEui": "0102030405060708"
     },
     "rxInfo": [{
       "rssi": -120,
       "snr": 5.2,
       "frequency": 868100000
     }],
     "data": {
       "data": "base64_encoded_payload"
     }
   }
   ```

### The Things Network (TTN) Integration

1. Configure TTN HTTP Integration:
   - Endpoint URL: `http://your-server:5000/api/wireless/lorawan/webhook`
   - Method: POST

2. TTN webhook payload format:
   ```json
   {
     "dev_id": "sensor-001",
     "payload_fields": {
       "pressure": 3.5,
       "temperature": 25.0
     },
     "metadata": {
       "time": "2025-01-01T12:00:00Z",
       "gateways": [{
         "rssi": -120
       }]
     }
   }
   ```

### LoRaWAN Message Format

The system expects LoRaWAN payloads in JSON format. For binary payloads, the system will:
- Convert to hex string
- Store in `raw` field
- Expect application-level decoding if needed

Example payload:

```json
{
  "pressure_in": 3.5,
  "temperature_in": 25.0,
  "flow_rate": 12.0,
  "vibration": 0.8
}
```

## Protocol Adapter

The Protocol Adapter converts data from different protocols into a standardized format.

### Standard Format

```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "Pressure_In": 3.5,
  "Temperature_In": 25.0,
  "Flow_Rate": 12.0,
  "Vibration": 0.8,
  "_protocol": "mqtt",
  "_device_id": "turbine1",
  "_mqtt_topic": "sensors/turbine1/data"
}
```

### Field Name Normalization

The adapter automatically normalizes field names:

- `pressure_in`, `p_in`, `pressure_inlet` → `Pressure_In`
- `temperature_in`, `temp_in` → `Temperature_In`
- `flow_rate`, `flow` → `Flow_Rate`
- `vibration`, `vib` → `Vibration`
- And more...

See `backend/protocols/protocol_adapter.py` for full mapping.

## Docker Deployment

### MQTT Broker (Mosquitto)

The `docker-compose.yml` includes a Mosquitto MQTT broker:

```yaml
mqtt-broker:
  image: eclipse-mosquitto:2.0
  ports:
    - "1883:1883"   # MQTT
    - "9001:9001"   # WebSocket
```

### MQTT Consumer Service

```yaml
mqtt-consumer:
  command: python -u backend/data_pipeline/mqtt_consumer.py
  depends_on:
    - mqtt-broker
    - kafka
```

## Security Considerations

### MQTT Security

1. **Authentication**: Use username/password authentication
   ```bash
   MQTT_USERNAME=your_username
   MQTT_PASSWORD=your_password
   ```

2. **TLS/SSL**: Enable TLS for encrypted communication
   ```bash
   MQTT_USE_TLS=true
   MQTT_CA_CERTS=/path/to/ca.crt
   ```

3. **Access Control**: Configure ACLs in Mosquitto for topic-level access control

### LoRaWAN Security

1. **API Keys**: Secure API keys for LoRaWAN Network Server access
2. **Webhook Authentication**: Implement webhook signature verification
3. **Device Authentication**: Use LoRaWAN's built-in security (AES-128 encryption)

## Testing

### Test MQTT Connection

```bash
# Subscribe to test topic
mosquitto_sub -h localhost -p 1883 -t "sensors/+/data"

# Publish test message
mosquitto_pub -h localhost -p 1883 -t "sensors/test/data" -m '{"pressure": 3.5}'
```

### Test LoRaWAN Webhook

```bash
curl -X POST http://localhost:5000/api/wireless/lorawan/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "deviceInfo": {"devEui": "0102030405060708"},
    "rxInfo": [{"rssi": -120}],
    "data": {"data": "eyJwcmVzc3VyZSI6IDMuNSwgInRlbXAiOiAyNS4wfQ=="}
  }'
```

## Troubleshooting

### MQTT Connection Issues

1. **Cannot connect to broker**:
   - Check `MQTT_BROKER_HOST` and `MQTT_BROKER_PORT`
   - Verify broker is running: `docker ps | grep mqtt-broker`
   - Check firewall rules

2. **Messages not received**:
   - Verify topic subscription matches published topics
   - Check Kafka connection
   - Review logs: `docker logs mqtt-consumer`

### LoRaWAN Issues

1. **Webhook not receiving data**:
   - Verify webhook URL in LoRaWAN Network Server
   - Check network connectivity
   - Review server logs

2. **Data format errors**:
   - Verify payload format matches expected schema
   - Check Protocol Adapter logs
   - Review field name mappings

## Performance

- **MQTT**: Can handle thousands of messages per second
- **LoRaWAN**: Limited by LoRaWAN protocol (typically 1-100 messages/hour per device)
- **Protocol Adapter**: < 1ms processing time per message
- **Kafka Integration**: Asynchronous, non-blocking

## References

- [MQTT Specification](https://mqtt.org/mqtt-specification/)
- [LoRaWAN Specification](https://lora-alliance.org/)
- [ChirpStack Documentation](https://www.chirpstack.io/)
- [The Things Network](https://www.thethingsnetwork.org/)

