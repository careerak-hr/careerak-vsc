# نظام غرفة الانتظار - دليل التنفيذ

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-03-01
- **الحالة**: ✅ مكتمل
- **المتطلبات**: Requirements 4.1, 4.2, 4.3

---

## 🎯 نظرة عامة

تم تنفيذ نظام غرفة انتظار منفصلة عن غرفة المقابلة، يسمح للمضيف بالتحكم الكامل في من يدخل المقابلة.

---

## 📁 الملفات المنشأة

### Backend
```
backend/src/
├── models/
│   └── WaitingRoom.js                    # نموذج غرفة الانتظار
├── services/
│   └── waitingRoomService.js             # خدمة إدارة غرفة الانتظار
├── controllers/
│   └── waitingRoomController.js          # معالج طلبات API
└── routes/
    └── waitingRoomRoutes.js              # مسارات API
```

---

## 🔧 الميزات الرئيسية

### 1. إضافة مشاركين لغرفة الانتظار
- ✅ إضافة تلقائية عند محاولة الانضمام للمقابلة
- ✅ رسالة ترحيبية قابلة للتخصيص
- ✅ عرض موقع المشارك في الطابور
- ✅ حساب وقت الانتظار

### 2. قبول/رفض المشاركين
- ✅ المضيف فقط يمكنه قبول أو رفض
- ✅ إشعارات فورية للمشارك عند القبول/الرفض
- ✅ تسجيل من قام بالقبول ومتى

### 3. قائمة المنتظرين
- ✅ عرض جميع المنتظرين للمضيف
- ✅ معلومات كل مشارك (الاسم، الصورة، وقت الانتظار)
- ✅ ترتيب حسب وقت الانضمام

### 4. حالة المشارك
- ✅ المشارك يمكنه معرفة حالته (waiting, admitted, rejected)
- ✅ عرض موقعه في الطابور
- ✅ عرض وقت الانتظار

---

## 📡 API Endpoints

### 1. الانضمام لغرفة الانتظار
```http
POST /api/waiting-room/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "interview-room-123",
  "interviewId": "65f1234567890abcdef12345",
  "welcomeMessage": "مرحباً بك! سيتم قبولك قريباً" // اختياري
}
```

**Response:**
```json
{
  "success": true,
  "waitingRoom": { ... },
  "position": 3,
  "welcomeMessage": "مرحباً بك! سيتم قبولك قريباً"
}
```

---

### 2. قبول مشارك (للمضيف فقط)
```http
POST /api/waiting-room/admit
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "interview-room-123",
  "userId": "65f1234567890abcdef12346"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم قبول المشارك بنجاح",
  "participant": {
    "userId": "65f1234567890abcdef12346",
    "status": "admitted",
    "admittedAt": "2026-03-01T10:30:00.000Z",
    "admittedBy": "65f1234567890abcdef12347"
  }
}
```

---

### 3. رفض مشارك (للمضيف فقط)
```http
POST /api/waiting-room/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "interview-room-123",
  "userId": "65f1234567890abcdef12346",
  "reason": "المقابلة ممتلئة" // اختياري
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم رفض المشارك",
  "participant": {
    "userId": "65f1234567890abcdef12346",
    "status": "rejected",
    "rejectedAt": "2026-03-01T10:30:00.000Z"
  }
}
```

---

### 4. قائمة المنتظرين (للمضيف فقط)
```http
GET /api/waiting-room/interview-room-123/list
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "participants": [
    {
      "userId": {
        "_id": "65f1234567890abcdef12346",
        "name": "أحمد محمد",
        "email": "ahmed@example.com",
        "profilePicture": "https://..."
      },
      "joinedAt": "2026-03-01T10:25:00.000Z",
      "position": 1,
      "waitingTime": 300
    },
    {
      "userId": {
        "_id": "65f1234567890abcdef12348",
        "name": "فاطمة علي",
        "email": "fatima@example.com",
        "profilePicture": "https://..."
      },
      "joinedAt": "2026-03-01T10:27:00.000Z",
      "position": 2,
      "waitingTime": 180
    }
  ],
  "count": 2
}
```

---

### 5. حالة المشارك
```http
GET /api/waiting-room/interview-room-123/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "status": "waiting",
  "inWaitingRoom": true,
  "joinedAt": "2026-03-01T10:25:00.000Z",
  "position": 1,
  "waitingTime": 300,
  "welcomeMessage": "مرحباً بك! سيتم قبولك قريباً"
}
```

---

### 6. المغادرة من غرفة الانتظار
```http
DELETE /api/waiting-room/interview-room-123/leave
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "تم إزالة المشارك من غرفة الانتظار"
}
```

---

### 7. تحديث رسالة الترحيب (للمضيف فقط)
```http
PUT /api/waiting-room/interview-room-123/welcome-message
Authorization: Bearer <token>
Content-Type: application/json

{
  "welcomeMessage": "مرحباً! المقابلة ستبدأ خلال 5 دقائق"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث رسالة الترحيب بنجاح",
  "welcomeMessage": "مرحباً! المقابلة ستبدأ خلال 5 دقائق"
}
```

---

## 🔔 الإشعارات (Pusher)

### إشعارات المضيف
يتم إرسال إشعارات للمضيف عبر Pusher على القناة `private-user-{hostId}`:

**1. مشارك جديد انضم:**
```javascript
{
  type: 'participant_joined_waiting_room',
  userId: '65f1234567890abcdef12346',
  waitingCount: 3,
  roomId: 'interview-room-123',
  timestamp: '2026-03-01T10:25:00.000Z'
}
```

**2. تم قبول مشارك:**
```javascript
{
  type: 'participant_admitted',
  userId: '65f1234567890abcdef12346',
  waitingCount: 2,
  roomId: 'interview-room-123',
  timestamp: '2026-03-01T10:30:00.000Z'
}
```

**3. تم رفض مشارك:**
```javascript
{
  type: 'participant_rejected',
  userId: '65f1234567890abcdef12346',
  waitingCount: 2,
  roomId: 'interview-room-123',
  timestamp: '2026-03-01T10:30:00.000Z'
}
```

---

### إشعارات المشارك
يتم إرسال إشعارات للمشارك عبر Pusher على القناة `private-user-{userId}`:

**1. تم القبول:**
```javascript
{
  type: 'admitted_to_interview',
  roomId: 'interview-room-123',
  interviewId: '65f1234567890abcdef12345',
  timestamp: '2026-03-01T10:30:00.000Z'
}
```

**2. تم الرفض:**
```javascript
{
  type: 'rejected_from_interview',
  roomId: 'interview-room-123',
  reason: 'المقابلة ممتلئة',
  timestamp: '2026-03-01T10:30:00.000Z'
}
```

---

## 🔒 الأمان والصلاحيات

### التحقق من الصلاحيات
- ✅ جميع المسارات محمية بـ `protect` middleware
- ✅ المضيف فقط يمكنه قبول/رفض المشاركين
- ✅ المضيف فقط يمكنه رؤية قائمة المنتظرين
- ✅ المشارك يمكنه رؤية حالته فقط

### التحقق من الهوية
```javascript
// في waitingRoomService.js
const interview = await VideoInterview.findById(interviewId);
if (!interview || interview.hostId.toString() !== hostId.toString()) {
  throw new Error('غير مصرح لك بهذه العملية');
}
```

---

## 📊 نموذج البيانات (WaitingRoom Model)

```javascript
{
  roomId: String,              // معرف الغرفة (فريد)
  interviewId: ObjectId,       // معرف المقابلة
  participants: [{
    userId: ObjectId,          // معرف المستخدم
    joinedAt: Date,            // وقت الانضمام
    status: String,            // waiting | admitted | rejected
    admittedAt: Date,          // وقت القبول
    rejectedAt: Date,          // وقت الرفض
    admittedBy: ObjectId       // من قام بالقبول
  }],
  welcomeMessage: String,      // رسالة الترحيب
  isActive: Boolean,           // هل الغرفة نشطة
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 الاختبار

### اختبار يدوي

**1. انضمام مشارك:**
```bash
curl -X POST http://localhost:5000/api/waiting-room/join \
  -H "Authorization: Bearer <participant_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "test-room-123",
    "interviewId": "65f1234567890abcdef12345"
  }'
```

**2. قبول مشارك (كمضيف):**
```bash
curl -X POST http://localhost:5000/api/waiting-room/admit \
  -H "Authorization: Bearer <host_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "test-room-123",
    "userId": "65f1234567890abcdef12346"
  }'
```

**3. قائمة المنتظرين (كمضيف):**
```bash
curl -X GET http://localhost:5000/api/waiting-room/test-room-123/list \
  -H "Authorization: Bearer <host_token>"
```

---

## 🚀 الخطوات التالية

### المهمة 9.2: إنشاء WaitingRoom Component (Frontend)
- [ ] إنشاء مكون واجهة الانتظار
- [ ] عرض رسالة الترحيب
- [ ] عرض مؤقت الانتظار
- [ ] عرض موقع المشارك في الطابور
- [ ] إمكانية اختبار الأجهزة أثناء الانتظار

### المهمة 9.3: Property Test - Waiting Room Admission
- [ ] اختبار Property 6: لا يمكن للمشارك الدخول بدون قبول صريح من المضيف

---

## 📝 ملاحظات مهمة

1. **غرفة الانتظار منفصلة تماماً عن غرفة المقابلة**
   - المشارك لا يمكنه رؤية أو سماع المقابلة
   - المضيف يتحكم بشكل كامل في من يدخل

2. **الإشعارات الفورية**
   - يتم استخدام Pusher لإرسال إشعارات فورية
   - المضيف يُشعر فوراً عند انضمام مشارك جديد
   - المشارك يُشعر فوراً عند القبول/الرفض

3. **التنظيف التلقائي**
   - يمكن جدولة تنظيف غرف الانتظار القديمة
   - استخدام `cleanupOldWaitingRooms()` في cron job

4. **الأداء**
   - Indexes محسّنة على roomId و participants.userId
   - استعلامات سريعة للحصول على قائمة المنتظرين

---

## ✅ معايير القبول

- [x] غرفة انتظار منفصلة عن غرفة المقابلة
- [x] قائمة بالمنتظرين (للمقابل فقط)
- [x] زر "قبول" لإدخال المرشح
- [ ] رسالة ترحيبية قابلة للتخصيص (Backend جاهز، Frontend قادم)
- [ ] مؤقت يعرض وقت الانتظار (Backend جاهز، Frontend قادم)
- [ ] إمكانية اختبار الأجهزة أثناء الانتظار (Frontend قادم)

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: Backend مكتمل ✅ | Frontend قادم 🔄
