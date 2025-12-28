"""
OPC-UA Client for connecting to SCADA/PLC systems.
Implements secure connection with restricted credentials for RTO control.
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import asyncio
from asyncua import Client, ua
from asyncua.common.subscription import Subscription
import json

logger = logging.getLogger(__name__)


class OPCUAClient:
    """
    OPC-UA Client for reading/writing control parameters.
    Uses unique, restricted credentials as per NF-414 requirement.
    """

    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
    ):
        """
        Initialize OPC-UA client.
        
        Args:
            endpoint_url: OPC-UA server endpoint (e.g., 'opc.tcp://localhost:4840')
            username: Username for authentication
            password: Password for authentication
        """
        self.endpoint_url = endpoint_url or os.getenv(
            "OPCUA_ENDPOINT_URL", "opc.tcp://localhost:4840"
        )
        self.username = username or os.getenv("OPCUA_USERNAME", None)
        self.password = password or os.getenv("OPCUA_PASSWORD", None)
        
        self.client: Optional[Client] = None
        self.connected = False
        self.subscriptions: List[Subscription] = []
        
        # Node IDs for control parameters (configure based on your OPC-UA server)
        self.control_nodes = {
            "load_factor": os.getenv("OPCUA_NODE_LOAD_FACTOR", "ns=2;s=LoadFactor"),
            "pressure_setpoint": os.getenv(
                "OPCUA_NODE_PRESSURE_SETPOINT", "ns=2;s=PressureSetpoint"
            ),
            "temperature_setpoint": os.getenv(
                "OPCUA_NODE_TEMPERATURE_SETPOINT", "ns=2;s=TemperatureSetpoint"
            ),
            "system_status": os.getenv("OPCUA_NODE_SYSTEM_STATUS", "ns=2;s=SystemStatus"),
        }

    async def connect(self) -> bool:
        """
        Connect to OPC-UA server.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            self.client = Client(url=self.endpoint_url)
            
            # Set security if credentials provided
            if self.username and self.password:
                self.client.set_user(self.username)
                self.client.set_password(self.password)
            
            await self.client.connect()
            self.connected = True
            
            logger.info(f"✅ Connected to OPC-UA server at {self.endpoint_url}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to OPC-UA server: {e}")
            self.connected = False
            return False

    async def disconnect(self):
        """Disconnect from OPC-UA server."""
        try:
            if self.client and self.connected:
                await self.client.disconnect()
                self.connected = False
                logger.info("Disconnected from OPC-UA server")
        except Exception as e:
            logger.error(f"Error disconnecting from OPC-UA server: {e}")

    async def read_node(self, node_id: str) -> Optional[Any]:
        """
        Read value from a node.
        
        Args:
            node_id: OPC-UA node ID (e.g., "ns=2;s=LoadFactor")
            
        Returns:
            Node value or None if error
        """
        if not self.connected or not self.client:
            logger.error("Not connected to OPC-UA server")
            return None
        
        try:
            node = self.client.get_node(node_id)
            value = await node.read_value()
            return value
        except Exception as e:
            logger.error(f"Error reading node {node_id}: {e}")
            return None

    async def write_node(self, node_id: str, value: Any, data_type: Optional[ua.VariantType] = None) -> bool:
        """
        Write value to a node.
        
        Args:
            node_id: OPC-UA node ID
            value: Value to write
            data_type: Optional data type hint
            
        Returns:
            True if successful, False otherwise
        """
        if not self.connected or not self.client:
            logger.error("Not connected to OPC-UA server")
            return False
        
        try:
            node = self.client.get_node(node_id)
            
            if data_type:
                variant = ua.Variant(value, data_type)
                await node.write_value(variant)
            else:
                await node.write_value(value)
            
            logger.info(f"✅ Wrote value {value} to node {node_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error writing to node {node_id}: {e}")
            return False

    async def read_control_parameters(self) -> Dict[str, Any]:
        """
        Read current control parameters from OPC-UA server.
        
        Returns:
            Dictionary with current control parameter values
        """
        params = {}
        
        for param_name, node_id in self.control_nodes.items():
            value = await self.read_node(node_id)
            if value is not None:
                params[param_name] = value
        
        return params

    async def write_control_setpoint(self, parameter: str, value: float) -> bool:
        """
        Write a control setpoint to OPC-UA server.
        
        Args:
            parameter: Parameter name (e.g., "load_factor")
            value: Setpoint value
            
        Returns:
            True if successful, False otherwise
        """
        if parameter not in self.control_nodes:
            logger.error(f"Unknown parameter: {parameter}")
            return False
        
        node_id = self.control_nodes[parameter]
        return await self.write_node(node_id, value, ua.VariantType.Float)

    async def get_system_status(self) -> Optional[str]:
        """Get current system status."""
        node_id = self.control_nodes.get("system_status")
        if node_id:
            return await self.read_node(node_id)
        return None


class OPCUAControlExecutor:
    """
    Executor for closed-loop control with engineer approval workflow.
    Implements FR-343 requirement.
    """

    def __init__(self, opcua_client: OPCUAClient):
        """
        Initialize control executor.
        
        Args:
            opcua_client: Configured OPC-UA client instance
        """
        self.client = opcua_client
        self.pending_actions: Dict[str, Dict] = {}
        self.execution_log: List[Dict] = []

    async def propose_control_action(
        self,
        action_id: str,
        parameter: str,
        current_value: float,
        proposed_value: float,
        reason: str,
        engineer_approval_required: bool = True,
    ) -> Dict[str, Any]:
        """
        Propose a control action and store for approval.
        
        Args:
            action_id: Unique identifier for this action
            parameter: Parameter name to change
            current_value: Current parameter value
            proposed_value: Proposed new value
            reason: Reason for the change
            engineer_approval_required: Whether engineer approval is needed
            
        Returns:
            Action proposal dictionary
        """
        action = {
            "action_id": action_id,
            "parameter": parameter,
            "current_value": current_value,
            "proposed_value": proposed_value,
            "reason": reason,
            "status": "pending_approval" if engineer_approval_required else "approved",
            "created_at": datetime.utcnow().isoformat(),
            "engineer_approval_required": engineer_approval_required,
        }
        
        self.pending_actions[action_id] = action
        
        logger.info(
            f"Control action proposed: {parameter} from {current_value} to {proposed_value}"
        )
        
        return action

    async def approve_control_action(self, action_id: str, engineer_username: str) -> bool:
        """
        Approve a pending control action.
        
        Args:
            action_id: Action ID to approve
            engineer_username: Username of approving engineer
            
        Returns:
            True if approved successfully, False otherwise
        """
        if action_id not in self.pending_actions:
            logger.error(f"Action {action_id} not found")
            return False
        
        action = self.pending_actions[action_id]
        action["status"] = "approved"
        action["approved_by"] = engineer_username
        action["approved_at"] = datetime.utcnow().isoformat()
        
        logger.info(f"Action {action_id} approved by {engineer_username}")
        return True

    async def execute_control_action(self, action_id: str) -> Dict[str, Any]:
        """
        Execute an approved control action.
        
        Args:
            action_id: Action ID to execute
            
        Returns:
            Execution result dictionary
        """
        if action_id not in self.pending_actions:
            return {"success": False, "error": "Action not found"}
        
        action = self.pending_actions[action_id]
        
        if action["status"] != "approved":
            return {
                "success": False,
                "error": f"Action status is {action['status']}, not approved",
            }
        
        # Execute the control change
        success = await self.client.write_control_setpoint(
            action["parameter"], action["proposed_value"]
        )
        
        execution_result = {
            "action_id": action_id,
            "success": success,
            "executed_at": datetime.utcnow().isoformat(),
            "parameter": action["parameter"],
            "old_value": action["current_value"],
            "new_value": action["proposed_value"],
        }
        
        if success:
            action["status"] = "executed"
            action["executed_at"] = execution_result["executed_at"]
            logger.info(f"✅ Control action {action_id} executed successfully")
        else:
            action["status"] = "failed"
            execution_result["error"] = "Failed to write to OPC-UA server"
            logger.error(f"❌ Control action {action_id} execution failed")
        
        self.execution_log.append(execution_result)
        
        return execution_result

    def get_pending_actions(self) -> List[Dict]:
        """Get list of pending actions."""
        return [
            action
            for action in self.pending_actions.values()
            if action["status"] == "pending_approval"
        ]

    def get_execution_history(self, limit: int = 100) -> List[Dict]:
        """Get execution history."""
        return self.execution_log[-limit:]

