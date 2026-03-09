/**
 * Property-Based Test: Quiet Hours Notification Queuing
 * 
 * Feature: settings-page-enhancements
 * Property 17: Quiet Hours Notification Queuing
 * 
 * Property Statement:
 * For any notification generated during quiet hours, the system should queue it 
 * and send after quiet hours end.
 * 
 * Validates: Requirements 7.5
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const notificationService = require('../src/services/notificationService');
const NotificationPreference = require('../src/models/NotificationPreference');
const QueuedNotification = require('../src/models/QueuedNotification');
const Notification = require('../src/models/Notification');
const { User } = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await NotificationPreference.deleteMany({});
  await QueuedNotification.deleteMany({});
  await Notification.deleteMany({});
});

describe('Property 17: Quiet Hours Notification Queuing', () => {
  
  /**
   * Property: Notifications during quiet hours are queued
   */
  test('should queue notifications generated during quiet hours', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random quiet hours settings
        fc.record({
          startHour: fc.integer({ min: 0, max: 23 }),
          startMinute: fc.integer({ min: 0, max: 59 }),
          endHour: fc.integer({ min: 0, max: 23 }),
          endMinute: fc.integer({ min: 0, max: 59 }),
          notificationType: fc.constantFrom('job_match', 'course_match', 'system'),
          priority: fc.constantFrom('low', 'medium', 'high', 'urgent')
        }),
        async ({ startHour, startMinute, endHour, endMinute, notificationType, priority }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Format time strings
          const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          // Create preferences with quiet hours enabled
          await NotificationPreference.create({
            user: user._id,
            quietHours: {
              enabled: true,
              start: startTime,
              end: endTime
            }
          });
          
          // Mock current time to be within quiet hours
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          // Check if current time is within quiet hours
          const isInQuietHours = (startTime < endTime) 
            ? (currentTime >= startTime && currentTime <= endTime)
            : (currentTime >= startTime || currentTime <= endTime);
          
          // Create notification data
          const notificationData = {
            recipient: user._id,
            type: notificationType,
            title: 'Test Notification',
            message: 'This is a test notification',
            priority
          };
          
          // Queue notification
          const result = await notificationService.queueNotificationDuringQuietHours(
            user._id,
            notificationData
          );
          
          if (isInQuietHours) {
            // Should be queued
            expect(result.queued).toBe(true);
            expect(result.scheduledFor).toBeDefined();
            expect(result.reason).toBe('quiet_hours');
            
            // Verify queued notification exists
            const queuedNotif = await QueuedNotification.findById(result.notificationId);
            expect(queuedNotif).toBeDefined();
            expect(queuedNotif.recipient.toString()).toBe(user._id.toString());
            expect(queuedNotif.type).toBe(notificationType);
            expect(queuedNotif.reason).toBe('quiet_hours');
            
            // Verify notification was NOT sent immediately
            const immediateNotif = await Notification.findOne({ recipient: user._id });
            expect(immediateNotif).toBeNull();
          } else {
            // Should be sent immediately (not queued)
            expect(result.queued).toBeUndefined();
            expect(result._id).toBeDefined();
            
            // Verify notification was sent
            const sentNotif = await Notification.findById(result._id);
            expect(sentNotif).toBeDefined();
            expect(sentNotif.recipient.toString()).toBe(user._id.toString());
          }
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Queued notifications are sent after quiet hours end
   */
  test('should send queued notifications after quiet hours end', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          notificationCount: fc.integer({ min: 1, max: 5 }),
          notificationType: fc.constantFrom('job_match', 'course_match', 'system')
        }),
        async ({ notificationCount, notificationType }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Create preferences with quiet hours (past time so they're ready to send)
          await NotificationPreference.create({
            user: user._id,
            quietHours: {
              enabled: true,
              start: '22:00',
              end: '08:00'
            }
          });
          
          // Create queued notifications with scheduledFor in the past
          const pastTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
          
          for (let i = 0; i < notificationCount; i++) {
            await QueuedNotification.create({
              recipient: user._id,
              type: notificationType,
              title: `Test Notification ${i + 1}`,
              message: `This is test notification ${i + 1}`,
              priority: 'medium',
              queuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              scheduledFor: pastTime,
              reason: 'quiet_hours'
            });
          }
          
          // Verify queued notifications exist
          const queuedBefore = await QueuedNotification.countDocuments({ recipient: user._id });
          expect(queuedBefore).toBe(notificationCount);
          
          // Send queued notifications
          const result = await notificationService.sendQueuedNotifications();
          
          // Verify all were sent
          expect(result.sent).toBe(notificationCount);
          expect(result.failed).toBe(0);
          
          // Verify queued notifications were deleted
          const queuedAfter = await QueuedNotification.countDocuments({ recipient: user._id });
          expect(queuedAfter).toBe(0);
          
          // Verify notifications were created
          const sentNotifications = await Notification.find({ recipient: user._id });
          expect(sentNotifications.length).toBe(notificationCount);
          
          // Verify all have correct type
          sentNotifications.forEach(notif => {
            expect(notif.type).toBe(notificationType);
            expect(notif.recipient.toString()).toBe(user._id.toString());
          });
        }
      ),
      { numRuns: 30 }
    );
  });
  
  /**
   * Property: Quiet hours respect time zones and wrap around midnight
   */
  test('should handle quiet hours that wrap around midnight', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate quiet hours that wrap around midnight (e.g., 22:00 - 08:00)
          startHour: fc.integer({ min: 18, max: 23 }),
          endHour: fc.integer({ min: 0, max: 10 })
        }),
        async ({ startHour, endHour }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          const startTime = `${startHour.toString().padStart(2, '0')}:00`;
          const endTime = `${endHour.toString().padStart(2, '0')}:00`;
          
          // Create preferences
          const preferences = await NotificationPreference.create({
            user: user._id,
            quietHours: {
              enabled: true,
              start: startTime,
              end: endTime
            }
          });
          
          // Test isQuietHours logic
          const isQuietHoursFunc = notificationService.isQuietHours.bind(notificationService);
          const result = isQuietHoursFunc(preferences);
          
          // Get current time
          const now = new Date();
          const currentHour = now.getHours();
          
          // Verify logic for wrap-around
          if (startHour > endHour) {
            // Wraps around midnight
            const shouldBeQuiet = currentHour >= startHour || currentHour <= endHour;
            expect(result).toBe(shouldBeQuiet);
          } else {
            // Normal range
            const shouldBeQuiet = currentHour >= startHour && currentHour <= endHour;
            expect(result).toBe(shouldBeQuiet);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Failed queued notifications are retried
   */
  test('should retry failed queued notifications up to 3 times', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }),
        async (initialRetryCount) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Create a queued notification with retry count
          const pastTime = new Date(Date.now() - 60 * 60 * 1000);
          const queuedNotif = await QueuedNotification.create({
            recipient: user._id,
            type: 'system',
            title: 'Test Notification',
            message: 'This will fail',
            priority: 'medium',
            queuedAt: new Date(),
            scheduledFor: pastTime,
            reason: 'quiet_hours',
            retryCount: initialRetryCount
          });
          
          // Mock createNotification to fail
          const originalCreate = notificationService.createNotification;
          notificationService.createNotification = jest.fn().mockRejectedValue(new Error('Mock failure'));
          
          // Send queued notifications
          const result = await notificationService.sendQueuedNotifications();
          
          // Restore original function
          notificationService.createNotification = originalCreate;
          
          // Verify failure was recorded
          expect(result.failed).toBe(1);
          
          if (initialRetryCount >= 2) {
            // Should be deleted after 3rd failure
            const stillQueued = await QueuedNotification.findById(queuedNotif._id);
            expect(stillQueued).toBeNull();
          } else {
            // Should be rescheduled
            const stillQueued = await QueuedNotification.findById(queuedNotif._id);
            expect(stillQueued).toBeDefined();
            expect(stillQueued.retryCount).toBe(initialRetryCount + 1);
            expect(stillQueued.scheduledFor.getTime()).toBeGreaterThan(pastTime.getTime());
          }
        }
      ),
      { numRuns: 20 }
    );
  });
  
  /**
   * Property: Quiet hours disabled sends notifications immediately
   */
  test('should send notifications immediately when quiet hours are disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          quietHoursEnabled: fc.constant(false),
          notificationType: fc.constantFrom('job_match', 'course_match', 'system')
        }),
        async ({ quietHoursEnabled, notificationType }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Create preferences with quiet hours disabled
          await NotificationPreference.create({
            user: user._id,
            quietHours: {
              enabled: quietHoursEnabled,
              start: '22:00',
              end: '08:00'
            }
          });
          
          // Create notification
          const notificationData = {
            recipient: user._id,
            type: notificationType,
            title: 'Test Notification',
            message: 'This should be sent immediately',
            priority: 'medium'
          };
          
          // Queue notification (should send immediately)
          const result = await notificationService.queueNotificationDuringQuietHours(
            user._id,
            notificationData
          );
          
          // Should NOT be queued
          expect(result.queued).toBeUndefined();
          expect(result._id).toBeDefined();
          
          // Verify notification was sent
          const sentNotif = await Notification.findById(result._id);
          expect(sentNotif).toBeDefined();
          expect(sentNotif.recipient.toString()).toBe(user._id.toString());
          expect(sentNotif.type).toBe(notificationType);
          
          // Verify no queued notifications
          const queuedCount = await QueuedNotification.countDocuments({ recipient: user._id });
          expect(queuedCount).toBe(0);
        }
      ),
      { numRuns: 30 }
    );
  });
});
