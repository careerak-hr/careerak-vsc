# 🚀 دليل البدء السريع - نظام المحادثات

## ⚡ البدء في 5 دقائق

### 1. تثبيت Socket.IO

```bash
cd backend
npm install socket.io
```

### 2. تشغيل السيرفر

```bash
# للتطوير المحلي مع Socket.IO
npm run dev:socket

# أو للإنتاج (بدون Socket.IO)
npm start
```

---

## 🧪 اختبار النظام

### اختبار 1: إنشاء محادثة

```bash
curl -X POST http://localhost:5000/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otherUserId": "OTHER_USER_ID"
  }'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "_id": "CONVERSATION_ID",
    "participants": [...]
  }
}
```

### اختبار 2: إرسال رسالة

```bash
curl -X POST http://localhost:5000/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "CONVERSATION_ID",
    "type": "text",
    "content": "مرحباً!"
  }'
```

### اختبار 3: جلب المحادثات

```bash
curl http://localhost:5000/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 التكامل مع Frontend

### خطوة 1: تثبيت Socket.IO Client

```bash
cd frontend
npm install socket.io-client
```

### خطوة 2: إنشاء Socket Service

```javascript
// services/socketService.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }
  
  connect(token) {
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to chat');
    });
    
    return this.socket;
  }
  
  joinConversation(conversationId) {
    this.socket.emit('join_conversation', conversationId);
  }
  
  sendMessage(conversationId, message) {
    this.socket.emit('send_message', {
      conversationId,
      message
    });
  }
  
  onNewMessage(callback) {
    this.socket.on('new_message', callback);
  }
}

export default new SocketService();
```

### خطوة 3: استخدام في React Component

```jsx
import { useEffect, useState } from 'react';
import socketService from './services/socketService';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    // الاتصال
    socketService.connect(token);
    
    // الاستماع للرسائل
    socketService.onNewMessage((data) => {
      setMessages(prev => [...prev, data.message]);
    });
  }, []);
  
  const sendMessage = (content) => {
    socketService.sendMessage(conversationId, {
      type: 'text',
      content
    });
  };
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
      <input onKeyPress={(e) => {
        if (e.key === 'Enter') {
          sendMessage(e.target.value);
          e.target.value = '';
        }
      }} />
    </div>
  );
}
```

---

## 🎯 السيناريوهات الشائعة

### سيناريو 1: بدء محادثة بعد التقديم

```javascript
// عند التقديم على وظيفة
const applyForJob = async (jobId) => {
  // 1. التقديم
  await fetch('/applications', {
    method: 'POST',
    body: JSON.stringify({ jobPostingId: jobId })
  });
  
  // 2. إنشاء محادثة مع الشركة
  const response = await fetch('/chat/conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      otherUserId: companyId,
      relatedJob: jobId
    })
  });
  
  const { data } = await response.json();
  
  // 3. فتح المحادثة
  openChat(data._id);
};
```

### سيناريو 2: إرسال ملف

```javascript
const sendFile = async (file) => {
  // 1. رفع الملف لـ Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadResponse = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  const { url } = await uploadResponse.json();
  
  // 2. إرسال رسالة بالملف
  await fetch('/chat/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      conversationId,
      type: 'file',
      file: {
        url,
        name: file.name,
        size: file.size,
        mimeType: file.type
      }
    })
  });
};
```

### سيناريو 3: مؤشر "يكتب الآن..."

```javascript
let typingTimeout;

const handleInputChange = (e) => {
  setInputValue(e.target.value);
  
  // إرسال "يكتب"
  socketService.socket.emit('typing', { conversationId });
  
  // إيقاف بعد 3 ثواني
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socketService.socket.emit('stop_typing', { conversationId });
  }, 3000);
};
```

---

## 🎨 مكونات UI جاهزة

### مكون الرسالة

```jsx
function Message({ message, isMine }) {
  return (
    <div className={`message ${isMine ? 'mine' : 'theirs'}`}>
      <div className="message-content">
        {message.type === 'text' && <p>{message.content}</p>}
        {message.type === 'file' && (
          <a href={message.file.url} download>
            📎 {message.file.name}
          </a>
        )}
      </div>
      <span className="time">
        {new Date(message.createdAt).toLocaleTimeString('ar-EG')}
      </span>
    </div>
  );
}
```

### مكون قائمة المحادثات

```jsx
function ConversationItem({ conversation, onClick }) {
  const otherUser = conversation.participants.find(
    p => p.user._id !== currentUserId
  );
  
  return (
    <div className="conversation-item" onClick={onClick}>
      <img src={otherUser.user.profileImage} alt="" />
      <div className="info">
        <h4>{otherUser.user.firstName || otherUser.user.companyName}</h4>
        <p>{conversation.lastMessage?.content}</p>
      </div>
      {otherUser.unreadCount > 0 && (
        <span className="badge">{otherUser.unreadCount}</span>
      )}
    </div>
  );
}
```

### مكون مؤشر الكتابة

```jsx
function TypingIndicator({ userName }) {
  return (
    <div className="typing-indicator">
      <span>{userName} يكتب</span>
      <span className="dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  );
}
```

---

## 🎨 CSS جاهز

```css
/* Chat Window */
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F5F5;
}

.chat-header {
  background: #304B60;
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.message.mine {
  align-self: flex-end;
  background: #D48161;
  color: white;
}

.message.theirs {
  align-self: flex-start;
  background: white;
  color: #333;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 16px;
  background: white;
  border-top: 1px solid #E3DAD1;
}

.chat-input input {
  flex: 1;
  padding: 12px;
  border: 2px solid #D4816180;
  border-radius: 24px;
  outline: none;
}

.chat-input button {
  padding: 12px 24px;
  background: #D48161;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border-radius: 12px;
  width: fit-content;
}

.typing-indicator .dots span {
  animation: blink 1.4s infinite;
}

.typing-indicator .dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%, 60%, 100% { opacity: 0; }
  30% { opacity: 1; }
}

/* Conversation List */
.conversation-list {
  background: white;
  border-right: 1px solid #E3DAD1;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #E3DAD1;
  cursor: pointer;
  transition: background 0.2s;
}

.conversation-item:hover {
  background: #F9F9F9;
}

.conversation-item img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.conversation-item .info h4 {
  margin: 0;
  font-size: 16px;
  color: #304B60;
}

.conversation-item .info p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-item .badge {
  background: #D48161;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-left: auto;
}
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: Socket.IO لا يتصل

**الحل:**
```javascript
// تأكد من تثبيت socket.io
npm install socket.io

// تأكد من تشغيل server.js
npm run dev:socket

// تحقق من الـ token
console.log('Token:', token);
```

### المشكلة: الرسائل لا تصل فوراً

**الحل:**
1. تأكد من الانضمام للمحادثة: `socket.emit('join_conversation', id)`
2. تحقق من الاستماع للأحداث: `socket.on('new_message', ...)`
3. راجع console للأخطاء

### المشكلة: "Authentication error"

**الحل:**
```javascript
// تأكد من إرسال الـ token بشكل صحيح
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

---

## 📚 الخطوات التالية

1. ✅ اختبر APIs باستخدام Postman
2. ✅ أضف Socket.IO للـ Frontend
3. ✅ أنشئ مكون ChatWindow
4. ✅ أنشئ مكون ConversationList
5. 🔄 أضف رفع الملفات
6. 🔄 أضف مؤشر "يكتب الآن..."
7. 🔄 أضف حالة "متصل/غير متصل"

---

## 📖 المزيد من المعلومات

- 📄 **التوثيق الكامل**: `docs/CHAT_SYSTEM.md`
- 📄 **معايير المشروع**: `.kiro/steering/project-standards.md`

---

**نصيحة**: ابدأ بالمحادثات البسيطة (text only)، ثم أضف الملفات والميزات المتقدمة تدريجياً!
