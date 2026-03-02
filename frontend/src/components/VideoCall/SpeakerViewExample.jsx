import React, { useState, useEffect, useRef } from 'react';
import SpeakerView from './SpeakerView';

/**
 * SpeakerViewExample Component
 * مثال كامل لاستخدام SpeakerView في مقابلة جماعية
 * 
 * Features:
 * - محاكاة مقابلة جماعية مع 5 مشاركين
 * - كشف تلقائي للمتحدث النشط
 * - إمكانية تثبيت متحدث معين
 * - عرض مستوى الصوت لكل مشارك
 */
const SpeakerViewExample = () => {
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [interviewStartTime] = useState(Date.now());
  const [language, setLanguage] = useState('ar');

  // إعداد Local Stream
  useEffect(() => {
    const setupLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        setLocalStream(stream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    setupLocalStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // محاكاة المشاركين (في التطبيق الحقيقي، هذه ستأتي من WebRTC)
  useEffect(() => {
    const mockParticipants = [
      {
        id: 'participant-1',
        name: 'أحمد محمد',
        stream: null, // في التطبيق الحقيقي، هذا سيكون MediaStream
        isSpeaking: false,
        audioLevel: 0
      },
      {
        id: 'participant-2',
        name: 'فاطمة علي',
        stream: null,
        isSpeaking: false,
        audioLevel: 0
      },
      {
        id: 'participant-3',
        name: 'John Smith',
        stream: null,
        isSpeaking: false,
        audioLevel: 0
      },
      {
        id: 'participant-4',
        name: 'Sarah Johnson',
        stream: null,
        isSpeaking: false,
        audioLevel: 0
      }
    ];

    setParticipants(mockParticipants);

    // محاكاة تغيير المتحدث النشط كل 5 ثواني
    const interval = setInterval(() => {
      setParticipants(prev => {
        const updated = prev.map(p => ({
          ...p,
          isSpeaking: false,
          audioLevel: 0
        }));

        // اختيار متحدث عشوائي
        const randomIndex = Math.floor(Math.random() * updated.length);
        updated[randomIndex].isSpeaking = true;
        updated[randomIndex].audioLevel = Math.random() * 100;

        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // محاكاة تغيير جودة الاتصال
  useEffect(() => {
    const qualities = ['excellent', 'good', 'poor'];
    const interval = setInterval(() => {
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      setConnectionQuality(randomQuality);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // محاكاة التسجيل
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(prev => !prev);
    if (isRecording) {
      setRecordingDuration(0);
    }
  };

  const handleChangeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '16px',
        borderRadius: '8px',
        color: '#fff'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Demo Controls</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleToggleRecording}
            style={{
              padding: '8px 16px',
              background: isRecording ? '#F44336' : '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isRecording ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleChangeLanguage('ar')}
              style={{
                padding: '6px 12px',
                background: language === 'ar' ? '#D48161' : '#555',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              العربية
            </button>
            <button
              onClick={() => handleChangeLanguage('en')}
              style={{
                padding: '6px 12px',
                background: language === 'en' ? '#D48161' : '#555',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              English
            </button>
            <button
              onClick={() => handleChangeLanguage('fr')}
              style={{
                padding: '6px 12px',
                background: language === 'fr' ? '#D48161' : '#555',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Français
            </button>
          </div>

          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
            <div>👥 Participants: {participants.length + 1}</div>
            <div>📊 Quality: {connectionQuality}</div>
            <div>🎤 Audio: {isAudioEnabled ? 'On' : 'Off'}</div>
            <div>📹 Video: {isVideoEnabled ? 'On' : 'Off'}</div>
          </div>
        </div>
      </div>

      {/* SpeakerView Component */}
      <SpeakerView
        participants={participants}
        localStream={localStream}
        localParticipant={{ id: 'local', name: language === 'ar' ? 'أنت' : 'You' }}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        connectionQuality={connectionQuality}
        language={language}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        interviewStartTime={interviewStartTime}
        showInterviewTimer={true}
      />
    </div>
  );
};

export default SpeakerViewExample;
