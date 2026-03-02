# مشاركة تبويب المتصفح - نظام الفيديو للمقابلات

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-03-01
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 3.3 (مشاركة تبويب المتصفح)

---

## 🎯 نظرة عامة

مشاركة تبويب المتصفح هي ميزة تسمح للمستخدمين بمشاركة محتوى تبويب واحد فقط من المتصفح، بدلاً من الشاشة الكاملة أو نافذة محددة. هذه الميزة مفيدة جداً عندما:

- تريد عرض موقع ويب أو تطبيق ويب محدد
- تريد مشاركة صوت التبويب (مثل فيديو YouTube)
- تريد الحفاظ على خصوصية التبويبات الأخرى
- تريد تقليل استهلاك الموارد

---

## ✨ الميزات الرئيسية

### 1. مشاركة تبويب واحد فقط
- ✅ مشاركة محتوى تبويب محدد
- ✅ عزل عن التبويبات الأخرى
- ✅ خصوصية أفضل

### 2. مشاركة صوت التبويب
- ✅ مشاركة صوت الفيديوهات
- ✅ مشاركة صوت التطبيقات
- ✅ جودة صوت عالية

### 3. جودة عالية
- ✅ دقة 1080p (1920x1080)
- ✅ معدل إطارات 30fps
- ✅ جودة صوت 48kHz

### 4. سهولة الاستخدام
- ✅ واجهة بسيطة
- ✅ تبديل سريع بين الأنواع
- ✅ إيقاف سهل

---

## 🚀 الاستخدام السريع

### Backend

```javascript
const ScreenShareService = require('./services/screenShareService');
const screenShareService = new ScreenShareService();

// بدء مشاركة تبويب
const shareInfo = await screenShareService.startScreenShare(
  roomId,
  userId,
  'tab',
  stream
);

console.log('Tab share started:', shareInfo);
// {
//   success: true,
//   roomId: 'room-123',
//   userId: 'user-456',
//   type: 'tab',
//   quality: { width: 1920, height: 1080, frameRate: 30 },
//   startedAt: Date
// }

// إيقاف المشاركة
await screenShareService.stopScreenShare(roomId, userId);
```

### Frontend

```javascript
import ScreenShareService from './services/screenShareService';

const screenShareService = new ScreenShareService();

// بدء مشاركة تبويب
const stream = await screenShareService.startTabShare();

// إضافة stream إلى peer connection
peerConnection.addStream(stream);

// إيقاف المشاركة
screenShareService.stopScreenShare();
```

### React Component

```jsx
import React, { useState } from 'react';
import ScreenShareControls from './components/VideoInterview/ScreenShareControls';

function VideoCallPage() {
  const [isSharing, setIsSharing] = useState(false);

  const handleShareStart = (stream, type) => {
    console.log('Sharing:', type);
    setIsSharing(true);
    // إضافة stream إلى WebRTC
  };

  const handleShareStop = () => {
    console.log('Stopped sharing');
    setIsSharing(false);
    // إزالة stream من WebRTC
  };

  return (
    <div>
      <ScreenShareControls
        onShareStart={handleShareStart}
        onShareStop={handleShareStop}
      />
    </div>
  );
}
```

---

## 📚 API Reference

### Backend Service

#### `startScreenShare(roomId, userId, type, stream)`

بدء مشاركة الشاشة.

**Parameters:**
- `roomId` (string) - معرف الغرفة
- `userId` (string) - معرف المستخدم
- `type` (string) - نوع المشاركة ('tab')
- `stream` (MediaStream) - stream المشاركة

**Returns:** `Promise<Object>`
```javascript
{
  success: true,
  roomId: string,
  userId: string,
  type: 'tab',
  quality: {
    width: number,
    height: number,
    frameRate: number
  },
  startedAt: Date
}
```

**Example:**
```javascript
const shareInfo = await screenShareService.startScreenShare(
  'room-123',
  'user-456',
  'tab',
  stream
);
```

---

#### `stopScreenShare(roomId, userId)`

إيقاف مشاركة الشاشة.

**Parameters:**
- `roomId` (string) - معرف الغرفة
- `userId` (string) - معرف المستخدم

**Returns:** `Promise<Object>`
```javascript
{
  success: true,
  roomId: string,
  userId: string,
  duration: number // بالميلي ثانية
}
```

**Example:**
```javascript
const result = await screenShareService.stopScreenShare('room-123', 'user-456');
console.log('Duration:', result.duration);
```

---

#### `getActiveShare(roomId)`

الحصول على معلومات المشاركة النشطة.

**Parameters:**
- `roomId` (string) - معرف الغرفة

**Returns:** `Object|null`
```javascript
{
  userId: string,
  type: 'tab',
  quality: {
    width: number,
    height: number,
    frameRate: number
  },
  startedAt: Date,
  duration: number
}
```

**Example:**
```javascript
const shareInfo = screenShareService.getActiveShare('room-123');
if (shareInfo) {
  console.log('Sharing:', shareInfo.type);
}
```

---

### Frontend Service

#### `startTabShare()`

بدء مشاركة تبويب المتصفح.

**Returns:** `Promise<MediaStream>`

**Throws:** `Error` مع رسالة مترجمة

**Example:**
```javascript
try {
  const stream = await screenShareService.startTabShare();
  console.log('Tab share started');
} catch (error) {
  console.error('Error:', error.message);
}
```

---

#### `startScreenShare(options)`

بدء مشاركة الشاشة مع خيارات مخصصة.

**Parameters:**
- `options` (Object) - خيارات المشاركة
  - `displaySurface` ('browser') - نوع السطح
  - `width` (number) - العرض المطلوب
  - `height` (number) - الارتفاع المطلوب
  - `frameRate` (number) - معدل الإطارات
  - `audio` (boolean) - تضمين الصوت

**Returns:** `Promise<MediaStream>`

**Example:**
```javascript
const stream = await screenShareService.startScreenShare({
  displaySurface: 'browser',
  width: 1920,
  height: 1080,
  frameRate: 30,
  audio: true
});
```

---

#### `stopScreenShare()`

إيقاف مشاركة الشاشة.

**Returns:** `void`

**Example:**
```javascript
screenShareService.stopScreenShare();
```

---

#### `switchSource(newType)`

تبديل مصدر المشاركة.

**Parameters:**
- `newType` (string) - النوع الجديد ('tab', 'screen', 'window')

**Returns:** `Promise<MediaStream>`

**Example:**
```javascript
// التبديل من شاشة إلى تبويب
const stream = await screenShareService.switchSource('tab');
```

---

#### `isSharing()`

التحقق من وجود مشاركة نشطة.

**Returns:** `boolean`

**Example:**
```javascript
if (screenShareService.isSharing()) {
  console.log('Currently sharing');
}
```

---

#### `getShareType()`

الحصول على نوع المشاركة الحالي.

**Returns:** `string|null` - 'tab', 'screen', 'window', أو null

**Example:**
```javascript
const type = screenShareService.getShareType();
console.log('Sharing type:', type);
```

---

#### `getQuality()`

الحصول على معلومات جودة المشاركة.

**Returns:** `Object|null`
```javascript
{
  width: number,
  height: number,
  frameRate: number,
  aspectRatio: number
}
```

**Example:**
```javascript
const quality = screenShareService.getQuality();
console.log('Quality:', quality.width, 'x', quality.height);
```

---

#### `static isSupported()`

التحقق من دعم مشاركة الشاشة.

**Returns:** `boolean`

**Example:**
```javascript
if (ScreenShareService.isSupported()) {
  console.log('Screen sharing is supported');
} else {
  console.log('Screen sharing is not supported');
}
```

---

## 🎨 مكون ScreenShareControls

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onShareStart` | function | No | - | يُستدعى عند بدء المشاركة |
| `onShareStop` | function | No | - | يُستدعى عند إيقاف المشاركة |
| `disabled` | boolean | No | false | تعطيل الأزرار |

### Events

#### `onShareStart(stream, type)`

يُستدعى عند بدء المشاركة بنجاح.

**Parameters:**
- `stream` (MediaStream) - stream المشاركة
- `type` (string) - نوع المشاركة ('tab', 'screen', 'window')

**Example:**
```jsx
<ScreenShareControls
  onShareStart={(stream, type) => {
    console.log('Started sharing:', type);
    peerConnection.addStream(stream);
  }}
/>
```

---

#### `onShareStop()`

يُستدعى عند إيقاف المشاركة.

**Example:**
```jsx
<ScreenShareControls
  onShareStop={() => {
    console.log('Stopped sharing');
    // تنظيف
  }}
/>
```

---

## 🔧 التكامل مع WebRTC

### إضافة stream إلى peer connection

```javascript
const stream = await screenShareService.startTabShare();

// إضافة tracks
stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});

// إنشاء offer جديد
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// إرسال offer عبر signaling
signalingService.sendOffer(roomId, offer);
```

### إزالة stream من peer connection

```javascript
const senders = peerConnection.getSenders();
senders.forEach(sender => {
  if (sender.track && sender.track.kind === 'video') {
    peerConnection.removeTrack(sender);
  }
});

// إنشاء offer جديد
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// إرسال offer عبر signaling
signalingService.sendOffer(roomId, offer);
```

### استقبال stream من الطرف الآخر

```javascript
peerConnection.ontrack = (event) => {
  const stream = event.streams[0];
  
  // عرض stream في video element
  remoteVideoRef.current.srcObject = stream;
  
  // التحقق من نوع المشاركة
  const videoTrack = stream.getVideoTracks()[0];
  const settings = videoTrack.getSettings();
  
  if (settings.displaySurface === 'browser') {
    console.log('Receiving tab share');
  }
};
```

---

## 🎯 أمثلة الاستخدام

### مثال 1: مشاركة تبويب بسيطة

```javascript
import ScreenShareService from './services/screenShareService';

const service = new ScreenShareService();

// بدء المشاركة
const stream = await service.startTabShare();

// عرض المشاركة
videoElement.srcObject = stream;

// إيقاف المشاركة
service.stopScreenShare();
```

---

### مثال 2: مشاركة تبويب مع صوت

```javascript
// مشاركة تبويب مع صوت (افتراضي)
const stream = await service.startTabShare();

// التحقق من وجود صوت
const audioTracks = stream.getAudioTracks();
if (audioTracks.length > 0) {
  console.log('Audio is included');
}
```

---

### مثال 3: مشاركة تبويب مع جودة مخصصة

```javascript
const stream = await service.startScreenShare({
  displaySurface: 'browser',
  width: 1280,
  height: 720,
  frameRate: 60,
  audio: true
});

console.log('Tab share started with custom quality');
```

---

### مثال 4: التبديل من شاشة إلى تبويب

```javascript
// بدء مشاركة شاشة
await service.startFullScreenShare();
console.log('Sharing screen');

// التبديل إلى تبويب
await service.switchSource('tab');
console.log('Now sharing tab');
```

---

### مثال 5: معالجة الأخطاء

```javascript
try {
  const stream = await service.startTabShare();
  console.log('Tab share started');
} catch (error) {
  if (error.message.includes('رفض')) {
    alert('يرجى السماح بمشاركة الشاشة');
  } else if (error.message.includes('غير مدعومة')) {
    alert('المتصفح لا يدعم مشاركة الشاشة');
  } else {
    alert('خطأ: ' + error.message);
  }
}
```

---

### مثال 6: الاستماع لانتهاء المشاركة

```javascript
window.addEventListener('screenshare-ended', () => {
  console.log('Tab share ended by user');
  
  // تحديث UI
  setIsSharing(false);
  
  // تنظيف
  videoElement.srcObject = null;
});
```

---

### مثال 7: مشاركة تبويب في React

```jsx
import React, { useState, useRef, useEffect } from 'react';
import ScreenShareService from './services/screenShareService';

function TabShareComponent() {
  const [isSharing, setIsSharing] = useState(false);
  const [quality, setQuality] = useState(null);
  const videoRef = useRef(null);
  const serviceRef = useRef(new ScreenShareService());

  const handleStartShare = async () => {
    try {
      const stream = await serviceRef.current.startTabShare();
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsSharing(true);
      setQuality(serviceRef.current.getQuality());
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const handleStopShare = () => {
    serviceRef.current.stopScreenShare();
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsSharing(false);
    setQuality(null);
  };

  useEffect(() => {
    const handleEnded = () => {
      handleStopShare();
    };

    window.addEventListener('screenshare-ended', handleEnded);

    return () => {
      window.removeEventListener('screenshare-ended', handleEnded);
      if (serviceRef.current.isSharing()) {
        serviceRef.current.stopScreenShare();
      }
    };
  }, []);

  return (
    <div>
      <h2>مشاركة تبويب المتصفح</h2>
      
      <video ref={videoRef} autoPlay muted style={{ width: '100%' }} />
      
      {!isSharing ? (
        <button onClick={handleStartShare}>
          بدء مشاركة التبويب
        </button>
      ) : (
        <>
          <button onClick={handleStopShare}>
            إيقاف المشاركة
          </button>
          
          {quality && (
            <div>
              الجودة: {quality.width}x{quality.height} @ {quality.frameRate}fps
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "تم رفض إذن مشاركة الشاشة"

**السبب:** المستخدم رفض الإذن أو ألغى الطلب.

**الحل:**
```javascript
try {
  await service.startTabShare();
} catch (error) {
  if (error.message.includes('رفض')) {
    // عرض رسالة للمستخدم
    alert('يرجى السماح بمشاركة الشاشة للمتابعة');
  }
}
```

---

### المشكلة: "مشاركة الشاشة غير مدعومة"

**السبب:** المتصفح لا يدعم getDisplayMedia API.

**الحل:**
```javascript
if (!ScreenShareService.isSupported()) {
  alert('المتصفح لا يدعم مشاركة الشاشة. يرجى استخدام Chrome أو Firefox أو Edge.');
  return;
}
```

---

### المشكلة: لا يوجد صوت في مشاركة التبويب

**السبب:** التبويب لا يحتوي على صوت أو المستخدم لم يسمح بمشاركة الصوت.

**الحل:**
```javascript
const stream = await service.startTabShare();
const audioTracks = stream.getAudioTracks();

if (audioTracks.length === 0) {
  console.warn('No audio tracks in tab share');
  // عرض رسالة للمستخدم
}
```

---

### المشكلة: جودة منخفضة

**السبب:** قيود الشبكة أو إعدادات الجودة.

**الحل:**
```javascript
// طلب جودة أعلى
const stream = await service.startScreenShare({
  displaySurface: 'browser',
  width: 1920,
  height: 1080,
  frameRate: 60
});

// التحقق من الجودة الفعلية
const quality = service.getQuality();
console.log('Actual quality:', quality);
```

---

### المشكلة: المشاركة تتوقف تلقائياً

**السبب:** المستخدم أغلق التبويب أو نقر على "إيقاف المشاركة" في المتصفح.

**الحل:**
```javascript
// الاستماع لحدث انتهاء المشاركة
window.addEventListener('screenshare-ended', () => {
  console.log('Share ended by user');
  // تحديث UI
  setIsSharing(false);
});
```

---

## 📊 دعم المتصفحات

| المتصفح | الإصدار | الدعم | ملاحظات |
|---------|---------|--------|---------|
| Chrome | 72+ | ✅ كامل | دعم ممتاز |
| Firefox | 66+ | ✅ كامل | دعم ممتاز |
| Edge | 79+ | ✅ كامل | دعم ممتاز |
| Safari | 13+ | ⚠️ جزئي | iOS 13+ فقط |
| Opera | 60+ | ✅ كامل | دعم جيد |

---

## 🔒 الأمان والخصوصية

### 1. إذن المستخدم إلزامي
- ✅ المتصفح يطلب إذن المستخدم دائماً
- ✅ المستخدم يختار التبويب المراد مشاركته
- ✅ لا يمكن مشاركة تبويب بدون إذن

### 2. مؤشر المشاركة
- ✅ المتصفح يعرض مؤشر "يشارك الشاشة"
- ✅ المستخدم يمكنه إيقاف المشاركة في أي وقت
- ✅ التطبيق يعرض مؤشر المشاركة النشطة

### 3. HTTPS إلزامي
- ✅ مشاركة الشاشة تعمل فقط على HTTPS
- ✅ localhost مسموح للتطوير
- ✅ حماية من الهجمات

### 4. عزل التبويبات
- ✅ مشاركة تبويب واحد فقط
- ✅ التبويبات الأخرى محمية
- ✅ خصوصية أفضل

---

## 📈 الأداء

### استهلاك الموارد

| المقياس | القيمة | ملاحظات |
|---------|--------|---------|
| CPU | 5-15% | يعتمد على محتوى التبويب |
| RAM | 50-100 MB | لكل stream |
| Network | 1-3 Mbps | 1080p @ 30fps |
| Battery | متوسط | أقل من مشاركة الشاشة الكاملة |

### نصائح التحسين

1. **استخدم جودة مناسبة**
```javascript
// للاتصالات البطيئة
const stream = await service.startScreenShare({
  displaySurface: 'browser',
  width: 1280,
  height: 720,
  frameRate: 15
});
```

2. **أوقف المشاركة عند عدم الحاجة**
```javascript
// إيقاف المشاركة فوراً
service.stopScreenShare();
```

3. **راقب جودة الاتصال**
```javascript
const quality = service.getQuality();
if (quality.frameRate < 15) {
  console.warn('Low frame rate detected');
  // تقليل الجودة
}
```

---

## ✅ الاختبارات

### تشغيل الاختبارات

```bash
cd frontend
npm test -- screenShareTab.test.js
```

### الاختبارات المتاحة

1. ✅ Tab Share Functionality (4 tests)
2. ✅ Tab Share Quality (3 tests)
3. ✅ Tab Share Audio (2 tests)
4. ✅ Tab Share Lifecycle (3 tests)
5. ✅ Tab Share vs Other Types (2 tests)
6. ✅ Tab Share Switching (3 tests)
7. ✅ Error Handling (3 tests)
8. ✅ Browser Support (2 tests)
9. ✅ Tab Share State Management (2 tests)
10. ✅ Tab Share with Custom Options (3 tests)

**المجموع**: 27 اختبار

---

## 📝 ملاحظات مهمة

1. ✅ مشاركة التبويب تعمل فقط على HTTPS
2. ✅ يتطلب إذن المستخدم
3. ✅ مشاركة واحدة فقط في كل غرفة
4. ✅ يمكن مشاركة صوت التبويب
5. ✅ جودة عالية (1080p) افتراضياً
6. ✅ دعم Chrome, Firefox, Edge, Safari (iOS 13+)
7. ✅ المستخدم يمكنه إيقاف المشاركة في أي وقت
8. ✅ التطبيق يجب أن يتعامل مع انتهاء المشاركة

---

## 🔗 روابط مفيدة

- [MDN: getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- [WebRTC Screen Sharing](https://webrtc.org/getting-started/screen-sharing)
- [Browser Compatibility](https://caniuse.com/mdn-api_mediadevices_getdisplaymedia)
- [Screen Capture API](https://w3c.github.io/mediacapture-screen-share/)

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل
