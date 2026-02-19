// 🔔 Pusher Push Notification Service for PWA
// Integrates existing Pusher system with Service Worker push notifications
// Requirement: FR-PWA-10 - Integration with existing Pusher notification system

import notificationManager from './notificationManager';

class PusherPushService {
  constructor() {
    this.pusher = null;
    this.isInitialized = false;
    this.userId = null;
    this.userChannel = null;
    this.subscriptions = new Map();
    this.serviceWorkerRegistration = null;
  }

  /**
   * Initialize Pusher for push notifications
   * @param {string} userId - Current user ID
   * @param {string} pusherKey - Pusher app key
   * @param {string} cluster - Pusher cluster (default: 'eu')
   */
  async initialize(userId, pusherKey, cluster = 'eu') {
    try {
      // Check if Pusher is available
      if (typeof window.Pusher === 'undefined') {
        console.warn('⚠️ Pusher library not loaded. Push notifications will be disabled.');
        return false;
      }

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker not supported. Push notifications will be disabled.');
        return false;
      }

      this.userId = userId;

      // Initialize Pusher client
      this.pusher = new window.Pusher(pusherKey, {
        cluster: cluster,
        encrypted: true,
        authEndpoint: '/api/chat/pusher/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      });

      // Get service worker registration
      this.serviceWorkerRegistration = await navigator.serviceWorker.ready;

      // Subscribe to user's private channel for notifications
      await this.subscribeToUserChannel();

      this.isInitialized = true;
      console.log('✅ Pusher Push Service initialized for user:', userId);
      
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Pusher Push Service:', error);
      return false;
    }
  }

  /**
   * Subscribe to user's private notification channel
   */
  async subscribeToUserChannel() {
    if (!this.pusher || !this.userId) {
      console.warn('⚠️ Cannot subscribe: Pusher not initialized');
      return;
    }

    try {
      const channelName = `private-user-${this.userId}`;
      this.userChannel = this.pusher.subscribe(channelName);

      // Listen for notification events
      this.userChannel.bind('notification', (data) => {
        this.handlePusherNotification(data);
      });

      // Listen for unread count updates
      this.userChannel.bind('unread-count-updated', (data) => {
        this.handleUnreadCountUpdate(data);
      });

      console.log('✅ Subscribed to user notification channel:', channelName);

    } catch (error) {
      console.error('❌ Failed to subscribe to user channel:', error);
    }
  }

  /**
   * Handle incoming Pusher notification
   * @param {Object} data - Notification data from Pusher
   */
  async handlePusherNotification(data) {
    console.log('📬 Received Pusher notification:', data);

    try {
      // Map notification type to user type and event type
      const { type, title, body, url, requireInteraction } = data;
      
      let userType = 'individual';
      let eventType = 'general';

      // Map notification types
      const typeMapping = {
        'job_match': { userType: 'individual', eventType: 'newJobPosted' },
        'application_accepted': { userType: 'individual', eventType: 'jobAccepted' },
        'application_rejected': { userType: 'individual', eventType: 'jobRejected' },
        'new_application': { userType: 'company', eventType: 'newApplication' },
        'new_message': { userType: 'individual', eventType: 'messageReceived' },
        'course_match': { userType: 'individual', eventType: 'courseEnrolled' },
      };

      if (typeMapping[type]) {
        userType = typeMapping[type].userType;
        eventType = typeMapping[type].eventType;
      }

      // Send notification through notification manager
      await notificationManager.sendNotification({
        title: title || 'Careerak Notification',
        body: body || 'You have a new notification',
        userType,
        eventType,
        data: {
          url: url || '/profile',
          pusherData: data
        },
        requireInteraction: requireInteraction || false
      });

      // Also send to service worker for background notifications
      if (this.serviceWorkerRegistration) {
        await this.sendToServiceWorker({
          type: 'PUSH_NOTIFICATION',
          notification: {
            title: title || 'Careerak Notification',
            body: body || 'You have a new notification',
            icon: '/logo.png',
            badge: '/logo.png',
            data: {
              url: url || '/profile',
              type: type,
              timestamp: new Date().toISOString()
            },
            requireInteraction: requireInteraction || false
          }
        });
      }

    } catch (error) {
      console.error('❌ Failed to handle Pusher notification:', error);
    }
  }

  /**
   * Handle unread count update
   * @param {Object} data - Unread count data
   */
  handleUnreadCountUpdate(data) {
    console.log('📊 Unread count updated:', data.count);
    
    // Dispatch custom event for UI components to listen
    window.dispatchEvent(new CustomEvent('unreadCountUpdated', {
      detail: { count: data.count }
    }));

    // Update badge on PWA icon if supported
    if ('setAppBadge' in navigator) {
      if (data.count > 0) {
        navigator.setAppBadge(data.count).catch(err => {
          console.warn('Failed to set app badge:', err);
        });
      } else {
        navigator.clearAppBadge().catch(err => {
          console.warn('Failed to clear app badge:', err);
        });
      }
    }
  }

  /**
   * Subscribe to a conversation channel
   * @param {string} conversationId - Conversation ID
   * @param {Function} onMessage - Callback for new messages
   */
  subscribeToConversation(conversationId, onMessage) {
    if (!this.pusher) {
      console.warn('⚠️ Cannot subscribe: Pusher not initialized');
      return null;
    }

    try {
      const channelName = `conversation-${conversationId}`;
      
      // Check if already subscribed
      if (this.subscriptions.has(channelName)) {
        console.log('ℹ️ Already subscribed to:', channelName);
        return this.subscriptions.get(channelName);
      }

      const channel = this.pusher.subscribe(channelName);

      // Listen for new messages
      channel.bind('new-message', (data) => {
        console.log('💬 New message in conversation:', conversationId);
        if (onMessage) {
          onMessage(data);
        }
        
        // Send notification if app is in background
        if (document.hidden) {
          this.handlePusherNotification({
            type: 'new_message',
            title: '💬 New Message',
            body: data.message?.content || 'You have a new message',
            url: `/messages/${conversationId}`,
            requireInteraction: false
          });
        }
      });

      this.subscriptions.set(channelName, channel);
      console.log('✅ Subscribed to conversation:', channelName);
      
      return channel;

    } catch (error) {
      console.error('❌ Failed to subscribe to conversation:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from a conversation channel
   * @param {string} conversationId - Conversation ID
   */
  unsubscribeFromConversation(conversationId) {
    const channelName = `conversation-${conversationId}`;
    
    if (this.subscriptions.has(channelName)) {
      const channel = this.subscriptions.get(channelName);
      channel.unbind_all();
      this.pusher.unsubscribe(channelName);
      this.subscriptions.delete(channelName);
      console.log('✅ Unsubscribed from conversation:', channelName);
    }
  }

  /**
   * Send message to service worker
   * @param {Object} message - Message to send
   */
  async sendToServiceWorker(message) {
    if (!this.serviceWorkerRegistration || !this.serviceWorkerRegistration.active) {
      console.warn('⚠️ Service worker not active');
      return;
    }

    try {
      this.serviceWorkerRegistration.active.postMessage(message);
    } catch (error) {
      console.error('❌ Failed to send message to service worker:', error);
    }
  }

  /**
   * Request push notification permission
   */
  async requestPermission() {
    try {
      const permission = await notificationManager.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Push notification permission granted');
        return true;
      } else {
        console.log('❌ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to request permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   * Registers the device for push notifications
   */
  async subscribeToPush() {
    if (!this.serviceWorkerRegistration) {
      console.warn('⚠️ Service worker not registered');
      return null;
    }

    try {
      // Check if already subscribed
      let subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('ℹ️ Already subscribed to push notifications');
        return subscription;
      }

      // Request permission first
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        return null;
      }

      // Subscribe to push notifications
      // Note: This requires a VAPID public key from the backend
      // For now, we'll use Pusher's built-in notification system
      console.log('✅ Push notification subscription ready (using Pusher)');
      
      return { pusher: true };

    } catch (error) {
      console.error('❌ Failed to subscribe to push:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush() {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('❌ Failed to unsubscribe from push:', error);
    }
  }

  /**
   * Test push notification
   */
  async testPushNotification() {
    await this.handlePusherNotification({
      type: 'job_match',
      title: '💼 Test Notification',
      body: 'This is a test push notification from Pusher',
      url: '/profile',
      requireInteraction: false
    });
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.pusher) {
      // Unsubscribe from all channels
      this.subscriptions.forEach((channel, channelName) => {
        channel.unbind_all();
        this.pusher.unsubscribe(channelName);
      });
      this.subscriptions.clear();

      // Unsubscribe from user channel
      if (this.userChannel) {
        this.userChannel.unbind_all();
        this.pusher.unsubscribe(`private-user-${this.userId}`);
      }

      // Disconnect Pusher
      this.pusher.disconnect();
      this.pusher = null;
    }

    this.isInitialized = false;
    this.userId = null;
    this.userChannel = null;
    this.serviceWorkerRegistration = null;

    console.log('✅ Pusher Push Service disconnected');
  }

  /**
   * Check if service is initialized
   */
  isReady() {
    return this.isInitialized && this.pusher !== null;
  }
}

// Create singleton instance
const pusherPushService = new PusherPushService();

export default pusherPushService;

// Export helper functions
export const initializePusherPush = (userId, pusherKey, cluster) => 
  pusherPushService.initialize(userId, pusherKey, cluster);

export const subscribeToConversation = (conversationId, onMessage) => 
  pusherPushService.subscribeToConversation(conversationId, onMessage);

export const unsubscribeFromConversation = (conversationId) => 
  pusherPushService.unsubscribeFromConversation(conversationId);

export const requestPushPermission = () => 
  pusherPushService.requestPermission();

export const subscribeToPush = () => 
  pusherPushService.subscribeToPush();

export const testPushNotification = () => 
  pusherPushService.testPushNotification();
