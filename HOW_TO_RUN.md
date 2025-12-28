# 🚀 راهنمای اجرای سریع Dashboard

## ✅ مرحله 1: بررسی پیش‌نیازها

```bash
# بررسی Node.js (باید >= 18)
node --version

# بررسی npm
npm --version

# بررسی Docker (برای backend)
docker --version
```

---

## ✅ مرحله 2: نصب Frontend

```bash
# رفتن به پوشه frontend
cd "C:\Users\asus\Documents\companies\ithub\AI\products\clones\digital twin\digital-twine-gas-turbine-1\frontend"

# نصب dependencies
npm install

# اگر خطا دادید، این را امتحان کنید:
npm install --legacy-peer-deps
```

---

## ✅ مرحله 3: اجرای Frontend

```bash
# در همان پوشه frontend
npm run dev
```

**خروجی باید شبیه این باشد:**
```
  VITE v7.1.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## ✅ مرحله 4: باز کردن Browser

1. **باز کنید:** http://localhost:5173/

2. **صفحات مختلف:**
   - Dashboard اصلی: http://localhost:5173/dashboard
   - تست نمودارها: http://localhost:5173/test-charts ⭐ **ابتدا این را امتحان کنید**
   - Graph Analysis: http://localhost:5173/graph-analysis
   - Control: http://localhost:5173/control
   - Real-Time Optimization: http://localhost:5173/real-time-op

---

## 🧪 تست سریع نمودارها

اگر نمودارها نمایش داده نمی‌شوند:

### 1. برو به صفحه تست:
```
http://localhost:5173/test-charts
```

### 2. بررسی Console:
- `F12` بزنید
- تب **Console** را باز کنید
- باید این پیام‌ها را ببینید:
  ```
  TestChartsPage rendered
  Test Data: [{...}, {...}, ...]
  ```

### 3. اگر خطا دیدید:
- خطا را کپی کنید
- در Google جستجو کنید
- یا به من بگویید!

---

## ❌ مشکلات رایج و راه‌حل

### مشکل 1: "Cannot find module 'recharts'"

**راه‌حل:**
```bash
cd frontend
npm install recharts@latest
npm install @mui/x-charts@latest
```

### مشکل 2: صفحه سفید است

**راه‌حل:**
1. Console را باز کنید (F12)
2. خطاها را بخوانید
3. Cache browser را پاک کنید:
   - `Ctrl + Shift + Delete`
   - "Cached images and files" را انتخاب کنید
   - Delete کنید
4. Hard Refresh: `Ctrl + Shift + R`

### مشکل 3: "Port 5173 is already in use"

**راه‌حل:**
```bash
# Terminal را ببندید و دوباره باز کنید
# یا port را تغییر دهید:
npm run dev -- --port 3000
```

### مشکل 4: npm install خطا می‌دهد

**راه‌حل:**
```bash
# پاک کردن cache
npm cache clean --force

# حذف node_modules و package-lock.json
rm -rf node_modules package-lock.json

# نصب مجدد
npm install
```

---

## 🎯 Login به Dashboard

اگر از شما login خواست:

```
Username: admin
Password: admin123
```

**نکته:** برای این کار، backend باید در حال اجرا باشد.

---

## 🐳 اجرای Backend (اختیاری)

اگر می‌خواهید داده‌های واقعی ببینید:

```bash
# بازگشت به root
cd "C:\Users\asus\Documents\companies\ithub\AI\products\clones\digital twin\digital-twine-gas-turbine-1"

# اجرای با Docker
docker-compose up -d

# یا بدون Docker:
cd backend
pip install -r ../requirements.txt
python api/app.py
```

---

## 📸 Screenshot مشکل

اگر مشکل دارید، این اطلاعات را به من بدهید:

1. **Screenshot از صفحه**
2. **Screenshot از Console (F12 → Console)**
3. **Screenshot از Network Tab (F12 → Network)**
4. **خروجی Terminal که `npm run dev` اجرا کردید**

---

## ✅ Checklist نهایی

قبل از اینکه بگویید "کار نمی‌کند"، این موارد را چک کنید:

- [ ] `npm install` اجرا شده است
- [ ] `npm run dev` در حال اجرا است
- [ ] Browser به `http://localhost:5173` باز است
- [ ] Console خطا ندارد (F12)
- [ ] Cache browser پاک شده
- [ ] Hard Refresh انجام شده (Ctrl+Shift+R)
- [ ] صفحه تست امتحان شده (`/test-charts`)

---

## 🎉 موفقیت!

اگر نمودارها را می‌بینید:
- ✅ recharts کار می‌کند
- ✅ @mui/x-charts کار می‌کند
- ✅ Dashboard آماده است!

**حالا می‌توانید به صفحات اصلی بروید:**
- `/dashboard` - صفحه اصلی با Gauges
- `/graph-analysis` - نمودارهای Noise و Histogram
- `/control` - کنترل توربین
- `/real-time-op` - بهینه‌سازی

---

**نکته مهم:** اگر تغییری در کد دادید، فایل خودکار reload می‌شود. نیازی به restart نیست!

