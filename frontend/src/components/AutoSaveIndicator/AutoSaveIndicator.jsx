import React from 'react';
import PropTypes from 'prop-types';
import './AutoSaveIndicator.css';

/**
 * AutoSaveIndicator Component
 * 
 * Displays the current save status of the application form with visual feedback.
 * Shows last saved timestamp and provides a manual save button.
 * 
 * Requirements: 2.5
 */
const AutoSaveIndicator = ({
  isSaving = false,
  lastSaved = null,
  error = null,
  onManualSave = null,
  className = ''
}) => {
  // Format the last saved timestamp
  const formatLastSaved = (timestamp) => {
    if (!timestamp) return null;
    
    const now = new Date();
    const saved = new Date(timestamp);
    const diffMs = now - saved;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs} seconds ago`;
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return saved.toLocaleString();
  };

  // Determine status icon and text
  const getStatusContent = () => {
    if (error) {
      return {
        icon: '⚠️',
        text: 'Save failed',
        statusClass: 'status-error'
      };
    }
    
    if (isSaving) {
      return {
        icon: '⏳',
        text: 'Saving...',
        statusClass: 'status-saving'
      };
    }
    
    if (lastSaved) {
      return {
        icon: '✓',
        text: 'Saved',
        statusClass: 'status-saved'
      };
    }
    
    return {
      icon: '○',
      text: 'Not saved',
      statusClass: 'status-not-saved'
    };
  };

  const { icon, text, statusClass } = getStatusContent();
  const lastSavedText = formatLastSaved(lastSaved);

  return (
    <div className={`auto-save-indicator ${className}`}>
      <div className={`save-status ${statusClass}`}>
        <span className="status-icon" aria-hidden="true">{icon}</span>
        <span className="status-text">{text}</span>
      </div>
      
      {lastSavedText && !error && (
        <div className="last-saved-time">
          {lastSavedText}
        </div>
      )}
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      {onManualSave && (
        <button
          type="button"
          className="manual-save-button"
          onClick={onManualSave}
          disabled={isSaving}
          aria-label="Save manually"
        >
          Save Now
        </button>
      )}
    </div>
  );
};

AutoSaveIndicator.propTypes = {
  isSaving: PropTypes.bool,
  lastSaved: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.number
  ]),
  error: PropTypes.string,
  onManualSave: PropTypes.func,
  className: PropTypes.string
};

export default AutoSaveIndicator;
