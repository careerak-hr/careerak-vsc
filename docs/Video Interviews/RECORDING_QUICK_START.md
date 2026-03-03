# نظام تسجيل المقابلات - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. إعداد Backend

```bash
cd backend

# تثبيت التبعيات (إذا لم تكن مثبتة)
npm install node-cron multer

# إضافة المتغيرات في .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. تفعيل Routes

```javascript
// في backend/src/app.js
const recordingRoutes = require('./routes/recordingRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

app.use('/api/recordings', recordingRoutes);
app.use('/api/interviews', interviewRoutes);
```

### 3. تفعيل Cron Job

```javascript
// في backend/src/index.js أو app.js
const { scheduleDeleteExpiredRecordings } = require('./jobs/deleteExpiredRecordings');

// بعد الاتصال بقاعدة البيانات
scheduleDeleteExpiredRecordings();
```

### 4. استخدام في Frontend

```jsx
import RecordingConsent from './components/VideoInterview/RecordingConsent';
import RecordingControls from './components/VideoInterview/RecordingControls';

function VideoCallPage() {
  const [hasAllConsents, setHasAllConsents] = useState(false);

  return (
    <div>
      {/* طلب الموافقة */}
      <RecordingConsent
        interviewId={interviewId}
        userId={userId}
        userName={userName}
        isHost={isHost}
        onConsentGiven={() => setHasAllConsents(true)}
        apiUrl={apiUrl}
        token={token}
      />

      {/* أزرار التحكم */}
      <RecordingControls
        interviewId={interviewId}
        stream={stream}
        isHost={isHost}
        hasAllConsents={hasAllConsents}
        apiUrl={apiUrl}
        token={token}
      />
    </div>
  );
}
```

---

## 📝 أمثلة سريعة

### Backend - بدء التسجيل

```javascript
const RecordingService = require('./services/recordingService');
const recordingService = new RecordingService();

// بدء
const result = await recordingService.startRecording(interviewId, userId);

// إيقاف
const stopResult = await recordingService.stopRecording(interviewId, userId);

// رفع
await recordingService.uploadRecording(recordingId, fileBuffer);

// جدولة حذف
await recordingService.scheduleDelete(recordingId, 90);
```

### Frontend - استخدام RecordingService

```javascript
import RecordingService from './services/recordingService';

const recordingService = new RecordingService();

// بدء
await recordingService.startRecording(stream);

// إيقاف
const blob = await recordingService.stopRecording();

// رفع
await recordingService.uploadRecording(interviewId, token);
```

---

## 🧪 اختبار سريع

```bash
cd backend
npm test -- recording.test.js
```

---

## 🔧 تشغيل الحذف التلقائي يدوياً

```bash
cd backend
node scripts/cleanup-expired-recordings.js
```

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- `docs/Video Interviews/RECORDING_SYSTEM_IMPLEMENTATION.md`

---

**تاريخ الإنشاء**: 2026-03-02
