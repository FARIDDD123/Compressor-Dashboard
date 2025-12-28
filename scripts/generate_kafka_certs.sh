#!/bin/bash
# Generate self-signed SSL certificates for Kafka TLS/SSL
# For production, use certificates from a trusted CA

set -e

CERT_DIR="kafka_certs"
mkdir -p $CERT_DIR

# Generate CA key and certificate
echo "Generating CA key and certificate..."
openssl req -new -x509 -keyout $CERT_DIR/ca-key -out $CERT_DIR/ca-cert -days 365 -subj "/CN=Kafka-CA" -passout pass:test1234

# Generate keystore for Kafka broker
echo "Generating Kafka broker keystore..."
keytool -keystore $CERT_DIR/kafka.server.keystore.jks -alias localhost -validity 365 -genkey -keyalg RSA \
    -storepass test1234 -keypass test1234 -dname "CN=kafka"

# Import CA certificate into broker truststore
echo "Importing CA certificate into broker truststore..."
keytool -keystore $CERT_DIR/kafka.server.truststore.jks -alias CARoot -import -file $CERT_DIR/ca-cert \
    -storepass test1234 -noprompt

# Sign broker certificate
echo "Signing broker certificate..."
keytool -keystore $CERT_DIR/kafka.server.keystore.jks -alias localhost -certreq -file $CERT_DIR/cert-file \
    -storepass test1234
openssl x509 -req -CA $CERT_DIR/ca-cert -CAkey $CERT_DIR/ca-key -in $CERT_DIR/cert-file \
    -out $CERT_DIR/cert-signed -days 365 -CAcreateserial -passin pass:test1234
keytool -keystore $CERT_DIR/kafka.server.keystore.jks -alias CARoot -import -file $CERT_DIR/ca-cert \
    -storepass test1234 -noprompt
keytool -keystore $CERT_DIR/kafka.server.keystore.jks -alias localhost -import -file $CERT_DIR/cert-signed \
    -storepass test1234

# Create client truststore (for Python clients)
echo "Creating client truststore..."
keytool -keystore $CERT_DIR/kafka.client.truststore.jks -alias CARoot -import -file $CERT_DIR/ca-cert \
    -storepass test1234 -noprompt

# Export CA certificate in PEM format for Python
openssl x509 -in $CERT_DIR/ca-cert -out $CERT_DIR/ca-cert.pem -outform PEM

echo "✅ Certificates generated successfully in $CERT_DIR/"
echo "⚠️  Note: These are self-signed certificates for development only!"
echo "⚠️  For production, use certificates from a trusted CA!"

