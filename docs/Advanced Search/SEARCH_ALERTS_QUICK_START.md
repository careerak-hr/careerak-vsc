# 🚀 نظام التنبيهات الذكية - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. التثبيت (دقيقة واحدة)

```bash
cd backend
npm install node-cron
```

### 2. التحقق من الملفات (30 ثانية)

تأكد من وجود الملفات التالية:
- ✅ `backend/src/services/alertService.js`
- ✅ `backend/src/jobs/scheduledAlerts.js`
- ✅ `backend/src/controllers/jobPostingController.js` (محدّث)
- ✅ `backend/src/index.js` (محدّث)

### 3. تشغيل السيرفر (30 ثانية)

```bash
npm start
```

تحقق من logs:
```
✅ Scheduled alerts jobs started
📅 Daily alerts scheduled for 9:00 AM UTC
📅 Weekly alerts scheduled for Mondays at 9:00 AM UTC
```

### 4. اختبار التنبيهات (3 دقائق)

#### الخطوة 1: إنشاء عملية بحث محفوظة

```bash
POST http://localhost:5000/api/search/saved
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "JavaScript Developer Jobs",
  "searchType": "jobs",
  "searchParams": {
    "query": "javascript",
    "skills": ["JavaScript", "React"],
    "skillsLogic": "OR"
  },
  "alertEnabled": true,
  "alertFrequency": "instant"
}
```

#### الخطوة 2: نشر وظيفة مطابقة

```bash
POST http://localhost:5000/api/job-postings
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Senior JavaScript Developer",
  "description": "We are looking for an experienced JavaScript developer",
  "skills": ["JavaScript", "React", "Node.js"],
  "status": "active",
  "company": {
    "name": "Tech Company",
    "size": "medium"
  },
  "location": {
    "city": "Cairo",
    "country": "Egypt"
  },
  "salary": {
    "min": 5000,
    "max": 8000
  },
  "jobType": "full-time",
  "experienceLevel": "mid"
}
```

#### الخطوة 3: التحقق من الإشعار

```bash
GET http://localhost:5000/api/notifications
Authorization: Bearer YOUR_TOKEN
```

يجب أن ترى إشعاراً:
```json
{
  "type": "job_match",
  "title": "وظائف جديدة تطابق بحثك",
  "message": "تم العثور على 1 وظيفة جديدة تطابق \"JavaScript Developer Jobs\"",
  "relatedData": {
    "savedSearchId": "...",
    "jobPostings": ["..."]
  }
}
```

---

## 🧪 تشغيل الاختبارات

```bash
cd backend

# اختبار Property 11: Alert Triggering
npm test -- alert-triggering.property.test.js

# اختبار Property 14: Alert Deduplication
npm test -- alert-deduplication.property.test.js

# جميع اختبارات التنبيهات
npm test -- alert-*.test.js
```

النتيجة المتوقعة:
```
✓ should trigger exactly one alert when a matching job is posted
✓ should not trigger alert when job does not match criteria
✓ should only send alerts to users with alertEnabled=true
✓ should only send instant alerts, not daily/weekly
✓ should not send duplicate alerts for the same job
✓ should check for duplicate alerts before sending
✓ should allow alerts for different jobs

Tests: 7 passed, 7 total
```

---

## 📊 التحقق من عمل Cron Jobs

### التشغيل اليدوي (للاختبار)

```javascript
// في Node.js REPL أو سكريبت
const scheduledAlerts = require('./src/jobs/scheduledAlerts');

// تشغيل التنبيهات اليومية الآن
await scheduledAlerts.runDailyNow();

// تشغيل التنبيهات الأسبوعية الآن
await scheduledAlerts.runWeeklyNow();
```

### التحقق من Logs

```bash
# عند تشغيل السيرفر
✅ Scheduled alerts jobs started
📅 Daily alerts scheduled for 9:00 AM UTC
📅 Weekly alerts scheduled for Mondays at 9:00 AM UTC

# عند معالجة وظيفة جديدة
✅ Processed saved search alerts for job: JavaScript Developer
✅ Alert sent to user 123456 for 1 new jobs

# عند تشغيل Cron job
🔔 Running daily alerts...
Found 5 saved searches with daily alerts
✅ Daily alerts completed
```

---

## 🔧 الإعدادات الأساسية

### تعديل أوقات Cron Jobs

في `backend/src/jobs/scheduledAlerts.js`:

```javascript
// التنبيهات اليومية - تغيير الوقت
this.dailyJob = cron.schedule('0 9 * * *', async () => {
  // '0 9 * * *' = 9:00 صباحاً
  // '0 12 * * *' = 12:00 ظهراً
  // '0 18 * * *' = 6:00 مساءً
});

// التنبيهات الأسبوعية - تغيير اليوم
this.weeklyJob = cron.schedule('0 9 * * 1', async () => {
  // '0 9 * * 1' = الإثنين 9:00 صباحاً
  // '0 9 * * 5' = الجمعة 9:00 صباحاً
  // '0 9 * * 0' = الأحد 9:00 صباحاً
});
```

### تعطيل Cron Jobs (اختياري)

في `backend/src/index.js`:

```javascript
// تعليق هذا السطر لتعطيل Cron jobs
// scheduledAlerts.start();
```

---

## 🐛 استكشاف الأخطاء السريع

### المشكلة: لا تُرسل تنبيهات

**الحل السريع**:
```javascript
// 1. تحقق من SavedSearch
const savedSearch = await SavedSearch.findOne({ userId: 'YOUR_USER_ID' });
console.log('Alert enabled:', savedSearch.alertEnabled);
console.log('Alert frequency:', savedSearch.alertFrequency);

// 2. تحقق من مطابقة الوظيفة
const matches = await alertService.checkJobMatchesSavedSearch(job, savedSearch);
console.log('Job matches:', matches);

// 3. تحقق من الإشعارات
const notifications = await Notification.find({ 
  recipient: 'YOUR_USER_ID',
  type: 'job_match'
});
console.log('Notifications:', notifications.length);
```

### المشكلة: Cron jobs لا تعمل

**الحل السريع**:
```bash
# 1. تحقق من تثبيت node-cron
npm list node-cron

# 2. تحقق من logs السيرفر
# يجب أن ترى:
✅ Scheduled alerts jobs started

# 3. تشغيل يدوي للاختبار
node -e "require('./src/jobs/scheduledAlerts').runDailyNow()"
```

---

## 📚 الموارد

- 📄 [التوثيق الشامل](./SEARCH_ALERTS_IMPLEMENTATION.md)
- 📄 [نظام الإشعارات](../Systems/NOTIFICATION_SYSTEM.md)
- 📄 [نموذج SavedSearch](../../backend/src/models/SavedSearch.js)
- 📄 [خدمة التنبيهات](../../backend/src/services/alertService.js)

---

## ✅ Checklist

- [ ] تثبيت node-cron
- [ ] التحقق من وجود جميع الملفات
- [ ] تشغيل السيرفر بنجاح
- [ ] رؤية logs Cron jobs
- [ ] إنشاء عملية بحث محفوظة
- [ ] نشر وظيفة مطابقة
- [ ] استلام إشعار
- [ ] تشغيل الاختبارات (7/7 نجحت)

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ جاهز للاستخدام
