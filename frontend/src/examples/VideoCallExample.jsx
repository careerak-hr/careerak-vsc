import React, { useEffect, useState } from 'react';
import VideoCall from '../components/VideoCall/VideoCall';
import WebRTCService from '../services/webrtcService';

/**
 * VideoCall Example
 * مثال على استخدام مكون VideoCall مع WebRTC
 * 
 * هذا المثال يوضح:
 * - كيفية الحصول على وسائط المستخدم (كاميرا + ميكروفون)
 * - كيفية عرض الفيديو المحلي
 * - كيفية التحكم في الصوت والفيديو
 * - كيفية مراقبة جودة الاتصال
 */
const VideoCallExample = () => {
  const [webrtcService] = useState(() => new WebRTCService());
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Initialize media on mount
  useEffect(() => {
    initializeMedia();

    // Cleanup on unmount
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

  const initializeMedia = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request user media with HD constraints
      const stream = await webrtcService.getUserMedia();
      setLocalStream(stream);

      // Create peer connection
      webrtcService.createPeerConnection();

      // Check if device has multiple cameras
      const multipleCameras = await webrtcService.hasMultipleCameras();
      setHasMultipleCameras(multipleCameras);

      console.log('✅ Media initialized successfully');
      console.log('📷 Multiple cameras available:', multipleCameras);
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
      />

      {/* Info Panel */}
      <div style={styles.infoPanel}>
        <h3 style={styles.infoTitle}>معلومات الاتصال</h3>
        <div style={styles.infoItem}>
          <span>الصوت:</span>
          <span style={{ color: isAudioEnabled ? '#4CAF50' : '#F44336' }}>
            {isAudioEnabled ? '✓ مفعّل' : '✗ معطّل'}
          </span>
        </div>
        <div style={styles.infoItem}>
          <span>الفيديو:</span>
          <span style={{ color: isVideoEnabled ? '#4CAF50' : '#F44336' }}>
            {isVideoEnabled ? '✓ مفعّل' : '✗ معطّل'}
          </span>
        </div>
        <div style={styles.infoItem}>
          <span>جودة الاتصال:</span>
          <span>{connectionQuality === 'excellent' ? 'ممتاز' : 
                 connectionQuality === 'good' ? 'جيد' : 
                 connectionQuality === 'poor' ? 'ضعيف' : 'غير معروف'}</span>
        </div>
        <div style={styles.infoItem}>
          <span>كاميرات متعددة:</span>
          <span style={{ color: hasMultipleCameras ? '#4CAF50' : '#9E9E9E' }}>
            {hasMultipleCameras ? '✓ نعم' : '✗ لا'}
          </span>
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
  infoPanel: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '15px',
    borderRadius: '8px',
    minWidth: '200px',
    zIndex: 100,
  },
  infoTitle: {
    fontSize: '1rem',
    marginBottom: '10px',
    borderBottom: '1px solid #444',
    paddingBottom: '5px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '0.9rem',
  },
};

export default VideoCallExample;
