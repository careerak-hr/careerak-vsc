/**
 * useNotificationActions Hook
 * Task 3.5.4: Display notifications with actions
 * 
 * React hook for managing notifications with actions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  sendNotificationWithActions,
  requestNotificationPermission,
  areNotificationsEnabled,
  NotificationTemplates,
} from '../utils/notificationActions';

/**
 * Hook for managing notifications with actions
 * @returns {Object} Notification utilities
 */
export function useNotificationActions() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  /**
   * Request notification permission from user
   */
  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  /**
   * Send a notification with actions
   */
  const sendNotification = useCallback(async (notification) => {
    // Auto-request permission if not granted
    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }
    }

    return await sendNotificationWithActions(notification);
  }, [permission, requestPermission]);

  /**
   * Send a job match notification
   */
  const notifyJobMatch = useCallback(
    async (jobTitle, jobId, jobUrl) => {
      return await sendNotification(
        NotificationTemplates.jobMatch(jobTitle, jobId, jobUrl)
      );
    },
    [sendNotification]
  );

  /**
   * Send an application accepted notification
   */
  const notifyApplicationAccepted = useCallback(
    async (jobTitle, applicationId, conversationId) => {
      return await sendNotification(
        NotificationTemplates.applicationAccepted(jobTitle, applicationId, conversationId)
      );
    },
    [sendNotification]
  );

  /**
   * Send an application rejected notification
   */
  const notifyApplicationRejected = useCallback(
    async (jobTitle, applicationId, feedback) => {
      return await sendNotification(
        NotificationTemplates.applicationRejected(jobTitle, applicationId, feedback)
      );
    },
    [sendNotification]
  );

  /**
   * Send an application reviewed notification
   */
  const notifyApplicationReviewed = useCallback(
    async (jobTitle, applicationId, status) => {
      return await sendNotification(
        NotificationTemplates.applicationReviewed(jobTitle, applicationId, status)
      );
    },
    [sendNotification]
  );

  /**
   * Send a new application notification (for employers)
   */
  const notifyNewApplication = useCallback(
    async (applicantName, jobTitle, applicationId) => {
      return await sendNotification(
        NotificationTemplates.newApplication(applicantName, jobTitle, applicationId)
      );
    },
    [sendNotification]
  );

  /**
   * Send a job closed notification
   */
  const notifyJobClosed = useCallback(
    async (jobTitle, jobId, reason) => {
      return await sendNotification(
        NotificationTemplates.jobClosed(jobTitle, jobId, reason)
      );
    },
    [sendNotification]
  );

  /**
   * Send a course match notification
   */
  const notifyCourseMatch = useCallback(
    async (courseTitle, courseId, courseUrl) => {
      return await sendNotification(
        NotificationTemplates.courseMatch(courseTitle, courseId, courseUrl)
      );
    },
    [sendNotification]
  );

  /**
   * Send a new message notification
   */
  const notifyNewMessage = useCallback(
    async (senderName, messagePreview, conversationId) => {
      return await sendNotification(
        NotificationTemplates.newMessage(senderName, messagePreview, conversationId)
      );
    },
    [sendNotification]
  );

  /**
   * Send a system notification
   */
  const notifySystem = useCallback(
    async (title, body, url) => {
      return await sendNotification(
        NotificationTemplates.system(title, body, url)
      );
    },
    [sendNotification]
  );

  return {
    // State
    permission,
    isSupported,
    isEnabled: areNotificationsEnabled(),

    // Methods
    requestPermission,
    sendNotification,

    // Convenience methods for common notification types
    notifyJobMatch,
    notifyApplicationAccepted,
    notifyApplicationRejected,
    notifyApplicationReviewed,
    notifyNewApplication,
    notifyJobClosed,
    notifyCourseMatch,
    notifyNewMessage,
    notifySystem,
  };
}

/**
 * Example usage in a component:
 * 
 * function MyComponent() {
 *   const {
 *     permission,
 *     isEnabled,
 *     requestPermission,
 *     notifyJobMatch,
 *     notifyNewMessage,
 *   } = useNotificationActions();
 * 
 *   const handleJobMatch = async () => {
 *     if (!isEnabled) {
 *       await requestPermission();
 *     }
 *     await notifyJobMatch('Senior Developer', 'job123', '/jobs/job123');
 *   };
 * 
 *   const handleNewMessage = async () => {
 *     await notifyNewMessage('John Doe', 'Hello!', 'conv123');
 *   };
 * 
 *   return (
 *     <div>
 *       <p>Notification Permission: {permission}</p>
 *       <button onClick={requestPermission}>Enable Notifications</button>
 *       <button onClick={handleJobMatch}>Test Job Match</button>
 *       <button onClick={handleNewMessage}>Test New Message</button>
 *     </div>
 *   );
 * }
 */
