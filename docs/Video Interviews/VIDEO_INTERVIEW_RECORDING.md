# نظام تسجيل المقابلات - دليل شامل

## 📋 معلومات النظام
- **تاريخ الإضافة**: 2026-03-01
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 2.1, 2.4 (تسجيل الفيديو والصوت بجودة عالية)

---

## 🎯 نظرة عامة

نظام شامل لتسجيل مقابلات الفيديو بجودة HD مع رفع تلقائي إلى Cloudinary وحذف تلقائي بعد 90 يوم.

---

## ✨ الميزات الرئيسية

### Backend
- ✅ تسجيل الفيديو والصوت بجودة HD (720p)
- ✅ دعم MediaRecorder API مع VP9/VP8 codec
- ✅ رفع تلقائي إلى Cloudinary بصيغة MP4
- ✅ توليد صور مصغرة تلقائياً
- ✅ حذف تلقائي بعد 90 يوم (Cron job)
- ✅ تتبع عدد التحميلات
- ✅ حماية الوصول (Host + Participants فقط)

### Frontend
- ✅ مكون RecordingControls كامل
- ✅ مؤشر التسجيل الوامض
- ✅ عداد الوقت (HH:MM:SS)
- ✅ شريط تقدم الرفع
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم RTL/LTR
- ✅ دعم Dark Mode

---

## 📁 الملفات المضافة

### Backend
```
backend/
├── src/
│   ├── services/
│   │   └── recordingService.js           # خدمة التسجيل (400+ سطر)
│   ├── controllers/
│   │   └── recordingController.js        # معالج الطلبات (200+ سطر)
│   ├── routes/
│   │   └── recordingRoutes.js            # مسارات API (6 endpoints)
│   └── jobs/
│       └── recordingCleanupCron.js       # Cron job للحذف التلقائي
```

### Frontend
```
frontend/src/components/VideoInterview/
├── RecordingControls.jsx                 # مكون التحكم (300+ سطر)
└── RecordingControls.css                 # تنسيقات (200+ سطر)
```

---

## 🔧 الإعداد

### 1. Backend

**المتطلبات**:
- Node.js 16+
- MongoDB
- Cloudinary account
- node-cron (موجود بالفعل)

**المتغيرات البيئية** (.env):
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**التثبيت**:
```bash
cd backend
npm install  # جميع التبعيات موجودة
```

### 2. Frontend

**الاستخدام في VideoCall Component**:
```jsx
import RecordingControls from './RecordingControls';

<RecordingControls
  interviewId={interviewId}
  localStream={localStream}
  remoteStream={remoteStream}
  isHost={isHost}
  onRecordingStart={() => console.log('Recording started')}
  onRecordingStop={() => console.log('Recording stopped')}
/>
```

---

## 📡 API Endpoints

### 1. بدء التسجيل
```http
POST /api/recordings/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": "interview_id_here"
}
```

**Response**:
```json
{
  "success": true,
  "recordingId": "recording_id",
  "message": "بدأ التسجيل بنجاح"
}
```

### 2. إيقاف التسجيل
```http
POST /api/recordings/:recordingId/stop
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "recordingId": "recording_id",
  "duration": 300,
  "message": "تم إيقاف التسجيل، جاري المعالجة..."
}
```

### 3. رفع التسجيل
```http
POST /api/recordings/:recordingId/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

recording: <video_file>
```

**Response**:
```json
{
  "success": true,
  "fileUrl": "https://res.cloudinary.com/...",
  "fileSize": 52428800,
  "duration": 300,
  "message": "تم رفع التسجيل بنجاح"
}
```

### 4. الحصول على التسجيل
```http
GET /api/recordings/:recordingId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "recording": {
    "_id": "recording_id",
    "interviewId": "interview_id",
    "startTime": "2026-03-01T10:00:00.000Z",
    "endTime": "2026-03-01T10:05:00.000Z",
    "duration": 300,
    "fileUrl": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "fileSize": 52428800,
    "status": "ready",
    "expiresAt": "2026-05-30T10:05:00.000Z",
    "downloadCount": 5
  }
}
```

### 5. حذف التسجيل
```http
DELETE /api/recordings/:recordingId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "تم حذف التسجيل بنجاح"
}
```

### 6. تسجيلات المقابلة
```http
GET /api/recordings/interview/:interviewId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "recordings": [
    {
      "_id": "recording_id",
      "startTime": "2026-03-01T10:00:00.000Z",
      "duration": 300,
      "fileUrl": "https://res.cloudinary.com/...",
      "status": "ready"
    }
  ]
}
```

---

## 🎬 كيف يعمل

### 1. بدء التسجيل

```
User clicks "Start Recording"
         ↓
Frontend: Create MediaRecorder
         ↓
Frontend: Combine local + remote streams
         ↓
Frontend: Start recording (VP9/VP8, 2.5 Mbps)
         ↓
Backend: Create recording document
         ↓
Backend: Verify host + consent
         ↓
Frontend: Show recording indicator
```

### 2. أثناء التسجيل

```
MediaRecorder saves chunks every 10s
         ↓
Timer updates every second
         ↓
Recording indicator pulses
```

### 3. إيقاف التسجيل

```
User clicks "Stop Recording"
         ↓
Frontend: Stop MediaRecorder
         ↓
Frontend: Create Blob from chunks
         ↓
Backend: Update recording (status: processing)
         ↓
Frontend: Upload file with progress
         ↓
Backend: Upload to Cloudinary (convert to MP4)
         ↓
Backend: Generate thumbnail
         ↓
Backend: Update recording (status: ready)
         ↓
Backend: Schedule deletion (90 days)
```

---

## 🔒 الأمان

### صلاحيات الوصول
- **بدء/إيقاف التسجيل**: Host فقط
- **رفع التسجيل**: Host فقط
- **حذف التسجيل**: Host فقط
- **مشاهدة التسجيل**: Host + Participants

### التحقق من الموافقة
```javascript
// يجب موافقة جميع المشاركين قبل بدء التسجيل
const allConsented = interview.recordingConsent.every(c => c.consented);
if (!allConsented) {
  throw new Error('يجب موافقة جميع المشاركين قبل بدء التسجيل');
}
```

---

## 📊 جودة التسجيل

### إعدادات MediaRecorder
```javascript
{
  mimeType: 'video/webm;codecs=vp9,opus',
  videoBitsPerSecond: 2500000,  // 2.5 Mbps (HD)
  audioBitsPerSecond: 128000    // 128 kbps
}
```

### Cloudinary Transformation
```javascript
{
  width: 1280,
  height: 720,
  crop: 'limit',
  video_codec: 'h264',
  audio_codec: 'aac',
  format: 'mp4',
  quality: 'auto:best'
}
```

### النتيجة
- **الدقة**: 1280x720 (HD)
- **الترميز**: H.264 (فيديو) + AAC (صوت)
- **الصيغة**: MP4 (متوافق مع جميع المتصفحات)
- **الجودة**: عالية (auto:best)

---

## 🗑️ الحذف التلقائي

### Cron Job
```javascript
// يعمل يومياً في الساعة 2:00 صباحاً
cron.schedule('0 2 * * *', async () => {
  await recordingService.deleteExpiredRecordings();
});
```

### المنطق
```javascript
// حذف التسجيلات التي انتهت صلاحيتها
const expiredRecordings = await InterviewRecording.find({
  expiresAt: { $lt: new Date() },
  status: 'ready'
});

// حذف من Cloudinary + تحديث قاعدة البيانات
for (const recording of expiredRecordings) {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  recording.status = 'deleted';
  recording.fileUrl = null;
  await recording.save();
}
```

---

## 🎨 واجهة المستخدم

### حالات المكون

**1. قبل التسجيل**:
```
[⏺ بدء التسجيل]
```

**2. أثناء التسجيل**:
```
[⏹ إيقاف التسجيل]  [● جاري التسجيل 00:05:23]
```

**3. أثناء الرفع**:
```
[جاري الرفع ████████░░ 75%]
```

### الألوان
- **زر البدء**: أحمر (#e74c3c)
- **زر الإيقاف**: رمادي (#95a5a6)
- **مؤشر التسجيل**: أحمر وامض
- **شريط الرفع**: أزرق (#3498db)

---

## 📱 التصميم المتجاوب

### Desktop (> 768px)
```
[⏺ بدء التسجيل]  [● جاري التسجيل 00:05:23]
```

### Mobile (< 768px)
```
[⏺ بدء التسجيل]
────────────────
[● جاري التسجيل]
[00:05:23]
```

---

## 🌍 دعم اللغات

### العربية
- بدء التسجيل
- إيقاف التسجيل
- جاري التسجيل
- جاري الرفع

### English
- Start Recording
- Stop Recording
- Recording
- Uploading

### Français
- Démarrer l'enregistrement
- Arrêter l'enregistrement
- Enregistrement
- Téléchargement

---

## 🧪 الاختبار

### اختبار يدوي

**1. بدء التسجيل**:
```bash
curl -X POST http://localhost:5000/api/recordings/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"interviewId": "interview_id"}'
```

**2. إيقاف التسجيل**:
```bash
curl -X POST http://localhost:5000/api/recordings/recording_id/stop \
  -H "Authorization: Bearer <token>"
```

**3. رفع التسجيل**:
```bash
curl -X POST http://localhost:5000/api/recordings/recording_id/upload \
  -H "Authorization: Bearer <token>" \
  -F "recording=@test-video.webm"
```

### اختبار Frontend

**1. فتح صفحة المقابلة**
**2. النقر على "بدء التسجيل"**
**3. التحدث لمدة 30 ثانية**
**4. النقر على "إيقاف التسجيل"**
**5. انتظار اكتمال الرفع**
**6. التحقق من Cloudinary**

---

## 🐛 استكشاف الأخطاء

### "فقط المضيف يمكنه بدء التسجيل"
- تحقق من أن المستخدم هو host المقابلة
- تحقق من `interview.hostId === userId`

### "يجب موافقة جميع المشاركين"
- تحقق من `interview.recordingConsent`
- تأكد من موافقة جميع المشاركين

### "لا توجد بثوث متاحة للتسجيل"
- تحقق من `localStream` و `remoteStream`
- تأكد من اتصال WebRTC

### "فشل رفع التسجيل"
- تحقق من Cloudinary credentials
- تحقق من حجم الملف (< 500 MB)
- تحقق من اتصال الإنترنت

### "MediaRecorder not supported"
- تحقق من دعم المتصفح
- استخدم Chrome/Firefox/Edge الحديث
- Safari يتطلب iOS 14.3+

---

## 📈 الفوائد المتوقعة

- 📹 تسجيل بجودة HD احترافية
- ☁️ تخزين آمن في السحابة
- 🔄 رفع تلقائي بدون تدخل
- 🗑️ حذف تلقائي لتوفير المساحة
- 📊 تتبع الاستخدام والتحميلات
- 🔒 حماية كاملة للخصوصية
- 🌍 دعم متعدد اللغات
- 📱 يعمل على جميع الأجهزة

---

## 🔮 التحسينات المستقبلية

- [ ] دعم تسجيل الشاشة المشاركة
- [ ] تسجيل منفصل لكل مشارك
- [ ] ترجمة تلقائية للتسجيلات
- [ ] تحليل المشاعر من الصوت
- [ ] توليد ملخص تلقائي
- [ ] دعم البث المباشر
- [ ] تسجيل بجودة 1080p/4K
- [ ] ضغط أفضل للملفات

---

## 📚 المراجع

- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Cloudinary Video API](https://cloudinary.com/documentation/video_manipulation_and_delivery)
- [WebRTC Recording](https://webrtc.org/getting-started/media-capture-and-constraints)
- [node-cron](https://www.npmjs.com/package/node-cron)

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل

