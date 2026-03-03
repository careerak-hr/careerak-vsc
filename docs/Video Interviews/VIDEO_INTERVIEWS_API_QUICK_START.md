# نظام الفيديو للمقابلات - دليل البدء السريع للـ API

## 📋 معلومات الوثيقة
- **الهدف**: دليل سريع للبدء مع API نظام الفيديو للمقابلات
- **الوقت المتوقع**: 10 دقائق
- **المتطلبات**: معرفة أساسية بـ JavaScript و WebRTC

---

## 🚀 البدء السريع

### 1. المصادقة (30 ثانية)

```javascript
// الحصول على JWT token
const loginResponse = await fetch('https://careerak.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();
```

---

### 2. إنشاء مقابلة (1 دقيقة)

```javascript
// إنشاء مقابلة جديدة
const createResponse = await fetch('https://careerak.com/api/interviews/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    appointmentId: 'your_appointment_id',
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
console.log('Interview ID:', interview.interviewId);
console.log('Join URL:', interview.joinUrl);
```

---

### 3. الانضمام للمقابلة (2 دقيقة)

```javascript
import io from 'socket.io-client';

// 1. الانضمام عبر REST API
const joinResponse = await fetch(
  `https://careerak.com/api/interviews/${interviewId}/join`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      deviceInfo: {
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop'
      }
    })
  }
);

const { data: joinData } = await joinResponse.json();

// 2. الاتصال بـ Socket.IO
const socket = io('https://careerak.com', {
  auth: { token }
});

// 3. الانضمام للغرفة
socket.emit('join_room', {
  roomId: joinData.roomId,
  userId: userId
});

socket.on('room_joined', (data) => {
  console.log('Joined successfully!', data);
});
```

---

### 4. إعداد WebRTC (3 دقائق)

```javascript
// 1. إنشاء peer connection
const pc = new RTCPeerConnection({
  iceServers: joinData.iceServers
});

// 2. الحصول على local stream
const localStream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1280, height: 720 },
  audio: true
});

// 3. إضافة tracks
localStream.getTracks().forEach(track => {
  pc.addTrack(track, localStream);
});

// 4. عرض local video
document.getElementById('local-video').srcObject = localStream;

// 5. معالجة remote stream
pc.ontrack = (event) => {
  document.getElementById('remote-video').srcObject = event.streams[0];
};

// 6. معالجة ICE candidates
pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('send_signal', {
      roomId: joinData.roomId,
      targetUserId: remoteUserId,
      signal: {
        type: 'ice-candidate',
        candidate: event.candidate
      }
    });
  }
};

// 7. استقبال signals
socket.on('receive_signal', async (data) => {
  if (data.signal.type === 'offer') {
    await pc.setRemoteDescription(new RTCSessionDescription({
      type: 'offer',
      sdp: data.signal.sdp
    }));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    socket.emit('send_signal', {
      roomId: joinData.roomId,
      targetUserId: data.fromUserId,
      signal: { type: 'answer', sdp: answer.sdp }
    });
  } else if (data.signal.type === 'answer') {
    await pc.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: data.signal.sdp
    }));
  } else if (data.signal.type === 'ice-candidate') {
    await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
  }
});
```

---

### 5. ميزات إضافية (2 دقيقة)

#### كتم الصوت
```javascript
const audioTrack = localStream.getAudioTracks()[0];
audioTrack.enabled = !audioTrack.enabled;
```

#### إيقاف الفيديو
```javascript
const videoTrack = localStream.getVideoTracks()[0];
videoTrack.enabled = !videoTrack.enabled;
```

#### مشاركة الشاشة
```javascript
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: { width: 1920, height: 1080 }
});

const screenTrack = screenStream.getVideoTracks()[0];
const sender = pc.getSenders().find(s => s.track.kind === 'video');
sender.replaceTrack(screenTrack);

socket.emit('screen_share_start', { roomId: joinData.roomId });
```

#### إرسال رسالة
```javascript
socket.emit('send_message', {
  roomId: joinData.roomId,
  message: 'مرحباً!',
  type: 'text'
});

socket.on('new_message', (data) => {
  console.log(`${data.name}: ${data.message}`);
});
```

---

### 6. التسجيل (2 دقيقة)

```javascript
// 1. موافقة على التسجيل
await fetch(
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

// 2. بدء التسجيل (المضيف فقط)
await fetch(
  `https://careerak.com/api/interviews/${interviewId}/recording/start`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      quality: 'hd',
      includeAudio: true,
      includeVideo: true
    })
  }
);

// 3. إيقاف التسجيل
await fetch(
  `https://careerak.com/api/interviews/${interviewId}/recording/stop`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
```

---

## 📚 الخطوات التالية

1. **التوثيق الكامل**: اقرأ `VIDEO_INTERVIEWS_API_DOCUMENTATION.md`
2. **الأمثلة**: راجع قسم "أمثلة الاستخدام" في التوثيق الكامل
3. **الاختبار**: جرب API في بيئة التطوير
4. **التكامل**: ادمج API في تطبيقك

---

## 🔗 روابط مفيدة

- [التوثيق الكامل](./VIDEO_INTERVIEWS_API_DOCUMENTATION.md)
- [WebRTC Documentation](https://webrtc.org/getting-started/overview)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02
