# نظام الفيديو للمقابلات - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. التثبيت
```bash
cd frontend
npm install
```

**المكتبات المطلوبة** (مثبتة مسبقاً):
- React
- WebRTC (مدمج في المتصفح)

---

### 2. الاستخدام الأساسي

```jsx
import React, { useEffect, useState } from 'react';
import VideoCall from './components/VideoCall/VideoCall';
import WebRTCService from './services/webrtcService';

function MyVideoInterview() {
  const [webrtcService] = useState(() => new WebRTCService());
  const [localStream, setLocalStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  useEffect(() => {
    // الحصول على الكاميرا والميكروفون
    webrtcService.getUserMedia()
      .then(stream => setLocalStream(stream))
      .catch(error => console.error('Error:', error));

    // تنظيف عند الخروج
    return () => webrtcService.cleanup();
  }, []);

  return (
    <VideoCall
      localStream={localStream}
      remoteStream={null}
      onToggleAudio={() => {
        const newState = !isAudioEnabled;
        webrtcService.toggleAudio(newState);
        setIsAudioEnabled(newState);
      }}
      onToggleVideo={() => {
        const newState = !isVideoEnabled;
        webrtcService.toggleVideo(newState);
        setIsVideoEnabled(newState);
      }}
      isAudioEnabled={isAudioEnabled}
      isVideoEnabled={isVideoEnabled}
      connectionQuality="good"
    />
  );
}

export default MyVideoInterview;
```

---

### 3. تشغيل المثال

```bash
# في مجلد frontend
npm start

# افتح المتصفح على
http://localhost:3000
```

---

## 📋 الميزات المتاحة

### ✅ جودة HD (720p+)
- الحد الأدنى: 1280x720
- المثالي: 1280x720
- الحد الأقصى: 1920x1080

### ✅ صوت عالي الجودة
- إلغاء الصدى (Echo Cancellation)
- تقليل الضوضاء (Noise Suppression)
- التحكم التلقائي في مستوى الصوت (Auto Gain Control)
- معدل عينة 48kHz

### ✅ مؤشر جودة الاتصال
- 🟢 ممتاز (< 2% فقدان)
- 🟡 جيد (2-5% فقدان)
- 🔴 ضعيف (> 5% فقدان)

### ✅ أزرار التحكم
- 🎤 كتم/تفعيل الصوت
- 📹 إيقاف/تفعيل الفيديو

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test -- videoQuality.test.js

# النتيجة المتوقعة
✓ 20/20 tests passed
```

---

## 📱 دعم المتصفحات

| المتصفح | الدعم | الملاحظات |
|---------|-------|-----------|
| Chrome | ✅ كامل | موصى به |
| Firefox | ✅ كامل | موصى به |
| Safari | ✅ كامل | iOS 11+ |
| Edge | ✅ كامل | Chromium-based |

---

## ⚠️ الأخطاء الشائعة

### 1. "Permission denied"
**الحل**: اسمح بالوصول للكاميرا والميكروفون في إعدادات المتصفح

### 2. "Device not found"
**الحل**: تأكد من توصيل الكاميرا والميكروفون

### 3. "Device in use"
**الحل**: أغلق التطبيقات الأخرى المستخدمة للكاميرا

### 4. "Overconstrained error"
**الحل**: الكاميرا لا تدعم HD، سيتم التراجع تلقائياً إلى SD

---

## 📚 المزيد من المعلومات

- 📄 [التوثيق الكامل](./VIDEO_INTERVIEWS_HD_QUALITY.md)
- 📄 [ملف المتطلبات](../.kiro/specs/video-interviews/requirements.md)
- 📄 [ملف التصميم](../.kiro/specs/video-interviews/design.md)
- 📄 [خطة التنفيذ](../.kiro/specs/video-interviews/tasks.md)

---

## 🎯 الخطوات التالية

1. ✅ **المهمة 3.1**: إنشاء VideoCall Component (مكتمل)
2. ⏭️ **المهمة 3.2**: إضافة اختبار الأجهزة
3. ⏭️ **المهمة 5**: تنفيذ مشاركة الشاشة
4. ⏭️ **المهمة 7**: تنفيذ تسجيل المقابلات

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام
