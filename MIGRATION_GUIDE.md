# راهنمای Migration
## Migration Guide for TypeScript and Performance Optimizations

**تاریخ:** 2025-01-27

---

## 🔄 تغییرات اعمال شده

### 1. TypeScript Migration

#### فایل‌های جدید TypeScript:
- ✅ `frontend/src/api/apiClient.ts`
- ✅ `frontend/src/api/webSocketClient.ts`

#### فایل‌های JavaScript (قدیمی):
- ⚠️ `frontend/src/api/apiClient.js` (می‌توانید بعداً حذف کنید)
- ⚠️ `frontend/src/api/webSocketClient.js` (می‌توانید بعداً حذف کنید)

**نکته:** فایل‌های `.js` هنوز کار می‌کنند برای backward compatibility. بعد از تست کامل، می‌توانید حذف کنید.

---

## 📝 مراحل Migration

### مرحله 1: تست فایل‌های TypeScript

1. بررسی کنید که اپلیکیشن کار می‌کند:
   ```bash
   npm run dev
   ```

2. تست کنید که API calls کار می‌کنند:
   - Login کنید
   - WebSocket connection را بررسی کنید
   - API calls را تست کنید

### مرحله 2: به‌روزرسانی Imports (اختیاری)

اگر می‌خواهید از فایل‌های TypeScript استفاده کنید، imports را به‌روز کنید:

**قبل:**
```javascript
import apiClient from './api/apiClient.js';
import webSocketClient from './api/webSocketClient.js';
```

**بعد:**
```typescript
import apiClient from './api/apiClient';
import webSocketClient from './api/webSocketClient';
```

**نکته:** TypeScript به صورت خودکار `.ts` را پیدا می‌کند.

### مرحله 3: حذف فایل‌های قدیمی (بعد از تست)

بعد از اطمینان از کارکرد صحیح:

1. فایل‌های `.js` را حذف کنید:
   ```bash
   rm frontend/src/api/apiClient.js
   rm frontend/src/api/webSocketClient.js
   ```

2. تمام imports را بررسی کنید:
   ```bash
   grep -r "apiClient.js" frontend/src
   grep -r "webSocketClient.js" frontend/src
   ```

---

## 🚀 استفاده از Virtualization

### AnomalyAlerts Component

کامپوننت `AnomalyAlerts` به صورت خودکار از virtualization استفاده می‌کند:

- **لیست‌های < 20 آیتم:** رندر عادی
- **لیست‌های ≥ 20 آیتم:** virtualization خودکار

**استفاده:**
```jsx
<AnomalyAlerts alerts={alerts} height={400} />
```

**Props:**
- `alerts`: Array of alert objects
- `height`: Height of the virtualized list (default: 400)

---

## 📦 Dependencies به‌روزرسانی شده

### Major Updates:
- React: 19.1.1 → 19.2.3
- Redux Toolkit: 2.8.2 → 2.11.2
- Axios: 1.11.0 → 1.13.2
- MUI Material: 7.3.1 → 7.3.6
- React Router: 7.8.1 → 7.11.0
- Vite: 7.1.2 → 7.3.0

### New Packages:
- `react-window`: ^2.2.3
- `@types/react-window`: ^1.8.8
- `typescript`: ^5.9.3
- `@types/node`: ^25.0.3

---

## ⚠️ Breaking Changes

### هیچ Breaking Change وجود ندارد!

تمام تغییرات backward compatible هستند:
- فایل‌های `.js` قدیمی هنوز کار می‌کنند
- API ها تغییر نکرده‌اند
- Component props تغییر نکرده‌اند

---

## 🧪 Testing Checklist

### قبل از Deploy:

- [ ] اپلیکیشن build می‌شود: `npm run build`
- [ ] Login/Logout کار می‌کند
- [ ] WebSocket connection برقرار می‌شود
- [ ] API calls موفق هستند
- [ ] لیست Alerts scroll می‌شود (virtualization)
- [ ] Performance بهبود یافته است
- [ ] هیچ console error وجود ندارد

### Performance Testing:

```bash
# Build برای production
npm run build

# بررسی bundle size
npm run build -- --mode analyze

# تست در development
npm run dev
```

---

## 🔧 Troubleshooting

### مشکل: TypeScript errors

**راه‌حل:**
```bash
# نصب dependencies
npm install

# بررسی TypeScript config
npx tsc --noEmit
```

### مشکل: Virtualization کار نمی‌کند

**راه‌حل:**
- بررسی کنید که `react-window` نصب شده باشد
- بررسی کنید که `height` prop تنظیم شده باشد
- Console را برای errors بررسی کنید

### مشکل: Performance بهبود نیافته

**راه‌حل:**
- React DevTools Profiler را استفاده کنید
- بررسی کنید که memoization اعمال شده باشد
- بررسی کنید که virtualization فعال است

---

## 📚 منابع

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [react-window Docs](https://github.com/bvaughn/react-window)
- [React Performance](https://react.dev/learn/render-and-commit)

---

**آخرین به‌روزرسانی:** 2025-01-27

