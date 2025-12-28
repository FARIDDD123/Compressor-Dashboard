# Security: mTLS and Enhanced Rate Limiting

## Overview

This document describes the enhanced security features implemented for the Digital Twin Gas Turbine system:

1. **Enhanced Rate Limiting**: Multi-layer rate limiting with Redis support
2. **mTLS (Mutual TLS)**: Secure inter-service communication with certificate authentication

## Enhanced Rate Limiting

### Features

- ✅ **Multi-layer Protection**: Rate limiting at IP, User, and Endpoint levels
- ✅ **Redis Support**: Distributed rate limiting across multiple instances
- ✅ **Multiple Algorithms**: Sliding window and token bucket algorithms
- ✅ **Adaptive Limits**: Different limits for different endpoint types
- ✅ **Gateway Protection**: Special rate limiting for gateway endpoints (wireless, edge)

### Configuration

#### Environment Variables

```bash
# Enable Redis for distributed rate limiting (optional)
RATE_LIMIT_USE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password  # Optional
```

#### Rate Limit Layers

1. **IP Layer**: Limits requests per IP address
2. **User Layer**: Limits requests per authenticated user (if available)
3. **Endpoint Layer**: Limits requests per specific endpoint

#### Predefined Rate Limiters

```python
from backend.core.enhanced_rate_limiter import (
    strict_rate_limit,
    gateway_rate_limit,
    auth_rate_limit_enhanced,
)

# Very strict rate limiting (5 req/min, multi-layer)
@strict_rate_limit
def critical_endpoint():
    pass

# Gateway endpoints (50 req/min IP, 30 req/min endpoint)
@gateway_rate_limit
def edge_sync_endpoint():
    pass

# Enhanced auth rate limiting (5 req/min IP, 3 req/min endpoint)
@auth_rate_limit_enhanced
def login_endpoint():
    pass
```

#### Custom Rate Limits

```python
from backend.core.enhanced_rate_limiter import enhanced_rate_limit

@enhanced_rate_limit(
    max_requests=100,
    window_seconds=60,
    layer="ip",
    algorithm="sliding_window",
    multi_layer=True,
    limits={
        "ip": {"max_requests": 100, "window_seconds": 60},
        "user": {"max_requests": 200, "window_seconds": 60},
        "endpoint": {"max_requests": 50, "window_seconds": 60},
    }
)
def my_endpoint():
    pass
```

### Algorithms

#### Sliding Window
- Counts requests within a rolling time window
- More accurate than fixed window
- Supports both in-memory and Redis

#### Token Bucket
- Allows burst traffic up to bucket capacity
- Refills tokens at a constant rate
- Good for traffic shaping

### Gateway Endpoint Protection

Gateway endpoints (wireless protocols, edge sync) have stricter rate limiting:

- **IP Layer**: 50 requests per minute
- **Endpoint Layer**: 30 requests per minute

Applied to:
- `/api/wireless/lorawan/webhook`
- `/api/wireless/mqtt/publish`
- `/api/edge/sensor-data`
- `/api/edge/alerts`

## mTLS (Mutual TLS)

### Overview

mTLS provides mutual authentication between services. Both client and server present certificates, ensuring that only authorized services can communicate.

### Architecture

```
Service A (Client) ←→ [mTLS] ←→ Service B (Server)
     ↓                               ↓
  client.crt                      server.crt
  client.key                      server.key
     ↓                               ↓
     └─────────── ca.crt ────────────┘
              (Trust Anchor)
```

### Certificate Generation

#### Using Scripts

**Linux/Mac:**
```bash
chmod +x scripts/generate_mtls_certs.sh
./scripts/generate_mtls_certs.sh
```

**Windows:**
```powershell
.\scripts\generate_mtls_certs.ps1
```

This generates:
- `certs/mtls/ca.crt` - CA certificate (trust anchor)
- `certs/mtls/ca.key` - CA private key
- `certs/mtls/server.crt` - Server certificate
- `certs/mtls/server.key` - Server private key
- `certs/mtls/client.crt` - Client certificate
- `certs/mtls/client.key` - Client private key

### Configuration

#### Environment Variables

```bash
# Enable mTLS
MTLS_ENABLED=true
MTLS_CERTS_DIR=certs/mtls

# Certificate paths (auto-detected if not specified)
MTLS_CA_CERT=certs/mtls/ca.crt
MTLS_CLIENT_CERT=certs/mtls/client.crt
MTLS_CLIENT_KEY=certs/mtls/client.key
MTLS_SERVER_CERT=certs/mtls/server.crt
MTLS_SERVER_KEY=certs/mtls/server.key
```

### Usage in Code

#### For Kafka (mTLS)

```python
from backend.core.kafka_ssl import create_secure_kafka_producer, create_secure_kafka_consumer

# Producer with mTLS
producer = create_secure_kafka_producer(
    bootstrap_servers="kafka:9093",
    use_mtls=True,  # Enable mTLS
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

# Consumer with mTLS
consumer = create_secure_kafka_consumer(
    topic="sensors-raw",
    bootstrap_servers="kafka:9093",
    group_id="my-group",
    use_mtls=True  # Enable mTLS
)
```

#### For HTTP Services (Flask/Gunicorn)

```python
from backend.core.mtls_manager import get_mtls_manager

mtls_manager = get_mtls_manager()

# Create server SSL context
ssl_context = mtls_manager.create_server_ssl_context()

# Use with Gunicorn
# gunicorn --ssl-version TLSv1_2 --certfile server.crt --keyfile server.key app:app
```

### Kafka mTLS Configuration

Update `docker-compose.yml` to enable mTLS for Kafka:

```yaml
kafka:
  environment:
    KAFKA_SSL_CLIENT_AUTH: 'required'  # Enable mTLS
    KAFKA_SSL_TRUSTSTORE_LOCATION: '/etc/kafka/secrets/kafka.server.truststore.jks'
    KAFKA_SSL_TRUSTSTORE_PASSWORD: 'your_password'
```

Update Kafka SSL configuration:

```bash
KAFKA_SSL_ENABLED=true
KAFKA_MTLS_ENABLED=true
```

### Benefits

1. **Service Authentication**: Only services with valid certificates can communicate
2. **Network Security**: Prevents man-in-the-middle attacks
3. **Compliance**: Meets security requirements for industrial systems
4. **Isolation**: Prevents unauthorized access to internal services

## Deployment

### Docker Compose

Add Redis for distributed rate limiting:

```yaml
redis:
  image: redis:7-alpine
  container_name: redis
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
  restart: unless-stopped

volumes:
  redis_data:
```

### Environment Configuration

```bash
# Rate Limiting
RATE_LIMIT_USE_REDIS=true
REDIS_HOST=redis
REDIS_PORT=6379

# mTLS
MTLS_ENABLED=true
MTLS_CERTS_DIR=/app/certs/mtls

# Kafka mTLS
KAFKA_SSL_ENABLED=true
KAFKA_MTLS_ENABLED=true
```

## Security Best Practices

### Rate Limiting

1. **Use Redis in Production**: Enables distributed rate limiting
2. **Adjust Limits**: Tune limits based on expected traffic
3. **Monitor**: Log rate limit violations for security analysis
4. **Whitelist**: Consider IP whitelisting for trusted services

### mTLS

1. **Secure Key Storage**: Never commit private keys to version control
2. **Certificate Rotation**: Rotate certificates regularly (recommended: 90 days)
3. **CA Management**: Use a dedicated CA for production
4. **Certificate Revocation**: Implement CRL or OCSP for certificate revocation
5. **Separate CAs**: Use different CAs for different environments (dev/staging/prod)

## Monitoring

### Rate Limiting Metrics

Monitor rate limit violations:

```python
# Log rate limit violations
logger.warning(f"Rate limit exceeded for {ip} on layer {layer}")
```

### mTLS Metrics

Monitor certificate validation failures:

```python
# Log mTLS failures
logger.error(f"mTLS certificate validation failed: {error}")
```

## Troubleshooting

### Rate Limiting Issues

1. **Too Many 429 Errors**:
   - Increase rate limits
   - Check if Redis is connected (if using distributed mode)
   - Verify rate limit configuration

2. **Redis Connection Issues**:
   - Check Redis host/port
   - Verify Redis is running
   - Check network connectivity

### mTLS Issues

1. **Certificate Not Found**:
   - Verify certificate paths
   - Check file permissions
   - Ensure certificates are mounted in Docker

2. **Certificate Validation Failed**:
   - Verify CA certificate is correct
   - Check certificate expiration
   - Ensure client/server certificates are signed by the same CA

3. **Connection Refused**:
   - Verify mTLS is enabled on both client and server
   - Check firewall rules
   - Verify certificates match service identities

## References

- [TLS/SSL Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Kafka Security](https://kafka.apache.org/documentation/#security)

