# 🚀 راهنمای سریع راه‌اندازی

## ⚠️ پیش‌نیازها

### 1. نصب Docker Desktop برای Windows

1. دانلود از: https://www.docker.com/products/docker-desktop/
2. نصب و راه‌اندازی Docker Desktop
3. اطمینان از فعال بودن Docker Desktop

```powershell
# بررسی نصب Docker
docker --version
docker-compose --version
```

### 2. فایل .env

فایل `.env` از قبل ایجاد شده است. می‌توانید مقادیر را تغییر دهید.

## 🔧 راه‌اندازی سیستم

### مرحله 1: راه‌اندازی تمام سرویس‌ها

```powershell
# در مسیر اصلی پروژه
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# بررسی وضعیت سرویس‌ها
docker-compose ps
```

### مرحله 2: انتظار برای آماده‌سازی Database

```powershell
# بررسی لاگ MySQL
docker-compose logs mysql

# بررسی آماده بودن Database
docker-compose exec mysql mysqladmin ping -h localhost -u root -p
# Password: root_password_123
```

### مرحله 3: راه‌اندازی Frontend (در ترمینال جدید)

```powershell
cd frontend
npm install
npm run dev
```

## 🌐 دسترسی به سرویس‌ها

| سرویس | آدرس | اطلاعات ورود |
|-------|------|--------------|
| **Backend API** | http://localhost:5000 | JWT Token required |
| **Frontend** | http://localhost:5173 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| **MLflow** | http://localhost:5001 | - |
| **InfluxDB** | http://localhost:8086 | Token required |

## 🔐 ورود و دریافت Token

```powershell
# ورود و دریافت Token
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username": "admin", "password": "admin123"}'

# ذخیره Token
$token = $response.token
Write-Host "Token: $token"

# استفاده از Token
Invoke-RestMethod -Uri "http://localhost:5000/api/data/get_live_data" `
  -Headers @{Authorization = "Bearer $token"}
```

## 👤 کاربران پیش‌فرض

- **admin** / **admin123** (نقش: admin)
- **engineer** / **admin123** (نقش: engineer)
- **operator** / **admin123** (نقش: operator)

⚠️ **توجه:** در production حتماً password‌ها را تغییر دهید!

## 📊 بررسی وضعیت سیستم

### مشاهده لاگ‌های سرویس‌ها

```powershell
# Backend
docker-compose logs -f backend

# Kafka
docker-compose logs -f kafka

# DVR Consumer
docker-compose logs -f dvr-consumer

# RTM Consumer
docker-compose logs -f rtm-consumer

# RTO Consumer
docker-compose logs -f rto-consumer
```

### بررسی Metrics در Prometheus

1. باز کردن: http://localhost:9090
2. جستجوی metric: `api_request_duration_seconds`
3. مشاهده metrics دیگر در Grafana: http://localhost:3000

## 🛑 توقف سیستم

```powershell
# توقف تمام سرویس‌ها
docker-compose down

# توقف و حذف volumes
docker-compose down -v
```

## 🔄 راه‌اندازی مجدد

```powershell
# راه‌اندازی مجدد
docker-compose restart

# راه‌اندازی مجدد یک سرویس خاص
docker-compose restart backend
```

## ❗ رفع مشکلات

### مشکل: Port در حال استفاده است

```powershell
# بررسی استفاده از port
netstat -ano | findstr :5000
netstat -ano | findstr :3307
netstat -ano | findstr :9092

# یا تغییر port در docker-compose.yml
```

### مشکل: سرویس‌ها شروع نمی‌شوند

```powershell
# بررسی لاگ‌های خطا
docker-compose logs --tail=50

# بررسی وضعیت
docker-compose ps
```

### مشکل: Database initialize نشده

```powershell
# بررسی init.sql
cat init/init.sql

# اجرای دستی
docker-compose exec mysql mysql -u root -p compressor_db < init/init.sql
# Password: root_password_123
```

## ✅ چک‌لیست راه‌اندازی

- [ ] Docker Desktop نصب و در حال اجرا است
- [ ] فایل `.env` وجود دارد
- [ ] تمام containers در حال اجرا هستند (`docker-compose ps`)
- [ ] Backend API پاسخ می‌دهد (http://localhost:5000)
- [ ] می‌توانید login کنید و Token دریافت کنید
- [ ] Grafana در دسترس است (http://localhost:3000)
- [ ] Prometheus در دسترس است (http://localhost:9090)
- [ ] Frontend در حال اجرا است (http://localhost:5173)

---

**سیستم آماده است!** 🎉

