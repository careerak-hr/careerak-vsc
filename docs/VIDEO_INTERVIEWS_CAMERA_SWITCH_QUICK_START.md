# تبديل الكاميرا - دليل البدء السريع ⚡

## 🚀 الاستخدام في 3 خطوات

### 1. إضافة الدوال في Component

```jsx
import { useState, useEffect } from 'react';
import WebRTCService from './services/webrtcService';

function MyVideoCall() {
  const [webrtcService] = useState(() => new WebRTCService());
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  // التحقق من الكاميرات المتاحة
  useEffect(() => {
    webrtcService.hasMultipleCameras()
      .then(setHasMultipleCameras);
  }, []);

  // دالة تبديل الكاميرا
  const handleSwitchCamera = async () => {
    try {
      const newStream = await webrtcService.switchCamera();
      setLocalStream(newStream);
    } catch (error) {
      alert('فشل تبديل الكاميرا: ' + error.message);
    }
  };

  return (
    <VideoCall
      localStream={localStream}
      onSwitchCamera={handleSwitchCamera}
      hasMultipleCameras={hasMultipleCameras}
    />
  );
}
```

### 2. استخدام VideoCall Component

```jsx
<VideoCall
  localStream={localStream}
  remoteStream={remoteStream}
  onToggleAudio={handleToggleAudio}
  onToggleVideo={handleToggleVideo}
  onSwitchCamera={handleSwitchCamera}  // ← جديد
  hasMultipleCameras={hasMultipleCameras}  // ← جديد
  isAudioEnabled={isAudioEnabled}
  isVideoEnabled={isVideoEnabled}
  connectionQuality={connectionQuality}
/>
```

### 3. الزر يظهر تلقائياً!

الزر 🔄 سيظهر تلقائياً إذا كان:
- ✅ `hasMultipleCameras === true`
- ✅ الفيديو مفعّل (`isVideoEnabled === true`)

---

## 📱 الاختبار السريع

### على الموبايل
1. افتح التطبيق على هاتفك
2. انضم لمقابلة فيديو
3. اضغط على زر 🔄
4. الكاميرا ستتبدل من أمامية → خلفية أو العكس

### في Console
```javascript
// التحقق من الكاميرات
const cameras = await navigator.mediaDevices.enumerateDevices()
  .then(d => d.filter(x => x.kind === 'videoinput'));
console.log('عدد الكاميرات:', cameras.length);

// اختبار التبديل
const service = new WebRTCService();
await service.getUserMedia();
const newStream = await service.switchCamera();
console.log('✅ تم التبديل بنجاح');
```

---

## ⚠️ استكشاف الأخطاء السريع

| المشكلة | الحل |
|---------|------|
| الزر لا يظهر | تحقق من `hasMultipleCameras` prop |
| "Failed to switch camera" | جرب بدون `exact` في facingMode |
| الكاميرا تتبدل لكن الطرف الآخر لا يرى | تحقق من `replaceTrack()` |

---

## 🔗 روابط مفيدة

- 📄 [التوثيق الكامل](./VIDEO_INTERVIEWS_CAMERA_SWITCH.md)
- 📄 [مثال كامل](../frontend/src/examples/VideoCallExample.jsx)
- 📄 [WebRTCService](../frontend/src/services/webrtcService.js)

---

**نصيحة**: استخدم `hasMultipleCameras()` لإخفاء الزر على الأجهزة التي لديها كاميرا واحدة فقط!
