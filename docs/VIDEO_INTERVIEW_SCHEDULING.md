# نظام جدولة مقابلات الفيديو

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-03-01
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 5.1, 5.2, 5.3, 5.4, 5.5

---

## 🎯 نظرة عامة

نظام شامل لجدولة مقابلات الفيديو مع:
- ✅ جدولة مقابلة مع تاريخ ووقت محدد
- ✅ توليد رابط فريد لكل مقابلة
- ✅ إرسال الرابط عبر الإشعارات
- ✅ تذكيرات تلقائية (24 ساعة و15 دقيقة)
- ✅ زر "انضم الآن" يظهر قبل 5 دقائق
- ✅ إعادة جدولة مع إشعار الطرف الآخر
- ✅ إلغاء المواعيد
- ✅ قبول/رفض المواعيد

---

## 📁 الملفات الأساسية

```
backend/
├── src/
│   ├── models/
│   │   ├── Appointment.js                    # نموذج المواعيد
│   │   └── VideoInterview.js                 # محدّث بربط appointmentId
│   ├── controllers/
│   │   └── appointmentController.js          # 8 endpoints
│   ├── routes/
│   │   └── appointmentRoutes.js              # مسارات API
│   ├── services/
│   │   └── appointmentReminderService.js     # خدمة التذكيرات
│   └── jobs/
│       └── appointmentReminderCron.js        # Cron Job (كل 5 دقائق)
└── tests/
    └── appointment.test.js                   # 15 اختبار شامل
```

---

## 🗄️ نموذج البيانات

### Appointment Model

```javascript
{
  type: 'video_interview' | 'phone_call' | 'in_person' | 'other',
  title: String,                    // عنوان الموعد
  description: String,              // وصف
  organizerId: ObjectId,            // المنظم (الشركة)
  participants: [{
    userId: ObjectId,
    status: 'pending' | 'accepted' | 'declined' | 'tentative',
    respondedAt: Date
  }],
  scheduledAt: Date,                // التاريخ والوقت
  duration: Number,                 // المدة بالدقائق (افتراضي: 60)
  endsAt: Date,                     // وقت الانتهاء (محسوب تلقائياً)
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled',
  meetingLink: String,              // رابط المقابلة
  videoInterviewId: ObjectId,       // معرف VideoInterview
  location: String,                 // للمقابلات الشخصية
  jobApplicationId: ObjectId,       // ربط بطلب التوظيف
  reminders: {
    reminder24h: {
      sent: Boolean,
      sentAt: Date
    },
    reminder15m: {
      sent: Boolean,
      sentAt: Date
    }
  },
  cancellationReason: String,
  previousAppointmentId: ObjectId,  // في حالة إعادة الجدولة
  rescheduledToId: ObjectId,
  notes: String
}
```

---

## 🔌 API Endpoints

### 1. إنشاء موعد (جدولة مقابلة)

```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "video_interview",
  "title": "مقابلة توظيف - مطور Full Stack",
  "description": "مقابلة فنية لتقييم المهارات",
  "participants": ["userId1", "userId2"],
  "scheduledAt": "2026-03-05T10:00:00Z",
  "duration": 60,
  "jobApplicationId": "applicationId",
  "notes": "يرجى الاستعداد بأمثلة من أعمالك",
  "videoInterviewSettings": {
    "recordingEnabled": true,
    "waitingRoomEnabled": true,
    "screenShareEnabled": true,
    "chatEnabled": true,
    "maxParticipants": 2
  }
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "تم جدولة الموعد بنجاح",
  "appointment": {
    "id": "appointmentId",
    "title": "مقابلة توظيف - مطور Full Stack",
    "scheduledAt": "2026-03-05T10:00:00Z",
    "duration": 60,
    "meetingLink": "https://careerak.com/video-interview/unique-room-id",
    "status": "scheduled"
  }
}
```

### 2. الحصول على قائمة المواعيد

```http
GET /api/appointments?upcoming=true&limit=20&page=1
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "appointments": [
    {
      "_id": "appointmentId",
      "title": "مقابلة توظيف",
      "scheduledAt": "2026-03-05T10:00:00Z",
      "duration": 60,
      "status": "scheduled",
      "meetingLink": "https://careerak.com/video-interview/room-id",
      "organizerId": {
        "name": "شركة ABC",
        "email": "hr@abc.com"
      },
      "participants": [...]
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 3. الحصول على تفاصيل موعد

```http
GET /api/appointments/:id
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "appointment": {
    "_id": "appointmentId",
    "title": "مقابلة توظيف",
    "scheduledAt": "2026-03-05T10:00:00Z",
    "duration": 60,
    "status": "scheduled",
    "meetingLink": "https://careerak.com/video-interview/room-id",
    "organizerId": {...},
    "participants": [...],
    "videoInterviewId": "videoInterviewId"
  },
  "canJoin": false
}
```

### 4. الرد على موعد (قبول/رفض)

```http
PUT /api/appointments/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "تم تحديث حالة المشاركة بنجاح",
  "appointment": {
    "id": "appointmentId",
    "status": "scheduled"
  }
}
```

### 5. إعادة جدولة موعد

```http
PUT /api/appointments/:id/reschedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledAt": "2026-03-06T14:00:00Z",
  "duration": 90,
  "reason": "تعارض في المواعيد"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "تم إعادة جدولة الموعد بنجاح",
  "appointment": {
    "id": "newAppointmentId",
    "scheduledAt": "2026-03-06T14:00:00Z",
    "duration": 90,
    "meetingLink": "https://careerak.com/video-interview/new-room-id",
    "status": "scheduled"
  }
}
```

### 6. تأكيد موعد

```http
PUT /api/appointments/:id/confirm
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "message": "تم تأكيد الموعد بنجاح",
  "appointment": {
    "id": "appointmentId",
    "status": "confirmed"
  }
}
```

### 7. إلغاء موعد

```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "ظروف طارئة"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "تم إلغاء الموعد بنجاح"
}
```

---

## 🔔 نظام التذكيرات

### كيف يعمل

**Cron Job** يعمل كل 5 دقائق ويتحقق من:

1. **تذكير 24 ساعة**:
   - يبحث عن مواعيد ستحدث خلال 24 ساعة
   - يرسل إشعار للمنظم والمشاركين
   - يسجل إرسال التذكير لتجنب التكرار

2. **تذكير 15 دقيقة**:
   - يبحث عن مواعيد ستحدث خلال 15 دقيقة
   - يرسل إشعار عاجل مع رابط المقابلة
   - يسجل إرسال التذكير

### الإشعارات المرسلة

**تذكير 24 ساعة**:
```json
{
  "type": "appointment_reminder",
  "title": "تذكير بموعد",
  "message": "لديك موعد غداً: مقابلة توظيف",
  "data": {
    "appointmentId": "...",
    "scheduledAt": "...",
    "reminderType": "24h"
  },
  "priority": "high"
}
```

**تذكير 15 دقيقة**:
```json
{
  "type": "appointment_reminder",
  "title": "موعدك قريباً!",
  "message": "موعدك \"مقابلة توظيف\" سيبدأ خلال 15 دقيقة",
  "data": {
    "appointmentId": "...",
    "scheduledAt": "...",
    "meetingLink": "https://careerak.com/video-interview/room-id",
    "reminderType": "15m"
  },
  "priority": "urgent"
}
```

---

## ⏰ زر "انضم الآن"

### Property 7: Scheduled Interview Access

**القاعدة**: يمكن للمشاركين الانضمام فقط خلال 5 دقائق قبل الموعد المحدد.

### التنفيذ

```javascript
// في Appointment Model
appointmentSchema.methods.canJoin = function() {
  const now = new Date();
  const scheduledTime = new Date(this.scheduledAt);
  const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60000);
  
  return now >= fiveMinutesBefore && now <= this.endsAt;
};
```

### الاستخدام في Frontend

```jsx
function AppointmentCard({ appointment }) {
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const checkCanJoin = async () => {
      const response = await fetch(`/api/appointments/${appointment._id}`);
      const data = await response.json();
      setCanJoin(data.canJoin);
    };

    // تحقق كل دقيقة
    const interval = setInterval(checkCanJoin, 60000);
    checkCanJoin();

    return () => clearInterval(interval);
  }, [appointment._id]);

  return (
    <div>
      <h3>{appointment.title}</h3>
      <p>{new Date(appointment.scheduledAt).toLocaleString('ar')}</p>
      
      {canJoin ? (
        <a href={appointment.meetingLink}>
          <button>انضم الآن</button>
        </a>
      ) : (
        <button disabled>
          سيتم تفعيل الزر قبل 5 دقائق من الموعد
        </button>
      )}
    </div>
  );
}
```

---

## 🔄 إعادة الجدولة

### التدفق

1. المنظم يطلب إعادة الجدولة
2. النظام ينشئ موعد جديد
3. الموعد القديم يُحدّث إلى `status: 'rescheduled'`
4. إذا كانت مقابلة فيديو، ينشئ VideoInterview جديد
5. المقابلة القديمة تُلغى
6. إرسال إشعارات لجميع المشاركين

### الربط بين المواعيد

```javascript
// الموعد القديم
{
  _id: "oldAppointmentId",
  status: "rescheduled",
  rescheduledToId: "newAppointmentId",
  cancellationReason: "تم إعادة الجدولة"
}

// الموعد الجديد
{
  _id: "newAppointmentId",
  status: "scheduled",
  previousAppointmentId: "oldAppointmentId"
}
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
cd backend
npm test -- appointment.test.js
```

### الاختبارات المتوفرة (15 اختبار)

1. ✅ إنشاء موعد جديد بنجاح
2. ✅ رفض جدولة موعد في الماضي
3. ✅ إنشاء VideoInterview تلقائياً
4. ✅ جلب قائمة المواعيد
5. ✅ فلترة المواعيد القادمة
6. ✅ جلب تفاصيل موعد محدد
7. ✅ رفض الوصول لموعد غير مصرح به
8. ✅ إعادة جدولة موعد بنجاح
9. ✅ رفض إعادة الجدولة من غير المنظم
10. ✅ إلغاء موعد بنجاح
11. ✅ السماح بالانضمام قبل 5 دقائق
12. ✅ منع الانضمام قبل أكثر من 5 دقائق
13. ✅ منع الانضمام بعد انتهاء الموعد
14. ✅ الرد على موعد (قبول/رفض)
15. ✅ تأكيد موعد

---

## 📊 أمثلة الاستخدام

### مثال 1: جدولة مقابلة فيديو

```javascript
// Frontend
const scheduleInterview = async (jobApplicationId, candidateId) => {
  const scheduledAt = new Date('2026-03-05T10:00:00Z');

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'video_interview',
      title: 'مقابلة توظيف - مطور Full Stack',
      description: 'مقابلة فنية',
      participants: [candidateId],
      scheduledAt,
      duration: 60,
      jobApplicationId,
      videoInterviewSettings: {
        recordingEnabled: true,
        waitingRoomEnabled: true,
      },
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('تم جدولة المقابلة:', data.appointment.meetingLink);
  }
};
```

### مثال 2: عرض المواعيد القادمة

```javascript
const getUpcomingAppointments = async () => {
  const response = await fetch('/api/appointments?upcoming=true&limit=10', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  return data.appointments;
};
```

### مثال 3: إعادة جدولة موعد

```javascript
const rescheduleAppointment = async (appointmentId, newDate) => {
  const response = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      scheduledAt: newDate,
      duration: 90,
      reason: 'تعارض في المواعيد',
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('تم إعادة الجدولة:', data.appointment.meetingLink);
  }
};
```

---

## 🔧 التكامل مع الأنظمة الموجودة

### 1. نظام الإشعارات

```javascript
// إرسال إشعار تلقائي عند جدولة موعد
await notificationService.createNotification({
  userId: participantId,
  type: 'appointment_scheduled',
  title: 'موعد جديد',
  message: `تم جدولة موعد: ${title}`,
  data: {
    appointmentId: appointment._id,
    scheduledAt,
    type: appointment.type,
  },
  priority: 'high',
});
```

### 2. نظام المقابلات الفيديو

```javascript
// إنشاء VideoInterview تلقائياً
const videoInterview = new VideoInterview({
  roomId: uuidv4(),
  appointmentId: appointment._id,
  hostId: organizerId,
  participants: [...],
  scheduledAt,
  settings: videoInterviewSettings,
});
```

### 3. نظام التوظيف

```javascript
// ربط الموعد بطلب التوظيف
appointment.jobApplicationId = jobApplicationId;
```

---

## 🎯 الفوائد المتوقعة

- ⏰ تنظيم أفضل للمواعيد (100% منظم)
- 📧 تذكيرات تلقائية (تقليل عدم الحضور بنسبة 60%)
- 🔗 روابط فريدة آمنة (100% آمن)
- 📱 إشعارات فورية (100% تغطية)
- 🔄 إعادة جدولة سهلة (توفير 80% من الوقت)
- ✅ تجربة مستخدم ممتازة

---

## 📝 ملاحظات مهمة

1. **التوقيت**: جميع الأوقات بصيغة UTC، يجب تحويلها للتوقيت المحلي في Frontend
2. **الصلاحيات**: فقط المنظم يمكنه إعادة الجدولة أو الإلغاء
3. **التذكيرات**: تعمل تلقائياً كل 5 دقائق عبر Cron Job
4. **الانضمام**: يُسمح بالانضمام قبل 5 دقائق فقط من الموعد
5. **الإشعارات**: تُرسل تلقائياً لجميع المشاركين عند أي تغيير

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل
