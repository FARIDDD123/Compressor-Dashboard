"""
Local Database Storage for Edge Computing

Provides SQLite-based local storage for edge operations including sensor data,
alerts, and synchronization queue.
"""

import sqlite3
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)


class LocalDatabase:
    """SQLite database for edge computing local storage."""

    def __init__(self, db_path: Path):
        """
        Initialize the local database.

        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self.conn = None
        self._initialize_database()

    def _initialize_database(self):
        """Create database schema if it doesn't exist."""
        self.conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        self.conn.row_factory = sqlite3.Row  # Enable column access by name

        cursor = self.conn.cursor()

        # Sensor data table (for local storage of sensor readings)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sensor_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME NOT NULL,
                data TEXT NOT NULL,  -- JSON string of sensor data
                validated BOOLEAN DEFAULT 0,
                synced BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Alerts table (for local storage of generated alerts)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME NOT NULL,
                alert_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                message TEXT NOT NULL,
                sensor_data_id INTEGER,
                metadata TEXT,  -- JSON string for additional data
                synced BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sensor_data_id) REFERENCES sensor_data(id)
            )
        """)

        # Sync queue table (for queuing data to sync with cloud)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                record_id INTEGER NOT NULL,
                operation TEXT NOT NULL,  -- INSERT, UPDATE, DELETE
                data TEXT,  -- JSON string of the data
                retry_count INTEGER DEFAULT 0,
                last_attempt DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Edge status table (for tracking edge operations)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS edge_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME NOT NULL,
                cloud_connected BOOLEAN NOT NULL,
                mode TEXT NOT NULL,  -- online, offline, auto
                last_sync DATETIME,
                metrics TEXT,  -- JSON string for metrics
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sensor_data_synced ON sensor_data(synced)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_synced ON alerts(synced)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at)")

        self.conn.commit()
        logger.info(f"✅ Local database initialized at {self.db_path}")

    def insert_sensor_data(self, data: Dict[str, Any], validated: bool = False) -> int:
        """
        Insert sensor data into local storage.

        Args:
            data: Dictionary containing sensor readings
            validated: Whether the data has been validated

        Returns:
            ID of the inserted record
        """
        cursor = self.conn.cursor()
        timestamp = data.get("timestamp", datetime.utcnow().isoformat())

        cursor.execute("""
            INSERT INTO sensor_data (timestamp, data, validated, synced)
            VALUES (?, ?, ?, ?)
        """, (timestamp, json.dumps(data), validated, False))

        record_id = cursor.lastrowid
        self.conn.commit()
        return record_id

    def insert_alert(
        self,
        alert_type: str,
        severity: str,
        message: str,
        sensor_data_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> int:
        """
        Insert an alert into local storage.

        Args:
            alert_type: Type of alert (e.g., 'anomaly', 'validation_error')
            severity: Severity level (e.g., 'critical', 'warning', 'info')
            message: Alert message
            sensor_data_id: Optional reference to sensor data record
            metadata: Optional additional metadata

        Returns:
            ID of the inserted alert
        """
        cursor = self.conn.cursor()
        timestamp = datetime.utcnow().isoformat()

        cursor.execute("""
            INSERT INTO alerts (timestamp, alert_type, severity, message, sensor_data_id, metadata, synced)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            alert_type,
            severity,
            message,
            sensor_data_id,
            json.dumps(metadata) if metadata else None,
            False,
        ))

        record_id = cursor.lastrowid
        self.conn.commit()
        return record_id

    def get_unsynced_sensor_data(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get sensor data that hasn't been synced yet.

        Args:
            limit: Maximum number of records to return

        Returns:
            List of unsynced sensor data records
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, timestamp, data, validated
            FROM sensor_data
            WHERE synced = 0
            ORDER BY timestamp ASC
            LIMIT ?
        """, (limit,))

        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row["id"],
                "timestamp": row["timestamp"],
                "data": json.loads(row["data"]),
                "validated": bool(row["validated"]),
            })
        return results

    def get_unsynced_alerts(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get alerts that haven't been synced yet.

        Args:
            limit: Maximum number of records to return

        Returns:
            List of unsynced alert records
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT id, timestamp, alert_type, severity, message, sensor_data_id, metadata
            FROM alerts
            WHERE synced = 0
            ORDER BY timestamp ASC
            LIMIT ?
        """, (limit,))

        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row["id"],
                "timestamp": row["timestamp"],
                "alert_type": row["alert_type"],
                "severity": row["severity"],
                "message": row["message"],
                "sensor_data_id": row["sensor_data_id"],
                "metadata": json.loads(row["metadata"]) if row["metadata"] else None,
            })
        return results

    def mark_sensor_data_synced(self, record_ids: List[int]):
        """Mark sensor data records as synced."""
        if not record_ids:
            return

        placeholders = ",".join(["?"] * len(record_ids))
        cursor = self.conn.cursor()
        cursor.execute(f"""
            UPDATE sensor_data
            SET synced = 1
            WHERE id IN ({placeholders})
        """, record_ids)
        self.conn.commit()

    def mark_alerts_synced(self, record_ids: List[int]):
        """Mark alert records as synced."""
        if not record_ids:
            return

        placeholders = ",".join(["?"] * len(record_ids))
        cursor = self.conn.cursor()
        cursor.execute(f"""
            UPDATE alerts
            SET synced = 1
            WHERE id IN ({placeholders})
        """, record_ids)
        self.conn.commit()

    def cleanup_old_data(self, retention_hours: int = 168):
        """
        Clean up old data beyond retention period.

        Args:
            retention_hours: Number of hours to retain data
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=retention_hours)
        cursor = self.conn.cursor()

        # Delete old sensor data (only if synced)
        cursor.execute("""
            DELETE FROM sensor_data
            WHERE created_at < ? AND synced = 1
        """, (cutoff_time.isoformat(),))

        # Delete old alerts (only if synced)
        cursor.execute("""
            DELETE FROM alerts
            WHERE created_at < ? AND synced = 1
        """, (cutoff_time.isoformat(),))

        deleted_count = cursor.rowcount
        self.conn.commit()
        logger.info(f"Cleaned up {deleted_count} old records")
        return deleted_count

    def get_recent_sensor_data(self, hours: int = 1, limit: int = 1000) -> List[Dict[str, Any]]:
        """
        Get recent sensor data.

        Args:
            hours: Number of hours to look back
            limit: Maximum number of records to return

        Returns:
            List of recent sensor data records
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        cursor = self.conn.cursor()

        cursor.execute("""
            SELECT id, timestamp, data, validated
            FROM sensor_data
            WHERE timestamp >= ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (cutoff_time.isoformat(), limit))

        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row["id"],
                "timestamp": row["timestamp"],
                "data": json.loads(row["data"]),
                "validated": bool(row["validated"]),
            })
        return results

    def update_edge_status(
        self,
        cloud_connected: bool,
        mode: str,
        last_sync: Optional[datetime] = None,
        metrics: Optional[Dict[str, Any]] = None,
    ):
        """Update edge status information."""
        cursor = self.conn.cursor()
        timestamp = datetime.utcnow().isoformat()

        cursor.execute("""
            INSERT INTO edge_status (timestamp, cloud_connected, mode, last_sync, metrics)
            VALUES (?, ?, ?, ?, ?)
        """, (
            timestamp,
            cloud_connected,
            mode,
            last_sync.isoformat() if last_sync else None,
            json.dumps(metrics) if metrics else None,
        ))

        self.conn.commit()

    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

