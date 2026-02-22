import React, { useEffect, useState } from 'react';
import pusherClient from '../utils/pusherClient';

/**
 * ServiceWorkerManager Component
 * 
 * Manages service worker lifecycle and update notifications
 * Implements FR-PWA-6: Update detection and notification
 * Implements FR-PWA-10: Integration with Pusher notification system
 * 
 * Features:
 * - Detects service worker updates
 * - Shows user-friendly update notification
 * - Handles update installation
 * - Integrates Pusher with PWA push notifications
 * - Multi-language support (ar, en, fr)
 * - Smooth CSS animations
 * - Auto-dismiss after timeout
 */
const ServiceWorkerManager = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [language, setLanguage] = useState('ar');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    // Get language from localStorage
    const storedLang = localStorage.getItem('language') || 'ar';
    setLanguage(storedLang);

    // Only run in browser with service worker support
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Initialize Pusher integration
    initializePusherIntegration();

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

  /**
   * Initialize Pusher integration with PWA
   */
  const initializePusherIntegration = async () => {
    try {
      // Get user data from localStorage
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!userStr || !token) {
        console.log('User not logged in, skipping Pusher initialization');
        return;
      }

      const user = JSON.parse(userStr);

      // Initialize Pusher client
      await pusherClient.initialize(user._id, token);

      // Check if we should prompt for notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        // Show prompt after a delay to not overwhelm user
        setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 5000);
      }

    } catch (error) {
      console.error('Error initializing Pusher integration:', error);
    }
  };

  /**
   * Handle notification permission request
   */
  const handleEnableNotifications = async () => {
    const granted = await pusherClient.requestNotificationPermission();
    setShowNotificationPrompt(false);
    
    if (granted) {
      // Show success message
      console.log('Notifications enabled successfully');
    }
  };

  /**
   * Handle notification prompt dismissal
   */
  const handleDismissNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    // Remember user's choice
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

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
      notificationPromptTitle: 'تفعيل الإشعارات',
      notificationPromptMessage: 'احصل على إشعارات فورية للوظائف والرسائل الجديدة',
      enableButton: 'تفعيل',
      notNowButton: 'ليس الآن',
    },
    en: {
      message: 'New update available!',
      description: 'Reload to get the latest version.',
      updateButton: 'Reload',
      dismissButton: 'Later',
      notificationPromptTitle: 'Enable Notifications',
      notificationPromptMessage: 'Get instant notifications for new jobs and messages',
      enableButton: 'Enable',
      notNowButton: 'Not Now',
    },
    fr: {
      message: 'Nouvelle mise à jour disponible!',
      description: 'Rechargez pour obtenir la dernière version.',
      updateButton: 'Recharger',
      dismissButton: 'Plus tard',
      notificationPromptTitle: 'Activer les notifications',
      notificationPromptMessage: 'Recevez des notifications instantanées pour les nouveaux emplois et messages',
      enableButton: 'Activer',
      notNowButton: 'Pas maintenant',
    },
  };

  const t = translations[language] || translations.ar;

  // Check if notification prompt was already dismissed
  const notificationPromptDismissed = localStorage.getItem('notification-prompt-dismissed') === 'true';

  if (!showUpdateNotification && (!showNotificationPrompt || notificationPromptDismissed)) {
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
        
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
        
        .sw-update-notification {
          animation: slideUpFadeIn 0.3s ease-out;
        }
        
        .notification-prompt {
          animation: slideInRight 0.3s ease-out;
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
      
      {/* Service Worker Update Notification */}
      {showUpdateNotification && (
        <div
          className="sw-update-notification"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            width: '100%',
            maxWidth: '500px',
            padding: '0 16px',
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
      )}

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && !notificationPromptDismissed && (
        <div
          className="notification-prompt"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            width: '100%',
            maxWidth: '400px',
            padding: '0 16px',
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
                {/* Bell icon */}
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>
                  {t.notificationPromptTitle}
                </span>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleDismissNotificationPrompt}
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
                aria-label="Dismiss notification prompt"
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
              {t.notificationPromptMessage}
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
                onClick={handleEnableNotifications}
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
                {t.enableButton}
              </button>
              
              <button
                onClick={handleDismissNotificationPrompt}
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
                {t.notNowButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceWorkerManager;
