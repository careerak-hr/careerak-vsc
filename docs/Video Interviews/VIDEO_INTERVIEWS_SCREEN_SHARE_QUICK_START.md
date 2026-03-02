# دليل البدء السريع - مشاركة الشاشة

## ⚡ البدء في 5 دقائق

### 1. Backend Setup (دقيقة واحدة)

**إضافة المسار في app.js:**
```javascript
// backend/src/app.js
const screenShareRoutes = require('./routes/screenShareRoutes');

app.use('/api/screen-share', screenShareRoutes);
```

### 2. Frontend Setup (دقيقتان)

**استخدام المكون:**
```jsx
import ScreenShareControls from './components/VideoInterview/ScreenShareControls';

function VideoCall() {
  const handleStart = (stream) => {
    console.log('Screen share started:', stream);
    // إضافة stream إلى peer connection
  };

  const handleStop = () => {
    console.log('Screen share stopped');
  };

  return (
    <ScreenShareControls
      onScreenShareStart={handleStart}
      onScreenShareStop={handleStop}
      language="ar"
    />
  );
}
```

### 3. الاختبار (دقيقتان)

**اختبار أساسي:**
```javascript
import ScreenShareService from './services/screenShareService';

const service = new ScreenShareService();

// بدء المشاركة
const result = await service.startScreenShare({ quality: 'high' });
console.log('Sharing:', result.shareType, result.settings);

// إيقاف المشاركة
service.stopScreenShare();
```

---

## 🎯 أمثلة سريعة

### مشاركة الشاشة الكاملة
```javascript
await screenShareService.startScreenShare({
  quality: 'high' // 1080p
});
```

### مشاركة نافذة
```javascript
await screenShareService.startScreenShare({
  preferWindow: true,
  quality: 'medium' // 720p
});
```

### مشاركة تبويب
```javascript
await screenShareService.startScreenShare({
  preferCurrentTab: true,
  quality: 'low' // 480p
});
```

---

## 🔧 API سريع

### Backend
```http
POST /api/screen-share/start
POST /api/screen-share/stop
GET  /api/screen-share/status/:roomId
GET  /api/screen-share/stats/:roomId
```

### Frontend Service
```javascript
// بدء
await service.startScreenShare(options);

// إيقاف
service.stopScreenShare();

// التحقق
service.isScreenShareActive();

// معلومات
service.getCurrentScreenShare();
```

---

## 🐛 حل المشاكل السريع

### المشكلة: "Not supported"
```javascript
if (!ScreenShareService.isSupported()) {
  alert('المتصفح لا يدعم مشاركة الشاشة');
}
```

### المشكلة: "Permission denied"
```javascript
try {
  await service.startScreenShare();
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('يرجى السماح بمشاركة الشاشة');
  }
}
```

### المشكلة: "Already sharing"
```javascript
if (!service.isScreenShareActive()) {
  await service.startScreenShare();
}
```

---

## 📱 دعم المتصفحات

✅ Chrome, Firefox, Edge, Opera  
⚠️ Safari (iOS 13+)

---

## 🌍 اللغات المدعومة

```jsx
<ScreenShareControls language="ar" /> // العربية
<ScreenShareControls language="en" /> // English
<ScreenShareControls language="fr" /> // Français
```

---

## ✅ Checklist

- [ ] إضافة المسار في app.js
- [ ] استيراد المكون في صفحة المقابلة
- [ ] إضافة معالجات onStart و onStop
- [ ] اختبار على Chrome
- [ ] اختبار على Firefox
- [ ] اختبار على Mobile

---

**للتوثيق الكامل**: راجع `VIDEO_INTERVIEWS_SCREEN_SHARE.md`

**تاريخ الإنشاء**: 2026-03-01
