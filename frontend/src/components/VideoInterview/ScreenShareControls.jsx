import React, { useState, useEffect } from 'react';
import ScreenShareService from '../../services/screenShareService';
import StopShareConfirmModal from './StopShareConfirmModal';
import './ScreenShareControls.css';

/**
 * مكون التحكم في مشاركة الشاشة
 * يوفر أزرار لبدء/إيقاف مشاركة الشاشة مع خيارات متعددة
 */
const ScreenShareControls = ({ onShareStart, onShareStop, disabled = false }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareType, setShareType] = useState(null);
  const [quality, setQuality] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [screenShareService] = useState(() => new ScreenShareService());

  useEffect(() => {
    // الاستماع لحدث انتهاء المشاركة
    const handleShareEnded = () => {
      handleStopShare();
    };

    window.addEventListener('screenshare-ended', handleShareEnded);

    return () => {
      window.removeEventListener('screenshare-ended', handleShareEnded);
      // تنظيف عند unmount
      if (screenShareService.isSharing()) {
        screenShareService.stopScreenShare();
      }
    };
  }, [screenShareService]);

  /**
   * بدء مشاركة الشاشة
   */
  const handleStartShare = async (type = 'auto') => {
    try {
      setError(null);
      let stream;

      switch (type) {
        case 'screen':
          stream = await screenShareService.startFullScreenShare();
          break;
        case 'window':
          stream = await screenShareService.startWindowShare();
          break;
        case 'tab':
          stream = await screenShareService.startTabShare();
          break;
        default:
          stream = await screenShareService.startScreenShare();
      }

      setIsSharing(true);
      setShareType(screenShareService.getShareType());
      setQuality(screenShareService.getQuality());
      setShowOptions(false);

      // إخطار المكون الأب
      if (onShareStart) {
        onShareStart(stream, screenShareService.getShareType());
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
      setError(error.message);
      setIsSharing(false);
    }
  };

  /**
   * إيقاف مشاركة الشاشة
   */
  const handleStopShare = () => {
    screenShareService.stopScreenShare();
    setIsSharing(false);
    setShareType(null);
    setQuality(null);
    setError(null);
    setShowStopConfirm(false);

    // إخطار المكون الأب
    if (onShareStop) {
      onShareStop();
    }
  };

  /**
   * تبديل مصدر المشاركة
   */
  const handleSwitchSource = async (newType) => {
    try {
      setError(null);
      const stream = await screenShareService.switchSource(newType);
      
      setShareType(screenShareService.getShareType());
      setQuality(screenShareService.getQuality());
      setShowOptions(false);

      // إخطار المكون الأب
      if (onShareStart) {
        onShareStart(stream, screenShareService.getShareType());
      }
    } catch (error) {
      console.error('Error switching source:', error);
      setError(error.message);
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

  // التحقق من دعم مشاركة الشاشة
  if (!ScreenShareService.isSupported()) {
    return (
      <div className="screen-share-controls">
        <div className="error-message">
          مشاركة الشاشة غير مدعومة في هذا المتصفح
        </div>
      </div>
    );
  }

  return (
    <div className="screen-share-controls">
      {/* زر مشاركة الشاشة الرئيسي */}
      {!isSharing ? (
        <div className="share-button-group">
          <button
            className="btn-share-screen"
            onClick={() => handleStartShare('auto')}
            disabled={disabled}
            title="مشاركة الشاشة"
          >
            <i className="fas fa-desktop"></i>
            <span>مشاركة الشاشة</span>
          </button>

          {/* زر الخيارات */}
          <button
            className="btn-share-options"
            onClick={() => setShowOptions(!showOptions)}
            disabled={disabled}
            title="خيارات المشاركة"
          >
            <i className="fas fa-chevron-down"></i>
          </button>
        </div>
      ) : (
        <div className="sharing-controls">
          {/* مؤشر المشاركة النشطة */}
          <div className="sharing-indicator">
            <i className="fas fa-circle sharing-pulse"></i>
            <span>يشارك {getShareTypeText()}</span>
          </div>

          {/* معلومات الجودة */}
          {quality && (
            <div className="quality-info">
              {quality.width}x{quality.height} @ {quality.frameRate}fps
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="sharing-actions">
            <button
              className="btn-switch-source"
              onClick={() => setShowOptions(!showOptions)}
              title="تبديل المصدر"
            >
              <i className="fas fa-exchange-alt"></i>
            </button>

            <button
              className="btn-stop-share"
              onClick={() => setShowStopConfirm(true)}
              title="إيقاف مشاركة الشاشة"
            >
              <i className="fas fa-stop-circle"></i>
              <span>إيقاف المشاركة</span>
            </button>
          </div>
        </div>
      )}

      {/* قائمة الخيارات */}
      {showOptions && (
        <div className="share-options-menu">
          <button
            className="option-item"
            onClick={() => isSharing ? handleSwitchSource('screen') : handleStartShare('screen')}
          >
            <i className="fas fa-desktop"></i>
            <div className="option-text">
              <span className="option-title">الشاشة الكاملة</span>
              <span className="option-desc">مشاركة الشاشة بالكامل</span>
            </div>
          </button>

          <button
            className="option-item"
            onClick={() => isSharing ? handleSwitchSource('window') : handleStartShare('window')}
          >
            <i className="fas fa-window-maximize"></i>
            <div className="option-text">
              <span className="option-title">نافذة محددة</span>
              <span className="option-desc">مشاركة نافذة تطبيق واحدة</span>
            </div>
          </button>

          <button
            className="option-item"
            onClick={() => isSharing ? handleSwitchSource('tab') : handleStartShare('tab')}
          >
            <i className="fas fa-browser"></i>
            <div className="option-text">
              <span className="option-title">تبويب المتصفح</span>
              <span className="option-desc">مشاركة تبويب واحد فقط</span>
            </div>
          </button>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Modal تأكيد الإيقاف */}
      <StopShareConfirmModal
        isOpen={showStopConfirm}
        onConfirm={handleStopShare}
        onCancel={() => setShowStopConfirm(false)}
        shareType={shareType}
      />
    </div>
  );
};

export default ScreenShareControls;
