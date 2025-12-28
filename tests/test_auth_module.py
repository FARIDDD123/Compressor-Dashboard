"""
Unit tests for authentication module (core/auth.py).
"""

import pytest
import jwt
import os
from datetime import datetime, timedelta
from backend.core.auth import (
    generate_token,
    decode_token,
    hash_password,
    verify_password,
    get_token_from_request,
    ROLES,
    ROLE_HIERARCHY,
)


class TestAuthModule:
    """Test suite for authentication utilities."""

    def test_hash_and_verify_password(self):
        """Test password hashing and verification."""
        password = "test_password_123"
        hashed = hash_password(password)
        
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("wrong_password", hashed) is False

    def test_generate_token(self):
        """Test JWT token generation."""
        token = generate_token(1, "testuser", "admin")
        
        assert isinstance(token, str)
        assert len(token) > 0
        
        # Decode and verify
        decoded = decode_token(token)
        assert decoded is not None
        assert decoded["user_id"] == 1
        assert decoded["username"] == "testuser"
        assert decoded["role"] == "admin"

    def test_decode_expired_token(self):
        """Test decoding an expired token."""
        secret_key = os.getenv("JWT_SECRET_KEY", "test-secret")
        
        # Create expired token
        payload = {
            "user_id": 1,
            "username": "testuser",
            "role": "admin",
            "exp": datetime.utcnow() - timedelta(hours=1),  # Expired
            "iat": datetime.utcnow() - timedelta(hours=2),
        }
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        
        decoded = decode_token(token)
        assert decoded is None

    def test_decode_invalid_token(self):
        """Test decoding an invalid token."""
        invalid_token = "invalid.token.here"
        decoded = decode_token(invalid_token)
        assert decoded is None

    def test_roles_configuration(self):
        """Test that roles are properly configured."""
        assert "admin" in ROLES
        assert "engineer" in ROLES
        assert "operator" in ROLES
        assert "viewer" in ROLES
        
        # Check admin has all permissions
        assert "read" in ROLES["admin"]
        assert "write" in ROLES["admin"]
        assert "control" in ROLES["admin"]
        assert "manage_users" in ROLES["admin"]

    def test_role_hierarchy(self):
        """Test role hierarchy ordering."""
        assert ROLE_HIERARCHY["admin"] > ROLE_HIERARCHY["engineer"]
        assert ROLE_HIERARCHY["engineer"] > ROLE_HIERARCHY["operator"]
        assert ROLE_HIERARCHY["operator"] > ROLE_HIERARCHY["viewer"]

