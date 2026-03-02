# دليل البدء السريع - تذكيرات مقابلات الفيديو

## ⚡ البدء السريع (5 دقائق)

### 1. التحقق من التشغيل
```bash
# تحقق من logs السيرفر
# يجب أن ترى:
✅ تم بدء جدولة التذكيرات بالمواعيد
[Appointment Reminder Cron] Started - Running every 5 minutes
```

### 2. إنشاء موعد اختباري
```javascript
const Appointment = require('./models/Appointment');
const VideoInterview = require('./models/VideoInterview');

// إنشاء مقابلة فيديو
const videoInterview = await VideoInterview.create({
  roomId: 'test-room-123',
  hostId: organizerId,
  participants: [{ userId: participantId, role: 'participant' }],
  status: 'scheduled'
});

// إنشاء موعد بعد 24 ساعة
const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

const appointment = await Appointment.create({
  type: 'video_interview',
  title: 'مقابلة اختبارية',
  organizerId: organizerId,
  participants: [{ userId: participantId, status: 'accepted' }],
  scheduledAt: in24Hours,
  duration: 60,
  status: 'scheduled',
  videoInterviewId: videoInterview._id
});
```

### 3. اختبار التذكيرات يدوياً
```javascript
const appointmentReminderService = require('./services/appointmentReminderService');

// اختبار تذكير 24 ساعة
const result24h = await appointmentReminderService.send24HourReminders();
console.log('24h reminders:', result24h);

// اختبار تذكير 15 دقيقة
const result15m = await appointmentReminderService.send15MinuteReminders();
console.log('15m reminders:', result15m);
```

### 4. التحقق من الإشعارات
```javascript
const Notification = require('./models/Notification');

// جلب آخر الإشعارات
const notifications = await Notification.find({
  type: { $in: ['interview_reminder_24h', 'interview_reminder_15m'] }
})
.sort({ createdAt: -1 })
.limit(10);

console.log('Recent reminders:', notifications);
```

## 📊 مراقبة النظام

### فحص حالة Cron Job
```javascript
// في app.js أو console
const { getCronStatus } = require('./jobs/appointmentReminderCron');
console.log(getCronStatus());
```

### فحص المواعيد القادمة
```javascript
const upcomingAppointments = await Appointment.find({
  scheduledAt: { $gte: new Date() },
  status: { $in: ['scheduled', 'confirmed'] },
  type: 'video_interview'
})
.sort({ scheduledAt: 1 })
.limit(10);

console.log('Upcoming interviews:', upcomingAppointments.length);
```

### فحص التذكيرات المرسلة
```javascript
const sentReminders = await Appointment.find({
  $or: [
    { 'reminders.reminder24h.sent': true },
    { 'reminders.reminder15m.sent': true }
  ]
})
.sort({ 'reminders.reminder24h.sentAt': -1 })
.limit(10);

console.log('Sent reminders:', sentReminders.length);
```

## 🧪 تشغيل الاختبارات

```bash
cd backend
npm test -- appointmentReminders.test.js
```

**النتيجة المتوقعة**:
```
✓ يجب إرسال تذكير قبل 24 ساعة من المقابلة
✓ يجب عدم إرسال تذكير إذا تم إرساله مسبقاً
✓ يجب عدم إرسال تذكير للمواعيد الملغاة
✓ يجب إرسال تذكير للمشاركين المقبولين فقط
✓ يجب إرسال تذكير قبل 15 دقيقة من المقابلة
✓ يجب تضمين رابط المقابلة في التذكير
✓ يجب أن يكون التذكير urgent priority
✓ يجب تشغيل جميع التذكيرات معاً

Tests: 8 passed, 8 total
```

## 🔧 استكشاف الأخطاء السريع

### المشكلة: لا يتم إرسال التذكيرات

**الحل السريع**:
```bash
# 1. تحقق من Cron Job
grep "Appointment Reminder Cron" backend/logs/combined.log

# 2. تحقق من المواعيد
node -e "
const mongoose = require('mongoose');
const Appointment = require('./src/models/Appointment');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await Appointment.countDocuments({
    scheduledAt: { \$gte: new Date() },
    status: { \$in: ['scheduled', 'confirmed'] }
  });
  console.log('Upcoming appointments:', count);
  process.exit(0);
});
"

# 3. تشغيل يدوي
node -e "
const mongoose = require('mongoose');
const service = require('./src/services/appointmentReminderService');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await service.runAllReminders();
  console.log('Result:', result);
  process.exit(0);
});
"
```

### المشكلة: Pusher لا يعمل

**الحل السريع**:
```bash
# تحقق من المتغيرات
echo $PUSHER_KEY
echo $PUSHER_SECRET
echo $PUSHER_CLUSTER

# اختبار Pusher
node -e "
const pusher = require('./src/services/pusherService');
console.log('Pusher enabled:', pusher.isEnabled());
"
```

## 📱 اختبار على Frontend

### 1. عرض الإشعارات
```jsx
import { useEffect, useState } from 'react';

function NotificationsList() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch('/api/notifications?type=interview_reminder_24h,interview_reminder_15m', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setNotifications(data.notifications));
  }, []);

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif._id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          {notif.relatedData.canJoinNow && (
            <a href={notif.relatedData.meetingLink}>
              انضم الآن
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. الاستماع لإشعارات Pusher
```javascript
import pusherClient from '../utils/pusherClient';

// الاستماع للتذكيرات
window.addEventListener('pusher-notification', (event) => {
  const notification = event.detail;
  
  if (notification.type === 'interview_reminder_15m') {
    // عرض إشعار فوري
    showNotification(notification.title, {
      body: notification.message,
      icon: '/icon.png',
      actions: [
        { action: 'join', title: 'انضم الآن' }
      ]
    });
  }
});
```

## 🎯 نصائح سريعة

### ✅ افعل
- راقب logs بانتظام
- اختبر على بيئة staging أولاً
- تحقق من المواعيد القادمة يومياً
- استخدم Pusher للإشعارات الفورية

### ❌ لا تفعل
- لا تعطل Cron Job في الإنتاج
- لا تنسى تحديث FRONTEND_URL
- لا تتجاهل الأخطاء في logs
- لا تختبر على بيانات حقيقية

## 📚 المراجع السريعة

- 📄 التوثيق الكامل: `docs/VIDEO_INTERVIEW_REMINDERS.md`
- 📄 الخدمة: `backend/src/services/appointmentReminderService.js`
- 📄 Cron Job: `backend/src/jobs/appointmentReminderCron.js`
- 📄 الاختبارات: `backend/tests/appointmentReminders.test.js`

---

**وقت القراءة**: 5 دقائق  
**وقت التنفيذ**: 10 دقائق  
**مستوى الصعوبة**: سهل ⭐⭐
