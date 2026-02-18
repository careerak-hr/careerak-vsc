# نظام الفيديو للمقابلات - التصميم التقني

## 📋 معلومات الوثيقة
- **اسم الميزة**: نظام الفيديو للمقابلات
- **تاريخ الإنشاء**: 2026-02-17
- **الحالة**: قيد التصميم

## 1. Overview
نظام شامل لمقابلات الفيديو المباشرة مع WebRTC، تسجيل، مشاركة الشاشة، وغرف انتظار.

## 2. Architecture
معمارية موزعة:
- Presentation: Video Call UI, Waiting Room, Controls
- Signaling: Socket.IO Server للإشارات
- Media: WebRTC Peer Connections
- Recording: Media Recording Service
- Storage: Cloud Storage للتسجيلات

## 3. WebRTC Architecture

### Connection Flow
```
Participant A                Signaling Server              Participant B
     |                              |                            |
     |------ Create Room ---------->|                            |
     |<----- Room Created ----------|                            |
     |                              |<------ Join Room ----------|
     |<----- Peer Joined -----------|                            |
     |                              |                            |
     |------ SDP Offer ------------>|------ SDP Offer --------->|
     |                              |                            |
     |<----- SDP Answer ------------|<----- SDP Answer ---------|
     |                              |                            |
     |------ ICE Candidates ------->|------ ICE Candidates ---->|
     |<----- ICE Candidates --------|<----- ICE Candidates -----|
     |                              |                            |
     |<========== WebRTC P2P Connection ======================>|
```

## 4. Data Models

### VideoInterview Model
```javascript
{
  interviewId: UUID,
  appointmentId: ObjectId,
  roomId: String,
  hostId: ObjectId,
  participants: [{
    userId: ObjectId,
    role: 'host' | 'participant',
    joinedAt: Date,
    leftAt: Date
  }],
  status: 'scheduled' | 'waiting' | 'active' | 'ended',
  scheduledAt: Date,
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  settings: {
    recordingEnabled: Boolean,
    waitingRoomEnabled: Boolean,
    screenShareEnabled: Boolean,
    chatEnabled: Boolean,
    maxParticipants: Number
  },
  recordingUrl: String,
  recordingConsent: [{
    userId: ObjectId,
    consented: Boolean,
    consentedAt: Date
  }]
}
```

### InterviewRecording Model
```javascript
{
  recordingId: UUID,
  interviewId: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,
  fileSize: Number,
  fileUrl: String,
  thumbnailUrl: String,
  status: 'recording' | 'processing' | 'ready' | 'deleted',
  expiresAt: Date,
  downloadCount: Number
}
```

### WaitingRoom Model
```javascript
{
  roomId: String,
  interviewId: ObjectId,
  participants: [{
    userId: ObjectId,
    joinedAt: Date,
    status: 'waiting' | 'admitted' | 'rejected'
  }],
  welcomeMessage: String
}
```

## 5. Correctness Properties

### Property 1: Connection Establishment
*For any* two participants in the same interview room, a WebRTC peer connection should be established within 5 seconds.
**Validates: Requirements 1.1**

### Property 2: Video Quality
*For any* active video call with good network conditions, the video quality should be at least 720p.
**Validates: Requirements 1.1**

### Property 3: Recording Consent
*For any* interview with recording enabled, all participants must provide consent before recording starts.
**Validates: Requirements 2.3**

### Property 4: Recording Completeness
*For any* recorded interview, the recording duration should match the actual interview duration (±5 seconds).
**Validates: Requirements 2.4**

### Property 5: Screen Share Exclusivity
*For any* interview room, only one participant can share their screen at a time.
**Validates: Requirements 3.1**

### Property 6: Waiting Room Admission
*For any* participant in the waiting room, they can only join the interview after explicit admission by the host.
**Validates: Requirements 4.3**

### Property 7: Scheduled Interview Access
*For any* scheduled interview, participants can only join within 5 minutes before the scheduled time.
**Validates: Requirements 5.5**

### Property 8: Participant Limit
*For any* interview room with maxParticipants = N, the system should reject the (N+1)th join attempt.
**Validates: Requirements 7.1**

### Property 9: Recording Auto-Delete
*For any* recording with expiresAt date in the past, the recording file should be automatically deleted.
**Validates: Requirements 2.6**

### Property 10: Connection Quality Indicator
*For any* active connection, the quality indicator should accurately reflect the current network conditions (latency, packet loss).
**Validates: Requirements 1.5**

## 6. Services Implementation

### WebRTCService
- createPeerConnection(): إنشاء اتصال WebRTC
- handleOffer(): معالجة SDP offer
- handleAnswer(): معالجة SDP answer
- handleICECandidate(): معالجة ICE candidates
- closeConnection(): إغلاق الاتصال

### SignalingService (Socket.IO)
- createRoom(): إنشاء غرفة
- joinRoom(): الانضمام لغرفة
- leaveRoom(): مغادرة غرفة
- sendSignal(): إرسال إشارة
- broadcastToRoom(): بث لجميع المشاركين

### RecordingService
- startRecording(): بدء التسجيل
- stopRecording(): إيقاف التسجيل
- processRecording(): معالجة الفيديو
- generateThumbnail(): توليد صورة مصغرة
- scheduleDelete(): جدولة الحذف

### WaitingRoomService
- addToWaitingRoom(): إضافة للانتظار
- admitParticipant(): قبول مشارك
- rejectParticipant(): رفض مشارك
- getWaitingList(): قائمة المنتظرين

### ScreenShareService
- startScreenShare(): بدء مشاركة الشاشة
- stopScreenShare(): إيقاف المشاركة
- switchSource(): تبديل المصدر

## 7. WebRTC Configuration

### ICE Servers
```javascript
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  {
    urls: 'turn:turn.careerak.com:3478',
    username: 'careerak',
    credential: 'secure_password'
  }
];
```

### Media Constraints
```javascript
const videoConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};
```

## 8. Testing Strategy
- Property-based tests using fast-check
- Unit tests for signaling logic
- Integration tests for WebRTC connections
- Load tests for multiple participants
- Network simulation tests (latency, packet loss)

**تاريخ الإنشاء**: 2026-02-17
