"""
Unit tests for authentication routes.
"""

import pytest
import json
from unittest.mock import patch, MagicMock
from backend.core.user_manager import UserManager


class TestAuthRoutes:
    """Test suite for authentication endpoints."""

    def test_login_success(self, client, mock_db):
        """Test successful login."""
        # Mock user authentication
        with patch.object(UserManager, "authenticate_user") as mock_auth:
            mock_auth.return_value = {
                "id": 1,
                "username": "testuser",
                "email": "test@example.com",
                "role": "admin",
            }
            
            response = client.post(
                "/api/auth/login",
                json={"username": "testuser", "password": "password123"},
                content_type="application/json",
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "access_token" in data
            assert data["user"]["username"] == "testuser"
            assert data["user"]["role"] == "admin"

    def test_login_missing_credentials(self, client):
        """Test login with missing credentials."""
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser"},
            content_type="application/json",
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        with patch.object(UserManager, "authenticate_user") as mock_auth:
            mock_auth.return_value = None
            
            response = client.post(
                "/api/auth/login",
                json={"username": "testuser", "password": "wrongpass"},
                content_type="application/json",
            )
            
            assert response.status_code == 401
            data = json.loads(response.data)
            assert "error" in data

    def test_register_success(self, client, auth_headers, mock_db):
        """Test successful user registration."""
        headers = auth_headers(role="admin")
        
        with patch.object(UserManager, "create_user") as mock_create, \
             patch.object(UserManager, "authenticate_user") as mock_auth:
            mock_create.return_value = 2
            mock_auth.return_value = {"id": 1, "username": "admin", "role": "admin"}
            
            response = client.post(
                "/api/auth/register",
                json={
                    "username": "newuser",
                    "email": "newuser@example.com",
                    "password": "password123",
                    "role": "viewer",
                },
                headers=headers,
                content_type="application/json",
            )
            
            assert response.status_code == 201
            data = json.loads(response.data)
            assert data["message"] == "User created successfully"

    def test_register_non_admin(self, client, auth_headers):
        """Test registration attempt by non-admin user."""
        headers = auth_headers(role="viewer")
        
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123",
            },
            headers=headers,
            content_type="application/json",
        )
        
        assert response.status_code == 403

    def test_register_invalid_role(self, client, auth_headers):
        """Test registration with invalid role."""
        headers = auth_headers(role="admin")
        
        with patch.object(UserManager, "authenticate_user") as mock_auth:
            mock_auth.return_value = {"id": 1, "username": "admin", "role": "admin"}
            
            response = client.post(
                "/api/auth/register",
                json={
                    "username": "newuser",
                    "email": "newuser@example.com",
                    "password": "password123",
                    "role": "invalid_role",
                },
                headers=headers,
                content_type="application/json",
            )
            
            assert response.status_code == 400

    def test_get_current_user(self, client, auth_headers, mock_db):
        """Test getting current user info."""
        headers = auth_headers()
        
        with patch.object(UserManager, "get_user_by_id") as mock_get:
            mock_get.return_value = {
                "id": 1,
                "username": "testuser",
                "email": "test@example.com",
                "role": "admin",
            }
            
            response = client.get("/api/auth/me", headers=headers)
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "user" in data
            assert data["user"]["username"] == "testuser"

    def test_get_current_user_unauthorized(self, client):
        """Test getting user info without authentication."""
        response = client.get("/api/auth/me")
        
        assert response.status_code == 401

    def test_list_users_success(self, client, auth_headers, mock_db):
        """Test listing users as admin."""
        headers = auth_headers(role="admin")
        
        with patch.object(UserManager, "list_users") as mock_list:
            mock_list.return_value = [
                {"id": 1, "username": "user1", "role": "admin"},
                {"id": 2, "username": "user2", "role": "viewer"},
            ]
            
            response = client.get("/api/auth/users", headers=headers)
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert len(data["users"]) == 2

    def test_list_users_insufficient_permissions(self, client, auth_headers):
        """Test listing users without proper permissions."""
        headers = auth_headers(role="viewer")
        
        response = client.get("/api/auth/users", headers=headers)
        
        assert response.status_code == 403

    def test_update_user_role_success(self, client, auth_headers, mock_db):
        """Test updating user role as admin."""
        headers = auth_headers(role="admin")
        
        with patch.object(UserManager, "update_user_role") as mock_update:
            mock_update.return_value = True
            
            response = client.put(
                "/api/auth/users/2/role",
                json={"role": "engineer"},
                headers=headers,
                content_type="application/json",
            )
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert "message" in data

