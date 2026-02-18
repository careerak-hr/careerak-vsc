# 🚀 إعداد Pusher السريع - خطوة بخطوة

## 📋 الخطوة 1: إنشاء حساب Pusher

### 1. اذهب إلى موقع Pusher
🔗 https://pusher.com/

### 2. سجل حساب مجاني
- اضغط على **"Sign Up"** أو **"Get Started Free"**
- أدخل بياناتك:
  - الاسم
  - البريد الإلكتروني
  - كلمة المرور
- أو سجل باستخدام GitHub

### 3. فعّل الحساب
- افتح بريدك الإلكتروني
- اضغط على رابط التفعيل

---

## 🎯 الخطوة 2: إنشاء تطبيق Pusher

### 1. من لوحة التحكم (Dashboard)
- اضغط على **"Create app"** أو **"Channels apps"**

### 2. املأ البيانات:
```
App name: careerak-chat
Cluster: ap1 (Asia Pacific - Mumbai)
        أو eu (Europe - Ireland)
        أو us2 (US East)
Frontend tech: React
Backend tech: Node.js
```

### 3. اضغط **"Create app"**

---

## 🔑 الخطوة 3: الحصول على المفاتيح

### من صفحة التطبيق:
1. اذهب إلى تبويب **"App Keys"**
2. ستجد المفاتيح التالية:

```
app_id: 1234567
key: abcdef123456789
secret: xyz789secret123
cluster: ap1
```

### ⚠️ مهم جداً:
- **لا تشارك** الـ `secret` مع أحد
- **لا تضعه** في Frontend
- **احفظه** في `.env` فقط

---

## ⚙️ الخطوة 4: إضافة المفاتيح في Backend

### 1. افتح ملف `backend/.env`

### 2. استبدل القيم:
```env
# Pusher Configuration
PUSHER_APP_ID=1234567
PUSHER_KEY=abcdef123456789
PUSHER_SECRET=xyz789secret123
PUSHER_CLUSTER=ap1
```

### 3. احفظ الملف

---

## 🧪 الخطوة 5: اختبار الإعداد

### 1. تأكد من تثبيت Pusher:
```bash
cd backend
npm install pusher
```

### 2. شغّل السيرفر:
```bash
npm start
```

### 3. يجب أن ترى:
```
✅ Pusher initialized successfully
📡 Pusher cluster: ap1
🚀 Server running on port 5000
```

### ❌ إذا رأيت:
```
⚠️ Pusher credentials not found
```
**المشكلة**: المفاتيح غير صحيحة أو غير موجودة

---

## 📱 الخطوة 6: إعداد Frontend (React)

### 1. تثبيت Pusher Client:
```bash
cd frontend
npm install pusher-js
```

### 2. إنشاء ملف `frontend/src/services/pusherClient.js`:
```javascript
import Pusher from 'pusher-js';

class PusherClient {
  constructor() {
    this.pusher = null;
    this.channels = {};
  }
  
  // الاتصال بـ Pusher
  connect(token) {
    if (this.pusher) {
      return this.pusher;
    }
    
    this.pusher = new Pusher('YOUR_PUSHER_KEY', {  // ضع key من .env
      cluster: 'ap1',  // نفس الـ cluster
      authEndpoint: 'http://localhost:5000/chat/pusher/auth',
      auth: {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    });
    
    this.pusher.connection.bind('connected', () => {
      console.log('✅ Connected to Pusher');
    });
    
    this.pusher.connection.bind('error', (err) => {
      console.error('❌ Pusher error:', err);
    });
    
    return this.pusher;
  }
  
  // الاشتراك في محادثة
  subscribeToConversation(conversationId, callbacks) {
    const channelName = `conversation-${conversationId}`;
    
    if (this.channels[channelName]) {
      return this.channels[channelName];
    }
    
    const channel = this.pusher.subscribe(channelName);
    
    // رسالة جديدة
    channel.bind('new-message', (data) => {
      console.log('📨 New message:', data);
      if (callbacks.onNewMessage) {
        callbacks.onNewMessage(data.message);
      }
    });
    
    // مستخدم يكتب
    channel.bind('user-typing', (data) => {
      console.log('⌨️ User typing:', data);
      if (callbacks.onUserTyping) {
        callbacks.onUserTyping(data);
      }
    });
    
    // توقف عن الكتابة
    channel.bind('user-stop-typing', (data) => {
      if (callbacks.onStopTyping) {
        callbacks.onStopTyping(data);
      }
    });
    
    this.channels[channelName] = channel;
    return channel;
  }
  
  // إلغاء الاشتراك
  unsubscribe(conversationId) {
    const channelName = `conversation-${conversationId}`;
    if (this.channels[channelName]) {
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
    }
  }
  
  // قطع الاتصال
  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
  }
}

export default new PusherClient();
```

---

## 🎯 الخطوة 7: استخدام في React Component

```jsx
import { useEffect, useState } from 'react';
import pusherClient from '../services/pusherClient';

function ChatWindow({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // الاتصال بـ Pusher
    pusherClient.connect(token);
    
    // الاشتراك في المحادثة
    pusherClient.subscribeToConversation(conversationId, {
      onNewMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      onUserTyping: (data) => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });
    
    return () => {
      pusherClient.unsubscribe(conversationId);
    };
  }, [conversationId]);
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
      {isTyping && <div>يكتب الآن...</div>}
    </div>
  );
}
```

---

## 🧪 الخطوة 8: اختبار المحادثات

### 1. شغّل Backend:
```bash
cd backend
npm start
```

### 2. شغّل Frontend:
```bash
cd frontend
npm start
```

### 3. افتح نافذتين:
- نافذة 1: مستخدم A
- نافذة 2: مستخدم B

### 4. أرسل رسالة من A:
```javascript
// في المتصفح Console
fetch('http://localhost:5000/chat/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    conversationId: 'CONVERSATION_ID',
    content: 'مرحباً!',
    type: 'text'
  })
});
```

### 5. يجب أن تظهر الرسالة فوراً عند B ✅

---

## 📊 الخطة المجانية

### ما تحصل عليه:
- ✅ **200,000 رسالة/يوم**
- ✅ **100 اتصال متزامن**
- ✅ **Unlimited channels**
- ✅ **SSL مجاني**

### هل يكفي؟
**نعم!** للمشاريع الصغيرة والمتوسطة:
- 200K رسالة = ~8,300 رسالة/ساعة
- 100 اتصال = 100 مستخدم متصل في نفس الوقت

---

## 🔧 استكشاف الأخطاء

### المشكلة 1: "Pusher not initialized"
```bash
# الحل:
npm install pusher
# تأكد من المفاتيح في .env
```

### المشكلة 2: "Connection failed"
```
الحل:
1. تحقق من الـ cluster (ap1, eu, us2)
2. تحقق من الـ key
3. تحقق من الإنترنت
```

### المشكلة 3: "Authentication failed"
```
الحل:
1. تحقق من JWT token
2. تحقق من endpoint: /chat/pusher/auth
3. راجع Backend logs
```

### المشكلة 4: "No messages received"
```
الحل:
1. تحقق من اسم القناة (conversation-{id})
2. تحقق من اسم الحدث (new-message)
3. افتح Pusher Debug Console
```

---

## 🎉 تم الإعداد بنجاح!

الآن لديك:
- ✅ Pusher مفعّل
- ✅ Backend جاهز
- ✅ Frontend جاهز
- ✅ محادثات فورية تعمل

---

## 📚 روابط مفيدة

- 📖 [Pusher Dashboard](https://dashboard.pusher.com/)
- 📖 [Pusher Docs](https://pusher.com/docs/)
- 📖 [Debug Console](https://dashboard.pusher.com/apps/YOUR_APP_ID/getting_started)

---

**تاريخ الإنشاء**: 2026-02-17  
**الحالة**: ✅ جاهز للاستخدام
