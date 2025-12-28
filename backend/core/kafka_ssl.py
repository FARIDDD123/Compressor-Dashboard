"""
Kafka SSL/TLS and mTLS configuration helpers.
Provides utilities for secure Kafka connections with mutual TLS support.
"""

import os
from typing import Optional, Dict
import ssl
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import KafkaError
import logging

logger = logging.getLogger(__name__)

# Import mTLS manager if available
try:
    from backend.core.mtls_manager import get_mtls_manager
    MTLS_AVAILABLE = True
except ImportError:
    MTLS_AVAILABLE = False
    logger.warning("mTLS manager not available")


def get_kafka_ssl_context(use_mtls: bool = False) -> Optional[ssl.SSLContext]:
    """
    Create SSL context for Kafka connections with optional mTLS support.
    
    Args:
        use_mtls: Enable mutual TLS (client certificate authentication)
    
    Returns:
        SSL context if certificates are configured, None otherwise
    """
    # Check if mTLS should be used
    use_mtls_env = os.getenv("KAFKA_MTLS_ENABLED", "false").lower() == "true"
    use_mtls = use_mtls or use_mtls_env
    
    # Try to use mTLS manager if available and mTLS is enabled
    if use_mtls and MTLS_AVAILABLE:
        try:
            mtls_manager = get_mtls_manager()
            context = mtls_manager.create_client_ssl_context()
            if context:
                logger.info("✅ Kafka mTLS context created using mTLS manager")
                return context
        except Exception as e:
            logger.warning(f"Failed to create mTLS context: {e}. Falling back to standard SSL.")
    
    # Fallback to standard SSL/TLS
    cert_dir = os.getenv("KAFKA_CERT_DIR", "kafka_certs")
    ca_cert_path = os.path.join(cert_dir, "ca-cert.pem")
    client_cert_path = os.path.join(cert_dir, "client.crt")
    client_key_path = os.path.join(cert_dir, "client.key")
    
    # Check if SSL is enabled
    use_ssl = os.getenv("KAFKA_SSL_ENABLED", "false").lower() == "true"
    
    if not use_ssl:
        logger.debug("Kafka SSL is disabled")
        return None
    
    if not os.path.exists(ca_cert_path):
        logger.warning(
            f"Kafka SSL enabled but certificate not found at {ca_cert_path}. "
            "Falling back to insecure connection."
        )
        return None
    
    try:
        context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
        context.load_verify_locations(ca_cert_path)
        context.check_hostname = False  # For self-signed certs in development
        context.verify_mode = ssl.CERT_REQUIRED
        
        # Add client certificate if available (mTLS)
        if use_mtls and os.path.exists(client_cert_path) and os.path.exists(client_key_path):
            context.load_cert_chain(client_cert_path, client_key_path)
            logger.info("✅ Kafka mTLS context created with client certificate")
        else:
            logger.info(f"Kafka SSL context created (standard TLS)")
        
        # Set minimum TLS version
        context.minimum_version = ssl.TLSVersion.TLSv1.2
        
        return context
    except Exception as e:
        logger.error(f"Error creating SSL context: {e}")
        return None


def get_kafka_ssl_config(use_mtls: bool = False) -> Dict:
    """
    Get Kafka SSL configuration dictionary with optional mTLS support.
    
    Args:
        use_mtls: Enable mutual TLS
    
    Returns:
        Dictionary with SSL configuration
    """
    ssl_context = get_kafka_ssl_context(use_mtls=use_mtls)
    
    if ssl_context:
        config = {
            "security_protocol": "SSL",
            "ssl_context": ssl_context,
        }
        
        # Add SASL_SSL if mTLS is enabled (for additional security)
        if use_mtls:
            config["security_protocol"] = "SSL"
            logger.info("Kafka mTLS configuration enabled")
        
        return config
    else:
        return {}


def create_secure_kafka_consumer(
    topic: str,
    bootstrap_servers: str,
    group_id: str,
    use_mtls: bool = False,
    **kwargs
) -> KafkaConsumer:
    """
    Create a secure Kafka consumer with SSL/mTLS support.
    
    Args:
        topic: Kafka topic name
        bootstrap_servers: Kafka broker addresses
        group_id: Consumer group ID
        use_mtls: Enable mutual TLS (client certificate authentication)
        **kwargs: Additional KafkaConsumer parameters
        
    Returns:
        Configured KafkaConsumer instance
    """
    ssl_config = get_kafka_ssl_config(use_mtls=use_mtls)
    
    consumer_config = {
        "bootstrap_servers": bootstrap_servers,
        "group_id": group_id,
        "auto_offset_reset": kwargs.get("auto_offset_reset", "earliest"),
        **ssl_config,
        **{k: v for k, v in kwargs.items() if k != "auto_offset_reset"},
    }
    
    try:
        consumer = KafkaConsumer(topic, **consumer_config)
        mtls_status = "with mTLS" if use_mtls else "with SSL"
        logger.info(f"Created secure Kafka consumer for topic {topic} {mtls_status}")
        return consumer
    except KafkaError as e:
        logger.error(f"Error creating Kafka consumer: {e}")
        raise


def create_secure_kafka_producer(
    bootstrap_servers: str,
    use_mtls: bool = False,
    **kwargs
) -> KafkaProducer:
    """
    Create a secure Kafka producer with SSL/mTLS support.
    
    Args:
        bootstrap_servers: Kafka broker addresses
        use_mtls: Enable mutual TLS (client certificate authentication)
        **kwargs: Additional KafkaProducer parameters
        
    Returns:
        Configured KafkaProducer instance
    """
    ssl_config = get_kafka_ssl_config(use_mtls=use_mtls)
    
    producer_config = {
        "bootstrap_servers": bootstrap_servers,
        **ssl_config,
        **kwargs,
    }
    
    try:
        producer = KafkaProducer(**producer_config)
        mtls_status = "with mTLS" if use_mtls else "with SSL"
        logger.info(f"Created secure Kafka producer {mtls_status}")
        return producer
    except KafkaError as e:
        logger.error(f"Error creating Kafka producer: {e}")
        raise

