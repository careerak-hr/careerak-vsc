// 🔔 Push Notification Manager Component
// UI component for managing push notification settings
// Requirement: FR-PWA-10 - Integration with existing Pusher notification system

import React, { useState, useEffect } from 'react';
import { usePusherPush } from '../hooks/usePusherPush';
import './PushNotificationManager.css';

const PushNotificationManager = ({ userId, onClose }) => {
  const {
    isInitialized,
    isSubscribed,
    permission,
    error,
    initialize,
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification,
    canNotify,
  } = usePusherPush(userId, {
    autoInitialize: true,
    autoRequestPermission: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Handle enable notifications
  const handleEnableNotifications = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Request permission first
      const granted = await requestPermission();
      
      if (granted) {
        // Subscribe to push notifications
        await subscribe();
        setMessage('✅ Push notifications enabled successfully!');
      } else {
        setMessage('❌ Permission denied. Please enable notifications in your browser settings.');
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disable notifications
  const handleDisableNotifications = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await unsubscribe();
      setMessage('✅ Push notifications disabled.');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await testNotification();
      setMessage('✅ Test notification sent! Check your notifications.');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get permission status text
  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Granted ✅', color: 'green' };
      case 'denied':
        return { text: 'Denied ❌', color: 'red' };
      default:
        return { text: 'Not requested', color: 'gray' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="push-notification-manager">
      <div className="pnm-header">
        <h3>🔔 Push Notifications</h3>
        {onClose && (
          <button className="pnm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
      </div>

      <div className="pnm-content">
        {/* Status Section */}
        <div className="pnm-status">
          <div className="pnm-status-item">
            <span className="pnm-label">Service Status:</span>
            <span className={`pnm-value ${isInitialized ? 'active' : 'inactive'}`}>
              {isInitialized ? '✅ Active' : '⚠️ Inactive'}
            </span>
          </div>
          
          <div className="pnm-status-item">
            <span className="pnm-label">Permission:</span>
            <span className="pnm-value" style={{ color: permissionStatus.color }}>
              {permissionStatus.text}
            </span>
          </div>
          
          <div className="pnm-status-item">
            <span className="pnm-label">Subscription:</span>
            <span className={`pnm-value ${isSubscribed ? 'active' : 'inactive'}`}>
              {isSubscribed ? '✅ Subscribed' : '❌ Not subscribed'}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="pnm-error">
            ⚠️ {error}
          </div>
        )}

        {/* Success/Info Message */}
        {message && (
          <div className={`pnm-message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="pnm-actions">
          {!canNotify ? (
            <button
              className="pnm-button primary"
              onClick={handleEnableNotifications}
              disabled={isLoading || !isInitialized}
            >
              {isLoading ? '⏳ Enabling...' : '🔔 Enable Notifications'}
            </button>
          ) : (
            <>
              <button
                className="pnm-button secondary"
                onClick={handleDisableNotifications}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Disabling...' : '🔕 Disable Notifications'}
              </button>
              
              <button
                className="pnm-button test"
                onClick={handleTestNotification}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Sending...' : '🧪 Test Notification'}
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="pnm-info">
          <h4>ℹ️ About Push Notifications</h4>
          <ul>
            <li>Receive real-time notifications even when the app is closed</li>
            <li>Get notified about job matches, applications, and messages</li>
            <li>Works on mobile and desktop browsers</li>
            <li>You can disable notifications anytime</li>
          </ul>
        </div>

        {/* Browser Support Info */}
        {!('Notification' in window) && (
          <div className="pnm-warning">
            ⚠️ Your browser doesn't support push notifications.
            Please use a modern browser like Chrome, Firefox, or Edge.
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotificationManager;
