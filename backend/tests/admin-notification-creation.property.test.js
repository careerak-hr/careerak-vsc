const fc = require('fast-check');
const mongoose = require('mongoose');
const AdminNotification = require('../src/models/AdminNotification');
const NotificationPreference = require('../src/models/NotificationPreference');
const { User } = require('../src/models/User');
const adminNotificationService = require('../src/services/adminNotificationService');

// Feature: admin-dashboard-enhancements
// Property 15: Admin Notification Creation
// Validates: Requirements 6.1-6.7

/**
 * Property 15: Admin Notification Creation
 * 
 * For any platform event that requires admin attention (user registration, job posting, 
 * course publishing, review flagging, content reporting, suspicious activity, system error), 
 * the system should create an admin notification with the correct type and priority level 
 * (medium for jobs/courses, high for flagged content, urgent for suspicious activity/errors).
 */

describe('Property 15: Admin Notification Creation', () => {
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
      await AdminNotification.deleteMany({ title: /test-notification-/ });
      await User.deleteMany({ email: /test-admin-/ });
      await NotificationPreference.deleteMany({});
    }
  });
  
  // Cleanup: Disconnect from database
  afterAll(async () => {
    if (isDBAvailable()) {
      await AdminNotification.deleteMany({ title: /test-notification-/ });
      await User.deleteMany({ email: /test-admin-/ });
      await NotificationPreference.deleteMany({});
      await mongoose.connection.close();
    }
  }, 30000);
  
  // ============================================
  // Arbitraries (Data Generators)
  // ============================================
  
  const notificationTypeArbitrary = fc.constantFrom(
    'user_registered',
    'job_posted',
    'course_published',
    'review_flagged',
    'content_reported',
    'suspicious_activity',
    'system_error'
  );
  
  const priorityArbitrary = fc.constantFrom('low', 'medium', 'high', 'urgent');
  
  const adminUserArbitrary = fc.record({
    name: fc.string({ minLength: 3, maxLength: 50 }),
    email: fc.emailAddress(),
    role: fc.constantFrom('admin', 'moderator')
  });
  
  // ============================================
  // Property Tests
  // ============================================
  
  describe('Requirement 6.1: User Registration Notifications', () => {
    it('should create notification with correct type for user registration', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.string({ minLength: 3, maxLength: 50 }), // userName
          fc.constantFrom('jobSeeker', 'company', 'freelancer'), // userType
          async (adminData, userName, userType) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Create notification
            const notifications = await adminNotificationService.notifyUserRegistered(
              admin._id,
              userName,
              userType
            );
            
            // Property: Notification should be created
            expect(notifications).toHaveLength(1);
            
            // Property: Type should be 'user_registered'
            expect(notifications[0].type).toBe('user_registered');
            
            // Property: Should have correct admin ID
            expect(notifications[0].adminId.toString()).toBe(admin._id.toString());
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.2: Job Posting Notifications', () => {
    it('should create notification with medium priority for job posting', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.string({ minLength: 5, maxLength: 100 }), // jobTitle
          fc.string({ minLength: 3, maxLength: 50 }), // companyName
          async (adminData, jobTitle, companyName) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            const jobId = new mongoose.Types.ObjectId();
            
            // Create notification
            const notifications = await adminNotificationService.notifyJobPosted(
              jobId,
              jobTitle,
              companyName
            );
            
            // Property: Notification should be created
            expect(notifications).toHaveLength(1);
            
            // Property: Type should be 'job_posted'
            expect(notifications[0].type).toBe('job_posted');
            
            // Property: Priority should be 'medium' (Requirement 6.2)
            expect(notifications[0].priority).toBe('medium');
            
            // Property: Should have related job ID
            expect(notifications[0].relatedId.toString()).toBe(jobId.toString());
            expect(notifications[0].relatedType).toBe('JobPosting');
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.3: Course Publishing Notifications', () => {
    it('should create notification with medium priority for course publishing', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.string({ minLength: 5, maxLength: 100 }), // courseTitle
          fc.string({ minLength: 3, maxLength: 50 }), // instructorName
          async (adminData, courseTitle, instructorName) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            const courseId = new mongoose.Types.ObjectId();
            
            // Create notification
            const notifications = await adminNotificationService.notifyCoursePublished(
              courseId,
              courseTitle,
              instructorName
            );
            
            // Property: Notification should be created
            expect(notifications).toHaveLength(1);
            
            // Property: Type should be 'course_published'
            expect(notifications[0].type).toBe('course_published');
            
            // Property: Priority should be 'medium' (Requirement 6.3)
            expect(notifications[0].priority).toBe('medium');
            
            // Property: Should have related course ID
            expect(notifications[0].relatedId.toString()).toBe(courseId.toString());
            expect(notifications[0].relatedType).toBe('Course');
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.4: Review Flagging Notifications', () => {
    it('should create notification with high priority for flagged review', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.string({ minLength: 3, maxLength: 50 }), // reviewerName
          fc.string({ minLength: 3, maxLength: 50 }), // targetName
          fc.string({ minLength: 5, maxLength: 200 }), // reason
          async (adminData, reviewerName, targetName, reason) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            const reviewId = new mongoose.Types.ObjectId();
            
            // Create notification
            const notifications = await adminNotificationService.notifyReviewFlagged(
              reviewId,
              reviewerName,
              targetName,
              reason
            );
            
            // Property: Notification should be created
            expect(notifications).toHaveLength(1);
            
            // Property: Type should be 'review_flagged'
            expect(notifications[0].type).toBe('review_flagged');
            
            // Property: Priority should be 'high' (Requirement 6.4)
            expect(notifications[0].priority).toBe('high');
            
            // Property: Should have related review ID
            expect(notifications[0].relatedId.toString()).toBe(reviewId.toString());
            expect(notifications[0].relatedType).toBe('Review');
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.5: Content Reporting Notifications', () => {
    it('should create notification with high priority for reported content', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.constantFrom('Job', 'Course', 'Review', 'Comment'), // contentType
          fc.string({ minLength: 3, maxLength: 50 }), // reporterName
          fc.string({ minLength: 5, maxLength: 200 }), // reason
          async (adminData, contentType, reporterName, reason) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            const contentId = new mongoose.Types.ObjectId();
            
            // Create notification
            const notifications = await adminNotificationService.notifyContentReported(
              contentId,
              contentType,
              reporterName,
              reason
            );
            
            // Property: Notification should be created
            expect(notifications).toHaveLength(1);
            
            // Property: Type should be 'content_reported'
            expect(notifications[0].type).toBe('content_reported');
            
            // Property: Priority should be 'high' (Requirement 6.5)
            expect(notifications[0].priority).toBe('high');
            
            // Property: Should have related content ID and type
            expect(notifications[0].relatedId.toString()).toBe(contentId.toString());
            expect(notifications[0].relatedType).toBe(contentType);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.6: Suspicious Activity Notifications', () => {
    it('should create notification with urgent priority for suspicious activity', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.string({ minLength: 3, maxLength: 50 }), // userName
          fc.constantFrom('multiple_login_attempts', 'unusual_activity', 'spam_detected'), // activityType
          fc.string({ minLength: 5, maxLength: 200 }), // details
          async (adminData, userName, activityType, details) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            const userId = new mongoose.Types.ObjectId();
            
            // Create notification
            const notifications = await adminNotificationService.notifySuspiciousActivity(
              userId,
              userName,
              activityType,
              details
            );
            
            // Property: Notification should be created
            expect(notifications).toHaveLength(1);
            
            // Property: Type should be 'suspicious_activity'
            expect(notifications[0].type).toBe('suspicious_activity');
            
            // Property: Priority should be 'urgent' (Requirement 6.6)
            expect(notifications[0].priority).toBe('urgent');
            
            // Property: Should have related user ID
            expect(notifications[0].relatedId.toString()).toBe(userId.toString());
            expect(notifications[0].relatedType).toBe('User');
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Requirement 6.7: System Error Notifications', () => {
    it('should create notification with urgent priority for system error', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          fc.constantFrom('DatabaseError', 'APIError', 'ValidationError', 'NetworkError'), // errorType
          fc.string({ minLength: 10, maxLength: 200 }), // errorMessage
          async (adminData, errorType, errorMessage) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Create notification
            const notifications = await adminNotificationService.notifySystemError(
              errorType,
              errorMessage,
              'Error stack trace...'
            );
            
            // Property: Notification should be created
            expect(notifications).toHaveLength(1);
            
            // Property: Type should be 'system_error'
            expect(notifications[0].type).toBe('system_error');
            
            // Property: Priority should be 'urgent' (Requirement 6.7)
            expect(notifications[0].priority).toBe('urgent');
            
            // Property: Should have system error type
            expect(notifications[0].relatedType).toBe('SystemError');
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 20, verbose: false }
      );
    }, 60000);
  });
  
  describe('Property: Notification Creation with Multiple Admins', () => {
    it('should create notifications for all admins when adminId is "all"', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }), // Number of admins
          notificationTypeArbitrary,
          priorityArbitrary,
          async (adminCount, type, priority) => {
            // Create multiple admin users
            const admins = [];
            for (let i = 0; i < adminCount; i++) {
              const admin = await User.create({
                name: `Test Admin ${i}`,
                email: `test-admin-${Date.now()}-${i}-${Math.random()}@test.com`,
                password: 'hashedpassword123',
                role: i % 2 === 0 ? 'admin' : 'moderator'
              });
              admins.push(admin);
            }
            
            // Create notification for all admins
            const notifications = await adminNotificationService.createAdminNotification({
              adminId: 'all',
              type,
              priority,
              title: `test-notification-${Date.now()}`,
              message: 'Test notification message'
            });
            
            // Property: Should create notification for each admin
            expect(notifications.length).toBe(adminCount);
            
            // Property: Each notification should have correct type and priority
            notifications.forEach(notification => {
              expect(notification.type).toBe(type);
              expect(notification.priority).toBe(priority);
              expect(notification.isRead).toBe(false);
            });
            
            // Property: All admin IDs should be covered
            const notificationAdminIds = notifications.map(n => n.adminId.toString()).sort();
            const expectedAdminIds = admins.map(a => a._id.toString()).sort();
            expect(notificationAdminIds).toEqual(expectedAdminIds);
            
            // Cleanup
            await User.deleteMany({ _id: { $in: admins.map(a => a._id) } });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 10, verbose: false }
      );
    }, 60000);
  });
  
  describe('Property: Notification Priority Consistency', () => {
    it('should always assign correct priority based on notification type', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      // Define expected priorities for each type
      const typePriorityMap = {
        'user_registered': 'low',
        'job_posted': 'medium',
        'course_published': 'medium',
        'review_flagged': 'high',
        'content_reported': 'high',
        'suspicious_activity': 'urgent',
        'system_error': 'urgent'
      };
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          notificationTypeArbitrary,
          async (adminData, type) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Create notification using the appropriate helper method
            let notifications;
            const testId = new mongoose.Types.ObjectId();
            
            switch (type) {
              case 'user_registered':
                notifications = await adminNotificationService.notifyUserRegistered(testId, 'Test User', 'jobSeeker');
                break;
              case 'job_posted':
                notifications = await adminNotificationService.notifyJobPosted(testId, 'Test Job', 'Test Company');
                break;
              case 'course_published':
                notifications = await adminNotificationService.notifyCoursePublished(testId, 'Test Course', 'Test Instructor');
                break;
              case 'review_flagged':
                notifications = await adminNotificationService.notifyReviewFlagged(testId, 'Reviewer', 'Target', 'Test reason');
                break;
              case 'content_reported':
                notifications = await adminNotificationService.notifyContentReported(testId, 'Job', 'Reporter', 'Test reason');
                break;
              case 'suspicious_activity':
                notifications = await adminNotificationService.notifySuspiciousActivity(testId, 'Test User', 'spam', 'Test details');
                break;
              case 'system_error':
                notifications = await adminNotificationService.notifySystemError('TestError', 'Test error message', 'stack');
                break;
            }
            
            // Property: Priority should match expected priority for type
            expect(notifications).toHaveLength(1);
            expect(notifications[0].priority).toBe(typePriorityMap[type]);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 30, verbose: false }
      );
    }, 120000);
  });
  
  describe('Property: Required Fields Validation', () => {
    it('should always include all required fields in created notifications', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          adminUserArbitrary,
          notificationTypeArbitrary,
          priorityArbitrary,
          fc.string({ minLength: 5, maxLength: 100 }), // title
          fc.string({ minLength: 10, maxLength: 500 }), // message
          async (adminData, type, priority, title, message) => {
            // Create admin user
            const admin = await User.create({
              ...adminData,
              email: `test-admin-${Date.now()}-${Math.random()}@test.com`,
              password: 'hashedpassword123'
            });
            
            // Create notification
            const notifications = await adminNotificationService.createAdminNotification({
              adminId: admin._id,
              type,
              priority,
              title: `test-notification-${title}`,
              message
            });
            
            // Property: All required fields should be present
            expect(notifications).toHaveLength(1);
            const notification = notifications[0];
            
            expect(notification.adminId).toBeDefined();
            expect(notification.type).toBeDefined();
            expect(notification.priority).toBeDefined();
            expect(notification.title).toBeDefined();
            expect(notification.message).toBeDefined();
            expect(notification.timestamp).toBeDefined();
            expect(notification.isRead).toBeDefined();
            
            // Property: Required fields should have correct types
            expect(notification.adminId.toString()).toBe(admin._id.toString());
            expect(typeof notification.type).toBe('string');
            expect(typeof notification.priority).toBe('string');
            expect(typeof notification.title).toBe('string');
            expect(typeof notification.message).toBe('string');
            expect(notification.timestamp).toBeInstanceOf(Date);
            expect(typeof notification.isRead).toBe('boolean');
            
            // Property: isRead should default to false
            expect(notification.isRead).toBe(false);
            
            // Cleanup
            await User.deleteOne({ _id: admin._id });
            await AdminNotification.deleteMany({ _id: { $in: notifications.map(n => n._id) } });
          }
        ),
        { numRuns: 30, verbose: false }
      );
    }, 120000);
  });
});
