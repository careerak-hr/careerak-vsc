import React, { useEffect, useRef, useState } from 'react';
import './ScreenShareDisplay.css';

/**
 * مكون عرض الشاشة المشاركة
 * يعرض stream المشاركة مع معلومات المشارك
 */
const ScreenShareDisplay = ({ 
  stream, 
  sharerName, 
  shareType,
  onClose,
  fullscreen = false 
}) => {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [quality, setQuality] = useState(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      // الحصول على معلومات الجودة
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setQuality({
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate
        });
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  /**
   * تبديل وضع ملء الشاشة
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /**
   * الحصول على نص نوع المشاركة
   */
  const getShareTypeText = () => {
    switch (shareType) {
      case 'screen':
        return 'الشاشة الكاملة';
      case 'window':
        return 'نافذة';
      case 'tab':
        return 'تبويب';
      default:
        return 'مشاركة';
    }
  };

  if (!stream) {
    return null;
  }

  return (
    <div className={`screen-share-display ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="share-header">
        <div className="share-info">
          <div className="sharing-badge">
            <i className="fas fa-circle sharing-pulse"></i>
            <span>يشارك الآن</span>
          </div>
          
          <div className="sharer-info">
            <span className="sharer-name">{sharerName}</span>
            <span className="share-type">{getShareTypeText()}</span>
          </div>

          {quality && (
            <div className="quality-badge">
              {quality.width}x{quality.height}
            </div>
          )}
        </div>

        <div className="share-actions">
          <button
            className="btn-fullscreen"
            onClick={toggleFullscreen}
            title="ملء الشاشة"
          >
            <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
          </button>

          {onClose && (
            <button
              className="btn-close"
              onClick={onClose}
              title="إغلاق"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Video Display */}
      <div className="share-video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="share-video"
        />
      </div>

      {/* Footer Info */}
      <div className="share-footer">
        <div className="connection-status">
          <i className="fas fa-signal"></i>
          <span>جودة الاتصال: ممتازة</span>
        </div>
      </div>
    </div>
  );
};

export default ScreenShareDisplay;
