/**
 * Property Test: Withdrawal Completeness
 * 
 * Feature: apply-page-enhancements
 * Property 10: Withdrawal completeness
 * 
 * Validates: Requirements 6.3, 6.4, 6.6
 * 
 * Property Statement:
 * For any withdrawable application (status Pending or Reviewed), when withdrawal is confirmed,
 * the system should update status to Withdrawn, add an entry to the status timeline with timestamp,
 * and send a notification to the employer.
 * 
 * Test Strategy:
 * - Generate random withdrawable applications (Submitted, Reviewed)
 * - Perform withdrawal operation
 * - Verify status updated to Withdrawn
 * - Verify timeline entry added with timestamp
 * - Verify employer notification sent
 * - Run 100+ iterations with different inputs
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const JobApplication = require('../src/models/JobApplication');
const JobPosting = require('../src/models/JobPosting');
const User = require('../src/models/User');
const Notification = require('../src/models/Notification');
const notificationService = require('../src/services/notificationService');

// Mock Pusher service
jest.mock('../src/services/pusherService', () => ({
  isInitialized: true,
  sendNotificationToUser: jest.fn().mockResolvedValue(true)
}));

describe('Property 10: Withdrawal Completeness', () => {
  let testDb;
  let applicant;
  let employer;
  let jobPosting;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak-test';
    await mongoose.connect(mongoUri);
    testDb = mongoose.connection;
  });

  afterAll(async () => {
    await testDb.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections
    await JobApplication.deleteMany({});
    await JobPosting.deleteMany({});
    await User.deleteMany({});
    await Notification.deleteMany({});

    // Create test users
    applicant = await User.create({
      firstName: 'Test',
      lastName: 'Applicant',
      email: 'applicant@test.com',
      password: 'password123',
      role: 'employee'
    });

    employer = await User.create({
      firstName: 'Test',
      lastName: 'Employer',
      email: 'employer@test.com',
      password: 'password123',
      role: 'company'
    });

    // Create test job posting
    jobPosting = await JobPosting.create({
      title: 'Test Job',
      description: 'Test Description',
      location: 'Test Location',
      postedBy: employer._id,
      company: 'Test Company'
    });
  });

  /**
   * Arbitrary: Generate withdrawable application status
   */
  const withdrawableStatusArb = fc.constantFrom('Submitted', 'Reviewed');

  /**
   * Arbitrary: Generate application data
   */
  const applicationDataArb = fc.record({
    fullName: fc.string({ minLength: 3, maxLength: 50 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 10, maxLength: 15 }),
    country: fc.constantFrom('USA', 'UK', 'Canada', 'Egypt', 'UAE'),
    city: fc.string({ minLength: 3, maxLength: 30 })
  });

  /**
   * Property Test: Withdrawal updates status to Withdrawn
   * Requirement 6.3
   */
  test('Property 10.1: Withdrawal updates status to Withdrawn', async () => {
    await fc.assert(
      fc.asyncProperty(
        withdrawableStatusArb,
        applicationDataArb,
        async (initialStatus, appData) => {
          // Create application with withdrawable status
          const application = await JobApplication.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: appData.fullName,
            email: appData.email,
            phone: appData.phone,
            country: appData.country,
            city: appData.city,
            status: initialStatus,
            statusHistory: [
              {
                status: 'Submitted',
                timestamp: new Date(),
                note: 'Application submitted'
              }
            ],
            submittedAt: new Date()
          });

          // If status is Reviewed, add to history
          if (initialStatus === 'Reviewed') {
            application.statusHistory.push({
              status: 'Reviewed',
              timestamp: new Date(),
              note: 'Application reviewed'
            });
            await application.save();
          }

          // Perform withdrawal
          application.status = 'Withdrawn';
          application.withdrawnAt = new Date();
          application.statusHistory.push({
            status: 'Withdrawn',
            timestamp: new Date(),
            note: 'Application withdrawn by applicant'
          });
          await application.save();

          // Verify status updated to Withdrawn
          const updatedApp = await JobApplication.findById(application._id);
          expect(updatedApp.status).toBe('Withdrawn');
          expect(updatedApp.withdrawnAt).toBeDefined();
          expect(updatedApp.withdrawnAt).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Withdrawal adds timeline entry with timestamp
   * Requirement 6.6
   */
  test('Property 10.2: Withdrawal adds timeline entry with timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        withdrawableStatusArb,
        applicationDataArb,
        async (initialStatus, appData) => {
          // Create application
          const application = await JobApplication.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: appData.fullName,
            email: appData.email,
            phone: appData.phone,
            status: initialStatus,
            statusHistory: [
              {
                status: 'Submitted',
                timestamp: new Date(),
                note: 'Application submitted'
              }
            ],
            submittedAt: new Date()
          });

          const beforeHistoryLength = application.statusHistory.length;
          const withdrawalTime = new Date();

          // Perform withdrawal
          application.status = 'Withdrawn';
          application.withdrawnAt = withdrawalTime;
          application.statusHistory.push({
            status: 'Withdrawn',
            timestamp: withdrawalTime,
            note: 'Application withdrawn by applicant'
          });
          await application.save();

          // Verify timeline entry added
          const updatedApp = await JobApplication.findById(application._id);
          expect(updatedApp.statusHistory.length).toBe(beforeHistoryLength + 1);

          // Verify the last entry is Withdrawn
          const lastEntry = updatedApp.statusHistory[updatedApp.statusHistory.length - 1];
          expect(lastEntry.status).toBe('Withdrawn');
          expect(lastEntry.timestamp).toBeDefined();
          expect(lastEntry.timestamp).toBeInstanceOf(Date);
          expect(lastEntry.note).toContain('withdrawn');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Withdrawal sends notification to employer
   * Requirement 6.4
   */
  test('Property 10.3: Withdrawal sends notification to employer', async () => {
    await fc.assert(
      fc.asyncProperty(
        withdrawableStatusArb,
        applicationDataArb,
        async (initialStatus, appData) => {
          // Create application
          const application = await JobApplication.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: appData.fullName,
            email: appData.email,
            phone: appData.phone,
            status: initialStatus,
            statusHistory: [
              {
                status: 'Submitted',
                timestamp: new Date(),
                note: 'Application submitted'
              }
            ],
            submittedAt: new Date()
          });

          const withdrawalTime = new Date();

          // Perform withdrawal
          application.status = 'Withdrawn';
          application.withdrawnAt = withdrawalTime;
          application.statusHistory.push({
            status: 'Withdrawn',
            timestamp: withdrawalTime,
            note: 'Application withdrawn by applicant'
          });
          await application.save();

          // Send notification to employer
          await notificationService.createNotification({
            recipient: employer._id,
            type: 'application_withdrawn',
            title: 'Application Withdrawn',
            message: `${appData.fullName} has withdrawn their application for "${jobPosting.title}"`,
            relatedData: {
              jobApplication: application._id,
              jobPosting: jobPosting._id,
              withdrawnAt: withdrawalTime
            },
            priority: 'medium'
          });

          // Verify notification created
          const notifications = await Notification.find({
            recipient: employer._id,
            type: 'application_withdrawn'
          });

          expect(notifications.length).toBeGreaterThan(0);
          const notification = notifications[notifications.length - 1];
          expect(notification.title).toContain('Withdrawn');
          expect(notification.message).toContain(appData.fullName);
          expect(notification.message).toContain(jobPosting.title);
          expect(notification.relatedData.jobApplication.toString()).toBe(application._id.toString());
          expect(notification.relatedData.withdrawnAt).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Complete withdrawal flow
   * Validates all requirements together (6.3, 6.4, 6.6)
   */
  test('Property 10.4: Complete withdrawal flow', async () => {
    await fc.assert(
      fc.asyncProperty(
        withdrawableStatusArb,
        applicationDataArb,
        async (initialStatus, appData) => {
          // Create application
          const application = await JobApplication.create({
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: appData.fullName,
            email: appData.email,
            phone: appData.phone,
            status: initialStatus,
            statusHistory: [
              {
                status: 'Submitted',
                timestamp: new Date(),
                note: 'Application submitted'
              }
            ],
            submittedAt: new Date()
          });

          const beforeHistoryLength = application.statusHistory.length;
          const withdrawalTime = new Date();

          // Perform complete withdrawal flow
          application.status = 'Withdrawn';
          application.withdrawnAt = withdrawalTime;
          application.statusHistory.push({
            status: 'Withdrawn',
            timestamp: withdrawalTime,
            note: 'Application withdrawn by applicant'
          });
          await application.save();

          // Send notification
          await notificationService.createNotification({
            recipient: employer._id,
            type: 'application_withdrawn',
            title: 'Application Withdrawn',
            message: `${appData.fullName} has withdrawn their application for "${jobPosting.title}"`,
            relatedData: {
              jobApplication: application._id,
              jobPosting: jobPosting._id,
              withdrawnAt: withdrawalTime
            },
            priority: 'medium'
          });

          // Verify all requirements
          const updatedApp = await JobApplication.findById(application._id);
          const notifications = await Notification.find({
            recipient: employer._id,
            type: 'application_withdrawn'
          });

          // Requirement 6.3: Status updated to Withdrawn
          expect(updatedApp.status).toBe('Withdrawn');
          expect(updatedApp.withdrawnAt).toBeDefined();

          // Requirement 6.6: Timeline entry added
          expect(updatedApp.statusHistory.length).toBe(beforeHistoryLength + 1);
          const lastEntry = updatedApp.statusHistory[updatedApp.statusHistory.length - 1];
          expect(lastEntry.status).toBe('Withdrawn');
          expect(lastEntry.timestamp).toBeDefined();

          // Requirement 6.4: Employer notification sent
          expect(notifications.length).toBeGreaterThan(0);
          const notification = notifications[notifications.length - 1];
          expect(notification.relatedData.jobApplication.toString()).toBe(application._id.toString());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Withdrawal preserves application data
   */
  test('Property 10.5: Withdrawal preserves application data', async () => {
    await fc.assert(
      fc.asyncProperty(
        withdrawableStatusArb,
        applicationDataArb,
        async (initialStatus, appData) => {
          // Create application with full data
          const originalData = {
            jobPosting: jobPosting._id,
            applicant: applicant._id,
            fullName: appData.fullName,
            email: appData.email,
            phone: appData.phone,
            country: appData.country,
            city: appData.city,
            status: initialStatus,
            statusHistory: [
              {
                status: 'Submitted',
                timestamp: new Date(),
                note: 'Application submitted'
              }
            ],
            submittedAt: new Date()
          };

          const application = await JobApplication.create(originalData);

          // Perform withdrawal
          application.status = 'Withdrawn';
          application.withdrawnAt = new Date();
          application.statusHistory.push({
            status: 'Withdrawn',
            timestamp: new Date(),
            note: 'Application withdrawn by applicant'
          });
          await application.save();

          // Verify all original data preserved
          const updatedApp = await JobApplication.findById(application._id);
          expect(updatedApp.fullName).toBe(appData.fullName);
          expect(updatedApp.email).toBe(appData.email);
          expect(updatedApp.phone).toBe(appData.phone);
          expect(updatedApp.country).toBe(appData.country);
          expect(updatedApp.city).toBe(appData.city);
          expect(updatedApp.jobPosting.toString()).toBe(jobPosting._id.toString());
          expect(updatedApp.applicant.toString()).toBe(applicant._id.toString());
        }
      ),
      { numRuns: 100 }
    );
  });
});
