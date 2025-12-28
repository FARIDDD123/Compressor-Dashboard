"""
Enhanced Rate Limiting with Multi-layer Protection

Provides advanced rate limiting features:
- Multi-layer rate limiting (IP, User, Endpoint)
- Redis support for distributed rate limiting
- Adaptive rate limiting
- Sliding window and token bucket algorithms
"""

import time
import logging
import hashlib
from collections import defaultdict
from functools import wraps
from typing import Optional, Tuple, Dict, Any
from flask import request, jsonify, g
import os

logger = logging.getLogger(__name__)

# Try to import Redis for distributed rate limiting
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available. Using in-memory rate limiting.")


class EnhancedRateLimiter:
    """
    Enhanced rate limiter with multiple layers and algorithms.
    
    Supports:
    - In-memory rate limiting (default)
    - Redis-based distributed rate limiting
    - Sliding window algorithm
    - Token bucket algorithm
    - Multi-layer protection (IP, User, Endpoint)
    """

    def __init__(
        self,
        use_redis: bool = False,
        redis_host: Optional[str] = None,
        redis_port: int = 6379,
        redis_db: int = 0,
        redis_password: Optional[str] = None,
    ):
        """
        Initialize enhanced rate limiter.

        Args:
            use_redis: Use Redis for distributed rate limiting
            redis_host: Redis host (defaults to env var)
            redis_port: Redis port
            redis_db: Redis database number
            redis_password: Redis password
        """
        self.use_redis = use_redis and REDIS_AVAILABLE
        self.redis_client = None
        
        if self.use_redis:
            try:
                self.redis_client = redis.Redis(
                    host=redis_host or os.getenv("REDIS_HOST", "localhost"),
                    port=redis_port or int(os.getenv("REDIS_PORT", "6379")),
                    db=redis_db,
                    password=redis_password or os.getenv("REDIS_PASSWORD", None),
                    decode_responses=True,
                    socket_connect_timeout=5,
                )
                # Test connection
                self.redis_client.ping()
                logger.info("✅ Connected to Redis for distributed rate limiting")
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}. Falling back to in-memory.")
                self.use_redis = False
                self.redis_client = None

        # In-memory storage (fallback)
        self.memory_storage = defaultdict(dict)  # {key: {window: [timestamps]}}
        self.token_buckets = defaultdict(dict)  # {key: {tokens: count, last_refill: time}}
        
    def _get_key(self, identifier: str, layer: str = "ip") -> str:
        """Generate rate limit key."""
        return f"rate_limit:{layer}:{identifier}"

    def _sliding_window_redis(
        self, key: str, max_requests: int, window_seconds: int
    ) -> Tuple[bool, int]:
        """Sliding window rate limiting using Redis."""
        if not self.redis_client:
            return False, 0

        try:
            current_time = time.time()
            window_start = current_time - window_seconds
            
            # Use sorted set for sliding window
            pipe = self.redis_client.pipeline()
            
            # Remove old entries
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time): current_time})
            
            # Set expiry
            pipe.expire(key, window_seconds + 1)
            
            results = pipe.execute()
            current_count = results[1]
            
            if current_count >= max_requests:
                # Get oldest entry
                oldest = self.redis_client.zrange(key, 0, 0, withscores=True)
                if oldest:
                    oldest_time = oldest[0][1]
                    retry_after = int(oldest_time + window_seconds - current_time) + 1
                else:
                    retry_after = window_seconds
                return True, retry_after
            
            return False, 0

        except Exception as e:
            logger.error(f"Redis rate limiting error: {e}")
            # Fallback to memory
            return self._sliding_window_memory(key, max_requests, window_seconds)

    def _sliding_window_memory(
        self, key: str, max_requests: int, window_seconds: int
    ) -> Tuple[bool, int]:
        """Sliding window rate limiting using in-memory storage."""
        current_time = time.time()
        window_start = current_time - window_seconds
        
        if key not in self.memory_storage:
            self.memory_storage[key] = {"timestamps": []}
        
        timestamps = self.memory_storage[key]["timestamps"]
        
        # Remove old entries
        timestamps[:] = [ts for ts in timestamps if ts > window_start]
        
        # Check limit
        if len(timestamps) >= max_requests:
            oldest = min(timestamps)
            retry_after = int(oldest + window_seconds - current_time) + 1
            return True, retry_after
        
        # Add current request
        timestamps.append(current_time)
        return False, 0

    def _token_bucket(
        self, key: str, max_tokens: int, refill_rate: float, tokens_per_request: int = 1
    ) -> Tuple[bool, int]:
        """
        Token bucket algorithm.
        
        Args:
            key: Rate limit key
            max_tokens: Maximum tokens in bucket
            refill_rate: Tokens added per second
            tokens_per_request: Tokens consumed per request
        """
        current_time = time.time()
        
        if key not in self.token_buckets:
            self.token_buckets[key] = {
                "tokens": max_tokens,
                "last_refill": current_time,
            }
        
        bucket = self.token_buckets[key]
        
        # Refill tokens
        time_passed = current_time - bucket["last_refill"]
        tokens_to_add = time_passed * refill_rate
        bucket["tokens"] = min(max_tokens, bucket["tokens"] + tokens_to_add)
        bucket["last_refill"] = current_time
        
        # Check if enough tokens
        if bucket["tokens"] >= tokens_per_request:
            bucket["tokens"] -= tokens_per_request
            return False, 0
        
        # Calculate wait time
        tokens_needed = tokens_per_request - bucket["tokens"]
        wait_time = int(tokens_needed / refill_rate) + 1
        return True, wait_time

    def check_rate_limit(
        self,
        identifier: str,
        max_requests: int,
        window_seconds: int,
        layer: str = "ip",
        algorithm: str = "sliding_window",
    ) -> Tuple[bool, int]:
        """
        Check rate limit.

        Args:
            identifier: Unique identifier (IP, user_id, etc.)
            max_requests: Maximum requests allowed
            window_seconds: Time window in seconds
            layer: Rate limit layer ("ip", "user", "endpoint")
            algorithm: Algorithm to use ("sliding_window" or "token_bucket")

        Returns:
            Tuple of (is_limited, retry_after_seconds)
        """
        key = self._get_key(identifier, layer)
        
        if algorithm == "token_bucket":
            # Use token bucket (refill rate = max_requests / window_seconds)
            refill_rate = max_requests / window_seconds
            return self._token_bucket(key, max_requests, refill_rate)
        else:
            # Use sliding window
            if self.use_redis:
                return self._sliding_window_redis(key, max_requests, window_seconds)
            else:
                return self._sliding_window_memory(key, max_requests, window_seconds)

    def check_multi_layer(
        self,
        ip_address: str,
        user_id: Optional[str] = None,
        endpoint: Optional[str] = None,
        limits: Dict[str, Dict[str, int]] = None,
    ) -> Tuple[bool, int, str]:
        """
        Check rate limit across multiple layers.

        Args:
            ip_address: Client IP address
            user_id: User ID (if authenticated)
            endpoint: API endpoint path
            limits: Dictionary of limits per layer, e.g.:
                {
                    "ip": {"max_requests": 100, "window_seconds": 60},
                    "user": {"max_requests": 200, "window_seconds": 60},
                    "endpoint": {"max_requests": 50, "window_seconds": 60},
                }

        Returns:
            Tuple of (is_limited, retry_after_seconds, layer_that_limited)
        """
        default_limits = {
            "ip": {"max_requests": 100, "window_seconds": 60},
            "user": {"max_requests": 200, "window_seconds": 60},
            "endpoint": {"max_requests": 50, "window_seconds": 60},
        }
        limits = limits or default_limits

        # Check IP layer (always checked)
        if "ip" in limits:
            limit = limits["ip"]
            is_limited, retry_after = self.check_rate_limit(
                ip_address, limit["max_requests"], limit["window_seconds"], "ip"
            )
            if is_limited:
                return True, retry_after, "ip"

        # Check user layer (if authenticated)
        if user_id and "user" in limits:
            limit = limits["user"]
            is_limited, retry_after = self.check_rate_limit(
                user_id, limit["max_requests"], limit["window_seconds"], "user"
            )
            if is_limited:
                return True, retry_after, "user"

        # Check endpoint layer (if specified)
        if endpoint and "endpoint" in limits:
            limit = limits["endpoint"]
            endpoint_key = f"{ip_address}:{endpoint}"
            is_limited, retry_after = self.check_rate_limit(
                endpoint_key, limit["max_requests"], limit["window_seconds"], "endpoint"
            )
            if is_limited:
                return True, retry_after, "endpoint"

        return False, 0, ""

    def reset_rate_limit(self, identifier: str, layer: str = "ip"):
        """Reset rate limit for an identifier (admin function)."""
        key = self._get_key(identifier, layer)
        
        if self.use_redis and self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception as e:
                logger.error(f"Error resetting Redis rate limit: {e}")
        else:
            if key in self.memory_storage:
                del self.memory_storage[key]
            if key in self.token_buckets:
                del self.token_buckets[key]


# Global enhanced rate limiter instance
_enhanced_rate_limiter: Optional[EnhancedRateLimiter] = None


def get_rate_limiter() -> EnhancedRateLimiter:
    """Get or create global rate limiter instance."""
    global _enhanced_rate_limiter
    
    if _enhanced_rate_limiter is None:
        use_redis = os.getenv("RATE_LIMIT_USE_REDIS", "false").lower() == "true"
        _enhanced_rate_limiter = EnhancedRateLimiter(use_redis=use_redis)
    
    return _enhanced_rate_limiter


def enhanced_rate_limit(
    max_requests: int = 100,
    window_seconds: int = 60,
    layer: str = "ip",
    algorithm: str = "sliding_window",
    multi_layer: bool = False,
    limits: Optional[Dict[str, Dict[str, int]]] = None,
):
    """
    Enhanced rate limit decorator.

    Args:
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds
        layer: Rate limit layer ("ip", "user", "endpoint")
        algorithm: Algorithm ("sliding_window" or "token_bucket")
        multi_layer: Enable multi-layer rate limiting
        limits: Custom limits for multi-layer (if multi_layer=True)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            rate_limiter = get_rate_limiter()
            
            # Get identifier
            ip_address = request.remote_addr or "unknown"
            user_id = getattr(g, "user_id", None) if hasattr(g, "user_id") else None
            endpoint = request.path

            if multi_layer:
                # Multi-layer rate limiting
                is_limited, retry_after, limited_layer = rate_limiter.check_multi_layer(
                    ip_address, user_id, endpoint, limits
                )
            else:
                # Single-layer rate limiting
                identifier = ip_address
                if layer == "user" and user_id:
                    identifier = user_id
                elif layer == "endpoint":
                    identifier = f"{ip_address}:{endpoint}"

                is_limited, retry_after = rate_limiter.check_rate_limit(
                    identifier, max_requests, window_seconds, layer, algorithm
                )
                limited_layer = layer

            if is_limited:
                logger.warning(
                    f"Rate limit exceeded for {identifier} on layer {limited_layer}. "
                    f"Limit: {max_requests}/{window_seconds}s"
                )
                return jsonify({
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {retry_after} seconds.",
                    "retry_after": retry_after,
                    "layer": limited_layer,
                }), 429

            return f(*args, **kwargs)
        return decorated_function
    return decorator


# Predefined enhanced rate limiters
def strict_rate_limit(f):
    """Very strict rate limiting (5 req/min, multi-layer)."""
    limits = {
        "ip": {"max_requests": 5, "window_seconds": 60},
        "user": {"max_requests": 10, "window_seconds": 60},
        "endpoint": {"max_requests": 3, "window_seconds": 60},
    }
    return enhanced_rate_limit(multi_layer=True, limits=limits)(f)


def gateway_rate_limit(f):
    """Rate limiting for gateway endpoints (wireless, edge)."""
    limits = {
        "ip": {"max_requests": 50, "window_seconds": 60},
        "endpoint": {"max_requests": 30, "window_seconds": 60},
    }
    return enhanced_rate_limit(multi_layer=True, limits=limits)(f)


def auth_rate_limit_enhanced(f):
    """Enhanced rate limiting for authentication (strict, multi-layer)."""
    limits = {
        "ip": {"max_requests": 5, "window_seconds": 60},
        "endpoint": {"max_requests": 3, "window_seconds": 60},
    }
    return enhanced_rate_limit(multi_layer=True, limits=limits)(f)

