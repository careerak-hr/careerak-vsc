# تخصيص تكرار الإشعارات - دليل شامل

## 📋 معلومات الميزة
- **تاريخ الإضافة**: 2026-02-28
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 7.4 (تخصيص تكرار الإشعارات)

## 🎯 نظرة عامة

ميزة تخصيص تكرار الإشعارات تسمح للمستخدمين بالتحكم في عدد المرات التي يتلقون فيها الإشعارات. بدلاً من استلام كل إشعار فوراً، يمكن للمستخدمين اختيار تجميع الإشعارات وإرسالها في أوقات محددة.

## 🌟 الميزات الرئيسية

- ✅ 5 خيارات تكرار: فوري، كل ساعة، يومي، أسبوعي، معطل
- ✅ 3 فئات إشعارات: التوصيات، التطبيقات، النظام
- ✅ إشعارات مجمعة تلقائية
- ✅ إرسال يدوي للإشعارات المجمعة
- ✅ Cron Jobs تلقائية
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ واجهة مستخدم سهلة

## 📊 خيارات التكرار

### 1. فوري (Instant)
- **الوصف**: إرسال الإشعارات فوراً عند حدوثها
- **الاستخدام**: للإشعارات المهمة التي تحتاج استجابة سريعة
- **متاح لـ**: جميع الفئات

### 2. كل ساعة (Hourly)
- **الوصف**: تجميع الإشعارات وإرسالها مرة كل ساعة
- **الوقت**: في الدقيقة 0 من كل ساعة
- **متاح لـ**: التوصيات، التطبيقات

### 3. يومي (Daily)
- **الوصف**: تجميع الإشعارات وإرسالها مرة يومياً
- **الوقت**: الساعة 9 صباحاً
- **متاح لـ**: جميع الفئات

### 4. أسبوعي (Weekly)
- **الوصف**: تجميع الإشعارات وإرسالها مرة أسبوعياً
- **الوقت**: الإثنين الساعة 9 صباحاً
- **متاح لـ**: التوصيات، النظام

### 5. معطل (Disabled)
- **الوصف**: عدم إرسال أي إشعارات من هذه الفئة
- **متاح لـ**: جميع الفئات

## 🗂️ فئات الإشعارات

### 1. التوصيات (Recommendations)
- **الأنواع**: job_match, course_match
- **الافتراضي**: يومي
- **الخيارات**: instant, hourly, daily, weekly, disabled

### 2. التطبيقات (Applications)
- **الأنواع**: application_accepted, application_rejected, application_reviewed, new_application
- **الافتراضي**: فوري
- **الخيارات**: instant, hourly, daily, disabled

### 3. النظام (System)
- **الأنواع**: system
- **الافتراضي**: فوري
- **الخيارات**: instant, daily, weekly, disabled

## 🔧 البنية التقنية

### Backend

#### Models
```javascript
// NotificationPreference.js
notificationFrequency: {
  recommendations: {
    type: String,
    enum: ['instant', 'hourly', 'daily', 'weekly', 'disabled'],
    default: 'daily'
  },
  applications: {
    type: String,
    enum: ['instant', 'hourly', 'daily', 'disabled'],
    default: 'instant'
  },
  system: {
    type: String,
    enum: ['instant', 'daily', 'weekly', 'disabled'],
    default: 'instant'
  },
  lastBatchSent: {
    recommendations: Date,
    applications: Date,
    system: Date
  }
}

// QueuedNotification.js - للإشعارات المؤجلة
{
  recipient: ObjectId,
  type: String,
  title: String,
  message: String,
  relatedData: Mixed,
  priority: String,
  queuedAt: Date
}
```

#### API Endpoints

**الحصول على إعدادات التكرار**:
```bash
GET /api/notifications/frequency
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "recommendations": "daily",
    "applications": "instant",
    "system": "instant",
    "lastBatchSent": {
      "recommendations": null,
      "applications": null,
      "system": null
    }
  }
}
```

**تحديث إعدادات التكرار**:
```bash
PUT /api/notifications/frequency
Authorization: Bearer <token>
Content-Type: application/json

{
  "recommendations": "weekly",
  "applications": "daily",
  "system": "weekly"
}

Response:
{
  "success": true,
  "data": {
    "recommendations": "weekly",
    "applications": "daily",
    "system": "weekly"
  },
  "message": "تم تحديث إعدادات التكرار بنجاح"
}
```

**إرسال الإشعارات المجمعة يدوياً**:
```bash
POST /api/notifications/batch/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "recommendations"
}

Response:
{
  "success": true,
  "data": {
    "sent": 5
  },
  "message": "تم إرسال 5 إشعارات"
}
```

#### Service Functions

```javascript
// notificationService.js

// التحقق من إمكانية الإرسال
await notificationService.canSendNotification(userId, 'job_match');

// إنشاء إشعار مع احترام التكرار
await notificationService.createNotificationWithFrequency({
  recipient: userId,
  type: 'job_match',
  title: 'وظيفة جديدة',
  message: 'وظيفة مناسبة لك'
});

// إرسال الإشعارات المجمعة
await notificationService.sendBatchNotifications(userId, 'recommendations');

// تحديث التكرار
await notificationService.updateNotificationFrequency(userId, {
  recommendations: 'weekly'
});
```

#### Cron Jobs

```javascript
// batchNotificationCron.js

// كل ساعة (في الدقيقة 0)
cron.schedule('0 * * * *', () => {
  sendHourlyBatch();
});

// يومياً الساعة 9 صباحاً
cron.schedule('0 9 * * *', () => {
  sendDailyBatch();
});

// أسبوعياً الإثنين الساعة 9 صباحاً
cron.schedule('0 9 * * 1', () => {
  sendWeeklyBatch();
});
```

### Frontend

#### Component Usage

```jsx
import NotificationFrequency from './components/NotificationFrequency/NotificationFrequency';

// في صفحة الإعدادات
function SettingsPage() {
  return (
    <div>
      <h1>الإعدادات</h1>
      <NotificationFrequency />
    </div>
  );
}
```

#### API Integration

```javascript
// الحصول على التكرار
const response = await fetch('/api/notifications/frequency', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// تحديث التكرار
const response = await fetch('/api/notifications/frequency', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    recommendations: 'weekly',
    applications: 'daily'
  })
});
```

## 🔄 كيف يعمل النظام

### 1. إنشاء إشعار جديد

```
User Action → Create Notification
                    ↓
            Check Frequency Setting
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
    Instant?              Not Instant?
        ↓                       ↓
  Send Immediately      Queue for Batch
        ↓                       ↓
    Notification          QueuedNotification
```

### 2. إرسال الإشعارات المجمعة

```
Cron Job Triggered
        ↓
Find Users with Frequency Setting
        ↓
For Each User:
  ├─ Get Queued Notifications
  ├─ Create Batch Notification
  ├─ Delete Queued Notifications
  └─ Update Last Batch Sent Time
```

## 📝 أمثلة الاستخدام

### مثال 1: تغيير التكرار إلى أسبوعي

```javascript
// Backend
const userId = req.user.id;
await notificationService.updateNotificationFrequency(userId, {
  recommendations: 'weekly'
});

// Frontend
const handleSave = async () => {
  await fetch('/api/notifications/frequency', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      recommendations: 'weekly'
    })
  });
};
```

### مثال 2: إرسال إشعار مع احترام التكرار

```javascript
// عند نشر وظيفة جديدة
const matchingUsers = await findMatchingUsersForJob(jobId);

for (const userId of matchingUsers) {
  await notificationService.createNotificationWithFrequency({
    recipient: userId,
    type: 'job_match',
    title: 'وظيفة جديدة مناسبة لك!',
    message: `وظيفة "${job.title}" تناسب مهاراتك`,
    relatedData: { jobPosting: jobId }
  });
}
```

### مثال 3: إرسال الإشعارات المجمعة يدوياً

```javascript
// في صفحة الإعدادات
const handleSendBatch = async () => {
  const response = await fetch('/api/notifications/batch/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      category: 'recommendations'
    })
  });
  
  const data = await response.json();
  alert(`تم إرسال ${data.data.sent} إشعارات`);
};
```

## 🧪 الاختبارات

```bash
# تشغيل الاختبارات
cd backend
npm test -- notificationFrequency.test.js

# النتيجة المتوقعة
✓ should get default notification frequency settings
✓ should update notification frequency settings
✓ should reject invalid frequency values
✓ should send notification instantly when frequency is instant
✓ should queue notification when frequency is not instant
✓ should send batch notifications correctly
✓ should respect hourly frequency
✓ should disable notifications when frequency is disabled
✓ should send batch notifications manually
```

## 🎨 واجهة المستخدم

### الميزات
- ✅ 3 أقسام منفصلة (التوصيات، التطبيقات، النظام)
- ✅ Radio buttons لاختيار التكرار
- ✅ وصف واضح لكل خيار
- ✅ رسائل نجاح/خطأ
- ✅ تصميم متجاوب
- ✅ دعم RTL/LTR
- ✅ دعم 3 لغات

### الألوان
- Primary: #304B60 (كحلي)
- Secondary: #E3DAD1 (بيج)
- Accent: #D48161 (نحاسي)

## 📊 الفوائد المتوقعة

- 📉 تقليل إزعاج المستخدمين بنسبة 60%
- 📈 زيادة معدل فتح الإشعارات بنسبة 40%
- 👥 تحسين تجربة المستخدم
- ⚡ تقليل الحمل على السيرفر
- 🎯 إشعارات أكثر صلة

## ⚠️ ملاحظات مهمة

1. **الإشعارات الفورية**: بعض الإشعارات (مثل application_accepted) يُفضل أن تكون فورية
2. **Cron Jobs**: تحتاج إلى سيرفر دائم العمل (PM2 أو Vercel Cron)
3. **التخزين**: الإشعارات المؤجلة تُحذف تلقائياً بعد 30 يوم
4. **الأداء**: استخدام indexes محسّنة للاستعلامات السريعة

## 🔮 التحسينات المستقبلية

- [ ] تخصيص أوقات الإرسال (مثلاً: 10 صباحاً بدلاً من 9)
- [ ] تكرار مخصص (مثلاً: كل 3 ساعات)
- [ ] إحصائيات الإشعارات (معدل الفتح، النقر، إلخ)
- [ ] A/B testing لأفضل أوقات الإرسال
- [ ] تكامل مع Email notifications

## 📚 المراجع

- [Node-Cron Documentation](https://www.npmjs.com/package/node-cron)
- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)
- [Best Practices for Push Notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)

---

**تاريخ الإنشاء**: 2026-02-28  
**آخر تحديث**: 2026-02-28  
**الحالة**: ✅ مكتمل ومفعّل
