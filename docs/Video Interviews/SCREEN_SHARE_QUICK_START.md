# Screen Share Quick Start - دليل البدء السريع

## 🚀 البدء في 5 دقائق

### 1. التحقق من الدعم (30 ثانية)

```javascript
import ScreenShareService from './services/ScreenShareService';

// تحقق من دعم المتصفح
if (ScreenShareService.isSupported()) {
  console.log('✅ Screen sharing is supported!');
} else {
  console.log('❌ Screen sharing is NOT supported');
}
```

### 2. إنشاء الخدمة (10 ثوانٍ)

```javascript
const screenShareService = new ScreenShareService();
```

### 3. بدء المشاركة (دقيقة)

```javascript
// مشاركة بسيطة
try {
  const stream = await screenShareService.startScreenShare();
  console.log('✅ Screen sharing started!');
  console.log('Settings:', screenShareService.getScreenShareSettings());
} catch (error) {
  console.error('❌ Failed:', error.message);
}
```

### 4. عرض الشاشة المشاركة (دقيقة)

```jsx
import ScreenShareDisplay from './components/VideoCall/ScreenShareDisplay';

<ScreenShareDisplay
  screenStream={screenShareService.getScreenStream()}
  isSharing={screenShareService.isScreenSharing()}
  language="ar"
/>
```

### 5. إضافة أزرار التحكم (دقيقة)

```jsx
import ScreenShareControls from './components/VideoCall/ScreenShareControls';

<ScreenShareControls
  isSharing={screenShareService.isScreenSharing()}
  onStartSharing={(opts) => screenShareService.startScreenShare(opts)}
  onStopSharing={() => screenShareService.stopScreenShare()}
  language="ar"
/>
```

### 6. التكامل مع WebRTC (دقيقتان)

```javascript
// بعد بدء المشاركة
const videoTrack = screenStream.getVideoTracks()[0];

// استبدال مسار الكاميرا بمسار الشاشة
await screenShareService.replaceTrackInPeerConnection(
  peerConnection,
  videoTrack
);

// للعودة للكاميرا
screenShareService.stopScreenShare();
const cameraTrack = localStream.getVideoTracks()[0];
await sender.replaceTrack(cameraTrack);
```

---

## 🎯 أمثلة سريعة

### مشاركة الشاشة الكاملة

```javascript
await screenShareService.startScreenShare({
  preferredSource: 'screen'
});
```

### مشاركة نافذة محددة

```javascript
await screenShareService.startScreenShare({
  preferredSource: 'window'
});
```

### مشاركة تبويب المتصفح

```javascript
await screenShareService.startScreenShare({
  preferredSource: 'tab'
});
```

### مشاركة مع صوت النظام

```javascript
await screenShareService.startScreenShare({
  audio: true
});
```

### تبديل المصدر

```javascript
// من شاشة إلى نافذة
await screenShareService.switchSource({
  preferredSource: 'window'
});
```

---

## 📊 الحصول على المعلومات

```javascript
// حالة المشاركة
const isSharing = screenShareService.isScreenSharing();

// نوع المصدر
const source = screenShareService.getCurrentSource(); // 'screen', 'window', 'tab'

// إعدادات الجودة
const settings = screenShareService.getScreenShareSettings();
console.log(`Quality: ${settings.quality}`); // 'Full HD', '4K', etc.
console.log(`Resolution: ${settings.width}x${settings.height}`);
console.log(`FPS: ${settings.frameRate}`);
console.log(`Is HD: ${settings.isHD}`);
```

---

## 🎨 مثال كامل (React)

```jsx
import React, { useState } from 'react';
import ScreenShareService from './services/ScreenShareService';
import ScreenShareControls from './components/VideoCall/ScreenShareControls';
import ScreenShareDisplay from './components/VideoCall/ScreenShareDisplay';

function MyComponent() {
  const [service] = useState(() => new ScreenShareService());
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState(null);

  const handleStart = async (options) => {
    try {
      const newStream = await service.startScreenShare(options);
      setStream(newStream);
      setIsSharing(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleStop = () => {
    service.stopScreenShare();
    setStream(null);
    setIsSharing(false);
  };

  return (
    <div>
      <ScreenShareControls
        isSharing={isSharing}
        onStartSharing={handleStart}
        onStopSharing={handleStop}
        currentSource={service.getCurrentSource()}
        screenShareSettings={service.getScreenShareSettings()}
        language="ar"
      />
      
      {isSharing && (
        <ScreenShareDisplay
          screenStream={stream}
          isSharing={isSharing}
          currentSource={service.getCurrentSource()}
          screenShareSettings={service.getScreenShareSettings()}
          language="ar"
        />
      )}
    </div>
  );
}
```

---

## ⚠️ معالجة الأخطاء

```javascript
try {
  await screenShareService.startScreenShare();
} catch (error) {
  if (error.message.includes('permission denied')) {
    alert('تم رفض إذن مشاركة الشاشة');
  } else if (error.message.includes('not available')) {
    alert('لا يوجد مصدر لمشاركة الشاشة');
  } else if (error.message.includes('not supported')) {
    alert('مشاركة الشاشة غير مدعومة في هذا المتصفح');
  } else if (error.message.includes('cancelled')) {
    alert('تم إلغاء مشاركة الشاشة');
  } else {
    alert('حدث خطأ: ' + error.message);
  }
}
```

---

## 🧪 اختبار سريع

```bash
# تشغيل الاختبارات
cd frontend
npm test -- ScreenShareService.test.js

# تشغيل المثال
npm start
# ثم افتح: http://localhost:3000/examples/screen-share
```

---

## 📱 التوافق

| المتصفح | الدعم |
|---------|-------|
| Chrome | ✅ |
| Firefox | ✅ |
| Edge | ✅ |
| Safari | ⚠️ (macOS 13+) |
| Opera | ✅ |

---

## 🔗 روابط مفيدة

- 📄 [التوثيق الكامل](./SCREEN_SHARE_IMPLEMENTATION.md)
- 📄 [مثال كامل](../../frontend/src/examples/ScreenShareExample.jsx)
- 📄 [الاختبارات](../../frontend/src/services/__tests__/ScreenShareService.test.js)

---

## 💡 نصائح سريعة

1. ✅ **دائماً تحقق من الدعم** قبل استخدام الخدمة
2. ✅ **استخدم try-catch** لمعالجة الأخطاء
3. ✅ **اعرض مؤشر واضح** عند المشاركة
4. ✅ **وفر زر إيقاف سهل** الوصول
5. ✅ **نظف الموارد** عند الانتهاء

---

## 🆘 مشاكل شائعة

### لا يعمل في Safari؟
- تحقق من إصدار macOS (يجب أن يكون 13+)
- جرب Chrome أو Firefox

### الجودة منخفضة؟
- تحقق من دقة الشاشة (يجب أن تكون 1080p+)
- أغلق التطبيقات الأخرى

### يتوقف تلقائياً؟
- تحقق من استقرار الاتصال
- راقب console للأخطاء

---

**جاهز للبدء؟** 🚀

```javascript
const service = new ScreenShareService();
await service.startScreenShare();
console.log('🎉 You are now sharing your screen!');
```

---

**تاريخ الإنشاء**: 2026-03-02  
**الإصدار**: 1.0.0
