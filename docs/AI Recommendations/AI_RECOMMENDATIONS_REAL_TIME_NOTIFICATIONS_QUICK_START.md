# 🚀 دليل البدء السريع: الإشعارات الفورية للتوصيات الذكية

## ⏱️ 5 دقائق للتشغيل

---

## 1️⃣ التحقق من الإعداد (دقيقة واحدة)

### Backend
```bash
# تحقق من Pusher
cat backend/.env | grep PUSHER

# يجب أن ترى:
# PUSHER_APP_ID=...
# PUSHER_KEY=...
# PUSHER_SECRET=...
# PUSHER_CLUSTER=eu
```

### Frontend
```bash
# تحقق من Pusher
cat frontend/.env | grep PUSHER

# يجب أن ترى:
# VITE_PUSHER_KEY=...
# VITE_PUSHER_CLUSTER=eu
```

---

## 2️⃣ اختبار سريع (دقيقتان)

### اختبار 1: إشعار وظيفة جديدة

```bash
# نشر وظيفة جديدة (كشركة)
curl -X POST http://localhost:5000/api/job-postings \
  -H "Authorization: Bearer <company_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "مطور React",
    "description": "نبحث عن مطور React محترف",
    "requirements": "React, JavaScript, Node.js",
    "location": "القاهرة"
  }'

# ✅ النتيجة المتوقعة:
# - المستخدمون المطابقون يتلقون إشعارات فورية
# - الإشعارات تظهر في الوقت الفعلي (< 1 ثانية)
```

### اختبار 2: إشعار مرشح مناسب

```bash
# إشعار الشركة بمرشح مناسب
curl -X POST http://localhost:5000/api/recommendations/notify-candidate-match \
  -H "Authorization: Bearer <company_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "USER_ID_HERE",
    "jobId": "JOB_ID_HERE"
  }'

# ✅ النتيجة المتوقعة:
# {
#   "success": true,
#   "message": "تم إرسال الإشعار بنجاح",
#   "match": {
#     "matchScore": 85,
#     "topReasons": [...]
#   }
# }
```

### اختبار 3: إشعار تحديث التوصيات

```bash
# إشعار بتطابق عالي
curl -X POST http://localhost:5000/api/recommendations/notify-update \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "updateType": "high_match_found",
    "data": {
      "matchScore": 95,
      "jobId": "JOB_ID_HERE"
    }
  }'

# ✅ النتيجة المتوقعة:
# {
#   "success": true,
#   "message": "تم إرسال إشعار التحديث بنجاح"
# }
```

---

## 3️⃣ التكامل مع Frontend (دقيقتان)

### الاستماع للإشعارات

```javascript
// في App.jsx أو index.jsx
import pusherClient from './utils/pusherClient';

useEffect(() => {
  // الاستماع لإشعارات المستخدم
  window.addEventListener('pusher-notification', (event) => {
    const notification = event.detail;
    
    // عرض الإشعار
    if (notification.type === 'job_match') {
      toast.success(
        `${notification.title}\n${notification.message}`,
        {
          onClick: () => navigate(`/jobs/${notification.jobId}`)
        }
      );
    }
  });
}, []);
```

### عرض الإشعارات

```jsx
import { toast } from 'react-toastify';

function NotificationHandler() {
  useEffect(() => {
    window.addEventListener('pusher-notification', (event) => {
      const { type, title, message, jobId, matchScore } = event.detail;
      
      switch (type) {
        case 'job_match':
          toast.success(
            <div>
              <h4>{title}</h4>
              <p>{message}</p>
              <span>تطابق: {matchScore}%</span>
              <button onClick={() => viewJob(jobId)}>
                عرض الوظيفة
              </button>
            </div>,
            { autoClose: 10000 }
          );
          break;
          
        case 'candidate_match':
          toast.info(
            <div>
              <h4>{title}</h4>
              <p>{message}</p>
              <button onClick={() => viewCandidate(event.detail.candidateId)}>
                عرض المرشح
              </button>
            </div>
          );
          break;
      }
    });
  }, []);
  
  return null;
}
```

---

## 4️⃣ الاستخدام التلقائي (صفر دقائق!)

### نشر وظيفة جديدة
```javascript
// في jobPostingController.js
// الإشعارات تُرسل تلقائياً عند نشر وظيفة جديدة!

exports.createJobPosting = async (req, res) => {
  // ... إنشاء الوظيفة
  
  // ✅ الإشعارات تُرسل تلقائياً
  notificationService.notifyMatchingUsersForNewJob(jobPosting._id);
  
  res.status(201).json({ data: jobPosting });
};
```

### تحديث الملف الشخصي
```javascript
// في userController.js
// يمكن إضافة إشعار تحديث التوصيات

exports.updateProfile = async (req, res) => {
  // ... تحديث الملف
  
  // إشعار بتحديث التوصيات
  await notificationService.notifyRecommendationUpdate(
    userId,
    'profile_updated',
    { count: newRecommendations.length }
  );
  
  res.status(200).json({ data: user });
};
```

---

## 5️⃣ استكشاف الأخطاء (دقيقة واحدة)

### المشكلة: "Pusher not initialized"

```bash
# الحل:
cd backend
npm install pusher

# تحقق من .env
echo "PUSHER_APP_ID=your_app_id" >> .env
echo "PUSHER_KEY=your_key" >> .env
echo "PUSHER_SECRET=your_secret" >> .env
echo "PUSHER_CLUSTER=eu" >> .env

# أعد تشغيل السيرفر
npm run pm2:restart
```

### المشكلة: "No matching users found"

```bash
# الحل:
# تأكد من أن المستخدمين لديهم مهارات في ملفاتهم الشخصية
# تحقق من قاعدة البيانات:
mongo
use careerak
db.users.find({ computerSkills: { $exists: true, $ne: [] } }).count()
```

### المشكلة: "Notification not sent"

```bash
# الحل:
# تحقق من تفضيلات الإشعارات
curl http://localhost:5000/api/notifications/preferences \
  -H "Authorization: Bearer <token>"

# تفعيل الإشعارات
curl -X PUT http://localhost:5000/api/notifications/preferences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "job_match": { "enabled": true, "push": true }
    }
  }'
```

---

## ✅ Checklist

- [ ] Pusher مثبت ومُعد في Backend
- [ ] Pusher مُعد في Frontend
- [ ] اختبار إشعار وظيفة جديدة نجح
- [ ] اختبار إشعار مرشح مناسب نجح
- [ ] اختبار إشعار تحديث نجح
- [ ] Frontend يستمع للإشعارات
- [ ] الإشعارات تظهر في الوقت الفعلي

---

## 🎯 الخطوات التالية

1. **تخصيص الإشعارات**: عدّل رسائل الإشعارات حسب احتياجاتك
2. **إضافة أنواع جديدة**: أضف أنواع إشعارات إضافية
3. **تحسين الأداء**: استخدم Redis للتخزين المؤقت
4. **التحليلات**: تتبع معدل فتح الإشعارات
5. **A/B Testing**: اختبر رسائل مختلفة

---

## 📚 المراجع السريعة

- **التوثيق الكامل**: `docs/AI_RECOMMENDATIONS_REAL_TIME_NOTIFICATIONS.md`
- **Pusher Setup**: `docs/PUSHER_SETUP_GUIDE.md`
- **Notification System**: `docs/NOTIFICATION_SYSTEM.md`

---

**تم! 🎉 نظام الإشعارات الفورية جاهز للاستخدام**

**وقت الإعداد الفعلي**: 5 دقائق  
**الفوائد**: إشعارات فورية، تفاعل أعلى، توظيف أسرع
