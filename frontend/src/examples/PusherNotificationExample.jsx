/**
 * Pusher Notification Example Component
 * 
 * This example demonstrates how to use the Pusher PWA integration
 * for receiving and displaying push notifications.
 * 
 * Usage:
 * import PusherNotificationExample from './examples/PusherNotificationExample';
 * <PusherNotificationExample />
 */

import React, { useEffect, useState } from 'react';
import pusherClient from '../utils/pusherClient';

const PusherNotificationExample = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    // Check Pusher connection status
    const checkConnection = () => {
      setIsConnected(pusherClient.isConnected());
    };

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    // Listen for Pusher notifications
    const handleNotification = (event) => {
      const notification = event.detail;
      setNotifications(prev => [notification, ...prev].slice(0, 10));
    };

    // Listen for unread count updates
    const handleUnreadCount = (event) => {
      setUnreadCount(event.detail.count);
    };

    // Listen for new messages
    const handleNewMessage = (event) => {
      console.log('New message:', event.detail);
    };

    window.addEventListener('pusher-notification', handleNotification);
    window.addEventListener('unread-count-updated', handleUnreadCount);
    window.addEventListener('new-message', handleNewMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pusher-notification', handleNotification);
      window.removeEventListener('unread-count-updated', handleUnreadCount);
      window.removeEventListener('new-message', handleNewMessage);
    };
  }, []);

  const handleRequestPermission = async () => {
    const granted = await pusherClient.requestNotificationPermission();
    if (granted) {
      setPermission('granted');
      alert('Notifications enabled!');
    } else {
      setPermission('denied');
      alert('Notification permission denied');
    }
  };

  const handleTestNotification = async () => {
    if ('serviceWorker' in navigator && permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      
      registration.active.postMessage({
        type: 'PUSH_NOTIFICATION',
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification from Pusher integration',
          icon: '/logo.png',
          type: 'system',
          data: {
            url: '/notifications',
          },
        },
      });
    } else {
      alert('Please enable notifications first');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Pusher PWA Notification Example</h1>

      {/* Status Section */}
      <div style={{
        background: '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2 style={{ marginTop: 0 }}>Status</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <strong>Pusher Connection:</strong>{' '}
            <span style={{ color: isConnected ? 'green' : 'red' }}>
              {isConnected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>
          <div>
            <strong>Notification Permission:</strong>{' '}
            <span style={{
              color: permission === 'granted' ? 'green' : permission === 'denied' ? 'red' : 'orange'
            }}>
              {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⚠️ Not Set'}
            </span>
          </div>
          <div>
            <strong>Unread Count:</strong> {unreadCount}
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div style={{
        background: '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h2 style={{ marginTop: 0 }}>Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleRequestPermission}
            disabled={permission === 'granted'}
            style={{
              padding: '10px 20px',
              background: permission === 'granted' ? '#ccc' : '#304B60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: permission === 'granted' ? 'not-allowed' : 'pointer',
            }}
          >
            {permission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
          </button>

          <button
            onClick={handleTestNotification}
            disabled={permission !== 'granted'}
            style={{
              padding: '10px 20px',
              background: permission !== 'granted' ? '#ccc' : '#D48161',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: permission !== 'granted' ? 'not-allowed' : 'pointer',
            }}
          >
            Test Notification
          </button>
        </div>
      </div>

      {/* Recent Notifications */}
      <div style={{
        background: '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
      }}>
        <h2 style={{ marginTop: 0 }}>Recent Notifications ({notifications.length})</h2>
        {notifications.length === 0 ? (
          <p style={{ color: '#666' }}>No notifications received yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map((notif, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  borderLeft: '4px solid #304B60',
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {notif.message}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Type: {notif.type} | Priority: {notif.priority}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        background: '#e3f2fd',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '20px',
      }}>
        <h3 style={{ marginTop: 0 }}>How to Test</h3>
        <ol style={{ marginBottom: 0 }}>
          <li>Click "Enable Notifications" to grant permission</li>
          <li>Click "Test Notification" to see a sample notification</li>
          <li>Trigger real notifications from the backend (e.g., create a job posting)</li>
          <li>Check the "Recent Notifications" section to see received notifications</li>
        </ol>
      </div>

      {/* Code Example */}
      <div style={{
        background: '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '20px',
      }}>
        <h3 style={{ marginTop: 0 }}>Code Example</h3>
        <pre style={{
          background: '#2d2d2d',
          color: '#f8f8f2',
          padding: '16px',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '14px',
        }}>
{`// Listen for notifications
window.addEventListener('pusher-notification', (event) => {
  const notification = event.detail;
  console.log('Received:', notification);
});

// Listen for unread count
window.addEventListener('unread-count-updated', (event) => {
  console.log('Unread:', event.detail.count);
});

// Request permission
await pusherClient.requestNotificationPermission();

// Check connection
const connected = pusherClient.isConnected();`}
        </pre>
      </div>
    </div>
  );
};

export default PusherNotificationExample;
