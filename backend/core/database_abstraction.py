"""
Database Abstraction Layer

Provides unified interface for both InfluxDB and TimescaleDB,
allowing seamless switching between time-series databases.
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class DatabaseType(Enum):
    """Supported database types."""
    INFLUXDB = "influxdb"
    TIMESCALEDB = "timescaledb"
    BOTH = "both"  # Write to both databases


class DatabaseAdapter:
    """
    Abstract base class for database adapters.
    """

    def insert_sensor_data(self, data: Dict[str, Any], validated: bool = False) -> bool:
        """Insert sensor data."""
        raise NotImplementedError

    def get_latest_data(self, limit: int = 100, device_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get latest data."""
        raise NotImplementedError

    def get_data_range(
        self, start_time: datetime, end_time: datetime, device_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get data in time range."""
        raise NotImplementedError


class InfluxDBAdapter(DatabaseAdapter):
    """Adapter for InfluxDB."""

    def __init__(self):
        """Initialize InfluxDB adapter."""
        from influxdb_client import InfluxDBClient, Point
        from influxdb_client.client.write_api import SYNCHRONOUS

        self.url = os.getenv("INFLUXDB_URL")
        self.token = os.getenv("INFLUXDB_TOKEN")
        self.org = os.getenv("INFLUXDB_ORG")
        self.bucket = os.getenv("INFLUXDB_BUCKET")
        
        self.client = InfluxDBClient(url=self.url, token=self.token, org=self.org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()

    def insert_sensor_data(self, data: Dict[str, Any], validated: bool = False) -> bool:
        """Insert sensor data into InfluxDB."""
        try:
            timestamp = data.get("timestamp") or data.get("Timestamp") or datetime.utcnow()
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

            bucket_name = self.bucket
            if validated:
                bucket_name = os.getenv("INFLUXDB_BUCKET_VALIDATED", f"{self.bucket}-validated")

            point = Point("compressor_metrics").time(timestamp)
            
            # Add fields
            field_mapping = {
                "Pressure_In": "pressure_in",
                "Temperature_In": "temperature_in",
                "Flow_Rate": "flow_rate",
                "Pressure_Out": "pressure_out",
                "Temperature_Out": "temperature_out",
                "Vibration": "vibration",
                "Efficiency": "efficiency",
                "Power_Consumption": "power_consumption",
                "Power": "power_consumption",
                "RPM": "rpm",
                "Torque": "torque",
                "Ambient_Temp": "ambient_temp",
                "Humidity": "humidity",
                "Air_Pollution": "air_pollution",
            }

            for key, value in data.items():
                if key in field_mapping and value is not None:
                    point = point.field(field_mapping[key], value)
                elif isinstance(value, (int, float)) and key not in ["timestamp", "Timestamp"]:
                    point = point.field(key.lower(), value)

            # Add tags
            if data.get("device_id") or data.get("_device_id"):
                point = point.tag("device_id", data.get("device_id") or data.get("_device_id"))
            if data.get("status") or data.get("Status"):
                point = point.tag("status", data.get("status") or data.get("Status"))

            self.write_api.write(bucket=bucket_name, record=point)
            return True

        except Exception as e:
            logger.error(f"Error inserting to InfluxDB: {e}", exc_info=True)
            return False

    def get_latest_data(self, limit: int = 100, device_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get latest data from InfluxDB."""
        try:
            query = f'''
                from(bucket: "{self.bucket}")
                |> range(start: 0)
                |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
                {"|> filter(fn: (r) => r[\"device_id\"] == \"" + device_id + "\")" if device_id else ""}
                |> sort(columns: ["_time"], desc: true)
                |> limit(n: {limit})
            '''

            tables = self.query_api.query(query, org=self.org)
            results = []
            for table in tables:
                for record in table.records:
                    results.append({
                        "time": record.get_time().isoformat(),
                        "field": record.get_field(),
                        "value": record.get_value(),
                    })
            return results

        except Exception as e:
            logger.error(f"Error querying InfluxDB: {e}", exc_info=True)
            return []

    def get_data_range(
        self, start_time: datetime, end_time: datetime, device_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get data range from InfluxDB."""
        try:
            query = f'''
                from(bucket: "{self.bucket}")
                |> range(start: {start_time.isoformat()}, stop: {end_time.isoformat()})
                |> filter(fn: (r) => r["_measurement"] == "compressor_metrics")
                {"|> filter(fn: (r) => r[\"device_id\"] == \"" + device_id + "\")" if device_id else ""}
                |> sort(columns: ["_time"])
            '''

            tables = self.query_api.query(query, org=self.org)
            results = []
            for table in tables:
                for record in table.records:
                    results.append({
                        "time": record.get_time().isoformat(),
                        "field": record.get_field(),
                        "value": record.get_value(),
                    })
            return results

        except Exception as e:
            logger.error(f"Error querying InfluxDB: {e}", exc_info=True)
            return []

    def close(self):
        """Close InfluxDB client."""
        if self.client:
            self.client.close()


class TimescaleDBAdapter(DatabaseAdapter):
    """Adapter for TimescaleDB."""

    def __init__(self):
        """Initialize TimescaleDB adapter."""
        from backend.core.timescaledb_client import TimescaleDBClient
        self.client = TimescaleDBClient()

    def insert_sensor_data(self, data: Dict[str, Any], validated: bool = False) -> bool:
        """Insert sensor data into TimescaleDB."""
        return self.client.insert_sensor_data(data, validated=validated)

    def get_latest_data(self, limit: int = 100, device_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get latest data from TimescaleDB."""
        return self.client.get_latest_data(limit=limit, device_id=device_id)

    def get_data_range(
        self, start_time: datetime, end_time: datetime, device_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get data range from TimescaleDB."""
        return self.client.get_data_range(start_time, end_time, device_id=device_id)

    def close(self):
        """Close TimescaleDB client."""
        if self.client:
            self.client.close()


class UnifiedDatabaseClient:
    """
    Unified database client that supports both InfluxDB and TimescaleDB.
    """

    def __init__(self, db_type: DatabaseType = None):
        """
        Initialize unified database client.

        Args:
            db_type: Database type to use (defaults to env var or TIMESCALEDB)
        """
        if db_type is None:
            db_type_str = os.getenv("TIMESERIES_DB_TYPE", "timescaledb").lower()
            db_type = DatabaseType[db_type_str.upper()] if hasattr(DatabaseType, db_type_str.upper()) else DatabaseType.TIMESCALEDB

        self.db_type = db_type
        self.influx_adapter: Optional[InfluxDBAdapter] = None
        self.timescale_adapter: Optional[TimescaleDBAdapter] = None

        if db_type in [DatabaseType.INFLUXDB, DatabaseType.BOTH]:
            try:
                self.influx_adapter = InfluxDBAdapter()
                logger.info("✅ InfluxDB adapter initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize InfluxDB adapter: {e}")

        if db_type in [DatabaseType.TIMESCALEDB, DatabaseType.BOTH]:
            try:
                self.timescale_adapter = TimescaleDBAdapter()
                logger.info("✅ TimescaleDB adapter initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize TimescaleDB adapter: {e}")

    def insert_sensor_data(self, data: Dict[str, Any], validated: bool = False) -> bool:
        """
        Insert sensor data into configured database(s).

        Returns:
            True if at least one insert succeeded
        """
        success = False

        if self.influx_adapter:
            try:
                if self.influx_adapter.insert_sensor_data(data, validated):
                    success = True
            except Exception as e:
                logger.error(f"InfluxDB insert failed: {e}")

        if self.timescale_adapter:
            try:
                if self.timescale_adapter.insert_sensor_data(data, validated):
                    success = True
            except Exception as e:
                logger.error(f"TimescaleDB insert failed: {e}")

        return success

    def get_latest_data(self, limit: int = 100, device_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get latest data from configured database.

        Prefers TimescaleDB if both are available.
        """
        if self.timescale_adapter:
            try:
                return self.timescale_adapter.get_latest_data(limit, device_id)
            except Exception as e:
                logger.error(f"TimescaleDB query failed: {e}")

        if self.influx_adapter:
            try:
                return self.influx_adapter.get_latest_data(limit, device_id)
            except Exception as e:
                logger.error(f"InfluxDB query failed: {e}")

        return []

    def get_data_range(
        self, start_time: datetime, end_time: datetime, device_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get data range from configured database."""
        if self.timescale_adapter:
            try:
                return self.timescale_adapter.get_data_range(start_time, end_time, device_id)
            except Exception as e:
                logger.error(f"TimescaleDB query failed: {e}")

        if self.influx_adapter:
            try:
                return self.influx_adapter.get_data_range(start_time, end_time, device_id)
            except Exception as e:
                logger.error(f"InfluxDB query failed: {e}")

        return []

    def close(self):
        """Close all database connections."""
        if self.influx_adapter:
            self.influx_adapter.close()
        if self.timescale_adapter:
            self.timescale_adapter.close()

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

