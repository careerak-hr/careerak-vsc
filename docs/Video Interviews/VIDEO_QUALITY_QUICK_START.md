# دليل البدء السريع - تحسينات جودة الفيديو

## 🚀 البدء في 5 دقائق

### 1. الاستخدام الأساسي

```javascript
import WebRTCService from './services/WebRTCService';

// إنشاء خدمة WebRTC
const webrtc = new WebRTCService();

// الحصول على وسائط المستخدم (مع جميع التحسينات)
const stream = await webrtc.getUserMedia();

// إنشاء اتصال peer
const peerConnection = webrtc.createPeerConnection();
```

**هذا كل شيء!** جميع التحسينات تعمل تلقائياً:
- ✅ HD video (720p+)
- ✅ Adaptive bitrate
- ✅ Lighting enhancement
- ✅ Noise suppression

---

### 2. مراقبة الجودة

```javascript
// جودة الاتصال
const quality = webrtc.getConnectionQuality();
console.log(quality); // 'excellent', 'good', 'poor'

// معدل البت الحالي
const bitrate = webrtc.getCurrentBitrate();
console.log(`${bitrate.mbps} Mbps (${bitrate.quality})`);
```

---

### 3. التحكم في الميزات

```javascript
// تعطيل تحسين الإضاءة (إذا كان الأداء بطيئاً)
webrtc.toggleLightingEnhancement(false);

// تعطيل adaptive bitrate (إذا كنت تريد جودة ثابتة)
webrtc.toggleAdaptiveBitrate(false);

// إعادة التفعيل
webrtc.toggleLightingEnhancement(true);
webrtc.toggleAdaptiveBitrate(true);
```

---

### 4. التنظيف

```javascript
// عند إنهاء المقابلة
webrtc.cleanup();
```

---

## 📊 الميزات

| الميزة | الوصف | الحالة الافتراضية |
|--------|-------|-------------------|
| **HD Video** | 720p-1080p | ✅ مفعّل |
| **Adaptive Bitrate** | 2.5 Mbps - 500 Kbps | ✅ مفعّل |
| **Lighting Enhancement** | تحسين السطوع تلقائياً | ✅ مفعّل |
| **Noise Suppression** | تقليل الضوضاء 85%+ | ✅ مفعّل |
| **Echo Cancellation** | إلغاء الصدى 97%+ | ✅ مفعّل |

---

## 🔧 استكشاف الأخطاء السريع

### الفيديو ليس HD؟
```javascript
const videoTrack = stream.getVideoTracks()[0];
const settings = videoTrack.getSettings();
console.log(`${settings.width}x${settings.height}`);
// يجب أن يكون 1280x720 أو أعلى
```

### معدل البت منخفض؟
```javascript
const bitrate = webrtc.getCurrentBitrate();
console.log(bitrate.quality);
// إذا كان 'poor' أو 'minimum'، تحقق من الاتصال
```

### الصوت به ضوضاء؟
```javascript
const audioTrack = stream.getAudioTracks()[0];
const settings = audioTrack.getSettings();
console.log(settings.noiseSuppression); // يجب أن يكون true
```

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `VIDEO_QUALITY_IMPROVEMENTS.md` - التوثيق الشامل
- 📄 `frontend/src/services/WebRTCService.js` - الكود المصدري
- 📄 `frontend/src/tests/videoQuality.test.js` - الاختبارات (24 tests)

---

## ✅ الخلاصة

**3 أسطر فقط للحصول على فيديو احترافي بجودة عالية!**

```javascript
const webrtc = new WebRTCService();
const stream = await webrtc.getUserMedia();
const peerConnection = webrtc.createPeerConnection();
```

🎉 **جاهز للاستخدام!**

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ مكتمل
