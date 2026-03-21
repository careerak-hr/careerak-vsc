# توثيق API - نظام الحجز والمواعيد

**تاريخ الإنشاء**: 2026-03-21  
**الحالة**: ✅ مكتمل  
**Base URL**: `/api`  
**المصادقة**: جميع الـ endpoints تتطلب `Authorization: Bearer <token>` ما لم يُذكر خلاف ذلك.

---

## 📋 فهرس المحتويات

1. [Appointments API](#1-appointments-api)
2. [Availability API](#2-availability-api)
3. [Reminders API](#3-reminders-api)
4. [Google Calendar Integration API](#4-google-calendar-integration-api)
5. [نماذج البيانات](#5-نماذج-البيانات)
6. [رموز الأخطاء](#6-رموز-الأخطاء)

---

## 1. Appointments API

**Base path**: `/api/appointments`

### 1.1 إنشاء موعد جديد

```
POST /api/appointments
```

**الوصف**: جدولة موعد مقابلة جديد مع منع الحجز المزدوج تلقائياً.

**Request Body**:
```json
{
  "type": "video_interview | phone_call | in_person",
  "title": "مقابلة وظيفة مطور",
  "description": "وصف اختياري",
  "participants": ["userId1", "userId2"],
  "scheduledAt": "2026-04-01T10:00:00.000Z",
  "duration": 60,
  "location": "مبنى الشركة - الطابق 3",
  "jobApplicationId": "applicationId",
  "notes": "ملاحظات اختيارية",
  "videoInterviewSettings": {}
}
```

**Response 201**:
```json
{
  "success": true,
  "message": "تم جدولة الموعد بنجاح وإرسال التأكيد للطرفين",
  "appointment": {
    "id": "appointmentId",
    "title": "مقابلة وظيفة مطور",
    "type": "video_interview",
    "status": "scheduled",
    "scheduledAt": "2026-04-01T10:00:00.000Z",
    "endsAt": "2026-04-01T11:00:00.000Z",
    "duration": 60,
    "meetingLink": "https://app.com/video-interview/roomId",
    "location": null,
    "organizer": { "id": "...", "firstName": "...", "lastName": "..." },
    "participants": [],
    "createdAt": "2026-03-21T..."
  }
}
```

**Response 409** (حجز مزدوج):
```json
{
  "success": false,
  "message": "يوجد موعد آخر في نفس الوقت - الحجز المزدوج غير مسموح",
  "code": "DOUBLE_BOOKING",
  "conflictingAppointmentId": "...",
  "conflictingScheduledAt": "..."
}
```

---

### 1.2 جلب قائمة المواعيد

```
GET /api/appointments
```

**Query Parameters**:

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `role` | string | `company` لعرض لوحة تحكم الشركة مع إحصائيات |
| `status` | string | `scheduled \| confirmed \| completed \| cancelled` |
| `type` | string | `video_interview \| phone_call \| in_person` |
| `upcoming` | boolean | `true` لجلب المواعيد القادمة فقط |
| `search` | string | بحث باسم المرشح أو عنوان الموعد |
| `startDate` | ISO date | بداية نطاق التاريخ |
| `endDate` | ISO date | نهاية نطاق التاريخ |
| `page` | number | رقم الصفحة (افتراضي: 1) |
| `limit` | number | عدد النتائج (افتراضي: 20) |

**Response 200** (للباحثين):
```json
{
  "success": true,
  "appointments": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

**Response 200** (للشركات - `role=company`):
```json
{
  "success": true,
  "appointments": [...],
  "pagination": { "total": 50, "page": 1, "limit": 20, "pages": 3 },
  "stats": {
    "total": 50,
    "upcoming": 10,
    "completed": 35,
    "cancelled": 5,
    "attendanceRate": 70
  }
}
```

---

### 1.3 جلب تفاصيل موعد

```
GET /api/appointments/:id
```

**Response 200**:
```json
{
  "success": true,
  "appointment": {
    "_id": "...",
    "title": "...",
    "type": "video_interview",
    "status": "confirmed",
    "scheduledAt": "...",
    "endsAt": "...",
    "duration": 60,
    "meetingLink": "...",
    "location": null,
    "organizerId": { "firstName": "...", "companyName": "..." },
    "participants": [{ "userId": {...}, "status": "accepted" }],
    "jobApplicationId": { "jobTitle": "...", "jobId": {...} }
  },
  "canJoin": false
}
```

**Response 403**: المستخدم ليس منظماً أو مشاركاً في الموعد.

---

### 1.4 الرد على موعد (قبول / رفض)

```
PUT /api/appointments/:id/respond
```

**Request Body**:
```json
{ "status": "accepted | declined | tentative" }
```

**Response 200**:
```json
{
  "success": true,
  "message": "تم تحديث حالة المشاركة بنجاح",
  "appointment": { "id": "...", "status": "confirmed" }
}
```

---

### 1.5 تأكيد موعد

```
PUT /api/appointments/:id/confirm
```

**الصلاحية**: المنظم فقط.

**Response 200**:
```json
{ "success": true, "message": "تم تأكيد الموعد بنجاح", "appointment": { "id": "...", "status": "confirmed" } }
```

---

### 1.6 إعادة جدولة موعد

```
PUT /api/appointments/:id/reschedule
POST /api/appointments/:id/reschedule
```

**القيد**: يُرفض إذا كان الموعد أقل من 24 ساعة.

**Request Body**:
```json
{
  "newDateTime": "2026-04-05T14:00:00.000Z",
  "reason": "سبب اختياري"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "تم إعادة جدولة الموعد بنجاح",
  "appointment": {
    "id": "newAppointmentId",
    "scheduledAt": "2026-04-05T14:00:00.000Z",
    "status": "scheduled"
  },
  "previousAppointmentId": "oldAppointmentId"
}
```

**Response 400** (أقل من 24 ساعة):
```json
{
  "success": false,
  "code": "TOO_LATE_TO_RESCHEDULE",
  "message": "لا يمكن إعادة الجدولة قبل أقل من 24 ساعة من الموعد",
  "hoursRemaining": 5.2
}
```

---

### 1.7 إلغاء موعد

```
DELETE /api/appointments/:id
```

**القيد**: يُرفض إذا كان الموعد أقل من ساعة واحدة.

**Request Body** (اختياري):
```json
{ "reason": "سبب الإلغاء" }
```

**Response 200**:
```json
{
  "success": true,
  "message": "تم إلغاء الموعد بنجاح وإشعار الطرف الآخر",
  "appointment": { "id": "...", "status": "cancelled", "cancellationReason": "..." }
}
```

**Response 400** (أقل من ساعة):
```json
{
  "success": false,
  "code": "TOO_LATE_TO_CANCEL",
  "message": "لا يمكن إلغاء الموعد قبل أقل من ساعة",
  "minutesRemaining": 45
}
```

---

### 1.8 سجل تاريخ الموعد

```
GET /api/appointments/:id/history
```

**الوصف**: يُرجع سجل جميع عمليات الإلغاء والتعديل على الموعد. السجل محمي ولا يمكن حذفه.

**Response 200**:
```json
{
  "success": true,
  "appointmentId": "...",
  "history": [
    {
      "_id": "...",
      "operationType": "rescheduled",
      "oldScheduledAt": "2026-04-01T10:00:00.000Z",
      "newScheduledAt": "2026-04-05T14:00:00.000Z",
      "reason": "تعارض في الجدول",
      "performedBy": { "firstName": "...", "email": "..." },
      "createdAt": "..."
    }
  ],
  "total": 1
}
```

---

### 1.9 إحصائيات المواعيد

```
GET /api/appointments/stats
```

**Query Parameters**:

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `startDate` | ISO date | بداية نطاق التاريخ (اختياري) |
| `endDate` | ISO date | نهاية نطاق التاريخ (اختياري) |
| `companyId` | string | للأدمن فقط - إحصائيات شركة محددة |

**Response 200**:
```json
{
  "success": true,
  "stats": {
    "total": 100,
    "byStatus": {
      "scheduled": 10,
      "confirmed": 15,
      "completed": 65,
      "cancelled": 10
    },
    "attendanceRate": 65,
    "cancellationRate": 10
  },
  "filters": { "startDate": null, "endDate": null }
}
```

---

### 1.10 تصدير بيانات المقابلات

```
POST /api/appointments/export
```

**Request Body**:
```json
{
  "format": "excel | csv | pdf",
  "filters": {
    "status": "completed",
    "type": "video_interview",
    "dateRange": {
      "start": "2026-01-01",
      "end": "2026-03-31"
    }
  }
}
```

**Response 200**:
```json
{
  "success": true,
  "downloadUrl": "https://...",
  "expiresAt": "2026-03-22T...",
  "filename": "appointments_export.xlsx",
  "size": 45678
}
```

---

### 1.11 ملاحظات الموعد

#### إضافة ملاحظة
```
POST /api/appointments/:id/notes
```
```json
{ "content": "نص الملاحظة", "noteType": "pre_interview | post_interview" }
```

#### جلب الملاحظات
```
GET /api/appointments/:id/notes
```

---

### 1.12 تقييم الموعد

#### إضافة تقييم (بعد اكتمال الموعد فقط)
```
POST /api/appointments/:id/rating
```
```json
{ "score": 4, "comment": "تعليق اختياري" }
```

#### جلب التقييم
```
GET /api/appointments/:id/rating
```

---

### 1.13 الملاحظات الشخصية (للباحثين فقط)

```
POST   /api/appointments/:id/personal-notes
GET    /api/appointments/:id/personal-notes
PUT    /api/appointments/:id/personal-notes/:noteId
DELETE /api/appointments/:id/personal-notes/:noteId
```

**ملاحظة**: الملاحظات الشخصية خاصة بالباحث ولا تظهر للشركة.

---

### 1.14 معلومات الشركة المرتبطة بالموعد

```
GET /api/appointments/:id/company-info
```

**Response 200**:
```json
{
  "success": true,
  "company": {
    "name": "...",
    "logo": "...",
    "description": "...",
    "location": "...",
    "website": "https://..."
  }
}
```

---

### 1.15 مستندات الموعد

```
POST   /api/appointments/:id/documents   (multipart/form-data, field: file)
GET    /api/appointments/:id/documents
DELETE /api/appointments/:id/documents/:docId
```

---

## 2. Availability API

**Base path**: `/api/availability`

### 2.1 تحديد الأوقات المتاحة

```
POST /api/availability
```

**الصلاحية**: الشركات فقط (يتطلب مصادقة).

**Request Body**:
```json
{
  "workingDays": [1, 2, 3, 4, 0],
  "workingHours": { "start": "09:00", "end": "17:00" },
  "slotDuration": 60,
  "maxConcurrent": 1,
  "timezone": "Asia/Riyadh"
}
```

**قيم `slotDuration` المقبولة**: `15, 30, 45, 60, 90, 120` (دقيقة)

**Response 200**:
```json
{ "success": true, "data": { ...availabilityObject } }
```

---

### 2.2 تحديث مدة المقابلة فقط

```
PATCH /api/availability/duration
```

**Request Body**:
```json
{ "slotDuration": 30 }
```

---

### 2.3 تعديل الجدول

```
PUT /api/availability/:id
```

نفس body الـ `POST /api/availability`.

---

### 2.4 جلب جدول شركة

```
GET /api/availability/company/:id
```

**الصلاحية**: عام (لا يتطلب مصادقة).

**Response 200**:
```json
{
  "success": true,
  "data": {
    "workingDays": [1, 2, 3, 4, 0],
    "workingHours": { "start": "09:00", "end": "17:00" },
    "slotDuration": 60,
    "maxConcurrent": 1,
    "exceptions": []
  }
}
```

---

### 2.5 جلب الفترات المتاحة

```
GET /api/availability/slots?companyId=...&date=...
```

**الصلاحية**: عام (لا يتطلب مصادقة).

**Query Parameters**:

| المعامل | النوع | الوصف |
|---------|-------|-------|
| `companyId` | string | **مطلوب** - معرف الشركة |
| `date` | ISO date | **مطلوب** - التاريخ المطلوب |

**Response 200**:
```json
{
  "success": true,
  "data": [
    { "start": "09:00", "end": "10:00", "available": true },
    { "start": "10:00", "end": "11:00", "available": false },
    { "start": "11:00", "end": "12:00", "available": true }
  ]
}
```

---

### 2.6 إضافة استثناء (إجازة / وقت غير متاح)

```
POST /api/availability/exceptions
```

**Request Body**:
```json
{
  "date": "2026-04-10",
  "reason": "إجازة رسمية"
}
```

---

### 2.7 حذف استثناء

```
DELETE /api/availability/exceptions?date=2026-04-10
```

---

## 3. Reminders API

**Base path**: `/api/reminders`  
**الصلاحية**: جميع الـ endpoints تتطلب مصادقة.

### 3.1 إنشاء تذكير

```
POST /api/reminders
```

**ملاحظة**: التذكيرات تُنشأ تلقائياً (24h و 1h) عند إنشاء الموعد. هذا الـ endpoint للتذكيرات المخصصة.

**Request Body**:
```json
{
  "appointmentId": "...",
  "minutesBefore": 120,
  "channels": ["notification", "email"]
}
```

---

### 3.2 جلب التذكيرات

```
GET /api/reminders
```

**Response 200**:
```json
{
  "success": true,
  "reminders": [
    {
      "_id": "...",
      "appointmentId": "...",
      "minutesBefore": 1440,
      "channels": ["notification", "email"],
      "sent": false,
      "scheduledFor": "2026-03-31T10:00:00.000Z"
    }
  ]
}
```

---

### 3.3 تحديث تذكير (تخصيص الأوقات)

```
PUT /api/reminders/:id
```

**Request Body**:
```json
{
  "customReminders": [30, 60, 120, 1440],
  "channels": ["notification", "email", "sms"]
}
```

---

### 3.4 حذف تذكير

```
DELETE /api/reminders/:id
```

**Response 200**:
```json
{ "success": true, "message": "تم حذف التذكير بنجاح" }
```

---

## 4. Google Calendar Integration API

**Base path**: `/api/google-calendar`  
**الصلاحية**: جميع الـ endpoints تتطلب مصادقة ما عدا `/callback`.

### 4.1 الحصول على رابط OAuth

```
GET /api/google-calendar/auth
```

**Rate Limit**: 10 طلبات كل 15 دقيقة.

**Response 200**:
```json
{ "success": true, "authUrl": "https://accounts.google.com/o/oauth2/auth?..." }
```

---

### 4.2 معالجة OAuth Callback

```
GET /api/google-calendar/callback?code=...&state=...
```

**الصلاحية**: لا يتطلب مصادقة (Google يعيد التوجيه هنا).

**الوصف**: يُعالج رمز التفويض من Google ويحفظ التوكن.

---

### 4.3 مزامنة يدوية

```
POST /api/google-calendar/sync
```

**الوصف**: مزامنة ثنائية الاتجاه بين المواعيد وGoogle Calendar.

**Response 200**:
```json
{ "success": true, "message": "تمت المزامنة بنجاح", "synced": 5 }
```

---

### 4.4 حالة التكامل

```
GET /api/google-calendar/status
```

**Response 200**:
```json
{
  "success": true,
  "connected": true,
  "email": "user@gmail.com",
  "lastSync": "2026-03-21T..."
}
```

---

### 4.5 إلغاء الربط

```
DELETE /api/google-calendar/disconnect
```

**Response 200**:
```json
{ "success": true, "message": "تم إلغاء ربط Google Calendar بنجاح" }
```

---

## 5. نماذج البيانات

### Appointment

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `_id` | ObjectId | المعرف الفريد |
| `type` | enum | `video_interview \| phone_call \| in_person` |
| `title` | string | عنوان الموعد |
| `description` | string | وصف اختياري |
| `organizerId` | ObjectId | معرف المنظم (الشركة) |
| `participants` | array | قائمة المشاركين مع حالة كل منهم |
| `scheduledAt` | Date | وقت بداية الموعد |
| `endsAt` | Date | وقت نهاية الموعد (محسوب تلقائياً) |
| `duration` | number | المدة بالدقائق (افتراضي: 60) |
| `status` | enum | `scheduled \| confirmed \| in_progress \| completed \| cancelled` |
| `meetingLink` | string | رابط الاجتماع (للمقابلات الافتراضية) |
| `interviewType` | enum | `in-person \| virtual \| phone` |
| `location` | string | موقع المقابلة الحضورية |
| `jobApplicationId` | ObjectId | ربط بطلب التوظيف |
| `cancellationReason` | string | سبب الإلغاء |
| `rescheduleHistory` | array | سجل إعادة الجدولة |

### Availability

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `companyId` | ObjectId | معرف الشركة |
| `workingDays` | number[] | أيام العمل (0=أحد، 1=اثنين، ...) |
| `workingHours` | object | `{ start: "HH:MM", end: "HH:MM" }` |
| `slotDuration` | number | مدة كل فترة بالدقائق |
| `maxConcurrent` | number | عدد المقابلات المتزامنة |
| `exceptions` | array | أيام الاستثناء (إجازات) |
| `timezone` | string | المنطقة الزمنية |

### Reminder

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `appointmentId` | ObjectId | معرف الموعد |
| `userId` | ObjectId | معرف المستخدم |
| `minutesBefore` | number | الوقت قبل الموعد بالدقائق |
| `customReminders` | number[] | أوقات تذكير مخصصة (بالدقائق) |
| `channels` | string[] | `notification \| email \| sms` |
| `sent` | boolean | هل تم الإرسال |
| `scheduledFor` | Date | وقت إرسال التذكير |

### AppointmentHistory

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `appointmentId` | ObjectId | معرف الموعد |
| `operationType` | enum | `cancelled \| rescheduled` |
| `oldScheduledAt` | Date | الوقت القديم |
| `newScheduledAt` | Date | الوقت الجديد (عند إعادة الجدولة) |
| `reason` | string | السبب (اختياري) |
| `performedBy` | ObjectId | معرف المستخدم الذي أجرى العملية |
| `createdAt` | Date | تاريخ العملية |

### CalendarIntegration

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `userId` | ObjectId | معرف المستخدم |
| `provider` | string | `google` |
| `accessToken` | string | توكن الوصول (مشفر) |
| `refreshToken` | string | توكن التجديد (مشفر) |
| `email` | string | بريد حساب Google |
| `lastSync` | Date | آخر مزامنة |
| `isActive` | boolean | حالة التكامل |

---

## 6. رموز الأخطاء

| الرمز | HTTP | الوصف |
|-------|------|-------|
| `DOUBLE_BOOKING` | 409 | يوجد موعد آخر في نفس الوقت |
| `TOO_LATE_TO_CANCEL` | 400 | لا يمكن الإلغاء قبل أقل من ساعة |
| `TOO_LATE_TO_RESCHEDULE` | 400 | لا يمكن إعادة الجدولة قبل أقل من 24 ساعة |
| `APPOINTMENT_NOT_FOUND` | 404 | الموعد غير موجود |
| `FORBIDDEN` | 403 | ليس لديك صلاحية الوصول |
| `MISSING_NEW_DATE_TIME` | 400 | يجب تحديد الوقت الجديد |
| `INTERNAL_ERROR` | 500 | خطأ داخلي في الخادم |

---

## 7. ملاحظات عامة

- **منع الحجز المزدوج**: يتم التحقق تلقائياً عند إنشاء أي موعد.
- **التذكيرات التلقائية**: تُنشأ تلقائياً (24h و 1h) عند إنشاء كل موعد.
- **Google Calendar**: الأحداث تُنشأ/تُحدَّث/تُحذف تلقائياً (non-blocking) عند أي تغيير في الموعد.
- **رابط Meet**: يُولَّد تلقائياً للمقابلات الافتراضية عبر Google Calendar API.
- **Rate Limiting**: مطبق على OAuth endpoints (10 طلبات / 15 دقيقة).
- **Audit Log**: جميع عمليات الإلغاء والتعديل تُسجَّل في `AppointmentHistory` ولا يمكن حذفها.

---

**تاريخ الإنشاء**: 2026-03-21  
**آخر تحديث**: 2026-03-21
