# Kafka SSL/TLS Setup Guide

این راهنما نحوه پیکربندی SSL/TLS برای Kafka را شرح می‌دهد.

## 📋 پیش‌نیازها

- OpenSSL
- Java keytool (برای تولید keystores)

## 🔐 تولید Certificates

### مرحله 1: اجرای اسکریپت تولید Certificate

```bash
chmod +x scripts/generate_kafka_certs.sh
./scripts/generate_kafka_certs.sh
```

این اسکریپت موارد زیر را تولید می‌کند:
- `kafka_certs/ca-cert.pem` - CA certificate (برای clients)
- `kafka_certs/kafka.server.keystore.jks` - Server keystore
- `kafka_certs/kafka.server.truststore.jks` - Server truststore
- `kafka_certs/kafka.client.truststore.jks` - Client truststore

### مرحله 2: فعال‌سازی SSL در Kafka

در فایل `.env` اضافه کنید:

```env
KAFKA_SSL_ENABLED=true
KAFKA_CERT_DIR=kafka_certs
KAFKA_INTER_BROKER_LISTENER=SSL  # برای استفاده از SSL بین brokers
```

### مرحله 3: پیکربندی docker-compose

گزینه‌های SSL در `docker-compose.yml` با کامنت مشخص شده‌اند. برای فعال‌سازی:

1. Uncomment کردن SSL environment variables در سرویس Kafka
2. اطمینان از mount شدن volume certificates

## 🔧 استفاده در Python Clients

### استفاده از Secure Producer

```python
from backend.core.kafka_ssl import create_secure_kafka_producer

producer = create_secure_kafka_producer(
    bootstrap_servers="kafka:9093",  # Use SSL port
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
```

### استفاده از Secure Consumer

```python
from backend.core.kafka_ssl import create_secure_kafka_consumer

consumer = create_secure_kafka_consumer(
    topic="sensors-raw",
    bootstrap_servers="kafka:9093",  # Use SSL port
    group_id="my-group"
)
```

## ⚠️ نکات امنیتی

1. **Development vs Production:**
   - Certificates تولید شده self-signed هستند و فقط برای development مناسبند
   - برای production، از certificates واقعی از CA استفاده کنید

2. **Password Management:**
   - در production، passwords را در environment variables نگه دارید
   - هرگز passwords را در کد hard-code نکنید

3. **Certificate Rotation:**
   - Certificates باید به صورت دوره‌ای rotate شوند
   - یک plan برای certificate renewal داشته باشید

## 🧪 تست SSL Connection

```python
from backend.core.kafka_ssl import get_kafka_ssl_context

ssl_ctx = get_kafka_ssl_context()
if ssl_ctx:
    print("SSL is configured correctly")
else:
    print("SSL is not configured or disabled")
```

## 📝 Migration Guide

برای migrate کردن existing consumers به SSL:

1. `KAFKA_SSL_ENABLED=true` را در `.env` set کنید
2. Producer/Consumer creation را به `create_secure_kafka_*` functions تغییر دهید
3. Port را از `9092` به `9093` تغییر دهید
4. تست کنید و اطمینان حاصل کنید که connection برقرار است

## 🐛 Troubleshooting

### مشکل: "SSL handshake failed"
- بررسی کنید که certificates در مسیر صحیح هستند
- اطمینان حاصل کنید که port 9093 باز است

### مشکل: "Certificate verification failed"
- برای development، `check_hostname=False` در SSL context set شده است
- در production، hostname verification باید فعال باشد

### مشکل: "Kafka broker not available"
- بررسی کنید که Kafka با SSL listeners شروع شده است
- Logs کافکا را بررسی کنید

