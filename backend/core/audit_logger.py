"""
Audit Trail system for tracking all data changes and control actions.
Implements NF-512 requirement.
"""

import os
import pymysql
from datetime import datetime
from typing import Dict, Optional, Any
import logging
import json

logger = logging.getLogger(__name__)


class AuditLogger:
    """
    Immutable audit log for tracking all data changes and system actions.
    """

    def __init__(self):
        """Initialize audit logger with database connection."""
        self.db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", 3306)),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_DATABASE", "compressor_db"),
        }

    def _get_connection(self):
        """Get database connection."""
        return pymysql.connect(
            host=self.db_config["host"],
            port=self.db_config["port"],
            user=self.db_config["user"],
            password=self.db_config["password"],
            database=self.db_config["database"],
            cursorclass=pymysql.cursors.DictCursor,
        )

    def log_data_change(
        self,
        record_id: str,
        field_name: str,
        original_value: Any,
        corrected_value: Any,
        algorithm_id: str,
        service_name: str,
        reason: Optional[str] = None,
    ) -> bool:
        """
        Log a data change (DVR correction, etc.).
        
        Args:
            record_id: Unique identifier for the record
            field_name: Name of the field that changed
            original_value: Original value before correction
            corrected_value: Corrected value after processing
            algorithm_id: ID of the algorithm that made the change (e.g., "WLS", "Bayesian")
            service_name: Name of the service (e.g., "dvr-consumer")
            reason: Optional reason for the change
            
        Returns:
            True if logged successfully, False otherwise
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO audit_log (
                        record_id, field_name, original_value, corrected_value,
                        algorithm_id, service_name, reason, timestamp
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        record_id,
                        field_name,
                        json.dumps(original_value) if isinstance(original_value, (dict, list)) else str(original_value),
                        json.dumps(corrected_value) if isinstance(corrected_value, (dict, list)) else str(corrected_value),
                        algorithm_id,
                        service_name,
                        reason,
                        datetime.utcnow(),
                    ),
                )
            conn.commit()
            logger.debug(f"Audit log entry created for {record_id}/{field_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to log audit entry: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                conn.close()

    def log_control_action(
        self,
        action_id: str,
        action_type: str,
        user_id: Optional[int],
        username: Optional[str],
        parameter: str,
        old_value: Any,
        new_value: Any,
        status: str,
        reason: Optional[str] = None,
    ) -> bool:
        """
        Log a control action (RTO execution, etc.).
        
        Args:
            action_id: Unique action identifier
            action_type: Type of action (e.g., "RTO_EXECUTION", "MANUAL_ADJUSTMENT")
            user_id: ID of user who initiated the action
            username: Username
            parameter: Parameter that was changed
            old_value: Value before change
            new_value: Value after change
            status: Action status ("approved", "executed", "rejected")
            reason: Optional reason for the action
            
        Returns:
            True if logged successfully, False otherwise
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO audit_log (
                        record_id, field_name, original_value, corrected_value,
                        algorithm_id, service_name, reason, user_id, username, timestamp
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        action_id,
                        parameter,
                        str(old_value),
                        str(new_value),
                        action_type,
                        "control-routes",
                        reason,
                        user_id,
                        username,
                        datetime.utcnow(),
                    ),
                )
            conn.commit()
            logger.info(f"Control action logged: {action_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to log control action: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                conn.close()

    def get_audit_history(
        self,
        record_id: Optional[str] = None,
        service_name: Optional[str] = None,
        limit: int = 100,
    ) -> list:
        """Get audit log history."""
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                query = "SELECT * FROM audit_log WHERE 1=1"
                params = []
                
                if record_id:
                    query += " AND record_id = %s"
                    params.append(record_id)
                
                if service_name:
                    query += " AND service_name = %s"
                    params.append(service_name)
                
                query += " ORDER BY timestamp DESC LIMIT %s"
                params.append(limit)
                
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"Failed to get audit history: {e}")
            return []
        finally:
            if conn:
                conn.close()


# Singleton instance
_audit_logger: Optional[AuditLogger] = None


def get_audit_logger() -> AuditLogger:
    """Get or create audit logger instance."""
    global _audit_logger
    if _audit_logger is None:
        _audit_logger = AuditLogger()
    return _audit_logger

