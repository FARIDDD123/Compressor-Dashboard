# راهنمای اجرای Dashboard
## Dashboard Startup Guide

**تاریخ:** 2025-01-27

---

## 🚀 اجرای Frontend

Frontend در حال اجرا است!

### دسترسی:
- **URL:** http://localhost:5178
- **Status:** Running in development mode

### اگر نیاز به restart دارید:

```bash
cd frontend
npm run dev
```

---

## ⚠️ Backend مورد نیاز

طبق مستندات، backend باید Python Flask باشد که در حال حاضر در پروژه موجود نیست.

### Backend Requirements:

1. **Python Flask Server** با Flask-SocketIO
2. **Port:** 5000 (default)
3. **Endpoints:**
   - `/api/auth/login`
   - `/api/auth/logout`
   - `/api/auth/register`
   - `/api/rtm/*` - Real-time monitoring
   - `/api/rto/*` - Real-time optimization
   - `/api/pdm/*` - Predictive maintenance
   - WebSocket: `socket.io` events

### اگر Backend دارید:

```bash
# در یک terminal جداگانه
cd backend  # یا مسیر backend شما
python app.py  # یا flask run
```

### اگر Backend ندارید:

Frontend می‌تواند بدون backend اجرا شود اما:
- ❌ Login/Logout کار نمی‌کند
- ❌ API calls fail می‌شوند
- ❌ WebSocket connection برقرار نمی‌شود
- ✅ UI و صفحات نمایش داده می‌شوند
- ✅ Sample data نمایش داده می‌شود

---

## 🔧 Environment Variables

اگر backend دارید، فایل `.env` را در `frontend` ایجاد کنید:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ERROR_LOGGING_ENABLED=true
VITE_PERFORMANCE_MONITORING=true
```

---

## 📊 وضعیت فعلی

✅ **Frontend:** Running on http://localhost:5178  
⚠️ **Backend:** Not found (needs to be set up)

---

## 🛠️ Troubleshooting

### Frontend اجرا نمی‌شود:

```bash
# نصب dependencies
cd frontend
npm install

# اجرا
npm run dev
```

### Port 5178 در حال استفاده است:

Vite به صورت خودکار port بعدی را امتحان می‌کند.

### Backend connection errors:

- بررسی کنید که backend روی port 5000 اجرا می‌شود
- CORS را در backend تنظیم کنید
- Environment variables را بررسی کنید

---

**آخرین به‌روزرسانی:** 2025-01-27

