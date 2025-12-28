# 🔧 راهنمای رفع مشکلات (Troubleshooting)

## ❌ مشکل: گراف‌ها و Gauges نمایش داده نمی‌شوند

### علت:
Dependencies نصب نشده‌اند یا `node_modules` به‌روز نیست.

### ✅ راه‌حل:

#### 1. نصب Dependencies در Frontend:

```bash
cd frontend
npm install
```

این دستور تمام کتابخانه‌های زیر را نصب می‌کند:
- `recharts@^3.3.0` - برای Line Charts, Bar Charts, Scatter Charts
- `@mui/x-charts@^8.16.0` - برای Gauge Components

#### 2. اجرای Development Server:

```bash
npm run dev
```

#### 3. باز کردن Browser:

```
http://localhost:5173/dashboard
```

---

## ❌ مشکل: خطای "Gauge is not exported from @mui/x-charts"

### علت:
نسخه قدیمی `@mui/x-charts` نصب شده است.

### ✅ راه‌حل:

```bash
cd frontend
npm uninstall @mui/x-charts
npm install @mui/x-charts@latest
```

---

## ❌ مشکل: Console Errors مربوط به recharts

### علت:
تداخل در نسخه‌های React یا recharts

### ✅ راه‌حل:

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ❌ مشکل: صفحه سفید یا خالی

### چک‌لیست:

1. **بررسی Console در Browser (F12):**
   ```
   - آیا خطای JavaScript وجود دارد؟
   - آیا خطای import وجود دارد؟
   ```

2. **بررسی Network Tab:**
   ```
   - آیا فایل‌های JS/CSS بارگذاری می‌شوند؟
   - آیا 404 error وجود دارد؟
   ```

3. **بررسی Backend:**
   ```bash
   # آیا backend در حال اجراست؟
   curl http://localhost:5000/api/health
   ```

---

## ❌ مشکل: Gauges با خطا مواجه می‌شوند

### بررسی Import در کامپوننت:

```javascript
// ✅ صحیح:
import { Gauge } from '@mui/x-charts/Gauge';

// ❌ غلط:
import { Gauge } from '@mui/x-charts';
```

---

## ❌ مشکل: Charts بدون داده هستند

### علت:
- Backend در حال اجرا نیست
- API endpoint در دسترس نیست
- داده‌های mock تولید نمی‌شوند

### ✅ راه‌حل:

1. **بررسی که Backend اجرا شده:**
   ```bash
   cd backend
   python api/app.py
   ```

2. **بررسی State در Component:**
   - باز کنید: `frontend/src/pages/industrial/GraphAnalysisPage.jsx`
   - خط 60-61: داده‌های mock باید تولید شوند
   ```javascript
   setNoiseData(generateNoiseData());
   setHistogramData(generateHistogramData());
   ```

3. **بررسی Console:**
   ```javascript
   console.log('Noise Data:', noiseData);
   console.log('Histogram Data:', histogramData);
   ```

---

## ❌ مشکل: Responsive Design کار نمی‌کند

### ✅ راه‌حل:

بررسی کنید که viewport meta tag وجود دارد:

```html
<!-- در index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## ❌ مشکل: Sidebar در Mobile نمایش داده نمی‌شود

### ✅ راه‌حل:

1. روی آیکون منو (☰) کلیک کنید
2. بررسی کنید که `IndustrialLayout.jsx` به‌درستی import شده

---

## ❌ مشکل: Authentication کار نمی‌کند

### چک‌لیست:

1. **بررسی .env در backend:**
   ```bash
   # آیا این فایل وجود دارد؟
   digital-twine-gas-turbine-1/.env
   
   # آیا JWT_SECRET_KEY تنظیم شده؟
   cat .env | grep JWT_SECRET_KEY
   ```

2. **بررسی Database:**
   ```bash
   docker-compose up mysql
   ```

3. **بررسی User:**
   ```sql
   -- Default credentials:
   Username: admin
   Password: admin123
   ```

---

## 🔍 دیباگ کلی

### مراحل دیباگ برای هر مشکل:

#### 1. بررسی Console (Browser):
```
F12 → Console Tab
```

#### 2. بررسی Network:
```
F12 → Network Tab → Reload Page
```

#### 3. بررسی React DevTools:
```
F12 → Components Tab
- بررسی State
- بررسی Props
```

#### 4. بررسی Backend Logs:
```bash
# Terminal که backend اجرا شده
# خطاهای Python را ببینید
```

---

## 📝 کدهای تست سریع

### تست Gauges:

```javascript
// اضافه کنید به DisplayPage.jsx
useEffect(() => {
  console.log('Sensor Data:', sensorData);
}, [sensorData]);
```

### تست Charts:

```javascript
// اضافه کنید به GraphAnalysisPage.jsx
useEffect(() => {
  console.log('Noise Data Length:', noiseData.length);
  console.log('First Data Point:', noiseData[0]);
}, [noiseData]);
```

---

## 🚀 راه‌حل سریع (Quick Fix):

اگر همه چیز خراب است، این کارها را به ترتیب انجام دهید:

```bash
# 1. پاک کردن همه چیز
cd frontend
rm -rf node_modules package-lock.json

# 2. نصب مجدد
npm install

# 3. اجرا
npm run dev

# 4. در browser جدید:
# - پاک کردن cache (Ctrl+Shift+Delete)
# - Hard Refresh (Ctrl+Shift+R)
# - باز کردن http://localhost:5173/dashboard
```

---

## 📞 دریافت کمک

اگر مشکل حل نشد:

1. **Screenshot از Console Errors** بگیرید
2. **پیام خطا را کپی کنید**
3. **بگویید در کدام صفحه مشکل دارید**
4. **نسخه Node.js خود را چک کنید:** `node --version`

**Node.js مورد نیاز:** >= 18.0.0

---

## ✅ Checklist قبل از اجرا:

- [ ] Node.js نصب شده (v18+)
- [ ] Docker در حال اجراست
- [ ] `cd frontend && npm install` اجرا شده
- [ ] Backend در حال اجراست
- [ ] فایل `.env` در root وجود دارد
- [ ] Browser cache پاک شده
- [ ] Console خطا ندارد

---

**نکته مهم:** اگر تغییری در `package.json` دادید، **حتماً** `npm install` را دوباره اجرا کنید!

