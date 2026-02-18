import React from 'react';
import './LoadingButton.css';

/**
 * زر مع حالة تحميل
 * Requirements: 8.5, 8.6
 * 
 * - تعطيل الزر أثناء الإرسال
 * - Spinner أو Loading text
 */
const LoadingButton = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  loadingText = 'جاري التحميل...',
  variant = 'primary',
  ...props
}) => {
  const isDisabled = loading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`loading-button loading-button-${variant} ${isDisabled ? 'loading-button-disabled' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="loading-button-content">
          <span className="loading-spinner" />
          <span className="loading-button-text">{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
