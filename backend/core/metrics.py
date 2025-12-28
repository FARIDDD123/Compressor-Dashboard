"""
Prometheus metrics exporter for all microservices.
Collects metrics for CPU, memory, Kafka consumer lag, API latency, etc.
"""

import time
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import logging

logger = logging.getLogger(__name__)

# API Metrics
api_request_count = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

api_request_latency = Histogram(
    'api_request_duration_seconds',
    'API request latency in seconds',
    ['method', 'endpoint']
)

# Kafka Metrics
kafka_messages_consumed = Counter(
    'kafka_messages_consumed_total',
    'Total Kafka messages consumed',
    ['topic', 'consumer_group']
)

kafka_consumer_lag = Gauge(
    'kafka_consumer_lag_seconds',
    'Kafka consumer lag in seconds',
    ['topic', 'consumer_group']
)

kafka_messages_produced = Counter(
    'kafka_messages_produced_total',
    'Total Kafka messages produced',
    ['topic']
)

# DVR Metrics
dvr_validations_total = Counter(
    'dvr_validations_total',
    'Total DVR validations performed',
    ['validation_type', 'result']
)

dvr_corrections_total = Counter(
    'dvr_corrections_total',
    'Total DVR corrections made',
    ['correction_type']
)

# RTM Metrics
rtm_anomalies_detected = Counter(
    'rtm_anomalies_detected_total',
    'Total anomalies detected by RTM',
    ['anomaly_type']
)

rtm_prediction_latency = Histogram(
    'rtm_prediction_latency_seconds',
    'RTM prediction latency in seconds'
)

# RTO Metrics
rto_suggestions_generated = Counter(
    'rto_suggestions_generated_total',
    'Total RTO suggestions generated'
)

rto_executions_total = Counter(
    'rto_executions_total',
    'Total RTO control executions',
    ['status']
)

# PdM Metrics
pdm_rul_predictions = Counter(
    'pdm_rul_predictions_total',
    'Total RUL predictions made'
)

# System Metrics
active_connections = Gauge(
    'active_connections',
    'Number of active connections',
    ['connection_type']
)

system_cpu_usage = Gauge(
    'system_cpu_usage_percent',
    'System CPU usage percentage'
)

system_memory_usage = Gauge(
    'system_memory_usage_bytes',
    'System memory usage in bytes'
)


def start_metrics_server(port=8000):
    """Start Prometheus metrics HTTP server."""
    try:
        start_http_server(port)
        logger.info(f"✅ Prometheus metrics server started on port {port}")
    except Exception as e:
        logger.error(f"❌ Failed to start metrics server: {e}")


def record_api_metrics(method, endpoint, status_code, duration):
    """Record API request metrics."""
    api_request_count.labels(method=method, endpoint=endpoint, status=status_code).inc()
    api_request_latency.labels(method=method, endpoint=endpoint).observe(duration)


def record_kafka_consumption(topic, consumer_group):
    """Record Kafka message consumption."""
    kafka_messages_consumed.labels(topic=topic, consumer_group=consumer_group).inc()


def record_kafka_production(topic):
    """Record Kafka message production."""
    kafka_messages_produced.labels(topic=topic).inc()


def record_consumer_lag(topic, consumer_group, lag_seconds):
    """Record Kafka consumer lag."""
    kafka_consumer_lag.labels(topic=topic, consumer_group=consumer_group).set(lag_seconds)


def record_dvr_validation(validation_type, passed):
    """Record DVR validation result."""
    result = "passed" if passed else "failed"
    dvr_validations_total.labels(validation_type=validation_type, result=result).inc()


def record_dvr_correction(correction_type):
    """Record DVR correction."""
    dvr_corrections_total.labels(correction_type=correction_type).inc()


def record_rtm_anomaly(anomaly_type):
    """Record RTM anomaly detection."""
    rtm_anomalies_detected.labels(anomaly_type=anomaly_type).inc()


def record_rtm_prediction_latency(latency_seconds):
    """Record RTM prediction latency."""
    rtm_prediction_latency.observe(latency_seconds)


def record_rto_suggestion():
    """Record RTO suggestion generation."""
    rto_suggestions_generated.inc()


def record_rto_execution(success):
    """Record RTO execution."""
    status = "success" if success else "failed"
    rto_executions_total.labels(status=status).inc()


def record_rul_prediction():
    """Record RUL prediction."""
    pdm_rul_predictions.inc()

