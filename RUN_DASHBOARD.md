# راهنمای کامل اجرای Dashboard
## Complete Dashboard Startup Guide

**تاریخ:** 2025-01-27

---

## 🚀 اجرای سریع (Quick Start)

### 1. Frontend (React + Vite)

```bash
# رفتن به پوشه frontend
cd frontend

# نصب dependencies (اگر نصب نشده)
npm install

# اجرای development server
npm run dev
```

**نتیجه:**
- ✅ Frontend روی http://localhost:5178 اجرا می‌شود
- ✅ Hot Module Replacement (HMR) فعال است
- ✅ Performance monitoring فعال است
- ✅ Error logging فعال است

---

## 📋 جزئیات کامل

### Frontend Configuration

#### Port:
- **Default:** 5178
- **Alternative:** اگر 5178 اشغال باشد، Vite به صورت خودکار port بعدی را استفاده می‌کند

#### Environment Variables:

فایل `.env` را در `frontend/` ایجاد کنید:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# WebSocket Configuration
VITE_SOCKET_URL=http://localhost:5000

# Error Logging
VITE_ERROR_LOGGING_ENABLED=true
VITE_ERROR_LOGGING_SERVICE_URL=

# Performance Monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SERVICE_URL=
```

#### Features فعال:

✅ **Security:**
- SessionStorage برای token storage
- CSRF protection
- WebSocket authentication
- Error logging

✅ **Performance:**
- Code splitting
- Virtualization برای لیست‌های بزرگ
- Memoization
- Bundle optimization

✅ **Monitoring:**
- Performance metrics (LCP, FID, CLS, TBT)
- Error tracking
- Memory usage monitoring

---

## 🔧 Backend Setup (اختیاری)

### اگر Backend دارید:

#### Python Flask Backend:

```bash
# در یک terminal جداگانه
cd backend  # یا مسیر backend شما

# نصب dependencies
pip install flask flask-socketio flask-cors

# اجرای server
python app.py
# یا
flask run
```

#### Backend Requirements:

1. **Port:** 5000 (default)
2. **CORS:** باید فعال باشد
3. **Endpoints مورد نیاز:**

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
GET    /api/rtm/historical
GET    /api/rto/history
GET    /api/pdm/predictions
WebSocket: socket.io events
```

4. **CSRF Protection:**
   - باید header `X-CSRF-Token` را validate کند
   - Token باید در session ذخیره شود

5. **WebSocket Authentication:**
   - باید token را از `auth.token` دریافت کند
   - باید connection را authenticate کند

---

## 📊 وضعیت Dashboard

### صفحات موجود:

1. **Dashboard (Display Page)**
   - URL: http://localhost:5178/
   - Real-time monitoring
   - System overview

2. **Monitoring (DVR)**
   - URL: http://localhost:5178/dvr
   - Data validation and reconciliation
   - Sensor status

3. **Alarms**
   - URL: http://localhost:5178/alarms
   - Real-time alerts
   - Anomaly detection

4. **Real-Time Optimization (RTO)**
   - URL: http://localhost:5178/real-time-op
   - Optimization suggestions
   - Performance metrics

5. **Predictive Maintenance (PdM)**
   - URL: http://localhost:5178/pdm
   - RUL predictions
   - Maintenance scheduling

6. **3D Analysis**
   - URL: http://localhost:5178/3d-analysis
   - 3D visualization
   - Interactive model

7. **Graph Analysis**
   - URL: http://localhost:5178/graph-analysis
   - Advanced charts
   - Data analysis

8. **Control**
   - URL: http://localhost:5178/control
   - System control
   - Parameter adjustment

---

## 🎯 دسترسی به Dashboard

### مرورگر:

1. مرورگر را باز کنید
2. به آدرس زیر بروید:
   ```
   http://localhost:5178
   ```
3. Dashboard را مشاهده کنید

### Default Users (اگر backend دارید):

```
Username: admin
Password: admin123

Username: engineer
Password: admin123

Username: operator
Password: admin123
```

---

## 🔍 بررسی وضعیت

### Frontend Status:

```bash
# بررسی port
netstat -ano | findstr :5178

# یا در PowerShell
Get-NetTCPConnection -LocalPort 5178 -ErrorAction SilentlyContinue
```

### Console Logs:

در browser console (F12) می‌توانید:
- ✅ Performance metrics را ببینید
- ✅ Error logs را ببینید
- ✅ WebSocket connection status را ببینید

---

## ⚠️ Troubleshooting

### مشکل: Port 5178 در حال استفاده است

**راه‌حل:**
- Vite به صورت خودکار port بعدی را امتحان می‌کند
- یا در `vite.config.js` port را تغییر دهید

### مشکل: API calls fail می‌شوند

**راه‌حل:**
- بررسی کنید که backend روی port 5000 اجرا می‌شود
- CORS را در backend تنظیم کنید
- Environment variables را بررسی کنید

### مشکل: WebSocket connection برقرار نمی‌شود

**راه‌حل:**
- بررسی کنید که backend WebSocket را support می‌کند
- Authentication token را بررسی کنید
- Firewall را بررسی کنید

### مشکل: Performance metrics نمایش داده نمی‌شوند

**راه‌حل:**
- Console را باز کنید (F12)
- بررسی کنید که `VITE_PERFORMANCE_MONITORING=true` است
- Metrics در console نمایش داده می‌شوند

---

## 📈 Performance Monitoring

### Metrics Tracked:

- **Page Load Time:** زمان بارگذاری صفحه
- **First Contentful Paint (FCP):** اولین محتوای قابل مشاهده
- **Largest Contentful Paint (LCP):** بزرگترین محتوای قابل مشاهده
- **First Input Delay (FID):** تاخیر اولین ورودی کاربر
- **Cumulative Layout Shift (CLS):** تغییرات layout
- **Total Blocking Time (TBT):** زمان blocking
- **Memory Usage:** استفاده از حافظه (Chrome only)

### مشاهده Metrics:

1. Browser console را باز کنید (F12)
2. به tab "Console" بروید
3. Performance metrics به صورت خودکار نمایش داده می‌شوند

---

## 🛠️ Scripts مفید

### Development:

```bash
npm run dev          # اجرای development server
npm run build        # Build برای production
npm run preview      # Preview production build
```

### Code Quality:

```bash
npm run lint         # بررسی ESLint
npm run lint:fix     # رفع ESLint errors
npm run format       # فرمت با Prettier
npm run format:check # بررسی فرمت
npm run type-check   # بررسی TypeScript
npm run quality      # تمام quality checks
```

### Testing:

```bash
npm run test         # اجرای tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### Analysis:

```bash
npm run build:analyze # Bundle analysis
```

---

## 📝 نکات مهم

1. **Frontend می‌تواند بدون backend اجرا شود:**
   - UI و صفحات نمایش داده می‌شوند
   - Sample data استفاده می‌شود
   - Login/Logout کار نمی‌کند
   - API calls fail می‌شوند

2. **برای عملکرد کامل:**
   - Backend باید روی port 5000 اجرا شود
   - WebSocket باید فعال باشد
   - CORS باید تنظیم شود

3. **Performance:**
   - Metrics در development mode در console نمایش داده می‌شوند
   - در production می‌توانند به external service ارسال شوند

---

## 🎉 آماده است!

Dashboard شما آماده استفاده است:

✅ **Frontend:** http://localhost:5178  
⚠️ **Backend:** نیاز به تنظیم (اختیاری)

**مرحله بعدی:**
1. مرورگر را باز کنید
2. به http://localhost:5178 بروید
3. Dashboard را مشاهده کنید!

---

**آخرین به‌روزرسانی:** 2025-01-27

