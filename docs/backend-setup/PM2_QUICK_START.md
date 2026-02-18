# 🚀 تشغيل Backend بشكل دائم - دليل سريع

## ⚡ البدء السريع (3 خطوات)

### 1. تثبيت PM2 (مرة واحدة فقط)
```bash
npm install -g pm2
```

### 2. تشغيل Backend
```bash
start-backend.bat
```

### 3. التحقق
```bash
pm2 status
```

**✅ Backend الآن يعمل بشكل دائم!**

---

## 🎛️ الأوامر الأساسية

### ملفات .bat (الأسهل):
```bash
start-backend.bat      # تشغيل
stop-backend.bat       # إيقاف
restart-backend.bat    # إعادة تشغيل
view-logs.bat          # عرض Logs
```

### أوامر PM2 المباشرة:
```bash
pm2 status             # الحالة
pm2 logs               # Logs مباشرة
pm2 restart careerak-backend  # إعادة تشغيل
pm2 stop careerak-backend     # إيقاف
pm2 monit              # مراقبة الأداء
```

### أوامر npm:
```bash
npm run pm2:start      # تشغيل
npm run pm2:stop       # إيقاف
npm run pm2:restart    # إعادة تشغيل
npm run pm2:logs       # Logs
npm run pm2:status     # الحالة
```

---

## 🔄 بدء التشغيل مع Windows

```bash
pm2 startup
pm2 save
```

**الآن Backend سيبدأ تلقائياً عند تشغيل Windows!**

---

## 📊 المراقبة

```bash
# الحالة
pm2 status

# Logs مباشرة
pm2 logs careerak-backend

# مراقبة الأداء
pm2 monit

# معلومات تفصيلية
pm2 show careerak-backend
```

---

## 🔧 التحديث

```bash
# 1. إيقاف
pm2 stop careerak-backend

# 2. تحديث الكود
git pull
npm install

# 3. إعادة تشغيل
pm2 restart careerak-backend
```

---

## 🎯 الفوائد

- ✅ تشغيل دائم (24/7)
- ✅ إعادة تشغيل تلقائي عند الأخطاء
- ✅ بدء مع Windows
- ✅ مراقبة الأداء
- ✅ إدارة Logs

---

## 📚 التوثيق الكامل

📄 `docs/BACKEND_ALWAYS_RUNNING.md` - دليل شامل

---

**تاريخ الإنشاء**: 2026-02-17  
**الحالة**: ✅ جاهز
