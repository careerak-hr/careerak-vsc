# 🚀 Backend Careerak - الإعداد الدائم والتلقائي

**تاريخ الإنشاء**: 2026-02-27  
**الحالة**: ✅ مكتمل ويعمل

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المتطلبات](#المتطلبات)
3. [الإعداد الأولي](#الإعداد-الأولي)
4. [التشغيل الدائم مع PM2](#التشغيل-الدائم-مع-pm2)
5. [الإعداد التلقائي مع Windows](#الإعداد-التلقائي-مع-windows)
6. [المراقبة والصيانة](#المراقبة-والصيانة)
7. [استكشاف الأخطاء](#استكشاف-الأخطاء)
8. [الأمان](#الأمان)

---

## 🎯 نظرة عامة

هذا الدليل يشرح كيفية إعداد Backend Careerak للعمل بشكل:
- ✅ **دائم** (24/7 بدون توقف)
- ✅ **تلقائي** (يبدأ مع Windows)
- ✅ **مستقر** (إعادة تشغيل تلقائي عند الأخطاء)
- ✅ **مراقب** (سجلات وإحصائيات)

---

## 📦 المتطلبات

### 1. البرامج المطلوبة

```bash
# Node.js (v14 أو أحدث)
node --version

# npm (يأتي مع Node.js)
npm --version

# PM2 (مدير العمليات)
npm install -g pm2
```

### 2. قاعدة البيانات

- MongoDB Atlas (موصى به للإنتاج)
- أو MongoDB محلي (للتطوير)

### 3. المتغيرات البيئية

ملف `.env` يجب أن يحتوي على:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/careerak

# Security
JWT_SECRET=your_jwt_secret_here
OAUTH_ENCRYPTION_KEY=your_32_byte_hex_key_here

# Cloudinary (للصور)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher (للمحادثات الفورية)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
```

---

## 🔧 الإعداد الأولي

### الخطوة 1: تثبيت التبعيات

```bash
cd backend
npm install
```

### الخطوة 2: إنشاء ملف .env

```bash
# نسخ المثال
copy .env.example .env

# تعديل القيم
notepad .env
```

### الخطوة 3: توليد مفاتيح الأمان

```bash
# توليد JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# توليد OAUTH_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### الخطوة 4: اختبار التشغيل

```bash
# اختبار بسيط
npm run dev

# إذا عمل بنجاح، أوقفه (Ctrl+C)
```

---

## 🚀 التشغيل الدائم مع PM2

### الخطوة 1: تثبيت PM2 عالمياً

```bash
npm install -g pm2
```

### الخطوة 2: تكوين PM2

ملف `ecosystem.config.js` موجود بالفعل:

```javascript
module.exports = {
  apps: [{
    name: 'careerak-backend',
    script: './src/index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### الخطوة 3: تشغيل السيرفر

```bash
cd backend
npm run pm2:start
```

### الخطوة 4: التحقق من الحالة

```bash
npm run pm2:status
```

**النتيجة المتوقعة**:
```
┌────┬──────────────────┬──────┬──────┬─────────┬──────┬────────┐
│ id │ name             │ mode │ ↺    │ status  │ cpu  │ memory │
├────┼──────────────────┼──────┼──────┼─────────┼──────┼────────┤
│ 0  │ careerak-backend │ fork │ 0    │ online  │ 0%   │ 167mb  │
└────┴──────────────────┴──────┴──────┴─────────┴──────┴────────┘
```

✅ **Status: online** = نجح!

### الخطوة 5: حفظ التكوين

```bash
pm2 save
```

---

## 🔄 الإعداد التلقائي مع Windows

### الطريقة 1: PM2 Startup (موصى به)

```bash
# 1. إعداد startup
pm2 startup

# 2. تشغيل الأمر الذي يظهر (مثال):
# pm2 startup windows -u "Eng. Alaa Uddien" --hp "C:\Users\Eng. Alaa Uddien"

# 3. حفظ قائمة العمليات
pm2 save
```

### الطريقة 2: Windows Task Scheduler

1. افتح Task Scheduler
2. Create Basic Task
3. Name: "Careerak Backend"
4. Trigger: "When the computer starts"
5. Action: "Start a program"
6. Program: `C:\Program Files\nodejs\node.exe`
7. Arguments: `C:\Users\YourUser\AppData\Roaming\npm\node_modules\pm2\bin\pm2 resurrect`
8. Finish

### الطريقة 3: سكريبت Batch

إنشاء ملف `start-backend.bat`:

```batch
@echo off
cd /d D:\Careerak\Careerak-vsc\backend
pm2 start ecosystem.config.js
```

ثم إضافته إلى Startup folder:
```
C:\Users\YourUser\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
```

### الطريقة 4: Windows Service (متقدم)

```bash
# تثبيت pm2-windows-service
npm install -g pm2-windows-service

# إعداد الخدمة
pm2-service-install -n "Careerak Backend"

# تشغيل الخدمة
pm2-service-start
```

---

## 📊 المراقبة والصيانة

### الأوامر الأساسية

```bash
# الحالة
npm run pm2:status

# السجلات (مباشر)
npm run pm2:logs

# السجلات (آخر 50 سطر)
npm run pm2:logs -- --lines 50

# إعادة التشغيل
npm run pm2:restart

# إيقاف
npm run pm2:stop

# حذف من PM2
npm run pm2:delete
```

### مراقبة الأداء

```bash
# واجهة مراقبة تفاعلية
pm2 monit

# معلومات تفصيلية
pm2 show careerak-backend

# إحصائيات
pm2 describe careerak-backend
```

### السجلات

```bash
# عرض السجلات
type logs\pm2-out.log      # سجل الإخراج
type logs\pm2-error.log    # سجل الأخطاء
type logs\pm2-combined.log # السجل المدمج

# مسح السجلات
pm2 flush
```

### الصيانة الدورية

**يومياً**:
```bash
# التحقق من الحالة
npm run pm2:status
```

**أسبوعياً**:
```bash
# مراجعة السجلات
npm run pm2:logs -- --lines 100

# التحقق من الذاكرة
pm2 show careerak-backend
```

**شهرياً**:
```bash
# إعادة تشغيل للتحديث
npm run pm2:restart

# مسح السجلات القديمة
pm2 flush
```

---

## 🔍 استكشاف الأخطاء

### المشكلة 1: السيرفر لا يبدأ

**الأعراض**:
```
status: errored
```

**الحلول**:

1. **تحقق من السجلات**:
```bash
npm run pm2:logs -- --lines 50
```

2. **تحقق من المنفذ**:
```bash
netstat -ano | findstr :5000
```

3. **تحقق من .env**:
```bash
type .env
```

4. **اختبار يدوي**:
```bash
npm run dev
```

### المشكلة 2: إعادة تشغيل متكررة

**الأعراض**:
```
↺ 10+  (restarts)
```

**الحلول**:

1. **تحقق من الأخطاء**:
```bash
type logs\pm2-error.log
```

2. **تحقق من الذاكرة**:
```bash
pm2 show careerak-backend
```

3. **زيادة حد الذاكرة**:
```javascript
// في ecosystem.config.js
max_memory_restart: '2G'  // بدلاً من 1G
```

### المشكلة 3: استهلاك ذاكرة عالي

**الأعراض**:
```
memory: 800mb+
```

**الحلول**:

1. **إعادة التشغيل**:
```bash
npm run pm2:restart
```

2. **تفعيل إعادة التشغيل التلقائي**:
```javascript
// في ecosystem.config.js
max_memory_restart: '500M'
```

### المشكلة 4: السيرفر لا يبدأ مع Windows

**الحلول**:

1. **تحقق من startup**:
```bash
pm2 startup
pm2 save
```

2. **تحقق من Task Scheduler**:
- افتح Task Scheduler
- ابحث عن "Careerak Backend"
- تحقق من الحالة

3. **اختبار يدوي**:
```bash
pm2 resurrect
```

---

## 🔐 الأمان

### 1. حماية .env

```bash
# تأكد من أن .env في .gitignore
echo .env >> .gitignore

# لا تشارك .env على Git
git status
```

### 2. مفاتيح قوية

```bash
# توليد مفاتيح قوية (32 بايت)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. تحديث التبعيات

```bash
# تحقق من الثغرات
npm audit

# إصلاح الثغرات
npm audit fix
```

### 4. مراجعة السجلات

```bash
# ابحث عن محاولات اختراق
npm run pm2:logs | findstr "401\|403\|500"
```

### 5. Firewall

```bash
# السماح فقط للمنفذ 5000 محلياً
# أو استخدام reverse proxy (nginx)
```

---

## 📚 الموارد الإضافية

### التوثيق

- 📄 **START_HERE.txt** - مرجع سريع
- 📄 **HOW_TO_START.md** - دليل التشغيل
- 📄 **QUICK_START.md** - دليل البدء السريع
- 📄 **docs/BACKEND_NOW_RUNNING.md** - حالة السيرفر الحالية

### الروابط المفيدة

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## ✅ قائمة التحقق النهائية

قبل الانتهاء، تأكد من:

- [x] PM2 مثبت عالمياً
- [x] ملف `.env` مكتمل
- [x] مفاتيح الأمان قوية
- [x] السيرفر يعمل (status: online)
- [x] لا إعادة تشغيل متكررة
- [x] السجلات نظيفة
- [x] PM2 محفوظ (`pm2 save`)
- [x] Startup مفعّل
- [x] اختبار إعادة تشغيل Windows

---

## 🎉 الخلاصة

**Backend Careerak الآن جاهز للعمل الدائم!**

### الميزات المفعّلة:

✅ **تشغيل دائم** (24/7)  
✅ **إعادة تشغيل تلقائي** عند الأخطاء  
✅ **بدء تلقائي** مع Windows  
✅ **مراقبة الأداء** والذاكرة  
✅ **سجلات منظمة** ومفصلة  
✅ **أمان محسّن** مع مفاتيح قوية

### الأوامر السريعة:

```bash
# تشغيل
npm run pm2:start

# حالة
npm run pm2:status

# سجلات
npm run pm2:logs

# إعادة تشغيل
npm run pm2:restart
```

---

**تم الإعداد بنجاح - 2026-02-27** 🚀

**استمتع بالتطوير!** 💻
