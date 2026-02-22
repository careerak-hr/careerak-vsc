/**
 * Pusher Client Utility
 * 
 * Integrates Pusher with PWA push notifications
 * Implements FR-PWA-10: Integration with existing Pusher notification system
 * 
 * Features:
 * - Pusher client initialization
 * - Channel subscription management
 * - Push notification integration with service worker
 * - Notification permission handling
 * - Multi-language support
 */

class PusherClientService {
  constructor() {
    this.pusher = null;
    this.isInitialized = false;
    this.subscribedChannels = new Map();
    this.notificationPermission = 'default';
  }

  /**
   * Initialize Pusher client
   * @param {string} userId - Current user ID
   * @param {string} authToken - Authentication token
   */
  async initialize(userId, authToken) {
    if (this.isInitialized) {
      console.log('Pusher already initialized');
      return;
    }

    try {
      // Dynamically import pusher-js
      const Pusher = (await import('pusher-js')).default;

      // Get Pusher key from environment or config
      const pusherKey = import.meta.env.VITE_PUSHER_KEY || 'your_pusher_key';
      const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'eu';

      if (!pusherKey || pusherKey === 'your_pusher_key') {
        console.warn('Pusher key not configured. Push notifications will be disabled.');
        return;
      }

      // Initialize Pusher
      this.pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        authEndpoint: '/api/chat/pusher/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      });

      this.isInitialized = true;
      this.userId = userId;
      this.authToken = authToken;

      console.log('✅ Pusher client initialized');

      // Subscribe to user's private channel for notifications
      await this.subscribeToUserChannel(userId);

      // Check notification permission
      await this.checkNotificationPermission();

    } catch (error) {
      console.error('Error initializing Pusher client:', error);
    }
  }

  /**
   * Subscribe to user's private notification channel
   * @param {string} userId - User ID
   */
  async subscribeToUserChannel(userId) {
    if (!this.isInitialized || !this.pusher) {
      console.warn('Pusher not initialized');
      return;
    }

    try {
      const channelName = `private-user-${userId}`;
      
      // Check if already subscribed
      if (this.subscribedChannels.has(channelName)) {
        console.log(`Already subscribed to ${channelName}`);
        return this.subscribedChannels.get(channelName);
      }

      const channel = this.pusher.subscribe(channelName);

      // Listen for notifications
      channel.bind('notification', (data) => {
        this.handleNotification(data);
      });

      // Listen for unread count updates
      channel.bind('unread-count-updated', (data) => {
        this.handleUnreadCountUpdate(data);
      });

      this.subscribedChannels.set(channelName, channel);
      console.log(`✅ Subscribed to ${channelName}`);

      return channel;

    } catch (error) {
      console.error('Error subscribing to user channel:', error);
    }
  }

  /**
   * Subscribe to a conversation channel
   * @param {string} conversationId - Conversation ID
   */
  async subscribeToConversation(conversationId) {
    if (!this.isInitialized || !this.pusher) {
      console.warn('Pusher not initialized');
      return;
    }

    try {
      const channelName = `conversation-${conversationId}`;
      
      if (this.subscribedChannels.has(channelName)) {
        return this.subscribedChannels.get(channelName);
      }

      const channel = this.pusher.subscribe(channelName);

      // Listen for new messages
      channel.bind('new-message', (data) => {
        this.handleNewMessage(data);
      });

      // Listen for typing indicators
      channel.bind('user-typing', (data) => {
        this.handleTypingIndicator(data);
      });

      channel.bind('user-stop-typing', (data) => {
        this.handleStopTyping(data);
      });

      this.subscribedChannels.set(channelName, channel);
      console.log(`✅ Subscribed to ${channelName}`);

      return channel;

    } catch (error) {
      console.error('Error subscribing to conversation:', error);
    }
  }

  /**
   * Unsubscribe from a channel
   * @param {string} channelName - Channel name
   */
  unsubscribe(channelName) {
    if (!this.isInitialized || !this.pusher) return;

    try {
      if (this.subscribedChannels.has(channelName)) {
        this.pusher.unsubscribe(channelName);
        this.subscribedChannels.delete(channelName);
        console.log(`Unsubscribed from ${channelName}`);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  }

  /**
   * Handle incoming notification
   * @param {Object} data - Notification data
   */
  async handleNotification(data) {
    console.log('Received notification:', data);

    // If service worker is available and notification permission granted
    if ('serviceWorker' in navigator && this.notificationPermission === 'granted') {
      // Send notification to service worker for display
      const registration = await navigator.serviceWorker.ready;
      
      // Post message to service worker to show notification
      registration.active.postMessage({
        type: 'PUSH_NOTIFICATION',
        notification: {
          title: data.title || 'Careerak Notification',
          body: data.message || 'You have a new notification',
          icon: '/logo.png',
          badge: '/logo.png',
          data: {
            ...data.relatedData,
            type: data.type || 'system',
            url: this.getNotificationUrl(data),
          },
          tag: `pusher-${data._id || Date.now()}`,
          requireInteraction: data.priority === 'urgent',
        },
      });
    } else {
      // Fallback: Show in-app notification
      this.showInAppNotification(data);
    }

    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('pusher-notification', { detail: data }));
  }

  /**
   * Handle unread count update
   * @param {Object} data - Unread count data
   */
  handleUnreadCountUpdate(data) {
    console.log('Unread count updated:', data.count);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('unread-count-updated', { detail: data }));
  }

  /**
   * Handle new message
   * @param {Object} data - Message data
   */
  handleNewMessage(data) {
    console.log('New message received:', data);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('new-message', { detail: data }));
  }

  /**
   * Handle typing indicator
   * @param {Object} data - Typing data
   */
  handleTypingIndicator(data) {
    window.dispatchEvent(new CustomEvent('user-typing', { detail: data }));
  }

  /**
   * Handle stop typing
   * @param {Object} data - Stop typing data
   */
  handleStopTyping(data) {
    window.dispatchEvent(new CustomEvent('user-stop-typing', { detail: data }));
  }

  /**
   * Get notification URL based on type
   * @param {Object} notification - Notification data
   * @returns {string} URL
   */
  getNotificationUrl(notification) {
    const type = notification.type;
    const relatedData = notification.relatedData || {};

    switch (type) {
      case 'job_match':
        return relatedData.jobPosting ? `/jobs/${relatedData.jobPosting}` : '/jobs';
      
      case 'application_accepted':
      case 'application_rejected':
      case 'application_reviewed':
        return relatedData.jobApplication ? `/applications/${relatedData.jobApplication}` : '/applications';
      
      case 'new_application':
        return relatedData.jobApplication ? `/admin/applications/${relatedData.jobApplication}` : '/admin/applications';
      
      case 'job_closed':
        return '/jobs';
      
      case 'course_match':
        return relatedData.course ? `/courses/${relatedData.course}` : '/courses';
      
      case 'new_message':
        return relatedData.conversationId ? `/chat/${relatedData.conversationId}` : '/chat';
      
      case 'system':
      default:
        return '/notifications';
    }
  }

  /**
   * Show in-app notification (fallback)
   * @param {Object} data - Notification data
   */
  showInAppNotification(data) {
    // Create a simple toast notification
    const notification = document.createElement('div');
    notification.className = 'pusher-toast-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #304B60;
        color: #E3DAD1;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 350px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
      ">
        <div style="font-weight: 600; margin-bottom: 4px;">${data.title || 'Notification'}</div>
        <div style="font-size: 14px; opacity: 0.9;">${data.message || ''}</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Check and request notification permission
   */
  async checkNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    this.notificationPermission = Notification.permission;

    if (this.notificationPermission === 'default') {
      // Don't auto-request, let user trigger it
      console.log('Notification permission not granted yet');
    } else if (this.notificationPermission === 'granted') {
      console.log('✅ Notification permission granted');
      // Register for push notifications if service worker is ready
      await this.registerPushNotifications();
    } else {
      console.log('Notification permission denied');
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;

      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        await this.registerPushNotifications();
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Register for push notifications with service worker
   */
  async registerPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications
        // Note: This requires a VAPID public key from your backend
        // For now, we'll just log that we're ready
        console.log('Ready for push notifications (VAPID key needed for actual subscription)');
      } else {
        console.log('Already subscribed to push notifications');
      }

    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  }

  /**
   * Disconnect Pusher
   */
  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.subscribedChannels.clear();
      this.isInitialized = false;
      console.log('Pusher disconnected');
    }
  }

  /**
   * Check if Pusher is connected
   */
  isConnected() {
    return this.isInitialized && this.pusher && this.pusher.connection.state === 'connected';
  }
}

// Export singleton instance
export default new PusherClientService();
