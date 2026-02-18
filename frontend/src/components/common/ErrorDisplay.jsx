import React from 'react';
import './ErrorDisplay.css';

/**
 * مكون عرض رسائل الخطأ المحسّنة
 * Requirement 8.1: رسائل واضحة ومحددة مع اقتراحات للحل
 */
const ErrorDisplay = ({ message, suggestion, type = 'error', className = '' }) => {
  if (!message) return null;

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`error-display error-display-${type} ${className}`}>
      <div className="error-display-content">
        <span className="error-display-icon">{icons[type]}</span>
        <div className="error-display-text">
          <p className="error-display-message">{message}</p>
          {suggestion && (
            <p className="error-display-suggestion">
              <span className="error-display-suggestion-icon">💡</span>
              {suggestion}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
