# نظام الحذف التلقائي للتسجيلات - نظام الفيديو للمقابلات

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-03-01
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 2.6 (حذف تلقائي بعد 90 يوم)

---

## 🎯 نظرة عامة

نظام شامل للحذف التلقائي لتسجيلات المقابلات بعد فترة محددة (افتراضياً 90 يوم، قابل للتخصيص من 1-365 يوم).

### الميزات الرئيسية
- ✅ حذف تلقائي بعد انتهاء فترة الاحتفاظ
- ✅ فترة احتفاظ قابلة للتخصيص (1-365 يوم)
- ✅ Cron Job يعمل يومياً في الساعة 2:00 صباحاً
- ✅ تنبيهات للتسجيلات التي ستنتهي قريباً
- ✅ حذف يدوي مع تتبع السبب
- ✅ إحصائيات شاملة
- ✅ حذف من Cloudinary تلقائياً

---

## 📁 الملفات المنشأة

```
backend/src/
├── models/
│   └── InterviewRecording.js           # نموذج التسجيلات مع expiresAt
├── services/
│   └── recordingService.js             # خدمة إدارة التسجيلات
├── controllers/
│   └── recordingController.js          # معالج طلبات API
├── routes/
│   └── recordingRoutes.js              # مسارات API
└── jobs/
    └── recordingCleanupCron.js         # Cron Job للحذف التلقائي

docs/
├── VIDEO_INTERVIEWS_AUTO_DELETE.md     # هذا الملف
└── VIDEO_INTERVIEWS_AUTO_DELETE_QUICK_START.md  # دليل البدء السريع
```

---

## 🗄️ InterviewRecording Model

### الحقول الأساسية

```javascript
{
  recordingId: String (UUID),           // معرف فريد
  interviewId: ObjectId,                // مرجع للمقابلة
  startTime: Date,                      // وقت البدء
  endTime: Date,                        // وقت الانتهاء
  duration: Number,                     // المدة بالثواني
  fileSize: Number,                     // حجم الملف بالبايتات
  fileUrl: String,                      // رابط الملف
  thumbnailUrl: String,                 // رابط الصورة المصغرة
  status: String,                       // recording | processing | ready | deleted
  
  // حقول الحذف التلقائي
  expiresAt: Date,                      // تاريخ الانتهاء (مفهرس)
  retentionDays: Number,                // فترة الاحتفاظ (1-365)
  
  // حقول الحذف
  deletedAt: Date,                      // تاريخ الحذف
  deletedBy: ObjectId,                  // من قام بالحذف
  deletionReason: String,               // auto_expired | manual | user_request | admin_action
  
  downloadCount: Number,                // عدد التحميلات
  createdAt: Date,                      // تاريخ الإنشاء
  updatedAt: Date                       // تاريخ التحديث
}
```

### الدوال المساعدة

```javascript
// حساب تاريخ الانتهاء
recording.calculateExpiryDate()

// التحقق من انتهاء الصلاحية
recording.isExpired()

// الحصول على التسجيلات المنتهية
InterviewRecording.findExpired()

// الحصول على التسجيلات التي ستنتهي قريباً
InterviewRecording.findExpiringSoon(7) // خلال 7 أيام
```

---

## ⚙️ RecordingService

### الدوال الرئيسية

#### 1. بدء تسجيل جديد
```javascript
await recordingService.startRecording(interviewId, retentionDays = 90);
```

#### 2. إيقاف التسجيل
```javascript
await recordingService.stopRecording(recordingId, fileUrl, fileSize, duration);
```

#### 3. جدولة الحذف
```javascript
await recordingService.scheduleDelete(recordingId, retentionDays);
```

#### 4. تحديث فترة الاحتفاظ
```javascript
await recordingService.updateRetentionPeriod(recordingId, newRetentionDays);
```

#### 5. حذف يدوي
```javascript
await recordingService.deleteRecording(recordingId, userId, reason);
```

---

## 🔄 Cron Job - التنظيف التلقائي

### الجدولة

| المهمة | التوقيت | الوصف |
|--------|---------|-------|
| **التنظيف اليومي** | 2:00 صباحاً | حذف التسجيلات المنتهية |
| **الفحص الأسبوعي** | الأحد 10:00 صباحاً | تنبيه للتسجيلات التي ستنتهي خلال 7 أيام |

### كيف يعمل

1. **البحث**: يبحث عن التسجيلات التي `expiresAt < now`
2. **الحذف من Cloudinary**: يحذف الملف والصورة المصغرة
3. **تحديث الحالة**: يحدث status إلى 'deleted'
4. **التسجيل**: يسجل العملية في logs
5. **الإحصائيات**: يحدث إحصائيات التنظيف

### التشغيل اليدوي

```javascript
// في app.js أو index.js
const recordingCleanupCron = require('./jobs/recordingCleanupCron');

// بدء Cron Job
recordingCleanupCron.start();

// تشغيل يدوي
await recordingCleanupCron.runManually();

// الحصول على الإحصائيات
const stats = recordingCleanupCron.getStats();
```

---

## 🌐 API Endpoints

### 1. بدء تسجيل
```http
POST /api/recordings/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": "507f1f77bcf86cd799439011",
  "retentionDays": 90
}
```

**Response:**
```json
{
  "success": true,
  "message": "Recording started successfully",
  "data": {
    "recordingId": "550e8400-e29b-41d4-a716-446655440000",
    "interviewId": "507f1f77bcf86cd799439011",
    "startTime": "2026-03-01T10:00:00.000Z",
    "status": "recording",
    "retentionDays": 90,
    "expiresAt": "2026-05-30T10:00:00.000Z"
  }
}
```

### 2. جدولة الحذف
```http
PUT /api/recordings/:recordingId/schedule-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "retentionDays": 60
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delete scheduled successfully",
  "data": {
    "recordingId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2026-04-30T10:00:00.000Z",
    "retentionDays": 60,
    "daysRemaining": 60
  }
}
```

### 3. تحديث فترة الاحتفاظ
```http
PUT /api/recordings/:recordingId/retention
Authorization: Bearer <token>
Content-Type: application/json

{
  "retentionDays": 120
}
```

### 4. حذف يدوي
```http
DELETE /api/recordings/:recordingId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "user_request"
}
```

### 5. الحصول على إحصائيات التسجيلات (Admin)
```http
GET /api/recordings/stats/all
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      { "_id": "ready", "count": 150, "totalSize": 5368709120, "totalDuration": 45000 },
      { "_id": "deleted", "count": 50, "totalSize": 0, "totalDuration": 0 }
    ],
    "expired": 10,
    "expiringSoon": 5
  }
}
```

### 6. تشغيل التنظيف يدوياً (Admin)
```http
POST /api/recordings/cleanup/run
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed",
  "data": {
    "totalRuns": 45,
    "totalDeleted": 120,
    "totalErrors": 2,
    "isRunning": false,
    "lastRun": "2026-03-01T02:00:00.000Z",
    "lastRunStats": {
      "timestamp": "2026-03-01T02:00:00.000Z",
      "duration": 5432,
      "found": 10,
      "deleted": 10,
      "errors": 0
    }
  }
}
```

### 7. إحصائيات Cron Job (Admin)
```http
GET /api/recordings/cleanup/stats
Authorization: Bearer <admin_token>
```

---

## 🔧 التكامل مع app.js

```javascript
// في backend/src/app.js أو index.js

const recordingCleanupCron = require('./jobs/recordingCleanupCron');
const recordingRoutes = require('./routes/recordingRoutes');

// إضافة routes
app.use('/api/recordings', recordingRoutes);

// بدء Cron Job
recordingCleanupCron.start();

// إيقاف عند إغلاق التطبيق
process.on('SIGTERM', () => {
  recordingCleanupCron.stop();
  process.exit(0);
});
```

---

## 📊 الإحصائيات والمراقبة

### إحصائيات Cron Job

```javascript
const stats = recordingCleanupCron.getStats();

console.log(stats);
// {
//   totalRuns: 45,
//   totalDeleted: 120,
//   totalErrors: 2,
//   isRunning: false,
//   lastRun: Date,
//   lastRunStats: {
//     timestamp: Date,
//     duration: 5432,
//     found: 10,
//     deleted: 10,
//     errors: 0
//   }
// }
```

### إحصائيات التسجيلات

```javascript
const stats = await recordingService.getRecordingStats();

console.log(stats);
// {
//   byStatus: [
//     { _id: 'ready', count: 150, totalSize: 5368709120, totalDuration: 45000 },
//     { _id: 'deleted', count: 50, totalSize: 0, totalDuration: 0 }
//   ],
//   expired: 10,
//   expiringSoon: 5
// }
```

---

## 🔒 الأمان والخصوصية

### 1. التحقق من الصلاحيات
- جميع endpoints محمية بـ authentication
- endpoints الأدمن محمية بـ authorization
- المستخدم يمكنه فقط الوصول لتسجيلاته

### 2. تتبع الحذف
- تسجيل من قام بالحذف (deletedBy)
- تسجيل سبب الحذف (deletionReason)
- تسجيل تاريخ الحذف (deletedAt)

### 3. الحذف الآمن
- حذف من Cloudinary أولاً
- ثم تحديث حالة قاعدة البيانات
- معالجة الأخطاء الشاملة

---

## 🧪 الاختبار

### اختبار يدوي

```bash
# 1. إنشاء تسجيل
curl -X POST http://localhost:5000/api/recordings/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"interviewId":"507f1f77bcf86cd799439011","retentionDays":1}'

# 2. الانتظار يوم واحد

# 3. تشغيل التنظيف يدوياً
curl -X POST http://localhost:5000/api/recordings/cleanup/run \
  -H "Authorization: Bearer <admin_token>"

# 4. التحقق من الإحصائيات
curl http://localhost:5000/api/recordings/cleanup/stats \
  -H "Authorization: Bearer <admin_token>"
```

### اختبار Cron Job

```javascript
// في ملف اختبار
const recordingCleanupCron = require('./jobs/recordingCleanupCron');

// تشغيل يدوي
await recordingCleanupCron.runManually();

// التحقق من النتائج
const stats = recordingCleanupCron.getStats();
console.log(stats);
```

---

## 📈 الفوائد المتوقعة

- 💾 **توفير التخزين**: حذف تلقائي للملفات القديمة
- 💰 **تقليل التكاليف**: تقليل استخدام Cloudinary
- 🔒 **الخصوصية**: احترام فترة الاحتفاظ
- ⚖️ **الامتثال**: الالتزام بقوانين حماية البيانات
- 🔄 **الأتمتة**: لا حاجة للتدخل اليدوي

---

## ⚠️ ملاحظات مهمة

1. **فترة الاحتفاظ الافتراضية**: 90 يوم
2. **الحد الأدنى**: 1 يوم
3. **الحد الأقصى**: 365 يوم
4. **Cron Job**: يعمل يومياً في 2:00 صباحاً
5. **الحذف نهائي**: لا يمكن استرجاع التسجيلات المحذوفة
6. **Cloudinary**: يجب أن يكون مكوناً بشكل صحيح

---

## 🔄 التحديثات المستقبلية

- [ ] إشعارات للمستخدمين قبل الحذف (7 أيام)
- [ ] أرشفة بدلاً من الحذف (نقل لتخزين أرخص)
- [ ] تصدير التسجيلات قبل الحذف
- [ ] إحصائيات متقدمة (Dashboard)
- [ ] تكامل مع خدمات التخزين الأخرى (AWS S3, Azure)

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل
