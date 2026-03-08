import React, { useState, useEffect, useRef } from 'react';
import './GroupVideoCall.css';

/**
 * مكون المقابلات الجماعية
 * يدعم حتى 10 مشاركين مع عرض شبكي وعرض المتحدث
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
const GroupVideoCall = ({
  roomId,
  userId,
  userName,
  isHost,
  maxParticipants = 10,
  onLeave
}) => {
  const [participants, setParticipants] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'speaker'
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState(new Map());
  
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    initializeCall();
    return () => cleanup();
  }, [roomId, userId]);

  /**
   * تهيئة المكالمة
   */
  const initializeCall = async () => {
    try {
      // الحصول على media stream
      const stream = await navigator.mediaDevices.getUserMedia({
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
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // الاتصال بـ signaling server
      connectToSignalingServer(stream);
    } catch (error) {
      console.error('Error initializing call:', error);
      if (typeof window !== 'undefined' && window.alert) {
        alert('فشل الوصول إلى الكاميرا/الميكروفون');
      }
    }
  };

  /**
   * الاتصال بـ signaling server
   */
  const connectToSignalingServer = (stream) => {
    // Check if io is available (global or imported)
    if (typeof io === 'undefined') {
      console.error('Socket.io client not found');
      return;
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socketRef.current = socket;

    // الانضمام للغرفة
    socket.emit('join-room', {
      roomId,
      userId,
      userName,
      maxParticipants
    });

    // معالجة الأحداث
    socket.on('room-joined', (data) => handleRoomJoined(data, stream));
    socket.on('user-joined', (data) => handleUserJoined(data, stream));
    socket.on('user-left', handleUserLeft);
    socket.on('room-full', handleRoomFull);
    socket.on('offer', (data) => handleOffer(data, stream));
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleICECandidate);
    socket.on('audio-toggled', handleAudioToggled);
    socket.on('video-toggled', handleVideoToggled);
    socket.on('all-muted', handleAllMuted);
    socket.on('removed-from-room', handleRemovedFromRoom);
    socket.on('user-removed', handleUserRemoved);
  };

  /**
   * معالجة الانضمام للغرفة
   */
  const handleRoomJoined = async (data, stream) => {
    console.log('Joined room:', data);
    if (data.participants) {
      setParticipants(data.participants);

      // إنشاء peer connections مع المشاركين الموجودين
      for (const participant of data.participants) {
        await createPeerConnection(participant.socketId, stream, true);
      }
    }
  };

  /**
   * معالجة انضمام مستخدم جديد
   */
  const handleUserJoined = async (data, stream) => {
    console.log('User joined:', data);
    setParticipants(prev => {
      // Avoid duplicate entries
      if (prev.find(p => p.socketId === data.socketId)) return prev;
      return [...prev, data];
    });

    // إنشاء peer connection مع المستخدم الجديد
    await createPeerConnection(data.socketId, stream, false);
  };

  /**
   * معالجة مغادرة مستخدم
   */
  const handleUserLeft = (data) => {
    console.log('User left:', data);
    setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));

    // إغلاق peer connection
    const pc = peerConnections.get(data.socketId);
    if (pc) {
      pc.close();
      setPeerConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.socketId);
        return newMap;
      });
    }
  };

  /**
   * معالجة الغرفة الممتلئة
   */
  const handleRoomFull = (data) => {
    if (typeof window !== 'undefined' && window.alert) {
      alert(`الغرفة ممتلئة (${data.currentCount}/${data.maxParticipants})`);
    }
    onLeave();
  };

  /**
   * إنشاء peer connection
   */
  const createPeerConnection = async (socketId, stream, shouldCreateOffer) => {
    if (!stream) return null;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // إضافة local stream
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // معالجة remote stream
    pc.ontrack = (event) => {
      setParticipants(prev => prev.map(p => {
        if (p.socketId === socketId) {
          return { ...p, stream: event.streams[0] };
        }
        return p;
      }));
    };

    // معالجة ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          roomId,
          targetSocketId: socketId,
          candidate: event.candidate
        });
      }
    };

    setPeerConnections(prev => new Map(prev).set(socketId, pc));

    // إنشاء offer إذا كنا المبادر
    if (shouldCreateOffer) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (socketRef.current) {
          socketRef.current.emit('offer', {
            roomId,
            targetSocketId: socketId,
            offer
          });
        }
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    }

    return pc;
  };

  /**
   * معالجة offer
   */
  const handleOffer = async (data, stream) => {
    const pc = peerConnections.get(data.fromSocketId) || 
                await createPeerConnection(data.fromSocketId, stream, false);

    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('answer', {
          roomId,
          targetSocketId: data.fromSocketId,
          answer
        });
      }
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  /**
   * معالجة answer
   */
  const handleAnswer = async (data) => {
    const pc = peerConnections.get(data.fromSocketId);
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    }
  };

  /**
   * معالجة ICE candidate
   */
  const handleICECandidate = async (data) => {
    const pc = peerConnections.get(data.fromSocketId);
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    }
  };

  /**
   * معالجة تبديل الصوت
   */
  const handleAudioToggled = (data) => {
    setParticipants(prev => prev.map(p => {
      if (p.socketId === data.socketId) {
        return { ...p, audioEnabled: data.enabled };
      }
      return p;
    }));
  };

  /**
   * معالجة تبديل الفيديو
   */
  const handleVideoToggled = (data) => {
    setParticipants(prev => prev.map(p => {
      if (p.socketId === data.socketId) {
        return { ...p, videoEnabled: data.enabled };
      }
      return p;
    }));
  };

  /**
   * معالجة كتم الجميع
   */
  const handleAllMuted = (data) => {
    if (typeof window !== 'undefined' && window.alert) {
      alert(`تم كتم الجميع بواسطة ${data.byUserName}`);
    }
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    }
  };

  /**
   * معالجة الإزالة من الغرفة
   */
  const handleRemovedFromRoom = (data) => {
    if (typeof window !== 'undefined' && window.alert) {
      alert(`تمت إزالتك من المقابلة بواسطة ${data.byUserName}`);
    }
    cleanup();
    onLeave();
  };

  /**
   * معالجة إزالة مستخدم
   */
  const handleUserRemoved = (data) => {
    handleUserLeft(data);
  };

  /**
   * كتم الجميع (للمضيف فقط)
   */
  const muteAll = () => {
    if (!isHost || !socketRef.current) return;
    socketRef.current.emit('mute-all', { roomId, hostId: userId });
  };

  /**
   * إزالة مشارك (للمضيف فقط)
   */
  const removeParticipant = (socketId) => {
    if (!isHost || !socketRef.current) return;
    if (window.confirm('هل أنت متأكد من إزالة هذا المشارك؟')) {
      socketRef.current.emit('remove-participant', {
        roomId,
        hostId: userId,
        targetSocketId: socketId
      });
    }
  };

  /**
   * تبديل وضع العرض
   */
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'speaker' : 'grid');
  };

  /**
   * تنظيف الموارد
   */
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnections) {
      peerConnections.forEach(pc => pc.close());
    }
    
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId });
      socketRef.current.disconnect();
    }
  };

  /**
   * حساب عدد الأعمدة للعرض الشبكي
   */
  const getGridColumns = () => {
    const totalParticipants = participants.length + 1; // +1 للمستخدم المحلي
    if (totalParticipants <= 2) return 2;
    if (totalParticipants <= 4) return 2;
    if (totalParticipants <= 6) return 3;
    if (totalParticipants <= 9) return 3;
    return 4;
  };

  return (
    <div className="group-video-call">
      {/* أزرار التحكم */}
      <div className="video-controls">
        <button onClick={toggleViewMode} className="control-btn">
          {viewMode === 'grid' ? '👤 عرض المتحدث' : '🔲 عرض شبكي'}
        </button>
        
        {isHost && (
          <button onClick={muteAll} className="control-btn host-btn">
            🔇 كتم الجميع
          </button>
        )}

        <button onClick={() => { cleanup(); onLeave(); }} className="control-btn leave-btn">
          📞 مغادرة
        </button>

        <div className="participant-count">
          {participants.length + 1} / {maxParticipants}
        </div>
      </div>

      {/* عرض الفيديو */}
      {viewMode === 'grid' ? (
        <div 
          className="video-grid" 
          style={{ gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` }}
        >
          {/* الفيديو المحلي */}
          <div className="video-container local">
            <video ref={localVideoRef} autoPlay muted playsInline />
            <div className="video-label">أنت</div>
          </div>

          {/* فيديوهات المشاركين */}
          {participants.map(participant => (
            <ParticipantVideo
              key={participant.socketId}
              participant={participant}
              isHost={isHost}
              onRemove={() => removeParticipant(participant.socketId)}
            />
          ))}
        </div>
      ) : (
        <div className="speaker-view">
          {/* المتحدث النشط */}
          <div className="main-speaker">
            {activeSpeaker ? (
              <ParticipantVideo
                participant={activeSpeaker}
                isHost={isHost}
                onRemove={() => removeParticipant(activeSpeaker.socketId)}
              />
            ) : (
              <div className="video-container local">
                <video ref={localVideoRef} autoPlay muted playsInline />
                <div className="video-label">أنت</div>
              </div>
            )}
          </div>

          {/* المشاركون الآخرون */}
          <div className="other-participants">
            <div className="video-container local small">
              <video ref={localVideoRef} autoPlay muted playsInline />
              <div className="video-label">أنت</div>
            </div>

            {participants
              .filter(p => p.socketId !== activeSpeaker?.socketId)
              .map(participant => (
                <ParticipantVideo
                  key={participant.socketId}
                  participant={participant}
                  isHost={isHost}
                  onRemove={() => removeParticipant(participant.socketId)}
                  small
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * مكون فيديو المشارك
 */
const ParticipantVideo = ({ participant, isHost, onRemove, small = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className={`video-container ${small ? 'small' : ''}`} data-testid={`participant-${participant.socketId}`}>
      <video ref={videoRef} autoPlay playsInline />
      <div className="video-label">
        {participant.userName}
        {participant.audioEnabled === false && ' 🔇'}
        {participant.videoEnabled === false && ' 📹'}
      </div>
      {isHost && (
        <button onClick={onRemove} className="remove-btn" title="إزالة المشارك">
          ❌
        </button>
      )}
    </div>
  );
};

export default GroupVideoCall;
