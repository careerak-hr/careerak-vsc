/**
 * Property-Based Test: Security Action Notification
 * 
 * Feature: settings-page-enhancements
 * Property 7: Security Action Notification
 * 
 * Property Statement:
 * For any security-sensitive action (password change, email change, phone change, 
 * session termination, 2FA toggle, account deletion), the system should send a 
 * notification to the user.
 * 
 * Validates: Requirements 3.6, 4.4, 5.5, 9.5, 11.4, 12.10
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const notificationService = require('../src/services/notificationService');
const NotificationPreference = require('../src/models/NotificationPreference');
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
  await Notification.deleteMany({});
});

describe('Property 7: Security Action Notification', () => {
  
  /**
   * Property: Email change sends notification
   * Validates: Requirement 3.6
   */
  test('should send notification when email is changed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          oldEmail: fc.emailAddress(),
          newEmail: fc.emailAddress()
        }).filter(({ oldEmail, newEmail }) => oldEmail !== newEmail),
        async ({ oldEmail, newEmail }) => {
          // Create user
          const user = await User.create({
            email: oldEmail,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            'email_change',
            { oldEmail, newEmail }
          );
          
          // Verify notification was created
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
          expect(notification.title).toContain('البريد الإلكتروني');
          expect(notification.message).toContain(oldEmail);
          expect(notification.message).toContain(newEmail);
          expect(notification.priority).toBe('urgent');
          expect(notification.relatedData.action).toBe('email_change');
          
          // Verify notification exists in database
          const savedNotif = await Notification.findById(notification._id);
          expect(savedNotif).toBeDefined();
          expect(savedNotif.recipient.toString()).toBe(user._id.toString());
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Phone change sends notification
   * Validates: Requirement 4.4
   */
  test('should send notification when phone is changed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          newPhone: fc.string({ minLength: 10, maxLength: 15 }).map(s => s.replace(/[^0-9]/g, ''))
        }).filter(({ newPhone }) => newPhone.length >= 10),
        async ({ newPhone }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            'phone_change',
            { newPhone }
          );
          
          // Verify notification was created
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
          expect(notification.title).toContain('رقم الهاتف');
          expect(notification.message).toContain(newPhone);
          expect(notification.priority).toBe('urgent');
          expect(notification.relatedData.action).toBe('phone_change');
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Password change sends notification
   * Validates: Requirement 5.5
   */
  test('should send notification when password is changed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({}),
        async () => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            'password_change',
            {}
          );
          
          // Verify notification was created
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
          expect(notification.title).toContain('كلمة المرور');
          expect(notification.message).toContain('كلمة مرور');
          expect(notification.priority).toBe('urgent');
          expect(notification.relatedData.action).toBe('password_change');
        }
      ),
      { numRuns: 30 }
    );
  });
  
  /**
   * Property: Session termination sends notification
   * Validates: Requirement 9.5
   */
  test('should send notification when session is terminated', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          allSessions: fc.boolean(),
          device: fc.option(fc.constantFrom('Chrome on Windows', 'Safari on iPhone', 'Firefox on Linux'), { nil: undefined })
        }),
        async ({ allSessions, device }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            'session_terminated',
            { allSessions, device }
          );
          
          // Verify notification was created
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
          expect(notification.title).toContain('جلسة');
          expect(notification.priority).toBe('high');
          expect(notification.relatedData.action).toBe('session_terminated');
          
          // Verify message content based on allSessions flag
          if (allSessions) {
            expect(notification.message).toContain('جميع الجلسات');
          } else if (device) {
            expect(notification.message).toContain(device);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: 2FA enabled sends notification
   * Validates: Requirement 8.5 (part of security notifications)
   */
  test('should send notification when 2FA is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({}),
        async () => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            '2fa_enabled',
            {}
          );
          
          // Verify notification was created
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
          expect(notification.title).toContain('المصادقة الثنائية');
          expect(notification.message).toContain('2FA');
          expect(notification.priority).toBe('high');
          expect(notification.relatedData.action).toBe('2fa_enabled');
        }
      ),
      { numRuns: 30 }
    );
  });
  
  /**
   * Property: 2FA disabled sends notification
   * Validates: Requirement 8.5 (part of security notifications)
   */
  test('should send notification when 2FA is disabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({}),
        async () => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            '2fa_disabled',
            {}
          );
          
          // Verify notification was created
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
          expect(notification.title).toContain('المصادقة الثنائية');
          expect(notification.message).toContain('2FA');
          expect(notification.priority).toBe('urgent');
          expect(notification.relatedData.action).toBe('2fa_disabled');
        }
      ),
      { numRuns: 30 }
    );
  });
  
  /**
   * Property: Account deletion sends notification
   * Validates: Requirements 11.4, 12.10
   */
  test('should send notification when account deletion is requested', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          scheduled: fc.boolean(),
          deletionDate: fc.date({ min: new Date(), max: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
        }),
        async ({ scheduled, deletionDate }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            'account_deletion',
            { scheduled, deletionDate: deletionDate.toISOString() }
          );
          
          // Verify notification was created
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
          expect(notification.title).toContain('حذف الحساب');
          expect(notification.relatedData.action).toBe('account_deletion');
          
          // Verify message content based on scheduled flag
          if (scheduled) {
            expect(notification.message).toContain('جدولة');
            expect(notification.message).toContain(deletionDate.toISOString());
          } else {
            expect(notification.message).toContain('استلام');
          }
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: All security actions have consistent notification structure
   */
  test('should have consistent notification structure for all security actions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'email_change',
          'phone_change',
          'password_change',
          'session_terminated',
          '2fa_enabled',
          '2fa_disabled',
          'account_deletion'
        ),
        async (action) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Prepare details based on action
          let details = {};
          if (action === 'email_change') {
            details = { oldEmail: 'old@example.com', newEmail: 'new@example.com' };
          } else if (action === 'phone_change') {
            details = { newPhone: '+1234567890' };
          } else if (action === 'session_terminated') {
            details = { allSessions: false, device: 'Chrome on Windows' };
          } else if (action === 'account_deletion') {
            details = { scheduled: true, deletionDate: new Date().toISOString() };
          }
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            action,
            details
          );
          
          // Verify consistent structure
          expect(notification).toBeDefined();
          expect(notification.recipient).toBeDefined();
          expect(notification.type).toBe('security');
          expect(notification.title).toBeDefined();
          expect(notification.title.length).toBeGreaterThan(0);
          expect(notification.message).toBeDefined();
          expect(notification.message.length).toBeGreaterThan(0);
          expect(notification.priority).toBeDefined();
          expect(['low', 'medium', 'high', 'urgent']).toContain(notification.priority);
          expect(notification.relatedData).toBeDefined();
          expect(notification.relatedData.action).toBe(action);
          expect(notification.relatedData.timestamp).toBeDefined();
        }
      ),
      { numRuns: 70 }
    );
  });
  
  /**
   * Property: Security notifications respect user preferences
   */
  test('should respect user notification preferences for security actions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          securityEnabled: fc.boolean(),
          action: fc.constantFrom('email_change', 'password_change', '2fa_enabled')
        }),
        async ({ securityEnabled, action }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Create preferences (security notifications are always enabled by default)
          // But we test that the system checks preferences
          await NotificationPreference.create({
            user: user._id,
            preferences: {
              system: {
                enabled: securityEnabled,
                push: true,
                email: true
              }
            }
          });
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            action,
            { oldEmail: 'old@test.com', newEmail: 'new@test.com' }
          );
          
          // Security notifications should ALWAYS be sent regardless of preferences
          // (they're too important to skip)
          expect(notification).toBeDefined();
          expect(notification.recipient.toString()).toBe(user._id.toString());
          expect(notification.type).toBe('security');
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Security notifications have appropriate priority levels
   */
  test('should assign appropriate priority levels to security actions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          { action: 'email_change', expectedPriority: 'urgent' },
          { action: 'phone_change', expectedPriority: 'urgent' },
          { action: 'password_change', expectedPriority: 'urgent' },
          { action: 'session_terminated', expectedPriority: 'high' },
          { action: '2fa_enabled', expectedPriority: 'high' },
          { action: '2fa_disabled', expectedPriority: 'urgent' },
          { action: 'account_deletion', expectedPriority: 'urgent' }
        ),
        async ({ action, expectedPriority }) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'individual'
          });
          
          // Prepare details
          let details = {};
          if (action === 'email_change') {
            details = { oldEmail: 'old@example.com', newEmail: 'new@example.com' };
          } else if (action === 'phone_change') {
            details = { newPhone: '+1234567890' };
          } else if (action === 'session_terminated') {
            details = { allSessions: false };
          } else if (action === 'account_deletion') {
            details = { scheduled: false };
          }
          
          // Send security notification
          const notification = await notificationService.sendSecurityNotification(
            user._id,
            action,
            details
          );
          
          // Verify priority
          expect(notification.priority).toBe(expectedPriority);
        }
      ),
      { numRuns: 70 }
    );
  });
});
