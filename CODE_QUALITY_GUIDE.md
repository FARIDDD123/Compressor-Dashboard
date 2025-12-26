# راهنمای کیفیت کد
## Code Quality Guide

**تاریخ:** 2025-01-27

---

## 📋 ابزارهای کیفیت کد

### 1. ESLint

ESLint برای بررسی و بهبود کیفیت کد استفاده می‌شود.

#### قوانین فعال شده:

**Error Prevention:**
- `no-unused-vars`: خطا برای متغیرهای استفاده نشده
- `no-console`: هشدار برای console.log (فقط console.warn و console.error مجاز)
- `no-debugger`: خطا برای debugger statements
- `no-var`: خطا برای استفاده از var (استفاده از const/let)
- `prefer-const`: خطا برای متغیرهایی که تغییر نمی‌کنند

**Code Quality:**
- `eqeqeq`: استفاده از === به جای ==
- `no-eval`: خطا برای eval
- `array-callback-return`: بازگشت مقدار در array callbacks
- `consistent-return`: هشدار برای return های ناسازگار

**React Specific:**
- `react-hooks/rules-of-hooks`: قوانین hooks
- `react-hooks/exhaustive-deps`: بررسی dependencies در useEffect

#### استفاده:

```bash
# بررسی کد
npm run lint

# رفع خودکار خطاها
npm run lint:fix
```

---

### 2. Prettier

Prettier برای فرمت کردن خودکار کد استفاده می‌شود.

#### تنظیمات:

- **Semi**: true (استفاده از semicolon)
- **Single Quote**: true
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Trailing Comma**: es5

#### استفاده:

```bash
# فرمت کردن تمام فایل‌ها
npm run format

# بررسی فرمت (بدون تغییر)
npm run format:check
```

---

### 3. TypeScript

TypeScript برای type safety استفاده می‌شود (تبدیل تدریجی).

#### استفاده:

```bash
# بررسی types
npm run type-check
```

---

## 📝 استانداردهای کدنویسی

### Naming Conventions

**Variables & Functions:**
```javascript
// camelCase برای variables و functions
const userName = 'John';
function getUserData() {}

// PascalCase برای components
const UserProfile = () => {};

// UPPER_SNAKE_CASE برای constants
const API_BASE_URL = 'http://localhost:5000';
```

**Files:**
- Components: `PascalCase.jsx` یا `PascalCase.tsx`
- Utilities: `camelCase.js` یا `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE.js`

### Code Organization

**Import Order:**
1. External libraries (React, MUI, etc.)
2. Internal modules (utils, api, etc.)
3. Relative imports (./components, ../hooks)

```javascript
// External
import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// Internal
import { apiClient } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

// Relative
import Button from './Button';
```

### Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Types/Interfaces (if TypeScript)
interface Props {
  title: string;
}

// 3. Component
const MyComponent = ({ title }: Props) => {
  // 4. Hooks
  const [state, setState] = useState();
  
  useEffect(() => {
    // Effect logic
  }, []);

  // 5. Handlers
  const handleClick = () => {
    // Handler logic
  };

  // 6. Render
  return (
    <Box>
      <Typography>{title}</Typography>
    </Box>
  );
};

// 7. Export
export default MyComponent;
```

---

## 📚 Documentation Standards

### JSDoc Comments

برای توابع و کلاس‌ها از JSDoc استفاده کنید:

```javascript
/**
 * Calculates the sum of two numbers
 * 
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 * @example
 * ```javascript
 * const result = add(2, 3); // Returns 5
 * ```
 */
function add(a, b) {
  return a + b;
}
```

### Component Documentation

```javascript
/**
 * User Profile Component
 * 
 * Displays user information and allows editing profile data.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.userId - User ID to display
 * @param {Function} props.onUpdate - Callback when profile is updated
 * @example
 * ```jsx
 * <UserProfile userId="123" onUpdate={handleUpdate} />
 * ```
 */
const UserProfile = ({ userId, onUpdate }) => {
  // Component implementation
};
```

---

## 🧪 Testing Standards

### Test File Naming

- Test files: `ComponentName.test.jsx` یا `ComponentName.test.tsx`
- Test files should be next to the component they test

### Test Structure

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    // Test implementation
  });
});
```

---

## 🚀 Performance Best Practices

### 1. Memoization

استفاده از `React.memo` برای کامپوننت‌های گران:

```javascript
const ExpensiveComponent = React.memo(({ data }) => {
  // Component implementation
});
```

### 2. useMemo و useCallback

برای محاسبات گران و callbacks:

```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### 3. Code Splitting

استفاده از `React.lazy` برای صفحات:

```javascript
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

---

## 🔍 Code Review Checklist

قبل از commit، این موارد را بررسی کنید:

- [ ] کد با ESLint بررسی شده (`npm run lint`)
- [ ] کد با Prettier فرمت شده (`npm run format`)
- [ ] Types بررسی شده (`npm run type-check`)
- [ ] Tests نوشته شده و pass می‌کنند
- [ ] Documentation به‌روز شده
- [ ] Performance issues بررسی شده
- [ ] Security issues بررسی شده

---

## 📊 Quality Metrics

### Target Metrics:

- **ESLint Errors**: 0
- **ESLint Warnings**: < 10
- **TypeScript Errors**: 0
- **Test Coverage**: > 85%
- **Bundle Size**: < 500KB (gzipped)

---

## 🔗 منابع

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Best Practices](https://react.dev/learn)

---

**آخرین به‌روزرسانی:** 2025-01-27

