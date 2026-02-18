# 🚀 تشغيل Backend - دليل سريع

## ✅ Backend يعمل الآن!

Backend مشغّل بنجاح على المنفذ 5000 باستخدام PM2.

---

## 📊 التحقق من الحالة

```bash
# الطريقة 1: PM2
pm2 status

# الطريقة 2: فحص سريع
.\deploy-check.bat

# الطريقة 3: المتصفح
http://localhost:5000/health
```

---

## 🔧 إعداد بدء التشغيل التلقائي مع Windows

```bash
# انقر بزر الماوس الأيمن على setup-autostart.bat
# اختر "Run as administrator"
```

---

## الأوامر المفيدة

```bash
# عرض حالة PM2
pm2 status

# عرض Logs
pm2 logs careerak-backend

# إعادة تشغيل
pm2 restart careerak-backend

# مراقبة الأداء
pm2 monit
```

---

## حل المشاكل

### PM2 لا يعمل؟
```bash
# الحل 1: استخدام npm
npm run pm2:start

# الحل 2: استخدام npx
npx pm2 start ecosystem.config.js

# الحل 3: استخدام البديل
.\start-backend-simple.bat
```

### المنفذ 5000 مستخدم؟
```bash
# إيقاف العملية
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## المزيد من المعلومات

📄 دليل شامل: `docs/BACKEND_PERMANENT_RUNNING.md`
📄 خيارات التشغيل: `docs/BACKEND_STARTUP_OPTIONS.md`
📄 MongoDB: `docs/MONGODB_CONNECTION_EXPLAINED.md`

---

**آخر تحديث**: 2026-02-17
