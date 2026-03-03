# إعداد نظام الفيديو للمقابلات - دليل شامل

## 📋 نظرة عامة

تم إكمال المهمة 1: إعداد البنية الأساسية لنظام الفيديو للمقابلات بنجاح.

## ✅ ما تم إنجازه

### 1. النماذج (Models)

#### VideoInterview Model
- **الموقع**: `backend/src/models/VideoInterview.js`
- **الميزات**:
  - معلومات أساسية (interviewId, roomId, hostId)
  - إدارة المشاركين (participants array)
  - حالات المقابلة (scheduled, waiting, active, ended, cancelled)
  - إعدادات قابلة للتخصيص (recording, waiting room, screen share, chat)
  - نظام موافقة التسجيل (recording consent)
  - الملاحظات والتقييمات
  - Metadata للمنصة والجهاز

#### InterviewRecording Model
- **الموقع**: `backend/src/models/InterviewRecording.js`
- **الميزات**:
  - معلومات التسجيل (recordingId, fileUrl, thumbnailUrl)
  - حالات المعالجة (recording, processing, ready, failed, deleted)
  - الحذف التلقائي بعد 90 يوم
  - إحصائيات الوصول (downloads, views)
  - قائمة الوصول (access list)
  - Metadata للفيديو (codec, resolution, bitrate)

#### WaitingRoom Model
- **الموقع**: `backend/src/models/WaitingRoom.js`
- **الميزات**:
  - إدارة المشاركين في الانتظار
  - حالات المشاركين (waiting, admitted, rejected, left)
  - رسالة ترحيبية قابلة للتخصيص
  - إعدادات غرفة الانتظار
  - إحصائيات (total joined, admitted, rejected, average wait time)
  - معلومات الجهاز للمشاركين

### 2. إعداد WebRTC

#### WebRTC Configuration
- **الموقع**: `backend/src/config/webrtc.js`
- **الميزات**:
  - STUN servers (5 خوادم من Google)
  - TURN server configuration (قابل للتخصيص)
  - Media constraints (video, audio)
  - Screen share constraints
  - Recording constraints
  - Quality thresholds (excellent, good, fair, poor)
  - Limits and timeouts
  - Helper functions

### 3. Socket.IO للإشارات

#### تحديث SocketService
- **الموقع**: `backend/src/services/socketService.js`
- **الأحداث الجديدة**:
  - `webrtc:join_room` - الانضمام لغرفة WebRTC
  - `webrtc:leave_room` - مغادرة غرفة WebRTC
  - `webrtc:offer` - إرسال SDP offer
  - `webrtc:answer` - إرسال SDP answer
  - `webrtc:ice_candidate` - تبادل ICE candidates
  - `webrtc:screen_share_start` - بدء مشاركة الشاشة
  - `webrtc:screen_share_stop` - إيقاف مشاركة الشاشة
  - `webrtc:recording_start` - بدء التسجيل
  - `webrtc:recording_stop` - إيقاف التسجيل
  - `webrtc:connection_quality` - تحديث جودة الاتصال

### 4. المكتبات المثبتة

```bash
npm install simple-peer socket.io-client
```

- **simple-peer**: مكتبة WebRTC مبسطة
- **socket.io-client**: عميل Socket.IO (للاستخدام في Frontend)

## 🔧 الإعداد المطلوب

### 1. متغيرات البيئة (.env)

أضف المتغيرات التالية إلى ملف `.env`:

```env
# WebRTC Configuration (Video Interviews)
TURN_SERVER_URL=turn:turn.careerak.com:3478
TURN_USERNAME=careerak
TURN_PASSWORD=secure_password_here

# Video Interview Settings
VIDEO_MAX_PARTICIPANTS=10
VIDEO_MAX_DURATION=180
VIDEO_RECORDING_ENABLED=true
VIDEO_RECORDING_EXPIRY_DAYS=90
```

### 2. TURN Server

**مهم جداً**: TURN server ضروري لعمل مكالمات الفيديو خلف الجدران النارية.

#### خيارات TURN Server:

**أ. خدمات مجانية/مدفوعة:**
- [Twilio TURN](https://www.twilio.com/stun-turn) - مجاني حتى 10GB/شهر
- [Xirsys](https://xirsys.com/) - مجاني حتى 500MB/شهر
- [Metered TURN](https://www.metered.ca/tools/openrelay/) - مجاني

**ب. استضافة ذاتية (Self-hosted):**
```bash
# تثبيت coturn على Ubuntu/Debian
sudo apt-get install coturn

# تكوين coturn
sudo nano /etc/turnserver.conf

# إضافة:
listening-port=3478
fingerprint
lt-cred-mech
user=careerak:secure_password_here
realm=turn.careerak.com
```

### 3. اختبار الإعداد

```javascript
// في backend
const { validateTurnServer } = require('./src/config/webrtc');

if (validateTurnServer()) {
  console.log('✅ TURN server configured');
} else {
  console.warn('⚠️  TURN server not configured');
}
```

## 📊 بنية قاعدة البيانات

### VideoInterview Collection
```javascript
{
  interviewId: "interview_1234567890_abc123",
  roomId: "room_xyz789",
  hostId: ObjectId("..."),
  participants: [
    {
      userId: ObjectId("..."),
      role: "host",
      joinedAt: Date,
      leftAt: Date,
      connectionQuality: "good"
    }
  ],
  status: "active",
  scheduledAt: Date,
  startedAt: Date,
  endedAt: Date,
  duration: 45,
  settings: {
    recordingEnabled: true,
    waitingRoomEnabled: true,
    screenShareEnabled: true,
    chatEnabled: true,
    maxParticipants: 10
  },
  recordingConsent: [
    {
      userId: ObjectId("..."),
      consented: true,
      consentedAt: Date
    }
  ]
}
```

### InterviewRecording Collection
```javascript
{
  recordingId: "rec_1234567890_xyz456",
  interviewId: ObjectId("..."),
  startTime: Date,
  endTime: Date,
  duration: 2700,
  fileSize: 524288000,
  fileUrl: "https://cloudinary.com/...",
  thumbnailUrl: "https://cloudinary.com/...",
  status: "ready",
  expiresAt: Date,
  downloadCount: 5,
  viewCount: 12
}
```

### WaitingRoom Collection
```javascript
{
  roomId: "room_xyz789",
  interviewId: ObjectId("..."),
  participants: [
    {
      userId: ObjectId("..."),
      joinedAt: Date,
      status: "waiting",
      deviceInfo: {
        platform: "web",
        browser: "Chrome",
        hasCamera: true,
        hasMicrophone: true
      }
    }
  ],
  welcomeMessage: "مرحباً بك في غرفة الانتظار",
  isActive: true,
  stats: {
    totalJoined: 10,
    totalAdmitted: 8,
    totalRejected: 1,
    averageWaitTime: 3.5
  }
}
```

## 🔐 الأمان

### 1. المصادقة
- جميع اتصالات Socket.IO محمية بـ JWT
- التحقق من الهوية قبل الانضمام للغرف

### 2. التشفير
- WebRTC يستخدم DTLS-SRTP للتشفير end-to-end
- التسجيلات يمكن تشفيرها (encrypted field)

### 3. الخصوصية
- موافقة إلزامية على التسجيل من جميع المشاركين
- حذف تلقائي للتسجيلات بعد 90 يوم
- قائمة وصول محدودة للتسجيلات

## 📝 الاستخدام

### إنشاء مقابلة جديدة

```javascript
const VideoInterview = require('./models/VideoInterview');

const interview = new VideoInterview({
  roomId: `room_${Date.now()}`,
  hostId: userId,
  scheduledAt: new Date('2026-03-10T10:00:00'),
  settings: {
    recordingEnabled: true,
    waitingRoomEnabled: true,
    maxParticipants: 5
  }
});

await interview.save();
```

### إضافة مشارك

```javascript
await interview.addParticipant(participantId, 'participant');
```

### بدء المقابلة

```javascript
await interview.startInterview();
```

### إنهاء المقابلة

```javascript
await interview.endInterview();
```

## 🧪 الاختبار

### اختبار Socket.IO

```javascript
// في Frontend
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO');
  
  // الانضمام لغرفة WebRTC
  socket.emit('webrtc:join_room', {
    roomId: 'room_123',
    userId: 'user_456'
  });
});

socket.on('webrtc:user_joined', (data) => {
  console.log('User joined:', data);
});
```

### اختبار TURN Server

استخدم [Trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/) للاختبار:
1. افتح الرابط
2. أضف TURN server URL
3. اضغط "Gather candidates"
4. تحقق من ظهور "relay" candidates

## 📚 المراجع

- [WebRTC Documentation](https://webrtc.org/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [simple-peer Documentation](https://github.com/feross/simple-peer)
- [coturn Documentation](https://github.com/coturn/coturn)

## 🚀 الخطوات التالية

المهمة 2: تنفيذ WebRTC الأساسي
- إنشاء WebRTCService
- إنشاء SignalingService
- Property tests للاتصال وجودة الفيديو

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ مكتمل  
**المهمة**: 1. إعداد البنية الأساسية
