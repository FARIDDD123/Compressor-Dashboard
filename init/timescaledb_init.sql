-- TimescaleDB Initialization Script
-- Creates hypertables, compression policies, and retention policies

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create sensor data hypertable (partitioned by time)
CREATE TABLE IF NOT EXISTS compressor_metrics (
    time TIMESTAMPTZ NOT NULL,
    measurement TEXT NOT NULL DEFAULT 'compressor_metrics',
    
    -- Sensor readings
    pressure_in DOUBLE PRECISION,
    temperature_in DOUBLE PRECISION,
    flow_rate DOUBLE PRECISION,
    pressure_out DOUBLE PRECISION,
    temperature_out DOUBLE PRECISION,
    vibration DOUBLE PRECISION,
    efficiency DOUBLE PRECISION,
    power_consumption DOUBLE PRECISION,
    rpm DOUBLE PRECISION,
    torque DOUBLE PRECISION,
    ambient_temp DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    air_pollution DOUBLE PRECISION,
    frequency DOUBLE PRECISION,
    amplitude DOUBLE PRECISION,
    phase_angle DOUBLE PRECISION,
    velocity DOUBLE PRECISION,
    stiffness DOUBLE PRECISION,
    
    -- Tags/Metadata
    device_id TEXT,
    status TEXT,
    validated BOOLEAN DEFAULT false,
    
    -- Data lineage
    data_source TEXT,
    processing_stage TEXT,
    
    PRIMARY KEY (time, measurement)
);

-- Convert to hypertable with 1 day chunk interval
-- This partitions data by time for efficient querying and compression
SELECT create_hypertable('compressor_metrics', 'time', 
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_compressor_metrics_time_desc 
    ON compressor_metrics (time DESC);

CREATE INDEX IF NOT EXISTS idx_compressor_metrics_device_id 
    ON compressor_metrics (device_id) WHERE device_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_compressor_metrics_status 
    ON compressor_metrics (status) WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_compressor_metrics_validated 
    ON compressor_metrics (validated, time DESC);

-- Create validated data hypertable (for DVR output)
CREATE TABLE IF NOT EXISTS compressor_metrics_validated (
    time TIMESTAMPTZ NOT NULL,
    measurement TEXT NOT NULL DEFAULT 'compressor_metrics_validated',
    
    -- Same fields as compressor_metrics
    pressure_in DOUBLE PRECISION,
    temperature_in DOUBLE PRECISION,
    flow_rate DOUBLE PRECISION,
    pressure_out DOUBLE PRECISION,
    temperature_out DOUBLE PRECISION,
    vibration DOUBLE PRECISION,
    efficiency DOUBLE PRECISION,
    power_consumption DOUBLE PRECISION,
    rpm DOUBLE PRECISION,
    torque DOUBLE PRECISION,
    ambient_temp DOUBLE PRECISION,
    humidity DOUBLE PRECISION,
    air_pollution DOUBLE PRECISION,
    frequency DOUBLE PRECISION,
    amplitude DOUBLE PRECISION,
    phase_angle DOUBLE PRECISION,
    velocity DOUBLE PRECISION,
    stiffness DOUBLE PRECISION,
    
    device_id TEXT,
    status TEXT,
    validation_score DOUBLE PRECISION,
    correction_applied BOOLEAN DEFAULT false,
    
    PRIMARY KEY (time, measurement)
);

SELECT create_hypertable('compressor_metrics_validated', 'time',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Create indexes for validated data
CREATE INDEX IF NOT EXISTS idx_validated_time_desc 
    ON compressor_metrics_validated (time DESC);

-- Create prediction logs hypertable
CREATE TABLE IF NOT EXISTS prediction_logs (
    time TIMESTAMPTZ NOT NULL,
    model_version TEXT NOT NULL,
    model_type TEXT NOT NULL,  -- 'rtm', 'pdm', 'rto'
    input_data JSONB,
    prediction_result JSONB,
    latency_ms DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    
    PRIMARY KEY (time, model_version, model_type)
);

SELECT create_hypertable('prediction_logs', 'time',
    chunk_time_interval => INTERVAL '7 days',  -- Larger chunks for logs
    if_not_exists => TRUE
);

CREATE INDEX IF NOT EXISTS idx_prediction_logs_model 
    ON prediction_logs (model_type, time DESC);

-- ============================================
-- COMPRESSION POLICIES
-- ============================================

-- Enable compression on compressor_metrics hypertable
-- Set compression settings: segmentby and orderby
ALTER TABLE compressor_metrics SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'measurement,device_id',
    timescaledb.compress_orderby = 'time DESC'
);

-- Add compression policy: compress chunks older than 90 days
-- This will automatically compress chunks once they are older than 90 days
SELECT add_compression_policy('compressor_metrics', 
    INTERVAL '90 days',
    if_not_exists => TRUE
);

-- Enable compression on validated metrics
ALTER TABLE compressor_metrics_validated SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'measurement,device_id',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('compressor_metrics_validated',
    INTERVAL '90 days',
    if_not_exists => TRUE
);

-- Enable compression on prediction logs
ALTER TABLE prediction_logs SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'model_type,model_version',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('prediction_logs',
    INTERVAL '90 days',
    if_not_exists => TRUE
);

-- ============================================
-- RETENTION POLICIES (Optional)
-- ============================================

-- Optional: Add retention policy to automatically drop data older than 1 year
-- Uncomment if you want automatic data cleanup
-- SELECT add_retention_policy('compressor_metrics', INTERVAL '365 days', if_not_exists => TRUE);
-- SELECT add_retention_policy('compressor_metrics_validated', INTERVAL '365 days', if_not_exists => TRUE);
-- SELECT add_retention_policy('prediction_logs', INTERVAL '730 days', if_not_exists => TRUE);

-- ============================================
-- CONTINUOUS AGGREGATES (Optional, for performance)
-- ============================================

-- Create continuous aggregate for hourly averages (for faster queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS compressor_metrics_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', time) AS bucket,
    measurement,
    device_id,
    AVG(pressure_in) AS avg_pressure_in,
    AVG(temperature_in) AS avg_temperature_in,
    AVG(flow_rate) AS avg_flow_rate,
    AVG(pressure_out) AS avg_pressure_out,
    AVG(vibration) AS avg_vibration,
    AVG(efficiency) AS avg_efficiency,
    AVG(power_consumption) AS avg_power,
    COUNT(*) AS data_points
FROM compressor_metrics
GROUP BY bucket, measurement, device_id
WITH NO DATA;

-- Add refresh policy: refresh every hour
SELECT add_continuous_aggregate_policy('compressor_metrics_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE
);

-- Create continuous aggregate for daily averages
CREATE MATERIALIZED VIEW IF NOT EXISTS compressor_metrics_daily
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS bucket,
    measurement,
    device_id,
    AVG(pressure_in) AS avg_pressure_in,
    AVG(temperature_in) AS avg_temperature_in,
    AVG(flow_rate) AS avg_flow_rate,
    AVG(pressure_out) AS avg_pressure_out,
    AVG(vibration) AS avg_vibration,
    AVG(efficiency) AS avg_efficiency,
    AVG(power_consumption) AS avg_power,
    MIN(efficiency) AS min_efficiency,
    MAX(efficiency) AS max_efficiency,
    COUNT(*) AS data_points
FROM compressor_metrics
GROUP BY bucket, measurement, device_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('compressor_metrics_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- ============================================
-- FUNCTIONS FOR QUERYING
-- ============================================

-- Function to get latest data points
CREATE OR REPLACE FUNCTION get_latest_metrics(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    time TIMESTAMPTZ,
    pressure_in DOUBLE PRECISION,
    temperature_in DOUBLE PRECISION,
    flow_rate DOUBLE PRECISION,
    vibration DOUBLE PRECISION,
    efficiency DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.time,
        cm.pressure_in,
        cm.temperature_in,
        cm.flow_rate,
        cm.vibration,
        cm.efficiency
    FROM compressor_metrics cm
    ORDER BY cm.time DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT EXECUTE ON FUNCTION get_latest_metrics TO your_user;

