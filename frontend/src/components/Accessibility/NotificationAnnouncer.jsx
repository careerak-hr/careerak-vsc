import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AriaLiveRegion from './AriaLiveRegion';

/**
 * NotificationAnnouncer Component
 * 
 * Announces notifications and toast messages to screen readers.
 * Automatically determines politeness level based on notification type.
 * 
 * @component
 * @example
 * <NotificationAnnouncer 
 *   notification={{ type: 'success', message: 'Saved successfully' }}
 *   language="ar"
 * />
 */
const NotificationAnnouncer = ({ 
  notification,
  language = 'ar',
  clearDelay = 5000
}) => {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState('polite');

  // Notification type prefixes
  const prefixes = {
    ar: {
      success: 'نجح:',
      error: 'خطأ:',
      warning: 'تحذير:',
      info: 'معلومة:'
    },
    en: {
      success: 'Success:',
      error: 'Error:',
      warning: 'Warning:',
      info: 'Info:'
    },
    fr: {
      success: 'Succès:',
      error: 'Erreur:',
      warning: 'Avertissement:',
      info: 'Info:'
    }
  };

  const prefix = prefixes[language] || prefixes.ar;

  useEffect(() => {
    if (!notification || !notification.message) {
      setMessage('');
      return;
    }

    const { type = 'info', message: notifMessage, title } = notification;

    // Determine politeness level based on type
    const isUrgent = type === 'error' || type === 'warning';
    setPoliteness(isUrgent ? 'assertive' : 'polite');

    // Build announcement message
    let announcement = '';
    
    // Add type prefix
    if (prefix[type]) {
      announcement += prefix[type] + ' ';
    }
    
    // Add title if present
    if (title) {
      announcement += title + '. ';
    }
    
    // Add message
    announcement += notifMessage;

    setMessage(announcement);

    // Clear message after delay
    if (clearDelay > 0) {
      const timer = setTimeout(() => {
        setMessage('');
      }, clearDelay);
      
      return () => clearTimeout(timer);
    }
  }, [notification, prefix, clearDelay]);

  return (
    <AriaLiveRegion 
      message={message} 
      politeness={politeness}
      role={politeness === 'assertive' ? 'alert' : 'status'}
    />
  );
};

NotificationAnnouncer.propTypes = {
  /** Notification object with type, message, and optional title */
  notification: PropTypes.shape({
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    message: PropTypes.string.isRequired,
    title: PropTypes.string
  }),
  
  /** Current language for prefixes */
  language: PropTypes.oneOf(['ar', 'en', 'fr']),
  
  /** Delay in ms before clearing the announcement */
  clearDelay: PropTypes.number
};

export default NotificationAnnouncer;
