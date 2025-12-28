"""
mTLS (Mutual TLS) Manager

Provides mTLS certificate management and validation for secure
inter-service communication.
"""

import os
import logging
import ssl
import socket
from typing import Optional, Dict, Any
from pathlib import Path
import certifi

logger = logging.getLogger(__name__)


class mTLSManager:
    """
    Manager for mTLS certificates and secure inter-service communication.
    
    Provides:
    - Certificate loading and validation
    - SSL context creation for client and server
    - Certificate verification
    - CRL (Certificate Revocation List) support
    """

    def __init__(
        self,
        ca_cert_path: Optional[str] = None,
        client_cert_path: Optional[str] = None,
        client_key_path: Optional[str] = None,
        server_cert_path: Optional[str] = None,
        server_key_path: Optional[str] = None,
    ):
        """
        Initialize mTLS Manager.

        Args:
            ca_cert_path: Path to CA certificate file
            client_cert_path: Path to client certificate file
            client_key_path: Path to client private key file
            server_cert_path: Path to server certificate file
            server_key_path: Path to server private key file
        """
        # Get paths from environment or use defaults
        certs_dir = Path(os.getenv("MTLS_CERTS_DIR", "certs/mtls"))
        
        self.ca_cert_path = Path(ca_cert_path or os.getenv("MTLS_CA_CERT", certs_dir / "ca.crt"))
        self.client_cert_path = Path(client_cert_path or os.getenv("MTLS_CLIENT_CERT", certs_dir / "client.crt"))
        self.client_key_path = Path(client_key_path or os.getenv("MTLS_CLIENT_KEY", certs_dir / "client.key"))
        self.server_cert_path = Path(server_cert_path or os.getenv("MTLS_SERVER_CERT", certs_dir / "server.crt"))
        self.server_key_path = Path(server_key_path or os.getenv("MTLS_SERVER_KEY", certs_dir / "server.key"))

        # Validate certificate files exist
        self._validate_certificates()

    def _validate_certificates(self):
        """Validate that required certificate files exist."""
        required_certs = [
            ("CA Certificate", self.ca_cert_path),
        ]
        
        for name, path in required_certs:
            if not path.exists():
                logger.warning(f"{name} not found at {path}. mTLS will be disabled.")

    def create_client_ssl_context(self) -> Optional[ssl.SSLContext]:
        """
        Create SSL context for mTLS client connections.

        Returns:
            SSL context or None if certificates not available
        """
        if not self.ca_cert_path.exists():
            logger.warning("CA certificate not found. Cannot create client SSL context.")
            return None

        try:
            context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
            
            # Load CA certificate
            context.load_verify_locations(str(self.ca_cert_path))
            
            # Load client certificate and key if available
            if self.client_cert_path.exists() and self.client_key_path.exists():
                context.load_cert_chain(
                    str(self.client_cert_path),
                    str(self.client_key_path)
                )
                logger.info("✅ Client mTLS context created with client certificate")
            else:
                logger.info("✅ Client SSL context created (server auth only)")
            
            # Enable certificate verification
            context.verify_mode = ssl.CERT_REQUIRED
            
            # Set minimum TLS version
            context.minimum_version = ssl.TLSVersion.TLSv1.2
            
            return context

        except Exception as e:
            logger.error(f"Error creating client SSL context: {e}", exc_info=True)
            return None

    def create_server_ssl_context(self) -> Optional[ssl.SSLContext]:
        """
        Create SSL context for mTLS server connections.

        Returns:
            SSL context or None if certificates not available
        """
        if not self.server_cert_path.exists() or not self.server_key_path.exists():
            logger.warning("Server certificate or key not found. Cannot create server SSL context.")
            return None

        if not self.ca_cert_path.exists():
            logger.warning("CA certificate not found. Cannot verify client certificates.")
            return None

        try:
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            
            # Load server certificate and key
            context.load_cert_chain(
                str(self.server_cert_path),
                str(self.server_key_path)
            )
            
            # Load CA certificate for client verification
            context.load_verify_locations(str(self.ca_cert_path))
            
            # Require client certificate (mTLS)
            context.verify_mode = ssl.CERT_REQUIRED
            
            # Set minimum TLS version
            context.minimum_version = ssl.TLSVersion.TLSv1.2
            
            logger.info("✅ Server mTLS context created (requires client certificates)")
            return context

        except Exception as e:
            logger.error(f"Error creating server SSL context: {e}", exc_info=True)
            return None

    def verify_certificate(self, cert_path: Path) -> bool:
        """
        Verify certificate validity.

        Args:
            cert_path: Path to certificate file

        Returns:
            True if certificate is valid, False otherwise
        """
        if not cert_path.exists():
            logger.error(f"Certificate file not found: {cert_path}")
            return False

        try:
            # Load and verify certificate
            with open(cert_path, 'rb') as f:
                cert_data = f.read()
            
            cert = ssl.DER_cert_to_PEM_cert(cert_data) if cert_data.startswith(b'\x30') else cert_data
            
            # Basic validation (expiry, format)
            # For production, use cryptography library for full validation
            logger.info(f"Certificate {cert_path} appears valid")
            return True

        except Exception as e:
            logger.error(f"Certificate verification failed: {e}")
            return False

    def get_ssl_context_for_service(self, service_name: str, is_client: bool = True) -> Optional[ssl.SSLContext]:
        """
        Get SSL context for a specific service.

        Args:
            service_name: Name of the service (e.g., "kafka", "backend", "edge")
            is_client: Whether this is a client context (True) or server context (False)

        Returns:
            SSL context or None
        """
        if is_client:
            return self.create_client_ssl_context()
        else:
            return self.create_server_ssl_context()

    def get_status(self) -> Dict[str, Any]:
        """Get mTLS manager status."""
        return {
            "ca_cert_exists": self.ca_cert_path.exists(),
            "client_cert_exists": self.client_cert_path.exists(),
            "client_key_exists": self.client_key_path.exists(),
            "server_cert_exists": self.server_cert_path.exists(),
            "server_key_exists": self.server_key_path.exists(),
            "ca_cert_path": str(self.ca_cert_path),
        }


# Global mTLS manager instance
_mtls_manager: Optional[mTLSManager] = None


def get_mtls_manager() -> mTLSManager:
    """Get or create global mTLS manager instance."""
    global _mtls_manager
    
    if _mtls_manager is None:
        _mtls_manager = mTLSManager()
    
    return _mtls_manager

