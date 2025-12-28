"""
Data Governance routes for data lineage and audit trail access.
"""

import logging
from flask import Blueprint, jsonify, request
from backend.core.auth import require_auth, require_permissions, get_current_user
from backend.core.audit_logger import get_audit_logger
import pymysql
import os

governance_bp = Blueprint("governance", __name__)
logger = logging.getLogger(__name__)


def _get_db_connection():
    """Get database connection."""
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_DATABASE", "compressor_db"),
        cursorclass=pymysql.cursors.DictCursor,
    )


@governance_bp.route("/audit/history", methods=["GET"])
@require_auth
@require_permissions("read")
def get_audit_history():
    """
    Get audit trail history.
    Query parameters: record_id, service_name, limit
    """
    record_id = request.args.get("record_id")
    service_name = request.args.get("service_name")
    limit = request.args.get("limit", 100, type=int)
    
    audit_logger = get_audit_logger()
    history = audit_logger.get_audit_history(
        record_id=record_id,
        service_name=service_name,
        limit=limit,
    )
    
    return jsonify({"audit_history": history}), 200


@governance_bp.route("/lineage/<record_id>", methods=["GET"])
@require_auth
@require_permissions("read")
def get_data_lineage(record_id: str):
    """Get data lineage for a specific record."""
    conn = None
    try:
        conn = _get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM data_lineage WHERE record_id = %s ORDER BY processed_at DESC",
                (record_id,),
            )
            lineage = cursor.fetchall()
            
            if not lineage:
                return jsonify({"error": "No lineage found for record"}), 404
            
            return jsonify({"lineage": lineage}), 200
    except Exception as e:
        logger.error(f"Error getting data lineage: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()


@governance_bp.route("/lineage", methods=["GET"])
@require_auth
@require_permissions("read")
def list_data_lineage():
    """List data lineage entries with filters."""
    source_topic = request.args.get("source_topic")
    processing_service = request.args.get("processing_service")
    limit = request.args.get("limit", 100, type=int)
    
    conn = None
    try:
        conn = _get_db_connection()
        with conn.cursor() as cursor:
            query = "SELECT * FROM data_lineage WHERE 1=1"
            params = []
            
            if source_topic:
                query += " AND source_topic = %s"
                params.append(source_topic)
            
            if processing_service:
                query += " AND processing_service = %s"
                params.append(processing_service)
            
            query += " ORDER BY processed_at DESC LIMIT %s"
            params.append(limit)
            
            cursor.execute(query, params)
            lineage = cursor.fetchall()
            
            return jsonify({"lineage": lineage}), 200
    except Exception as e:
        logger.error(f"Error listing data lineage: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

