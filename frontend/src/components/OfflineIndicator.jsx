import React, { useEffect, useState } from 'react';
import { useOfflineContext } from '../context/OfflineContext';
import './OfflineIndicator.css';

/**
 * Offline Indicator Component
 * 
 * Displays a visual indicator when the user is offline
 * 
 * Requirements:
 * - Task 3.4.2: Show offline indicator in UI
 * - FR-PWA-2: When the user is offline, serve cached pages
 * - FR-PWA-3: Display custom offline fallback page
 * - NFR-REL-2: Maintain offline functionality for previously visited pages
 * 
 * Features:
 * - Shows banner when offline
 * - Shows reconnection message when back online
 * - Auto-hides after 5 seconds when reconnected
 * - Accessible with ARIA labels
 * - Supports RTL/LTR layouts
 * - Multi-language support (ar, en, fr)
 */

const OfflineIndicator = () => {
  const { isOnline, isOffline, wasOffline } = useOfflineContext();
  const [showReconnected, setShowReconnected] = useState(false);

  // Handle reconnection message
  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline]);

  // Get current language from localStorage or default to 'ar'
  const getCurrentLanguage = () => {
    try {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      return savedLanguage || 'ar';
    } catch {
      return 'ar';
    }
  };

  const language = getCurrentLanguage();

  // Translations for offline messages
  const translations = {
    ar: {
      offline: 'أنت غير متصل بالإنترنت',
      offlineDesc: 'بعض الميزات قد لا تكون متاحة',
      reconnected: 'تم استعادة الاتصال',
      reconnectedDesc: 'أنت الآن متصل بالإنترنت'
    },
    en: {
      offline: 'You are offline',
      offlineDesc: 'Some features may not be available',
      reconnected: 'Connection restored',
      reconnectedDesc: 'You are now online'
    },
    fr: {
      offline: 'Vous êtes hors ligne',
      offlineDesc: 'Certaines fonctionnalités peuvent ne pas être disponibles',
      reconnected: 'Connexion rétablie',
      reconnectedDesc: 'Vous êtes maintenant en ligne'
    }
  };

  const t = translations[language] || translations.ar;

  // Don't render anything if online and not showing reconnected message
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {isOffline && (
        <div
          className="offline-indicator offline-banner"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="offline-indicator-content">
            <svg
              className="offline-indicator-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
              <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>
            <div className="offline-indicator-text">
              <div className="offline-indicator-title">{t.offline}</div>
              <div className="offline-indicator-description">{t.offlineDesc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Reconnected Banner */}
      {showReconnected && isOnline && (
        <div
          className="offline-indicator reconnected-banner"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="offline-indicator-content">
            <svg
              className="offline-indicator-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <div className="offline-indicator-text">
              <div className="offline-indicator-title">{t.reconnected}</div>
              <div className="offline-indicator-description">{t.reconnectedDesc}</div>
            </div>
            <button
              className="offline-indicator-close"
              onClick={() => setShowReconnected(false)}
              aria-label="Close notification"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;
