# 🔔 نظام التنبيهات الذكية للبحث المتقدم

## 📋 نظرة عامة

نظام تنبيهات ذكي ومتكامل يُرسل إشعارات تلقائية للمستخدمين عند نشر وظائف جديدة تطابق عمليات البحث المحفوظة لديهم.

### الميزات الرئيسية
- ✅ تنبيهات فورية عند نشر وظيفة مطابقة
- ✅ تنبيهات مجدولة (يومية/أسبوعية)
- ✅ منع التنبيهات المكررة
- ✅ دعم فلاتر متعددة ومعقدة
- ✅ تكامل كامل مع نظام الإشعارات الموجود
- ✅ معالجة غير متزامنة (non-blocking)

---

## 🏗️ البنية التقنية

### 1. الملفات الأساسية

```
backend/
├── src/
│   ├── services/
│   │   └── alertService.js              # خدمة التنبيهات الذكية
│   ├── jobs/
│   │   └── scheduledAlerts.js           # Cron jobs للتنبيهات المجدولة
│   └── controllers/
│       └── jobPostingController.js      # محدّث مع استدعاء التنبيهات
└── tests/
    ├── alert-triggering.property.test.js      # اختبارات Property 11
    └── alert-deduplication.property.test.js   # اختبارات Property 14
```

### 2. AlertService

خدمة شاملة لإدارة التنبيهات الذكية.

#### الوظائف الرئيسية

**processNewJob(jobPosting)**
- يُستدعى تلقائياً عند نشر وظيفة جديدة
- يفحص جميع عمليات البحث المحفوظة مع تنبيهات فورية
- يُرسل تنبيهات للمستخدمين المطابقين

```javascript
await alertService.processNewJob(jobPosting);
```

**checkJobMatchesSavedSearch(job, savedSearch)**
- يتحقق من مطابقة وظيفة لعملية بحث محفوظة
- يدعم جميع أنواع الفلاتر (نصي، موقع، راتب، مهارات، إلخ)
- يدعم منطق AND/OR للمهارات

```javascript
const matches = await alertService.checkJobMatchesSavedSearch(job, savedSearch);
```

**sendAlert(userId, savedSearch, newJobs)**
- يُرسل إشعار للمستخدم
- يتكامل مع نظام الإشعارات الموجود
- يتضمن معلومات الوظائف المطابقة

```javascript
await alertService.sendAlert(userId, savedSearch, [job1, job2]);
```

**runScheduledAlerts(frequency)**
- يُشغّل التنبيهات المجدولة (daily/weekly)
- يُستدعى من Cron jobs
- يُحدّث lastChecked تلقائياً

```javascript
await alertService.runScheduledAlerts('daily');
```

**isDuplicateAlert(userId, jobId)**
- يتحقق من وجود تنبيه سابق لنفس الوظيفة
- يمنع التنبيهات المكررة

```javascript
const isDuplicate = await alertService.isDuplicateAlert(userId, jobId);
```

---

## 🔄 تدفق العمل

### 1. التنبيهات الفورية (Instant Alerts)

```
نشر وظيفة جديدة
    ↓
jobPostingController.createJobPosting()
    ↓
alertService.processNewJob(job)
    ↓
جلب عمليات البحث المحفوظة (alertEnabled=true, alertFrequency='instant')
    ↓
لكل عملية بحث:
    ↓
checkJobMatchesSavedSearch(job, savedSearch)
    ↓
إذا مطابقة → sendAlert(userId, savedSearch, [job])
    ↓
notificationService.createNotification()
    ↓
إشعار يُرسل للمستخدم
```

### 2. التنبيهات المجدولة (Scheduled Alerts)

```
Cron Job يعمل (9:00 صباحاً يومياً/أسبوعياً)
    ↓
scheduledAlerts.runDailyAlerts() أو runWeeklyAlerts()
    ↓
alertService.runScheduledAlerts('daily' أو 'weekly')
    ↓
جلب عمليات البحث المحفوظة (alertEnabled=true, alertFrequency=frequency)
    ↓
لكل عملية بحث:
    ↓
checkNewResults(savedSearch)
    ↓
البحث عن وظائف جديدة منذ lastChecked
    ↓
إذا وُجدت نتائج → sendAlert(userId, savedSearch, newJobs)
    ↓
تحديث lastChecked
```

---

## 📊 معايير المطابقة

### الفلاتر المدعومة

| الفلتر | الوصف | المنطق |
|--------|-------|--------|
| **query** | البحث النصي | يبحث في title, description, skills |
| **location** | الموقع | يبحث في city, country |
| **salaryMin** | الحد الأدنى للراتب | job.salary.min >= salaryMin |
| **salaryMax** | الحد الأقصى للراتب | job.salary.max <= salaryMax |
| **workType** | نوع العمل | job.jobType in workType[] |
| **experienceLevel** | مستوى الخبرة | job.experienceLevel in experienceLevel[] |
| **skills** | المهارات | AND: جميع المهارات، OR: أي مهارة |
| **companySize** | حجم الشركة | job.company.size in companySize[] |

### منطق المهارات

**AND Logic** (skillsLogic: 'AND'):
```javascript
// يجب توفر جميع المهارات
searchParams.skills.every(skill =>
  job.skills.some(jobSkill => 
    jobSkill.toLowerCase().includes(skill.toLowerCase())
  )
)
```

**OR Logic** (skillsLogic: 'OR'):
```javascript
// يكفي توفر أي مهارة
searchParams.skills.some(skill =>
  job.skills.some(jobSkill => 
    jobSkill.toLowerCase().includes(skill.toLowerCase())
  )
)
```

---

## ⏰ جدولة التنبيهات

### Cron Jobs

**التنبيهات اليومية**:
- التوقيت: كل يوم في الساعة 9:00 صباحاً UTC
- Cron Expression: `'0 9 * * *'`
- الوظيفة: `scheduledAlerts.startDailyAlerts()`

**التنبيهات الأسبوعية**:
- التوقيت: كل يوم إثنين في الساعة 9:00 صباحاً UTC
- Cron Expression: `'0 9 * * 1'`
- الوظيفة: `scheduledAlerts.startWeeklyAlerts()`

### التشغيل اليدوي (للاختبار)

```javascript
const scheduledAlerts = require('./src/jobs/scheduledAlerts');

// تشغيل التنبيهات اليومية الآن
await scheduledAlerts.runDailyNow();

// تشغيل التنبيهات الأسبوعية الآن
await scheduledAlerts.runWeeklyNow();
```

---

## 🔒 منع التنبيهات المكررة

### الآلية

1. **عند معالجة وظيفة جديدة**:
   - يتحقق النظام من وجود إشعار سابق لنفس الوظيفة
   - يستخدم `isDuplicateAlert(userId, jobId)`
   - إذا وُجد إشعار سابق، لا يُرسل تنبيه جديد

2. **في الإشعار الواحد**:
   - كل إشعار يحتوي على قائمة `jobPostings`
   - لا يُضاف نفس jobId مرتين في نفس الإشعار

### مثال

```javascript
// التحقق من التكرار
const isDuplicate = await alertService.isDuplicateAlert(userId, jobId);

if (!isDuplicate) {
  await alertService.sendAlert(userId, savedSearch, [job]);
}
```

---

## 🧪 الاختبارات

### Property Tests

**Property 11: Alert Triggering on New Match**
- يتحقق من إرسال تنبيه واحد فقط عند نشر وظيفة مطابقة
- يتحقق من عدم إرسال تنبيه للوظائف غير المطابقة
- يتحقق من إرسال التنبيه فقط للمستخدمين الذين فعّلوا التنبيهات
- يتحقق من إرسال التنبيهات الفورية فقط (instant)

```bash
npm test -- alert-triggering.property.test.js
```

**Property 14: Alert Deduplication**
- يتحقق من عدم إرسال تنبيهات مكررة لنفس الوظيفة
- يتحقق من وظيفة `isDuplicateAlert`
- يتحقق من إمكانية إرسال تنبيهات لوظائف مختلفة

```bash
npm test -- alert-deduplication.property.test.js
```

### تشغيل جميع الاختبارات

```bash
cd backend
npm test -- alert-*.test.js
```

---

## 📈 مؤشرات الأداء

### الأهداف

| المؤشر | الهدف | الوصف |
|--------|-------|-------|
| **وقت المعالجة** | < 2s | وقت معالجة وظيفة جديدة |
| **دقة المطابقة** | > 95% | نسبة التنبيهات الصحيحة |
| **معدل التكرار** | < 1% | نسبة التنبيهات المكررة |
| **معدل التفاعل** | > 30% | نسبة المستخدمين الذين يتفاعلون مع التنبيهات |

### المراقبة

```javascript
// في alertService.js
logger.info(`Alert sent to user ${userId} for ${jobCount} new jobs`);
logger.info(`Processing new job ${jobPosting._id} against ${savedSearches.length} saved searches`);
```

---

## 🔧 التكوين

### المتغيرات البيئية

لا توجد متغيرات إضافية مطلوبة. النظام يستخدم:
- `MONGODB_URI` - للاتصال بقاعدة البيانات
- متغيرات نظام الإشعارات الموجود

### التبعيات

```json
{
  "node-cron": "^3.0.2"
}
```

تثبيت:
```bash
npm install node-cron
```

---

## 🚀 التشغيل

### 1. تشغيل السيرفر

```bash
cd backend
npm start
```

الـ Cron jobs تبدأ تلقائياً عند تشغيل السيرفر.

### 2. التحقق من التشغيل

```bash
# في logs السيرفر
✅ Scheduled alerts jobs started
📅 Daily alerts scheduled for 9:00 AM UTC
📅 Weekly alerts scheduled for Mondays at 9:00 AM UTC
```

### 3. اختبار التنبيهات

```javascript
// إنشاء عملية بحث محفوظة مع تنبيه
POST /api/search/saved
{
  "name": "JavaScript Jobs",
  "searchType": "jobs",
  "searchParams": {
    "query": "javascript",
    "skills": ["JavaScript", "React"]
  },
  "alertEnabled": true,
  "alertFrequency": "instant"
}

// نشر وظيفة مطابقة
POST /api/job-postings
{
  "title": "JavaScript Developer",
  "description": "We need a JavaScript developer",
  "skills": ["JavaScript", "React", "Node.js"],
  ...
}

// التحقق من الإشعار
GET /api/notifications
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تُرسل تنبيهات

**الحلول**:
1. تحقق من `alertEnabled: true` في SavedSearch
2. تحقق من `alertFrequency: 'instant'` للتنبيهات الفورية
3. تحقق من مطابقة الوظيفة لمعايير البحث
4. تحقق من logs السيرفر

```bash
# في logs
✅ Processed saved search alerts for job: JavaScript Developer
```

### المشكلة: تنبيهات مكررة

**الحلول**:
1. تحقق من وظيفة `isDuplicateAlert`
2. تحقق من Notification model
3. راجع logs للتأكد من عدم معالجة نفس الوظيفة مرتين

### المشكلة: Cron jobs لا تعمل

**الحلول**:
1. تحقق من تثبيت `node-cron`
2. تحقق من تشغيل `scheduledAlerts.start()` في index.js
3. تحقق من logs:

```bash
🔔 Scheduled alerts jobs started
```

---

## 📚 أمثلة الاستخدام

### مثال 1: تنبيه بسيط

```javascript
// عملية بحث بسيطة
const savedSearch = {
  name: "Developer Jobs",
  searchType: "jobs",
  searchParams: {
    query: "developer"
  },
  alertEnabled: true,
  alertFrequency: "instant"
};

// عند نشر وظيفة تحتوي على "developer"
// يُرسل تنبيه تلقائياً
```

### مثال 2: تنبيه مع فلاتر متعددة

```javascript
const savedSearch = {
  name: "Senior React Developer in Cairo",
  searchType: "jobs",
  searchParams: {
    query: "react",
    location: "Cairo",
    salaryMin: 8000,
    experienceLevel: ["senior"],
    skills: ["React", "TypeScript"],
    skillsLogic: "AND"
  },
  alertEnabled: true,
  alertFrequency: "instant"
};

// يُرسل تنبيه فقط للوظائف التي تطابق جميع المعايير
```

### مثال 3: تنبيه يومي

```javascript
const savedSearch = {
  name: "Daily JavaScript Jobs",
  searchType: "jobs",
  searchParams: {
    skills: ["JavaScript"]
  },
  alertEnabled: true,
  alertFrequency: "daily"
};

// يُرسل تنبيه يومياً في 9:00 صباحاً
// يتضمن جميع الوظائف الجديدة منذ آخر فحص
```

---

## 🎯 الفوائد المتوقعة

- 📈 زيادة معدل التقديم على الوظائف بنسبة 40%
- ⏱️ تقليل الوقت بين نشر الوظيفة والتقديم بنسبة 60%
- 😊 زيادة رضا المستخدمين بنسبة 50%
- 🎯 تحسين دقة المطابقة بنسبة 85%

---

## 🔮 التحسينات المستقبلية

1. **تنبيهات ذكية بالذكاء الاصطناعي**
   - استخدام ML لتحسين دقة المطابقة
   - التعلم من تفاعلات المستخدم

2. **تنبيهات متعددة القنوات**
   - SMS
   - WhatsApp
   - Telegram

3. **تخصيص أوقات التنبيهات**
   - السماح للمستخدم باختيار الوقت المفضل
   - احترام ساعات الهدوء

4. **تحليلات متقدمة**
   - معدل فتح التنبيهات
   - معدل التقديم من التنبيهات
   - أفضل أوقات الإرسال

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الحالة**: ✅ مكتمل ومفعّل
