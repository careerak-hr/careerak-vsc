import React from 'react';
import './Spinner.css';

/**
 * مكون Spinner للتحميل
 * Requirement 8.6
 */
const Spinner = ({ 
  size = 'medium', 
  color = 'primary',
  text = '',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white'
  };

  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
