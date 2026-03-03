import React, { useState } from 'react';
import './ScreenShareControls.css';

/**
 * ScreenShareControls Component
 * مكون التحكم في مشاركة الشاشة
 * 
 * Features:
 * - Start/Stop screen sharing
 * - Screen sharing indicator
 * - Source selection (screen/window/tab)
 * - Multi-language support (ar, en, fr)
 * 
 * Requirements: 3.1, 3.4, 3.5
 */
const ScreenShareControls = ({
  isSharing = false,
  onStartSharing,
  onStopSharing,
  onSwitchSource,
  currentSource = null, // 'screen', 'window', 'tab'
  screenShareSettings = null, // { width, height, quality, etc. }
  language = 'ar',
  disabled = false,
  showSourceSelector = true,
  showQualityIndicator = true
}) => {
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Translations
  const translations = {
    ar: {
      startSharing: 'مشاركة الشاشة',
      stopSharing: 'إيقاف المشاركة',
      switchSource: 'تبديل المصدر',
      sharingNow: 'يشارك الشاشة الآن',
      selectSource: 'اختر المصدر',
      screen: 'الشاشة الكاملة',
      window: 'نافذة محددة',
      tab: 'تبويب المتصفح',
      quality: 'الجودة',
      resolution: 'الدقة'
    },
    en: {
      startSharing: 'Share Screen',
      stopSharing: 'Stop Sharing',
      switchSource: 'Switch Source',
      sharingNow: 'Sharing Screen Now',
      selectSource: 'Select Source',
      screen: 'Entire Screen',
      window: 'Specific Window',
      tab: 'Browser Tab',
      quality: 'Quality',
      resolution: 'Resolution'
    },
    fr: {
      startSharing: 'Partager l\'écran',
      stopSharing: 'Arrêter le partage',
      switchSource: 'Changer la source',
      sharingNow: 'Partage d\'écran en cours',
      selectSource: 'Sélectionner la source',
      screen: 'Écran complet',
      window: 'Fenêtre spécifique',
      tab: 'Onglet du navigateur',
      quality: 'Qualité',
      resolution: 'Résolution'
    }
  };

  const t = translations[language] || translations.ar;

  const handleStartSharing = async (preferredSource = null) => {
    if (isLoading || disabled) return;

    try {
      setIsLoading(true);
      setShowSourceMenu(false);
      
      const options = preferredSource ? { preferredSource } : {};
      await onStartSharing(options);
    } catch (error) {
      console.error('Error starting screen share:', error);
      alert(getErrorMessage(error, language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSharing = async () => {
    if (isLoading || disabled) return;

    try {
      setIsLoading(true);
      await onStopSharing();
    } catch (error) {
      console.error('Error stopping screen share:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchSource = async (newSource) => {
    if (isLoading || disabled) return;

    try {
      setIsLoading(true);
      setShowSourceMenu(false);
      await onSwitchSource({ preferredSource: newSource });
    } catch (error) {
      console.error('Error switching source:', error);
      alert(getErrorMessage(error, language));
    } finally {
      setIsLoading(false);
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

  const getQualityBadge = () => {
    if (!screenShareSettings) return null;

    const { quality, width, height } = screenShareSettings;
    
    return (
      <div className="quality-badge">
        <span className="quality-label">{quality}</span>
        <span className="resolution-label">{width}x{height}</span>
      </div>
    );
  };

  return (
    <div className={`screen-share-controls ${language}`}>
      {/* Sharing Indicator */}
      {isSharing && (
        <div className="sharing-indicator">
          <div className="indicator-dot pulsing" />
          <span className="indicator-text">{t.sharingNow}</span>
          {showQualityIndicator && getQualityBadge()}
        </div>
      )}

      {/* Main Control Button */}
      <div className="control-button-wrapper">
        {!isSharing ? (
          <>
            <button
              className={`control-btn start-sharing ${isLoading ? 'loading' : ''}`}
              onClick={() => showSourceSelector ? setShowSourceMenu(!showSourceMenu) : handleStartSharing()}
              disabled={disabled || isLoading}
              title={t.startSharing}
            >
              <span className="btn-icon">📺</span>
              <span className="btn-text">{t.startSharing}</span>
              {isLoading && <span className="spinner">⏳</span>}
            </button>

            {/* Source Selection Menu */}
            {showSourceMenu && showSourceSelector && (
              <div className="source-menu">
                <div className="menu-header">{t.selectSource}</div>
                <button
                  className="source-option"
                  onClick={() => handleStartSharing('screen')}
                  disabled={isLoading}
                >
                  <span className="option-icon">🖥️</span>
                  <span className="option-text">{t.screen}</span>
                </button>
                <button
                  className="source-option"
                  onClick={() => handleStartSharing('window')}
                  disabled={isLoading}
                >
                  <span className="option-icon">🪟</span>
                  <span className="option-text">{t.window}</span>
                </button>
                <button
                  className="source-option"
                  onClick={() => handleStartSharing('tab')}
                  disabled={isLoading}
                >
                  <span className="option-icon">🌐</span>
                  <span className="option-text">{t.tab}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="sharing-controls">
            <button
              className={`control-btn stop-sharing ${isLoading ? 'loading' : ''}`}
              onClick={handleStopSharing}
              disabled={disabled || isLoading}
              title={t.stopSharing}
            >
              <span className="btn-icon">⏹️</span>
              <span className="btn-text">{t.stopSharing}</span>
            </button>

            {showSourceSelector && onSwitchSource && (
              <button
                className={`control-btn switch-source ${isLoading ? 'loading' : ''}`}
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                disabled={disabled || isLoading}
                title={t.switchSource}
              >
                <span className="btn-icon">🔄</span>
              </button>
            )}

            {/* Switch Source Menu */}
            {showSourceMenu && showSourceSelector && onSwitchSource && (
              <div className="source-menu">
                <div className="menu-header">{t.switchSource}</div>
                <button
                  className={`source-option ${currentSource === 'screen' ? 'active' : ''}`}
                  onClick={() => handleSwitchSource('screen')}
                  disabled={isLoading || currentSource === 'screen'}
                >
                  <span className="option-icon">🖥️</span>
                  <span className="option-text">{t.screen}</span>
                </button>
                <button
                  className={`source-option ${currentSource === 'window' ? 'active' : ''}`}
                  onClick={() => handleSwitchSource('window')}
                  disabled={isLoading || currentSource === 'window'}
                >
                  <span className="option-icon">🪟</span>
                  <span className="option-text">{t.window}</span>
                </button>
                <button
                  className={`source-option ${currentSource === 'tab' ? 'active' : ''}`}
                  onClick={() => handleSwitchSource('tab')}
                  disabled={isLoading || currentSource === 'tab'}
                >
                  <span className="option-icon">🌐</span>
                  <span className="option-text">{t.tab}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Get error message based on error type and language
 */
function getErrorMessage(error, language) {
  const messages = {
    ar: {
      denied: 'تم رفض إذن مشاركة الشاشة',
      notFound: 'لم يتم العثور على مصدر لمشاركة الشاشة',
      notSupported: 'مشاركة الشاشة غير مدعومة في هذا المتصفح',
      cancelled: 'تم إلغاء مشاركة الشاشة',
      default: 'حدث خطأ أثناء مشاركة الشاشة'
    },
    en: {
      denied: 'Screen sharing permission denied',
      notFound: 'No screen sharing source available',
      notSupported: 'Screen sharing not supported in this browser',
      cancelled: 'Screen sharing cancelled',
      default: 'Error occurred during screen sharing'
    },
    fr: {
      denied: 'Permission de partage d\'écran refusée',
      notFound: 'Aucune source de partage d\'écran disponible',
      notSupported: 'Partage d\'écran non pris en charge dans ce navigateur',
      cancelled: 'Partage d\'écran annulé',
      default: 'Erreur lors du partage d\'écran'
    }
  };

  const lang = messages[language] || messages.ar;
  const message = error.message || '';

  if (message.includes('permission denied')) return lang.denied;
  if (message.includes('not available')) return lang.notFound;
  if (message.includes('not supported')) return lang.notSupported;
  if (message.includes('cancelled')) return lang.cancelled;
  
  return lang.default;
}

export default ScreenShareControls;
