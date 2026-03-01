# دليل البدء السريع - خدمة تسجيل المقابلات

## 📋 نظرة عامة سريعة

خدمة شاملة لتسجيل مقابلات الفيديو مع:
- ✅ MediaRecorder API للتسجيل
- ✅ رفع إلى Cloudinary
- ✅ موافقة إلزامية من المشاركين
- ✅ حذف تلقائي بعد 90 يوم

**الوقت المتوقع**: 10 دقائق

---

## 🚀 البدء السريع

### 1. Backend - إنشاء مقابلة (دقيقة واحدة)

```javascript
// POST /api/interviews/create
const response = await fetch('/api/interviews/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    participants: ['userId1', 'userId2'],
    scheduledAt: '2026-03-01T10:00:00Z',
    settings: {
      recordingEnabled: true,
      waitingRoomEnabled: true,
      maxParticipants: 2
    }
  })
});

const { interview } = await response.json();
// interview.id, interview.roomId
```

### 2. Frontend - إضافة موافقة (دقيقة واحدة)

```javascript
import RecordingService from './services/recordingService';

const recordingService = new RecordingService();

// إضافة موافقة
await recordingService.addRecordingConsent(interviewId, true);
```

### 3. Frontend - بدء التسجيل (دقيقتان)

```javascript
// الحصول على stream
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true
});

// بدء التسجيل على الخادم
await recordingService.startRecordingOnServer(interviewId);

// بدء التسجيل محلياً
await recordingService.startRecording(
  stream,
  null, // onDataAvailable
  async (blob) => {
    // عند إيقاف التسجيل
    console.log('Recording stopped, size:', blob.size);
    
    // رفع التسجيل
    await recordingService.uploadRecording(interviewId, blob);
  }
);
```

### 4. Frontend - إيقاف التسجيل (دقيقة واحدة)

```javascript
// إيقاف التسجيل على الخادم
await recordingService.stopRecordingOnServer(interviewId);

// إيقاف التسجيل محلياً (سيتم رفعه تلقائياً)
const blob = await recordingService.stopRecording();
```

### 5. Backend - الحصول على التسجيل (30 ثانية)

```javascript
// GET /api/interviews/:id/recording
const response = await fetch(`/api/interviews/${interviewId}/recording`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { recording } = await response.json();
// recording.videoUrl, recording.thumbnailUrl, recording.duration
```

---

## 🎯 مثال كامل - مكون React

```jsx
import React, { useState, useEffect } from 'react';
import RecordingService from '../services/recordingService';

function VideoRecording({ interviewId, stream }) {
  const [recordingService] = useState(() => new RecordingService());
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // الاستماع لتحديثات المدة
    const handleDurationUpdate = (event) => {
      setDuration(event.detail.duration);
    };

    window.addEventListener('recording-duration-update', handleDurationUpdate);
    
    return () => {
      window.removeEventListener('recording-duration-update', handleDurationUpdate);
      recordingService.cleanup();
    };
  }, []);

  const handleConsentChange = async (consented) => {
    try {
      await recordingService.addRecordingConsent(interviewId, consented);
      setHasConsent(consented);
    } catch (error) {
      console.error('Error adding consent:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      // بدء على الخادم
      await recordingService.startRecordingOnServer(interviewId);
      
      // بدء محلياً
      await recordingService.startRecording(
        stream,
        null,
        async (blob) => {
          // رفع عند الإيقاف
          await recordingService.uploadRecording(interviewId, blob);
        }
      );
      
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(error.message);
    }
  };

  const handleStopRecording = async () => {
    try {
      // إيقاف على الخادم
      await recordingService.stopRecordingOnServer(interviewId);
      
      // إيقاف محلياً
      await recordingService.stopRecording();
      
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <div className="recording-controls">
      {/* موافقة التسجيل */}
      {!hasConsent && (
        <div className="consent-dialog">
          <h3>موافقة على التسجيل</h3>
          <p>هل توافق على تسجيل هذه المقابلة؟</p>
          <button onClick={() => handleConsentChange(true)}>
            أوافق
          </button>
          <button onClick={() => handleConsentChange(false)}>
            لا أوافق
          </button>
        </div>
      )}

      {/* أزرار التحكم */}
      {hasConsent && (
        <div className="controls">
          {!isRecording ? (
            <button onClick={handleStartRecording}>
              🔴 بدء التسجيل
            </button>
          ) : (
            <>
              <button onClick={handleStopRecording}>
                ⏹️ إيقاف التسجيل
              </button>
              <span className="duration">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoRecording;
```

---

## 🔧 إعداد Backend

### 1. إضافة المسارات في app.js

```javascript
// في backend/src/app.js
const videoInterviewRoutes = require('./routes/videoInterviewRoutes');

app.use('/api/interviews', videoInterviewRoutes);
```

### 2. إعداد Cron Job للحذف التلقائي

```javascript
// في backend/src/index.js
const cron = require('node-cron');
const recordingService = require('./services/recordingService');

// تشغيل كل يوم في الساعة 2 صباحاً
cron.schedule('0 2 * * *', async () => {
  console.log('Running expired recordings cleanup...');
  const result = await recordingService.deleteExpiredRecordings();
  console.log(`Deleted ${result.deletedCount} expired recordings`);
});
```

---

## 📊 حالات التسجيل

```
not_started → recording → stopped → processing → ready
                                              ↓
                                           failed
```

---

## 🔒 القواعد المهمة

1. **موافقة إلزامية**: جميع المشاركين يجب أن يوافقوا قبل بدء التسجيل
2. **المضيف فقط**: فقط المضيف يمكنه بدء/إيقاف التسجيل
3. **الحذف التلقائي**: التسجيلات تُحذف بعد 90 يوم
4. **الحجم الأقصى**: 500 MB للملف

---

## 🐛 استكشاف الأخطاء السريع

### "المتصفح لا يدعم التسجيل"
```javascript
if (!RecordingService.isSupported()) {
  alert('المتصفح لا يدعم التسجيل. استخدم Chrome أو Firefox');
}
```

### "يجب الحصول على موافقة جميع المشاركين"
```javascript
const result = await recordingService.checkAllConsents(interviewId);
console.log('Missing consents:', result.consentStatus.filter(c => !c.consented));
```

### "فشل رفع التسجيل"
- تحقق من حجم الملف (< 500 MB)
- تحقق من اتصال الإنترنت
- تحقق من إعدادات Cloudinary في `.env`

---

## 📝 Checklist

- [ ] إنشاء مقابلة مع `recordingEnabled: true`
- [ ] جميع المشاركين أضافوا موافقتهم
- [ ] بدء التسجيل على الخادم
- [ ] بدء التسجيل محلياً مع MediaRecorder
- [ ] إيقاف التسجيل على الخادم
- [ ] إيقاف التسجيل محلياً
- [ ] رفع التسجيل إلى Cloudinary
- [ ] التحقق من التسجيل في `/api/interviews/:id/recording`

---

## 🔗 الملفات المطلوبة

**Backend**:
- ✅ `backend/src/models/VideoInterview.js`
- ✅ `backend/src/services/recordingService.js`
- ✅ `backend/src/controllers/videoInterviewController.js`
- ✅ `backend/src/routes/videoInterviewRoutes.js`

**Frontend**:
- ✅ `frontend/src/services/recordingService.js`

**التوثيق**:
- ✅ `backend/src/services/README_RECORDING_SERVICE.md`
- ✅ `docs/Video Interviews/RECORDING_SERVICE_QUICK_START.md`

---

## 🎉 تم!

الآن لديك نظام تسجيل مقابلات كامل يعمل!

**الخطوات التالية**:
1. اختبار التسجيل على متصفحات مختلفة
2. إضافة UI للموافقة على التسجيل
3. إضافة مؤشر "جاري التسجيل"
4. إضافة معاينة التسجيل قبل الرفع

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام
