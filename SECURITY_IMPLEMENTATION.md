# مستندات پیاده‌سازی امنیت
## Security Implementation Documentation

**تاریخ:** 2025-01-27  
**نسخه:** 1.0

---

## 📋 تغییرات اعمال شده

### 1. ✅ تغییر ذخیره‌سازی توکن از localStorage به sessionStorage

**مشکل:** استفاده از `localStorage` برای ذخیره توکن JWT در برابر حملات XSS آسیب‌پذیر است.

**راه‌حل پیاده‌سازی شده:**
- ایجاد utility در `frontend/src/utils/storage.js` برای مدیریت sessionStorage
- تغییر تمام استفاده‌ها از `localStorage` به `sessionStorage`
- sessionStorage به صورت خودکار با بسته شدن tab پاک می‌شود

**فایل‌های تغییر یافته:**
- ✅ `frontend/src/utils/storage.js` (جدید)
- ✅ `frontend/src/api/apiClient.js`
- ✅ `frontend/src/features/auth/authSlice.js`

**مزایا:**
- کاهش پنجره زمانی برای حملات XSS
- پاک شدن خودکار داده‌ها با بسته شدن tab
- امنیت بیشتر نسبت به localStorage

---

### 2. ✅ اضافه کردن احراز هویت به WebSocket

**مشکل:** اتصال WebSocket بدون احراز هویت انجام می‌شد.

**راه‌حل پیاده‌سازی شده:**
- اضافه کردن token به `auth` object در socket.io
- اضافه کردن Authorization header
- مدیریت خطاهای احراز هویت
- redirect خودکار به صفحه login در صورت خطای احراز هویت

**فایل‌های تغییر یافته:**
- ✅ `frontend/src/api/webSocketClient.js`

**کد اضافه شده:**
```javascript
const token = getToken();
if (token) {
  socketOptions.auth = { token: token };
  socketOptions.extraHeaders = {
    Authorization: `Bearer ${token}`,
  };
}
```

**مزایا:**
- اتصال WebSocket فقط برای کاربران احراز هویت شده
- محافظت در برابر دسترسی غیرمجاز به داده‌های real-time
- مدیریت خودکار خطاهای احراز هویت

---

### 3. ✅ پیاده‌سازی محافظت CSRF

**مشکل:** هیچ محافظتی در برابر حملات CSRF وجود نداشت.

**راه‌حل پیاده‌سازی شده:**
- پیاده‌سازی Double Submit Cookie pattern
- تولید خودکار CSRF token
- اضافه کردن CSRF token به تمام درخواست‌های API
- ذخیره token در sessionStorage

**فایل‌های ایجاد شده:**
- ✅ `frontend/src/utils/csrf.js` (جدید)

**فایل‌های تغییر یافته:**
- ✅ `frontend/src/api/apiClient.js`
- ✅ `frontend/src/main.jsx` (initialize CSRF token)

**نحوه کار:**
1. CSRF token در زمان initialization تولید می‌شود
2. Token در sessionStorage ذخیره می‌شود
3. Token به header `X-CSRF-Token` تمام درخواست‌ها اضافه می‌شود
4. Backend باید این token را validate کند

**نکته مهم:** Backend باید این token را validate کند. مثال:

```python
# Backend example (Flask)
@app.before_request
def check_csrf():
    if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
        token = request.headers.get('X-CSRF-Token')
        if not validate_csrf_token(token):
            return jsonify({'error': 'Invalid CSRF token'}), 403
```

**مزایا:**
- محافظت در برابر حملات CSRF
- پیاده‌سازی ساده و کارآمد
- بدون نیاز به تغییرات زیاد در backend

---

### 4. ✅ یکپارچه‌سازی سرویس لاگ‌گیری خطا

**مشکل:** خطاها فقط در console لاگ می‌شدند و هیچ tracking مرکزی وجود نداشت.

**راه‌حل پیاده‌سازی شده:**
- ایجاد سرویس مرکزی لاگ‌گیری در `frontend/src/utils/errorLogger.js`
- پشتیبانی از severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- پشتیبانی از categories (AUTHENTICATION, API, WEBSOCKET, etc.)
- قابلیت ارسال به سرویس خارجی (Sentry, LogRocket, etc.)
- Retry mechanism با exponential backoff
- یکپارچه‌سازی با ErrorBoundary و global error handlers

**فایل‌های ایجاد شده:**
- ✅ `frontend/src/utils/errorLogger.js` (جدید)

**فایل‌های تغییر یافته:**
- ✅ `frontend/src/components/common/ErrorBoundary.jsx`
- ✅ `frontend/src/main.jsx`

**ویژگی‌ها:**
- لاگ‌گیری خودکار خطاهای JavaScript
- لاگ‌گیری unhandled promise rejections
- لاگ‌گیری خطاهای احراز هویت
- لاگ‌گیری خطاهای API
- لاگ‌گیری خطاهای WebSocket
- جمع‌آوری اطلاعات context (user, session, URL, etc.)

**تنظیمات:**
در فایل `.env`:
```env
VITE_ERROR_LOGGING_ENABLED=true
VITE_ERROR_LOGGING_SERVICE_URL=https://your-error-service.com/api/errors
```

**مزایا:**
- ردیابی مرکزی تمام خطاها
- اطلاعات کامل برای debugging
- قابلیت یکپارچه‌سازی با سرویس‌های خارجی
- بهبود قابلیت نگهداری (maintainability)

---

## 🔧 تنظیمات مورد نیاز

### 1. Environment Variables

فایل `.env` را ایجاد کنید (یا از `.env.example` کپی کنید):

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ERROR_LOGGING_ENABLED=true
VITE_ERROR_LOGGING_SERVICE_URL=
```

### 2. Backend Changes (مهم!)

#### CSRF Protection در Backend

Backend باید CSRF token را validate کند:

**Python Flask Example:**
```python
from flask import request, jsonify

@app.before_request
def check_csrf():
    # Skip CSRF check for GET requests
    if request.method in ['GET', 'HEAD', 'OPTIONS']:
        return
    
    # Get CSRF token from header
    csrf_token = request.headers.get('X-CSRF-Token')
    
    # Validate token (implement your validation logic)
    if not validate_csrf_token(csrf_token):
        return jsonify({'error': 'Invalid CSRF token'}), 403
```

**Node.js Express Example:**
```javascript
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'];
    if (!validateCsrfToken(csrfToken)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  next();
});
```

#### WebSocket Authentication در Backend

Backend باید WebSocket connections را authenticate کند:

**Socket.io Example:**
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  // Verify JWT token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

---

## 🧪 تست کردن تغییرات

### 1. تست sessionStorage

```javascript
// در browser console
sessionStorage.getItem('token') // باید token را برگرداند
sessionStorage.getItem('user') // باید user data را برگرداند
```

### 2. تست CSRF Token

```javascript
// در browser console
sessionStorage.getItem('csrf_token') // باید token را برگرداند
```

### 3. تست WebSocket Authentication

1. Login کنید
2. WebSocket باید با token متصل شود
3. در Network tab، WebSocket connection را بررسی کنید
4. Authorization header باید وجود داشته باشد

### 4. تست Error Logging

1. یک خطای عمدی ایجاد کنید
2. در console باید error log را ببینید
3. اگر `VITE_ERROR_LOGGING_SERVICE_URL` تنظیم شده باشد، error به آن endpoint ارسال می‌شود

---

## 📝 نکات مهم

1. **sessionStorage vs localStorage:**
   - sessionStorage با بسته شدن tab پاک می‌شود
   - برای امنیت بیشتر، sessionStorage بهتر است
   - اگر نیاز به "Remember Me" دارید، می‌توانید از localStorage استفاده کنید (با ریسک امنیتی)

2. **CSRF Token:**
   - Token باید در هر درخواست POST/PUT/DELETE/PATCH ارسال شود
   - Backend باید این token را validate کند
   - Token در sessionStorage ذخیره می‌شود

3. **WebSocket Authentication:**
   - Token از sessionStorage خوانده می‌شود
   - در صورت خطای احراز هویت، کاربر به login redirect می‌شود

4. **Error Logging:**
   - در development mode، errors در console نمایش داده می‌شوند
   - در production، errors به سرویس خارجی ارسال می‌شوند (اگر تنظیم شده باشد)
   - تمام errors با context کامل لاگ می‌شوند

---

## 🔄 Migration Guide

اگر از نسخه قبلی استفاده می‌کنید:

1. **Token Migration:**
   - کاربران باید دوباره login کنند
   - یا می‌توانید migration script بنویسید:
   ```javascript
   // Migration script (run once)
   const oldToken = localStorage.getItem('token');
   if (oldToken) {
     sessionStorage.setItem('token', oldToken);
     localStorage.removeItem('token');
   }
   ```

2. **Clear Old Data:**
   ```javascript
   // Clear localStorage
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   ```

---

## 🚨 Breaking Changes

1. **Token Storage:**
   - Token دیگر در localStorage نیست
   - کاربران باید دوباره login کنند

2. **API Requests:**
   - تمام درخواست‌ها باید CSRF token داشته باشند
   - Backend باید این را validate کند

3. **WebSocket:**
   - WebSocket نیاز به authentication دارد
   - Backend باید WebSocket connections را authenticate کند

---

## 📚 منابع

- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Session Storage vs Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [Socket.io Authentication](https://socket.io/docs/v4/middlewares/)
- [Error Logging Best Practices](https://sentry.io/for/javascript/)

---

**آخرین به‌روزرسانی:** 2025-01-27

