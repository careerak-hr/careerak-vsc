import React, { useEffect, useState } from 'react';
import './AutoSaveIndicator.css';

/**
 * Auto-save status indicator component
 * Shows saving status, success, or error messages
 */
const AutoSaveIndicator = ({ isSaving, lastSaved, error }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success message briefly after save
  useEffect(() => {
    if (lastSaved && !isSaving && !error) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [lastSaved, isSaving, error]);

  // Format last saved time
  const formatLastSaved = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 10) return 'الآن';
    if (diff < 60) return `منذ ${diff} ثانية`;
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (error) {
    return (
      <div className="auto-save-indicator error" role="alert">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
        </svg>
        <span className="message">{error}</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="auto-save-indicator saving" role="status" aria-live="polite">
        <svg className="icon spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="60" strokeDashoffset="15"/>
        </svg>
        <span className="message">جاري الحفظ...</span>
      </div>
    );
  }

  if (showSuccess && lastSaved) {
    return (
      <div className="auto-save-indicator success" role="status" aria-live="polite">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <path d="M9 12l2 2 4-4" strokeWidth="2"/>
        </svg>
        <span className="message">تم الحفظ {formatLastSaved(lastSaved)}</span>
      </div>
    );
  }

  return null;
};

export default AutoSaveIndicator;
