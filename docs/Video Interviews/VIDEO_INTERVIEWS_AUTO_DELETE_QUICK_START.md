# دليل البدء السريع - الحذف التلقائي للتسجيلات

## ⚡ البدء في 5 دقائق

### 1. التثبيت (دقيقة واحدة)

```bash
cd backend
npm install node-cron uuid
```

### 2. التكوين (دقيقة واحدة)

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

### 3. الاستخدام الأساسي (3 دقائق)

#### إنشاء تسجيل جديد

```javascript
// Frontend
const response = await fetch('/api/recordings/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    interviewId: '507f1f77bcf86cd799439011',
    retentionDays: 90 // اختياري، الافتراضي 90
  })
});

const { data } = await response.json();
console.log('Recording ID:', data.recordingId);
console.log('Expires at:', data.expiresAt);
```

#### تحديث فترة الاحتفاظ

```javascript
const response = await fetch(`/api/recordings/${recordingId}/retention`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    retentionDays: 120 // تمديد إلى 120 يوم
  })
});
```

#### حذف يدوي

```javascript
const response = await fetch(`/api/recordings/${recordingId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'user_request'
  })
});
```

---

## 🔧 الإعدادات المتقدمة

### تخصيص جدولة Cron

```javascript
// في recordingCleanupCron.js

// تغيير التوقيت (مثلاً: كل ساعة)
this.dailyJob = cron.schedule('0 * * * *', async () => {
  await this.cleanup();
});

// تغيير توقيت الفحص الأسبوعي (مثلاً: كل يوم)
this.weeklyJob = cron.schedule('0 10 * * *', async () => {
  await this.notifyExpiringSoon(7);
});
```

### تخصيص فترة الاحتفاظ الافتراضية

```javascript
// في InterviewRecording model

retentionDays: {
  type: Number,
  default: 60, // تغيير من 90 إلى 60 يوم
  min: 1,
  max: 365
}
```

---

## 📊 المراقبة

### الحصول على الإحصائيات

```javascript
// Frontend (Admin)
const response = await fetch('/api/recordings/cleanup/stats', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const { data } = await response.json();
console.log('Total runs:', data.totalRuns);
console.log('Total deleted:', data.totalDeleted);
console.log('Last run:', data.lastRun);
```

### تشغيل التنظيف يدوياً

```javascript
// Frontend (Admin)
const response = await fetch('/api/recordings/cleanup/run', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const { data } = await response.json();
console.log('Cleanup completed:', data);
```

---

## 🧪 الاختبار السريع

### 1. إنشاء تسجيل تجريبي

```bash
curl -X POST http://localhost:5000/api/recordings/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interviewId": "507f1f77bcf86cd799439011",
    "retentionDays": 1
  }'
```

### 2. تشغيل التنظيف يدوياً (بعد يوم)

```bash
curl -X POST http://localhost:5000/api/recordings/cleanup/run \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. التحقق من النتائج

```bash
curl http://localhost:5000/api/recordings/cleanup/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## ⚠️ استكشاف الأخطاء

### المشكلة: Cron Job لا يعمل

**الحل:**
```javascript
// تحقق من أن Cron Job بدأ
const stats = recordingCleanupCron.getStats();
console.log('Is running:', stats.isRunning);
console.log('Last run:', stats.lastRun);

// تشغيل يدوي للاختبار
await recordingCleanupCron.runManually();
```

### المشكلة: التسجيلات لا تُحذف

**الحل:**
```javascript
// تحقق من التسجيلات المنتهية
const InterviewRecording = require('./models/InterviewRecording');
const expired = await InterviewRecording.findExpired();
console.log('Expired recordings:', expired.length);

// تحقق من expiresAt
const recording = await InterviewRecording.findOne({ recordingId });
console.log('Expires at:', recording.expiresAt);
console.log('Is expired:', recording.isExpired());
```

### المشكلة: خطأ في حذف من Cloudinary

**الحل:**
```javascript
// تحقق من إعدادات Cloudinary
console.log('Cloudinary configured:', !!cloudinary.config().cloud_name);

// اختبار الحذف يدوياً
await cloudinary.uploader.destroy('careerak/recordings/test', {
  resource_type: 'video'
});
```

---

## 📚 الموارد

- 📄 [التوثيق الكامل](./VIDEO_INTERVIEWS_AUTO_DELETE.md)
- 📄 [InterviewRecording Model](../backend/src/models/InterviewRecording.js)
- 📄 [RecordingService](../backend/src/services/recordingService.js)
- 📄 [Cron Job](../backend/src/jobs/recordingCleanupCron.js)

---

## ✅ Checklist

- [ ] تثبيت node-cron و uuid
- [ ] إضافة routes في app.js
- [ ] بدء Cron Job في app.js
- [ ] اختبار إنشاء تسجيل
- [ ] اختبار تحديث فترة الاحتفاظ
- [ ] اختبار الحذف اليدوي
- [ ] اختبار Cron Job يدوياً
- [ ] مراقبة الإحصائيات

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام
