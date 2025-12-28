"""
User management module for authentication system.
Handles user CRUD operations and database interactions.
"""

import os
import pymysql
from typing import Optional, Dict, List
import logging
from backend.core.auth import hash_password, verify_password

logger = logging.getLogger(__name__)


class UserManager:
    """Manages user operations in the database."""

    def __init__(self):
        self.db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", 3306)),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_DATABASE", "compressor_db"),
        }

    def _get_connection(self):
        """Get a database connection."""
        return pymysql.connect(
            host=self.db_config["host"],
            port=self.db_config["port"],
            user=self.db_config["user"],
            password=self.db_config["password"],
            database=self.db_config["database"],
            cursorclass=pymysql.cursors.DictCursor,
        )

    def authenticate_user(self, username: str, password: str) -> Optional[Dict]:
        """
        Authenticate a user by username and password.
        
        Args:
            username: Username
            password: Plain text password
            
        Returns:
            User dictionary if authentication successful, None otherwise
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = %s",
                    (username,),
                )
                user = cursor.fetchone()
                
                if not user:
                    logger.warning(f"Authentication failed: User '{username}' not found")
                    return None
                
                if not user["is_active"]:
                    logger.warning(f"Authentication failed: User '{username}' is inactive")
                    return None
                
                if not verify_password(password, user["password_hash"]):
                    logger.warning(f"Authentication failed: Invalid password for '{username}'")
                    return None
                
                # Update last login
                cursor.execute(
                    "UPDATE users SET last_login = NOW() WHERE id = %s",
                    (user["id"],),
                )
                conn.commit()
                
                # Remove password hash from response
                user.pop("password_hash")
                return user
                
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
        finally:
            if conn:
                conn.close()

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID."""
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE id = %s",
                    (user_id,),
                )
                return cursor.fetchone()
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
        finally:
            if conn:
                conn.close()
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """
        Get user by email address.
        
        Args:
            email: User's email
            
        Returns:
            User dictionary or None
        """
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, username, email, password_hash, role, is_active FROM users WHERE email = %s",
                    (email,),
                )
                return cursor.fetchone()
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
        finally:
            if conn:
                conn.close()

    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username."""
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, username, email, role, is_active, created_at, last_login FROM users WHERE username = %s",
                    (username,),
                )
                return cursor.fetchone()
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return None
        finally:
            if conn:
                conn.close()

    def create_user(self, username: str, email: str, password: str, role: str = "viewer") -> Optional[int]:
        """
        Create a new user.
        
        Returns:
            User ID if successful, None otherwise
        """
        conn = None
        try:
            password_hash = hash_password(password)
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (username, email, password_hash, role)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (username, email, password_hash, role),
                )
                conn.commit()
                user_id = cursor.lastrowid
                logger.info(f"Created user: {username} with role: {role}")
                return user_id
        except pymysql.IntegrityError as e:
            logger.error(f"Error creating user (duplicate): {e}")
            return None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
        finally:
            if conn:
                conn.close()

    def update_user_role(self, user_id: int, new_role: str) -> bool:
        """Update user role."""
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET role = %s WHERE id = %s",
                    (new_role, user_id),
                )
                conn.commit()
                logger.info(f"Updated user {user_id} role to {new_role}")
                return True
        except Exception as e:
            logger.error(f"Error updating user role: {e}")
            return False
        finally:
            if conn:
                conn.close()

    def list_users(self) -> List[Dict]:
        """List all users."""
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT id, username, email, role, is_active, created_at, last_login FROM users"
                )
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"Error listing users: {e}")
            return []
        finally:
            if conn:
                conn.close()

    def deactivate_user(self, user_id: int) -> bool:
        """Deactivate a user."""
        conn = None
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE users SET is_active = FALSE WHERE id = %s",
                    (user_id,),
                )
                conn.commit()
                logger.info(f"Deactivated user {user_id}")
                return True
        except Exception as e:
            logger.error(f"Error deactivating user: {e}")
            return False
        finally:
            if conn:
                conn.close()

