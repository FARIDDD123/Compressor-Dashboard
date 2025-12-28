"""
Unit tests for control routes.
"""

import pytest
import json
from unittest.mock import patch, MagicMock, AsyncMock
import asyncio


class TestControlRoutes:
    """Test suite for control endpoints."""

    def test_get_control_status_success(self, client, auth_headers, mock_opcua_client):
        """Test getting control status from OPC-UA."""
        headers = auth_headers()
        
        # Mock async operations
        async def mock_read_params():
            return {"load_factor": 0.75, "pressure_setpoint": 85.0}
        
        async def mock_get_status():
            return "running"
        
        with patch("backend.api.routes.control_routes.get_opcua_client") as mock_get_client:
            mock_client = MagicMock()
            mock_client.connected = True
            mock_client.read_control_parameters = AsyncMock(return_value={
                "load_factor": 0.75,
                "pressure_setpoint": 85.0,
            })
            mock_client.get_system_status = AsyncMock(return_value="running")
            mock_get_client.return_value = mock_client
            
            with patch("asyncio.new_event_loop") as mock_loop_class:
                loop = asyncio.get_event_loop()
                mock_loop_class.return_value = loop
                
                response = client.get("/api/control/status", headers=headers)
                
                assert response.status_code == 200
                data = json.loads(response.data)
                assert data["connected"] is True
                assert "control_parameters" in data

    def test_get_control_status_unauthorized(self, client):
        """Test getting control status without authentication."""
        response = client.get("/api/control/status")
        
        assert response.status_code == 401

    def test_propose_control_change_success(self, client, auth_headers):
        """Test proposing a control change."""
        headers = auth_headers(role="engineer")
        
        with patch("backend.api.routes.control_routes.get_control_executor") as mock_get_exec:
            mock_executor = MagicMock()
            mock_executor.propose_control_action = AsyncMock(return_value={
                "action_id": "test-action-123",
                "status": "pending_approval",
                "parameter": "load_factor",
            })
            mock_get_exec.return_value = mock_executor
            
            with patch("asyncio.new_event_loop") as mock_loop_class:
                loop = asyncio.get_event_loop()
                mock_loop_class.return_value = loop
                
                response = client.post(
                    "/api/control/settings",
                    json={
                        "parameter": "load_factor",
                        "current_value": 0.75,
                        "proposed_value": 0.85,
                        "reason": "Optimization",
                    },
                    headers=headers,
                    content_type="application/json",
                )
                
                assert response.status_code == 201
                data = json.loads(response.data)
                assert data["status"] == "pending_approval"
                assert "action_id" in data

    def test_propose_control_change_missing_fields(self, client, auth_headers):
        """Test proposing control change with missing fields."""
        headers = auth_headers(role="engineer")
        
        response = client.post(
            "/api/control/settings",
            json={"parameter": "load_factor"},
            headers=headers,
            content_type="application/json",
        )
        
        assert response.status_code == 400

    def test_propose_control_change_insufficient_permissions(self, client, auth_headers):
        """Test proposing control change without control permissions."""
        headers = auth_headers(role="viewer")
        
        response = client.post(
            "/api/control/settings",
            json={
                "parameter": "load_factor",
                "current_value": 0.75,
                "proposed_value": 0.85,
                "reason": "Optimization",
            },
            headers=headers,
            content_type="application/json",
        )
        
        assert response.status_code == 403

    def test_get_pending_actions(self, client, auth_headers):
        """Test getting pending control actions."""
        headers = auth_headers(role="engineer")
        
        with patch("backend.api.routes.control_routes.get_control_executor") as mock_get_exec:
            mock_executor = MagicMock()
            mock_executor.get_pending_actions.return_value = [
                {"action_id": "action-1", "status": "pending_approval"},
            ]
            mock_get_exec.return_value = mock_executor
            
            response = client.get("/api/control/actions/pending", headers=headers)
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "pending_actions" in data

    def test_approve_action_success(self, client, auth_headers):
        """Test approving a control action."""
        headers = auth_headers(role="engineer")
        
        with patch("backend.api.routes.control_routes.get_control_executor") as mock_get_exec:
            mock_executor = MagicMock()
            mock_executor.approve_control_action = AsyncMock(return_value=True)
            mock_get_exec.return_value = mock_executor
            
            with patch("asyncio.new_event_loop") as mock_loop_class:
                loop = asyncio.get_event_loop()
                mock_loop_class.return_value = loop
                
                response = client.post(
                    "/api/control/actions/test-action-123/approve",
                    headers=headers,
                )
                
                assert response.status_code == 200

    def test_approve_action_non_engineer(self, client, auth_headers):
        """Test approving action as non-engineer."""
        headers = auth_headers(role="viewer")
        
        response = client.post(
            "/api/control/actions/test-action-123/approve",
            headers=headers,
        )
        
        assert response.status_code == 403

    def test_execute_action_success(self, client, auth_headers):
        """Test executing an approved action."""
        headers = auth_headers(role="engineer")
        
        with patch("backend.api.routes.control_routes.get_control_executor") as mock_get_exec, \
             patch("backend.api.routes.control_routes.get_opcua_client") as mock_get_client:
            mock_executor = MagicMock()
            mock_executor.execute_control_action = AsyncMock(return_value={
                "success": True,
                "action_id": "test-action-123",
            })
            mock_get_exec.return_value = mock_executor
            
            mock_client = MagicMock()
            mock_client.connected = True
            mock_get_client.return_value = mock_client
            
            with patch("asyncio.new_event_loop") as mock_loop_class:
                loop = asyncio.get_event_loop()
                mock_loop_class.return_value = loop
                
                response = client.post(
                    "/api/control/actions/test-action-123/execute",
                    headers=headers,
                )
                
                assert response.status_code == 200

    def test_get_execution_history(self, client, auth_headers):
        """Test getting execution history."""
        headers = auth_headers(role="engineer")
        
        with patch("backend.api.routes.control_routes.get_control_executor") as mock_get_exec:
            mock_executor = MagicMock()
            mock_executor.get_execution_history.return_value = [
                {"action_id": "action-1", "success": True},
            ]
            mock_get_exec.return_value = mock_executor
            
            response = client.get("/api/control/actions/history", headers=headers)
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "history" in data

