# Prometheus & Grafana Setup Guide

راهنمای کامل پیکربندی Prometheus و Grafana برای observability.

## 🚀 راه‌اندازی سریع

### 1. Start Services

```bash
docker-compose up prometheus grafana
```

### 2. Access Dashboards

- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000
  - Default credentials: `admin` / `admin`

## 📊 Metrics Available

### API Metrics:
- `api_requests_total` - Total API requests
- `api_request_duration_seconds` - API latency

### Kafka Metrics:
- `kafka_messages_consumed_total` - Messages consumed
- `kafka_messages_produced_total` - Messages produced
- `kafka_consumer_lag_seconds` - Consumer lag

### DVR Metrics:
- `dvr_validations_total` - Validation count
- `dvr_corrections_total` - Corrections made

### RTM Metrics:
- `rtm_anomalies_detected_total` - Anomalies detected
- `rtm_prediction_latency_seconds` - Prediction latency

### RTO Metrics:
- `rto_suggestions_generated_total` - Suggestions generated
- `rto_executions_total` - Executions count

### PdM Metrics:
- `pdm_rul_predictions_total` - RUL predictions

## 📈 Grafana Dashboards

### System Overview Dashboard
- API request rate and latency
- Kafka consumer lag
- DVR corrections
- RTM anomalies

### Data Quality Dashboard
- DVR validation rate
- Correction rate
- Data quality score
- Outlier detection rate

## 🔧 Configuration

### Prometheus Targets

تمام microservices metrics endpoints در `prometheus/prometheus.yml` پیکربندی شده‌اند.

### Grafana Data Sources

- **Prometheus:** http://prometheus:9090
- **InfluxDB:** http://influxdb:8086

## 📝 Custom Queries

### API Latency (95th percentile):
```promql
histogram_quantile(0.95, api_request_duration_seconds_bucket)
```

### Kafka Consumer Lag:
```promql
kafka_consumer_lag_seconds
```

### Data Quality Score:
```promql
(dvr_validations_total{result="passed"} / dvr_validations_total) * 100
```

