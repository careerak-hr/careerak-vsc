# Speaker View - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. الاستيراد

```jsx
import SpeakerView from './components/VideoCall/SpeakerView';
```

### 2. الاستخدام الأساسي

```jsx
function GroupInterview() {
  const [participants, setParticipants] = useState([
    {
      id: 'participant-1',
      name: 'أحمد محمد',
      stream: mediaStream1,
      isSpeaking: false,
      audioLevel: 0
    }
  ]);

  return (
    <SpeakerView
      participants={participants}
      localStream={localStream}
      localParticipant={{ id: 'local', name: 'أنت' }}
      onToggleAudio={() => {}}
      onToggleVideo={() => {}}
    />
  );
}
```

### 3. تشغيل المثال

```bash
# افتح المتصفح
http://localhost:3000/speaker-view-example
```

---

## 📊 Props الأساسية

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `participants` | Array | ✅ | قائمة المشاركين |
| `localStream` | MediaStream | ✅ | Stream المستخدم |
| `onToggleAudio` | Function | ✅ | تبديل الصوت |
| `onToggleVideo` | Function | ✅ | تبديل الفيديو |

---

## 🎯 الميزات الرئيسية

✅ كشف تلقائي للمتحدث  
✅ تثبيت المتحدث  
✅ مؤشرات مستوى الصوت  
✅ تصميم متجاوب  
✅ دعم 3 لغات (ar, en, fr)  

---

## 📱 التصميم المتجاوب

- Desktop: شريط جانبي 200px
- Tablet: شريط جانبي 120px
- Mobile: شريط جانبي 80px

---

## 🌍 اللغات المدعومة

```jsx
<SpeakerView language="ar" /> // العربية
<SpeakerView language="en" /> // الإنجليزية
<SpeakerView language="fr" /> // الفرنسية
```

---

## 🔧 التكامل مع WebRTC

```javascript
// تحويل Peer Connections إلى Participants
const participants = Object.entries(peerConnections).map(([id, pc]) => ({
  id,
  name: pc.remoteUserName || 'مشارك',
  stream: pc.getRemoteStreams()[0],
  isSpeaking: false,
  audioLevel: 0
}));
```

---

## 📚 التوثيق الكامل

- 📄 `README_SPEAKER_VIEW.md` - دليل شامل
- 📄 `SPEAKER_VIEW_IMPLEMENTATION.md` - تفاصيل التنفيذ
- 📄 `SpeakerViewExample.jsx` - مثال كامل

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
