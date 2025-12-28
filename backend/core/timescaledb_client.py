"""
TimescaleDB Client

Provides client interface for TimescaleDB with support for:
- Hypertables (partitioned by time)
- Compression policies
- Continuous aggregates
- Efficient time-series queries
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from contextlib import contextmanager
import json

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor, execute_values
    from psycopg2.pool import SimpleConnectionPool
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False
    logging.warning("psycopg2 not installed. TimescaleDB support will be disabled.")

logger = logging.getLogger(__name__)


class TimescaleDBClient:
    """
    TimescaleDB client for time-series data operations.
    
    Features:
    - Connection pooling
    - Hypertable operations
    - Compression policy management
    - Efficient time-series queries
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: int = 5432,
        database: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        min_conn: int = 1,
        max_conn: int = 10,
    ):
        """
        Initialize TimescaleDB client.

        Args:
            host: Database host
            port: Database port
            database: Database name
            user: Username
            password: Password
            min_conn: Minimum connections in pool
            max_conn: Maximum connections in pool
        """
        self.host = host or os.getenv("TIMESCALEDB_HOST", "localhost")
        self.port = port or int(os.getenv("TIMESCALEDB_PORT", "5432"))
        self.database = database or os.getenv("TIMESCALEDB_DATABASE", "digitaltwin")
        self.user = user or os.getenv("TIMESCALEDB_USER", "postgres")
        self.password = password or os.getenv("TIMESCALEDB_PASSWORD", "postgres")
        
        self.pool: Optional[SimpleConnectionPool] = None
        self._create_pool(min_conn, max_conn)

    def _create_pool(self, min_conn: int, max_conn: int):
        """Create connection pool."""
        if not PSYCOPG2_AVAILABLE:
            raise ImportError("psycopg2 is required for TimescaleDB support. Install with: pip install psycopg2-binary")
        
        try:
            self.pool = SimpleConnectionPool(
                minconn=min_conn,
                maxconn=max_conn,
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
            )
            logger.info(f"✅ TimescaleDB connection pool created: {self.database}@{self.host}:{self.port}")
        except Exception as e:
            logger.error(f"❌ Failed to create TimescaleDB connection pool: {e}")
            self.pool = None

    @contextmanager
    def get_connection(self):
        """Get connection from pool (context manager)."""
        if not self.pool:
            raise ConnectionError("Connection pool not initialized")
        
        conn = self.pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            self.pool.putconn(conn)

    def insert_sensor_data(
        self,
        data: Dict[str, Any],
        table: str = "compressor_metrics",
        validated: bool = False,
    ) -> bool:
        """
        Insert sensor data into TimescaleDB hypertable.

        Args:
            data: Sensor data dictionary
            table: Table name (default: compressor_metrics)
            validated: Whether data is validated (determines table)

        Returns:
            True if successful, False otherwise
        """
        if validated:
            table = "compressor_metrics_validated"

        try:
            timestamp = data.get("timestamp") or data.get("Timestamp") or datetime.utcnow()
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    insert_sql = f"""
                        INSERT INTO {table} (
                            time, measurement, device_id, status, validated,
                            pressure_in, temperature_in, flow_rate,
                            pressure_out, temperature_out, vibration,
                            efficiency, power_consumption, rpm, torque,
                            ambient_temp, humidity, air_pollution,
                            frequency, amplitude, phase_angle, velocity, stiffness,
                            data_source, processing_stage
                        ) VALUES (
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s, %s, %s
                        )
                    """
                    
                    cur.execute(insert_sql, (
                        timestamp,
                        data.get("measurement", "compressor_metrics"),
                        data.get("device_id") or data.get("_device_id"),
                        data.get("status") or data.get("Status"),
                        validated,
                        data.get("Pressure_In") or data.get("pressure_in"),
                        data.get("Temperature_In") or data.get("temperature_in"),
                        data.get("Flow_Rate") or data.get("flow_rate"),
                        data.get("Pressure_Out") or data.get("pressure_out"),
                        data.get("Temperature_Out") or data.get("temperature_out"),
                        data.get("Vibration") or data.get("vibration"),
                        data.get("Efficiency") or data.get("efficiency"),
                        data.get("Power") or data.get("Power_Consumption") or data.get("power_consumption"),
                        data.get("RPM") or data.get("rpm"),
                        data.get("Torque") or data.get("torque"),
                        data.get("Ambient_Temp") or data.get("ambient_temp"),
                        data.get("Humidity") or data.get("humidity"),
                        data.get("Air_Pollution") or data.get("air_pollution"),
                        data.get("Frequency") or data.get("frequency"),
                        data.get("Amplitude") or data.get("amplitude"),
                        data.get("Phase_Angle") or data.get("phase_angle"),
                        data.get("Velocity") or data.get("velocity"),
                        data.get("Stiffness") or data.get("stiffness"),
                        data.get("_protocol") or data.get("_data_source"),
                        data.get("_processing_stage"),
                    ))
                    
                    logger.debug(f"Inserted sensor data into {table}")
                    return True

        except Exception as e:
            logger.error(f"Error inserting sensor data: {e}", exc_info=True)
            return False

    def insert_batch(
        self,
        data_list: List[Dict[str, Any]],
        table: str = "compressor_metrics",
        validated: bool = False,
    ) -> int:
        """
        Insert multiple sensor data records in batch.

        Args:
            data_list: List of sensor data dictionaries
            table: Table name
            validated: Whether data is validated

        Returns:
            Number of inserted records
        """
        if validated:
            table = "compressor_metrics_validated"

        if not data_list:
            return 0

        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Prepare data tuples
                    values = []
                    for data in data_list:
                        timestamp = data.get("timestamp") or data.get("Timestamp") or datetime.utcnow()
                        if isinstance(timestamp, str):
                            timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

                        values.append((
                            timestamp,
                            data.get("measurement", "compressor_metrics"),
                            data.get("device_id") or data.get("_device_id"),
                            data.get("status") or data.get("Status"),
                            validated,
                            data.get("Pressure_In") or data.get("pressure_in"),
                            data.get("Temperature_In") or data.get("temperature_in"),
                            data.get("Flow_Rate") or data.get("flow_rate"),
                            data.get("Pressure_Out") or data.get("pressure_out"),
                            data.get("Temperature_Out") or data.get("temperature_out"),
                            data.get("Vibration") or data.get("vibration"),
                            data.get("Efficiency") or data.get("efficiency"),
                            data.get("Power") or data.get("Power_Consumption") or data.get("power_consumption"),
                            data.get("RPM") or data.get("rpm"),
                            data.get("Torque") or data.get("torque"),
                            data.get("Ambient_Temp") or data.get("ambient_temp"),
                            data.get("Humidity") or data.get("humidity"),
                            data.get("Air_Pollution") or data.get("air_pollution"),
                            data.get("Frequency") or data.get("frequency"),
                            data.get("Amplitude") or data.get("amplitude"),
                            data.get("Phase_Angle") or data.get("phase_angle"),
                            data.get("Velocity") or data.get("velocity"),
                            data.get("Stiffness") or data.get("stiffness"),
                            data.get("_protocol") or data.get("_data_source"),
                            data.get("_processing_stage"),
                        ))

                    insert_sql = f"""
                        INSERT INTO {table} (
                            time, measurement, device_id, status, validated,
                            pressure_in, temperature_in, flow_rate,
                            pressure_out, temperature_out, vibration,
                            efficiency, power_consumption, rpm, torque,
                            ambient_temp, humidity, air_pollution,
                            frequency, amplitude, phase_angle, velocity, stiffness,
                            data_source, processing_stage
                        ) VALUES %s
                    """

                    execute_values(cur, insert_sql, values)
                    inserted_count = len(values)
                    logger.info(f"Inserted {inserted_count} records into {table} in batch")
                    return inserted_count

        except Exception as e:
            logger.error(f"Error in batch insert: {e}", exc_info=True)
            return 0

    def get_latest_data(
        self,
        limit: int = 100,
        table: str = "compressor_metrics",
        device_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get latest sensor data points.

        Args:
            limit: Number of records to return
            table: Table name
            device_id: Optional device ID filter

        Returns:
            List of data records
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = f"""
                        SELECT * FROM {table}
                        WHERE device_id = COALESCE(%s, device_id)
                        ORDER BY time DESC
                        LIMIT %s
                    """
                    cur.execute(query, (device_id, limit))
                    results = cur.fetchall()
                    return [dict(row) for row in results]

        except Exception as e:
            logger.error(f"Error getting latest data: {e}", exc_info=True)
            return []

    def get_data_range(
        self,
        start_time: datetime,
        end_time: datetime,
        table: str = "compressor_metrics",
        device_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Get data within a time range.

        Args:
            start_time: Start timestamp
            end_time: End timestamp
            table: Table name
            device_id: Optional device ID filter

        Returns:
            List of data records
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = f"""
                        SELECT * FROM {table}
                        WHERE time >= %s AND time <= %s
                        AND device_id = COALESCE(%s, device_id)
                        ORDER BY time ASC
                    """
                    cur.execute(query, (start_time, end_time, device_id))
                    results = cur.fetchall()
                    return [dict(row) for row in results]

        except Exception as e:
            logger.error(f"Error getting data range: {e}", exc_info=True)
            return []

    def get_compression_stats(self) -> Dict[str, Any]:
        """
        Get compression statistics for hypertables.

        Returns:
            Dictionary with compression statistics
        """
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = """
                        SELECT 
                            schemaname,
                            tablename,
                            pg_size_pretty(before_compression_total_bytes) AS before_compression,
                            pg_size_pretty(after_compression_total_bytes) AS after_compression,
                            ROUND(
                                100.0 * (1.0 - after_compression_total_bytes::numeric / 
                                NULLIF(before_compression_total_bytes, 0)), 2
                            ) AS compression_ratio_percent
                        FROM timescaledb_information.compressed_chunk_stats
                        ORDER BY before_compression_total_bytes DESC
                    """
                    cur.execute(query)
                    results = cur.fetchall()
                    return {
                        "compressed_chunks": [dict(row) for row in results],
                        "total_chunks": len(results),
                    }

        except Exception as e:
            logger.error(f"Error getting compression stats: {e}", exc_info=True)
            return {}

    def close(self):
        """Close connection pool."""
        if self.pool:
            self.pool.closeall()
            logger.info("TimescaleDB connection pool closed")

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

