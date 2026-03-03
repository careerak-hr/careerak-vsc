# خدمة تسجيل المقابلات (RecordingService)

## 📋 نظرة عامة

خدمة شاملة لتسجيل مقابلات الفيديو، تتعامل مع:
- بدء وإيقاف التسجيل
- رفع التسجيلات إلى Cloudinary
- إدارة موافقات المشاركين
- توليد صور مصغرة
- الحذف التلقائي بعد 90 يوم

**Requirements**: 2.1, 2.3, 2.4, 2.5, 2.6  
**Design**: Section 6 - RecordingService

---

## 🎯 الميزات الرئيسية

### 1. إدارة التسجيل
- ✅ بدء التسجيل مع التحقق من الموافقات
- ✅ إيقاف التسجيل وحساب المدة
- ✅ حالات التسجيل: not_started, recording, stopped, processing, ready, failed

### 2. رفع التسجيلات
- ✅ رفع إلى Cloudinary
- ✅ دعم Buffer و File Path
- ✅ معالجة تلقائية للفيديو
- ✅ توليد صورة مصغرة

### 3. نظام الموافقات
- ✅ موافقة إلزامية من جميع المشاركين
- ✅ تتبع حالة الموافقة لكل مشارك
- ✅ منع التسجيل بدون موافقة كاملة

### 4. الحذف التلقائي
- ✅ انتهاء صلاحية بعد 90 يوم
- ✅ حذف من Cloudinary
- ✅ تحديث السجلات

---

## 📦 التثبيت

```bash
npm install uuid
```

---

## 🚀 الاستخدام

### Backend - بدء التسجيل

```javascript
const recordingService = require('./services/recordingService');

// بدء التسجيل
const result = await recordingService.startRecording(interviewId, userId);
// {
//   success: true,
//   message: 'تم بدء التسجيل بنجاح',
//   recording: {
//     status: 'recording',
//     startedAt: '2026-02-17T10:00:00.000Z'
//   }
// }
```

### Backend - إيقاف التسجيل

```javascript
// إيقاف التسجيل
const result = await recordingService.stopRecording(interviewId, userId);
// {
//   success: true,
//   message: 'تم إيقاف التسجيل بنجاح',
//   recording: {
//     status: 'stopped',
//     startedAt: '2026-02-17T10:00:00.000Z',
//     stoppedAt: '2026-02-17T10:30:00.000Z',
//     duration: 1800 // 30 دقيقة
//   }
// }
```

### Backend - رفع التسجيل

```javascript
// رفع من Buffer
const result = await recordingService.uploadRecording(
  interviewId,
  videoBuffer,
  { filename: 'interview.webm' }
);

// رفع من مسار ملف
const result = await recordingService.uploadRecording(
  interviewId,
  '/path/to/video.webm'
);

// النتيجة:
// {
//   success: true,
//   message: 'تم رفع التسجيل بنجاح',
//   recording: {
//     videoUrl: 'https://res.cloudinary.com/...',
//     thumbnailUrl: 'https://res.cloudinary.com/...',
//     fileSize: 52428800, // 50 MB
//     duration: 1800,
//     expiresAt: '2026-05-18T10:30:00.000Z'
//   }
// }
```

### Backend - إدارة الموافقات

```javascript
// إضافة موافقة
await recordingService.addRecordingConsent(interviewId, userId, true);

// التحقق من جميع الموافقات
const result = await recordingService.checkAllConsents(interviewId);
// {
//   success: true,
//   hasAllConsents: true,
//   consentStatus: [
//     {
//       userId: '...',
//       name: 'أحمد محمد',
//       email: 'ahmed@example.com',
//       consented: true,
//       consentedAt: '2026-02-17T09:55:00.000Z'
//     },
//     // ...
//   ]
// }
```

### Frontend - استخدام MediaRecorder

```javascript
import RecordingService from './services/recordingService';

const recordingService = new RecordingService();

// التحقق من الدعم
if (!RecordingService.isSupported()) {
  console.error('المتصفح لا يدعم التسجيل');
  return;
}

// بدء التسجيل
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

await recordingService.startRecording(
  stream,
  (data) => {
    console.log('Data available:', data.size);
  },
  (blob) => {
    console.log('Recording stopped:', blob.size);
  }
);

// إيقاف التسجيل
const blob = await recordingService.stopRecording();

// رفع التسجيل
await recordingService.uploadRecording(interviewId, blob);
```

---

## 🔧 API Endpoints

### POST /api/interviews/:id/recording/start
بدء التسجيل (المضيف فقط)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "تم بدء التسجيل بنجاح",
  "recording": {
    "status": "recording",
    "startedAt": "2026-02-17T10:00:00.000Z"
  }
}
```

### POST /api/interviews/:id/recording/stop
إيقاف التسجيل (المضيف فقط)

**Response:**
```json
{
  "success": true,
  "message": "تم إيقاف التسجيل بنجاح",
  "recording": {
    "status": "stopped",
    "startedAt": "2026-02-17T10:00:00.000Z",
    "stoppedAt": "2026-02-17T10:30:00.000Z",
    "duration": 1800
  }
}
```

### POST /api/interviews/:id/recording/upload
رفع التسجيل (المضيف فقط)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
video: <file>
```

**Response:**
```json
{
  "success": true,
  "message": "تم رفع التسجيل بنجاح",
  "recording": {
    "videoUrl": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "fileSize": 52428800,
    "duration": 1800,
    "expiresAt": "2026-05-18T10:30:00.000Z"
  }
}
```

### GET /api/interviews/:id/recording
الحصول على معلومات التسجيل

**Response:**
```json
{
  "success": true,
  "recording": {
    "status": "ready",
    "videoUrl": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "duration": 1800,
    "fileSize": 52428800,
    "startedAt": "2026-02-17T10:00:00.000Z",
    "stoppedAt": "2026-02-17T10:30:00.000Z",
    "expiresAt": "2026-05-18T10:30:00.000Z",
    "downloadCount": 5
  }
}
```

### POST /api/interviews/:id/recording/consent
إضافة موافقة على التسجيل

**Body:**
```json
{
  "consented": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تسجيل موافقتك على التسجيل",
  "hasAllConsents": true
}
```

### GET /api/interviews/:id/recording/consents
التحقق من موافقة جميع المشاركين

**Response:**
```json
{
  "success": true,
  "hasAllConsents": true,
  "consentStatus": [
    {
      "userId": "...",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "consented": true,
      "consentedAt": "2026-02-17T09:55:00.000Z"
    }
  ]
}
```

---

## 📊 حالات التسجيل

| الحالة | الوصف |
|--------|-------|
| `not_started` | لم يبدأ التسجيل بعد |
| `recording` | التسجيل قيد التشغيل |
| `stopped` | تم إيقاف التسجيل |
| `processing` | جاري معالجة الفيديو |
| `ready` | التسجيل جاهز للمشاهدة |
| `failed` | فشل التسجيل أو الرفع |
| `deleted` | تم حذف التسجيل |

---

## 🔒 الأمان والخصوصية

### موافقة إلزامية
- يجب الحصول على موافقة **جميع** المشاركين قبل بدء التسجيل
- لا يمكن بدء التسجيل بدون موافقة كاملة
- يتم تتبع حالة الموافقة لكل مشارك

### صلاحيات الوصول
- فقط **المضيف** يمكنه بدء/إيقاف التسجيل
- فقط **المشاركون** يمكنهم الوصول للتسجيل
- التحقق من الصلاحيات في كل طلب

### الحذف التلقائي
- انتهاء صلاحية بعد **90 يوم** (قابل للتخصيص)
- حذف تلقائي من Cloudinary
- تحديث السجلات بحالة "deleted"

---

## 🎬 تنسيقات الفيديو المدعومة

### Frontend (MediaRecorder)
- `video/webm;codecs=vp9,opus` (الأفضل)
- `video/webm;codecs=vp8,opus`
- `video/webm;codecs=h264,opus`
- `video/webm`
- `video/mp4`

### Backend (Cloudinary)
- جميع تنسيقات الفيديو الشائعة
- تحويل تلقائي إلى MP4 للتوافق
- ضغط تلقائي للحجم

---

## 🔧 الإعدادات

### Frontend - إعدادات MediaRecorder

```javascript
const options = {
  mimeType: 'video/webm;codecs=vp9,opus',
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000,  // 128 kbps
};
```

### Backend - إعدادات Cloudinary

```javascript
const uploadOptions = {
  resource_type: 'video',
  folder: 'careerak/interviews',
  // تحويل تلقائي، ضغط، إلخ
};
```

---

## 🐛 استكشاف الأخطاء

### "المتصفح لا يدعم التسجيل"
```javascript
const supportInfo = RecordingService.getSupportInfo();
console.log(supportInfo);
// {
//   isSupported: false,
//   hasMediaDevices: true,
//   hasGetUserMedia: true,
//   hasMediaRecorder: false, // المشكلة هنا
//   supportedMimeTypes: []
// }
```

**الحل**: استخدم متصفح حديث (Chrome, Firefox, Edge)

### "يجب الحصول على موافقة جميع المشاركين"
```javascript
const result = await recordingService.checkAllConsents(interviewId);
console.log(result.consentStatus);
// ابحث عن المشاركين الذين لم يوافقوا بعد
```

**الحل**: اطلب من جميع المشاركين الموافقة قبل بدء التسجيل

### "فشل رفع التسجيل"
- تحقق من حجم الملف (الحد الأقصى: 500 MB)
- تحقق من اتصال الإنترنت
- تحقق من إعدادات Cloudinary

---

## 📅 الحذف التلقائي (Cron Job)

### إعداد Cron Job

```javascript
// في server.js أو index.js
const cron = require('node-cron');
const recordingService = require('./services/recordingService');

// تشغيل كل يوم في الساعة 2 صباحاً
cron.schedule('0 2 * * *', async () => {
  console.log('Running expired recordings cleanup...');
  const result = await recordingService.deleteExpiredRecordings();
  console.log(`Deleted ${result.deletedCount} expired recordings`);
});
```

### تشغيل يدوي

```javascript
const result = await recordingService.deleteExpiredRecordings();
console.log(result);
// {
//   success: true,
//   deletedCount: 5,
//   totalExpired: 5,
//   errors: undefined
// }
```

---

## 📝 ملاحظات مهمة

1. **الموافقة إلزامية**: لا يمكن بدء التسجيل بدون موافقة جميع المشاركين
2. **المضيف فقط**: فقط المضيف يمكنه بدء/إيقاف التسجيل
3. **الحذف التلقائي**: التسجيلات تُحذف تلقائياً بعد 90 يوم
4. **الحجم الأقصى**: 500 MB للملف الواحد
5. **التنسيقات**: WebM (Frontend) → MP4 (Cloudinary)

---

## 🔗 الملفات ذات الصلة

- `backend/src/models/VideoInterview.js` - نموذج المقابلة
- `backend/src/services/recordingService.js` - خدمة التسجيل (Backend)
- `frontend/src/services/recordingService.js` - خدمة التسجيل (Frontend)
- `backend/src/controllers/videoInterviewController.js` - معالج الطلبات
- `backend/src/routes/videoInterviewRoutes.js` - المسارات

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل
