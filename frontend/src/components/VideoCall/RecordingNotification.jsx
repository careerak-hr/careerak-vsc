import React from 'react';
import './RecordingNotification.css';

/**
 * RecordingNotification Component
 * إشعار واضح للطرفين عند تسجيل المقابلة
 * 
 * Features:
 * - إشعار بارز ومرئي للتسجيل
 * - مؤشر وامض (recording indicator)
 * - معلومات واضحة عن التسجيل
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متجاوب
 * 
 * Requirements: 2.2 (إشعار واضح للطرفين عند التسجيل)
 */
const RecordingNotification = ({ 
  isRecording = false,
  recordingDuration = 0, // بالثواني
  language = 'ar',
  position = 'top', // 'top', 'bottom', 'floating'
  showDetails = true
}) => {
  if (!isRecording) return null;

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const translations = {
    ar: {
      recording: 'جاري التسجيل',
      recordingInProgress: 'المقابلة قيد التسجيل',
      duration: 'المدة',
      notice: 'تنبيه: هذه المقابلة يتم تسجيلها',
      privacyNote: 'سيتم حفظ التسجيل بشكل آمن ومشفر'
    },
    en: {
      recording: 'Recording',
      recordingInProgress: 'Interview is being recorded',
      duration: 'Duration',
      notice: 'Notice: This interview is being recorded',
      privacyNote: 'Recording will be saved securely and encrypted'
    },
    fr: {
      recording: 'Enregistrement',
      recordingInProgress: 'L\'entretien est en cours d\'enregistrement',
      duration: 'Durée',
      notice: 'Avis: Cet entretien est enregistré',
      privacyNote: 'L\'enregistrement sera sauvegardé de manière sécurisée et cryptée'
    }
  };

  const t = translations[language] || translations.ar;

  return (
    <div className={`recording-notification recording-notification-${position}`}>
      {/* Recording Indicator */}
      <div className="recording-indicator">
        <div className="recording-dot"></div>
        <span className="recording-text">{t.recording}</span>
      </div>

      {/* Recording Details */}
      {showDetails && (
        <div className="recording-details">
          <div className="recording-info">
            <span className="recording-icon">🔴</span>
            <span className="recording-message">{t.recordingInProgress}</span>
          </div>
          
          <div className="recording-duration">
            <span className="duration-label">{t.duration}:</span>
            <span className="duration-value">{formatDuration(recordingDuration)}</span>
          </div>
        </div>
      )}

      {/* Privacy Notice (Floating position only) */}
      {position === 'floating' && (
        <div className="recording-privacy-notice">
          <p className="notice-title">⚠️ {t.notice}</p>
          <p className="notice-text">{t.privacyNote}</p>
        </div>
      )}
    </div>
  );
};

export default RecordingNotification;
