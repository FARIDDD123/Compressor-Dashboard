#!/bin/bash
# Generate mTLS (Mutual TLS) certificates for inter-service communication
# This script creates CA, server, and client certificates

set -e

CERT_DIR="certs/mtls"
mkdir -p $CERT_DIR

echo "Generating mTLS certificates..."

# Generate CA private key
echo "1. Generating CA private key..."
openssl genrsa -out $CERT_DIR/ca.key 4096

# Generate CA certificate
echo "2. Generating CA certificate..."
openssl req -new -x509 -days 3650 -key $CERT_DIR/ca.key -out $CERT_DIR/ca.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=MTLS-CA"

# Generate server private key
echo "3. Generating server private key..."
openssl genrsa -out $CERT_DIR/server.key 4096

# Generate server certificate signing request
echo "4. Generating server certificate signing request..."
openssl req -new -key $CERT_DIR/server.key -out $CERT_DIR/server.csr \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=server"

# Sign server certificate with CA
echo "5. Signing server certificate..."
openssl x509 -req -days 365 -in $CERT_DIR/server.csr -CA $CERT_DIR/ca.crt \
    -CAkey $CERT_DIR/ca.key -CAcreateserial -out $CERT_DIR/server.crt

# Generate client private key
echo "6. Generating client private key..."
openssl genrsa -out $CERT_DIR/client.key 4096

# Generate client certificate signing request
echo "7. Generating client certificate signing request..."
openssl req -new -key $CERT_DIR/client.key -out $CERT_DIR/client.csr \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=client"

# Sign client certificate with CA
echo "8. Signing client certificate..."
openssl x509 -req -days 365 -in $CERT_DIR/client.csr -CA $CERT_DIR/ca.crt \
    -CAkey $CERT_DIR/ca.key -CAcreateserial -out $CERT_DIR/client.crt

# Set proper permissions
chmod 600 $CERT_DIR/*.key
chmod 644 $CERT_DIR/*.crt

# Clean up CSR files
rm -f $CERT_DIR/*.csr
rm -f $CERT_DIR/*.srl

echo "✅ mTLS certificates generated successfully in $CERT_DIR/"
echo ""
echo "Generated files:"
echo "  - ca.crt         : CA certificate (trust anchor)"
echo "  - ca.key         : CA private key (keep secure!)"
echo "  - server.crt     : Server certificate"
echo "  - server.key     : Server private key"
echo "  - client.crt     : Client certificate"
echo "  - client.key     : Client private key"
echo ""
echo "⚠️  SECURITY NOTES:"
echo "  - These are self-signed certificates for development/testing"
echo "  - For production, use certificates from a trusted CA"
echo "  - Keep private keys secure and never commit them to version control"
echo "  - Consider using a certificate management system (e.g., HashiCorp Vault)"

