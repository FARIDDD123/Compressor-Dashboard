# Compressor-Dashboard




---

# پروژه داشبورد کمپرسور

این پروژه شامل توسعه یک **داشبورد کمپرسور** است که وضعیت سیستم کمپرسور (SGT-400) را نظارت و پیش‌بینی می‌کند. داشبورد با استفاده از **ReactJS**، **Chart.js**، **Tailwind CSS** و **Flask** برای توسعه API طراحی شده است. همچنین از **مدل‌های هوش مصنوعی** برای پیش‌بینی پارامترهای کلیدی بر اساس داده‌های سری زمانی استفاده می‌شود.

### **مرور کلی پروژه**

هدف این پروژه ایجاد یک داشبورد تعاملی و مبتنی بر داده برای نظارت در زمان واقعی و تجزیه و تحلیل پیش‌بینی کمپرسور SGT-400 است. داشبورد پارامترهای مختلف عملیاتی مانند دما، فشار، ارتعاشات و موارد دیگر را نمایش می‌دهد. مدل‌های هوش مصنوعی برای پیش‌بینی مقادیر آینده این پارامترها به کار گرفته می‌شوند.

### **فناوری‌های استفاده شده**

- **فرانت‌اند:**
  - ReactJS
  - Chart.js (برای تجسم داده‌ها)
  - Tailwind CSS (برای طراحی UI)
  - Material UI (برای اجزای طراحی)
  
- **بک‌اند:**
  - Flask (برای توسعه API)
  - Python (برای پردازش داده‌ها و استقرار مدل‌ها)

- **هوش مصنوعی و یادگیری ماشین:**
  - PyTorch (برای توسعه مدل‌های یادگیری ماشین)

### **ویژگی‌ها**

- نمایش داده‌های لحظه‌ای کمپرسور (دما، فشار، ارتعاشات و غیره)
- پیش‌بینی پارامترهای کمپرسور با استفاده از مدل‌های هوش مصنوعی
- طراحی تعاملی و کاربرپسند داشبورد
- به‌روزرسانی لحظه‌ای داده‌ها از طریق APIهای Flask
- تجزیه و تحلیل داده‌ها با استفاده از نمودارهای متنوع در Chart.js

### **نصب و راه‌اندازی**

برای راه‌اندازی پروژه بر روی سیستم محلی خود، مراحل زیر را دنبال کنید:

1. ابتدا پروژه را از GitHub کلون کنید:
   ```bash
   git clone https://github.com/{your-team}/Compressor-Dashboard.git
   ```

2. به پوشه پروژه بروید:
   ```bash
   cd Compressor-Dashboard
   ```

3. وابستگی‌ها را نصب کنید:
   ```bash
   pip install -r requirements.txt
   ```

4. برای شروع بخش فرانت‌اند، به پوشه `frontend/` رفته و سرور React را راه‌اندازی کنید:
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. برای راه‌اندازی بک‌اند، در پوشه `backend/` Flask را اجرا کنید:
   ```bash
   cd backend
   flask run
   ```



---

Feel free to make any adjustments or additions based on the specific requirements of the project!
