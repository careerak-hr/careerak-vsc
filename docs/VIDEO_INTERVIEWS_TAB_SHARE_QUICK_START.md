# مشاركة تبويب المتصفح - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. التحقق من الدعم (30 ثانية)

```javascript
import ScreenShareService from './services/screenShareService';

if (ScreenShareService.isSupported()) {
  console.log('✅ مشاركة الشاشة مدعومة');
} else {
  console.log('❌ غير مدعومة');
}
```

---

### 2. مشاركة تبويب بسيطة (دقيقة)

```javascript
const service = new ScreenShareService();

// بدء المشاركة
const stream = await service.startTabShare();

// عرض المشاركة
videoElement.srcObject = stream;

// إيقاف المشاركة
service.stopScreenShare();
```

---

### 3. استخدام المكون الجاهز (دقيقتان)

```jsx
import ScreenShareControls from './components/VideoInterview/ScreenShareControls';

function MyComponent() {
  const handleShareStart = (stream, type) => {
    console.log('Started:', type);
    // إضافة stream إلى WebRTC
  };

  const handleShareStop = () => {
    console.log('Stopped');
    // تنظيف
  };

  return (
    <ScreenShareControls
      onShareStart={handleShareStart}
      onShareStop={handleShareStop}
    />
  );
}
```

---

### 4. التكامل مع WebRTC (دقيقتان)

```javascript
// بدء المشاركة
const stream = await service.startTabShare();

// إضافة إلى peer connection
stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});

// إنشاء offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// إرسال offer
signalingService.sendOffer(roomId, offer);
```

---

## 🎯 أمثلة سريعة

### مشاركة مع صوت
```javascript
const stream = await service.startTabShare();
// الصوت مضمّن افتراضياً ✅
```

### مشاركة بجودة مخصصة
```javascript
const stream = await service.startScreenShare({
  displaySurface: 'browser',
  width: 1280,
  height: 720,
  frameRate: 60
});
```

### التبديل من شاشة إلى تبويب
```javascript
await service.switchSource('tab');
```

### معالجة الأخطاء
```javascript
try {
  await service.startTabShare();
} catch (error) {
  alert(error.message);
}
```

---

## ✅ Checklist

- [ ] تحقق من دعم المتصفح
- [ ] استخدم HTTPS (أو localhost)
- [ ] اطلب إذن المستخدم
- [ ] عرض مؤشر المشاركة
- [ ] تعامل مع انتهاء المشاركة
- [ ] نظّف الموارد عند الإيقاف

---

## 🐛 حل المشاكل السريع

| المشكلة | الحل |
|---------|------|
| "غير مدعومة" | استخدم Chrome/Firefox/Edge |
| "تم رفض الإذن" | اطلب الإذن مرة أخرى |
| لا صوت | تحقق من audioTracks |
| جودة منخفضة | زد width/height/frameRate |

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/VIDEO_INTERVIEWS_TAB_SHARE.md` - دليل شامل
- 📄 `backend/src/services/README_SCREEN_SHARE.md` - دليل Backend
- 📄 `frontend/src/examples/ScreenShareExample.jsx` - أمثلة كاملة

---

**تاريخ الإنشاء**: 2026-03-01
