/**
 * Notification Actions Utility
 * Task 3.5.4: Display notifications with actions
 * 
 * This utility provides helper functions to send notifications with actions
 * through the service worker, integrating with the existing Pusher system.
 */

/**
 * Send a notification through the service worker
 * @param {Object} notification - Notification configuration
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body text
 * @param {string} notification.type - Notification type (job_match, application_accepted, etc.)
 * @param {Object} notification.data - Additional data to pass with notification
 * @param {string} notification.url - URL to open when notification is clicked
 * @param {Array} notification.actions - Custom actions (optional, will use defaults based on type)
 * @param {boolean} notification.requireInteraction - Whether notification requires user interaction
 * @param {boolean} notification.silent - Whether notification should be silent
 */
export async function sendNotificationWithActions(notification) {
  // Check if service worker is available
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return false;
  }

  // Check notification permission
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Send message to service worker to display notification
    registration.active.postMessage({
      type: 'PUSH_NOTIFICATION',
      notification: {
        title: notification.title,
        body: notification.body,
        type: notification.type || 'system',
        icon: notification.icon || '/logo.png',
        badge: notification.badge || '/logo.png',
        data: notification.data || {},
        url: notification.url || '/',
        actions: notification.actions, // Will use defaults if not provided
        tag: notification.tag || `notification-${Date.now()}`,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false,
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Request notification permission
 * @returns {Promise<string>} Permission status ('granted', 'denied', or 'default')
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and enabled
 * @returns {boolean}
 */
export function areNotificationsEnabled() {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    Notification.permission === 'granted'
  );
}

/**
 * Predefined notification templates for common scenarios
 */
export const NotificationTemplates = {
  /**
   * Job match notification
   */
  jobMatch: (jobTitle, jobId, jobUrl) => ({
    title: 'New Job Match! 🎯',
    body: `A job matching your skills: ${jobTitle}`,
    type: 'job_match',
    data: { jobId, jobUrl },
    url: jobUrl || `/jobs/${jobId}`,
    requireInteraction: true,
  }),

  /**
   * Application accepted notification
   */
  applicationAccepted: (jobTitle, applicationId, conversationId) => ({
    title: 'Application Accepted! ✅',
    body: `Your application for ${jobTitle} has been accepted`,
    type: 'application_accepted',
    data: { applicationId, conversationId },
    url: `/applications/${applicationId}`,
    requireInteraction: true,
  }),

  /**
   * Application rejected notification
   */
  applicationRejected: (jobTitle, applicationId, feedback) => ({
    title: 'Application Update',
    body: `Your application for ${jobTitle} was not successful`,
    type: 'application_rejected',
    data: { applicationId, feedback },
    url: `/applications/${applicationId}`,
    requireInteraction: false,
  }),

  /**
   * Application reviewed notification
   */
  applicationReviewed: (jobTitle, applicationId, status) => ({
    title: 'Application Reviewed 📋',
    body: `Your application for ${jobTitle} has been reviewed`,
    type: 'application_reviewed',
    data: { applicationId, status },
    url: `/applications/${applicationId}`,
    requireInteraction: false,
  }),

  /**
   * New application notification (for employers)
   */
  newApplication: (applicantName, jobTitle, applicationId) => ({
    title: 'New Application Received 📬',
    body: `${applicantName} applied for ${jobTitle}`,
    type: 'new_application',
    data: { applicationId, applicantName, jobTitle },
    url: `/admin/applications/${applicationId}`,
    requireInteraction: true,
  }),

  /**
   * Job closed notification
   */
  jobClosed: (jobTitle, jobId, reason) => ({
    title: 'Job Posting Closed',
    body: `The job posting for ${jobTitle} has been closed`,
    type: 'job_closed',
    data: { jobId, reason },
    url: `/jobs/${jobId}`,
    requireInteraction: false,
  }),

  /**
   * Course match notification
   */
  courseMatch: (courseTitle, courseId, courseUrl) => ({
    title: 'Recommended Course 📚',
    body: `A course that might interest you: ${courseTitle}`,
    type: 'course_match',
    data: { courseId, courseUrl },
    url: courseUrl || `/courses/${courseId}`,
    requireInteraction: false,
  }),

  /**
   * New message notification
   */
  newMessage: (senderName, messagePreview, conversationId) => ({
    title: `New message from ${senderName} 💬`,
    body: messagePreview,
    type: 'new_message',
    data: { conversationId, senderName },
    url: `/chat/${conversationId}`,
    requireInteraction: true,
  }),

  /**
   * System notification
   */
  system: (title, body, url) => ({
    title: title || 'System Notification',
    body: body || 'You have a new notification',
    type: 'system',
    data: {},
    url: url || '/notifications',
    requireInteraction: false,
  }),
};

/**
 * Example usage:
 * 
 * // Send a job match notification
 * await sendNotificationWithActions(
 *   NotificationTemplates.jobMatch('Senior Developer', 'job123', '/jobs/job123')
 * );
 * 
 * // Send a custom notification
 * await sendNotificationWithActions({
 *   title: 'Custom Notification',
 *   body: 'This is a custom notification',
 *   type: 'system',
 *   data: { customData: 'value' },
 *   url: '/custom-page',
 *   actions: [
 *     { action: 'custom1', title: 'Action 1', icon: '/icons/action1.png' },
 *     { action: 'custom2', title: 'Action 2', icon: '/icons/action2.png' },
 *   ],
 * });
 */
