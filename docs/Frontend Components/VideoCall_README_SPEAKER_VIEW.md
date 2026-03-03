# Speaker View - عرض المتحدث الحالي

## 📋 نظرة عامة

مكون **SpeakerView** يوفر واجهة احترافية لعرض المتحدث النشط في المقابلات الجماعية، مع دعم حتى 10 مشاركين.

## ✨ الميزات الرئيسية

### 1. كشف تلقائي للمتحدث النشط
- يكتشف المتحدث بناءً على مستوى الصوت تلقائياً
- يعرض المتحدث النشط بشكل كبير في المنتصف
- مؤشرات بصرية للمتحدث (إطار أخضر + أيقونة 🔊)

### 2. تثبيت المتحدث (Pin Speaker)
- إمكانية تثبيت متحدث معين
- عند التثبيت، يبقى المتحدث في المنتصف حتى إلغاء التثبيت
- مؤشر تثبيت واضح (📌)

### 3. شريط جانبي للمشاركين
- عرض جميع المشاركين في صور مصغرة
- مؤشرات مستوى الصوت لكل مشارك
- إمكانية النقر على أي مشارك لتثبيته

### 4. مؤشرات الأداء
- مؤشر جودة الاتصال (ممتاز، جيد، ضعيف)
- مؤشر التسجيل مع الوقت
- مؤقت المقابلة
- عداد المشاركين

### 5. تحليل الصوت في الوقت الفعلي
- استخدام Web Audio API لتحليل مستوى الصوت
- عرض مستوى الصوت لكل مشارك
- كشف تلقائي للكلام (threshold: 30)

## 📦 التثبيت

```bash
# المكونات موجودة بالفعل في:
frontend/src/components/VideoCall/
├── SpeakerView.jsx
├── SpeakerView.css
├── SpeakerViewExample.jsx
└── README_SPEAKER_VIEW.md
```

## 🚀 الاستخدام

### مثال أساسي

```jsx
import SpeakerView from './components/VideoCall/SpeakerView';

function GroupInterview() {
  const [participants, setParticipants] = useState([
    {
      id: 'participant-1',
      name: 'أحمد محمد',
      stream: mediaStream1,
      isSpeaking: false,
      audioLevel: 0
    },
    {
      id: 'participant-2',
      name: 'فاطمة علي',
      stream: mediaStream2,
      isSpeaking: true,
      audioLevel: 75
    }
  ]);

  return (
    <SpeakerView
      participants={participants}
      localStream={localStream}
      localParticipant={{ id: 'local', name: 'أنت' }}
      onToggleAudio={handleToggleAudio}
      onToggleVideo={handleToggleVideo}
      isAudioEnabled={true}
      isVideoEnabled={true}
      connectionQuality="good"
      language="ar"
    />
  );
}
```

### مع التسجيل والمؤقت

```jsx
<SpeakerView
  participants={participants}
  localStream={localStream}
  localParticipant={{ id: 'local', name: 'أنت' }}
  onToggleAudio={handleToggleAudio}
  onToggleVideo={handleToggleVideo}
  isAudioEnabled={true}
  isVideoEnabled={true}
  connectionQuality="excellent"
  language="ar"
  // Recording
  isRecording={true}
  recordingDuration={125} // 2:05
  // Timer
  interviewStartTime={Date.now() - 300000} // بدأت قبل 5 دقائق
  showInterviewTimer={true}
/>
```

## 📊 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `participants` | Array | `[]` | قائمة المشاركين |
| `localStream` | MediaStream | - | Stream المستخدم المحلي |
| `localParticipant` | Object | `{ id: 'local', name: 'أنت' }` | معلومات المستخدم المحلي |
| `onToggleAudio` | Function | - | دالة تبديل الصوت |
| `onToggleVideo` | Function | - | دالة تبديل الفيديو |
| `isAudioEnabled` | Boolean | `true` | حالة الصوت |
| `isVideoEnabled` | Boolean | `true` | حالة الفيديو |
| `connectionQuality` | String | `'good'` | جودة الاتصال: 'excellent', 'good', 'poor' |
| `language` | String | `'ar'` | اللغة: 'ar', 'en', 'fr' |
| `isRecording` | Boolean | `false` | حالة التسجيل |
| `recordingDuration` | Number | `0` | مدة التسجيل بالثواني |
| `interviewStartTime` | Number | `null` | وقت بدء المقابلة (timestamp) |
| `showInterviewTimer` | Boolean | `true` | عرض مؤقت المقابلة |

### Participant Object Structure

```javascript
{
  id: 'unique-id',           // معرف فريد
  name: 'اسم المشارك',       // اسم المشارك
  stream: MediaStream,       // MediaStream للفيديو والصوت
  isSpeaking: false,         // هل يتحدث الآن؟
  audioLevel: 0              // مستوى الصوت (0-100)
}
```

## 🎨 التخصيص

### تغيير الألوان

```css
/* في SpeakerView.css */

/* لون إطار المتحدث النشط */
.participant-video.speaking {
  border-color: #4CAF50; /* أخضر */
}

/* لون إطار المشارك المثبت */
.participant-thumbnail.active {
  border-color: #D48161; /* نحاسي */
}

/* لون أزرار التحكم */
.control-btn {
  background: #304B60; /* كحلي */
}

.control-btn:hover {
  background: #D48161; /* نحاسي */
}
```

### تغيير موقع العناصر

```jsx
// تغيير موقع مؤشر التسجيل
<SpeakerView
  recordingNotificationPosition="bottom" // 'top', 'bottom', 'floating'
  // ...
/>

// تغيير موقع المؤقت
<SpeakerView
  timerPosition="top-left" // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  // ...
/>
```

## 🔧 التكامل مع WebRTC

### إعداد Participants من WebRTC

```javascript
import { useEffect, useState } from 'react';

function useWebRTCParticipants(peerConnections) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const participantsList = Object.entries(peerConnections).map(([id, pc]) => {
      const remoteStream = pc.getRemoteStreams()[0];
      
      return {
        id,
        name: pc.remoteUserName || 'مشارك',
        stream: remoteStream,
        isSpeaking: false,
        audioLevel: 0
      };
    });

    setParticipants(participantsList);
  }, [peerConnections]);

  return participants;
}

// الاستخدام
function GroupInterview() {
  const { peerConnections } = useWebRTC();
  const participants = useWebRTCParticipants(peerConnections);

  return (
    <SpeakerView
      participants={participants}
      // ...
    />
  );
}
```

### كشف المتحدث النشط

```javascript
import { useEffect } from 'react';

function useSpeakerDetection(participants, setParticipants) {
  useEffect(() => {
    const audioContexts = new Map();
    const analysers = new Map();

    participants.forEach(participant => {
      if (!participant.stream) return;

      const audioContext = new AudioContext();
      const audioTrack = participant.stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const source = audioContext.createMediaStreamSource(
        new MediaStream([audioTrack])
      );
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      audioContexts.set(participant.id, audioContext);
      analysers.set(participant.id, analyser);
    });

    const interval = setInterval(() => {
      const dataArray = new Uint8Array(256);
      
      setParticipants(prev => prev.map(p => {
        const analyser = analysers.get(p.id);
        if (!analyser) return p;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        return {
          ...p,
          audioLevel: average,
          isSpeaking: average > 30
        };
      }));
    }, 100);

    return () => {
      clearInterval(interval);
      audioContexts.forEach(ctx => ctx.close());
    };
  }, [participants, setParticipants]);
}
```

## 📱 التصميم المتجاوب

المكون متجاوب بالكامل ويدعم:

- **Desktop** (> 768px): شريط جانبي بعرض 200px
- **Tablet** (480-768px): شريط جانبي بعرض 120px
- **Mobile** (< 480px): شريط جانبي بعرض 80px

### تخصيص Breakpoints

```css
/* في SpeakerView.css */

@media (max-width: 1024px) {
  /* تخصيص للأجهزة اللوحية الكبيرة */
}

@media (max-width: 768px) {
  /* تخصيص للأجهزة اللوحية */
}

@media (max-width: 480px) {
  /* تخصيص للهواتف */
}
```

## 🌍 دعم اللغات

المكون يدعم 3 لغات:

- **العربية** (ar) - الافتراضي
- **الإنجليزية** (en)
- **الفرنسية** (fr)

### إضافة لغة جديدة

```javascript
// في SpeakerView.jsx

const getQualityText = () => {
  const texts = {
    ar: { excellent: 'ممتاز', good: 'جيد', poor: 'ضعيف' },
    en: { excellent: 'Excellent', good: 'Good', poor: 'Poor' },
    fr: { excellent: 'Excellent', good: 'Bon', poor: 'Faible' },
    es: { excellent: 'Excelente', good: 'Bueno', poor: 'Pobre' } // إسبانية
  };
  return texts[language]?.[connectionQuality] || texts.ar[connectionQuality];
};
```

## 🧪 الاختبار

### تشغيل المثال

```bash
# في المتصفح، افتح:
http://localhost:3000/speaker-view-example

# أو استخدم المكون مباشرة:
import SpeakerViewExample from './components/VideoCall/SpeakerViewExample';

<SpeakerViewExample />
```

### اختبار يدوي

1. افتح المثال في المتصفح
2. اسمح بالوصول للكاميرا والميكروفون
3. لاحظ تغيير المتحدث النشط كل 5 ثواني
4. جرب تثبيت مشارك بالنقر عليه
5. جرب تبديل اللغة (العربية، الإنجليزية، الفرنسية)
6. جرب بدء/إيقاف التسجيل

## 🐛 استكشاف الأخطاء

### المشكلة: لا يظهر الفيديو

**الحل:**
```javascript
// تأكد من أن MediaStream صحيح
console.log('Local stream:', localStream);
console.log('Participants:', participants);

// تأكد من أن الكاميرا مفعلة
if (localStream) {
  const videoTrack = localStream.getVideoTracks()[0];
  console.log('Video track enabled:', videoTrack.enabled);
}
```

### المشكلة: لا يتم كشف المتحدث

**الحل:**
```javascript
// تأكد من أن AudioContext مدعوم
if (!window.AudioContext && !window.webkitAudioContext) {
  console.error('AudioContext not supported');
}

// تأكد من أن audioLevel يتم تحديثه
console.log('Audio levels:', audioLevels);
```

### المشكلة: الأداء بطيء

**الحل:**
```javascript
// قلل تردد تحديث مستوى الصوت
const interval = setInterval(checkAudioLevel, 200); // بدلاً من 100ms

// قلل fftSize
analyser.fftSize = 128; // بدلاً من 256
```

## 📚 المراجع

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## 📝 Requirements

- ✅ **Requirements 7.3**: عرض المتحدث الحالي (speaker view)
- ✅ دعم حتى 10 مشاركين
- ✅ كشف تلقائي للمتحدث النشط
- ✅ إمكانية تثبيت متحدث معين
- ✅ عرض مستوى الصوت لكل مشارك
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ دعم RTL/LTR

## 🎯 الخطوات التالية

1. ✅ تنفيذ SpeakerView - **مكتمل**
2. ⏳ تنفيذ GridView (عرض شبكي)
3. ⏳ إضافة ميزات المضيف (كتم الجميع، إزالة مشارك)
4. ⏳ اختبارات Unit Tests
5. ⏳ اختبارات Integration Tests

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: ✅ مكتمل وجاهز للاستخدام
