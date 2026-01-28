# 🚀 إرشادات البناء - Build Instructions

## 🏗️ المعمارية الجديدة - New Architecture

### 📐 Application Shell Pattern:
```
App.jsx (Entry Point)
├── useAppBootstrap() (Lifecycle Hook)
├── BootstrapManager (System Initialization)
├── ApplicationShell (UI Shell)
└── LoadingStates (State Management)
```

### 🔄 Separation of Concerns:
- **App.jsx**: نقطة دخول بسيطة (Shell Pattern)
- **BootstrapManager**: إدارة دورة حياة النظام
- **useAppBootstrap**: Hook لإدارة حالة التهيئة
- **ApplicationShell**: الهيكل الأساسي للواجهة
- **LoadingStates**: إدارة حالات التحميل والأخطاء

### 🛠️ Environment-based Loading:
- **Development**: جميع الأدوات متاحة
- **Production**: أدوات التطوير محذوفة تلقائياً

## 📋 المتطلبات الأساسية

### Backend:
```bash
cd backend
npm install
```

### Frontend:
```bash
cd frontend
npm install
```

## 🔧 إعداد متغيرات البيئة

### Backend (.env):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production

# Admin Credentials
ADMIN_USERNAME=admin01
ADMIN_PASSWORD=your_secure_admin_password

# WhatsApp Support
WHATSAPP_SUPPORT_NUMBER=+201228195728

# Security
SESSION_SECRET=your_session_secret_key
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
API_TIMEOUT=30000
```

### Frontend (.env):
```env
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_NAME=Careerak
REACT_APP_VERSION=1.3.0
REACT_APP_ENCRYPTION_KEY=your_encryption_key
REACT_APP_WHATSAPP_NUMBER=+201228195728
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_DEBUG_MODE=false
GENERATE_SOURCEMAP=false
```

## 🏗️ عملية البناء

### 1. تثبيت التبعيات:
```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### 2. تشغيل الاختبارات:
```bash
# Backend Tests
cd backend
npm test

# Security Tests
npm run test:security
```

### 3. بناء Frontend:
```bash
cd frontend
npm run build
```

### 4. بناء Backend (للإنتاج):
```bash
cd backend
npm start
```

## 🔍 استكشاف الأخطاء

### خطأ web-vitals:
إذا واجهت خطأ `Module not found: Error: Can't resolve 'web-vitals'`:

```bash
cd frontend
npm install web-vitals@^3.5.2
npm run build
```

### خطأ التبعيات:
```bash
# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### خطأ الذاكرة:
```bash
# زيادة حد الذاكرة لـ Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### خطأ Bootstrap:
إذا فشلت تهيئة التطبيق:
- تحقق من console للأخطاء
- استخدم `window.bootstrapManager` في التطوير
- راجع `BootstrapManager.getSystemStatus()`

## 📊 مراقبة الأداء

### أدوات التطوير (Development Only):
- `Ctrl + Shift + P` - لوحة مراقبة الأداء
- `Ctrl + Shift + D` - تشخيص سريع
- `window.devTools` - أدوات الكونسول
- `window.bootstrapManager` - إدارة النظام

### الاختبارات:
```bash
# اختبارات الأمان
npm run test:security

# اختبارات الأداء (Development)
window.devTools.tests.responseTime()
window.devTools.tests.memoryUsage()
```

## 🚀 النشر

### Vercel (Frontend):
```bash
# تأكد من وجود vercel.json
npm run build
vercel --prod
```

### Heroku/Railway (Backend):
```bash
# تأكد من وجود Procfile
echo "web: node src/index.js" > Procfile
git add .
git commit -m "Deploy to production"
git push heroku main
```

## 🔒 فحص الأمان

### قبل النشر:
```bash
# فحص الثغرات الأمنية
npm audit
npm audit fix

# اختبارات الأمان
npm run test:security
```

### بعد النشر:
- تأكد من تفعيل HTTPS
- فحص security headers
- مراجعة logs للأنشطة المشبوهة

## 📈 مراقبة الإنتاج

### Logs:
```bash
# عرض logs الخادم
tail -f logs/combined.log
tail -f logs/error.log
```

### الإحصائيات:
```bash
# الوصول لإحصائيات API
GET /api/stats
Authorization: Bearer admin_token
```

### Bootstrap Status:
```javascript
// في التطوير فقط
window.bootstrapManager.getSystemStatus()
```

## 🆘 الدعم

في حالة مواجهة مشاكل:

1. تحقق من logs: `logs/error.log`
2. فحص متغيرات البيئة
3. تأكد من اتصال قاعدة البيانات
4. راجع تقرير الأمان: `SECURITY_AUDIT_REPORT.md`
5. فحص Bootstrap Manager: `window.bootstrapManager.getSystemStatus()`

## ✅ قائمة التحقق النهائية

- [ ] تثبيت جميع التبعيات
- [ ] إعداد متغيرات البيئة
- [ ] تشغيل الاختبارات بنجاح
- [ ] بناء Frontend بدون أخطاء
- [ ] فحص الأمان
- [ ] اختبار الوظائف الأساسية
- [ ] مراجعة الأداء
- [ ] فحص Bootstrap Manager
- [ ] التأكد من عدم تحميل dev tools في الإنتاج
- [ ] النشر للإنتاج

## 🏗️ الميزات الجديدة

### ✅ Application Shell Pattern:
- فصل منطق التهيئة عن واجهة المستخدم
- إدارة حالات التحميل والأخطاء
- معمارية نظيفة ومنظمة

### ✅ Bootstrap Manager:
- إدارة دورة حياة التطبيق
- تهيئة الخدمات بشكل منظم
- تنظيف الموارد التلقائي

### ✅ Environment-based Loading:
- أدوات التطوير تُحمّل فقط في التطوير
- تحسين الأداء في الإنتاج
- أمان أفضل

### ✅ Observability Isolation:
- المراقبة منفصلة عن UI
- تتبع النظام على مستوى Bootstrap
- إدارة الجلسات المحسنة

---

**تم تحديث هذا الدليل في**: 28 يناير 2026
**إصدار التطبيق**: 1.3.0
**المعمارية**: Application Shell Pattern
**مستوى الأمان**: 9.6/10 🟢