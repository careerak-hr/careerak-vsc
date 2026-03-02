# دليل البدء السريع - ميزة رفع اليد

## ⚡ البدء السريع (5 دقائق)

### 1. التثبيت (لا يحتاج - مدمج بالفعل)

الميزة مدمجة بالفعل في المشروع. لا حاجة لتثبيت أي شيء!

### 2. الاستخدام الأساسي

```jsx
import RaiseHand from './components/VideoInterview/RaiseHand';

function VideoCall() {
  return (
    <RaiseHand
      socket={socket}
      roomId="room-123"
      isHost={true}
      currentUserId="user-123"
      currentUserName="أحمد محمد"
    />
  );
}
```

### 3. الاختبار

```bash
cd frontend
npm test -- RaiseHand.test.jsx
```

النتيجة المتوقعة: ✅ 20/20 tests passed

---

## 🎯 الميزات الرئيسية

| الميزة | الوصف | الحالة |
|--------|-------|---------|
| رفع اليد | زر لرفع اليد | ✅ |
| خفض اليد | نفس الزر لخفض اليد | ✅ |
| قائمة للمضيف | عرض جميع الأيدي المرفوعة | ✅ |
| مؤشر للمشاركين | عرض العدد فقط | ✅ |
| 3 لغات | ar, en, fr | ✅ |
| متجاوب | Desktop, Tablet, Mobile | ✅ |

---

## 📦 الملفات

```
backend/src/services/
└── signalingService.js          # محدّث

frontend/src/components/VideoInterview/
├── RaiseHand.jsx                # المكون
├── RaiseHand.css                # التنسيقات
├── README_RAISE_HAND.md         # التوثيق
└── __tests__/
    └── RaiseHand.test.jsx       # الاختبارات

frontend/src/examples/
└── RaiseHandExample.jsx         # مثال تفاعلي

docs/
├── VIDEO_INTERVIEWS_RAISE_HAND_FEATURE.md      # توثيق شامل
└── VIDEO_INTERVIEWS_RAISE_HAND_QUICK_START.md  # هذا الملف
```

---

## 🔌 Socket.IO Events

### Client → Server
```javascript
socket.emit('raise-hand', { roomId });
socket.emit('lower-hand', { roomId });
```

### Server → Client
```javascript
socket.on('hand-raised', (data) => { /* ... */ });
socket.on('hand-lowered', (data) => { /* ... */ });
```

---

## 🎨 التصميم

### الألوان
- Primary: #304B60
- Secondary: #E3DAD1
- Accent: #D48161

### الأيقونة
- ✋ (U+270B)

---

## 🧪 الاختبار السريع

```bash
# تشغيل الاختبارات
npm test -- RaiseHand.test.jsx

# تشغيل المثال التفاعلي
npm start
# ثم افتح: http://localhost:3000/examples/raise-hand
```

---

## 🐛 استكشاف الأخطاء السريع

### الزر لا يعمل؟
```javascript
console.log('Socket:', socket?.connected);
console.log('Room ID:', roomId);
```

### القائمة لا تظهر؟
```javascript
console.log('Is Host:', isHost);
console.log('Raised Hands:', raisedHands.length);
```

---

## 📞 الدعم

- 📧 careerak.hr@gmail.com
- 📄 التوثيق الكامل: `docs/VIDEO_INTERVIEWS_RAISE_HAND_FEATURE.md`

---

**الحالة**: ✅ جاهز للاستخدام  
**الإصدار**: 1.0.0  
**التاريخ**: 2026-03-02
