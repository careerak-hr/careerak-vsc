# تبديل الكاميرا (أمامية/خلفية) - نظام الفيديو للمقابلات

## 📋 معلومات الميزة
- **تاريخ الإضافة**: 2026-03-01
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 1.6 (التبديل بين الكاميرا الأمامية والخلفية)

---

## 🎯 نظرة عامة

تم إضافة ميزة تبديل الكاميرا بين الوضع الأمامي (user) والخلفي (environment) للأجهزة المحمولة. هذه الميزة تسمح للمستخدمين بتبديل الكاميرا أثناء مقابلة الفيديو بسلاسة دون قطع الاتصال.

---

## 🔧 الملفات المعدلة

### Backend
```
backend/src/services/webrtcService.js
└── switchCamera() - دالة موجودة مسبقاً (سطر 353-370)
```

### Frontend
```
frontend/src/
├── services/webrtcService.js
│   ├── switchCamera() - دالة جديدة
│   ├── getAvailableCameras() - دالة جديدة
│   └── hasMultipleCameras() - دالة جديدة
├── components/VideoCall/
│   ├── VideoCall.jsx - محدّث بزر تبديل الكاميرا
│   └── VideoCall.css - تنسيقات جديدة
└── examples/
    └── VideoCallExample.jsx - محدّث بمثال كامل
```

---

## 🚀 الميزات الرئيسية

### 1. تبديل الكاميرا
- ✅ تبديل سلس بين الكاميرا الأمامية والخلفية
- ✅ تحديث تلقائي لـ peer connection
- ✅ دعم facingMode (user/environment)
- ✅ معالجة الأخطاء الشاملة

### 2. كشف الكاميرات المتاحة
- ✅ التحقق من وجود كاميرات متعددة
- ✅ إخفاء/إظهار زر التبديل تلقائياً
- ✅ دعم جميع الأجهزة المحمولة

### 3. واجهة المستخدم
- ✅ زر تبديل الكاميرا (🔄)
- ✅ مؤشر تحميل أثناء التبديل (⏳)
- ✅ تعطيل الزر عند إيقاف الفيديو
- ✅ رسائل خطأ واضحة

---

## 📖 الاستخدام

### Frontend - WebRTCService

```javascript
import WebRTCService from './services/webrtcService';

const webrtcService = new WebRTCService();

// 1. التحقق من وجود كاميرات متعددة
const hasMultiple = await webrtcService.hasMultipleCameras();
console.log('Multiple cameras:', hasMultiple); // true/false

// 2. الحصول على قائمة الكاميرات
const cameras = await webrtcService.getAvailableCameras();
console.log('Available cameras:', cameras);
// [
//   { deviceId: "...", kind: "videoinput", label: "Front Camera" },
//   { deviceId: "...", kind: "videoinput", label: "Back Camera" }
// ]

// 3. تبديل الكاميرا
try {
  const newStream = await webrtcService.switchCamera();
  console.log('✅ Camera switched successfully');
  // تحديث localStream في state
  setLocalStream(newStream);
} catch (error) {
  console.error('❌ Failed to switch camera:', error);
}
```

### Frontend - VideoCall Component

```jsx
import VideoCall from './components/VideoCall/VideoCall';

function MyVideoCallPage() {
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  useEffect(() => {
    // التحقق من الكاميرات المتاحة
    webrtcService.hasMultipleCameras().then(setHasMultipleCameras);
  }, []);

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
      remoteStream={remoteStream}
      onSwitchCamera={handleSwitchCamera}
      hasMultipleCameras={hasMultipleCameras}
      // ... props أخرى
    />
  );
}
```

---

## 🔍 كيف يعمل

### 1. الكشف عن الكاميرات
```javascript
async getAvailableCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'videoinput');
}

async hasMultipleCameras() {
  const cameras = await this.getAvailableCameras();
  return cameras.length > 1;
}
```

### 2. تبديل الكاميرا
```javascript
async switchCamera() {
  // 1. الحصول على facingMode الحالي
  const currentFacingMode = videoTrack.getSettings().facingMode || 'user';
  
  // 2. تحديد facingMode الجديد
  const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  
  // 3. إيقاف الكاميرا الحالية
  videoTrack.stop();
  
  // 4. الحصول على stream جديد
  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { exact: newFacingMode } }
  });
  
  // 5. تحديث peer connection
  const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
  await sender.replaceTrack(newStream.getVideoTracks()[0]);
  
  return newStream;
}
```

### 3. معالجة الأخطاء
```javascript
try {
  // محاولة مع exact
  newStream = await getUserMedia({
    video: { facingMode: { exact: newFacingMode } }
  });
} catch (error) {
  // Fallback بدون exact
  newStream = await getUserMedia({
    video: { facingMode: newFacingMode }
  });
}
```

---

## 🎨 واجهة المستخدم

### زر تبديل الكاميرا
```jsx
{hasMultipleCameras && (
  <button
    className={`control-btn ${isSwitchingCamera ? 'loading' : ''}`}
    onClick={handleSwitchCamera}
    disabled={isSwitchingCamera || !isVideoEnabled}
    title="تبديل الكاميرا"
  >
    {isSwitchingCamera ? '⏳' : '🔄'}
  </button>
)}
```

### التنسيقات CSS
```css
.control-btn.loading {
  background-color: #FFC107;
  animation: rotate 1s linear infinite;
  cursor: wait;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 📱 دعم الأجهزة

### الأجهزة المدعومة
- ✅ **Android** (Chrome, Firefox, Samsung Internet)
- ✅ **iOS** (Safari 11+)
- ✅ **Desktop** (إذا كان لديه كاميرات متعددة)

### متطلبات المتصفح
- Chrome 63+
- Firefox 55+
- Safari 11+
- Edge 79+

### facingMode Support
| المتصفح | user | environment | exact |
|---------|------|-------------|-------|
| Chrome Android | ✅ | ✅ | ✅ |
| Safari iOS | ✅ | ✅ | ⚠️ |
| Firefox Android | ✅ | ✅ | ✅ |
| Desktop | ✅ | ❌ | ❌ |

⚠️ Safari iOS: يدعم facingMode لكن قد لا يدعم `exact` في بعض الإصدارات

---

## 🧪 الاختبار

### اختبار يدوي

**على الموبايل:**
1. افتح التطبيق على جهاز محمول
2. انضم لمقابلة فيديو
3. تحقق من ظهور زر 🔄
4. اضغط على الزر
5. تحقق من تبديل الكاميرا بنجاح

**على Desktop:**
1. افتح التطبيق على جهاز كمبيوتر بكاميرات متعددة
2. انضم لمقابلة فيديو
3. تحقق من ظهور زر 🔄
4. اضغط على الزر
5. تحقق من تبديل الكاميرا بنجاح

### اختبار في Console
```javascript
// 1. التحقق من الكاميرات المتاحة
const cameras = await navigator.mediaDevices.enumerateDevices()
  .then(devices => devices.filter(d => d.kind === 'videoinput'));
console.log('Cameras:', cameras);

// 2. اختبار facingMode
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'user' }
});
console.log('Current facingMode:', 
  stream.getVideoTracks()[0].getSettings().facingMode
);

// 3. اختبار التبديل
const newStream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }
});
console.log('New facingMode:', 
  newStream.getVideoTracks()[0].getSettings().facingMode
);
```

---

## ⚠️ استكشاف الأخطاء

### المشكلة: الزر لا يظهر
**الحل:**
- تحقق من أن الجهاز لديه كاميرات متعددة
- تحقق من `hasMultipleCameras` prop
- افتح Console وشغّل:
  ```javascript
  navigator.mediaDevices.enumerateDevices()
    .then(devices => console.log(
      devices.filter(d => d.kind === 'videoinput')
    ));
  ```

### المشكلة: "Failed to switch camera"
**الحل:**
- تحقق من أن الجهاز يدعم facingMode
- جرب بدون `exact`:
  ```javascript
  video: { facingMode: 'environment' } // بدلاً من { exact: 'environment' }
  ```
- تحقق من permissions

### المشكلة: الكاميرا تتبدل لكن peer connection لا يتحدث
**الحل:**
- تحقق من أن `replaceTrack()` يتم استدعاؤه
- تحقق من أن peer connection موجود:
  ```javascript
  if (this.peerConnection) {
    const sender = this.peerConnection.getSenders()
      .find(s => s.track?.kind === 'video');
    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }
  }
  ```

---

## 📊 الفوائد المتوقعة

- 📱 تجربة مستخدم أفضل على الموبايل
- 🎥 مرونة أكبر في عرض المحتوى
- 👥 تحسين جودة المقابلات
- ✅ تلبية متطلبات المستخدمين

---

## 🔮 التحسينات المستقبلية

1. **اختيار كاميرا محددة**
   - قائمة منسدلة بجميع الكاميرات المتاحة
   - اختيار كاميرا محددة بدلاً من التبديل فقط

2. **حفظ التفضيلات**
   - حفظ الكاميرا المفضلة في localStorage
   - استخدام الكاميرا المحفوظة عند الانضمام

3. **معاينة قبل التبديل**
   - عرض معاينة للكاميرا الجديدة قبل التبديل
   - تأكيد من المستخدم

4. **تبديل تلقائي**
   - تبديل تلقائي عند تدوير الجهاز
   - تبديل تلقائي حسب السياق (مثلاً: عرض شاشة)

---

## 📚 المراجع

- [MDN: MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: MediaStreamTrack.getSettings()](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings)
- [MDN: RTCRtpSender.replaceTrack()](https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack)
- [WebRTC facingMode Constraint](https://www.w3.org/TR/mediacapture-streams/#def-constraint-facingMode)

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل
