// 🔔 React Hook for Pusher Push Notifications
// Provides easy integration with Pusher push notifications in React components
// Requirement: FR-PWA-10 - Integration with existing Pusher notification system

import { useEffect, useState, useCallback } from 'react';
import pusherPushService from '../services/pusherPushService';

/**
 * Custom hook for Pusher push notifications
 * @param {string} userId - Current user ID
 * @param {Object} options - Configuration options
 * @returns {Object} Push notification controls and state
 */
export const usePusherPush = (userId, options = {}) => {
  const {
    pusherKey = process.env.REACT_APP_PUSHER_KEY,
    cluster = process.env.REACT_APP_PUSHER_CLUSTER || 'eu',
    autoInitialize = true,
    autoRequestPermission = false,
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState('default');
  const [error, setError] = useState(null);

  // Initialize Pusher push service
  const initialize = useCallback(async () => {
    if (!userId || !pusherKey) {
      setError('Missing userId or pusherKey');
      return false;
    }

    try {
      const success = await pusherPushService.initialize(userId, pusherKey, cluster);
      setIsInitialized(success);
      
      if (success) {
        setError(null);
        
        // Check current permission
        if ('Notification' in window) {
          setPermission(Notification.permission);
        }
      }
      
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [userId, pusherKey, cluster]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    try {
      const granted = await pusherPushService.requestPermission();
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
      
      return granted;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    try {
      const subscription = await pusherPushService.subscribeToPush();
      setIsSubscribed(!!subscription);
      return subscription;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    try {
      await pusherPushService.unsubscribeFromPush();
      setIsSubscribed(false);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Subscribe to a conversation
  const subscribeToConversation = useCallback((conversationId, onMessage) => {
    return pusherPushService.subscribeToConversation(conversationId, onMessage);
  }, []);

  // Unsubscribe from a conversation
  const unsubscribeFromConversation = useCallback((conversationId) => {
    pusherPushService.unsubscribeFromConversation(conversationId);
  }, []);

  // Test push notification
  const testNotification = useCallback(async () => {
    try {
      await pusherPushService.testPushNotification();
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    if (autoInitialize && userId && pusherKey) {
      initialize();
    }

    // Cleanup on unmount
    return () => {
      if (isInitialized) {
        pusherPushService.disconnect();
      }
    };
  }, [autoInitialize, userId, pusherKey, initialize, isInitialized]);

  // Auto-request permission if enabled
  useEffect(() => {
    if (autoRequestPermission && isInitialized && permission === 'default') {
      requestPermission();
    }
  }, [autoRequestPermission, isInitialized, permission, requestPermission]);

  return {
    // State
    isInitialized,
    isSubscribed,
    permission,
    error,
    
    // Actions
    initialize,
    requestPermission,
    subscribe,
    unsubscribe,
    subscribeToConversation,
    unsubscribeFromConversation,
    testNotification,
    
    // Helpers
    isReady: isInitialized && pusherPushService.isReady(),
    canNotify: permission === 'granted',
  };
};

/**
 * Hook for subscribing to a specific conversation
 * @param {string} conversationId - Conversation ID
 * @param {Function} onMessage - Callback for new messages
 * @param {boolean} enabled - Whether to subscribe
 */
export const useConversationSubscription = (conversationId, onMessage, enabled = true) => {
  useEffect(() => {
    if (!enabled || !conversationId) {
      return;
    }

    const channel = pusherPushService.subscribeToConversation(conversationId, onMessage);

    return () => {
      if (conversationId) {
        pusherPushService.unsubscribeFromConversation(conversationId);
      }
    };
  }, [conversationId, onMessage, enabled]);
};

/**
 * Hook for listening to unread count updates
 * @param {Function} onUpdate - Callback for unread count updates
 */
export const useUnreadCount = (onUpdate) => {
  useEffect(() => {
    const handleUnreadUpdate = (event) => {
      if (onUpdate) {
        onUpdate(event.detail.count);
      }
    };

    window.addEventListener('unreadCountUpdated', handleUnreadUpdate);

    return () => {
      window.removeEventListener('unreadCountUpdated', handleUnreadUpdate);
    };
  }, [onUpdate]);
};

export default usePusherPush;
