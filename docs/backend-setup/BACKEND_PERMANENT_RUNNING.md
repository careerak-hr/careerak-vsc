# 🚀 تشغيل Backend بشكل دائم ومستمر

## 📋 المحتويات
1. [المشكلة](#المشكلة)
2. [الحلول المتاحة](#الحلول-المتاحة)
3. [الحل الأول: PM2 (موصى به)](#الحل-الأول-pm2-موصى-به)
4. [الحل الثاني: تشغيل بسيط](#الحل-الثاني-تشغيل-بسيط)
5. [الحل الثالث: Windows Service](#الحل-الثالث-windows-service)
6. [الحل الرابع: Task Scheduler](#الحل-الرابع-task-scheduler)
7. [فحص الحالة](#فحص-الحالة)
8. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## المشكلة

Backend يتوقف عند:
- ❌ إغلاق Command Prompt
- ❌ إعادة تشغيل الجهاز
- ❌ حدوث خطأ في الكود
- ❌ انقطاع الكهرباء

**الهدف**: Backend يعمل 24/7 بدون تدخل يدوي

---

## الحلول المتاحة

### مقارنة الحلول

| الحل | السهولة | الموثوقية | إعادة التشغيل التلقائي | بدء مع Windows |
|------|---------|-----------|------------------------|----------------|
| PM2 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ |
| تشغيل بسيط | ⭐⭐⭐⭐⭐ | ⭐⭐ | ❌ | ❌ |
| Windows Service | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ |
| Task Scheduler | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ | ✅ |

---

## الحل الأول: PM2 (موصى به)

### ما هو PM2؟
PM2 هو Process Manager احترافي لـ Node.js يوفر:
- ✅ إعادة تشغيل تلقائي عند حدوث خطأ
- ✅ بدء تلقائي مع Windows
- ✅ مراقبة الأداء والذاكرة
- ✅ Logs منظمة
- ✅ إدارة سهلة

### التثبيت والتشغيل

#### الطريقة 1: استخدام start-backend.bat (أسهل)
```bash
cd D:\Careerak\Careerak-vsc\backend
.\start-backend.bat
```

**ماذا يفعل الملف؟**
1. يتحقق من تثبيت PM2
2. يثبت PM2 إذا لم يكن مثبتاً
3. يشغل Backend
4. يحفظ التكوين
5. يعد بدء التشغيل التلقائي مع Windows

#### الطريقة 2: تثبيت يدوي
```bash
# 1. تثبيت PM2 عالمياً
npm install -g pm2

# 2. تشغيل Backend
pm2 start ecosystem.config.js --env production

# 3. حفظ التكوين
pm2 save

# 4. إعداد بدء التشغيل التلقائي
pm2 startup
# اتبع التعليمات التي تظهر
```

### الأوامر المفيدة

```bash
# عرض الحالة
pm2 status

# عرض Logs
pm2 logs careerak-backend

# عرض Logs مباشرة
pm2 logs careerak-backend --lines 100

# إيقاف
pm2 stop careerak-backend

# إعادة تشغيل
pm2 restart careerak-backend

# حذف من PM2
pm2 delete careerak-backend

# مراقبة الأداء
pm2 monit

# معلومات تفصيلية
pm2 show careerak-backend
```

### إعدادات PM2 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'careerak-backend',
    script: './src/index.js',
    instances: 1,
    autorestart: true,           // إعادة تشغيل تلقائي
    watch: false,                // مراقبة الملفات (معطل)
    max_memory_restart: '1G',    // إعادة تشغيل عند 1GB
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    
    // إعادة التشغيل التلقائي
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    
    // مراقبة الأداء
    listen_timeout: 10000,
    kill_timeout: 5000
  }]
};
```

### حل مشكلة "PM2 غير موجود في PATH"

إذا ظهرت رسالة "PM2 مثبت لكن غير موجود في PATH":

**الحل 1: إعادة فتح Command Prompt**
```bash
# أغلق Command Prompt الحالي
# افتح Command Prompt جديد كـ Administrator
# جرب مرة أخرى
.\start-backend.bat
```

**الحل 2: استخدام npm scripts**
```bash
npm run pm2:start
```

**الحل 3: استخدام npx**
```bash
npx pm2 start ecosystem.config.js --env production
npx pm2 save
npx pm2 startup
```

**الحل 4: إضافة PM2 إلى PATH يدوياً**
1. ابحث عن مجلد PM2:
   ```bash
   npm config get prefix
   ```
2. أضف المسار إلى PATH:
   - `C:\Users\YourUsername\AppData\Roaming\npm`

---

## الحل الثاني: تشغيل بسيط

### استخدام start-backend-simple.bat

```bash
cd D:\Careerak\Careerak-vsc\backend
.\start-backend-simple.bat
```

**المميزات:**
- ✅ بسيط جداً
- ✅ لا يحتاج تثبيت PM2
- ✅ يعمل فوراً

**العيوب:**
- ❌ يتوقف عند إغلاق النافذة
- ❌ لا إعادة تشغيل تلقائي
- ❌ لا بدء مع Windows

### استخدام start-backend-hidden.vbs (تشغيل مخفي)

```bash
# انقر مرتين على الملف
start-backend-hidden.vbs
```

**المميزات:**
- ✅ يعمل في الخلفية (بدون نافذة)
- ✅ لا يحتاج PM2

**العيوب:**
- ❌ يتوقف عند إعادة تشغيل الجهاز
- ❌ لا إعادة تشغيل تلقائي

### إيقاف Backend البسيط

```bash
.\stop-backend-simple.bat
```

---

## الحل الثالث: Windows Service

### استخدام node-windows

#### 1. تثبيت node-windows
```bash
npm install -g node-windows
```

#### 2. إنشاء ملف service.js
```javascript
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Careerak Backend',
  description: 'Careerak HR Management Backend Service',
  script: 'D:\\Careerak\\Careerak-vsc\\backend\\src\\index.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

svc.on('install', function() {
  svc.start();
  console.log('✅ Service installed and started');
});

svc.install();
```

#### 3. تثبيت الخدمة
```bash
node service.js
```

#### 4. إدارة الخدمة
```bash
# عرض الخدمات
services.msc

# أو استخدام PowerShell
Get-Service "Careerak Backend"
Start-Service "Careerak Backend"
Stop-Service "Careerak Backend"
Restart-Service "Careerak Backend"
```

**المميزات:**
- ✅ يعمل كخدمة Windows حقيقية
- ✅ بدء تلقائي مع Windows
- ✅ إعادة تشغيل تلقائي
- ✅ يعمل حتى بدون تسجيل دخول

**العيوب:**
- ❌ يحتاج صلاحيات Administrator
- ❌ إعداد أكثر تعقيداً

---

## الحل الرابع: Task Scheduler

### إنشاء مهمة في Task Scheduler

#### 1. فتح Task Scheduler
```
ابحث عن "Task Scheduler" في قائمة Start
```

#### 2. إنشاء مهمة جديدة
1. اضغط "Create Task"
2. **General Tab:**
   - Name: `Careerak Backend`
   - Description: `Start Careerak Backend on Windows startup`
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges

3. **Triggers Tab:**
   - New Trigger
   - Begin the task: `At startup`
   - ✅ Enabled

4. **Actions Tab:**
   - New Action
   - Action: `Start a program`
   - Program/script: `D:\Careerak\Careerak-vsc\backend\start-backend-simple.bat`
   - Start in: `D:\Careerak\Careerak-vsc\backend`

5. **Conditions Tab:**
   - ❌ Start the task only if the computer is on AC power

6. **Settings Tab:**
   - ✅ Allow task to be run on demand
   - ✅ Run task as soon as possible after a scheduled start is missed
   - If the task fails, restart every: `1 minute`
   - Attempt to restart up to: `3 times`

#### 3. حفظ المهمة
- اضغط OK
- أدخل كلمة مرور Windows

**المميزات:**
- ✅ بدء تلقائي مع Windows
- ✅ إعادة محاولة عند الفشل
- ✅ لا يحتاج برامج إضافية

**العيوب:**
- ❌ إعداد يدوي
- ❌ لا مراقبة متقدمة

---

## فحص الحالة

### استخدام deploy-check.bat
```bash
.\deploy-check.bat
```

**يفحص:**
- ✅ هل Backend يعمل؟
- ✅ معلومات السيرفر
- ✅ الاتصال بـ MongoDB

### فحص يدوي
```bash
# فحص HTTP
curl http://localhost:5000/health

# فحص MongoDB
node test-mongodb.js

# فحص API
node test-api.js
```

### فحص من المتصفح
```
http://localhost:5000/health
```

**الاستجابة المتوقعة:**
```json
{
  "status": "live",
  "server": "vercel",
  "timestamp": "2026-02-17T..."
}
```

---

## استكشاف الأخطاء

### Backend لا يعمل

#### 1. فحص المنفذ 5000
```bash
# Windows
netstat -ano | findstr :5000

# إذا كان مستخدماً، أوقف العملية
taskkill /PID <PID> /F
```

#### 2. فحص Logs
```bash
# PM2 Logs
pm2 logs careerak-backend

# ملفات Logs
type logs\pm2-error.log
type logs\pm2-out.log
```

#### 3. فحص MongoDB
```bash
node test-mongodb.js
```

**المشاكل الشائعة:**
- ❌ MongoDB URI خاطئ → تحقق من `.env`
- ❌ المنفذ 5000 مستخدم → غير PORT في `.env`
- ❌ Pusher credentials خاطئة → تحقق من `.env`

### PM2 لا يعمل

#### الحل 1: إعادة تثبيت PM2
```bash
npm uninstall -g pm2
npm install -g pm2
```

#### الحل 2: استخدام npx
```bash
npx pm2 start ecosystem.config.js
```

#### الحل 3: استخدام الحل البديل
```bash
.\start-backend-simple.bat
```

### Backend يتوقف بعد فترة

#### الحل 1: زيادة الذاكرة
```javascript
// ecosystem.config.js
max_memory_restart: '2G'  // بدلاً من 1G
```

#### الحل 2: تعطيل إعادة التشغيل عند الذاكرة
```javascript
// ecosystem.config.js
max_memory_restart: false
```

#### الحل 3: فحص Logs
```bash
pm2 logs careerak-backend --lines 200
```

---

## الخلاصة

### الحل الموصى به: PM2

**للاستخدام اليومي:**
```bash
# تشغيل
.\start-backend.bat

# فحص الحالة
pm2 status

# عرض Logs
pm2 logs careerak-backend
```

**للإنتاج:**
```bash
# تشغيل مع PM2
pm2 start ecosystem.config.js --env production

# حفظ التكوين
pm2 save

# بدء تلقائي مع Windows
pm2 startup
```

### الحل البديل: تشغيل بسيط

```bash
# تشغيل
.\start-backend-simple.bat

# أو تشغيل مخفي
start-backend-hidden.vbs
```

---

## الملفات المتعلقة

```
backend/
├── start-backend.bat              # تشغيل مع PM2
├── start-backend-simple.bat       # تشغيل بسيط
├── start-backend-hidden.vbs       # تشغيل مخفي
├── stop-backend.bat               # إيقاف PM2
├── stop-backend-simple.bat        # إيقاف بسيط
├── restart-backend.bat            # إعادة تشغيل PM2
├── view-logs.bat                  # عرض Logs
├── deploy-check.bat               # فحص الحالة
├── ecosystem.config.js            # تكوين PM2
├── test-mongodb.js                # اختبار MongoDB
└── test-api.js                    # اختبار API
```

---

## المراجع

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [node-windows](https://github.com/coreybutler/node-windows)
- [Windows Task Scheduler](https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

---

**آخر تحديث**: 2026-02-17
