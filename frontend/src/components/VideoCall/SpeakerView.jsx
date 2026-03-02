import React, { useEffect, useRef, useState } from 'react';
import './SpeakerView.css';

/**
 * SpeakerView Component
 * عرض المتحدث الحالي (Speaker View) للمقابلات الجماعية
 * 
 * Features:
 * - عرض المتحدث النشط بشكل كبير
 * - كشف تلقائي للمتحدث بناءً على مستوى الصوت
 * - عرض المشاركين الآخرين في شريط جانبي
 * - إمكانية تثبيت متحدث معين (pin)
 * - دعم حتى 10 مشاركين
 * 
 * Requirements: 7.3 (عرض المتحدث الحالي)
 */
const SpeakerView = ({
  participants = [], // Array of { id, name, stream, isSpeaking, audioLevel }
  localStream,
  localParticipant = { id: 'local', name: 'أنت' },
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled = true,
  isVideoEnabled = true,
  connectionQuality = 'good',
  language = 'ar',
  // Recording & Timer props
  isRecording = false,
  recordingDuration = 0,
  interviewStartTime = null,
  showInterviewTimer = true
}) => {
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [pinnedSpeaker, setPinnedSpeaker] = useState(null);
  const [audioLevels, setAudioLevels] = useState({});
  const audioContextRef = useRef(null);
  const analysersRef = useRef({});

  // تحديد المتحدث النشط بناءً على مستوى الصوت
  useEffect(() => {
    if (pinnedSpeaker) return; // إذا كان هناك متحدث مثبت، لا نغير

    const speakingParticipants = participants.filter(p => p.isSpeaking);
    
    if (speakingParticipants.length > 0) {
      // اختيار المتحدث بأعلى مستوى صوت
      const loudest = speakingParticipants.reduce((prev, current) => 
        (current.audioLevel || 0) > (prev.audioLevel || 0) ? current : prev
      );
      setActiveSpeaker(loudest);
    } else if (participants.length > 0 && !activeSpeaker) {
      // إذا لم يكن هناك متحدث، اعرض أول مشارك
      setActiveSpeaker(participants[0]);
    }
  }, [participants, pinnedSpeaker, activeSpeaker]);

  // إعداد Audio Context لتحليل مستوى الصوت
  useEffect(() => {
    if (!window.AudioContext && !window.webkitAudioContext) return;

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // تحليل مستوى الصوت لكل مشارك
  useEffect(() => {
    if (!audioContextRef.current) return;

    participants.forEach(participant => {
      if (!participant.stream || analysersRef.current[participant.id]) return;

      try {
        const audioTrack = participant.stream.getAudioTracks()[0];
        if (!audioTrack) return;

        const source = audioContextRef.current.createMediaStreamSource(
          new MediaStream([audioTrack])
        );
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        analysersRef.current[participant.id] = analyser;

        // مراقبة مستوى الصوت
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudioLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          setAudioLevels(prev => ({
            ...prev,
            [participant.id]: average
          }));
        };

        const interval = setInterval(checkAudioLevel, 100);
        
        // Cleanup
        return () => {
          clearInterval(interval);
          source.disconnect();
        };
      } catch (error) {
        console.error('Error setting up audio analyser:', error);
      }
    });
  }, [participants]);

  const handlePinSpeaker = (participant) => {
    if (pinnedSpeaker?.id === participant.id) {
      setPinnedSpeaker(null); // إلغاء التثبيت
    } else {
      setPinnedSpeaker(participant);
      setActiveSpeaker(participant);
    }
  };

  const displayedSpeaker = pinnedSpeaker || activeSpeaker;

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#FFC107';
      case 'poor': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getQualityText = () => {
    const texts = {
      ar: { excellent: 'ممتاز', good: 'جيد', poor: 'ضعيف', unknown: 'غير متصل' },
      en: { excellent: 'Excellent', good: 'Good', poor: 'Poor', unknown: 'Disconnected' },
      fr: { excellent: 'Excellent', good: 'Bon', poor: 'Faible', unknown: 'Déconnecté' }
    };
    return texts[language]?.[connectionQuality] || texts.ar[connectionQuality];
  };

  return (
    <div className="speaker-view-container">
      {/* Main Speaker Video */}
      <div className="main-speaker-area">
        {displayedSpeaker ? (
          <ParticipantVideo
            participant={displayedSpeaker}
            isMain={true}
            isPinned={pinnedSpeaker?.id === displayedSpeaker.id}
            audioLevel={audioLevels[displayedSpeaker.id]}
            language={language}
          />
        ) : (
          <div className="no-speaker-placeholder">
            <div className="placeholder-icon">👥</div>
            <p>{language === 'ar' ? 'في انتظار المشاركين...' : 'Waiting for participants...'}</p>
          </div>
        )}

        {/* Connection Quality Indicator */}
        <div className="connection-quality" style={{ borderColor: getQualityColor() }}>
          <div className="quality-dot" style={{ backgroundColor: getQualityColor() }} />
          <span>{getQualityText()}</span>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="recording-indicator-speaker">
            <span className="recording-dot"></span>
            <span>{language === 'ar' ? 'جاري التسجيل' : 'Recording'}</span>
            <span className="recording-time">
              {Math.floor(recordingDuration / 60)}:{String(recordingDuration % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Interview Timer */}
        {showInterviewTimer && interviewStartTime && (
          <InterviewTimerDisplay
            startTime={interviewStartTime}
            language={language}
          />
        )}
      </div>

      {/* Participants Sidebar */}
      <div className="participants-sidebar">
        {/* Local Participant */}
        <ParticipantThumbnail
          participant={localParticipant}
          stream={localStream}
          isLocal={true}
          isActive={displayedSpeaker?.id === 'local'}
          isPinned={pinnedSpeaker?.id === 'local'}
          audioLevel={audioLevels['local']}
          onPin={() => handlePinSpeaker({ ...localParticipant, stream: localStream })}
          language={language}
        />

        {/* Remote Participants */}
        {participants.map(participant => (
          <ParticipantThumbnail
            key={participant.id}
            participant={participant}
            stream={participant.stream}
            isActive={displayedSpeaker?.id === participant.id}
            isPinned={pinnedSpeaker?.id === participant.id}
            audioLevel={audioLevels[participant.id]}
            onPin={() => handlePinSpeaker(participant)}
            language={language}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="speaker-view-controls">
        <button
          className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
          onClick={onToggleAudio}
          title={isAudioEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
        >
          {isAudioEnabled ? '🎤' : '🔇'}
        </button>
        
        <button
          className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
          onClick={onToggleVideo}
          title={isVideoEnabled ? 'إيقاف الفيديو' : 'تفعيل الفيديو'}
        >
          {isVideoEnabled ? '📹' : '📷'}
        </button>

        <div className="participants-count">
          <span>👥</span>
          <span>{participants.length + 1}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * ParticipantVideo Component
 * عرض فيديو المشارك الرئيسي
 */
const ParticipantVideo = ({ participant, isMain, isPinned, audioLevel, language }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const isSpeaking = audioLevel > 30; // عتبة الكشف عن الكلام

  return (
    <div className={`participant-video ${isMain ? 'main' : ''} ${isSpeaking ? 'speaking' : ''}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.id === 'local'}
        className="video-element"
      />
      
      <div className="participant-info">
        <span className="participant-name">{participant.name}</span>
        {isPinned && (
          <span className="pin-indicator">📌</span>
        )}
        {isSpeaking && (
          <span className="speaking-indicator">🔊</span>
        )}
      </div>

      {/* Audio Level Indicator */}
      {audioLevel > 0 && (
        <div className="audio-level-bar">
          <div 
            className="audio-level-fill" 
            style={{ width: `${Math.min(audioLevel, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * ParticipantThumbnail Component
 * صورة مصغرة للمشارك في الشريط الجانبي
 */
const ParticipantThumbnail = ({ 
  participant, 
  stream, 
  isLocal, 
  isActive, 
  isPinned, 
  audioLevel,
  onPin,
  language 
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isSpeaking = audioLevel > 30;

  return (
    <div 
      className={`participant-thumbnail ${isActive ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}
      onClick={onPin}
      title={isPinned ? (language === 'ar' ? 'إلغاء التثبيت' : 'Unpin') : (language === 'ar' ? 'تثبيت' : 'Pin')}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="thumbnail-video"
      />
      
      <div className="thumbnail-overlay">
        <span className="thumbnail-name">{participant.name}</span>
        {isPinned && <span className="pin-icon">📌</span>}
        {isSpeaking && <span className="speaking-icon">🔊</span>}
      </div>

      {/* Audio Level Indicator */}
      {audioLevel > 0 && (
        <div className="thumbnail-audio-level">
          <div 
            className="audio-bar" 
            style={{ height: `${Math.min(audioLevel, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * InterviewTimerDisplay Component
 * عرض مؤقت المقابلة
 */
const InterviewTimerDisplay = ({ startTime, language }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  return (
    <div className="interview-timer-display">
      <span className="timer-icon">⏱️</span>
      <span className="timer-text">
        {hours > 0 && `${hours}:`}
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default SpeakerView;
