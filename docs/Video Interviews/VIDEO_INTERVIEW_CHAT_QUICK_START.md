# 💬 دليل البدء السريع - الدردشة النصية أثناء مقابلة الفيديو

## 📋 نظرة عامة

دردشة نصية جانبية تعمل في الوقت الفعلي أثناء مقابلات الفيديو، مع دعم:
- ✅ إرسال واستقبال الرسائل فوراً
- ✅ مؤشر "يكتب الآن..."
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ واجهة بسيطة وسهلة الاستخدام

---

## 🚀 الاستخدام السريع (5 دقائق)

### 1. Backend - إضافة أحداث Socket.IO

الأحداث مضافة بالفعل في `backend/src/services/socketService.js`:

```javascript
// الأحداث المتاحة:
- join_video_interview
- leave_video_interview
- video_chat_message
- video_chat_typing
- video_chat_stop_typing
```

### 2. Frontend - استخدام المكون

```jsx
import VideoChat from './components/VideoInterview/VideoChat';
import io from 'socket.io-client';

function VideoInterviewPage() {
  const [socket, setSocket] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  useEffect(() => {
    // الاتصال بـ Socket.IO
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:5000', {
      auth: { token },
    });

    // الانضمام للمقابلة
    newSocket.emit('join_video_interview', interviewId);

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_video_interview', interviewId);
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      {/* واجهة الفيديو */}
      <VideoCallComponent />

      {/* الدردشة الجانبية */}
      <VideoChat
        interviewId={interviewId}
        socket={socket}
        currentUser={currentUser}
        otherUser={otherUser}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}
```

### 3. تشغيل المثال

```bash
# Backend
cd backend
npm run dev:socket

# Frontend
cd frontend
npm start

# افتح المثال
http://localhost:3000/examples/video-chat
```

---

## 📦 المكونات

### VideoChat Component

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `interviewId` | string | ✅ | معرف المقابلة |
| `socket` | Socket | ✅ | Socket.IO instance |
| `currentUser` | object | ✅ | المستخدم الحالي |
| `otherUser` | object | ✅ | المستخدم الآخر |
| `isOpen` | boolean | ✅ | حالة فتح/إغلاق الدردشة |
| `onToggle` | function | ✅ | دالة تبديل الحالة |

**مثال:**

```jsx
<VideoChat
  interviewId="interview_123"
  socket={socketInstance}
  currentUser={{
    _id: 'user_1',
    firstName: 'أحمد',
    profileImage: '/avatar.jpg',
  }}
  otherUser={{
    _id: 'user_2',
    companyName: 'شركة التقنية',
    profileImage: '/company-logo.jpg',
  }}
  isOpen={true}
  onToggle={() => setIsChatOpen(!isChatOpen)}
/>
```

---

## 🔌 Socket.IO Events

### Client → Server

**الانضمام للمقابلة:**
```javascript
socket.emit('join_video_interview', interviewId);
```

**مغادرة المقابلة:**
```javascript
socket.emit('leave_video_interview', interviewId);
```

**إرسال رسالة:**
```javascript
socket.emit('video_chat_message', {
  interviewId,
  message: {
    id: Date.now(),
    sender: { _id, name, profileImage },
    content: 'مرحباً',
    timestamp: new Date().toISOString(),
  },
});
```

**المستخدم يكتب:**
```javascript
socket.emit('video_chat_typing', {
  interviewId,
  userId: currentUser._id,
});
```

**المستخدم توقف عن الكتابة:**
```javascript
socket.emit('video_chat_stop_typing', {
  interviewId,
  userId: currentUser._id,
});
```

### Server → Client

**رسالة جديدة:**
```javascript
socket.on('video_chat_message', (data) => {
  console.log('New message:', data.message);
  // تحديث UI
});
```

**مستخدم يكتب:**
```javascript
socket.on('video_chat_typing', (data) => {
  console.log(`User ${data.userId} is typing...`);
  // عرض مؤشر "يكتب الآن..."
});
```

**مستخدم توقف عن الكتابة:**
```javascript
socket.on('video_chat_stop_typing', (data) => {
  // إخفاء مؤشر "يكتب الآن..."
});
```

---

## 🎨 التخصيص

### تغيير الألوان

```css
/* في VideoChat.css */

/* لون الخلفية الرئيسي */
.video-chat-header {
  background: linear-gradient(135deg, #304B60 0%, #3d5f78 100%);
}

/* لون الرسائل المرسلة */
.message.sent .message-content {
  background: #304B60;
  color: #fff;
}

/* لون الرسائل المستقبلة */
.message.received .message-content {
  background: #fff;
  color: #333;
}
```

### تغيير الموقع

```css
/* الموقع الافتراضي: أسفل اليمين */
.video-chat {
  right: 20px;
  bottom: 20px;
}

/* تغيير إلى أعلى اليمين */
.video-chat {
  right: 20px;
  top: 20px;
  bottom: auto;
}

/* تغيير إلى أسفل اليسار */
.video-chat {
  left: 20px;
  right: auto;
  bottom: 20px;
}
```

### تغيير الحجم

```css
/* الحجم الافتراضي */
.video-chat {
  width: 350px;
  height: 500px;
}

/* حجم أكبر */
.video-chat {
  width: 400px;
  height: 600px;
}

/* حجم أصغر */
.video-chat {
  width: 300px;
  height: 400px;
}
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: الرسائل لا تظهر

**الحل:**
```javascript
// تحقق من الاتصال
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// تحقق من الانضمام للمقابلة
socket.emit('join_video_interview', interviewId);
console.log('Joined interview:', interviewId);

// تحقق من استقبال الرسائل
socket.on('video_chat_message', (data) => {
  console.log('Received message:', data);
});
```

### المشكلة: مؤشر "يكتب الآن..." لا يعمل

**الحل:**
```javascript
// تأكد من إرسال الحدث
const handleInputChange = (e) => {
  setInputValue(e.target.value);
  socket.emit('video_chat_typing', {
    interviewId,
    userId: currentUser._id,
  });
};

// تأكد من إيقاف الحدث
setTimeout(() => {
  socket.emit('video_chat_stop_typing', {
    interviewId,
    userId: currentUser._id,
  });
}, 3000);
```

### المشكلة: Socket.IO لا يتصل

**الحل:**
```javascript
// تحقق من URL
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') },
  transports: ['websocket', 'polling'],
});

// تحقق من CORS في Backend
cors: {
  origin: ['http://localhost:3000'],
  credentials: true,
}
```

---

## 📊 الأداء

### تحسين الأداء

**1. تقليل عدد الرسائل:**
```javascript
// استخدام debounce لمؤشر الكتابة
const debouncedTyping = debounce(() => {
  socket.emit('video_chat_typing', { interviewId, userId });
}, 300);
```

**2. تحديد عدد الرسائل المعروضة:**
```javascript
const [messages, setMessages] = useState([]);
const MAX_MESSAGES = 100;

const addMessage = (message) => {
  setMessages((prev) => {
    const newMessages = [...prev, message];
    return newMessages.slice(-MAX_MESSAGES);
  });
};
```

**3. استخدام Virtual Scrolling:**
```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={messages.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <Message message={messages[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 🌍 دعم اللغات

المكون يدعم 3 لغات تلقائياً:

```javascript
const translations = {
  ar: {
    title: 'الدردشة',
    placeholder: 'اكتب رسالتك...',
    send: 'إرسال',
    typing: 'يكتب...',
    noMessages: 'لا توجد رسائل بعد',
  },
  en: {
    title: 'Chat',
    placeholder: 'Type your message...',
    send: 'Send',
    typing: 'typing...',
    noMessages: 'No messages yet',
  },
  fr: {
    title: 'Discussion',
    placeholder: 'Tapez votre message...',
    send: 'Envoyer',
    typing: 'en train d\'écrire...',
    noMessages: 'Pas encore de messages',
  },
};
```

---

## ✅ Checklist

- [ ] Backend Socket.IO يعمل
- [ ] Frontend متصل بـ Socket.IO
- [ ] الانضمام للمقابلة يعمل
- [ ] إرسال الرسائل يعمل
- [ ] استقبال الرسائل يعمل
- [ ] مؤشر "يكتب الآن..." يعمل
- [ ] التصميم متجاوب
- [ ] دعم اللغات يعمل

---

## 📚 الملفات المضافة

```
frontend/src/
├── components/VideoInterview/
│   ├── VideoChat.jsx           # المكون الرئيسي
│   └── VideoChat.css           # التنسيقات
└── examples/
    └── VideoChatExample.jsx    # مثال كامل

backend/src/services/
└── socketService.js            # محدّث بأحداث الدردشة

docs/
└── VIDEO_INTERVIEW_CHAT_QUICK_START.md  # هذا الملف
```

---

## 🎯 الخطوات التالية

1. ✅ دمج المكون مع واجهة الفيديو الحالية
2. ✅ إضافة حفظ الرسائل في قاعدة البيانات (اختياري)
3. ✅ إضافة إرسال الملفات (اختياري)
4. ✅ إضافة الرموز التعبيرية (اختياري)
5. ✅ إضافة الإشعارات الصوتية (اختياري)

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 6.1 (دردشة نصية جانبية)
