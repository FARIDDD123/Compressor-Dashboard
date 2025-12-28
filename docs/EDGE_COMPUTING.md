# Edge Computing Module Documentation

## Overview

The Edge Computing module provides **disconnected operation** capabilities for critical processing tasks in remote oil field locations where connectivity to the central cloud server may be intermittent or unavailable.

## Architecture

The Edge Computing module consists of:

1. **Edge Gateway**: Main service that orchestrates edge operations
2. **Edge RTM Processor**: Real-time anomaly detection using ONNX models
3. **Edge DVR Processor**: Data validation and reconciliation
4. **Local Storage**: SQLite database for local data persistence
5. **Sync Mechanism**: Automatic synchronization with cloud when connectivity is restored

## Features

### Critical Operations in Disconnected Mode

- ✅ **Real-Time Monitoring (RTM)**: Anomaly detection using lightweight ONNX models
- ✅ **Data Validation (DVR)**: Rule-based validation and basic corrections
- ✅ **Local Alert Generation**: Critical alerts generated and stored locally
- ✅ **Local Data Storage**: All processed data stored in SQLite database
- ✅ **Automatic Cloud Sync**: Data synchronized with cloud when connectivity is restored

### Operation Modes

The Edge Gateway can operate in three modes:

1. **Online Mode**: Always connected to cloud, syncs data immediately
2. **Offline Mode**: Always operates offline, no sync attempts
3. **Auto Mode** (default): Automatically switches between online/offline based on connectivity

## Installation

### Docker Deployment

The Edge Gateway is included in the `docker-compose.yml` file:

```bash
docker-compose up edge-gateway
```

### Standalone Deployment

For deployment on edge devices (Raspberry Pi, industrial gateways, etc.):

```bash
cd edge
pip install -r requirements.txt
python main.py
```

## Configuration

Configuration is done through environment variables:

```bash
# Edge Operation Mode
EDGE_MODE=auto  # auto, online, offline

# Enable/Disable Features
EDGE_RTM_ENABLED=true
EDGE_DVR_ENABLED=true
EDGE_ALERTS_ENABLED=true

# Cloud Connection
CLOUD_API_URL=http://backend:5000
CLOUD_SYNC_ENABLED=true
CLOUD_SYNC_INTERVAL=60  # seconds

# Data Retention
EDGE_DATA_RETENTION_HOURS=168  # 7 days
```

## Usage

### Processing Sensor Data

```python
from edge.gateway import EdgeGateway

gateway = EdgeGateway()
gateway.start()

# Process incoming sensor data
sensor_data = {
    "timestamp": "2025-01-01T12:00:00Z",
    "Pressure_In": 3.5,
    "Temperature_In": 25.0,
    "Flow_Rate": 12.0,
    # ... other sensor readings
}

result = gateway.process_sensor_data(sensor_data)
print(f"Anomaly detected: {result['anomaly_detected']}")
print(f"Validated: {result['validated']}")
```

### Checking Gateway Status

```python
status = gateway.get_status()
print(status)
# {
#     "running": True,
#     "mode": "auto",
#     "cloud_connected": False,
#     "last_sync": None,
#     "rtm_enabled": True,
#     "dvr_enabled": True,
#     ...
# }
```

## Local Storage Schema

### Sensor Data Table

Stores processed sensor readings locally:

- `id`: Primary key
- `timestamp`: Data timestamp
- `data`: JSON string of sensor data
- `validated`: Whether data passed validation
- `synced`: Whether data has been synced to cloud
- `created_at`: Record creation timestamp

### Alerts Table

Stores generated alerts:

- `id`: Primary key
- `timestamp`: Alert timestamp
- `alert_type`: Type of alert (anomaly, validation_error, etc.)
- `severity`: Severity level (critical, warning, info)
- `message`: Alert message
- `metadata`: JSON string for additional data
- `synced`: Whether alert has been synced to cloud

### Sync Queue

Queues data for cloud synchronization:

- `id`: Primary key
- `table_name`: Source table name
- `record_id`: Record ID to sync
- `operation`: Operation type (INSERT, UPDATE, DELETE)
- `retry_count`: Number of sync attempts
- `last_attempt`: Last sync attempt timestamp

## Cloud Synchronization

### API Endpoints

The cloud backend provides the following endpoints for edge synchronization:

1. **POST /api/edge/sensor-data**: Receive sensor data from edge
2. **POST /api/edge/alerts**: Receive alerts from edge
3. **GET /api/edge/health**: Health check endpoint

### Sync Process

1. Edge Gateway continuously checks cloud connectivity
2. When connected, syncs unsynced data in batches
3. Data is marked as synced after successful upload
4. Failed syncs are retried on next sync interval

## Model Requirements

The Edge RTM processor requires ONNX models to be available in the `artifacts/` directory:

- RTM model (e.g., `isolation_forest_model.onnx`)
- Scaler parameters (`rtm_scaler_mean.npy`, `rtm_scaler_scale.npy`)

Models should be lightweight for edge deployment (typically < 100MB).

## Performance

- **RTM Inference Latency**: < 100ms (target for edge processing)
- **DVR Processing**: < 10ms per data point
- **Local Storage**: SQLite handles thousands of records efficiently
- **Memory Usage**: ~200-500MB typical

## Troubleshooting

### Edge Gateway Not Starting

1. Check model files exist in `artifacts/` directory
2. Verify database permissions for `edge_data/` directory
3. Check logs: `edge_data/edge.log`

### Cloud Sync Not Working

1. Verify `CLOUD_API_URL` is correct
2. Check network connectivity to cloud server
3. Review sync logs in gateway output

### High Memory Usage

1. Reduce `EDGE_DATA_RETENTION_HOURS` to store less data locally
2. Increase sync frequency to sync data more often
3. Disable unnecessary processors if not needed

## Security Considerations

1. **Local Storage Encryption**: Consider encrypting SQLite database for sensitive data
2. **API Authentication**: Implement authentication for cloud sync endpoints
3. **Network Security**: Use HTTPS/TLS for cloud communication
4. **Access Control**: Limit file system access for edge gateway process

## Future Enhancements

- [ ] Support for additional ML models (PdM, RTO)
- [ ] Advanced sync strategies (compression, delta sync)
- [ ] Edge-to-edge communication
- [ ] Model updates over-the-air
- [ ] Local dashboard/web interface

## References

- [Edge Computing Best Practices](https://www.edgecomputing.org/)
- [ONNX Runtime Documentation](https://onnxruntime.ai/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

