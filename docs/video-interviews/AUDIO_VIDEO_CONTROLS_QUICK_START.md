# أزرار كتم الصوت وإيقاف الفيديو - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. الاستيراد (30 ثانية)

```jsx
import VideoCall from './components/VideoCall/VideoCall';
```

### 2. الإعداد (2 دقيقة)

```jsx
import React, { useState, useEffect } from 'react';

function MyInterview() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);

  // الحصول على media stream
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    })
    .then(stream => setLocalStream(stream))
    .catch(err => console.error('Error:', err));
  }, []);

  return (
    <VideoCall
      localStream={localStream}
      remoteStream={null}
      onToggleAudio={() => {
        const track = localStream?.getAudioTracks()[0];
        if (track) {
          track.enabled = !track.enabled;
          setIsAudioEnabled(track.enabled);
        }
      }}
      onToggleVideo={() => {
        const track = localStream?.getVideoTracks()[0];
        if (track) {
          track.enabled = !track.enabled;
          setIsVideoEnabled(track.enabled);
        }
      }}
      isAudioEnabled={isAudioEnabled}
      isVideoEnabled={isVideoEnabled}
    />
  );
}
```

### 3. التشغيل (30 ثانية)

```bash
npm start
```

### 4. الاختبار (2 دقيقة)

```bash
npm test -- VideoCall.test.jsx
```

---

## 🎯 الميزات الأساسية

| الميزة | الأيقونة | الوظيفة |
|-------|---------|---------|
| كتم الصوت | 🎤/🔇 | تبديل الميكروفون |
| إيقاف الفيديو | 📹/📷 | تبديل الكاميرا |
| تبديل الكاميرا | 🔄 | أمامية/خلفية |

---

## 📱 Props الأساسية

```jsx
<VideoCall
  localStream={stream}           // MediaStream
  onToggleAudio={handleAudio}    // Function
  onToggleVideo={handleVideo}    // Function
  isAudioEnabled={true}          // Boolean
  isVideoEnabled={true}          // Boolean
/>
```

---

## ✅ Checklist

- [ ] استيراد VideoCall
- [ ] إعداد state للصوت والفيديو
- [ ] الحصول على media stream
- [ ] تمرير handlers للأزرار
- [ ] اختبار الأزرار
- [ ] التحقق من التصميم المتجاوب

---

## 🐛 مشاكل شائعة

**الصوت لا يعمل؟**
```javascript
// تحقق من الإذن
navigator.permissions.query({ name: 'microphone' })
```

**الفيديو لا يعمل؟**
```javascript
// تحقق من الإذن
navigator.permissions.query({ name: 'camera' })
```

---

## 📚 المزيد

- 📄 [التوثيق الكامل](./AUDIO_VIDEO_CONTROLS.md)
- 📄 [مثال كامل](../../frontend/src/examples/VideoCallExample.jsx)
- 📄 [الاختبارات](../../frontend/src/components/VideoCall/__tests__/VideoCall.test.jsx)

---

**وقت الإعداد**: 5 دقائق  
**الصعوبة**: سهل ⭐  
**الحالة**: ✅ جاهز للاستخدام
