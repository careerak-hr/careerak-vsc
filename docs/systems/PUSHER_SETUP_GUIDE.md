# 🚀 دليل إعداد Pusher للمحادثات الفورية

## 📋 نظرة عامة

Pusher هو بديل Socket.IO الذي يعمل على Vercel ويوفر محادثات فورية حقيقية.

---

## 🎯 الخطوة 1: إنشاء حساب Pusher

### 1. اذهب إلى Pusher
https://pusher.com/

### 2. سجل حساب مجاني
- اضغط على "Sign Up"
- أدخل بياناتك
- فعّل الحساب من البريد الإلكتروني

### 3. أنشئ تطبيق جديد (App)
- اضغط على "Create App"
- اختر اسم التطبيق: `careerak-chat`
- اختر Cluster: `eu` (أوروبا) أو `ap1` (آسيا)
- اختر Frontend: `React`
- اختر Backend: `Node.js`
- اضغط "Create App"

---

## 🔑 الخطوة 2: الحصول على المفاتيح

### من لوحة التحكم:
1. اذهب إلى "App Keys"
2. ستجد:
   - **app_id**: مثل `1234567`
   - **key**: مثل `abcdef123456`
   - **secret**: مثل `xyz789secret`
   - **cluster**: مثل `eu`

### احفظ هذه المفاتيح!

---

## ⚙️ الخطوة 3: إعداد Backend

### 1. تثبيت Pusher
```bash
cd backend
npm install pusher
```

### 2. إضافة المفاتيح لـ .env
```bash
# في ملف backend/.env
PUSHER_APP_ID=1234567
PUSHER_KEY=abcdef123456
PUSHER_SECRET=xyz789secret
PUSHER_CLUSTER=eu
```

### 3. إعادة تشغيل السيرفر
```bash
npm start
```

**يجب أن ترى:**
```
✅ Pusher initialized successfully
📡 Pusher cluster: eu
```

---

## 📱 الخطوة 4: إعداد Frontend

### 1. تثبيت Pusher Client
```bash
cd frontend
npm install pusher-js
```

### 2. إنشاء Pusher Service

```javascript
// services/pusherService.js
import Pusher from 'pusher-js';

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = {};
  }
  
  // الاتصال بـ Pusher
  connect(token) {
    this.pusher = new Pusher('YOUR_PUSHER_KEY', {
      cluster: 'eu',
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
      console.error('❌ Pusher connection error:', err);
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
      if (callbacks.onNewMessage) {
        callbacks.onNewMessage(data.message);
      }
    });
    
    // مستخدم يكتب
    channel.bind('user-typing', (data) => {
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
    
    // تم قراءة الرسالة
    channel.bind('message-read', (data) => {
      if (callbacks.onMessageRead) {
        callbacks.onMessageRead(data);
      }
    });
    
    this.channels[channelName] = channel;
    return channel;
  }
  
  // إلغاء الاشتراك
  unsubscribeFromConversation(conversationId) {
    const channelName = `conversation-${conversationId}`;
    
    if (this.channels[channelName]) {
      this.pusher.unsubscribe(channelName);
      delete this.channels[channelName];
    }
  }
  
  // الاشتراك في قناة المستخدم الخاصة
  subscribeToUserChannel(userId, callbacks) {
    const channelName = `private-user-${userId}`;
    const channel = this.pusher.subscribe(channelName);
    
    // إشعار جديد
    channel.bind('notification', (data) => {
      if (callbacks.onNotification) {
        callbacks.onNotification(data);
      }
    });
    
    // تحديث عدد غير المقروءة
    channel.bind('unread-count-updated', (data) => {
      if (callbacks.onUnreadCountUpdate) {
        callbacks.onUnreadCountUpdate(data.count);
      }
    });
    
    return channel;
  }
  
  // قطع الاتصال
  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
    }
  }
}

export default new PusherService();
```

### 3. استخدام في React Component

```jsx
// components/ChatWindow.jsx
import { useEffect, useState } from 'react';
import pusherService from '../services/pusherService';

function ChatWindow({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    // الاتصال بـ Pusher
    pusherService.connect(token);
    
    // الاشتراك في المحادثة
    pusherService.subscribeToConversation(conversationId, {
      onNewMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      onUserTyping: (data) => {
        setIsTyping(true);
      },
      onStopTyping: (data) => {
        setIsTyping(false);
      },
      onMessageRead: (data) => {
        // تحديث حالة الرسالة
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, status: 'read' }
            : msg
        ));
      }
    });
    
    return () => {
      pusherService.unsubscribeFromConversation(conversationId);
    };
  }, [conversationId]);
  
  return (
    <div className="chat-window">
      {messages.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
      {isTyping && <div>يكتب الآن...</div>}
    </div>
  );
}
```

---

## 🧪 الخطوة 5: الاختبار

### 1. تشغيل Backend
```bash
cd backend
npm start
```

### 2. تشغيل Frontend
```bash
cd frontend
npm start
```

### 3. افتح نافذتين
- نافذة 1: مستخدم A
- نافذة 2: مستخدم B

### 4. ابدأ محادثة
- المستخدم A يرسل رسالة
- يجب أن تظهر فوراً عند المستخدم B

---

## 📊 الخطة المجانية

### ما تحصل عليه مجاناً:
- ✅ 200,000 رسالة/يوم
- ✅ 100 اتصال متزامن
- ✅ Unlimited channels
- ✅ SSL مجاني
- ✅ دعم جميع الميزات

### هل يكفي؟
**نعم!** للمشاريع الصغيرة والمتوسطة:
- 200,000 رسالة = ~8,300 رسالة/ساعة
- 100 اتصال = 100 مستخدم متصل في نفس الوقت

---

## 🔒 الأمان

### 1. لا تشارك المفاتيح
- ❌ لا تضع المفاتيح في Git
- ✅ استخدم .env فقط
- ✅ أضف .env إلى .gitignore

### 2. استخدم HTTPS
- ✅ Pusher يستخدم TLS تلقائياً
- ✅ تأكد من HTTPS في الإنتاج

### 3. المصادقة
- ✅ جميع القنوات الخاصة تحتاج مصادقة
- ✅ Backend يتحقق من JWT قبل المصادقة

---

## 🎯 الميزات المتاحة

### مع Pusher:
- ✅ محادثات فورية real-time
- ✅ مؤشر "يكتب الآن..."
- ✅ حالة "تم القراءة"
- ✅ إشعارات فورية
- ✅ عدد الرسائل غير المقروءة
- ✅ يعمل على Vercel
- ✅ لا يحتاج سيرفر إضافي

---

## 🔧 استكشاف الأخطاء

### المشكلة: "Pusher not initialized"
**الحل:**
```bash
# تأكد من تثبيت pusher
npm install pusher

# تأكد من وجود المفاتيح في .env
echo $PUSHER_APP_ID
```

### المشكلة: "Connection failed"
**الحل:**
1. تحقق من المفاتيح
2. تحقق من الـ cluster
3. تحقق من الإنترنت

### المشكلة: "Authentication failed"
**الحل:**
1. تحقق من JWT token
2. تحقق من endpoint: `/chat/pusher/auth`
3. راجع logs في Backend

---

## 📈 المقارنة

| الميزة | Socket.IO | Pusher |
|--------|-----------|--------|
| يعمل على Vercel | ❌ | ✅ |
| سهولة الإعداد | ⚠️ متوسط | ✅ سهل |
| التكلفة | ✅ مجاني | ✅ مجاني (حد معين) |
| الصيانة | ⚠️ تحتاج سيرفر | ✅ مُدار |
| الموثوقية | ⚠️ تعتمد عليك | ✅ عالية |
| الميزات | ✅ كاملة | ✅ كاملة |

---

## 🎉 الخلاصة

Pusher هو الحل الأمثل للمحادثات الفورية على Vercel:
- ✅ سهل الإعداد (10 دقائق)
- ✅ مجاني للبداية
- ✅ موثوق وسريع
- ✅ لا يحتاج صيانة

---

## 📚 المزيد من المعلومات

- 📖 [Pusher Docs](https://pusher.com/docs/)
- 📖 [Pusher Channels](https://pusher.com/docs/channels/)
- 📖 [React Integration](https://pusher.com/docs/channels/getting_started/react/)

---

**تاريخ الإنشاء**: 2026-02-17  
**الإصدار**: 1.0.0
