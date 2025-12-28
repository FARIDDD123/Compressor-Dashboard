"""
Session management for JWT tokens.
Tracks active sessions and allows token revocation.
"""

import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict
import pymysql
from backend.core.database import get_db_connection

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages user sessions and token tracking."""
    
    @staticmethod
    def _hash_token(token: str) -> str:
        """Create a hash of the token for secure storage."""
        return hashlib.sha256(token.encode()).hexdigest()
    
    def create_session(self, user_id: int, token: str, expires_at: datetime) -> bool:
        """
        Create a new session record.
        
        Args:
            user_id: User's database ID
            token: JWT token
            expires_at: Token expiration datetime
            
        Returns:
            True if successful, False otherwise
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            token_hash = self._hash_token(token)
            
            query = """
                INSERT INTO user_sessions (user_id, token_hash, expires_at)
                VALUES (%s, %s, %s)
            """
            cursor.execute(query, (user_id, token_hash, expires_at))
            conn.commit()
            
            cursor.close()
            conn.close()
            
            logger.info(f"Session created for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            return False
    
    def is_token_valid(self, token: str) -> bool:
        """
        Check if a token is valid (not revoked and not expired).
        
        Args:
            token: JWT token to check
            
        Returns:
            True if valid, False if revoked or expired
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            token_hash = self._hash_token(token)
            
            query = """
                SELECT expires_at 
                FROM user_sessions 
                WHERE token_hash = %s
            """
            cursor.execute(query, (token_hash,))
            session = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            if not session:
                # Token not found in sessions = likely revoked
                return False
            
            # Check if expired
            if session['expires_at'] < datetime.utcnow():
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to validate token: {e}")
            return False
    
    def revoke_token(self, token: str) -> bool:
        """
        Revoke a specific token (delete from sessions).
        
        Args:
            token: JWT token to revoke
            
        Returns:
            True if successful, False otherwise
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            token_hash = self._hash_token(token)
            
            query = "DELETE FROM user_sessions WHERE token_hash = %s"
            cursor.execute(query, (token_hash,))
            conn.commit()
            
            rows_affected = cursor.rowcount
            
            cursor.close()
            conn.close()
            
            if rows_affected > 0:
                logger.info("Token revoked successfully")
                return True
            else:
                logger.warning("Token not found in sessions")
                return False
                
        except Exception as e:
            logger.error(f"Failed to revoke token: {e}")
            return False
    
    def revoke_all_user_sessions(self, user_id: int) -> bool:
        """
        Revoke all sessions for a specific user.
        
        Args:
            user_id: User's database ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            query = "DELETE FROM user_sessions WHERE user_id = %s"
            cursor.execute(query, (user_id,))
            conn.commit()
            
            rows_affected = cursor.rowcount
            
            cursor.close()
            conn.close()
            
            logger.info(f"Revoked {rows_affected} sessions for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to revoke user sessions: {e}")
            return False
    
    def cleanup_expired_sessions(self) -> int:
        """
        Delete expired sessions from database.
        Should be run periodically as a cleanup job.
        
        Returns:
            Number of sessions deleted
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            query = "DELETE FROM user_sessions WHERE expires_at < %s"
            cursor.execute(query, (datetime.utcnow(),))
            conn.commit()
            
            rows_affected = cursor.rowcount
            
            cursor.close()
            conn.close()
            
            if rows_affected > 0:
                logger.info(f"Cleaned up {rows_affected} expired sessions")
            
            return rows_affected
            
        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions: {e}")
            return 0
    
    def get_user_active_sessions(self, user_id: int) -> list:
        """
        Get all active sessions for a user.
        
        Args:
            user_id: User's database ID
            
        Returns:
            List of session dictionaries
        """
        try:
            conn = get_db_connection()
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            query = """
                SELECT id, created_at, expires_at
                FROM user_sessions
                WHERE user_id = %s AND expires_at > %s
                ORDER BY created_at DESC
            """
            cursor.execute(query, (user_id, datetime.utcnow()))
            sessions = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return sessions
            
        except Exception as e:
            logger.error(f"Failed to get user sessions: {e}")
            return []


# Global session manager instance
session_manager = SessionManager()

