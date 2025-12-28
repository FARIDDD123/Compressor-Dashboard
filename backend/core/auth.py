"""
JWT Authentication and RBAC module for Flask API.
Implements token-based authentication with role-based access control.
"""

import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from typing import Optional, List, Dict
import logging

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise ValueError(
        "JWT_SECRET_KEY environment variable is not set! "
        "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
    )
if len(JWT_SECRET_KEY) < 32:
    raise ValueError("JWT_SECRET_KEY must be at least 32 characters long!")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
JWT_REFRESH_EXPIRATION_DAYS = int(os.getenv("JWT_REFRESH_EXPIRATION_DAYS", "7"))

# Role Definitions
ROLES = {
    "admin": ["read", "write", "delete", "control", "manage_users"],
    "engineer": ["read", "write", "control"],
    "operator": ["read", "write"],
    "viewer": ["read"],
}

# Role hierarchy (higher number = more permissions)
ROLE_HIERARCHY = {
    "admin": 4,
    "engineer": 3,
    "operator": 2,
    "viewer": 1,
}


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_token(user_id: int, username: str, role: str, token_type: str = "access") -> str:
    """
    Generate a JWT token for a user.
    
    Args:
        user_id: User's database ID
        username: User's username
        role: User's role
        token_type: 'access' or 'refresh'
        
    Returns:
        Encoded JWT token string
    """
    if token_type == "refresh":
        expiration = datetime.utcnow() + timedelta(days=JWT_REFRESH_EXPIRATION_DAYS)
    else:
        expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "type": token_type,
        "exp": expiration,
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str) -> Optional[Dict]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded payload dictionary or None if invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None


def get_token_from_request() -> Optional[str]:
    """Extract JWT token from request headers."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    
    try:
        # Expecting format: "Bearer <token>"
        token_type, token = auth_header.split(" ", 1)
        if token_type.lower() != "bearer":
            return None
        return token
    except ValueError:
        return None


def require_auth(f):
    """
    Decorator to require authentication for an endpoint.
    Sets g.user with decoded token payload.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({"error": "Authentication required", "code": "AUTH_REQUIRED"}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token", "code": "INVALID_TOKEN"}), 401
        
        # Store user info in Flask's g object
        g.user = {
            "user_id": payload["user_id"],
            "username": payload["username"],
            "role": payload["role"],
        }
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_roles(*allowed_roles: str):
    """
    Decorator to require specific roles.
    Can be combined with require_auth.
    
    Usage:
        @require_auth
        @require_roles("admin", "engineer")
        def my_endpoint():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if user is authenticated (should be set by require_auth)
            if not hasattr(g, "user"):
                return jsonify({"error": "Authentication required", "code": "AUTH_REQUIRED"}), 401
            
            user_role = g.user.get("role")
            
            # Check if user has minimum required role hierarchy
            if not user_role or user_role not in ROLE_HIERARCHY:
                return jsonify({"error": "Invalid user role", "code": "INVALID_ROLE"}), 403
            
            user_hierarchy = ROLE_HIERARCHY[user_role]
            required_hierarchy = max(ROLE_HIERARCHY[role] for role in allowed_roles)
            
            if user_hierarchy < required_hierarchy:
                return jsonify({
                    "error": "Insufficient permissions",
                    "code": "INSUFFICIENT_PERMISSIONS",
                    "required": allowed_roles,
                    "current": user_role,
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def require_permissions(*required_permissions: str):
    """
    Decorator to require specific permissions.
    Checks if user's role has the required permissions.
    
    Usage:
        @require_auth
        @require_permissions("control", "write")
        def control_endpoint():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, "user"):
                return jsonify({"error": "Authentication required", "code": "AUTH_REQUIRED"}), 401
            
            user_role = g.user.get("role")
            if not user_role or user_role not in ROLES:
                return jsonify({"error": "Invalid user role", "code": "INVALID_ROLE"}), 403
            
            user_permissions = set(ROLES[user_role])
            required_perms = set(required_permissions)
            
            if not required_perms.issubset(user_permissions):
                missing = required_perms - user_permissions
                return jsonify({
                    "error": "Missing required permissions",
                    "code": "MISSING_PERMISSIONS",
                    "missing": list(missing),
                    "required": list(required_perms),
                    "available": list(user_permissions),
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def get_current_user() -> Optional[Dict]:
    """Get current authenticated user from Flask's g object."""
    return getattr(g, "user", None)

