# إشعار التسجيل - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. الاستيراد (30 ثانية)
```jsx
import VideoCall from './components/VideoCall/VideoCall';
```

### 2. إضافة State (1 دقيقة)
```jsx
const [isRecording, setIsRecording] = useState(false);
const [recordingDuration, setRecordingDuration] = useState(0);

// Timer للمدة
useEffect(() => {
  let interval;
  if (isRecording) {
    interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  } else {
    setRecordingDuration(0);
  }
  return () => clearInterval(interval);
}, [isRecording]);
```

### 3. استخدام المكون (1 دقيقة)
```jsx
<VideoCall
  localStream={localStream}
  remoteStream={remoteStream}
  isRecording={isRecording}
  recordingDuration={recordingDuration}
  language="ar"
  recordingNotificationPosition="top"
  // ... other props
/>
```

### 4. التحكم في التسجيل (1 دقيقة)
```jsx
const handleToggleRecording = () => {
  setIsRecording(!isRecording);
};

<button onClick={handleToggleRecording}>
  {isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل'}
</button>
```

---

## 🎯 الخيارات الأساسية

### اللغة
```jsx
language="ar"  // العربية (افتراضي)
language="en"  // الإنجليزية
language="fr"  // الفرنسية
```

### الموضع
```jsx
recordingNotificationPosition="top"      // أعلى (افتراضي)
recordingNotificationPosition="bottom"   // أسفل
recordingNotificationPosition="floating" // عائم (مع تفاصيل إضافية)
```

---

## 📱 مثال كامل

```jsx
import React, { useState, useEffect } from 'react';
import VideoCall from './components/VideoCall/VideoCall';

function InterviewPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div>
      <VideoCall
        localStream={localStream}
        remoteStream={remoteStream}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        language="ar"
        recordingNotificationPosition="top"
      />
      
      <button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? '⏹️ إيقاف' : '🔴 تسجيل'}
      </button>
    </div>
  );
}
```

---

## ✅ التحقق

### 1. الإشعار يظهر؟
- ✅ نعم → ممتاز!
- ❌ لا → تحقق من `isRecording={true}`

### 2. المدة تعمل؟
- ✅ نعم → ممتاز!
- ❌ لا → تحقق من `useEffect` timer

### 3. اللغة صحيحة؟
- ✅ نعم → ممتاز!
- ❌ لا → تحقق من `language` prop

---

## 🎨 التخصيص السريع

### تغيير الألوان
```css
/* في RecordingNotification.css */
.recording-notification {
  background: linear-gradient(135deg, 
    rgba(YOUR_COLOR, 0.95) 0%, 
    rgba(YOUR_COLOR_DARK, 0.95) 100%);
}
```

### تغيير الموضع
```jsx
// تلقائي حسب حجم الشاشة
const [position, setPosition] = useState('top');

useEffect(() => {
  const handleResize = () => {
    setPosition(window.innerWidth < 640 ? 'top' : 'floating');
  };
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 🐛 استكشاف الأخطاء

### الإشعار لا يظهر
```jsx
// تحقق من:
console.log('isRecording:', isRecording); // يجب أن يكون true
```

### المدة لا تتحرك
```jsx
// تحقق من:
console.log('recordingDuration:', recordingDuration); // يجب أن يزيد
```

### اللغة خاطئة
```jsx
// تحقق من:
console.log('language:', language); // يجب أن يكون 'ar', 'en', أو 'fr'
```

---

## 📚 المزيد من المعلومات

- 📄 [التوثيق الشامل](./RECORDING_NOTIFICATION_IMPLEMENTATION.md)
- 💡 [مثال تفاعلي](../../frontend/src/examples/RecordingNotificationExample.jsx)
- 🎨 [ملف الأنماط](../../frontend/src/components/VideoCall/RecordingNotification.css)

---

## 💡 نصائح سريعة

1. **استخدم الوضع العائم** للإشعارات الطويلة
2. **استخدم الوضع العلوي** للإشعارات القصيرة
3. **غيّر الموضع تلقائياً** حسب حجم الشاشة
4. **اختبر على أجهزة مختلفة** قبل النشر

---

**الوقت الإجمالي**: 5 دقائق ⚡  
**الصعوبة**: سهل 🟢  
**الحالة**: ✅ جاهز للاستخدام
