import React, { useEffect, useState } from 'react';
import VideoCall from '../components/VideoCall/VideoCall';
import WebRTCService from '../services/webrtcService';

/**
 * RecordingNotification Example
 * مثال على استخدام إشعار التسجيل في مقابلة الفيديو
 * 
 * هذا المثال يوضح:
 * - كيفية عرض إشعار التسجيل للطرفين
 * - كيفية تتبع مدة التسجيل
 * - كيفية تبديل حالة التسجيل
 * - دعم متعدد اللغات
 * - مواضع مختلفة للإشعار
 * 
 * Requirements: 2.2 (إشعار واضح للطرفين عند التسجيل)
 */
const RecordingNotificationExample = () => {
  const [webrtcService] = useState(() => new WebRTCService());
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [language, setLanguage] = useState('ar');
  const [notificationPosition, setNotificationPosition] = useState('top');
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();

    return () => {
      webrtcService.cleanup();
    };
  }, []);

  // Monitor connection quality
  useEffect(() => {
    const interval = setInterval(() => {
      const quality = webrtcService.getConnectionQuality();
      setConnectionQuality(quality);
    }, 2000);

    return () => clearInterval(interval);
  }, [webrtcService]);

  // Recording duration timer
  useEffect(() => {
    let interval;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const initializeMedia = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await webrtcService.getUserMedia();
      setLocalStream(stream);

      webrtcService.createPeerConnection();

      const multipleCameras = await webrtcService.hasMultipleCameras();
      setHasMultipleCameras(multipleCameras);

      console.log('✅ Media initialized successfully');
      setIsLoading(false);
    } catch (err) {
      console.error('❌ Failed to initialize media:', err);
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    switch (error.name) {
      case 'NotAllowedError':
        return 'يرجى السماح بالوصول إلى الكاميرا والميكروفون';
      case 'NotFoundError':
        return 'لم يتم العثور على كاميرا أو ميكروفون';
      case 'NotReadableError':
        return 'الكاميرا أو الميكروفون قيد الاستخدام من قبل تطبيق آخر';
      case 'OverconstrainedError':
        return 'الكاميرا لا تدعم الجودة المطلوبة';
      default:
        return 'حدث خطأ في الوصول إلى الكاميرا والميكروفون';
    }
  };

  const handleToggleAudio = () => {
    const newState = !isAudioEnabled;
    webrtcService.toggleAudio(newState);
    setIsAudioEnabled(newState);
  };

  const handleToggleVideo = () => {
    const newState = !isVideoEnabled;
    webrtcService.toggleVideo(newState);
    setIsVideoEnabled(newState);
  };

  const handleSwitchCamera = async () => {
    try {
      console.log('🔄 Switching camera...');
      const newStream = await webrtcService.switchCamera();
      setLocalStream(newStream);
      console.log('✅ Camera switched successfully');
    } catch (err) {
      console.error('❌ Failed to switch camera:', err);
      alert('فشل تبديل الكاميرا: ' + err.message);
    }
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      // Start recording
      console.log('🔴 Starting recording...');
      setIsRecording(true);
      // في التطبيق الحقيقي، هنا يتم بدء التسجيل الفعلي
    } else {
      // Stop recording
      console.log('⏹️ Stopping recording...');
      setIsRecording(false);
      // في التطبيق الحقيقي، هنا يتم إيقاف التسجيل الفعلي
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>جاري تحميل الكاميرا والميكروفون...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>خطأ في الوصول إلى الوسائط</h2>
        <p style={styles.errorMessage}>{error}</p>
        <button style={styles.retryButton} onClick={initializeMedia}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <VideoCall
        localStream={localStream}
        remoteStream={remoteStream}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onSwitchCamera={handleSwitchCamera}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        connectionQuality={connectionQuality}
        hasMultipleCameras={hasMultipleCameras}
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        language={language}
        recordingNotificationPosition={notificationPosition}
      />

      {/* Control Panel */}
      <div style={styles.controlPanel}>
        <h3 style={styles.panelTitle}>لوحة التحكم</h3>
        
        {/* Recording Control */}
        <div style={styles.controlSection}>
          <h4 style={styles.sectionTitle}>التسجيل</h4>
          <button
            style={{
              ...styles.controlButton,
              backgroundColor: isRecording ? '#F44336' : '#4CAF50'
            }}
            onClick={handleToggleRecording}
          >
            {isRecording ? '⏹️ إيقاف التسجيل' : '🔴 بدء التسجيل'}
          </button>
          {isRecording && (
            <p style={styles.recordingInfo}>
              المدة: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>

        {/* Language Control */}
        <div style={styles.controlSection}>
          <h4 style={styles.sectionTitle}>اللغة</h4>
          <div style={styles.buttonGroup}>
            <button
              style={{
                ...styles.smallButton,
                backgroundColor: language === 'ar' ? '#304B60' : '#666'
              }}
              onClick={() => setLanguage('ar')}
            >
              العربية
            </button>
            <button
              style={{
                ...styles.smallButton,
                backgroundColor: language === 'en' ? '#304B60' : '#666'
              }}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              style={{
                ...styles.smallButton,
                backgroundColor: language === 'fr' ? '#304B60' : '#666'
              }}
              onClick={() => setLanguage('fr')}
            >
              Français
            </button>
          </div>
        </div>

        {/* Position Control */}
        <div style={styles.controlSection}>
          <h4 style={styles.sectionTitle}>موضع الإشعار</h4>
          <div style={styles.buttonGroup}>
            <button
              style={{
                ...styles.smallButton,
                backgroundColor: notificationPosition === 'top' ? '#304B60' : '#666'
              }}
              onClick={() => setNotificationPosition('top')}
            >
              أعلى
            </button>
            <button
              style={{
                ...styles.smallButton,
                backgroundColor: notificationPosition === 'bottom' ? '#304B60' : '#666'
              }}
              onClick={() => setNotificationPosition('bottom')}
            >
              أسفل
            </button>
            <button
              style={{
                ...styles.smallButton,
                backgroundColor: notificationPosition === 'floating' ? '#304B60' : '#666'
              }}
              onClick={() => setNotificationPosition('floating')}
            >
              عائم
            </button>
          </div>
        </div>

        {/* Info */}
        <div style={styles.infoSection}>
          <p style={styles.infoText}>
            💡 جرّب بدء التسجيل لرؤية الإشعار الواضح للطرفين
          </p>
          <p style={styles.infoText}>
            🌍 غيّر اللغة لرؤية الترجمات المختلفة
          </p>
          <p style={styles.infoText}>
            📍 غيّر موضع الإشعار لاختيار الأنسب
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#fff',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #304B60',
    borderTop: '5px solid #D48161',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '1.2rem',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '1.8rem',
    marginBottom: '10px',
    color: '#F44336',
  },
  errorMessage: {
    fontSize: '1.2rem',
    marginBottom: '30px',
    color: '#ccc',
  },
  retryButton: {
    padding: '12px 30px',
    fontSize: '1rem',
    backgroundColor: '#304B60',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  controlPanel: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: '#fff',
    padding: '20px',
    borderRadius: '12px',
    minWidth: '300px',
    maxWidth: '400px',
    maxHeight: 'calc(100vh - 40px)',
    overflowY: 'auto',
    zIndex: 100,
  },
  panelTitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    borderBottom: '2px solid #304B60',
    paddingBottom: '8px',
  },
  controlSection: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1rem',
    marginBottom: '10px',
    color: '#D48161',
  },
  controlButton: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    fontWeight: '600',
  },
  recordingInfo: {
    marginTop: '8px',
    fontSize: '0.9rem',
    color: '#ccc',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  smallButton: {
    flex: 1,
    minWidth: '80px',
    padding: '8px 12px',
    fontSize: '0.9rem',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
  },
  infoSection: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'rgba(48, 75, 96, 0.3)',
    borderRadius: '8px',
    borderLeft: '3px solid #D48161',
  },
  infoText: {
    fontSize: '0.85rem',
    margin: '5px 0',
    lineHeight: '1.5',
    color: '#ccc',
  },
};

export default RecordingNotificationExample;
