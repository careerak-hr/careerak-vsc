# نظام تسجيل المقابلات - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. Backend Setup

**تثبيت التبعيات** (إذا لم تكن مثبتة):
```bash
cd backend
npm install
```

**إضافة المتغيرات البيئية** (.env):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**تشغيل السيرفر**:
```bash
npm run pm2:start
```

### 2. Frontend Setup

**استخدام المكون**:
```jsx
import RecordingControls from './components/VideoInterview/RecordingControls';

<RecordingControls
  interviewId={interviewId}
  localStream={localStream}
  remoteStream={remoteStream}
  isHost={true}
  onRecordingStart={() => console.log('Started')}
  onRecordingStop={() => console.log('Stopped')}
/>
```

---

## 📡 API السريع

### بدء التسجيل
```bash
POST /api/recordings/start
Body: { "interviewId": "..." }
```

### إيقاف التسجيل
```bash
POST /api/recordings/:recordingId/stop
```

### رفع التسجيل
```bash
POST /api/recordings/:recordingId/upload
Body: FormData with 'recording' file
```

---

## ✅ الميزات

- ✅ تسجيل HD (720p)
- ✅ رفع تلقائي إلى Cloudinary
- ✅ حذف تلقائي بعد 90 يوم
- ✅ مؤشر تسجيل وامض
- ✅ عداد وقت
- ✅ شريط تقدم الرفع
- ✅ دعم 3 لغات (ar, en, fr)
- ✅ تصميم متجاوب

---

## 🎬 التدفق

```
1. User clicks "Start Recording"
2. MediaRecorder starts (VP9, 2.5 Mbps)
3. Backend creates recording document
4. User clicks "Stop Recording"
5. Frontend uploads file
6. Cloudinary converts to MP4
7. Backend generates thumbnail
8. Recording ready for download
9. Auto-delete after 90 days
```

---

## 🔒 الأمان

- Host فقط يمكنه التسجيل
- يجب موافقة جميع المشاركين
- Host + Participants يمكنهم المشاهدة
- التسجيلات محمية بـ JWT

---

## 📊 الجودة

| المقياس | القيمة |
|---------|--------|
| الدقة | 1280x720 (HD) |
| Video Bitrate | 2.5 Mbps |
| Audio Bitrate | 128 kbps |
| Video Codec | H.264 |
| Audio Codec | AAC |
| Format | MP4 |

---

## 🐛 استكشاف الأخطاء

**"فقط المضيف يمكنه التسجيل"**
→ تحقق من `isHost={true}`

**"يجب موافقة جميع المشاركين"**
→ تحقق من `interview.recordingConsent`

**"لا توجد بثوث متاحة"**
→ تحقق من `localStream` و `remoteStream`

**"فشل الرفع"**
→ تحقق من Cloudinary credentials

---

## 📚 التوثيق الكامل

📄 `docs/VIDEO_INTERVIEW_RECORDING.md` - دليل شامل (500+ سطر)

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام

