# backend/api/routes/control_routes.py

import logging
import asyncio
import uuid
from flask import Blueprint, jsonify, request, g
from backend.core.auth import require_auth, require_permissions, get_current_user
from backend.opcua.opcua_client import OPCUAClient, OPCUAControlExecutor
from backend.core.audit_logger import get_audit_logger

control_bp = Blueprint("control_routes", __name__)
logger = logging.getLogger(__name__)

# Initialize OPC-UA components (singleton pattern)
_opcua_client: OPCUAClient = None
_control_executor: OPCUAControlExecutor = None


def get_opcua_client() -> OPCUAClient:
    """Get or create OPC-UA client instance."""
    global _opcua_client
    if _opcua_client is None:
        _opcua_client = OPCUAClient()
        # Note: Connection will be established on first use
    return _opcua_client


def get_control_executor() -> OPCUAControlExecutor:
    """Get or create control executor instance."""
    global _control_executor
    if _control_executor is None:
        client = get_opcua_client()
        _control_executor = OPCUAControlExecutor(client)
    return _control_executor


async def ensure_opcua_connection():
    """Ensure OPC-UA client is connected."""
    client = get_opcua_client()
    if not client.connected:
        await client.connect()
    return client.connected


@control_bp.route("/status", methods=["GET"])
@require_auth
def get_control_status():
    """Returns the current control status from OPC-UA server."""
    try:
        client = get_opcua_client()
        
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        connected = loop.run_until_complete(ensure_opcua_connection())
        
        if not connected:
            return jsonify({
                "error": "Cannot connect to OPC-UA server",
                "status": "disconnected"
            }), 503
        
        params = loop.run_until_complete(client.read_control_parameters())
        system_status = loop.run_until_complete(client.get_system_status())
        
        loop.close()
        
        return jsonify({
            "connected": True,
            "system_status": system_status,
            "control_parameters": params,
        })
    except Exception as e:
        logger.error(f"Error getting control status: {e}")
        return jsonify({"error": str(e)}), 500


@control_bp.route("/settings", methods=["POST"])
@require_auth
@require_permissions("control", "write")
def propose_control_change():
    """
    Propose a control parameter change (requires engineer approval).
    Implements closed-loop control with approval workflow (FR-343).
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    required_fields = ["parameter", "current_value", "proposed_value", "reason"]
    if not all(field in data for field in required_fields):
        return jsonify({
            "error": f"Missing required fields: {required_fields}"
        }), 400
    
    try:
        executor = get_control_executor()
        action_id = str(uuid.uuid4())
        
        # Run async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        action = loop.run_until_complete(
            executor.propose_control_action(
                action_id=action_id,
                parameter=data["parameter"],
                current_value=data["current_value"],
                proposed_value=data["proposed_value"],
                reason=data["reason"],
                engineer_approval_required=True,
            )
        )
        
        loop.close()
        
        logger.info(f"Control action proposed: {action_id}")
        
        return jsonify({
            "message": "Control action proposed successfully",
            "action_id": action_id,
            "status": "pending_approval",
            "action": action,
        }), 201
        
    except Exception as e:
        logger.error(f"Error proposing control change: {e}")
        return jsonify({"error": str(e)}), 500


@control_bp.route("/actions/pending", methods=["GET"])
@require_auth
@require_permissions("control", "read")
def get_pending_actions():
    """Get list of pending control actions."""
    try:
        executor = get_control_executor()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        pending = executor.get_pending_actions()
        
        loop.close()
        
        return jsonify({"pending_actions": pending}), 200
    except Exception as e:
        logger.error(f"Error getting pending actions: {e}")
        return jsonify({"error": str(e)}), 500


@control_bp.route("/actions/<action_id>/approve", methods=["POST"])
@require_auth
@require_permissions("control", "write")
def approve_action(action_id: str):
    """
    Approve a pending control action (engineer only).
    """
    current_user = get_current_user()
    if not current_user or current_user["role"] not in ["admin", "engineer"]:
        return jsonify({"error": "Engineer or admin access required"}), 403
    
    try:
        executor = get_control_executor()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        success = loop.run_until_complete(
            executor.approve_control_action(action_id, current_user["username"])
        )
        
        loop.close()
        
        if success:
            return jsonify({
                "message": "Action approved successfully",
                "action_id": action_id,
            }), 200
        else:
            return jsonify({"error": "Action not found or already processed"}), 404
            
    except Exception as e:
        logger.error(f"Error approving action: {e}")
        return jsonify({"error": str(e)}), 500


@control_bp.route("/actions/<action_id>/execute", methods=["POST"])
@require_auth
@require_permissions("control", "write")
def execute_action(action_id: str):
    """
    Execute an approved control action.
    """
    try:
        executor = get_control_executor()
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        # Ensure OPC-UA connection
        loop.run_until_complete(ensure_opcua_connection())
        
        result = loop.run_until_complete(executor.execute_control_action(action_id))
        
        loop.close()
        
        if result["success"]:
            # NEW: Log to audit trail (NF-512)
            current_user = get_current_user()
            audit_logger = get_audit_logger()
            audit_logger.log_control_action(
                action_id=action_id,
                action_type="RTO_EXECUTION",
                user_id=current_user.get("user_id") if current_user else None,
                username=current_user.get("username") if current_user else None,
                parameter=result.get("parameter", "unknown"),
                old_value=result.get("old_value", 0),
                new_value=result.get("new_value", 0),
                status="executed",
                reason="RTO optimization action executed",
            )
            
            return jsonify({
                "message": "Control action executed successfully",
                "result": result,
            }), 200
        else:
            return jsonify({
                "error": result.get("error", "Execution failed"),
                "result": result,
            }), 400
            
    except Exception as e:
        logger.error(f"Error executing action: {e}")
        return jsonify({"error": str(e)}), 500


@control_bp.route("/actions/history", methods=["GET"])
@require_auth
@require_permissions("control", "read")
def get_execution_history():
    """Get execution history of control actions."""
    try:
        executor = get_control_executor()
        limit = request.args.get("limit", 100, type=int)
        
        history = executor.get_execution_history(limit=limit)
        
        return jsonify({"history": history}), 200
    except Exception as e:
        logger.error(f"Error getting execution history: {e}")
        return jsonify({"error": str(e)}), 500
