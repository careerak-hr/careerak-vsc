import React, { useEffect, useState } from 'react';

/**
 * ServiceWorkerManager Component
 * 
 * Manages service worker lifecycle and update notifications
 * Implements FR-PWA-6: Update detection and notification
 * 
 * Features:
 * - Detects service worker updates
 * - Shows user-friendly update notification
 * - Handles update installation
 * - Multi-language support (ar, en, fr)
 * - Smooth CSS animations
 * - Auto-dismiss after timeout
 */
const ServiceWorkerManager = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    // Get language from localStorage
    const storedLang = localStorage.getItem('language') || 'ar';
    setLanguage(storedLang);

    // Only run in browser with service worker support
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Listen for controlling service worker changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // Check for waiting service worker
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdateNotification(true);
      }

      // Listen for new service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New service worker is ready
            setWaitingWorker(newWorker);
            setShowUpdateNotification(true);
          }
        });
      });
    });

    // Check for updates every hour
    const updateInterval = setInterval(() => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }, 60 * 60 * 1000);

    return () => clearInterval(updateInterval);
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setShowUpdateNotification(false);
  };

  // Translations
  const translations = {
    ar: {
      message: 'تحديث جديد متاح!',
      description: 'قم بإعادة التحميل للحصول على أحدث إصدار.',
      updateButton: 'إعادة التحميل',
      dismissButton: 'لاحقاً',
    },
    en: {
      message: 'New update available!',
      description: 'Reload to get the latest version.',
      updateButton: 'Reload',
      dismissButton: 'Later',
    },
    fr: {
      message: 'Nouvelle mise à jour disponible!',
      description: 'Rechargez pour obtenir la dernière version.',
      updateButton: 'Recharger',
      dismissButton: 'Plus tard',
    },
  };

  const t = translations[language] || translations.ar;

  if (!showUpdateNotification) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes slideUpFadeIn {
          from {
            transform: translate(-50%, 100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        .sw-update-notification {
          animation: slideUpFadeIn 0.3s ease-out;
        }
        
        .sw-update-button {
          transition: all 0.2s ease;
        }
        
        .sw-update-button:hover {
          transform: translateY(-1px);
        }
        
        .sw-update-button:active {
          transform: translateY(0);
        }
      `}</style>
      
      <div
        className="sw-update-notification"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
          maxWidth: '90%',
          width: '100%',
          maxWidth: '500px',
        }}
        role="alert"
        aria-live="polite"
      >
        <div
          style={{
            background: '#304B60',
            color: '#E3DAD1',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Update icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span style={{ fontWeight: '600', fontSize: '16px' }}>
                {t.message}
              </span>
            </div>
            
            {/* Close button */}
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#E3DAD1',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
              aria-label="Dismiss notification"
            >
              <svg
                width="20"
                height="20"
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

          {/* Description */}
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              opacity: 0.9,
              lineHeight: '1.5',
            }}
          >
            {t.description}
          </p>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '4px',
            }}
          >
            <button
              onClick={handleUpdate}
              className="sw-update-button"
              style={{
                flex: 1,
                background: '#D48161',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#c06d4f')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#D48161')}
            >
              {t.updateButton}
            </button>
            
            <button
              onClick={handleDismiss}
              className="sw-update-button"
              style={{
                flex: 1,
                background: 'transparent',
                color: '#E3DAD1',
                border: '2px solid #E3DAD1',
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(227, 218, 209, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {t.dismissButton}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceWorkerManager;
