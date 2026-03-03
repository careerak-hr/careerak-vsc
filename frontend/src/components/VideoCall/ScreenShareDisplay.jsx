import React, { useEffect, useRef } from 'react';
import './ScreenShareDisplay.css';

/**
 * ScreenShareDisplay Component
 * مكون عرض الشاشة المشاركة
 * 
 * Features:
 * - Display shared screen stream
 * - Full screen mode
 * - Quality indicator
 * - Source type indicator
 * - Multi-language support
 * 
 * Requirements: 3.4, 3.5
 */
const ScreenShareDisplay = ({
  screenStream,
  isSharing = false,
  sharerName = '',
  currentSource = null, // 'screen', 'window', 'tab'
  screenShareSettings = null,
  language = 'ar',
  showControls = true,
  onFullScreen,
  className = ''
}) => {
  const videoRef = useRef(null);

  // Translations
  const translations = {
    ar: {
      sharingScreen: 'يشارك الشاشة',
      fullScreen: 'ملء الشاشة',
      exitFullScreen: 'خروج من ملء الشاشة',
      screen: 'الشاشة الكاملة',
      window: 'نافذة',
      tab: 'تبويب',
      quality: 'الجودة',
      noScreenShare: 'لا توجد مشاركة شاشة نشطة'
    },
    en: {
      sharingScreen: 'is sharing screen',
      fullScreen: 'Full Screen',
      exitFullScreen: 'Exit Full Screen',
      screen: 'Entire Screen',
      window: 'Window',
      tab: 'Tab',
      quality: 'Quality',
      noScreenShare: 'No active screen share'
    },
    fr: {
      sharingScreen: 'partage l\'écran',
      fullScreen: 'Plein écran',
      exitFullScreen: 'Quitter le plein écran',
      screen: 'Écran complet',
      window: 'Fenêtre',
      tab: 'Onglet',
      quality: 'Qualité',
      noScreenShare: 'Aucun partage d\'écran actif'
    }
  };

  const t = translations[language] || translations.ar;

  // Setup screen stream
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const handleFullScreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }

    if (onFullScreen) {
      onFullScreen(!document.fullscreenElement);
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'screen': return '🖥️';
      case 'window': return '🪟';
      case 'tab': return '🌐';
      default: return '📺';
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'screen': return t.screen;
      case 'window': return t.window;
      case 'tab': return t.tab;
      default: return t.screen;
    }
  };

  if (!isSharing || !screenStream) {
    return (
      <div className={`screen-share-display no-share ${className}`}>
        <div className="no-share-placeholder">
          <div className="placeholder-icon">📺</div>
          <p>{t.noScreenShare}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`screen-share-display ${className} ${language}`}>
      {/* Screen Share Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="screen-share-video"
      />

      {/* Overlay Info */}
      <div className="screen-share-overlay">
        {/* Sharer Info */}
        {sharerName && (
          <div className="sharer-info">
            <span className="sharer-icon">👤</span>
            <span className="sharer-name">{sharerName}</span>
            <span className="sharing-text">{t.sharingScreen}</span>
          </div>
        )}

        {/* Source Type Badge */}
        {currentSource && (
          <div className="source-badge">
            <span className="source-icon">{getSourceIcon(currentSource)}</span>
            <span className="source-label">{getSourceLabel(currentSource)}</span>
          </div>
        )}

        {/* Quality Indicator */}
        {screenShareSettings && (
          <div className="quality-indicator">
            <span className="quality-label">{screenShareSettings.quality}</span>
            <span className="resolution-label">
              {screenShareSettings.width}x{screenShareSettings.height}
            </span>
          </div>
        )}

        {/* Full Screen Button */}
        {showControls && (
          <button
            className="fullscreen-btn"
            onClick={handleFullScreen}
            title={document.fullscreenElement ? t.exitFullScreen : t.fullScreen}
          >
            {document.fullscreenElement ? '⤓' : '⤢'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ScreenShareDisplay;
