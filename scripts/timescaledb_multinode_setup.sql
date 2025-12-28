-- TimescaleDB Multi-node Setup Script
-- Run this on the access node after data nodes are configured

-- Enable TimescaleDB extension on access node
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Add data nodes (replace with actual node addresses)
-- Data node 1
SELECT add_data_node('data1', 
    host => 'timescaledb-data1',
    port => 5432,
    database => 'digitaltwin',
    if_not_exists => TRUE
);

-- Data node 2
SELECT add_data_node('data2',
    host => 'timescaledb-data2',
    port => 5432,
    database => 'digitaltwin',
    if_not_exists => TRUE
);

-- Verify data nodes
SELECT * FROM timescaledb_information.data_nodes;

-- Create distributed hypertable (if not already created)
-- Note: This assumes compressor_metrics table already exists
-- If not, create it first using timescaledb_init.sql

-- Convert to distributed hypertable
-- SELECT create_distributed_hypertable('compressor_metrics', 'time',
--     chunk_time_interval => INTERVAL '1 day',
--     data_nodes => ARRAY['data1', 'data2']
-- );

-- Add replication factor (optional, for high availability)
-- ALTER TABLE compressor_metrics SET (timescaledb.replication_factor = 2);

-- Verify distributed hypertable
-- SELECT * FROM timescaledb_information.hypertables WHERE hypertable_name = 'compressor_metrics';

