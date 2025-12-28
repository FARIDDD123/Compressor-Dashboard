# 🚀 راهنمای کامل راه‌اندازی سیستم

این راهنما تمام مراحل راه‌اندازی سیستم Digital Twin Gas Turbine 1 را شرح می‌دهد.

## 📋 پیش‌نیازها

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (برای Frontend)
- 8GB+ RAM recommended

## 🔧 راه‌اندازی

### 1. کلون کردن و تنظیمات اولیه

```bash
# Clone repository
git clone <repository-url>
cd digital-twine-gas-turbine-1

# Create .env file
cp .env.example .env  # اگر وجود دارد
# یا فایل .env را با مقادیر زیر ایجاد کنید:
```

### 2. تنظیم Environment Variables

فایل `.env` را ایجاد کنید:

```env
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=your_password
DB_DATABASE=compressor_db

# InfluxDB
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=your_influx_token
INFLUXDB_ORG=your_org
INFLUXDB_BUCKET=compressor_metrics

# Kafka
KAFKA_BROKER_URL=kafka:9092
KAFKA_CLUSTER_ID=test-cluster
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_EXPIRATION_HOURS=24

# OPC-UA (optional)
OPCUA_ENDPOINT_URL=opc.tcp://localhost:4840
OPCUA_USERNAME=opcua_user
OPCUA_PASSWORD=opcua_password

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# MLflow
MLFLOW_TRACKING_URI=http://mlflow:5000
```

### 3. راه‌اندازی Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

### 4. Initialize Database

Database به صورت خودکار با `init/init.sql` initialize می‌شود.

Default users:
- **admin** / **admin123** (role: admin)
- **engineer** / **admin123** (role: engineer)
- **operator** / **admin123** (role: operator)

⚠️ **توجه:** در production حتماً password‌ها را تغییر دهید!

### 5. راه‌اندازی Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend در http://localhost:5173 در دسترس است.

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Backend API** | http://localhost:5000 | JWT Token required |
| **Frontend** | http://localhost:5173 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| **MLflow** | http://localhost:5001 | - |
| **InfluxDB** | http://localhost:8086 | Token required |

## 🔐 Authentication

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### استفاده از Token

```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:5000/api/data/get_live_data \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Monitoring

### Prometheus Metrics

Metrics در دسترس هستند در:
- Backend: http://localhost:8000/metrics
- DVR Consumer: http://localhost:8000/metrics
- RTM Consumer: http://localhost:8000/metrics

### Grafana Dashboards

1. Login به Grafana
2. Dashboards به صورت خودکار load می‌شوند
3. System Overview و Data Quality dashboards در دسترس هستند

## 🔄 Workflow Example

### 1. Data Flow:
```
Sensor Data → Kafka (sensors-raw) → DVR Consumer → Kafka (sensors-validated) 
→ RTM Consumer → Anomaly Detection → Alerts
→ RTO Consumer → Optimization Suggestions → Digital Twin Gas Turbine 1 Validation
→ InfluxDB → API → Frontend
```

### 2. Control Action:
```
1. RTO generates suggestion
2. Engineer reviews and approves
3. Digital Twin Gas Turbine 1 validates
4. Action executed via OPC-UA
5. Audit trail logged
```

## 🧪 Testing

### Backend Tests:
```bash
pytest --cov=backend --cov-report=html
```

### Frontend Tests:
```bash
cd frontend
npm test
```

## 📝 Troubleshooting

### مشکل: Kafka connection failed
```bash
# Check Kafka status
docker-compose ps kafka

# Check logs
docker-compose logs kafka
```

### مشکل: Database connection error
```bash
# Check MySQL health
docker-compose exec mysql mysqladmin ping -h localhost -u root -p
```

### مشکل: Metrics not showing
- بررسی کنید که metrics server در حال اجرا است
- Port 8000 باز باشد
- Prometheus config درست باشد

## ✅ Verification Checklist

- [ ] تمام containers در حال اجرا هستند
- [ ] Database initialized شده است
- [ ] Default users ایجاد شده‌اند
- [ ] Authentication کار می‌کند
- [ ] Metrics در Prometheus قابل مشاهده هستند
- [ ] Grafana dashboards load می‌شوند
- [ ] MLflow UI در دسترس است
- [ ] Data flow کار می‌کند
- [ ] Tests pass می‌شوند

---

**سیستم آماده برای استفاده است!** 🎉

