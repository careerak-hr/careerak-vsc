const fc = require('fast-check');
const { expect } = require('chai');
const AdminNotification = require('../../src/models/AdminNotification');
const { createAdminNotification } = require('../../src/services/adminNotificationService');

/**
 * Property Tests for Admin Notifications
 * 
 * Property 16: Notification Badge Accuracy
 * Property 17: Notification Interaction
 * 
 * Validates: Requirements 6.8, 6.10
 */

describe('Property Tests: Admin Notifications', () => {
  
  /**
   * Property 16: Notification Badge Accuracy
   * 
   * For any admin user, the notification badge count should always equal
   * the number of unread notifications for that admin, and the count should
   * update immediately when notifications are marked as read.
   * 
   * Validates: Requirements 6.8
   */
  describe('Property 16: Notification Badge Accuracy', () => {
    
    it('should maintain accurate unread count across multiple operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.hexaString({ minLength: 24, maxLength: 24 }),
            notifications: fc.array(
              fc.record({
                type: fc.constantFrom(
                  'user_registered',
                  'job_posted',
                  'course_published',
                  'review_flagged',
                  'content_reported'
                ),
                priority: fc.constantFrom('low', 'medium', 'high', 'urgent'),
                title: fc.string({ minLength: 5, maxLength: 100 }),
                message: fc.string({ minLength: 10, maxLength: 500 })
              }),
              { minLength: 1, maxLength: 20 }
            ),
            markAsReadIndices: fc.array(fc.nat(), { maxLength: 10 })
          }),
          async ({ adminId, notifications, markAsReadIndices }) => {
            // Create notifications
            const createdNotifications = [];
            for (const notif of notifications) {
              const created = await AdminNotification.create({
                adminId,
                ...notif,
                isRead: false
              });
              createdNotifications.push(created);
            }

            // Initial unread count should equal total notifications
            const initialUnreadCount = await AdminNotification.countDocuments({
              adminId,
              isRead: false
            });
            expect(initialUnreadCount).to.equal(notifications.length);

            // Mark some as read
            const indicesToMark = markAsReadIndices
              .map(idx => idx % createdNotifications.length)
              .filter((v, i, a) => a.indexOf(v) === i); // unique indices

            for (const idx of indicesToMark) {
              await AdminNotification.findByIdAndUpdate(
                createdNotifications[idx]._id,
                { isRead: true }
              );
            }

            // Unread count should be updated correctly
            const finalUnreadCount = await AdminNotification.countDocuments({
              adminId,
              isRead: false
            });
            const expectedUnreadCount = notifications.length - indicesToMark.length;
            expect(finalUnreadCount).to.equal(expectedUnreadCount);

            // Cleanup
            await AdminNotification.deleteMany({ adminId });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update badge count immediately when marking all as read', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.hexaString({ minLength: 24, maxLength: 24 }),
            notificationCount: fc.integer({ min: 1, max: 50 })
          }),
          async ({ adminId, notificationCount }) => {
            // Create multiple unread notifications
            const notifications = [];
            for (let i = 0; i < notificationCount; i++) {
              notifications.push({
                adminId,
                type: 'system_error',
                priority: 'medium',
                title: `Notification ${i}`,
                message: `Message ${i}`,
                isRead: false
              });
            }
            await AdminNotification.insertMany(notifications);

            // Verify initial unread count
            const initialCount = await AdminNotification.countDocuments({
              adminId,
              isRead: false
            });
            expect(initialCount).to.equal(notificationCount);

            // Mark all as read
            await AdminNotification.updateMany(
              { adminId, isRead: false },
              { isRead: true }
            );

            // Verify unread count is now 0
            const finalCount = await AdminNotification.countDocuments({
              adminId,
              isRead: false
            });
            expect(finalCount).to.equal(0);

            // Cleanup
            await AdminNotification.deleteMany({ adminId });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 17: Notification Interaction
   * 
   * For any admin notification, when an admin clicks on it, the notification
   * should be marked as read, and if the notification has an action URL,
   * the system should navigate to that URL.
   * 
   * Validates: Requirements 6.10
   */
  describe('Property 17: Notification Interaction', () => {
    
    it('should mark notification as read when clicked', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.hexaString({ minLength: 24, maxLength: 24 }),
            type: fc.constantFrom(
              'user_registered',
              'job_posted',
              'review_flagged'
            ),
            priority: fc.constantFrom('low', 'medium', 'high', 'urgent'),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            message: fc.string({ minLength: 10, maxLength: 500 }),
            hasActionUrl: fc.boolean()
          }),
          async ({ adminId, type, priority, title, message, hasActionUrl }) => {
            // Create notification
            const notification = await AdminNotification.create({
              adminId,
              type,
              priority,
              title,
              message,
              actionUrl: hasActionUrl ? `/admin/details/${type}` : undefined,
              isRead: false
            });

            // Verify initially unread
            expect(notification.isRead).to.be.false;

            // Simulate click - mark as read
            const updated = await AdminNotification.findByIdAndUpdate(
              notification._id,
              { isRead: true },
              { new: true }
            );

            // Verify marked as read
            expect(updated.isRead).to.be.true;

            // Verify action URL is preserved
            if (hasActionUrl) {
              expect(updated.actionUrl).to.exist;
              expect(updated.actionUrl).to.include('/admin/details/');
            }

            // Cleanup
            await AdminNotification.findByIdAndDelete(notification._id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve notification data when marking as read', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.hexaString({ minLength: 24, maxLength: 24 }),
            type: fc.constantFrom(
              'user_registered',
              'job_posted',
              'course_published',
              'review_flagged',
              'content_reported',
              'suspicious_activity',
              'system_error'
            ),
            priority: fc.constantFrom('low', 'medium', 'high', 'urgent'),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            message: fc.string({ minLength: 10, maxLength: 500 }),
            actionUrl: fc.option(fc.webUrl(), { nil: undefined })
          }),
          async ({ adminId, type, priority, title, message, actionUrl }) => {
            // Create notification
            const original = await AdminNotification.create({
              adminId,
              type,
              priority,
              title,
              message,
              actionUrl,
              isRead: false
            });

            // Mark as read
            const updated = await AdminNotification.findByIdAndUpdate(
              original._id,
              { isRead: true },
              { new: true }
            );

            // Verify all data preserved except isRead
            expect(updated.adminId.toString()).to.equal(adminId);
            expect(updated.type).to.equal(type);
            expect(updated.priority).to.equal(priority);
            expect(updated.title).to.equal(title);
            expect(updated.message).to.equal(message);
            expect(updated.actionUrl).to.equal(actionUrl);
            expect(updated.isRead).to.be.true;

            // Cleanup
            await AdminNotification.findByIdAndDelete(original._id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple rapid clicks (idempotent)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            adminId: fc.hexaString({ minLength: 24, maxLength: 24 }),
            clickCount: fc.integer({ min: 1, max: 10 })
          }),
          async ({ adminId, clickCount }) => {
            // Create notification
            const notification = await AdminNotification.create({
              adminId,
              type: 'system_error',
              priority: 'high',
              title: 'Test Notification',
              message: 'Test Message',
              isRead: false
            });

            // Simulate multiple rapid clicks
            for (let i = 0; i < clickCount; i++) {
              await AdminNotification.findByIdAndUpdate(
                notification._id,
                { isRead: true }
              );
            }

            // Verify still marked as read (idempotent)
            const final = await AdminNotification.findById(notification._id);
            expect(final.isRead).to.be.true;

            // Verify no duplicate notifications created
            const count = await AdminNotification.countDocuments({
              adminId,
              title: 'Test Notification'
            });
            expect(count).to.equal(1);

            // Cleanup
            await AdminNotification.findByIdAndDelete(notification._id);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
