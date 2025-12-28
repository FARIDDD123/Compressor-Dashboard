# TimescaleDB Optimization - راهنمای سریع

## خلاصه

سیستم اکنون از **TimescaleDB** برای بهینه‌سازی ذخیره‌سازی داده‌های time-series با حجم بالا (10GB/day) استفاده می‌کند.

## ویژگی‌های پیاده‌سازی شده

✅ **Data Partitioning**: Hypertables با chunk interval 1 روز
✅ **Compression Policies**: فشرده‌سازی خودکار برای داده‌های قدیمی‌تر از 90 روز
✅ **Multi-node Support**: پشتیبانی از Multi-node برای scalability
✅ **Continuous Aggregates**: Pre-computed aggregations برای queryهای سریع‌تر
✅ **Database Abstraction**: Unified client برای استفاده از InfluxDB یا TimescaleDB

## نصب و راه‌اندازی

### 1. راه‌اندازی TimescaleDB

```bash
# Start TimescaleDB
docker-compose up timescaledb

# Start TimescaleDB Writer
docker-compose up timescaledb-writer
```

### 2. تنظیمات (.env)

```bash
# TimescaleDB Configuration
TIMESCALEDB_HOST=timescaledb
TIMESCALEDB_PORT=5432
TIMESCALEDB_DATABASE=digitaltwin
TIMESCALEDB_USER=postgres
TIMESCALEDB_PASSWORD=your_password

# Writer Configuration
TIMESCALEDB_BATCH_SIZE=1000
TIMESCALEDB_FLUSH_INTERVAL=5.0

# Database Selection
TIMESERIES_DB_TYPE=timescaledb  # یا "influxdb" یا "both"
```

## Data Partitioning

داده‌ها به صورت خودکار به **chunks** تقسیم می‌شوند:
- **Chunk Interval**: 1 روز (قابل تنظیم)
- **Benefits**: Queryهای سریع‌تر، فشرده‌سازی آسان‌تر

## Compression Policy

- داده‌های **قدیمی‌تر از 90 روز** به صورت خودکار فشرده می‌شوند
- **Compression Ratio**: معمولاً 70-90% کاهش حجم
- **Performance**: Queryها همچنان سریع هستند

## Multi-Node Setup (Production)

برای production با حجم بالا، می‌توانید Multi-node را فعال کنید:

1. Uncomment کردن data nodes در `docker-compose.yml`
2. اجرای `scripts/timescaledb_multinode_setup.sql` روی access node

## Query Performance

استفاده از Continuous Aggregates برای queryهای سریع‌تر:

```sql
-- Query hourly aggregates (خیلی سریع‌تر از raw data)
SELECT * FROM compressor_metrics_hourly
WHERE bucket >= NOW() - INTERVAL '7 days';

-- Query daily aggregates
SELECT * FROM compressor_metrics_daily
WHERE bucket >= NOW() - INTERVAL '30 days';
```

## استفاده در کد

```python
from backend.core.database_abstraction import UnifiedDatabaseClient, DatabaseType

# استفاده از TimescaleDB
client = UnifiedDatabaseClient(db_type=DatabaseType.TIMESCALEDB)

# Insert data
client.insert_sensor_data(sensor_data, validated=False)

# Query latest data
latest = client.get_latest_data(limit=100)

# Query time range
from datetime import datetime, timedelta
start = datetime.utcnow() - timedelta(days=7)
end = datetime.utcnow()
data = client.get_data_range(start, end)
```

## Monitoring

### Compression Stats

```python
from backend.core.timescaledb_client import TimescaleDBClient

client = TimescaleDBClient()
stats = client.get_compression_stats()
print(f"Compression ratio: {stats}")
```

### SQL Queries

```sql
-- Check chunk sizes
SELECT chunk_name, pg_size_pretty(total_bytes) AS size
FROM timescaledb_information.chunks
WHERE hypertable_name = 'compressor_metrics';

-- Compression statistics
SELECT * FROM timescaledb_information.compressed_chunk_stats;
```

## Migration از InfluxDB

برای migration تدریجی:

```bash
TIMESERIES_DB_TYPE=both  # Write به هر دو database
```

این امکان را می‌دهد که داده‌ها را در هر دو سیستم نگه دارید تا migration کامل شود.

## Performance Tuning

برای 10GB/day:

```bash
# Larger batches
TIMESCALEDB_BATCH_SIZE=5000

# More frequent flushing
TIMESCALEDB_FLUSH_INTERVAL=1.0
```

## مستندات کامل

برای اطلاعات بیشتر، مستندات کامل را ببینید:
- [docs/TIMESCALEDB_OPTIMIZATION.md](docs/TIMESCALEDB_OPTIMIZATION.md)

## Troubleshooting

### Compression کار نمی‌کند
- بررسی کنید که chunks بیشتر از 90 روز سن دارند
- Policy را verify کنید: `SELECT * FROM timescaledb_information.jobs;`

### Performance پایین
- Batch size را افزایش دهید
- از Continuous Aggregates استفاده کنید
- Connection pool size را بررسی کنید

### Connection errors
- بررسی کنید TimescaleDB container در حال اجرا است
- Credentials را در .env بررسی کنید

