/**
 * Pusher Integration Tests
 * Apply Page Enhancements Feature
 * 
 * Tests Pusher service functionality for real-time application status updates
 */

const pusherService = require('../src/services/pusherService');

describe('Pusher Service - Apply Page Enhancements', () => {
  beforeAll(() => {
    // Initialize Pusher service
    pusherService.initialize();
  });

  describe('Initialization', () => {
    test('should initialize successfully with valid credentials', () => {
      expect(pusherService.isEnabled()).toBe(true);
    });

    test('should have pusher instance after initialization', () => {
      expect(pusherService.pusher).toBeDefined();
      expect(pusherService.isInitialized).toBe(true);
    });
  });

  describe('Application Status Notifications', () => {
    const testUserId = 'test-user-123';
    const testApplicationId = 'test-app-456';

    test('should send application status update notification', async () => {
      const notification = {
        type: 'application_reviewed',
        title: 'Application Status Updated',
        message: 'Your application status has been updated to Reviewed',
        relatedData: {
          jobApplication: testApplicationId,
          newStatus: 'Reviewed',
          oldStatus: 'Submitted'
        },
        priority: 'high'
      };

      await expect(
        pusherService.sendNotificationToUser(testUserId, notification)
      ).resolves.not.toThrow();
    });

    test('should send notification for status: Submitted → Reviewed', async () => {
      const notification = {
        type: 'application_reviewed',
        title: 'Application Reviewed',
        message: 'Your application has been reviewed by the employer',
        relatedData: {
          jobApplication: testApplicationId,
          newStatus: 'Reviewed',
          oldStatus: 'Submitted'
        }
      };

      await expect(
        pusherService.sendNotificationToUser(testUserId, notification)
      ).resolves.not.toThrow();
    });

    test('should send notification for status: Reviewed → Shortlisted', async () => {
      const notification = {
        type: 'application_shortlisted',
        title: 'You\'ve Been Shortlisted!',
        message: 'Congratulations! You have been shortlisted for this position',
        relatedData: {
          jobApplication: testApplicationId,
          newStatus: 'Shortlisted',
          oldStatus: 'Reviewed'
        },
        priority: 'high'
      };

      await expect(
        pusherService.sendNotificationToUser(testUserId, notification)
      ).resolves.not.toThrow();
    });

    test('should send notification for status: Shortlisted → Interview Scheduled', async () => {
      const notification = {
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: 'An interview has been scheduled for your application',
        relatedData: {
          jobApplication: testApplicationId,
          newStatus: 'Interview Scheduled',
          oldStatus: 'Shortlisted',
          interviewDate: new Date().toISOString()
        },
        priority: 'urgent'
      };

      await expect(
        pusherService.sendNotificationToUser(testUserId, notification)
      ).resolves.not.toThrow();
    });

    test('should send notification for status: Interview Scheduled → Accepted', async () => {
      const notification = {
        type: 'application_accepted',
        title: 'Application Accepted!',
        message: 'Congratulations! Your application has been accepted',
        relatedData: {
          jobApplication: testApplicationId,
          newStatus: 'Accepted',
          oldStatus: 'Interview Scheduled'
        },
        priority: 'urgent'
      };

      await expect(
        pusherService.sendNotificationToUser(testUserId, notification)
      ).resolves.not.toThrow();
    });

    test('should send notification for status: Reviewed → Rejected', async () => {
      const notification = {
        type: 'application_rejected',
        title: 'Application Update',
        message: 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates',
        relatedData: {
          jobApplication: testApplicationId,
          newStatus: 'Rejected',
          oldStatus: 'Reviewed'
        },
        priority: 'medium'
      };

      await expect(
        pusherService.sendNotificationToUser(testUserId, notification)
      ).resolves.not.toThrow();
    });

    test('should send notification for withdrawal', async () => {
      const notification = {
        type: 'application_withdrawn',
        title: 'Application Withdrawn',
        message: 'Your application has been withdrawn successfully',
        relatedData: {
          jobApplication: testApplicationId,
          newStatus: 'Withdrawn',
          oldStatus: 'Submitted'
        }
      };

      await expect(
        pusherService.sendNotificationToUser(testUserId, notification)
      ).resolves.not.toThrow();
    });
  });

  describe('Channel Authentication', () => {
    test('should authenticate user for private channel', () => {
      const socketId = 'test-socket-123.456';
      const channelName = 'private-user-test-user-123';
      const userId = 'test-user-123';

      const auth = pusherService.authenticateUser(socketId, channelName, userId);
      
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty('auth');
      expect(typeof auth.auth).toBe('string');
    });

    test('should reject authentication for unauthorized channel', () => {
      const socketId = 'test-socket-123.456';
      const channelName = 'private-user-different-user';
      const userId = 'test-user-123';

      expect(() => {
        pusherService.authenticateUser(socketId, channelName, userId);
      }).toThrow('Unauthorized');
    });

    test('should authenticate presence channel', () => {
      const socketId = 'test-socket-123.456';
      const channelName = 'presence-applications';
      const userId = 'test-user-123';
      const userInfo = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const auth = pusherService.authenticatePresence(socketId, channelName, userId, userInfo);
      
      expect(auth).toBeDefined();
      expect(auth).toHaveProperty('auth');
      expect(auth).toHaveProperty('channel_data');
    });
  });

  describe('Error Handling', () => {
    test('should handle notification send failure gracefully', async () => {
      // Test with invalid user ID
      const notification = {
        type: 'test',
        title: 'Test',
        message: 'Test message'
      };

      // Should not throw even if Pusher fails
      await expect(
        pusherService.sendNotificationToUser(null, notification)
      ).resolves.not.toThrow();
    });

    test('should return false when Pusher is not initialized', () => {
      const uninitializedService = Object.create(pusherService);
      uninitializedService.isInitialized = false;
      uninitializedService.pusher = null;

      expect(uninitializedService.isEnabled()).toBe(false);
    });
  });

  describe('Multiple Notifications', () => {
    test('should send multiple notifications in sequence', async () => {
      const userId = 'test-user-123';
      const notifications = [
        {
          type: 'application_reviewed',
          title: 'Status Update 1',
          message: 'First update'
        },
        {
          type: 'application_shortlisted',
          title: 'Status Update 2',
          message: 'Second update'
        },
        {
          type: 'interview_scheduled',
          title: 'Status Update 3',
          message: 'Third update'
        }
      ];

      for (const notification of notifications) {
        await expect(
          pusherService.sendNotificationToUser(userId, notification)
        ).resolves.not.toThrow();
      }
    });

    test('should send notifications to multiple users', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      const notification = {
        type: 'system',
        title: 'System Notification',
        message: 'This is a system-wide notification'
      };

      for (const userId of userIds) {
        await expect(
          pusherService.sendNotificationToUser(userId, notification)
        ).resolves.not.toThrow();
      }
    });
  });

  describe('Unread Count Updates', () => {
    test('should send unread count update', async () => {
      const userId = 'test-user-123';
      const count = 5;

      await expect(
        pusherService.sendUnreadCountUpdate(userId, count)
      ).resolves.not.toThrow();
    });

    test('should send zero unread count', async () => {
      const userId = 'test-user-123';
      const count = 0;

      await expect(
        pusherService.sendUnreadCountUpdate(userId, count)
      ).resolves.not.toThrow();
    });
  });

  describe('Service Status', () => {
    test('should report enabled status correctly', () => {
      const isEnabled = pusherService.isEnabled();
      expect(typeof isEnabled).toBe('boolean');
    });

    test('should have valid configuration', () => {
      if (pusherService.isEnabled()) {
        expect(pusherService.pusher).toBeDefined();
        expect(pusherService.isInitialized).toBe(true);
      }
    });
  });
});
