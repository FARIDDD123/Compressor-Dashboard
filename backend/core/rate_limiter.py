"""
Rate Limiting middleware for Flask API endpoints.
Protects against DDoS and brute force attacks.
"""

import time
from collections import defaultdict
from functools import wraps
from flask import request, jsonify
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Simple in-memory rate limiter.
    For production, consider using Redis for distributed rate limiting.
    """
    
    def __init__(self):
        self.requests = defaultdict(list)
        self.cleanup_interval = 3600  # Clean up old entries every hour
        self.last_cleanup = time.time()
    
    def _cleanup_old_requests(self):
        """Remove requests older than 1 hour"""
        current_time = time.time()
        if current_time - self.last_cleanup > self.cleanup_interval:
            cutoff_time = current_time - 3600
            for key in list(self.requests.keys()):
                self.requests[key] = [
                    timestamp for timestamp in self.requests[key] 
                    if timestamp > cutoff_time
                ]
                if not self.requests[key]:
                    del self.requests[key]
            self.last_cleanup = current_time
    
    def is_rate_limited(self, key, max_requests, window_seconds):
        """
        Check if a key has exceeded the rate limit.
        
        Args:
            key: Identifier (e.g., IP address)
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            Tuple of (is_limited, retry_after_seconds)
        """
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        
        # Clean up old requests periodically
        self._cleanup_old_requests()
        
        # Filter requests within the time window
        self.requests[key] = [
            timestamp for timestamp in self.requests[key]
            if timestamp > cutoff_time
        ]
        
        # Check if rate limit exceeded
        if len(self.requests[key]) >= max_requests:
            # Calculate when the oldest request will expire
            oldest_request = min(self.requests[key])
            retry_after = int(oldest_request + window_seconds - current_time) + 1
            return True, retry_after
        
        # Add current request
        self.requests[key].append(current_time)
        return False, 0


# Global rate limiter instance
rate_limiter = RateLimiter()


def rate_limit(max_requests=100, window_seconds=60, key_func=None):
    """
    Decorator to apply rate limiting to Flask routes.
    
    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        key_func: Optional function to generate custom key (default: IP address)
        
    Example:
        @app.route("/api/endpoint")
        @rate_limit(max_requests=10, window_seconds=60)
        def my_endpoint():
            return {"message": "Hello"}
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Generate key (default: IP address)
            if key_func:
                key = key_func()
            else:
                key = request.remote_addr or "unknown"
            
            # Check rate limit
            is_limited, retry_after = rate_limiter.is_rate_limited(
                key, max_requests, window_seconds
            )
            
            if is_limited:
                logger.warning(
                    f"Rate limit exceeded for {key}. "
                    f"Limit: {max_requests}/{window_seconds}s"
                )
                return jsonify({
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {retry_after} seconds.",
                    "retry_after": retry_after
                }), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# Predefined rate limiters for common use cases
def auth_rate_limit(f):
    """Strict rate limiting for authentication endpoints"""
    return rate_limit(max_requests=5, window_seconds=60)(f)


def api_rate_limit(f):
    """Standard rate limiting for API endpoints"""
    return rate_limit(max_requests=100, window_seconds=60)(f)


def heavy_rate_limit(f):
    """Restrictive rate limiting for expensive operations"""
    return rate_limit(max_requests=10, window_seconds=60)(f)

