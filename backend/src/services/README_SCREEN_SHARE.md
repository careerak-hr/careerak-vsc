# Screen Share Service - دليل المطورين

## 🚀 البدء السريع

### Backend
```javascript
const ScreenShareService = require('./services/screenShareService');
const screenShareService = new ScreenShareService();

// التحقق من وجود مشاركة نشطة
const isActive = screenShareService.isScreenShareActive(roomId);

// الحصول على معلومات المشاركة
const info = screenShareService.getActiveScreenShare(roomId);

// إيقاف المشاركة
screenShareService.stopScreenShare(roomId, userId);
```

### Frontend
```javascript
import ScreenShareService from './services/screenShareService';
const service = new ScreenShareService();

// بدء المشاركة
const result = await service.startScreenShare({ quality: 'high' });

// إيقاف المشاركة
service.stopScreenShare();
```

---

## 📚 API Reference

### Backend Service

#### `isScreenShareActive(roomId)`
التحقق من وجود مشاركة نشطة في الغرفة.

**Parameters:**
- `roomId` (string) - معرف الغرفة

**Returns:** `boolean`

**Example:**
```javascript
if (screenShareService.isScreenShareActive('room-123')) {
  console.log('Screen share is active');
}
```

---

#### `getActiveScreenShare(roomId)`
الحصول على معلومات المشاركة النشطة.

**Parameters:**
- `roomId` (string) - معرف الغرفة

**Returns:** `Object|null`
```javascript
{
  userId: string,
  shareType: 'screen' | 'window' | 'tab',
  startedAt: Date,
  duration: number,
  settings: {
    width: number,
    height: number,
    frameRate: number
  }
}
```

**Example:**
```javascript
const info = screenShareService.getActiveScreenShare('room-123');
console.log('Duration:', info.duration);
```

---

#### `stopScreenShare(roomId, userId)`
إيقاف مشاركة الشاشة.

**Parameters:**
- `roomId` (string) - معرف الغرفة
- `userId` (string) - معرف المستخدم

**Returns:** `boolean`

**Throws:** `Error` إذا لم يكن المستخدم هو من بدأ المشاركة

**Example:**
```javascript
try {
  const stopped = screenShareService.stopScreenShare('room-123', 'user-456');
  console.log('Stopped:', stopped);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

#### `getScreenShareStats(roomId)`
الحصول على إحصائيات المشاركة.

**Parameters:**
- `roomId` (string) - معرف الغرفة

**Returns:** `Object|null`
```javascript
{
  userId: string,
  shareType: string,
  duration: number,
  quality: {
    width: number,
    height: number,
    frameRate: number,
    resolution: string
  },
  startedAt: Date
}
```

**Example:**
```javascript
const stats = screenShareService.getScreenShareStats('room-123');
console.log('Quality:', stats.quality.resolution);
```

---

### Frontend Service

#### `startScreenShare(options)`
بدء مشاركة الشاشة.

**Parameters:**
- `options` (Object) - خيارات المشاركة
  - `quality` ('high' | 'medium' | 'low') - مستوى الجودة
  - `preferWindow` (boolean) - تفضيل نافذة محددة
  - `preferCurrentTab` (boolean) - تفضيل التبويب الحالي
  - `includeAudio` (boolean) - تضمين الصوت

**Returns:** `Promise<Object>`
```javascript
{
  stream: MediaStream,
  shareType: 'screen' | 'window' | 'tab',
  settings: {
    width: number,
    height: number,
    frameRate: number
  }
}
```

**Throws:** `Error` مع رسالة مترجمة

**Example:**
```javascript
try {
  const result = await service.startScreenShare({
    quality: 'high',
    preferWindow: false
  });
  console.log('Sharing:', result.shareType);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

#### `stopScreenShare()`
إيقاف مشاركة الشاشة.

**Returns:** `boolean`

**Example:**
```javascript
const stopped = service.stopScreenShare();
console.log('Stopped:', stopped);
```

---

#### `isScreenShareActive()`
التحقق من وجود مشاركة نشطة.

**Returns:** `boolean`

**Example:**
```javascript
if (service.isScreenShareActive()) {
  console.log('Screen share is active');
}
```

---

#### `getCurrentScreenShare()`
الحصول على معلومات المشاركة الحالية.

**Returns:** `Object|null`

**Example:**
```javascript
const info = service.getCurrentScreenShare();
console.log('Duration:', info.duration);
```

---

#### `static isSupported()`
التحقق من دعم مشاركة الشاشة.

**Returns:** `boolean`

**Example:**
```javascript
if (ScreenShareService.isSupported()) {
  console.log('Screen sharing is supported');
}
```

---

## 🎯 أمثلة الاستخدام

### مثال 1: مشاركة الشاشة الكاملة
```javascript
const result = await service.startScreenShare({
  quality: 'high' // 1920x1080 @ 60fps
});

// إضافة stream إلى peer connection
peerConnection.addStream(result.stream);
```

### مثال 2: مشاركة نافذة محددة
```javascript
const result = await service.startScreenShare({
  preferWindow: true,
  quality: 'medium' // 1280x720 @ 30fps
});
```

### مثال 3: مشاركة تبويب المتصفح
```javascript
const result = await service.startScreenShare({
  preferCurrentTab: true,
  quality: 'low' // 854x480 @ 15fps
});
```

### مثال 4: معالجة الأخطاء
```javascript
try {
  await service.startScreenShare();
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('يرجى السماح بمشاركة الشاشة');
  } else if (error.name === 'NotSupportedError') {
    alert('المتصفح لا يدعم مشاركة الشاشة');
  }
}
```

### مثال 5: الاستماع لإنهاء المشاركة
```javascript
window.addEventListener('screenshare-ended', () => {
  console.log('Screen share ended by user');
  // تحديث UI
});
```

---

## 🔧 التكامل مع WebRTC

### إضافة stream إلى peer connection
```javascript
const { stream } = await screenShareService.startScreenShare();

stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});
```

### إزالة stream من peer connection
```javascript
const senders = peerConnection.getSenders();
senders.forEach(sender => {
  if (sender.track && sender.track.kind === 'video') {
    peerConnection.removeTrack(sender);
  }
});
```

### إنشاء offer جديد
```javascript
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
signalingService.sendOffer(roomId, offer);
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Not supported"
```javascript
if (!ScreenShareService.isSupported()) {
  // عرض رسالة للمستخدم
  alert('المتصفح لا يدعم مشاركة الشاشة');
}
```

### المشكلة: "Permission denied"
```javascript
try {
  await service.startScreenShare();
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // المستخدم رفض الإذن
    alert('يرجى السماح بمشاركة الشاشة');
  }
}
```

### المشكلة: "Already sharing"
```javascript
if (!service.isScreenShareActive()) {
  await service.startScreenShare();
} else {
  alert('مشاركة الشاشة نشطة بالفعل');
}
```

---

## 📊 مستويات الجودة

| المستوى | الدقة | معدل الإطارات | الاستخدام |
|---------|-------|---------------|-----------|
| high | 1920x1080 | 60 fps | عروض تقديمية، تصميم |
| medium | 1280x720 | 30 fps | مقابلات عامة |
| low | 854x480 | 15 fps | اتصالات بطيئة |

---

## 🔒 القواعد والقيود

1. ✅ مشاركة واحدة فقط في كل غرفة
2. ✅ فقط من بدأ المشاركة يمكنه إيقافها
3. ✅ إذن المستخدم إلزامي
4. ✅ يعمل فقط على HTTPS
5. ✅ دعم محدود في Safari (iOS 13+)

---

## 📝 ملاحظات مهمة

- مشاركة الشاشة تعمل فقط على HTTPS
- يتطلب إذن المستخدم
- دعم محدود في Safari (iOS 13+)
- جودة عالية (1080p) افتراضياً
- مشاركة واحدة فقط في كل غرفة

---

## 🔗 روابط مفيدة

- [MDN: getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- [WebRTC Screen Sharing](https://webrtc.org/getting-started/screen-sharing)
- [Browser Compatibility](https://caniuse.com/mdn-api_mediadevices_getdisplaymedia)

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01
