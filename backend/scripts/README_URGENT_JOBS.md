# سكريبتات Urgent Jobs Badge

## 📋 نظرة عامة

سكريبتان لإدارة ميزة badge "عاجل" للوظائف:
1. **update-urgent-jobs.js** - تحديث يدوي (مرة واحدة)
2. **cron-update-urgent-jobs.js** - تحديث دوري (كل 6 ساعات)

---

## 🚀 الاستخدام

### 1. التحديث اليدوي

```bash
npm run urgent:update
```

**متى تستخدمه؟**
- عند إضافة الميزة لأول مرة
- بعد استيراد وظائف جديدة
- عند الحاجة لتحديث فوري

**ماذا يفعل؟**
- يضيف `expiryDate` افتراضي (30 يوم) للوظائف بدون تاريخ
- يحسب `isUrgent` لجميع الوظائف النشطة
- يعرض تقرير مفصل بالنتائج

**مثال على النتيجة**:
```
✅ تم الاتصال بقاعدة البيانات بنجاح
📊 عدد الوظائف النشطة: 150

⚠️  وظيفة عاجلة: مهندس Backend (تنتهي خلال 5 أيام)
⚠️  وظيفة عاجلة: مصمم UI/UX (تنتهي خلال 3 أيام)

📈 النتائج:
   - تم تحديث 150 وظيفة
   - 12 وظيفة عاجلة (تنتهي خلال 7 أيام)
   - 138 وظيفة عادية

✅ تم التحديث بنجاح!
```

---

### 2. Cron Job (دوري)

```bash
npm run urgent:cron
```

**متى تستخدمه؟**
- للتحديث التلقائي الدوري
- يُشغل كل 6 ساعات عبر PM2 أو Cron

**ماذا يفعل؟**
- يحدث `isUrgent` لجميع الوظائف النشطة
- يغلق الوظائف المنتهية تلقائياً (status = 'Closed')
- يسجل الإحصائيات في السجلات

**مثال على النتيجة**:
```
[2026-03-07T10:00:00.000Z] 🔄 بدء تحديث الوظائف العاجلة...
[2026-03-07T10:00:05.000Z] ✅ التحديث مكتمل:
   - 8 وظيفة تم تحديثها
   - 12 وظيفة عاجلة حالياً
   - 3 وظيفة منتهية تم إغلاقها
```

---

## ⚙️ إعداد Cron Job

### الخيار A: PM2 (موصى به)

**1. إضافة إلى ecosystem.config.js**:
```javascript
{
  name: 'urgent-jobs-updater',
  script: 'scripts/cron-update-urgent-jobs.js',
  cron_restart: '0 */6 * * *', // كل 6 ساعات
  autorestart: false
}
```

**2. تشغيل**:
```bash
pm2 start ecosystem.config.js --only urgent-jobs-updater
pm2 save
```

**3. مراقبة**:
```bash
pm2 logs urgent-jobs-updater
pm2 status
```

---

### الخيار B: Linux Cron

**1. فتح crontab**:
```bash
crontab -e
```

**2. إضافة السطر التالي**:
```bash
0 */6 * * * cd /path/to/backend && npm run urgent:cron >> /var/log/urgent-jobs.log 2>&1
```

**3. التحقق**:
```bash
crontab -l
tail -f /var/log/urgent-jobs.log
```

---

### الخيار C: Windows Task Scheduler

**1. فتح Task Scheduler**

**2. Create Basic Task**:
- Name: "Update Urgent Jobs"
- Trigger: Daily
- Repeat: Every 6 hours
- Action: Start a program
- Program: `node`
- Arguments: `scripts/cron-update-urgent-jobs.js`
- Start in: `D:\Careerak\Careerak-vsc\backend`

**3. التحقق**:
- Task Scheduler Library → "Update Urgent Jobs"
- Right-click → Run

---

## 📊 منطق الحساب

```javascript
const now = new Date();
const expiry = new Date(job.expiryDate);
const diffMs = expiry - now;
const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

// عاجل إذا كان متبقي 1-7 أيام
job.isUrgent = diffDays > 0 && diffDays <= 7;
```

### أمثلة

| الأيام المتبقية | isUrgent | الحالة |
|-----------------|----------|---------|
| 1 | ✅ true | عاجل |
| 5 | ✅ true | عاجل |
| 7 | ✅ true | عاجل |
| 8 | ❌ false | عادي |
| 15 | ❌ false | عادي |
| -1 | ❌ false | منتهي |

---

## 🐛 استكشاف الأخطاء

### المشكلة: "MongoDB connection failed"

**الحل**:
```bash
# تحقق من .env
cat backend/.env | grep MONGODB_URI

# تحقق من الاتصال
mongosh $MONGODB_URI
```

---

### المشكلة: "No jobs found"

**الحل**:
```bash
# تحقق من وجود وظائف نشطة
mongosh $MONGODB_URI
> use careerak
> db.jobpostings.countDocuments({ status: 'Open' })
```

---

### المشكلة: Cron Job لا يعمل

**الحل PM2**:
```bash
pm2 status
pm2 logs urgent-jobs-updater
pm2 restart urgent-jobs-updater
```

**الحل Linux Cron**:
```bash
crontab -l
grep CRON /var/log/syslog
tail -f /var/log/urgent-jobs.log
```

---

## 📚 المراجع

- 📄 `docs/URGENT_JOBS_BADGE.md` - توثيق شامل
- 📄 `docs/URGENT_JOBS_BADGE_QUICK_START.md` - دليل بدء سريع
- 📄 `docs/URGENT_JOBS_BADGE_SUMMARY.md` - ملخص التنفيذ
- 📄 `backend/tests/urgentJobs.test.js` - الاختبارات (12 tests)

---

## ✅ قائمة التحقق

- [ ] شغّل `npm run urgent:update` مرة واحدة
- [ ] أعد PM2 أو Cron للتحديث الدوري
- [ ] راقب السجلات للتأكد من العمل
- [ ] تحقق من Badge في Frontend

---

**تاريخ الإنشاء**: 2026-03-07  
**الحالة**: ✅ جاهز للاستخدام
