# 🚀 Real-time Recommendation Notifications - Quick Start Guide

## ⚡ البدء السريع (5 دقائق)

### 1. التحقق من المتطلبات

```bash
# تحقق من Pusher credentials
cat backend/.env | grep PUSHER

# يجب أن ترى:
# PUSHER_APP_ID=...
# PUSHER_KEY=...
# PUSHER_SECRET=...
# PUSHER_CLUSTER=eu
```

### 2. اختبار الإشعارات

#### اختبار 1: نشر وظيفة جديدة

```bash
# نشر وظيفة جديدة (تلقائي)
curl -X POST http://localhost:5000/api/job-postings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مطور React",
    "description": "نبحث عن مطور React محترف",
    "requirements": "خبرة 3 سنوات في React",
    "location": "القاهرة",
    "salary": "8000-12000",
    "jobType": "Full-time"
  }'

# النتيجة المتوقعة في السجلات:
# ✅ Sent 15 real-time notifications for job: مطور React
# 📊 Matching users: 15, Average match: 72.3%
```

#### اختبار 2: تسجيل مرشح جديد

```bash
# تسجيل مرشح جديد (تلقائي)
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "password": "Password123!",
    "phone": "01234567890",
    "specialization": "React Developer",
    "role": "Employee",
    "country": "Egypt",
    "city": "Cairo"
  }'

# النتيجة المتوقعة في السجلات:
# ✅ Sent 8 real-time notifications for candidate: أحمد محمد
# 📊 Matching jobs: 8, Average match: 68.5%
```

#### اختبار 3: تحديث الملف الشخصي

```bash
# إشعار عند تحديث الملف (يدوي)
curl -X POST http://localhost:5000/api/recommendations/notify-profile-update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "changes": {
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }'

# النتيجة:
{
  "success": true,
  "message": "تم إرسال الإشعار بنجاح",
  "data": {
    "notified": true,
    "highMatches": 5,
    "topMatchScore": 87.5
  }
}
```

---

## 🔧 الإعدادات السريعة

### تغيير الحد الأدنى لنسبة التطابق

```bash
# الافتراضي: 60%
# لتغييره إلى 70%:

curl -X PUT http://localhost:5000/api/recommendations/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "minMatchScore": 70
  }'
```

### الحصول على الإعدادات الحالية

```bash
curl -X GET http://localhost:5000/api/recommendations/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# النتيجة:
{
  "success": true,
  "data": {
    "minMatchScore": 60,
    "pusherEnabled": true
  }
}
```

---

## 📊 مراقبة الإشعارات

### في السجلات (Logs)

```bash
# مراقبة السجلات في الوقت الفعلي
cd backend
npm run pm2:logs

# أو
tail -f backend/logs/combined.log | grep "Real-time Notifications"
```

### في قاعدة البيانات

```javascript
// MongoDB Shell
use careerak

// عدد الإشعارات اليوم
db.notifications.countDocuments({
  type: { $in: ['job_match', 'candidate_match', 'recommendation_update'] },
  createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
})

// آخر 10 إشعارات
db.notifications.find({
  type: { $in: ['job_match', 'candidate_match'] }
}).sort({ createdAt: -1 }).limit(10)
```

---

## 🐛 استكشاف الأخطاء السريع

### المشكلة: لا يتم إرسال إشعارات

```bash
# 1. تحقق من Pusher
node -e "
const pusherService = require('./backend/src/services/pusherService');
pusherService.initialize();
console.log('Pusher enabled:', pusherService.isEnabled());
"

# 2. تحقق من المستخدمين النشطين
# MongoDB Shell
db.users.countDocuments({ 
  accountStatus: 'Active',
  userType: 'Employee'
})

# 3. تحقق من الوظائف المفتوحة
db.jobpostings.countDocuments({ status: 'Open' })
```

### المشكلة: عدد قليل من الإشعارات

```bash
# خفض الحد الأدنى لنسبة التطابق
curl -X PUT http://localhost:5000/api/recommendations/notification-settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "minMatchScore": 50 }'
```

---

## 📱 اختبار Frontend

### استقبال الإشعارات في Frontend

```javascript
// في Frontend (React)
import pusherClient from '../utils/pusherClient';

useEffect(() => {
  // الاستماع للإشعارات
  window.addEventListener('pusher-notification', (event) => {
    const notification = event.detail;
    
    console.log('Received notification:', notification);
    
    // عرض toast notification
    if (notification.type === 'job_match') {
      toast.success(`وظيفة جديدة: ${notification.jobTitle} (${notification.matchScore}%)`);
    }
  });
}, []);
```

---

## ✅ Checklist

- [ ] Pusher credentials موجودة في `.env`
- [ ] Backend يعمل (`npm run pm2:status`)
- [ ] MongoDB متصل
- [ ] يوجد مستخدمين نشطين (Individuals)
- [ ] يوجد وظائف مفتوحة (Open jobs)
- [ ] تم اختبار نشر وظيفة جديدة
- [ ] تم اختبار تسجيل مرشح جديد
- [ ] الإشعارات تظهر في السجلات
- [ ] الإشعارات تُحفظ في قاعدة البيانات

---

## 🎯 الخطوات التالية

1. **تكامل Frontend** - إضافة UI لعرض الإشعارات
2. **تخصيص الإشعارات** - السماح للمستخدمين بتخصيص التفضيلات
3. **تحليلات** - تتبع معدل فتح الإشعارات
4. **تحسين الأداء** - إضافة caching و queue system

---

## 📚 المراجع السريعة

- [التوثيق الكامل](./REALTIME_NOTIFICATIONS_IMPLEMENTATION.md)
- [Pusher Setup Guide](../../PUSHER_SETUP_GUIDE.md)
- [Notification Service](../../backend/src/services/notificationService.js)

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام
