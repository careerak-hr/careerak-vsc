# إشعار عند إغلاق وظيفة محفوظة - دليل البدء السريع

## ⚡ البدء السريع (5 دقائق)

### 1. Backend - إغلاق وظيفة

```javascript
// في jobPostingController أو أي مكان آخر
const JobPosting = require('../models/JobPosting');
const notificationService = require('../services/notificationService');

// تحديث حالة الوظيفة إلى Closed
const jobId = 'job_id_here';
await JobPosting.findByIdAndUpdate(jobId, { status: 'Closed' });

// إرسال إشعارات تلقائياً (يتم تلقائياً في updateJobPosting)
const result = await notificationService.notifyBookmarkedUsersJobClosed(jobId);
console.log(`✅ Sent ${result.notified} notifications`);
```

### 2. Frontend - عرض الإشعارات

```jsx
import React, { useEffect, useState } from 'react';

function JobClosedNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/notifications?type=job_closed', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setNotifications(data.notifications);
  };

  return (
    <div>
      {notifications.map(n => (
        <div key={n._id} className={n.isRead ? 'read' : 'unread'}>
          <h3>{n.title}</h3>
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. تفعيل/تعطيل الإشعارات

```javascript
// تفعيل الإشعارات عند حفظ وظيفة
const JobBookmark = require('../models/JobBookmark');

await JobBookmark.create({
  userId: 'user_id',
  jobId: 'job_id',
  notifyOnChange: true  // ✅ تفعيل الإشعارات
});

// تعطيل الإشعارات
await JobBookmark.findOneAndUpdate(
  { userId: 'user_id', jobId: 'job_id' },
  { notifyOnChange: false }  // ❌ تعطيل الإشعارات
);
```

---

## 🧪 الاختبار السريع

```bash
# تشغيل الاختبارات
cd backend
npm test -- jobClosedNotification.test.js

# النتيجة المتوقعة: ✅ جميع الاختبارات تنجح
```

---

## 📡 API Endpoints

### إغلاق وظيفة
```http
PUT /api/jobs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Closed"
}
```

### جلب الإشعارات
```http
GET /api/notifications?type=job_closed
Authorization: Bearer <token>
```

### تحديد كمقروء
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

---

## 🔔 Pusher (Real-time)

```javascript
// Frontend - الاستماع للإشعارات الفورية
import pusherClient from '../utils/pusherClient';

pusherClient.subscribe(`private-user-${userId}`);

pusherClient.bind('new-notification', (data) => {
  if (data.type === 'job_closed') {
    alert(`${data.title}: ${data.message}`);
  }
});
```

---

## ✅ Checklist

- [x] Backend: وظائف الإشعارات جاهزة
- [x] Backend: تحديث controller
- [x] Frontend: مثال كامل
- [x] Tests: 10+ اختبارات
- [x] Pusher: إشعارات فورية
- [x] Docs: توثيق شامل

---

## 📚 المزيد

- [التوثيق الشامل](./JOB_CLOSED_NOTIFICATION.md)
- [نظام الإشعارات](../NOTIFICATION_SYSTEM.md)
- [Pusher Setup](../PUSHER_SETUP_GUIDE.md)

---

**تاريخ الإنشاء**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
