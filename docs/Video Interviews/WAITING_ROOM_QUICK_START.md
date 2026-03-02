# غرفة الانتظار - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. انضمام مشارك لغرفة الانتظار

```javascript
// Frontend - عند محاولة الانضمام للمقابلة
const joinWaitingRoom = async (roomId, interviewId) => {
  try {
    const response = await fetch('/api/waiting-room/join', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roomId,
        interviewId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`أنت في الموقع ${data.position} في الطابور`);
      console.log(`رسالة الترحيب: ${data.welcomeMessage}`);
      
      // الاستماع للإشعارات
      listenForAdmission();
    }
  } catch (error) {
    console.error('خطأ في الانضمام:', error);
  }
};
```

---

### 2. الاستماع للإشعارات (Pusher)

```javascript
// Frontend - الاستماع لإشعار القبول
import Pusher from 'pusher-js';

const listenForAdmission = () => {
  const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
    cluster: process.env.REACT_APP_PUSHER_CLUSTER
  });

  const channel = pusher.subscribe(`private-user-${userId}`);
  
  channel.bind('waiting-room-status', (data) => {
    if (data.type === 'admitted_to_interview') {
      // تم القبول! الانتقال لغرفة المقابلة
      window.location.href = `/interview/${data.roomId}`;
    } else if (data.type === 'rejected_from_interview') {
      // تم الرفض
      alert(`تم رفض طلبك: ${data.reason}`);
    }
  });
};
```

---

### 3. عرض قائمة المنتظرين (للمضيف)

```javascript
// Frontend - المضيف يرى قائمة المنتظرين
const getWaitingList = async (roomId) => {
  try {
    const response = await fetch(`/api/waiting-room/${roomId}/list`, {
      headers: {
        'Authorization': `Bearer ${hostToken}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`عدد المنتظرين: ${data.count}`);
      
      data.participants.forEach(p => {
        console.log(`${p.userId.name} - ينتظر منذ ${p.waitingTime} ثانية`);
      });
    }
  } catch (error) {
    console.error('خطأ في جلب القائمة:', error);
  }
};
```

---

### 4. قبول مشارك (للمضيف)

```javascript
// Frontend - المضيف يقبل مشارك
const admitParticipant = async (roomId, userId) => {
  try {
    const response = await fetch('/api/waiting-room/admit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hostToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roomId,
        userId
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('تم قبول المشارك بنجاح');
      // تحديث قائمة المنتظرين
      getWaitingList(roomId);
    }
  } catch (error) {
    console.error