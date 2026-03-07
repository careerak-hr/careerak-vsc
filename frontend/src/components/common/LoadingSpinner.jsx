import React, { memo } from 'react';
import './LoadingSpinner.css';

/**
 * Optimized loading spinner component
 * Uses CSS animations for better performance
 */
const LoadingSpinner = memo(({ 
  size = 'medium', 
  message = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClass = `spinner-${size}`;
  const containerClass = fullScreen ? 'spinner-container fullscreen' : 'spinner-container';

  return (
    <div className={containerClass}>
      <div className={`spinner ${sizeClass}`} role="status" aria-live="polite">
        <div className="spinner-circle"></div>
      </div>
      {message && (
        <p className="spinner-message">{message}</p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
