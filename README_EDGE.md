# Edge Computing Module - راهنمای سریع

## خلاصه

ماژول Edge Computing برای سیستم Digital Twin Gas Turbine ایجاد شده است تا پردازش‌های حیاتی در میادین نفتی دورافتاده حتی در حالت قطع ارتباط با سرور مرکزی (Disconnected Operation) انجام شوند.

## ویژگی‌های کلیدی

✅ **پردازش مستقل**: کار در حالت Offline بدون نیاز به ارتباط با Cloud
✅ **Real-Time Monitoring (RTM)**: تشخیص Anomaly با استفاده از ONNX Models
✅ **Data Validation (DVR)**: اعتبارسنجی و تصحیح داده‌های سنسور
✅ **Local Storage**: ذخیره‌سازی محلی با SQLite
✅ **Cloud Sync**: همگام‌سازی خودکار با Cloud هنگام اتصال

## ساختار فایل‌ها

```
edge/
├── __init__.py
├── config.py              # تنظیمات Edge Computing
├── main.py                # Entry point اصلی
├── Dockerfile             # Docker image برای Edge
├── requirements.txt       # Dependencies
├── gateway/
│   ├── __init__.py
│   └── edge_gateway.py    # Gateway اصلی
├── processing/
│   ├── __init__.py
│   ├── rtm_processor.py   # RTM Processor
│   └── dvr_processor.py   # DVR Processor
└── storage/
    ├── __init__.py
    └── local_db.py        # Local Database (SQLite)
```

## نحوه استفاده

### با Docker Compose

```bash
# Start Edge Gateway
docker-compose up edge-gateway

# یا همراه با سایر سرویس‌ها
docker-compose up
```

### Standalone

```bash
cd edge
pip install -r requirements.txt
python main.py
```

## تنظیمات (Environment Variables)

```bash
# حالت عملکرد
EDGE_MODE=auto  # auto, online, offline

# فعال/غیرفعال کردن قابلیت‌ها
EDGE_RTM_ENABLED=true
EDGE_DVR_ENABLED=true
EDGE_ALERTS_ENABLED=true

# اتصال Cloud
CLOUD_API_URL=http://backend:5000
CLOUD_SYNC_ENABLED=true
CLOUD_SYNC_INTERVAL=60  # ثانیه

# نگهداری داده
EDGE_DATA_RETENTION_HOURS=168  # 7 روز
```

## مثال استفاده در کد

```python
from edge.gateway import EdgeGateway

# ایجاد و راه‌اندازی Gateway
gateway = EdgeGateway()
gateway.start()

# پردازش داده سنسور
sensor_data = {
    "timestamp": "2025-01-01T12:00:00Z",
    "Pressure_In": 3.5,
    "Temperature_In": 25.0,
    "Flow_Rate": 12.0,
    "Vibration": 0.8,
    "Efficiency": 0.85,
}

result = gateway.process_sensor_data(sensor_data)

if result["anomaly_detected"]:
    print("⚠️ Anomaly detected!")

if not result["validated"]:
    print("⚠️ Data validation failed")
```

## حالت‌های عملکرد

### 1. Online Mode
همیشه به Cloud متصل است و داده‌ها فوراً همگام‌سازی می‌شوند.

### 2. Offline Mode
همیشه در حالت Offline کار می‌کند، هیچ تلاشی برای اتصال به Cloud نمی‌کند.

### 3. Auto Mode (پیش‌فرض)
به طور خودکار بین Online/Offline تغییر می‌کند بر اساس وضعیت اتصال.

## API Endpoints (Cloud)

Edge Gateway داده‌ها را به این endpoint های Cloud ارسال می‌کند:

- `POST /api/edge/sensor-data` - دریافت داده سنسور از Edge
- `POST /api/edge/alerts` - دریافت Alert از Edge
- `GET /api/edge/health` - Health check

## عملکرد

- **RTM Inference**: < 100ms
- **DVR Processing**: < 10ms
- **Memory Usage**: ~200-500MB
- **Storage**: SQLite (هزاران record به طور کارآمد)

## مستندات کامل

برای اطلاعات بیشتر، مستندات کامل را ببینید:
- [docs/EDGE_COMPUTING.md](docs/EDGE_COMPUTING.md)

## نکات مهم

1. **مدل‌های ONNX** باید در فولدر `artifacts/` موجود باشند
2. **فولدر `edge_data/`** برای ذخیره SQLite database ایجاد می‌شود
3. داده‌های قدیمی به صورت خودکار پاک می‌شوند (بر اساس `EDGE_DATA_RETENTION_HOURS`)
4. در حالت قطع ارتباط، تمام داده‌ها محلی ذخیره می‌شوند و بعداً sync می‌شوند

## Troubleshooting

### Gateway شروع نمی‌شود
- بررسی کنید فایل‌های مدل در `artifacts/` موجود باشند
- لاگ‌ها را بررسی کنید: `edge_data/edge.log`

### Sync کار نمی‌کند
- `CLOUD_API_URL` را بررسی کنید
- اتصال شبکه به Cloud Server را چک کنید

## امنیت

- از HTTPS/TLS برای ارتباط با Cloud استفاده کنید
- SQLite database را encrypt کنید (برای داده‌های حساس)
- Authentication را برای API endpoints پیاده‌سازی کنید

