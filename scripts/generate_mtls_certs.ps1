# PowerShell script to generate mTLS certificates for Windows
# Requires OpenSSL to be installed

$ErrorActionPreference = "Stop"

$CERT_DIR = "certs/mtls"
New-Item -ItemType Directory -Force -Path $CERT_DIR | Out-Null

Write-Host "Generating mTLS certificates..." -ForegroundColor Green

# Generate CA private key
Write-Host "1. Generating CA private key..."
openssl genrsa -out "$CERT_DIR/ca.key" 4096

# Generate CA certificate
Write-Host "2. Generating CA certificate..."
openssl req -new -x509 -days 3650 -key "$CERT_DIR/ca.key" -out "$CERT_DIR/ca.crt" `
    -subj "/C=US/ST=State/L=City/O=Organization/CN=MTLS-CA"

# Generate server private key
Write-Host "3. Generating server private key..."
openssl genrsa -out "$CERT_DIR/server.key" 4096

# Generate server certificate signing request
Write-Host "4. Generating server certificate signing request..."
openssl req -new -key "$CERT_DIR/server.key" -out "$CERT_DIR/server.csr" `
    -subj "/C=US/ST=State/L=City/O=Organization/CN=server"

# Sign server certificate with CA
Write-Host "5. Signing server certificate..."
openssl x509 -req -days 365 -in "$CERT_DIR/server.csr" -CA "$CERT_DIR/ca.crt" `
    -CAkey "$CERT_DIR/ca.key" -CAcreateserial -out "$CERT_DIR/server.crt"

# Generate client private key
Write-Host "6. Generating client private key..."
openssl genrsa -out "$CERT_DIR/client.key" 4096

# Generate client certificate signing request
Write-Host "7. Generating client certificate signing request..."
openssl req -new -key "$CERT_DIR/client.key" -out "$CERT_DIR/client.csr" `
    -subj "/C=US/ST=State/L=City/O=Organization/CN=client"

# Sign client certificate with CA
Write-Host "8. Signing client certificate..."
openssl x509 -req -days 365 -in "$CERT_DIR/client.csr" -CA "$CERT_DIR/ca.crt" `
    -CAkey "$CERT_DIR/ca.key" -CAcreateserial -out "$CERT_DIR/client.crt"

# Clean up CSR files
Remove-Item -Path "$CERT_DIR/*.csr" -ErrorAction SilentlyContinue
Remove-Item -Path "$CERT_DIR/*.srl" -ErrorAction SilentlyContinue

Write-Host "`n✅ mTLS certificates generated successfully in $CERT_DIR/" -ForegroundColor Green
Write-Host "`nGenerated files:"
Write-Host "  - ca.crt         : CA certificate (trust anchor)"
Write-Host "  - ca.key         : CA private key (keep secure!)"
Write-Host "  - server.crt     : Server certificate"
Write-Host "  - server.key     : Server private key"
Write-Host "  - client.crt     : Client certificate"
Write-Host "  - client.key     : Client private key"
Write-Host "`n⚠️  SECURITY NOTES:" -ForegroundColor Yellow
Write-Host "  - These are self-signed certificates for development/testing"
Write-Host "  - For production, use certificates from a trusted CA"
Write-Host "  - Keep private keys secure and never commit them to version control"

