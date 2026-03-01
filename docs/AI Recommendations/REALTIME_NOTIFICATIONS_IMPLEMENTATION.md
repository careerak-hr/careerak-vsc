# 🔔 Real-time Recommendation Notifications - Implementation Guide

## 📋 معلومات الوثيقة
- **التاريخ**: 2026-03-01
- **الحالة**: ✅ مكتمل
- **المتطلبات**: Requirements 7.1, 7.2
- **المهمة**: Task 12.1

---

## 🎯 نظرة عامة

نظام إشعارات فورية ذكي يرسل تنبيهات تلقائية للمستخدمين والشركات عند:
1. **نشر وظيفة جديدة** - إشعار فوري للمستخدمين المناسبين
2. **تسجيل مرشح جديد** - إشعار فوري للشركات ذات الوظائف المناسبة
3. **تحديث الملف الشخصي** - إشعار عند وجود تطابقات عالية جديدة (80%+)

---

## 🏗️ البنية التقنية

### الملفات الأساسية

```
backend/src/
├── services/
│   └── realtimeRecommendationNotificationService.js  # الخدمة الرئيسية (600+ سطر)
├── controllers/
│   ├── recommendationController.js                   # 5 endpoints جديدة
│   ├── jobPostingController.js                       # محدّث مع hook تلقائي
│   └── userController.js                             # محدّث مع hook تلقائي
└── routes/
    └── recommendationRoutes.js                       # 5 routes جديدة
```

---

## 🔧 الميزات الرئيسية

### 1. إشعارات فورية عند نشر وظيفة جديدة

**كيف يعمل:**
1. عند نشر وظيفة جديدة، يتم تشغيل hook تلقائي
2. النظام يجلب جميع المستخدمين النشطين (حتى 1000 مستخدم)
3. يحسب نسبة التطابق لكل مستخدم مع الوظيفة
4. يرسل إشعارات فورية للمستخدمين ذوي التطابق ≥ 60%
5. الإشعارات تُرسل عبر:
   - قاعدة البيانات (Notification model)
   - Pusher (real-time push notifications)

**مثال:**
```javascript
// تلقائي عند نشر وظيفة
POST /api/job-postings
Body: { title: "مطور React", ... }

// النتيجة:
// ✅ Sent 15 real-time notifications for job: مطور React
// 📊 Matching users: 15, Average match: 72.3%
```

**API Endpoint (يدوي):**
```javascript
POST /api/recommendations/notify-new-job
Authorization: Bearer <token>
Body: {
  "jobId": "507f1f77bcf86cd799439011"
}

Response: {
  "success": true,
  "message": "تم إرسال الإشعارات بنجاح",
  "data": {
    "notified": 15,
    "failed": 0,
    "jobTitle": "مطور React",
    "matchingUsers": 15,
    "averageMatchScore": 72.3
  }
}
```

---

### 2. إشعارات فورية عند تسجيل مرشح جديد

**كيف يعمل:**
1. عند تسجيل مرشح جديد، يتم تشغيل hook تلقائي
2. النظام يجلب جميع الوظائف المفتوحة (حتى 500 وظيفة)
3. يحسب نسبة التطابق بين المرشح وكل وظيفة
4. يرسل إشعارات فورية للشركات ذات التطابق ≥ 60%
5. الإشعارات تُرسل عبر قاعدة البيانات و Pusher

**مثال:**
```javascript
// تلقائي عند التسجيل
POST /api/users/register
Body: { firstName: "أحمد", specialization: "React Developer", ... }

// النتيجة:
// ✅ Sent 8 real-time notifications for candidate: أحمد محمد
// 📊 Matching jobs: 8, Average match: 68.5%
```

**API Endpoint (يدوي):**
```javascript
POST /api/recommendations/notify-new-candidate
Authorization: Bearer <token>
Body: {
  "candidateId": "507f1f77bcf86cd799439011"
}

Response: {
  "success": true,
  "message": "تم إرسال الإشعارات بنجاح",
  "data": {
    "notified": 8,
    "failed": 0,
    "candidateName": "أحمد محمد",
    "matchingJobs": 8,
    "averageMatchScore": 68.5
  }
}
```

---

### 3. إشعارات عند تحديث الملف الشخصي

**كيف يعمل:**
1. عند تحديث الملف الشخصي، يمكن استدعاء endpoint يدوياً
2. النظام يعيد حساب التطابق مع جميع الوظائف المفتوحة
3. إذا وجد تطابقات عالية (≥ 80%)، يرسل إشعار واحد
4. الإشعار يحتوي على أفضل تطابق وعدد التطابقات العالية

**API Endpoint:**
```javascript
POST /api/recommendations/notify-profile-update
Authorization: Bearer <token>
Body: {
  "changes": {
    "skills": ["JavaScript", "React", "Node.js"]
  }
}

Response: {
  "success": true,
  "message": "تم إرسال الإشعار بنجاح",
  "data": {
    "notified": true,
    "highMatches": 5,
    "topMatchScore": 87.5
  }
}
```

---

## 📊 إعدادات الإشعارات

### الحصول على الإعدادات

```javascript
GET /api/recommendations/notification-settings
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "minMatchScore": 60,
    "pusherEnabled": true
  }
}
```

### تحديث الإعدادات

```javascript
PUT /api/recommendations/notification-settings
Authorization: Bearer <token>
Body: {
  "minMatchScore": 70
}

Response: {
  "success": true,
  "message": "تم تحديث الإعدادات بنجاح",
  "data": {
    "minMatchScore": 70
  }
}
```

---

## 🔔 هيكل الإشعار

### إشعار وظيفة مناسبة (job_match)

```javascript
{
  type: 'job_match',
  notificationId: '507f1f77bcf86cd799439011',
  title: 'وظيفة جديدة مناسبة لك! 🎯',
  message: 'وظيفة "مطور React" تناسب مهاراتك بنسبة 75%',
  jobId: '507f1f77bcf86cd799439012',
  jobTitle: 'مطور React',
  company: 'شركة التقنية',
  location: 'القاهرة',
  matchScore: 75,
  reasons: [
    'تطابق المهارات: JavaScript, React',
    'تطابق الخبرة: 3 سنوات',
    'تطابق الموقع: القاهرة'
  ],
  timestamp: '2026-03-01T10:30:00.000Z',
  action: {
    type: 'view_job',
    url: '/job-postings/507f1f77bcf86cd799439012'
  }
}
```

### إشعار مرشح مناسب (candidate_match)

```javascript
{
  type: 'candidate_match',
  notificationId: '507f1f77bcf86cd799439013',
  title: 'مرشح مناسب لوظيفتك! 👤',
  message: 'أحمد محمد مناسب لوظيفة "مطور React"',
  candidateId: '507f1f77bcf86cd799439014',
  candidateName: 'أحمد محمد',
  candidateSpecialization: 'React Developer',
  jobId: '507f1f77bcf86cd799439012',
  jobTitle: 'مطور React',
  matchScore: 72,
  reasons: [
    'تطابق المهارات: React, JavaScript',
    'تطابق التخصص: React Developer',
    'خبرة مناسبة: 3 سنوات'
  ],
  timestamp: '2026-03-01T10:35:00.000Z',
  action: {
    type: 'view_candidate',
    url: '/candidates/507f1f77bcf86cd799439014'
  }
}
```

### إشعار تحديث الملف (recommendation_update)

```javascript
{
  type: 'recommendation_update',
  notificationId: '507f1f77bcf86cd799439015',
  title: 'تطابق عالي بعد تحديث ملفك! 🎯',
  message: 'وجدنا 5 وظائف بتطابق عالي',
  topMatch: {
    jobId: '507f1f77bcf86cd799439016',
    jobTitle: 'Senior React Developer',
    company: 'شركة التقنية المتقدمة',
    matchScore: 87.5,
    reasons: [
      'تطابق ممتاز في المهارات',
      'خبرة مناسبة جداً',
      'موقع مطابق'
    ]
  },
  totalHighMatches: 5,
  timestamp: '2026-03-01T10:40:00.000Z',
  action: {
    type: 'view_recommendations',
    url: '/recommendations'
  }
}
```

---

## ⚙️ التكوين

### متغيرات البيئة

```env
# Pusher (للإشعارات الفورية)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu

# MongoDB (لحفظ الإشعارات)
MONGODB_URI=mongodb://localhost:27017/careerak
```

### الحد الأدنى لنسبة التطابق

```javascript
// الافتراضي: 60%
const realtimeNotificationService = require('./services/realtimeRecommendationNotificationService');

// تغيير الحد الأدنى
realtimeNotificationService.setMinMatchScore(70); // 70%

// الحصول على الحد الحالي
const minScore = realtimeNotificationService.getMinMatchScore(); // 70
```

---

## 🧪 الاختبار

### اختبار إشعارات الوظائف

```bash
# 1. نشر وظيفة جديدة
curl -X POST http://localhost:5000/api/job-postings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مطور React",
    "description": "نبحث عن مطور React محترف",
    "requirements": "خبرة 3 سنوات في React",
    "location": "القاهرة"
  }'

# 2. التحقق من السجلات
# ✅ Sent 15 real-time notifications for job: مطور React
# 📊 Matching users: 15, Average match: 72.3%
```

### اختبار إشعارات المرشحين

```bash
# 1. تسجيل مرشح جديد
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "password": "Password123!",
    "specialization": "React Developer",
    "role": "Employee"
  }'

# 2. التحقق من السجلات
# ✅ Sent 8 real-time notifications for candidate: أحمد محمد
# 📊 Matching jobs: 8, Average match: 68.5%
```

### اختبار إشعارات تحديث الملف

```bash
curl -X POST http://localhost:5000/api/recommendations/notify-profile-update \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": {
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }'
```

---

## 📈 مؤشرات الأداء

### الأداء المتوقع

| المقياس | القيمة |
|---------|--------|
| وقت معالجة الوظيفة الواحدة | < 5 ثواني |
| وقت معالجة المرشح الواحد | < 10 ثواني |
| عدد المستخدمين المعالجين | حتى 1000 |
| عدد الوظائف المعالجة | حتى 500 |
| معدل نجاح الإشعارات | > 95% |

### التحسينات المستقبلية

1. **Batch Processing** - معالجة دفعات كبيرة بكفاءة أعلى
2. **Caching** - تخزين مؤقت للتطابقات المحسوبة
3. **Queue System** - نظام طوابير للإشعارات (Redis/Bull)
4. **ML Optimization** - تحسين خوارزمية التطابق
5. **A/B Testing** - اختبار حدود مختلفة لنسبة التطابق

---

## 🔒 الأمان والخصوصية

### احترام تفضيلات المستخدم

```javascript
// فقط المستخدمين الذين لم يعطلوا التتبع
const users = await Individual.find({ 
  accountStatus: 'Active',
  'preferences.tracking.enabled': { $ne: false }
});
```

### حماية البيانات

- ✅ لا يتم إرسال بيانات حساسة في الإشعارات
- ✅ فقط المعلومات الأساسية (الاسم، التخصص، نسبة التطابق)
- ✅ الإشعارات محمية بـ authentication
- ✅ Pusher channels محمية بـ authentication

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يتم إرسال إشعارات

**الحل:**
1. تحقق من Pusher credentials في `.env`
2. تحقق من أن Pusher مفعّل: `pusherService.isEnabled()`
3. تحقق من السجلات: `console.log` في الخدمة

### المشكلة: عدد قليل من الإشعارات

**الحل:**
1. تحقق من الحد الأدنى لنسبة التطابق (الافتراضي: 60%)
2. خفض الحد الأدنى: `setMinMatchScore(50)`
3. تحقق من عدد المستخدمين/الوظائف النشطة

### المشكلة: بطء في الإرسال

**الحل:**
1. قلل عدد المستخدمين/الوظائف المعالجة
2. استخدم caching للتطابقات
3. استخدم queue system (Redis/Bull)

---

## 📚 المراجع

- [Notification Service](../services/notificationService.js)
- [Pusher Service](../services/pusherService.js)
- [Content-Based Filtering](../services/contentBasedFiltering.js)
- [Requirements 7.1, 7.2](../../.kiro/specs/ai-recommendations/requirements.md)

---

## ✅ الخلاصة

تم تنفيذ نظام إشعارات فورية شامل يدعم:
- ✅ إشعارات تلقائية عند نشر وظيفة جديدة
- ✅ إشعارات تلقائية عند تسجيل مرشح جديد
- ✅ إشعارات عند تحديث الملف الشخصي
- ✅ تكامل كامل مع Pusher للإشعارات الفورية
- ✅ إعدادات قابلة للتخصيص
- ✅ احترام خصوصية المستخدم
- ✅ أداء عالي وقابل للتوسع

**تاريخ الإكمال**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل
