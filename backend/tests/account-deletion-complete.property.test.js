const fc = require('fast-check');
const mongoose = require('mongoose');
const AccountDeletionRequest = require('../src/models/AccountDeletionRequest');
const { User } = require('../src/models/User');
const ActiveSession = require('../src/models/ActiveSession');
const LoginHistory = require('../src/models/LoginHistory');
const Notification = require('../src/models/Notification');
const UserInteraction = require('../src/models/UserInteraction');
const JobApplication = require('../src/models/JobApplication');
const Review = require('../src/models/Review');
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');
const DataExportRequest = require('../src/models/DataExportRequest');
const JobPosting = require('../src/models/JobPosting');
const Course = require('../src/models/Course');
const ErrorLog = require('../src/models/ErrorLog');
const accountDeletionService = require('../src/services/accountDeletionService');

// Feature: settings-page-enhancements, Property 23 & 24: Complete Data Deletion & Legal Data Anonymization
describe('Property 23 & 24: Complete Data Deletion & Legal Data Anonymization', () => {
  let testUsers = [];

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test');
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: /^test-deletion-/ });
    await AccountDeletionRequest.deleteMany({});
    await ActiveSession.deleteMany({});
    await LoginHistory.deleteMany({});
    await Notification.deleteMany({});
    await UserInteraction.deleteMany({});
    await JobApplication.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    await Conversation.deleteMany({});
    await DataExportRequest.deleteMany({});
    await JobPosting.deleteMany({});
    await Course.deleteMany({});
    await ErrorLog.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    testUsers = [];
  });

  afterEach(async () => {
    // Cleanup test users and related data
    const userIds = testUsers.map(u => u._id);
    await User.deleteMany({ _id: { $in: userIds } });
    await AccountDeletionRequest.deleteMany({ userId: { $in: userIds } });
    await ActiveSession.deleteMany({ userId: { $in: userIds } });
    await LoginHistory.deleteMany({ userId: { $in: userIds } });
    await Notification.deleteMany({ userId: { $in: userIds } });
    await UserInteraction.deleteMany({ userId: { $in: userIds } });
    await JobApplication.deleteMany({ userId: { $in: userIds } });
    await Review.deleteMany({ $or: [{ reviewerId: { $in: userIds } }, { revieweeId: { $in: userIds } }] });
    await Message.deleteMany({ senderId: { $in: userIds } });
    await Conversation.deleteMany({ participants: { $in: userIds } });
    await DataExportRequest.deleteMany({ userId: { $in: userIds } });
    await JobPosting.deleteMany({ postedBy: { $in: userIds } });
    await Course.deleteMany({ createdBy: { $in: userIds } });
    await ErrorLog.deleteMany({ userId: { $in: userIds } });
  });

  /**
   * Property 23: Complete Data Deletion
   * 
   * For any account deletion after grace period, the system should permanently 
   * delete all user data (profile, posts, messages, applications, reviews, sessions).
   * 
   * Validates: Requirements 12.8
   */
  test('should permanently delete all user data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          sessionsCount: fc.integer({ min: 1, max: 5 }),
          notificationsCount: fc.integer({ min: 1, max: 10 }),
          interactionsCount: fc.integer({ min: 1, max: 5 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-deletion-complete-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create related data
          // 1. Sessions
          for (let i = 0; i < userData.sessionsCount; i++) {
            await ActiveSession.create({
              userId: user._id,
              token: `test-token-${i}-${Date.now()}`,
              device: { type: 'desktop', os: 'Windows', browser: 'Chrome', fingerprint: 'test' },
              location: { ipAddress: '127.0.0.1' },
              loginTime: new Date(),
              lastActivity: new Date(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
          }

          // 2. Login History
          await LoginHistory.create({
            userId: user._id,
            timestamp: new Date(),
            success: true,
            device: { type: 'desktop', os: 'Windows', browser: 'Chrome' },
            location: { ipAddress: '127.0.0.1' }
          });

          // 3. Notifications
          for (let i = 0; i < userData.notificationsCount; i++) {
            await Notification.create({
              userId: user._id,
              type: 'system',
              title: `Test Notification ${i}`,
              message: 'Test message',
              priority: 'medium'
            });
          }

          // 4. User Interactions
          for (let i = 0; i < userData.interactionsCount; i++) {
            await UserInteraction.create({
              userId: user._id,
              itemType: 'job',
              itemId: new mongoose.Types.ObjectId(),
              interactionType: 'view'
            });
          }

          // 5. Data Export Request
          await DataExportRequest.create({
            userId: user._id,
            dataTypes: ['profile'],
            format: 'json',
            status: 'pending'
          });

          // Verify data exists before deletion
          const sessionsBefore = await ActiveSession.countDocuments({ userId: user._id });
          const notificationsBefore = await Notification.countDocuments({ userId: user._id });
          const interactionsBefore = await UserInteraction.countDocuments({ userId: user._id });
          const exportsBefore = await DataExportRequest.countDocuments({ userId: user._id });

          expect(sessionsBefore).toBe(userData.sessionsCount);
          expect(notificationsBefore).toBe(userData.notificationsCount);
          expect(interactionsBefore).toBe(userData.interactionsCount);
          expect(exportsBefore).toBe(1);

          // Property: Permanently delete account
          const results = await accountDeletionService.permanentlyDeleteAccount(user._id.toString());

          // Verify all data is deleted
          expect(results.user).toBe(true);
          expect(results.sessions).toBe(userData.sessionsCount);
          expect(results.notifications).toBe(userData.notificationsCount);
          expect(results.interactions).toBe(userData.interactionsCount);
          expect(results.dataExports).toBe(1);

          // Verify user is deleted
          const userAfter = await User.findById(user._id);
          expect(userAfter).toBeNull();

          // Verify all related data is deleted
          const sessionsAfter = await ActiveSession.countDocuments({ userId: user._id });
          const notificationsAfter = await Notification.countDocuments({ userId: user._id });
          const interactionsAfter = await UserInteraction.countDocuments({ userId: user._id });
          const exportsAfter = await DataExportRequest.countDocuments({ userId: user._id });

          expect(sessionsAfter).toBe(0);
          expect(notificationsAfter).toBe(0);
          expect(interactionsAfter).toBe(0);
          expect(exportsAfter).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 24: Legal Data Anonymization
   * 
   * For any account deletion, data that must be retained for legal reasons 
   * should be anonymized (remove all PII).
   * 
   * Validates: Requirements 12.9
   */
  test('should anonymize retained legal data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          email: fc.emailAddress()
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-deletion-anonymize-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'HR',
            companyName: 'Test Company',
            companyIndustry: 'Technology'
          });
          testUsers.push(user);

          // Create data that must be retained for legal reasons
          // 1. Job Posting (statistics)
          const jobPosting = await JobPosting.create({
            title: 'Test Job',
            description: 'Test Description',
            postedBy: user._id,
            contactEmail: userData.email,
            contactPhone: userData.phone,
            company: 'Test Company',
            location: 'Test City',
            salary: { min: 50000, max: 70000 },
            requirements: ['Test Requirement']
          });

          // 2. Course (statistics)
          const course = await Course.create({
            title: 'Test Course',
            description: 'Test Description',
            createdBy: user._id,
            instructorEmail: userData.email,
            category: 'Technology',
            price: 100
          });

          // 3. Error Log (debugging)
          const errorLog = await ErrorLog.create({
            userId: user._id,
            userEmail: userData.email,
            component: 'TestComponent',
            level: 'error',
            message: 'Test error',
            metadata: {
              userInfo: 'Sensitive user info'
            }
          });

          // Property: Anonymize retained data
          const anonymized = await accountDeletionService.anonymizeRetainedData(user._id.toString());

          expect(anonymized).toContain('job_postings');
          expect(anonymized).toContain('courses');
          expect(anonymized).toContain('error_logs');

          // Verify job posting is anonymized
          const jobAfter = await JobPosting.findById(jobPosting._id);
          expect(jobAfter.postedBy).toBeNull();
          expect(jobAfter.contactEmail).toBe('deleted@careerak.com');
          expect(jobAfter.contactPhone).toBe('DELETED');

          // Verify course is anonymized
          const courseAfter = await Course.findById(course._id);
          expect(courseAfter.createdBy).toBeNull();
          expect(courseAfter.instructorEmail).toBe('deleted@careerak.com');

          // Verify error log is anonymized
          const errorAfter = await ErrorLog.findById(errorLog._id);
          expect(errorAfter.userId).toBeNull();
          expect(errorAfter.userEmail).toBe('deleted@careerak.com');
          expect(errorAfter.metadata.userInfo).toBe('ANONYMIZED');
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should delete messages and conversations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          messagesCount: fc.integer({ min: 1, max: 10 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-deletion-messages-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create another user for conversation
          const otherUser = await User.create({
            email: `test-deletion-other-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Other',
            lastName: 'User'
          });
          testUsers.push(otherUser);

          // Create conversation
          const conversation = await Conversation.create({
            participants: [user._id, otherUser._id],
            lastMessage: 'Test message'
          });

          // Create messages
          for (let i = 0; i < userData.messagesCount; i++) {
            await Message.create({
              conversationId: conversation._id,
              senderId: user._id,
              content: `Test message ${i}`,
              type: 'text'
            });
          }

          // Verify data exists
          const messagesBefore = await Message.countDocuments({ senderId: user._id });
          const conversationsBefore = await Conversation.countDocuments({ participants: user._id });

          expect(messagesBefore).toBe(userData.messagesCount);
          expect(conversationsBefore).toBe(1);

          // Property: Delete messages and conversations
          const results = await accountDeletionService.permanentlyDeleteAccount(user._id.toString());

          expect(results.messages).toBe(userData.messagesCount);
          expect(results.conversations).toBe(1);

          // Verify deletion
          const messagesAfter = await Message.countDocuments({ senderId: user._id });
          const conversationsAfter = await Conversation.countDocuments({ participants: user._id });

          expect(messagesAfter).toBe(0);
          expect(conversationsAfter).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should delete job applications', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          applicationsCount: fc.integer({ min: 1, max: 5 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-deletion-apps-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create job applications
          for (let i = 0; i < userData.applicationsCount; i++) {
            await JobApplication.create({
              userId: user._id,
              jobId: new mongoose.Types.ObjectId(),
              status: 'pending',
              appliedAt: new Date()
            });
          }

          // Verify data exists
          const applicationsBefore = await JobApplication.countDocuments({ userId: user._id });
          expect(applicationsBefore).toBe(userData.applicationsCount);

          // Property: Delete applications
          const results = await accountDeletionService.permanentlyDeleteAccount(user._id.toString());

          expect(results.applications).toBe(userData.applicationsCount);

          // Verify deletion
          const applicationsAfter = await JobApplication.countDocuments({ userId: user._id });
          expect(applicationsAfter).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should delete reviews (given and received)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          givenReviews: fc.integer({ min: 1, max: 3 }),
          receivedReviews: fc.integer({ min: 1, max: 3 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-deletion-reviews-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create other users for reviews
          const otherUser1 = await User.create({
            email: `test-deletion-other1-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Other1',
            lastName: 'User'
          });
          testUsers.push(otherUser1);

          const otherUser2 = await User.create({
            email: `test-deletion-other2-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Other2',
            lastName: 'User'
          });
          testUsers.push(otherUser2);

          // Create reviews given by user
          for (let i = 0; i < userData.givenReviews; i++) {
            await Review.create({
              reviewerId: user._id,
              revieweeId: otherUser1._id,
              jobApplicationId: new mongoose.Types.ObjectId(),
              overallRating: 4,
              title: 'Test Review',
              comment: 'Test comment'
            });
          }

          // Create reviews received by user
          for (let i = 0; i < userData.receivedReviews; i++) {
            await Review.create({
              reviewerId: otherUser2._id,
              revieweeId: user._id,
              jobApplicationId: new mongoose.Types.ObjectId(),
              overallRating: 5,
              title: 'Test Review',
              comment: 'Test comment'
            });
          }

          // Verify data exists
          const reviewsBefore = await Review.countDocuments({
            $or: [{ reviewerId: user._id }, { revieweeId: user._id }]
          });
          expect(reviewsBefore).toBe(userData.givenReviews + userData.receivedReviews);

          // Property: Delete all reviews
          const results = await accountDeletionService.permanentlyDeleteAccount(user._id.toString());

          expect(results.reviews).toBe(userData.givenReviews + userData.receivedReviews);

          // Verify deletion
          const reviewsAfter = await Review.countDocuments({
            $or: [{ reviewerId: user._id }, { revieweeId: user._id }]
          });
          expect(reviewsAfter).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should process scheduled deletions automatically', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-deletion-scheduled-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request that's ready for processing
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'pending',
            requestedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
            scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago (expired)
          });

          // Verify deletion is ready
          expect(deletionRequest.isReadyForDeletion()).toBe(true);

          // Property: Process scheduled deletions
          const results = await accountDeletionService.processScheduledDeletions();

          expect(results.processed).toBeGreaterThanOrEqual(1);
          expect(results.succeeded).toBeGreaterThanOrEqual(1);
          expect(results.failed).toBe(0);

          // Verify user is deleted
          const userAfter = await User.findById(user._id);
          expect(userAfter).toBeNull();

          // Verify deletion request is marked as completed
          const deletionAfter = await AccountDeletionRequest.findById(deletionRequest._id);
          expect(deletionAfter.status).toBe('completed');
          expect(deletionAfter.completedAt).toBeDefined();
        }
      ),
      { numRuns: 10 }
    );
  });
});
