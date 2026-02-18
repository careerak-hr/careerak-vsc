# 🚀 Careerak Backend

Backend لتطبيق Careerak - نظام إدارة الموارد البشرية والتوظيف.

---

## ⚡ البدء السريع

### Backend يعمل الآن!
```bash
pm2 status
```

### فحص الحالة
```bash
.\deploy-check.bat
```

### إعداد بدء التشغيل التلقائي مع Windows
```bash
# انقر بزر الماوس الأيمن على setup-autostart.bat
# اختر "Run as administrator"
```

---

## 📋 الأوامر الأساسية

```bash
pm2 status                    # عرض الحالة
pm2 logs careerak-backend     # عرض Logs
pm2 restart careerak-backend  # إعادة تشغيل
pm2 stop careerak-backend     # إيقاف
pm2 monit                     # مراقبة الأداء
```

---

## 🌐 الروابط

- Backend: `http://localhost:5000`
- Health Check: `http://localhost:5000/health`

---

## 📚 التوثيق الكامل

- 📄 [START_HERE.txt](START_HERE.txt) - دليل سريع جداً
- 📄 [docs/HOW_TO_START.md](../docs/HOW_TO_START.md) - دليل مفصل
- 📄 [docs/BACKEND_NOW_RUNNING.md](../docs/BACKEND_NOW_RUNNING.md) - الحالة الحالية
- 📄 [docs/BACKEND_PERMANENT_RUNNING.md](../docs/BACKEND_PERMANENT_RUNNING.md) - دليل شامل
- 📄 [docs/PM2_QUICK_START.md](../docs/PM2_QUICK_START.md) - دليل PM2

---

## 🔧 الملفات المهمة

- `ecosystem.config.js` - تكوين PM2
- `.env` - متغيرات البيئة
- `package.json` - تبعيات Node.js
- `setup-autostart.bat` - إعداد بدء التشغيل التلقائي
- `deploy-check.bat` - فحص الحالة

---

**المطور**: Eng.AlaaUddien  
**البريد**: careerak.hr@gmail.com
