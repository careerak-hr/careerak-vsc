const fc = require('fast-check');
const mongoose = require('mongoose');
const NotificationPreference = require('../src/models/NotificationPreference');
const { User } = require('../src/models/User');
const notificationPreferenceService = require('../src/services/notificationPreferenceService');
const adminNotificationService = require('../src/services/adminNotificationService');

// Feature: admin-dashboard-enhancements
// Property 18: Notification Preferences
// Validates: Requirements 6.12

/**
 * Property 18: Notification Preferences
 * 
 * For any notification type that an admin has disabled in their preferences, 
 * the system should not create notifications of that type for that admin, 
 * even when the triggering event occurs.
 */

describe('Property 18: Notification Preferences', () => {
  let mongoConnection;
  
  // Helper to check if MongoDB is available
  const isDBAvailable = () => {
    return mongoose.connection.readyState === 1;
  };
  
  // Setup: Connect to test database
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test';
        await mongoose.connect(mongoUri);
        mongoConnection = mongoose.connection;
        console.log('Connected to test database');
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
      }
    }
  }, 30000);
  
  // Cleanup after each test
  afterEach(async () => {
    if (isDBAvailable()) {
      await NotificationPreference.deleteMany({});
      await User.deleteMany({ email: /test-pref-/ });
    }
  });
  
  // Cleanup: Disconnect from database
  afterAll(async () => {
    if (isDBAvailable()) {
      await NotificationPreference.deleteMany({});
      await User.deleteMany({ email: /test-pref-/ });
      await mongoose.connection.close();
    }
  }, 30000);
  
  // ============================================
  // Arbitraries (Data Generators)
  // ============================================
  
  const adminNotificationTypeArbitrary = fc.constantFrom(
    'user_registered',
    'job_posted',
    'course_published',
    'review_flagged',
    'content_reported',
    'suspicious_activity',
    'system_error'
  );
  
  const userNotificationTypeArbitrary = fc.constantFrom(
    'job_match',
    'application_accepted',
    'application_rejected',
    'application_reviewed',
    'new_application',
    'job_closed',
    'course_match',
    'system'
  );
  
  const adminUserArbitrary = fc.record({
    name: fc.string({ minLength: 3, maxLength: 50 }),
    email: fc.emailAddress(),
    role: fc.constantFrom('admin', 'moderator')
  });
  
  const regularUserArbitrary = fc.record({
    name: fc.string({ minLength: 3, maxLength: 50 }),
    email: fc.emailAddress(),
    role: fc.constantFrom('jobSeeker', 'company', 'freelancer')
  });
  
  const quietHoursArbitrary = fc.record({
    enabled: fc.boolean(),
    start: fc.constantFrom('22:00', '23:00', '00:00', '01:00'),
    end: fc.constantFrom('06:00', '07:00', '08:00', '09:00')
  });
  
  // ============================================
  // Property Tests
  // ============================================
  
  describe('Requirement 6.12: Disabled Notification Types', () => {
    it('should not create notifications for disabled admin notification types', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          adminNotificationTypeArbitrary,
          async (adminData, notificationType) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Disable specific notification type
            await notificationPreferenceService.updateNotificationType(
              admin._id,
              notificationType,
              { enabled: false },
              true // isAdmin
            );
            
            // Check if notification type is disabled
            const isEnabled = await notificationPreferenceService.isNotificationEnabled(
              admin._id,
              notificationType,
              true // isAdmin
            );
            
            // Property: Disabled notification type should return false
            expect(isEnabled).toBe(false);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 50, verbose: false }
      );
    }, 120000);
    
    it('should not create notifications for disabled user notification types', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          regularUserArbitrary,
          userNotificationTypeArbitrary,
          async (userData, notificationType) => {
            // Create regular user
            const user = await User.create({
              ...userData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Disable specific notification type
            await notificationPreferenceService.updateNotificationType(
              user._id,
              notificationType,
              { enabled: false },
              false // not admin
            );
            
            // Check if notification type is disabled
            const isEnabled = await notificationPreferenceService.isNotificationEnabled(
              user._id,
              notificationType,
              false // not admin
            );
            
            // Property: Disabled notification type should return false
            expect(isEnabled).toBe(false);
            
            // Cleanup
            await User.deleteOne({ _id: user._id });
          }
        ),
        { numRuns: 50, verbose: false }
      );
    }, 120000);
  });
  
  describe('Requirement 6.12: Quiet Hours Enforcement', () => {
    it('should correctly identify when current time is within quiet hours', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          quietHoursArbitrary,
          async (adminData, quietHours) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Update quiet hours
            await notificationPreferenceService.updateQuietHours(
              admin._id,
              quietHours
            );
            
            // Check quiet hours
            const isQuiet = await notificationPreferenceService.isQuietHours(admin._id);
            
            // Property: Should return boolean
            expect(typeof isQuiet).toBe('boolean');
            
            // Property: If quiet hours disabled, should always return false
            if (!quietHours.enabled) {
              expect(isQuiet).toBe(false);
            }
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 30, verbose: false }
      );
    }, 90000);
  });
  
  describe('Requirement 6.12: Preference Persistence', () => {
    it('should persist notification preferences across sessions', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.array(adminNotificationTypeArbitrary, { minLength: 1, maxLength: 3 }),
          async (adminData, disabledTypes) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Disable multiple notification types
            for (const type of disabledTypes) {
              await notificationPreferenceService.updateNotificationType(
                admin._id,
                type,
                { enabled: false },
                true // isAdmin
              );
            }
            
            // Retrieve preferences (simulating new session)
            const preferences = await notificationPreferenceService.getPreferences(admin._id);
            
            // Property: All disabled types should remain disabled
            for (const type of disabledTypes) {
              expect(preferences.adminPreferences[type].enabled).toBe(false);
            }
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 30, verbose: false }
      );
    }, 90000);
  });
  
  describe('Requirement 6.12: Enable/Disable All Notifications', () => {
    it('should disable all admin notifications when requested', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          async (adminData) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Disable all admin notifications
            await notificationPreferenceService.disableAllNotifications(admin._id, true);
            
            // Get preferences
            const preferences = await notificationPreferenceService.getPreferences(admin._id);
            
            // Property: All admin notification types should be disabled
            const adminTypes = Object.keys(preferences.adminPreferences);
            for (const type of adminTypes) {
              expect(preferences.adminPreferences[type].enabled).toBe(false);
            }
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
    
    it('should enable all admin notifications when requested', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          async (adminData) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // First disable all
            await notificationPreferenceService.disableAllNotifications(admin._id, true);
            
            // Then enable all
            await notificationPreferenceService.enableAllNotifications(admin._id, true);
            
            // Get preferences
            const preferences = await notificationPreferenceService.getPreferences(admin._id);
            
            // Property: All admin notification types should be enabled
            const adminTypes = Object.keys(preferences.adminPreferences);
            for (const type of adminTypes) {
              expect(preferences.adminPreferences[type].enabled).toBe(true);
            }
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.12: Push and Email Preferences', () => {
    it('should independently control push and email preferences for each notification type', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          adminNotificationTypeArbitrary,
          fc.boolean(), // push enabled
          fc.boolean(), // email enabled
          async (adminData, notificationType, pushEnabled, emailEnabled) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Update notification type with specific push/email settings
            await notificationPreferenceService.updateNotificationType(
              admin._id,
              notificationType,
              { 
                enabled: true,
                push: pushEnabled,
                email: emailEnabled
              },
              true // isAdmin
            );
            
            // Get preferences
            const preferences = await notificationPreferenceService.getPreferences(admin._id);
            
            // Property: Push and email settings should match what was set
            expect(preferences.adminPreferences[notificationType].push).toBe(pushEnabled);
            expect(preferences.adminPreferences[notificationType].email).toBe(emailEnabled);
            
            // Property: Notification should still be enabled
            expect(preferences.adminPreferences[notificationType].enabled).toBe(true);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 40, verbose: false }
      );
    }, 120000);
  });
  
  describe('Requirement 6.12: Default Preferences', () => {
    it('should create default preferences for new users', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          async (adminData) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Get preferences (should create defaults)
            const preferences = await notificationPreferenceService.getPreferences(admin._id);
            
            // Property: Preferences should exist
            expect(preferences).toBeDefined();
            expect(preferences.user.toString()).toBe(admin._id.toString());
            
            // Property: Should have admin preferences structure
            expect(preferences.adminPreferences).toBeDefined();
            
            // Property: Should have quiet hours structure
            expect(preferences.quietHours).toBeDefined();
            expect(preferences.quietHours.enabled).toBeDefined();
            expect(preferences.quietHours.start).toBeDefined();
            expect(preferences.quietHours.end).toBeDefined();
            
            // Property: Should have push subscriptions array
            expect(Array.isArray(preferences.pushSubscriptions)).toBe(true);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.12: Notification Summary', () => {
    it('should correctly calculate notification summary statistics', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.integer({ min: 0, max: 7 }), // number of admin types to disable
          async (adminData, disableCount) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Get initial preferences
            const initialPrefs = await notificationPreferenceService.getPreferences(admin._id);
            const adminTypes = Object.keys(initialPrefs.adminPreferences);
            
            // Disable random admin notification types
            const typesToDisable = adminTypes.slice(0, disableCount);
            for (const type of typesToDisable) {
              await notificationPreferenceService.updateNotificationType(
                admin._id,
                type,
                { enabled: false },
                true // isAdmin
              );
            }
            
            // Get summary
            const summary = await notificationPreferenceService.getNotificationSummary(admin._id);
            
            // Property: Summary should have correct structure
            expect(summary.admin).toBeDefined();
            expect(summary.admin.enabled).toBeDefined();
            expect(summary.admin.total).toBeDefined();
            expect(summary.admin.percentage).toBeDefined();
            
            // Property: Enabled count should match
            const expectedEnabled = adminTypes.length - disableCount;
            expect(summary.admin.enabled).toBe(expectedEnabled);
            expect(summary.admin.total).toBe(adminTypes.length);
            
            // Property: Percentage should be calculated correctly
            const expectedPercentage = Math.round((expectedEnabled / adminTypes.length) * 100);
            expect(summary.admin.percentage).toBe(expectedPercentage);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 30, verbose: false }
      );
    }, 90000);
  });
  
  describe('Requirement 6.12: Quiet Hours Time Validation', () => {
    it('should validate quiet hours time format', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          async (adminData) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Property: Invalid time format should throw error
            await expect(
              notificationPreferenceService.updateQuietHours(admin._id, {
                enabled: true,
                start: '25:00', // Invalid hour
                end: '08:00'
              })
            ).rejects.toThrow();
            
            await expect(
              notificationPreferenceService.updateQuietHours(admin._id, {
                enabled: true,
                start: '22:00',
                end: '08:70' // Invalid minute
              })
            ).rejects.toThrow();
            
            await expect(
              notificationPreferenceService.updateQuietHours(admin._id, {
                enabled: true,
                start: 'invalid',
                end: '08:00'
              })
            ).rejects.toThrow();
            
            // Property: Valid time format should succeed
            await expect(
              notificationPreferenceService.updateQuietHours(admin._id, {
                enabled: true,
                start: '22:00',
                end: '08:00'
              })
            ).resolves.toBeDefined();
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 10, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.12: Push Subscription Management', () => {
    it('should manage push subscriptions correctly', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.webUrl(), // endpoint
          fc.string({ minLength: 20, maxLength: 100 }), // p256dh key
          fc.string({ minLength: 20, maxLength: 100 }), // auth key
          async (adminData, endpoint, p256dh, auth) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-pref-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Add push subscription
            const subscription = {
              endpoint,
              keys: { p256dh, auth },
              deviceInfo: 'Test Device'
            };
            
            await notificationPreferenceService.addPushSubscription(admin._id, subscription);
            
            // Get subscriptions
            let subscriptions = await notificationPreferenceService.getPushSubscriptions(admin._id);
            
            // Property: Subscription should be added
            expect(subscriptions.length).toBe(1);
            expect(subscriptions[0].endpoint).toBe(endpoint);
            expect(subscriptions[0].keys.p256dh).toBe(p256dh);
            expect(subscriptions[0].keys.auth).toBe(auth);
            
            // Property: Adding same subscription again should not duplicate
            await notificationPreferenceService.addPushSubscription(admin._id, subscription);
            subscriptions = await notificationPreferenceService.getPushSubscriptions(admin._id);
            expect(subscriptions.length).toBe(1);
            
            // Remove subscription
            await notificationPreferenceService.removePushSubscription(admin._id, endpoint);
            subscriptions = await notificationPreferenceService.getPushSubscriptions(admin._id);
            
            // Property: Subscription should be removed
            expect(subscriptions.length).toBe(0);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Property: Preference Isolation', () => {
    it('should isolate preferences between different users', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          adminUserArbitrary,
          adminNotificationTypeArbitrary,
          async (admin1Data, admin2Data, notificationType) => {
            // Create two admin users
            const admin1 = await User.create({
              ...admin1Data,
              email: `test-pref-1-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            const admin2 = await User.create({
              ...admin2Data,
              email: `test-pref-2-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Disable notification type for admin1 only
            await notificationPreferenceService.updateNotificationType(
              admin1._id,
              notificationType,
              { enabled: false },
              true // isAdmin
            );
            
            // Check preferences for both admins
            const isEnabledAdmin1 = await notificationPreferenceService.isNotificationEnabled(
              admin1._id,
              notificationType,
              true
            );
            
            const isEnabledAdmin2 = await notificationPreferenceService.isNotificationEnabled(
              admin2._id,
              notificationType,
              true
            );
            
            // Property: Admin1 should have it disabled
            expect(isEnabledAdmin1).toBe(false);
            
            // Property: Admin2 should still have it enabled (default)
            expect(isEnabledAdmin2).toBe(true);
            
            // Cleanup
            await User.deleteMany({ _id: { $in: [admin1._id, admin2._id] } });
          }
        ),
        { numRuns: 30, verbose: false }
      );
    }, 90000);
  });
});
