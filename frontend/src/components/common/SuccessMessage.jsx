import React, { useEffect, useState } from 'react';
import './SuccessMessage.css';

/**
 * مكون رسالة النجاح
 * Requirements: 8.7, 8.8
 * 
 * - رسالة نجاح بعد التسجيل
 * - إعادة توجيه تلقائية
 */
const SuccessMessage = ({
  title,
  message,
  redirectUrl = null,
  redirectDelay = 3000,
  onRedirect = null,
  showCountdown = true,
  icon = '✅',
  className = ''
}) => {
  const [countdown, setCountdown] = useState(Math.floor(redirectDelay / 1000));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation entrance
    setIsVisible(true);

    // Countdown timer
    if (showCountdown && redirectUrl) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showCountdown, redirectUrl]);

  useEffect(() => {
    // Auto redirect
    if (redirectUrl && redirectDelay > 0) {
      const timer = setTimeout(() => {
        if (onRedirect) {
          onRedirect();
        } else {
          window.location.href = redirectUrl;
        }
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [redirectUrl, redirectDelay, onRedirect]);

  return (
    <div className={`success-message-overlay ${isVisible ? 'success-message-visible' : ''}`}>
      <div className="success-message-card">
        <div className="success-message-icon">{icon}</div>
        
        <h2 className="success-message-title">{title}</h2>
        
        {message && (
          <p className="success-message-text">{message}</p>
        )}

        {showCountdown && redirectUrl && countdown > 0 && (
          <div className="success-message-countdown">
            <div className="success-message-countdown-circle">
              <svg className="success-message-countdown-svg" viewBox="0 0 36 36">
                <path
                  className="success-message-countdown-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="success-message-countdown-progress"
                  strokeDasharray={`${(countdown / (redirectDelay / 1000)) * 100}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="success-message-countdown-number">{countdown}</span>
            </div>
            <p className="success-message-countdown-text">
              سيتم التوجيه تلقائياً...
            </p>
          </div>
        )}

        {redirectUrl && (
          <button
            onClick={() => {
              if (onRedirect) {
                onRedirect();
              } else {
                window.location.href = redirectUrl;
              }
            }}
            className="success-message-button"
            aria-label="المتابعة الآن"
          >
            المتابعة الآن
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;
