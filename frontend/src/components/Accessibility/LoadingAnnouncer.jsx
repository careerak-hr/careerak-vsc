import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AriaLiveRegion from './AriaLiveRegion';

/**
 * LoadingAnnouncer Component
 * 
 * Announces loading states to screen readers using aria-live regions.
 * Provides appropriate announcements for loading start and completion.
 * 
 * @component
 * @example
 * <LoadingAnnouncer 
 *   isLoading={true}
 *   loadingMessage="Loading jobs..."
 *   completeMessage="Jobs loaded"
 *   language="ar"
 * />
 */
const LoadingAnnouncer = ({ 
  isLoading, 
  loadingMessage,
  completeMessage,
  language = 'ar',
  announceComplete = true
}) => {
  const [message, setMessage] = useState('');

  // Default translations
  const defaultTranslations = {
    ar: {
      loading: 'جاري التحميل...',
      complete: 'اكتمل التحميل'
    },
    en: {
      loading: 'Loading...',
      complete: 'Loading complete'
    },
    fr: {
      loading: 'Chargement...',
      complete: 'Chargement terminé'
    }
  };

  const defaults = defaultTranslations[language] || defaultTranslations.ar;

  useEffect(() => {
    if (isLoading) {
      // Announce loading state
      setMessage(loadingMessage || defaults.loading);
    } else if (announceComplete && message) {
      // Announce completion only if we were previously loading
      setMessage(completeMessage || defaults.complete);
      
      // Clear the completion message after a short delay
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setMessage('');
    }
  }, [isLoading, loadingMessage, completeMessage, defaults, announceComplete, message]);

  return (
    <AriaLiveRegion 
      message={message} 
      politeness="polite"
      role="status"
    />
  );
};

LoadingAnnouncer.propTypes = {
  /** Whether content is currently loading */
  isLoading: PropTypes.bool.isRequired,
  
  /** Custom loading message */
  loadingMessage: PropTypes.string,
  
  /** Custom completion message */
  completeMessage: PropTypes.string,
  
  /** Current language for default messages */
  language: PropTypes.oneOf(['ar', 'en', 'fr']),
  
  /** Whether to announce when loading completes */
  announceComplete: PropTypes.bool
};

export default LoadingAnnouncer;
