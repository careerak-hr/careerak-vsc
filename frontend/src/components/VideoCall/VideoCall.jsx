import React, { useEffect, useRef, useState } from 'react';
import RecordingNotification from './RecordingNotification';
import './VideoCall.css';

/**
 * VideoCall Component
 * مكون مقابلة الفيديو مع دعم HD (720p+)
 * 
 * Features:
 * - HD video quality (720p minimum, 1280x720)
 * - Local and remote video streams
 * - Audio/Video controls (mute, disable)
 * - Connection quality indicator
 * - Recording notification (Requirements 2.2)
 */
const VideoCall = ({ 
  localStream, 
  remoteStream, 
  onToggleAudio, 
  onToggleVideo,
  onSwitchCamera, // New prop for camera switching
  isAudioEnabled = true,
  isVideoEnabled = true,
  connectionQuality = 'good', // 'excellent', 'good', 'poor'
  hasMultipleCameras = false, // New prop to show/hide switch button
  isRecording = false, // Recording state
  recordingDuration = 0, // Recording duration in seconds
  language = 'ar', // Language for recording notification
  recordingNotificationPosition = 'top' // 'top', 'bottom', 'floating'
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localVideoStats, setLocalVideoStats] = useState(null);
  const [remoteVideoStats, setRemoteVideoStats] = useState(null);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  // Setup local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Setup remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Monitor video quality
  useEffect(() => {
    if (!localVideoRef.current) return;

    const checkVideoQuality = () => {
      const video = localVideoRef.current;
      if (video && video.videoWidth && video.videoHeight) {
        setLocalVideoStats({
          width: video.videoWidth,
          height: video.videoHeight,
          isHD: video.videoHeight >= 720
        });
      }
    };

    const interval = setInterval(checkVideoQuality, 2000);
    return () => clearInterval(interval);
  }, [localStream]);

  useEffect(() => {
    if (!remoteVideoRef.current) return;

    const checkVideoQuality = () => {
      const video = remoteVideoRef.current;
      if (video && video.videoWidth && video.videoHeight) {
        setRemoteVideoStats({
          width: video.videoWidth,
          height: video.videoHeight,
          isHD: video.videoHeight >= 720
        });
      }
    };

    const interval = setInterval(checkVideoQuality, 2000);
    return () => clearInterval(interval);
  }, [remoteStream]);

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return '#4CAF50';
      case 'good': return '#FFC107';
      case 'poor': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getQualityText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'ممتاز';
      case 'good': return 'جيد';
      case 'poor': return 'ضعيف';
      default: return 'غير متصل';
    }
  };

  const handleSwitchCamera = async () => {
    if (!onSwitchCamera || isSwitchingCamera) return;
    
    try {
      setIsSwitchingCamera(true);
      await onSwitchCamera();
    } catch (error) {
      console.error('Error switching camera:', error);
      alert('فشل تبديل الكاميرا. تأكد من أن جهازك يحتوي على كاميرا أمامية وخلفية.');
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  return (
    <div className="video-call-container">
      {/* Recording Notification */}
      <RecordingNotification
        isRecording={isRecording}
        recordingDuration={recordingDuration}
        language={language}
        position={recordingNotificationPosition}
        showDetails={true}
      />

      {/* Remote Video (Main) */}
      <div className="remote-video-wrapper">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="remote-video"
        />
        {!remoteStream && (
          <div className="no-video-placeholder">
            <div className="placeholder-icon">📹</div>
            <p>في انتظار الطرف الآخر...</p>
          </div>
        )}
        
        {/* Remote Video Quality Badge */}
        {remoteVideoStats && (
          <div className="video-quality-badge remote">
            {remoteVideoStats.isHD ? '🟢 HD' : '🟡 SD'} 
            <span className="resolution">
              {remoteVideoStats.width}x{remoteVideoStats.height}
            </span>
          </div>
        )}

        {/* Connection Quality Indicator */}
        <div className="connection-quality" style={{ borderColor: getQualityColor() }}>
          <div className="quality-dot" style={{ backgroundColor: getQualityColor() }} />
          <span>{getQualityText()}</span>
        </div>
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="local-video-wrapper">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="local-video"
        />
        {!isVideoEnabled && (
          <div className="video-disabled-overlay">
            <span>📷</span>
          </div>
        )}
        
        {/* Local Video Quality Badge */}
        {localVideoStats && (
          <div className="video-quality-badge local">
            {localVideoStats.isHD ? '🟢 HD' : '🟡 SD'}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="video-controls">
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

        {/* Camera Switch Button (Mobile Only) */}
        {hasMultipleCameras && (
          <button
            className={`control-btn ${isSwitchingCamera ? 'loading' : ''}`}
            onClick={handleSwitchCamera}
            disabled={isSwitchingCamera || !isVideoEnabled}
            title="تبديل الكاميرا"
          >
            {isSwitchingCamera ? '⏳' : '🔄'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
