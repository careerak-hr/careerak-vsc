# نظام الفيديو للمقابلات - توثيق API الكامل

## 📋 معلومات الوثيقة
- **اسم الميزة**: نظام الفيديو للمقابلات
- **تاريخ الإنشاء**: 2026-03-02
- **الإصدار**: 1.0.0
- **الحالة**: ✅ مكتمل

---

## 📚 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المصادقة](#المصادقة)
3. [Video Interview API](#video-interview-api)
4. [Recording API](#recording-api)
5. [Waiting Room API](#waiting-room-api)
6. [Signaling API (Socket.IO)](#signaling-api-socketio)
7. [نماذج البيانات](#نماذج-البيانات)
8. [رموز الأخطاء](#رموز-الأخطاء)
9. [أمثلة الاستخدام](#أمثلة-الاستخدام)

---

## نظرة عامة

### Base URL
```
Production:  https://careerak.com/api
Development: http://localhost:5000/api
```

### Content Type
جميع الطلبات والردود تستخدم `application/json`

### Rate Limiting
- 100 طلب في الدقيقة لكل مستخدم
- 1000 طلب في الساعة لكل IP

---

## المصادقة

جميع endpoints تتطلب JWT token في header:

```http
Authorization: Bearer <your_jwt_token>
```

### الحصول على Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```


---

## Video Interview API

### 1. إنشاء مقابلة فيديو

**Endpoint:** `POST /interviews/create`

**الوصف:** إنشاء مقابلة فيديو جديدة

**Request Body:**
```json
{
  "appointmentId": "507f1f77bcf86cd799439011",
  "scheduledAt": "2026-03-05T10:00:00Z",
  "settings": {
    "recordingEnabled": true,
    "waitingRoomEnabled": true,
    "screenShareEnabled": true,
    "chatEnabled": true,
    "maxParticipants": 10
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "interviewId": "550e8400-e29b-41d4-a716-446655440000",
    "roomId": "room_abc123xyz",
    "joinUrl": "https://careerak.com/interview/550e8400-e29b-41d4-a716-446655440000",
    "hostId": "507f1f77bcf86cd799439011",
    "status": "scheduled",
    "scheduledAt": "2026-03-05T10:00:00Z",
    "settings": {
      "recordingEnabled": true,
      "waitingRoomEnabled": true,
      "screenShareEnabled": true,
      "chatEnabled": true,
      "maxParticipants": 10
    },
    "createdAt": "2026-03-02T14:30:00Z"
  }
}
```

**Errors:**
- `400 Bad Request`: بيانات غير صحيحة
- `401 Unauthorized`: غير مصرح
- `404 Not Found`: الموعد غير موجود

---

### 2. جلب تفاصيل مقابلة

**Endpoint:** `GET /interviews/:id`

**الوصف:** جلب تفاصيل مقابلة محددة

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interviewId": "550e8400-e29b-41d4-a716-446655440000",
    "roomId": "room_abc123xyz",
    "hostId": "507f1f77bcf86cd799439011",
    "appointmentId": "507f1f77bcf86cd799439011",
    "status": "active",
    "scheduledAt": "2026-03-05T10:00:00Z",
    "startedAt": "2026-03-05T10:02:15Z",
    "duration": 1245,
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "role": "host",
        "joinedAt": "2026-03-05T10:02:15Z",
        "leftAt": null
      },
      {
        "userId": "507f1f77bcf86cd799439012",
        "role": "participant",
        "joinedAt": "2026-03-05T10:03:20Z",
        "leftAt": null
      }
    ],
    "settings": {
      "recordingEnabled": true,
      "waitingRoomEnabled": true,
      "screenShareEnabled": true,
      "chatEnabled": true,
      "maxParticipants": 10
    },
    "recordingUrl": null
  }
}
```

**Errors:**
- `401 Unauthorized`: غير مصرح
- `404 Not Found`: المقابلة غير موجودة

---

### 3. الانضمام لمقابلة

**Endpoint:** `POST /interviews/:id/join`

**الوصف:** الانضمام لمقابلة فيديو

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Request Body:**
```json
{
  "deviceInfo": {
    "browser": "Chrome",
    "os": "Windows",
    "device": "Desktop"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "roomId": "room_abc123xyz",
    "participantId": "507f1f77bcf86cd799439012",
    "role": "participant",
    "iceServers": [
      {
        "urls": "stun:stun.l.google.com:19302"
      },
      {
        "urls": "turn:turn.careerak.com:3478",
        "username": "careerak",
        "credential": "secure_password"
      }
    ],
    "settings": {
      "recordingEnabled": true,
      "screenShareEnabled": true,
      "chatEnabled": true
    },
    "existingParticipants": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "role": "host"
      }
    ]
  }
}
```

**Errors:**
- `400 Bad Request`: لا يمكن الانضمام (وقت مبكر، المقابلة انتهت، إلخ)
- `401 Unauthorized`: غير مصرح
- `403 Forbidden`: تم رفض الدخول
- `404 Not Found`: المقابلة غير موجودة
- `429 Too Many Requests`: تجاوز الحد الأقصى للمشاركين

---

### 4. إنهاء مقابلة

**Endpoint:** `POST /interviews/:id/end`

**الوصف:** إنهاء مقابلة فيديو (للمضيف فقط)

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Request Body:**
```json
{
  "reason": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interviewId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ended",
    "startedAt": "2026-03-05T10:02:15Z",
    "endedAt": "2026-03-05T10:47:30Z",
    "duration": 2715,
    "recordingUrl": "https://storage.careerak.com/recordings/550e8400.mp4"
  }
}
```

**Errors:**
- `401 Unauthorized`: غير مصرح
- `403 Forbidden`: ليس المضيف
- `404 Not Found`: المقابلة غير موجودة

---

### 5. مغادرة مقابلة

**Endpoint:** `POST /interviews/:id/leave`

**الوصف:** مغادرة مقابلة فيديو

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم المغادرة بنجاح"
}
```

---

### 6. جلب قائمة المقابلات

**Endpoint:** `GET /interviews`

**الوصف:** جلب قائمة المقابلات للمستخدم

**Query Parameters:**
- `status` (optional): `scheduled`, `active`, `ended`
- `page` (optional): رقم الصفحة (افتراضي: 1)
- `limit` (optional): عدد النتائج (افتراضي: 20، أقصى: 100)
- `sort` (optional): `scheduledAt`, `createdAt` (افتراضي: `-scheduledAt`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "interviews": [
      {
        "interviewId": "550e8400-e29b-41d4-a716-446655440000",
        "appointmentId": "507f1f77bcf86cd799439011",
        "status": "scheduled",
        "scheduledAt": "2026-03-05T10:00:00Z",
        "hostId": "507f1f77bcf86cd799439011",
        "participantsCount": 2,
        "recordingUrl": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```


---

## Recording API

### 1. بدء التسجيل

**Endpoint:** `POST /interviews/:id/recording/start`

**الوصف:** بدء تسجيل المقابلة (يتطلب موافقة جميع المشاركين)

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Request Body:**
```json
{
  "quality": "hd",
  "includeAudio": true,
  "includeVideo": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recordingId": "rec_abc123xyz",
    "status": "recording",
    "startTime": "2026-03-05T10:15:30Z",
    "consentStatus": {
      "required": 2,
      "received": 2,
      "pending": []
    }
  }
}
```

**Errors:**
- `400 Bad Request`: التسجيل معطل أو موافقة غير كاملة
- `401 Unauthorized`: غير مصرح
- `403 Forbidden`: ليس المضيف
- `409 Conflict`: التسجيل قيد التشغيل بالفعل

---

### 2. إيقاف التسجيل

**Endpoint:** `POST /interviews/:id/recording/stop`

**الوصف:** إيقاف تسجيل المقابلة

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recordingId": "rec_abc123xyz",
    "status": "processing",
    "startTime": "2026-03-05T10:15:30Z",
    "endTime": "2026-03-05T10:45:30Z",
    "duration": 1800,
    "estimatedProcessingTime": 120
  }
}
```

---

### 3. جلب حالة التسجيل

**Endpoint:** `GET /interviews/:id/recording`

**الوصف:** جلب حالة ومعلومات التسجيل

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recordingId": "rec_abc123xyz",
    "interviewId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "ready",
    "startTime": "2026-03-05T10:15:30Z",
    "endTime": "2026-03-05T10:45:30Z",
    "duration": 1800,
    "fileSize": 245678912,
    "fileUrl": "https://storage.careerak.com/recordings/rec_abc123xyz.mp4",
    "thumbnailUrl": "https://storage.careerak.com/thumbnails/rec_abc123xyz.jpg",
    "expiresAt": "2026-06-03T10:45:30Z",
    "downloadCount": 3
  }
}
```

**Recording Status:**
- `recording`: قيد التسجيل
- `processing`: قيد المعالجة
- `ready`: جاهز للتحميل
- `deleted`: محذوف

---

### 4. تحميل التسجيل

**Endpoint:** `GET /interviews/:id/recording/download`

**الوصف:** تحميل ملف التسجيل

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```
Content-Type: video/mp4
Content-Disposition: attachment; filename="interview_550e8400.mp4"
Content-Length: 245678912

[Binary video data]
```

---

### 5. حذف التسجيل

**Endpoint:** `DELETE /interviews/:id/recording`

**الوصف:** حذف التسجيل نهائياً (للمضيف فقط)

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم حذف التسجيل بنجاح"
}
```

---

### 6. تقديم موافقة التسجيل

**Endpoint:** `POST /interviews/:id/recording/consent`

**الوصف:** تقديم موافقة المشارك على التسجيل

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Request Body:**
```json
{
  "consented": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439012",
    "consented": true,
    "consentedAt": "2026-03-05T10:14:30Z",
    "allConsentsReceived": true
  }
}
```

---

## Waiting Room API

### 1. إضافة مشارك لغرفة الانتظار

**Endpoint:** `POST /interviews/:id/waiting-room/join`

**الوصف:** الانضمام لغرفة الانتظار

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "roomId": "room_abc123xyz",
    "participantId": "507f1f77bcf86cd799439012",
    "status": "waiting",
    "joinedAt": "2026-03-05T09:58:30Z",
    "welcomeMessage": "مرحباً بك! سيتم قبولك قريباً.",
    "estimatedWaitTime": 120
  }
}
```

---

### 2. جلب قائمة المنتظرين

**Endpoint:** `GET /interviews/:id/waiting-room`

**الوصف:** جلب قائمة المشاركين في غرفة الانتظار (للمضيف فقط)

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "name": "أحمد محمد",
        "profilePicture": "https://cdn.careerak.com/profiles/user123.jpg",
        "joinedAt": "2026-03-05T09:58:30Z",
        "status": "waiting",
        "deviceInfo": {
          "browser": "Chrome",
          "os": "Windows"
        }
      }
    ],
    "count": 1
  }
}
```

---

### 3. قبول مشارك

**Endpoint:** `POST /interviews/:id/waiting-room/admit`

**الوصف:** قبول مشارك من غرفة الانتظار (للمضيف فقط)

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Request Body:**
```json
{
  "participantId": "507f1f77bcf86cd799439012"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم قبول المشارك بنجاح"
}
```

---

### 4. رفض مشارك

**Endpoint:** `POST /interviews/:id/waiting-room/reject`

**الوصف:** رفض مشارك من غرفة الانتظار (للمضيف فقط)

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Request Body:**
```json
{
  "participantId": "507f1f77bcf86cd799439012",
  "reason": "غير مصرح"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم رفض المشارك"
}
```

---

### 5. تحديث رسالة الترحيب

**Endpoint:** `PUT /interviews/:id/waiting-room/message`

**الوصف:** تحديث رسالة الترحيب في غرفة الانتظار (للمضيف فقط)

**Parameters:**
- `id` (path): معرف المقابلة (UUID)

**Request Body:**
```json
{
  "message": "مرحباً! المقابلة ستبدأ في الموعد المحدد."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "تم تحديث رسالة الترحيب"
}
```


---

## Signaling API (Socket.IO)

### الاتصال

```javascript
import io from 'socket.io-client';

const socket = io('https://careerak.com', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events من Client إلى Server

#### 1. join_room
الانضمام لغرفة المقابلة

```javascript
socket.emit('join_room', {
  roomId: 'room_abc123xyz',
  userId: '507f1f77bcf86cd799439012'
});
```

**Response:**
```javascript
socket.on('room_joined', (data) => {
  console.log('Joined room:', data);
  // {
  //   roomId: 'room_abc123xyz',
  //   participants: [...],
  //   settings: {...}
  // }
});
```

---

#### 2. leave_room
مغادرة غرفة المقابلة

```javascript
socket.emit('leave_room', {
  roomId: 'room_abc123xyz'
});
```

---

#### 3. send_signal
إرسال إشارة WebRTC (SDP offer/answer, ICE candidate)

```javascript
// إرسال SDP Offer
socket.emit('send_signal', {
  roomId: 'room_abc123xyz',
  targetUserId: '507f1f77bcf86cd799439011',
  signal: {
    type: 'offer',
    sdp: '...'
  }
});

// إرسال ICE Candidate
socket.emit('send_signal', {
  roomId: 'room_abc123xyz',
  targetUserId: '507f1f77bcf86cd799439011',
  signal: {
    type: 'ice-candidate',
    candidate: {...}
  }
});
```

---

#### 4. send_message
إرسال رسالة دردشة

```javascript
socket.emit('send_message', {
  roomId: 'room_abc123xyz',
  message: 'مرحباً!',
  type: 'text'
});
```

---

#### 5. typing
إشعار بالكتابة

```javascript
socket.emit('typing', {
  roomId: 'room_abc123xyz'
});
```

---

#### 6. stop_typing
إيقاف إشعار الكتابة

```javascript
socket.emit('stop_typing', {
  roomId: 'room_abc123xyz'
});
```

---

#### 7. screen_share_start
بدء مشاركة الشاشة

```javascript
socket.emit('screen_share_start', {
  roomId: 'room_abc123xyz'
});
```

---

#### 8. screen_share_stop
إيقاف مشاركة الشاشة

```javascript
socket.emit('screen_share_stop', {
  roomId: 'room_abc123xyz'
});
```

---

#### 9. raise_hand
رفع اليد

```javascript
socket.emit('raise_hand', {
  roomId: 'room_abc123xyz'
});
```

---

#### 10. lower_hand
خفض اليد

```javascript
socket.emit('lower_hand', {
  roomId: 'room_abc123xyz'
});
```

---

#### 11. mute_participant
كتم مشارك (للمضيف فقط)

```javascript
socket.emit('mute_participant', {
  roomId: 'room_abc123xyz',
  participantId: '507f1f77bcf86cd799439012'
});
```

---

#### 12. remove_participant
إزالة مشارك (للمضيف فقط)

```javascript
socket.emit('remove_participant', {
  roomId: 'room_abc123xyz',
  participantId: '507f1f77bcf86cd799439012',
  reason: 'انتهاك القواعد'
});
```

---

### Events من Server إلى Client

#### 1. user_joined
مستخدم انضم للغرفة

```javascript
socket.on('user_joined', (data) => {
  console.log('User joined:', data);
  // {
  //   userId: '507f1f77bcf86cd799439012',
  //   name: 'أحمد محمد',
  //   role: 'participant'
  // }
});
```

---

#### 2. user_left
مستخدم غادر الغرفة

```javascript
socket.on('user_left', (data) => {
  console.log('User left:', data);
  // {
  //   userId: '507f1f77bcf86cd799439012'
  // }
});
```

---

#### 3. receive_signal
استقبال إشارة WebRTC

```javascript
socket.on('receive_signal', (data) => {
  console.log('Received signal:', data);
  // {
  //   fromUserId: '507f1f77bcf86cd799439011',
  //   signal: {
  //     type: 'offer',
  //     sdp: '...'
  //   }
  // }
});
```

---

#### 4. new_message
رسالة دردشة جديدة

```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data);
  // {
  //   userId: '507f1f77bcf86cd799439011',
  //   name: 'محمد أحمد',
  //   message: 'مرحباً!',
  //   timestamp: '2026-03-05T10:15:30Z'
  // }
});
```

---

#### 5. user_typing
مستخدم يكتب

```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
  // {
  //   userId: '507f1f77bcf86cd799439011',
  //   name: 'محمد أحمد'
  // }
});
```

---

#### 6. user_stop_typing
مستخدم توقف عن الكتابة

```javascript
socket.on('user_stop_typing', (data) => {
  console.log('User stopped typing:', data);
  // {
  //   userId: '507f1f77bcf86cd799439011'
  // }
});
```

---

#### 7. screen_share_started
بدأ مستخدم مشاركة الشاشة

```javascript
socket.on('screen_share_started', (data) => {
  console.log('Screen share started:', data);
  // {
  //   userId: '507f1f77bcf86cd799439011',
  //   name: 'محمد أحمد'
  // }
});
```

---

#### 8. screen_share_stopped
أوقف مستخدم مشاركة الشاشة

```javascript
socket.on('screen_share_stopped', (data) => {
  console.log('Screen share stopped:', data);
  // {
  //   userId: '507f1f77bcf86cd799439011'
  // }
});
```

---

#### 9. hand_raised
رفع مستخدم يده

```javascript
socket.on('hand_raised', (data) => {
  console.log('Hand raised:', data);
  // {
  //   userId: '507f1f77bcf86cd799439012',
  //   name: 'أحمد محمد'
  // }
});
```

---

#### 10. hand_lowered
خفض مستخدم يده

```javascript
socket.on('hand_lowered', (data) => {
  console.log('Hand lowered:', data);
  // {
  //   userId: '507f1f77bcf86cd799439012'
  // }
});
```

---

#### 11. participant_muted
تم كتم مشارك

```javascript
socket.on('participant_muted', (data) => {
  console.log('Participant muted:', data);
  // {
  //   participantId: '507f1f77bcf86cd799439012',
  //   mutedBy: '507f1f77bcf86cd799439011'
  // }
});
```

---

#### 12. participant_removed
تم إزالة مشارك

```javascript
socket.on('participant_removed', (data) => {
  console.log('Participant removed:', data);
  // {
  //   participantId: '507f1f77bcf86cd799439012',
  //   reason: 'انتهاك القواعد'
  // }
});
```

---

#### 13. recording_started
بدأ التسجيل

```javascript
socket.on('recording_started', (data) => {
  console.log('Recording started:', data);
  // {
  //   recordingId: 'rec_abc123xyz',
  //   startTime: '2026-03-05T10:15:30Z'
  // }
});
```

---

#### 14. recording_stopped
توقف التسجيل

```javascript
socket.on('recording_stopped', (data) => {
  console.log('Recording stopped:', data);
  // {
  //   recordingId: 'rec_abc123xyz',
  //   duration: 1800
  // }
});
```

---

#### 15. interview_ended
انتهت المقابلة

```javascript
socket.on('interview_ended', (data) => {
  console.log('Interview ended:', data);
  // {
  //   reason: 'completed',
  //   duration: 2715
  // }
});
```

---

#### 16. connection_quality
جودة الاتصال

```javascript
socket.on('connection_quality', (data) => {
  console.log('Connection quality:', data);
  // {
  //   userId: '507f1f77bcf86cd799439012',
  //   quality: 'good', // 'excellent', 'good', 'poor'
  //   latency: 45,
  //   packetLoss: 0.5
  // }
});
```

---

#### 17. error
خطأ

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // {
  //   code: 'ROOM_FULL',
  //   message: 'الغرفة ممتلئة'
  // }
});
```


---

## نماذج البيانات

### VideoInterview Model

```javascript
{
  interviewId: String (UUID),           // معرف فريد للمقابلة
  appointmentId: ObjectId,              // معرف الموعد المرتبط
  roomId: String,                       // معرف الغرفة
  hostId: ObjectId,                     // معرف المضيف
  participants: [{                      // قائمة المشاركين
    userId: ObjectId,                   // معرف المستخدم
    role: String,                       // 'host' | 'participant'
    joinedAt: Date,                     // وقت الانضمام
    leftAt: Date                        // وقت المغادرة (null إذا لا يزال موجوداً)
  }],
  status: String,                       // 'scheduled' | 'waiting' | 'active' | 'ended'
  scheduledAt: Date,                    // الوقت المجدول
  startedAt: Date,                      // وقت البدء الفعلي
  endedAt: Date,                        // وقت الانتهاء
  duration: Number,                     // المدة بالثواني
  settings: {                           // إعدادات المقابلة
    recordingEnabled: Boolean,          // تفعيل التسجيل
    waitingRoomEnabled: Boolean,        // تفعيل غرفة الانتظار
    screenShareEnabled: Boolean,        // تفعيل مشاركة الشاشة
    chatEnabled: Boolean,               // تفعيل الدردشة
    maxParticipants: Number             // الحد الأقصى للمشاركين
  },
  recordingUrl: String,                 // رابط التسجيل (null إذا لم يتم التسجيل)
  recordingConsent: [{                  // موافقات التسجيل
    userId: ObjectId,                   // معرف المستخدم
    consented: Boolean,                 // هل وافق؟
    consentedAt: Date                   // وقت الموافقة
  }],
  createdAt: Date,                      // وقت الإنشاء
  updatedAt: Date                       // وقت آخر تحديث
}
```

---

### InterviewRecording Model

```javascript
{
  recordingId: String (UUID),           // معرف فريد للتسجيل
  interviewId: ObjectId,                // معرف المقابلة
  startTime: Date,                      // وقت بدء التسجيل
  endTime: Date,                        // وقت انتهاء التسجيل
  duration: Number,                     // المدة بالثواني
  fileSize: Number,                     // حجم الملف بالبايت
  fileUrl: String,                      // رابط الملف
  thumbnailUrl: String,                 // رابط الصورة المصغرة
  status: String,                       // 'recording' | 'processing' | 'ready' | 'deleted'
  expiresAt: Date,                      // تاريخ الانتهاء (90 يوم افتراضياً)
  downloadCount: Number,                // عدد مرات التحميل
  createdAt: Date,                      // وقت الإنشاء
  updatedAt: Date                       // وقت آخر تحديث
}
```

---

### WaitingRoom Model

```javascript
{
  roomId: String,                       // معرف الغرفة
  interviewId: ObjectId,                // معرف المقابلة
  participants: [{                      // قائمة المنتظرين
    userId: ObjectId,                   // معرف المستخدم
    joinedAt: Date,                     // وقت الانضمام للانتظار
    status: String                      // 'waiting' | 'admitted' | 'rejected'
  }],
  welcomeMessage: String,               // رسالة الترحيب
  createdAt: Date,                      // وقت الإنشاء
  updatedAt: Date                       // وقت آخر تحديث
}
```

---

## رموز الأخطاء

### HTTP Status Codes

| الكود | الوصف |
|------|--------|
| 200 | نجح الطلب |
| 201 | تم الإنشاء بنجاح |
| 400 | طلب غير صحيح |
| 401 | غير مصرح |
| 403 | ممنوع |
| 404 | غير موجود |
| 409 | تعارض |
| 429 | تجاوز الحد |
| 500 | خطأ في الخادم |

---

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ بالعربية",
    "details": {
      "field": "اسم الحقل",
      "reason": "سبب الخطأ"
    }
  }
}
```

---

### Error Codes

| الكود | الوصف |
|------|--------|
| `INVALID_REQUEST` | طلب غير صحيح |
| `UNAUTHORIZED` | غير مصرح |
| `FORBIDDEN` | ممنوع |
| `NOT_FOUND` | غير موجود |
| `INTERVIEW_NOT_FOUND` | المقابلة غير موجودة |
| `APPOINTMENT_NOT_FOUND` | الموعد غير موجود |
| `ROOM_FULL` | الغرفة ممتلئة |
| `ALREADY_JOINED` | انضممت بالفعل |
| `NOT_HOST` | لست المضيف |
| `RECORDING_DISABLED` | التسجيل معطل |
| `CONSENT_REQUIRED` | موافقة مطلوبة |
| `RECORDING_IN_PROGRESS` | التسجيل قيد التشغيل |
| `NO_RECORDING` | لا يوجد تسجيل |
| `SCREEN_SHARE_ACTIVE` | مشاركة الشاشة نشطة |
| `TOO_EARLY` | مبكر جداً |
| `TOO_LATE` | متأخر جداً |
| `INTERVIEW_ENDED` | المقابلة انتهت |
| `RATE_LIMIT_EXCEEDED` | تجاوز الحد |
| `SERVER_ERROR` | خطأ في الخادم |

---

## أمثلة الاستخدام

### مثال 1: إنشاء والانضمام لمقابلة

```javascript
// 1. إنشاء مقابلة (المضيف)
const createResponse = await fetch('https://careerak.com/api/interviews/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${hostToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    appointmentId: '507f1f77bcf86cd799439011',
    scheduledAt: '2026-03-05T10:00:00Z',
    settings: {
      recordingEnabled: true,
      waitingRoomEnabled: true,
      screenShareEnabled: true,
      chatEnabled: true,
      maxParticipants: 10
    }
  })
});

const { data: interview } = await createResponse.json();
console.log('Interview created:', interview.interviewId);

// 2. الانضمام للمقابلة (المشارك)
const joinResponse = await fetch(`https://careerak.com/api/interviews/${interview.interviewId}/join`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${participantToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    deviceInfo: {
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop'
    }
  })
});

const { data: joinData } = await joinResponse.json();
console.log('Joined room:', joinData.roomId);
```

---

### مثال 2: إعداد WebRTC Connection

```javascript
import io from 'socket.io-client';

// 1. الاتصال بـ Socket.IO
const socket = io('https://careerak.com', {
  auth: { token: userToken }
});

// 2. الانضمام للغرفة
socket.emit('join_room', {
  roomId: 'room_abc123xyz',
  userId: userId
});

// 3. إعداد WebRTC
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.careerak.com:3478',
      username: 'careerak',
      credential: 'secure_password'
    }
  ]
});

// 4. إضافة local stream
const localStream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true
});

localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream);
});

// 5. معالجة ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('send_signal', {
      roomId: 'room_abc123xyz',
      targetUserId: remoteUserId,
      signal: {
        type: 'ice-candidate',
        candidate: event.candidate
      }
    });
  }
};

// 6. معالجة remote stream
peerConnection.ontrack = (event) => {
  const remoteVideo = document.getElementById('remote-video');
  remoteVideo.srcObject = event.streams[0];
};

// 7. إنشاء وإرسال offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

socket.emit('send_signal', {
  roomId: 'room_abc123xyz',
  targetUserId: remoteUserId,
  signal: {
    type: 'offer',
    sdp: offer.sdp
  }
});

// 8. استقبال ومعالجة signals
socket.on('receive_signal', async (data) => {
  if (data.signal.type === 'offer') {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription({ type: 'offer', sdp: data.signal.sdp })
    );
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('send_signal', {
      roomId: 'room_abc123xyz',
      targetUserId: data.fromUserId,
      signal: {
        type: 'answer',
        sdp: answer.sdp
      }
    });
  } else if (data.signal.type === 'answer') {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription({ type: 'answer', sdp: data.signal.sdp })
    );
  } else if (data.signal.type === 'ice-candidate') {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(data.signal.candidate)
    );
  }
});
```

---

### مثال 3: تسجيل المقابلة

```javascript
// 1. طلب موافقة المشاركين
const consentResponse = await fetch(
  `https://careerak.com/api/interviews/${interviewId}/recording/consent`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ consented: true })
  }
);

// 2. بدء التسجيل (المضيف)
const startResponse = await fetch(
  `https://careerak.com/api/interviews/${interviewId}/recording/start`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hostToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quality: 'hd',
      includeAudio: true,
      includeVideo: true
    })
  }
);

const { data: recording } = await startResponse.json();
console.log('Recording started:', recording.recordingId);

// 3. إيقاف التسجيل
const stopResponse = await fetch(
  `https://careerak.com/api/interviews/${interviewId}/recording/stop`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hostToken}`
    }
  }
);

// 4. تحميل التسجيل (بعد المعالجة)
const downloadUrl = `https://careerak.com/api/interviews/${interviewId}/recording/download`;
window.open(downloadUrl, '_blank');
```

---

### مثال 4: غرفة الانتظار

```javascript
// 1. الانضمام لغرفة الانتظار (المشارك)
const joinWaitingResponse = await fetch(
  `https://careerak.com/api/interviews/${interviewId}/waiting-room/join`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${participantToken}`
    }
  }
);

// 2. جلب قائمة المنتظرين (المضيف)
const waitingListResponse = await fetch(
  `https://careerak.com/api/interviews/${interviewId}/waiting-room`,
  {
    headers: {
      'Authorization': `Bearer ${hostToken}`
    }
  }
);

const { data: waitingList } = await waitingListResponse.json();
console.log('Waiting participants:', waitingList.participants);

// 3. قبول مشارك (المضيف)
const admitResponse = await fetch(
  `https://careerak.com/api/interviews/${interviewId}/waiting-room/admit`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hostToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      participantId: '507f1f77bcf86cd799439012'
    })
  }
);

// 4. الاستماع لحدث القبول (المشارك)
socket.on('admitted_to_interview', (data) => {
  console.log('Admitted! Joining interview...');
  // الانضمام للمقابلة
});
```

---

## ملاحظات مهمة

### الأمان
- جميع endpoints تتطلب JWT authentication
- التحقق من الصلاحيات على مستوى الخادم
- تشفير end-to-end للاتصالات (DTLS-SRTP)
- روابط مقابلات فريدة وآمنة (UUID)

### الأداء
- استخدام TURN server للاتصالات خلف الجدران النارية
- Adaptive bitrate للفيديو
- معالجة فقدان الحزم
- إعادة الاتصال التلقائي

### التوافق
- يعمل على جميع المتصفحات الحديثة
- دعم كامل للأجهزة المحمولة
- تبديل الكاميرا الأمامية/الخلفية (موبايل)
- تصميم متجاوب

### الحدود
- الحد الأقصى للمشاركين: 10 (قابل للتخصيص)
- مدة التسجيل القصوى: 4 ساعات
- حجم الملف الأقصى: 2GB
- مدة الاحتفاظ بالتسجيل: 90 يوم

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الإصدار**: 1.0.0
