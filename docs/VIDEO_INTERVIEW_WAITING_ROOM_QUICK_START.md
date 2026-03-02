# غرفة الانتظار للمقابلات - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. Backend Setup

**تثبيت التبعيات** (إذا لم تكن مثبتة):
```bash
cd backend
npm install uuid
```

**إضافة Routes في app.js**:
```javascript
// في backend/src/app.js
const waitingRoomRoutes = require('./routes/waitingRoomRoutes');

// بعد routes الأخرى
app.use('/api/waiting-rooms', waitingRoomRoutes);
```

**اختبار API**:
```bash
# إنشاء غرفة انتظار
curl -X POST http://localhost:5000/api/waiting-rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interviewId":"INTERVIEW_ID","welcomeMessage":"مرحباً!"}'
```

### 2. Frontend Setup

**استخدام WaitingRoom Component**:
```jsx
import WaitingRoom from './components/VideoInterview/WaitingRoom';

function InterviewPage() {
  const handleAdmitted = () => {
    // الانتقال للمقابلة
    navigate(`/interview/${interviewId}`);
  };

  const handleRejected = () => {
    // عرض رسالة رفض
    alert('تم رفض طلبك');
    navigate('/');
  };

  return (
    <WaitingRoom
      interviewId={interviewId}
      onAdmitted={handleAdmitted}
      onRejected={handleRejected}
    />
  );
}
```

**استخدام HostWaitingList Component**:
```jsx
import HostWaitingList from './components/VideoInterview/HostWaitingList';

function HostInterviewPage() {
  const handleParticipantAdmitted = (userId) => {
    console.log('Participant admitted:', userId);
    // تحديث قائمة المشاركين في المقابلة
  };

  return (
    <div className="interview-layout">
      <div className="main-video">
        {/* Video Call Component */}
      </div>
      <div className="sidebar">
        <HostWaitingList
          interviewId={interviewId}
          onParticipantAdmitted={handleParticipantAdmitted}
        />
      </div>
    </div>
  );
}
```

### 3. التدفق الكامل

**خطوة 1: إنشاء مقابلة**
```javascript
const interview = await fetch('/api/interviews/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    appointmentId: 'APPOINTMENT_ID',
    scheduledAt: new Date(),
    settings: {
      waitingRoomEnabled: true
    }
  })
});
```

**خطوة 2: إنشاء غرفة انتظار**
```javascript
const waitingRoom = await fetch('/api/waiting-rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    interviewId: interview.data.interviewId,
    welcomeMessage: 'مرحباً بك في مقابلة شركة XYZ'
  })
});
```

**خطوة 3: المشارك ينضم**
```javascript
const result = await fetch(`/api/waiting-rooms/${interviewId}/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**خطوة 4: المضيف يقبل**
```javascript
const result = await fetch(
  `/api/waiting-rooms/${interviewId}/admit/${userId}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);
```

---

## 🎯 أمثلة سريعة

### مثال 1: صفحة انتظار بسيطة
```jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WaitingRoom from '../components/VideoInterview/WaitingRoom';

function WaitingRoomPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  return (
    <WaitingRoom
      interviewId={interviewId}
      onAdmitted={() => navigate(`/interview/${interviewId}`)}
      onRejected={() => navigate('/')}
    />
  );
}

export default WaitingRoomPage;
```

### مثال 2: صفحة مضيف مع قائمة منتظرين
```jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoCall from '../components/VideoInterview/VideoCall';
import HostWaitingList from '../components/VideoInterview/HostWaitingList';

function HostInterviewPage() {
  const { interviewId } = useParams();
  const [participants, setParticipants] = useState([]);

  const handleParticipantAdmitted = (userId) => {
    // إضافة المشارك للمقابلة
    setParticipants(prev => [...prev, userId]);
  };

  return (
    <div className="interview-container">
      <div className="video-section">
        <VideoCall
          interviewId={interviewId}
          participants={participants}
        />
      </div>
      <div className="waiting-list-section">
        <HostWaitingList
          interviewId={interviewId}
          onParticipantAdmitted={handleParticipantAdmitted}
        />
      </div>
    </div>
  );
}

export default HostInterviewPage;
```

### مثال 3: تكامل مع Socket.IO (اختياري)
```javascript
// في Frontend
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL);

// الاستماع لقبول المشارك
socket.on('participant-admitted', (data) => {
  if (data.userId === currentUserId) {
    navigate(`/interview/${data.interviewId}`);
  }
});

// في Backend
// عند قبول مشارك
io.to(userId).emit('participant-admitted', {
  interviewId,
  userId
});
```

---

## 🔧 التخصيص

### تخصيص رسالة الترحيب
```javascript
// في HostWaitingList
const handleSaveWelcomeMessage = async () => {
  await fetch(
    `/api/waiting-rooms/${interviewId}/welcome-message`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        welcomeMessage: 'رسالتك المخصصة هنا'
      })
    }
  );
};
```

### تخصيص الألوان
```css
/* في WaitingRoom.css */
.waiting-room-container {
  background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}

.info-card i {
  color: #YOUR_ACCENT_COLOR;
}
```

### تخصيص فترة التحديث
```javascript
// في WaitingRoom.jsx
// تغيير من 5 ثواني إلى 10 ثواني
intervalRef.current = setInterval(loadWaitingInfo, 10000);
```

---

## 🐛 استكشاف الأخطاء السريع

### المشكلة: "Interview not found"
**الحل**: تحقق من أن `interviewId` صحيح وموجود في قاعدة البيانات

### المشكلة: "Only host can admit participants"
**الحل**: تحقق من أن المستخدم الحالي هو المضيف (`hostId`)

### المشكلة: الفيديو لا يظهر
**الحل**: 
```javascript
// تحقق من أذونات المتصفح
navigator.permissions.query({ name: 'camera' })
  .then(result => console.log(result.state));
```

### المشكلة: التحديث التلقائي لا يعمل
**الحل**: تحقق من `useEffect` cleanup
```javascript
useEffect(() => {
  const interval = setInterval(loadData, 5000);
  return () => clearInterval(interval); // مهم!
}, []);
```

---

## ✅ Checklist

قبل الإطلاق، تأكد من:
- [ ] Backend routes مضافة في app.js
- [ ] WaitingRoom model موجود في قاعدة البيانات
- [ ] Frontend components مستوردة بشكل صحيح
- [ ] CSS files مضافة
- [ ] Authentication يعمل
- [ ] أذونات الكاميرا/الميكروفون مطلوبة
- [ ] التحديث التلقائي يعمل
- [ ] دعم اللغات يعمل
- [ ] التصميم المتجاوب يعمل

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع التوثيق الشامل: `VIDEO_INTERVIEW_WAITING_ROOM.md`
2. تحقق من console للأخطاء
3. تحقق من Network tab في DevTools
4. تحقق من Backend logs

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام
