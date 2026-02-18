# 💬 نظام المحادثات المباشرة - Careerak

## 📋 نظرة عامة

نظام محادثات فوري ومتكامل يربط الباحثين عن عمل بالشركات مباشرة، مع دعم:
- ✅ محادثات فورية بعد التقديم على وظيفة
- ✅ إرسال ملفات ومستندات
- ✅ حالة "متصل/غير متصل" (Online/Offline)
- ✅ تاريخ المحادثات الكامل
- ✅ إشعارات الرسائل الجديدة
- ✅ تعديل وحذف الرسائل
- ✅ أرشفة المحادثات
- ✅ البحث في المحادثات
- ✅ مؤشر "يكتب الآن..." (Typing indicator)

## 🎯 الفوائد المتوقعة

- ⚡ تسريع عملية التوظيف بنسبة 60%
- 📈 تحسين التواصل بين الطرفين
- 🎯 زيادة معدل التحويل (Conversion Rate)
- 😊 تحسين تجربة المستخدم بشكل كبير

---

## 🏗️ البنية التقنية

### 1. التقنيات المستخدمة

- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Database**: MongoDB + Mongoose
- **File Upload**: Cloudinary (للملفات والصور)
- **Authentication**: JWT

### 2. النماذج (Models)

#### Conversation Model
```javascript
{
  participants: [{
    user: ObjectId,
    role: 'HR' | 'Employee',
    lastRead: Date,
    unreadCount: Number
  }],
  relatedJob: ObjectId,           // الوظيفة المرتبطة
  relatedApplication: ObjectId,   // طلب التوظيف المرتبط
  lastMessage: {
    content: String,
    sender: ObjectId,
    timestamp: Date,
    type: 'text' | 'file' | 'image'
  },
  status: 'active' | 'archived' | 'blocked',
  archivedBy: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

#### Message Model
```javascript
{
  conversation: ObjectId,
  sender: ObjectId,
  type: 'text' | 'file' | 'image' | 'system',
  content: String,
  file: {
    url: String,
    name: String,
    size: Number,
    mimeType: String,
    cloudinaryId: String
  },
  status: 'sent' | 'delivered' | 'read',
  readBy: [{
    user: ObjectId,
    readAt: Date
  }],
  replyTo: ObjectId,              // الرد على رسالة
  deletedBy: [ObjectId],
  edited: Boolean,
  editedAt: Date,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### المحادثات (Conversations)

#### إنشاء أو الحصول على محادثة
```http
POST /chat/conversations
Authorization: Bearer {token}
Content-Type: application/json

{
  "otherUserId": "USER_ID",
  "relatedJob": "JOB_ID",           // اختياري
  "relatedApplication": "APP_ID"    // اختياري
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "CONVERSATION_ID",
    "participants": [...],
    "relatedJob": {...},
    "createdAt": "2026-02-17T..."
  }
}
```

#### الحصول على محادثات المستخدم
```http
GET /chat/conversations?page=1&limit=20&archived=false
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    },
    "totalUnread": 12
  }
}
```

#### البحث في المحادثات
```http
GET /chat/conversations/search?q=أحمد
Authorization: Bearer {token}
```

#### تحديد المحادثة كمقروءة
```http
PATCH /chat/conversations/:conversationId/read
Authorization: Bearer {token}
```

#### أرشفة محادثة
```http
PATCH /chat/conversations/:conversationId/archive
Authorization: Bearer {token}
```

#### إلغاء أرشفة محادثة
```http
PATCH /chat/conversations/:conversationId/unarchive
Authorization: Bearer {token}
```

### الرسائل (Messages)

#### إرسال رسالة
```http
POST /chat/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversationId": "CONVERSATION_ID",
  "type": "text",
  "content": "مرحباً، كيف حالك؟"
}
```

**إرسال ملف:**
```json
{
  "conversationId": "CONVERSATION_ID",
  "type": "file",
  "file": {
    "url": "https://...",
    "name": "cv.pdf",
    "size": 1024000,
    "mimeType": "application/pdf"
  }
}
```

#### الحصول على رسائل محادثة
```http
GET /chat/conversations/:conversationId/messages?page=1&limit=50
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    }
  }
}
```

#### تعديل رسالة
```http
PATCH /chat/messages/:messageId
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "المحتوى الجديد"
}
```

#### حذف رسالة
```http
DELETE /chat/messages/:messageId
Authorization: Bearer {token}
```

### حالة المستخدم

#### الحصول على حالة المستخدم
```http
GET /chat/users/:userId/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "USER_ID",
    "status": "online",
    "lastSeen": "2026-02-17T..."
  }
}
```

---

## 🔄 Socket.IO Events

### Client → Server

#### الاتصال
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

#### الانضمام لمحادثة
```javascript
socket.emit('join_conversation', conversationId);
```

#### مغادرة محادثة
```javascript
socket.emit('leave_conversation', conversationId);
```

#### إرسال رسالة
```javascript
socket.emit('send_message', {
  conversationId,
  message: {
    type: 'text',
    content: 'مرحباً'
  }
});
```

#### المستخدم يكتب
```javascript
socket.emit('typing', { conversationId });
```

#### المستخدم توقف عن الكتابة
```javascript
socket.emit('stop_typing', { conversationId });
```

#### تم قراءة الرسالة
```javascript
socket.emit('message_read', {
  conversationId,
  messageId
});
```

### Server → Client

#### رسالة جديدة
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // تحديث UI
});
```

#### مستخدم يكتب
```javascript
socket.on('user_typing', (data) => {
  console.log(`User ${data.userId} is typing...`);
  // عرض مؤشر "يكتب الآن..."
});
```

#### مستخدم توقف عن الكتابة
```javascript
socket.on('user_stop_typing', (data) => {
  // إخفاء مؤشر "يكتب الآن..."
});
```

#### تم قراءة الرسالة
```javascript
socket.on('message_read', (data) => {
  console.log(`Message ${data.messageId} was read`);
  // تحديث حالة الرسالة
});
```

#### تغيير حالة المستخدم
```javascript
socket.on('user_status_changed', (data) => {
  console.log(`User ${data.userId} is now ${data.status}`);
  // تحديث حالة المستخدم في UI
});
```

#### إشعار جديد
```javascript
socket.on('notification', (notification) => {
  console.log('New notification:', notification);
  // عرض إشعار
});
```

---

## 🎨 التكامل مع Frontend

### 1. إعداد Socket.IO Client

```bash
npm install socket.io-client
```

```javascript
// services/socketService.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }
  
  connect(token) {
    this.socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  
  joinConversation(conversationId) {
    this.socket.emit('join_conversation', conversationId);
  }
  
  leaveConversation(conversationId) {
    this.socket.emit('leave_conversation', conversationId);
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
  
  onUserTyping(callback) {
    this.socket.on('user_typing', callback);
  }
  
  onUserStopTyping(callback) {
    this.socket.on('user_stop_typing', callback);
  }
  
  onUserStatusChanged(callback) {
    this.socket.on('user_status_changed', callback);
  }
  
  emitTyping(conversationId) {
    this.socket.emit('typing', { conversationId });
  }
  
  emitStopTyping(conversationId) {
    this.socket.emit('stop_typing', { conversationId });
  }
}

export default new SocketService();
```

### 2. Hook للمحادثات

```javascript
// hooks/useChat.js
import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!conversationId) return;
    
    // الاتصال بالسيرفر
    socketService.connect(token);
    
    // الانضمام للمحادثة
    socketService.joinConversation(conversationId);
    
    // جلب الرسائل
    fetchMessages();
    
    // الاستماع للرسائل الجديدة
    socketService.onNewMessage((data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
    });
    
    // الاستماع لمؤشر الكتابة
    socketService.onUserTyping((data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(true);
      }
    });
    
    socketService.onUserStopTyping((data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(false);
      }
    });
    
    return () => {
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId]);
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/chat/conversations/${conversationId}/messages`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setMessages(data.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = useCallback(async (content, type = 'text') => {
    try {
      const response = await fetch('/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          type,
          content
        })
      });
      
      const data = await response.json();
      
      // إرسال عبر Socket.IO أيضاً
      socketService.sendMessage(conversationId, data.data);
      
      return data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversationId, token]);
  
  const handleTyping = useCallback(() => {
    socketService.emitTyping(conversationId);
  }, [conversationId]);
  
  const handleStopTyping = useCallback(() => {
    socketService.emitStopTyping(conversationId);
  }, [conversationId]);
  
  return {
    messages,
    isTyping,
    loading,
    sendMessage,
    handleTyping,
    handleStopTyping
  };
}
```

### 3. مكون المحادثة

```jsx
// components/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

export function ChatWindow({ conversationId, otherUser }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const {
    messages,
    isTyping,
    loading,
    sendMessage,
    handleTyping,
    handleStopTyping
  } = useChat(conversationId);
  
  // التمرير للأسفل عند رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    // إرسال مؤشر الكتابة
    handleTyping();
    
    // إيقاف مؤشر الكتابة بعد 3 ثواني
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };
  
  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    try {
      await sendMessage(inputValue);
      setInputValue('');
      handleStopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  if (loading) {
    return <div className="chat-loading">جاري التحميل...</div>;
  }
  
  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="user-info">
          <img src={otherUser.profileImage} alt={otherUser.name} />
          <div>
            <h3>{otherUser.name}</h3>
            <span className={`status ${otherUser.status}`}>
              {otherUser.status === 'online' ? 'متصل' : 'غير متصل'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.sender._id === userId ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              {message.type === 'text' && <p>{message.content}</p>}
              {message.type === 'file' && (
                <a href={message.file.url} download>
                  📎 {message.file.name}
                </a>
              )}
              {message.type === 'image' && (
                <img src={message.file.url} alt="صورة" />
              )}
            </div>
            <div className="message-time">
              {new Date(message.createdAt).toLocaleTimeString('ar-EG')}
              {message.edited && <span> (معدلة)</span>}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <span>{otherUser.name} يكتب</span>
            <span className="dots">...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="اكتب رسالتك..."
        />
        <button type="submit">إرسال</button>
      </form>
    </div>
  );
}
```

### 4. قائمة المحادثات

```jsx
// components/ConversationList.jsx
import { useState, useEffect } from 'react';

export function ConversationList({ onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    fetchConversations();
  }, []);
  
  const fetchConversations = async () => {
    try {
      const response = await fetch('/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConversations(data.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>جاري التحميل...</div>;
  }
  
  return (
    <div className="conversation-list">
      <h2>المحادثات</h2>
      
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(
          p => p.user._id !== userId
        );
        
        return (
          <div
            key={conv._id}
            className="conversation-item"
            onClick={() => onSelectConversation(conv)}
          >
            <img src={otherParticipant.user.profileImage} alt="" />
            <div className="conv-info">
              <h4>{otherParticipant.user.firstName || otherParticipant.user.companyName}</h4>
              <p className="last-message">
                {conv.lastMessage?.content || 'لا توجد رسائل'}
              </p>
            </div>
            {otherParticipant.unreadCount > 0 && (
              <span className="unread-badge">
                {otherParticipant.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## 📊 السيناريوهات الشائعة

### سيناريو 1: بدء محادثة بعد التقديم
```
1. مستخدم يتقدم لوظيفة
   ↓
2. النظام ينشئ محادثة تلقائياً بين المستخدم والشركة
   ↓
3. الشركة تحصل على إشعار بطلب جديد + محادثة جديدة
   ↓
4. الشركة ترسل رسالة للمستخدم
   ↓
5. المستخدم يحصل على إشعار فوري
```

### سيناريو 2: إرسال ملف CV محدث
```
1. الشركة تطلب CV محدث
   ↓
2. المستخدم يرفع الملف
   ↓
3. النظام يرسل الملف عبر Cloudinary
   ↓
4. الشركة تحصل على رابط التحميل فوراً
```

### سيناريو 3: محادثة فورية
```
1. كلا الطرفين متصلين (online)
   ↓
2. المستخدم يكتب رسالة
   ↓
3. الشركة ترى "يكتب الآن..."
   ↓
4. الرسالة تصل فوراً
   ↓
5. الشركة ترد مباشرة
```

---

## 🔒 الأمان والخصوصية

### 1. المصادقة
- جميع endpoints محمية بـ JWT
- Socket.IO يتطلب token صحيح

### 2. الصلاحيات
- المستخدم يمكنه فقط الوصول لمحادثاته
- لا يمكن قراءة محادثات الآخرين
- التحقق من المشاركة في المحادثة قبل أي عملية

### 3. حماية البيانات
- تشفير الاتصالات (HTTPS/WSS)
- تنظيف البيانات من XSS
- Rate limiting على الرسائل

---

## 📈 التحسينات المستقبلية

### 1. الرسائل الصوتية
```javascript
// إضافة نوع جديد: 'voice'
{
  type: 'voice',
  file: {
    url: 'https://...',
    duration: 30 // ثانية
  }
}
```

### 2. مكالمات الفيديو
- دمج WebRTC
- مكالمات صوت وفيديو مباشرة

### 3. الترجمة التلقائية
- ترجمة الرسائل تلقائياً
- دعم لغات متعددة

### 4. الردود السريعة
```javascript
quickReplies: [
  'شكراً لك',
  'سأراجع وأرد عليك',
  'هل يمكنك إرسال المزيد من التفاصيل؟'
]
```

### 5. البحث في الرسائل
```javascript
// البحث في محتوى الرسائل
GET /chat/messages/search?q=سيرة&conversationId=...
```

---

## 🧪 الاختبار

### اختبار 1: إنشاء محادثة
```bash
curl -X POST http://localhost:5000/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otherUserId": "OTHER_USER_ID",
    "relatedJob": "JOB_ID"
  }'
```

### اختبار 2: إرسال رسالة
```bash
curl -X POST http://localhost:5000/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "CONVERSATION_ID",
    "type": "text",
    "content": "مرحباً، كيف حالك؟"
  }'
```

### اختبار 3: جلب المحادثات
```bash
curl http://localhost:5000/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 الملفات المضافة/المعدلة

### ملفات جديدة:
- ✅ `backend/src/models/Conversation.js`
- ✅ `backend/src/models/Message.js`
- ✅ `backend/src/services/chatService.js`
- ✅ `backend/src/services/socketService.js`
- ✅ `backend/src/controllers/chatController.js`
- ✅ `backend/src/routes/chatRoutes.js`
- ✅ `backend/server.js` (للتطوير المحلي)

### ملفات معدلة:
- ✅ `backend/src/app.js` - إضافة مسار `/chat`
- ✅ `backend/package.json` - إضافة socket.io

---

## 🚀 التشغيل

### التطوير المحلي (مع Socket.IO):
```bash
cd backend
npm install
npm run dev:socket
```

### الإنتاج (Vercel):
```bash
npm start
```

**ملاحظة**: Socket.IO يعمل فقط في التطوير المحلي. في Vercel، استخدم polling أو خدمة منفصلة للـ WebSocket.

---

**آخر تحديث**: 2026-02-17  
**الإصدار**: 1.0.0
