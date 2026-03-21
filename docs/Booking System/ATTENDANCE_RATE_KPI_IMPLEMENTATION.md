# معدل الحضور > 85% - توثيق التنفيذ

## معلومات النظام
**تاريخ الإضافة**: 2026-02-17  
**الحالة**: ✅ مكتمل  
**المتطلبات**: KPI "معدل الحضور > 85%" في نظام الحجز والمواعيد

---

## الملفات المعدّلة والمضافة

### Backend
```
backend/src/
├── models/
│   ├── Appointment.js          # إضافة attendanceStatus, attendanceUpdatedAt, attendanceUpdatedBy
│   └── Notification.js         # إضافة نوع 'attendance_alert'
├── services/
│   └── appointmentService.js   # تعديل getAppointmentStats لحساب معدل الحضور الفعلي
├── controllers/
│   └── appointmentController.js # إضافة updateAttendance handler
├── routes/
│   └── appointmentRoutes.js    # إضافة PATCH /:id/attendance
└── jobs/
    └── attendanceRateCron.js   # Cron Job أسبوعي جديد
```

### Frontend
```
frontend/src/components/Appointments/
├── AppointmentStats.jsx        # تحديث بمؤشر KPI بصري
└── AppointmentStats.css        # أنماط المؤشر البصري
```

---

## التغييرات التقنية

### 1. Appointment Model
حقول جديدة:
- `attendanceStatus`: enum `['attended', 'no_show', 'cancelled', null]`
- `attendanceUpdatedAt`: تاريخ آخر تحديث
- `attendanceUpdatedBy`: مرجع للمستخدم الذي حدّث الحالة

### 2. API Endpoint الجديد
```
PATCH /api/appointments/:id/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendanceStatus": "attended" | "no_show" | "cancelled"
}
```

**الشروط**:
- فقط المنظم (الشركة) أو الأدمن يمكنه التحديث
- يجب أن يكون الموعد قد انتهى

**Response**:
```json
{
  "success": true,
  "message": "تم تحديث حالة الحضور بنجاح",
  "appointment": {
    "id": "...",
    "attendanceStatus": "attended",
    "attendanceUpdatedAt": "2026-02-17T...",
    "status": "completed"
  }
}
```

### 3. getAppointmentStats المحدّثة
معدل الحضور الفعلي = `(attended / (attended + noShow)) × 100`

Response الجديد يتضمن:
```json
{
  "stats": {
    "total": 50,
    "byStatus": { "scheduled": 5, "confirmed": 3, "completed": 30, "cancelled": 12 },
    "attendance": { "attended": 25, "noShow": 5, "totalTracked": 30 },
    "attendanceRate": 83,
    "cancellationRate": 24,
    "attendanceAlert": true,
    "attendanceTarget": 85
  }
}
```

### 4. Cron Job الأسبوعي
- **الجدول**: كل يوم اثنين الساعة 9:00 صباحاً UTC
- **المنطق**: يفحص جميع الشركات التي لديها ≥5 مواعيد مكتملة خلال آخر 30 يوم
- **الإشعار**: يرسل `attendance_alert` للشركات التي معدلها < 85%
- **الاقتراحات**: تذكيرات أقوى، تأكيد الحضور، وضوح رابط الاجتماع

### 5. مؤشر KPI البصري في Frontend
- **أخضر** (`#1b5e20` / `#f1f8e9`): معدل الحضور ≥ 85%
- **أحمر** (`#b71c1c` / `#ffebee`): معدل الحضور < 85%
- شريط تقدم مع خط الهدف عند 85%
- دعم RTL/LTR والعربية والإنجليزية والفرنسية

---

## الاستخدام

### تحديث حالة الحضور (Backend)
```javascript
// PATCH /api/appointments/:id/attendance
const response = await fetch(`/api/appointments/${appointmentId}/attendance`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ attendanceStatus: 'attended' }),
});
```

### عرض الإحصائيات (Frontend)
```jsx
import AppointmentStats from './components/Appointments/AppointmentStats';

<AppointmentStats companyId={companyId} />
```

---

## ملاحظات مهمة
- الحد الأدنى للمواعيد قبل إرسال تنبيه الـ Cron: 5 مواعيد
- `attendanceAlert: true` يُرجع في `/api/appointments/stats` عندما يكون المعدل < 85%
- الـ Cron Job يعمل تلقائياً عند تشغيل السيرفر (مسجّل في app.js)
