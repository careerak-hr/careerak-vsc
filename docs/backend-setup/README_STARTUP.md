# 🚀 Careerak Backend - دليل التشغيل

## ✅ Backend يعمل الآن!

Backend مشغّل بنجاح على المنفذ 5000 باستخدام PM2.

---

## 📋 الأوامر الأساسية

### التحقق من الحالة
```bash
pm2 status
```

### عرض Logs
```bash
pm2 logs careerak-backend
```

### إعادة تشغيل
```bash
pm2 restart careerak-backend
```

### إيقاف
```bash
pm2 stop careerak-backend
```

### مراقبة الأداء
```bash
pm2 monit
```

---

## 🔍 فحص الحالة

```bash
# الطريقة 1
.\deploy-check.bat

# الطريقة 2
pm2 status

# الطريقة 3 - المتصفح
http://localhost:5000/health
```

---

## 🔧 إعداد بدء التشغيل التلقائي مع Windows

1. انقر بزر الماوس الأيمن على: `setup-autostart.bat`
2. اختر **"Run as administrator"**
3. انتظر حتى ينتهي الإعداد
4. ✅ تم!

---

## 🔧 حل المشاكل

### PM2 لا يعمل؟
```bash
npm run pm2:start
# أو
npx pm2 start ecosystem.config.js
# أو
.\start-backend-simple.bat
```

### المنفذ 5000 مستخدم؟
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📚 المزيد من المعلومات

- 📄 `QUICK_START.md` - دليل سريع
- 📄 `docs/BACKEND_PERMANENT_RUNNING.md` - دليل شامل
- 📄 `PM2_QUICK_START.md` - دليل PM2

---

## 🌐 الروابط

- Backend: `http://localhost:5000`
- Health Check: `http://localhost:5000/health`
- MongoDB: يتصل عند أول طلب HTTP

---

**آخر تحديث**: 2026-02-17
