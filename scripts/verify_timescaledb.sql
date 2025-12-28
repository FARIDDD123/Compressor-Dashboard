-- Verification script for TimescaleDB setup
-- Run this to verify that TimescaleDB is properly configured

-- Check TimescaleDB extension
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- List all hypertables
SELECT * FROM timescaledb_information.hypertables;

-- List chunks for compressor_metrics
SELECT 
    chunk_name,
    range_start,
    range_end,
    pg_size_pretty(total_bytes) AS size,
    is_compressed
FROM timescaledb_information.chunks
WHERE hypertable_name = 'compressor_metrics'
ORDER BY range_start DESC
LIMIT 10;

-- Check compression policies
SELECT 
    hypertable_name,
    config->>'compress_after' AS compress_after,
    scheduled
FROM timescaledb_information.jobs
WHERE proc_name = 'policy_compression';

-- Check compression statistics
SELECT 
    hypertable_name,
    COUNT(*) AS total_chunks,
    SUM(CASE WHEN is_compressed THEN 1 ELSE 0 END) AS compressed_chunks,
    pg_size_pretty(SUM(before_compression_total_bytes)) AS before_size,
    pg_size_pretty(SUM(after_compression_total_bytes)) AS after_size,
    ROUND(100.0 * (1.0 - SUM(after_compression_total_bytes)::numeric / 
          NULLIF(SUM(before_compression_total_bytes), 0)), 2) AS compression_ratio_percent
FROM timescaledb_information.compressed_chunk_stats
GROUP BY hypertable_name;

-- Check continuous aggregates
SELECT * FROM timescaledb_information.continuous_aggregates;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

