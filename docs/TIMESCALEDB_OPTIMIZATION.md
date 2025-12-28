# TimescaleDB Optimization Guide

## Overview

This document describes the TimescaleDB optimization setup for handling high-volume time-series data (10GB/day) with:

- **Multi-node Support**: Distributed TimescaleDB for scalability
- **Data Partitioning**: Hypertables with time-based chunking
- **Compression Policies**: Automatic compression for data older than 90 days
- **Continuous Aggregates**: Pre-computed aggregations for faster queries

## Architecture

### Single-Node Setup (Default)

```
Kafka → TimescaleDB Writer → TimescaleDB (Single Node)
                              ├── Hypertables (chunked by time)
                              ├── Compression (90+ days)
                              └── Continuous Aggregates
```

### Multi-Node Setup (Production)

```
Kafka → TimescaleDB Writer → TimescaleDB Access Node
                              ├── Data Node 1
                              ├── Data Node 2
                              └── Data Node N
```

## Features

### 1. Hypertables (Data Partitioning)

Data is automatically partitioned into chunks by time (1 day intervals) for:
- **Efficient Querying**: Queries only scan relevant chunks
- **Parallel Processing**: Chunks can be processed in parallel
- **Easy Compression**: Compress chunks independently
- **Fast Deletion**: Drop old chunks efficiently

### 2. Compression Policies

Automatic compression for data older than 90 days:
- **Compression Ratio**: Typically 70-90% size reduction
- **Query Performance**: Compressed data queries remain fast
- **Storage Savings**: Critical for 10GB/day data volumes

### 3. Continuous Aggregates

Pre-computed aggregations for common queries:
- **Hourly Averages**: Updated every hour
- **Daily Averages**: Updated daily
- **Faster Dashboards**: Pre-aggregated data for visualization

## Setup

### Basic Setup (Single Node)

1. **Start TimescaleDB**:

```bash
docker-compose up timescaledb
```

2. **Verify Installation**:

```bash
docker exec -it timescaledb psql -U postgres -d digitaltwin -c "\dx"
```

You should see `timescaledb` extension listed.

3. **Check Hypertables**:

```bash
docker exec -it timescaledb psql -U postgres -d digitaltwin -c "\dx+ timescaledb"
```

4. **Start Writer**:

```bash
docker-compose up timescaledb-writer
```

### Configuration

Environment variables (`.env`):

```bash
# TimescaleDB Configuration
TIMESCALEDB_HOST=timescaledb
TIMESCALEDB_PORT=5432
TIMESCALEDB_DATABASE=digitaltwin
TIMESCALEDB_USER=postgres
TIMESCALEDB_PASSWORD=your_password

# Writer Configuration
TIMESCALEDB_BATCH_SIZE=1000  # Batch size for inserts
TIMESCALEDB_FLUSH_INTERVAL=5.0  # Flush interval in seconds

# Database Selection
TIMESERIES_DB_TYPE=timescaledb  # timescaledb, influxdb, or both
USE_UNIFIED_DB_CLIENT=true  # Use unified client
```

## Multi-Node Setup (Production)

### Overview

Multi-node TimescaleDB allows horizontal scaling by distributing data across multiple nodes.

### Setup Steps

1. **Configure Access Node**:

Edit `docker-compose.yml` to set up access node:

```yaml
timescaledb-access:
  image: timescale/timescaledb:latest-pg15
  container_name: timescaledb-access
  environment:
    POSTGRES_DB: digitaltwin
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: your_password
  ports:
    - "5433:5432"
  volumes:
    - ./init/timescaledb_multinode.sql:/docker-entrypoint-initdb.d/multinode.sql:ro
```

2. **Configure Data Nodes**:

```yaml
timescaledb-data1:
  image: timescale/timescaledb:latest-pg15
  container_name: timescaledb-data1
  environment:
    POSTGRES_DB: digitaltwin
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: your_password
  volumes:
    - timescaledb_data1:/var/lib/postgresql/data

timescaledb-data2:
  image: timescale/timescaledb:latest-pg15
  container_name: timescaledb-data2
  environment:
    POSTGRES_DB: digitaltwin
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: your_password
  volumes:
    - timescaledb_data2:/var/lib/postgresql/data
```

3. **Initialize Multi-Node**:

See `scripts/timescaledb_multinode_setup.sql` for SQL commands.

## Data Partitioning

### Chunk Configuration

Default chunk interval: **1 day**

```sql
SELECT create_hypertable('compressor_metrics', 'time', 
    chunk_time_interval => INTERVAL '1 day'
);
```

For different data volumes, adjust chunk interval:
- **High volume (10GB/day)**: 1 day (default)
- **Very high volume**: 6 hours
- **Lower volume**: 1 week

### Manual Chunk Management

```sql
-- List chunks
SELECT * FROM timescaledb_information.chunks 
WHERE hypertable_name = 'compressor_metrics';

-- Drop old chunks manually (if retention policy not used)
SELECT drop_chunks('compressor_metrics', INTERVAL '365 days');
```

## Compression

### Compression Policy

Data older than 90 days is automatically compressed:

```sql
-- Compression is already configured in init script
-- To manually add:
SELECT add_compression_policy('compressor_metrics', INTERVAL '90 days');
```

### Compression Statistics

Query compression statistics:

```sql
SELECT * FROM timescaledb_information.compressed_chunk_stats;
```

Or using Python:

```python
from backend.core.timescaledb_client import TimescaleDBClient

client = TimescaleDBClient()
stats = client.get_compression_stats()
print(stats)
```

### Compression Configuration

Adjust compression settings:

```sql
-- Enable compression
ALTER TABLE compressor_metrics SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'measurement, device_id',
    timescaledb.compress_orderby = 'time DESC'
);
```

**Parameters:**
- `compress_segmentby`: Columns to segment by (for parallel compression)
- `compress_orderby`: Sort order (important for query performance)

## Continuous Aggregates

### Available Aggregates

1. **Hourly Averages** (`compressor_metrics_hourly`):
   - Updated every hour
   - Contains hourly averages of all metrics

2. **Daily Averages** (`compressor_metrics_daily`):
   - Updated daily
   - Contains daily statistics (avg, min, max)

### Querying Aggregates

```sql
-- Query hourly data (much faster than raw data)
SELECT * FROM compressor_metrics_hourly
WHERE bucket >= NOW() - INTERVAL '7 days'
ORDER BY bucket DESC;

-- Query daily data
SELECT * FROM compressor_metrics_daily
WHERE bucket >= NOW() - INTERVAL '30 days'
ORDER BY bucket DESC;
```

### Creating Custom Aggregates

```sql
CREATE MATERIALIZED VIEW compressor_metrics_5min
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('5 minutes', time) AS bucket,
    AVG(pressure_in) AS avg_pressure,
    AVG(temperature_in) AS avg_temp,
    COUNT(*) AS data_points
FROM compressor_metrics
GROUP BY bucket;

-- Add refresh policy
SELECT add_continuous_aggregate_policy('compressor_metrics_5min',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes'
);
```

## Performance Tuning

### Batch Insert Size

For 10GB/day (approximately 115,740 records/second), optimize batch size:

```bash
TIMESCALEDB_BATCH_SIZE=5000  # Larger batches for high volume
TIMESCALEDB_FLUSH_INTERVAL=1.0  # Flush more frequently
```

### Connection Pooling

TimescaleDB client uses connection pooling (default: 1-10 connections).

Adjust in code:

```python
from backend.core.timescaledb_client import TimescaleDBClient

client = TimescaleDBClient(
    min_conn=5,
    max_conn=20  # Increase for high throughput
)
```

### PostgreSQL Tuning

For production, tune PostgreSQL parameters:

```sql
-- In postgresql.conf or via ALTER SYSTEM:
shared_buffers = '4GB'
effective_cache_size = '12GB'
maintenance_work_mem = '2GB'
checkpoint_completion_target = 0.9
wal_buffers = '16MB'
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = '50MB'
min_wal_size = '1GB'
max_wal_size = '4GB'
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

## Monitoring

### Query Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Check chunk sizes
SELECT 
    chunk_name,
    pg_size_pretty(total_bytes) AS size
FROM timescaledb_information.chunks
WHERE hypertable_name = 'compressor_metrics'
ORDER BY total_bytes DESC;
```

### Compression Effectiveness

```sql
-- Compression ratio
SELECT 
    hypertable_name,
    COUNT(*) AS total_chunks,
    SUM(CASE WHEN is_compressed THEN 1 ELSE 0 END) AS compressed_chunks,
    pg_size_pretty(SUM(before_compression_total_bytes)) AS before_size,
    pg_size_pretty(SUM(after_compression_total_bytes)) AS after_size,
    ROUND(100.0 * (1.0 - SUM(after_compression_total_bytes)::numeric / 
          NULLIF(SUM(before_compression_total_bytes), 0)), 2) AS compression_ratio
FROM timescaledb_information.compressed_chunk_stats
GROUP BY hypertable_name;
```

### Data Volume

```sql
-- Check total data size
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Migration from InfluxDB

### Using Unified Client

The system supports writing to both databases simultaneously:

```bash
TIMESERIES_DB_TYPE=both
USE_UNIFIED_DB_CLIENT=true
```

This allows gradual migration while maintaining data in both systems.

### Data Migration Script

See `scripts/migrate_influxdb_to_timescaledb.py` for migration script (to be created if needed).

## Best Practices

1. **Chunk Size**: Keep chunks between 1-4GB uncompressed
2. **Compression**: Enable compression for data older than 90 days
3. **Indexes**: Create indexes on frequently queried columns
4. **Continuous Aggregates**: Use for dashboard queries
5. **Batch Inserts**: Use batch inserts for better performance
6. **Connection Pooling**: Use connection pools for concurrent access
7. **Monitoring**: Regularly monitor compression stats and query performance

## Troubleshooting

### High Memory Usage

- Reduce `batch_size` if experiencing OOM
- Increase PostgreSQL `shared_buffers`
- Monitor connection pool size

### Slow Queries

- Check if query uses indexes
- Use continuous aggregates for historical queries
- Consider adjusting chunk interval

### Compression Not Working

- Verify compression policy is enabled
- Check chunk age (must be older than policy interval)
- Review compression statistics

## References

- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Multi-node Setup](https://docs.timescale.com/timescaledb/latest/how-to-guides/multinode-timescaledb/)
- [Compression](https://docs.timescale.com/timescaledb/latest/how-to-guides/compression/)
- [Continuous Aggregates](https://docs.timescale.com/timescaledb/latest/how-to-guides/continuous-aggregates/)

