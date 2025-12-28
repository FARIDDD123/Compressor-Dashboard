"""
Authentication routes for user login, registration, and token management.
"""

import logging
import secrets
import hashlib
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from backend.core.auth import (
    generate_token, require_auth, get_current_user, 
    decode_token, JWT_EXPIRATION_HOURS, JWT_REFRESH_EXPIRATION_DAYS,
    hash_password
)
from backend.core.user_manager import UserManager
from backend.core.session_manager import session_manager
from backend.core.email_service import email_service
from backend.core.database import get_db_connection
from backend.core.rate_limiter import auth_rate_limit, api_rate_limit
from backend.core.validators import validate_request
import pymysql

auth_bp = Blueprint("auth", __name__)
user_manager = UserManager()

logger = logging.getLogger(__name__)


@auth_bp.route("/login", methods=["POST"])
@auth_rate_limit
@validate_request({
    'username': {'type': 'string', 'required': True, 'min': 3, 'max': 50},
    'password': {'type': 'string', 'required': True, 'min': 1, 'max': 128}
})
def login():
    """
    Authenticate user and return JWT token.
    
    Request body:
        {
            "username": "string",
            "password": "string"
        }
    """
    data = request.get_json()
    
    username = data["username"]
    password = data["password"]
    
    user = user_manager.authenticate_user(username, password)
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Generate access and refresh tokens
    access_token = generate_token(user["id"], user["username"], user["role"], "access")
    refresh_token = generate_token(user["id"], user["username"], user["role"], "refresh")
    
    # Store session in database
    access_expires = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    session_manager.create_session(user["id"], access_token, access_expires)
    
    logger.info(f"User '{username}' logged in successfully")
    
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,  # seconds
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
        },
        "message": "Login successful",
    }), 200


@auth_bp.route("/register", methods=["POST"])
@require_auth
@api_rate_limit
@validate_request({
    'username': {'type': 'username', 'required': True},
    'email': {'type': 'email', 'required': True},
    'password': {'type': 'password', 'required': True},
    'role': {'type': 'enum', 'allowed': ['admin', 'engineer', 'operator', 'viewer']}
})
def register():
    """
    Register a new user (admin only).
    
    Request body:
        {
            "username": "string",
            "email": "string",
            "password": "string",
            "role": "string"  # Optional, default: "viewer"
        }
    """
    # Check if current user is admin
    current_user = get_current_user()
    if not current_user or current_user["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    
    username = data["username"]
    email = data["email"]
    password = data["password"]
    role = data.get("role", "viewer")
    
    # Validate role
    valid_roles = ["admin", "engineer", "operator", "viewer"]
    if role not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {valid_roles}"}), 400
    
    user_id = user_manager.create_user(username, email, password, role)
    
    if not user_id:
        return jsonify({"error": "User creation failed. Username or email may already exist."}), 400
    
    logger.info(f"Admin '{current_user['username']}' created new user: {username}")
    
    return jsonify({
        "message": "User created successfully",
        "user_id": user_id,
        "username": username
    }), 201


@auth_bp.route("/me", methods=["GET"])
@require_auth
@api_rate_limit
def get_current_user_info():
    """Get current authenticated user information."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    user_details = user_manager.get_user_by_id(current_user["user_id"])
    
    if not user_details:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({"user": user_details}), 200


@auth_bp.route("/users", methods=["GET"])
@require_auth
@api_rate_limit
def list_users():
    """
    List all users (admin and engineer only).
    """
    current_user = get_current_user()
    
    if not current_user or current_user["role"] not in ["admin", "engineer"]:
        return jsonify({"error": "Insufficient permissions"}), 403
    
    users = user_manager.list_users()
    return jsonify({"users": users}), 200


@auth_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@require_auth
@api_rate_limit
@validate_request({
    'role': {'type': 'enum', 'allowed': ['admin', 'engineer', 'operator', 'viewer'], 'required': True}
})
def update_user_role(user_id):
    """
    Update user role (admin only).
    
    Request body:
        {
            "role": "string"
        }
    """
    current_user = get_current_user()
    
    if not current_user or current_user["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    
    if not data or "role" not in data:
        return jsonify({"error": "Role required"}), 400
    
    new_role = data["role"]
    valid_roles = ["admin", "engineer", "operator", "viewer"]
    
    if new_role not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {valid_roles}"}), 400
    
    if user_manager.update_user_role(user_id, new_role):
        logger.info(f"Admin '{current_user['username']}' updated user {user_id} role to {new_role}")
        return jsonify({"message": "User role updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update user role"}), 500


@auth_bp.route("/logout", methods=["POST"])
@require_auth
@api_rate_limit
def logout():
    """
    Logout user and revoke current token.
    
    Headers:
        Authorization: Bearer <token>
    """
    try:
        # Get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "No token provided"}), 401
        
        token = auth_header.split(" ")[1]
        
        # Revoke token
        if session_manager.revoke_token(token):
            logger.info("User logged out successfully")
            return jsonify({"message": "Logged out successfully"}), 200
        else:
            return jsonify({"message": "Already logged out"}), 200
            
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({"error": "Logout failed"}), 500


@auth_bp.route("/refresh", methods=["POST"])
@auth_rate_limit
@validate_request({
    'refresh_token': {'type': 'string', 'required': True}
})
def refresh_token():
    """
    Refresh access token using refresh token.
    
    Request body:
        {
            "refresh_token": "string"
        }
    """
    data = request.get_json()
    refresh_token_str = data["refresh_token"]
    
    # Decode and validate refresh token
    payload = decode_token(refresh_token_str)
    
    if not payload:
        return jsonify({"error": "Invalid or expired refresh token"}), 401
    
    # Check if it's a refresh token
    if payload.get("type") != "refresh":
        return jsonify({"error": "Not a refresh token"}), 401
    
    # Generate new access token
    new_access_token = generate_token(
        payload["user_id"], 
        payload["username"], 
        payload["role"], 
        "access"
    )
    
    # Store new session
    access_expires = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    session_manager.create_session(payload["user_id"], new_access_token, access_expires)
    
    logger.info(f"Token refreshed for user {payload['username']}")
    
    return jsonify({
        "access_token": new_access_token,
        "token_type": "Bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600,
    }), 200


@auth_bp.route("/sessions", methods=["GET"])
@require_auth
@api_rate_limit
def get_active_sessions():
    """
    Get all active sessions for current user.
    """
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    sessions = session_manager.get_user_active_sessions(current_user["user_id"])
    
    return jsonify({
        "sessions": sessions,
        "count": len(sessions)
    }), 200


@auth_bp.route("/sessions/revoke-all", methods=["POST"])
@require_auth
@api_rate_limit
def revoke_all_sessions():
    """
    Revoke all sessions for current user (logout from all devices).
    """
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "Not authenticated"}), 401
    
    if session_manager.revoke_all_user_sessions(current_user["user_id"]):
        logger.info(f"All sessions revoked for user {current_user['username']}")
        return jsonify({"message": "All sessions revoked successfully"}), 200
    else:
        return jsonify({"error": "Failed to revoke sessions"}), 500


@auth_bp.route("/forgot-password", methods=["POST"])
@auth_rate_limit
@validate_request({
    'email': {'type': 'email', 'required': True}
})
def forgot_password():
    """
    Request password reset (send reset email).
    
    Request body:
        {
            "email": "user@example.com"
        }
    """
    data = request.get_json()
    email = data["email"]
    
    try:
        # Find user by email
        user = user_manager.get_user_by_email(email)
        
        if not user:
            # Don't reveal if email exists - security best practice
            return jsonify({"message": "If email exists, password reset link has been sent"}), 200
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
        
        # Store token in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        expires_at = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        
        query = """
            INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
            VALUES (%s, %s, %s)
        """
        cursor.execute(query, (user["id"], token_hash, expires_at))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        # Send reset email
        base_url = request.host_url.rstrip('/')
        email_sent = email_service.send_password_reset_email(
            email, user["username"], reset_token, base_url
        )
        
        if email_sent:
            logger.info(f"Password reset email sent to {email}")
        else:
            logger.warning(f"Failed to send password reset email to {email}")
        
        # Always return success (don't reveal if email exists)
        return jsonify({"message": "If email exists, password reset link has been sent"}), 200
        
    except Exception as e:
        logger.error(f"Password reset request error: {e}")
        return jsonify({"error": "Failed to process password reset request"}), 500


@auth_bp.route("/reset-password", methods=["POST"])
@auth_rate_limit
@validate_request({
    'token': {'type': 'string', 'required': True},
    'new_password': {'type': 'password', 'required': True}
})
def reset_password():
    """
    Reset password using token from email.
    
    Request body:
        {
            "token": "reset_token_from_email",
            "new_password": "new_password_here"
        }
    """
    data = request.get_json()
    reset_token = data["token"]
    new_password = data["new_password"]
    
    try:
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
        
        # Verify token
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        query = """
            SELECT user_id, expires_at, used
            FROM password_reset_tokens
            WHERE token_hash = %s
        """
        cursor.execute(query, (token_hash,))
        token_record = cursor.fetchone()
        
        if not token_record:
            cursor.close()
            conn.close()
            return jsonify({"error": "Invalid or expired reset token"}), 400
        
        # Check if token is expired
        if token_record['expires_at'] < datetime.utcnow():
            cursor.close()
            conn.close()
            return jsonify({"error": "Reset token has expired"}), 400
        
        # Check if token already used
        if token_record['used']:
            cursor.close()
            conn.close()
            return jsonify({"error": "Reset token has already been used"}), 400
        
        # Update password
        user_id = token_record['user_id']
        password_hash = hash_password(new_password)
        
        update_query = "UPDATE users SET password_hash = %s WHERE id = %s"
        cursor.execute(update_query, (password_hash, user_id))
        
        # Mark token as used
        mark_used_query = "UPDATE password_reset_tokens SET used = TRUE WHERE token_hash = %s"
        cursor.execute(mark_used_query, (token_hash,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Revoke all existing sessions for security
        session_manager.revoke_all_user_sessions(user_id)
        
        logger.info(f"Password reset successful for user {user_id}")
        return jsonify({"message": "Password reset successful. Please login with your new password."}), 200
        
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        return jsonify({"error": "Failed to reset password"}), 500

