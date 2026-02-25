const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const Review = require('../src/models/Review');
const User = require('../src/models/User');
const contentManagementService = require('../src/services/contentManagementService');
const { createActivityLog } = require('../src/services/activityLogService');
const { createAdminNotification } = require('../src/services/adminNotificationService');

// Mock services
jest.mock('../src/services/activityLogService');
jest.mock('../src/services/adminNotificationService');

describe('Content Management Property Tests', () => {
  let testUsers = [];
  let testJobs = [];
  let testCourses = [];
  let testReviews = [];
  
  beforeEach(async () => {
    // Skip if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      console.warn('Skipping test: MongoDB not connected');
      return;
    }
    
    // Clear collections
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await EducationalCourse.deleteMany({});
    await Review.deleteMany({});
    
    // Create test users
    testUsers = await User.create([
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        userType: 'admin'
      },
      {
        name: 'Company User',
        email: 'company@test.com',
        password: 'password123',
        userType: 'company'
      },
      {
        name: 'Job Seeker',
        email: 'seeker@test.com',
        password: 'password123',
        userType: 'job_seeker'
      }
    ]);
    
    // Reset mocks
    createActivityLog.mockClear();
    createAdminNotification.mockClear();
  });
  
  /**
   * Property 25: Content Moderation Actions
   * For any content moderation action (approve, reject, delete), the system should
   * update the content status appropriately, create an activity log entry, and send
   * a notification to the content creator (except for deletions which only log).
   */
  describe('Property 25: Content Moderation Actions', () => {
    test('approve action updates status, logs activity, and notifies creator', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('job', 'course', 'review'),
          async (contentType) => {
            // Create test content
            let content;
            let expectedStatus;
            
            if (contentType === 'job') {
              content = await JobPosting.create({
                title: 'Test Job',
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id,
                status: 'Closed'
              });
              expectedStatus = 'Open';
            } else if (contentType === 'course') {
              content = await EducationalCourse.create({
                title: 'Test Course',
                description: 'Test Description',
                category: 'Test Category',
                instructor: testUsers[1]._id,
                status: 'Draft'
              });
              expectedStatus = 'Published';
            } else {
              // Create job and application first for review
              const job = await JobPosting.create({
                title: 'Test Job',
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id
              });
              
              const JobApplication = require('../src/models/JobApplication');
              const application = await JobApplication.create({
                jobPosting: job._id,
                applicant: testUsers[2]._id,
                status: 'hired'
              });
              
              content = await Review.create({
                reviewType: 'employee_to_company',
                reviewer: testUsers[2]._id,
                reviewee: testUsers[1]._id,
                jobPosting: job._id,
                jobApplication: application._id,
                rating: 4,
                comment: 'Test review',
                status: 'flagged'
              });
              expectedStatus = 'approved';
            }
            
            // Approve content
            const approved = await contentManagementService.approveContent(
              contentType,
              content._id.toString(),
              testUsers[0]._id.toString()
            );
            
            // Verify status updated
            expect(approved.status).toBe(expectedStatus);
            
            // Verify activity log created
            expect(createActivityLog).toHaveBeenCalledWith(
              expect.objectContaining({
                actorId: testUsers[0]._id.toString(),
                actionType: 'content_approved',
                targetType: contentType,
                targetId: content._id.toString()
              })
            );
            
            // Verify notification sent
            expect(createAdminNotification).toHaveBeenCalled();
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
    
    test('reject action updates status, logs activity, and notifies with reason', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('job', 'course', 'review'),
          fc.string({ minLength: 10, maxLength: 100 }),
          async (contentType, reason) => {
            // Create test content
            let content;
            
            if (contentType === 'job') {
              content = await JobPosting.create({
                title: 'Test Job',
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id,
                status: 'Closed'
              });
            } else if (contentType === 'course') {
              content = await EducationalCourse.create({
                title: 'Test Course',
                description: 'Test Description',
                category: 'Test Category',
                instructor: testUsers[1]._id,
                status: 'Draft'
              });
            } else {
              const job = await JobPosting.create({
                title: 'Test Job',
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id
              });
              
              const JobApplication = require('../src/models/JobApplication');
              const application = await JobApplication.create({
                jobPosting: job._id,
                applicant: testUsers[2]._id,
                status: 'hired'
              });
              
              content = await Review.create({
                reviewType: 'employee_to_company',
                reviewer: testUsers[2]._id,
                reviewee: testUsers[1]._id,
                jobPosting: job._id,
                jobApplication: application._id,
                rating: 4,
                comment: 'Test review',
                status: 'flagged'
              });
            }
            
            // Reject content
            const rejected = await contentManagementService.rejectContent(
              contentType,
              content._id.toString(),
              testUsers[0]._id.toString(),
              reason
            );
            
            // Verify status updated (different for each type)
            if (contentType === 'job') {
              expect(rejected.status).toBe('Closed');
            } else if (contentType === 'course') {
              expect(rejected.status).toBe('Archived');
            } else {
              expect(rejected.status).toBe('rejected');
              expect(rejected.moderationNote).toBe(reason);
            }
            
            // Verify activity log created with reason
            expect(createActivityLog).toHaveBeenCalledWith(
              expect.objectContaining({
                actorId: testUsers[0]._id.toString(),
                actionType: 'content_rejected',
                targetType: contentType,
                targetId: content._id.toString(),
                details: expect.stringContaining(reason)
              })
            );
            
            // Verify notification sent with reason
            expect(createAdminNotification).toHaveBeenCalledWith(
              expect.objectContaining({
                message: expect.stringContaining(reason)
              })
            );
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
    
    test('delete action removes content and logs activity (no notification)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('job', 'course', 'review'),
          async (contentType) => {
            // Create test content
            let content;
            
            if (contentType === 'job') {
              content = await JobPosting.create({
                title: 'Test Job',
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id
              });
            } else if (contentType === 'course') {
              content = await EducationalCourse.create({
                title: 'Test Course',
                description: 'Test Description',
                category: 'Test Category',
                instructor: testUsers[1]._id
              });
            } else {
              const job = await JobPosting.create({
                title: 'Test Job',
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id
              });
              
              const JobApplication = require('../src/models/JobApplication');
              const application = await JobApplication.create({
                jobPosting: job._id,
                applicant: testUsers[2]._id,
                status: 'hired'
              });
              
              content = await Review.create({
                reviewType: 'employee_to_company',
                reviewer: testUsers[2]._id,
                reviewee: testUsers[1]._id,
                jobPosting: job._id,
                jobApplication: application._id,
                rating: 4,
                comment: 'Test review'
              });
            }
            
            const contentId = content._id.toString();
            
            // Delete content
            const result = await contentManagementService.deleteContent(
              contentType,
              contentId,
              testUsers[0]._id.toString()
            );
            
            // Verify deletion successful
            expect(result.success).toBe(true);
            
            // Verify content no longer exists
            let Model;
            if (contentType === 'job') Model = JobPosting;
            else if (contentType === 'course') Model = EducationalCourse;
            else Model = Review;
            
            const deletedContent = await Model.findById(contentId);
            expect(deletedContent).toBeNull();
            
            // Verify activity log created
            expect(createActivityLog).toHaveBeenCalledWith(
              expect.objectContaining({
                actorId: testUsers[0]._id.toString(),
                actionType: 'content_deleted',
                targetType: contentType,
                targetId: contentId
              })
            );
            
            // Verify NO notification sent for deletion
            expect(createAdminNotification).not.toHaveBeenCalled();
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
  
  /**
   * Property 26: Content Filtering by Status
   * For any content status filter (pending, flagged), the displayed content list
   * should include only items with that status, and the list should update
   * immediately when content status changes.
   */
  describe('Property 26: Content Filtering by Status', () => {
    test('getPendingJobs returns only jobs with Closed status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          async (pendingCount, openCount) => {
            // Create pending jobs (Closed status)
            const pendingJobs = [];
            for (let i = 0; i < pendingCount; i++) {
              pendingJobs.push({
                title: `Pending Job ${i}`,
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id,
                status: 'Closed'
              });
            }
            await JobPosting.create(pendingJobs);
            
            // Create open jobs
            const openJobs = [];
            for (let i = 0; i < openCount; i++) {
              openJobs.push({
                title: `Open Job ${i}`,
                description: 'Test Description',
                requirements: 'Test Requirements',
                location: 'Test Location',
                postedBy: testUsers[1]._id,
                status: 'Open'
              });
            }
            await JobPosting.create(openJobs);
            
            // Get pending jobs
            const result = await contentManagementService.getPendingJobs();
            
            // Verify only pending jobs returned
            expect(result.jobs.length).toBe(pendingCount);
            expect(result.jobs.every(job => job.status === 'Closed')).toBe(true);
            expect(result.pagination.total).toBe(pendingCount);
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
    
    test('getPendingCourses returns only courses with Draft status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          async (draftCount, publishedCount) => {
            // Create draft courses
            const draftCourses = [];
            for (let i = 0; i < draftCount; i++) {
              draftCourses.push({
                title: `Draft Course ${i}`,
                description: 'Test Description',
                category: 'Test Category',
                instructor: testUsers[1]._id,
                status: 'Draft'
              });
            }
            await EducationalCourse.create(draftCourses);
            
            // Create published courses
            const publishedCourses = [];
            for (let i = 0; i < publishedCount; i++) {
              publishedCourses.push({
                title: `Published Course ${i}`,
                description: 'Test Description',
                category: 'Test Category',
                instructor: testUsers[1]._id,
                status: 'Published'
              });
            }
            await EducationalCourse.create(publishedCourses);
            
            // Get pending courses
            const result = await contentManagementService.getPendingCourses();
            
            // Verify only draft courses returned
            expect(result.courses.length).toBe(draftCount);
            expect(result.courses.every(course => course.status === 'Draft')).toBe(true);
            expect(result.pagination.total).toBe(draftCount);
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
    
    test('getFlaggedContent returns only reviews with flagged status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          async (flaggedCount, approvedCount) => {
            // Create job and application for reviews
            const job = await JobPosting.create({
              title: 'Test Job',
              description: 'Test Description',
              requirements: 'Test Requirements',
              location: 'Test Location',
              postedBy: testUsers[1]._id
            });
            
            const JobApplication = require('../src/models/JobApplication');
            const application = await JobApplication.create({
              jobPosting: job._id,
              applicant: testUsers[2]._id,
              status: 'hired'
            });
            
            // Create flagged reviews
            const flaggedReviews = [];
            for (let i = 0; i < flaggedCount; i++) {
              flaggedReviews.push({
                reviewType: 'employee_to_company',
                reviewer: testUsers[2]._id,
                reviewee: testUsers[1]._id,
                jobPosting: job._id,
                jobApplication: application._id,
                rating: 4,
                comment: `Flagged review ${i}`,
                status: 'flagged'
              });
            }
            await Review.create(flaggedReviews);
            
            // Create approved reviews
            const approvedReviews = [];
            for (let i = 0; i < approvedCount; i++) {
              approvedReviews.push({
                reviewType: 'employee_to_company',
                reviewer: testUsers[2]._id,
                reviewee: testUsers[1]._id,
                jobPosting: job._id,
                jobApplication: application._id,
                rating: 4,
                comment: `Approved review ${i}`,
                status: 'approved'
              });
            }
            await Review.create(approvedReviews);
            
            // Get flagged content
            const result = await contentManagementService.getFlaggedContent();
            
            // Verify only flagged reviews returned
            expect(result.reviews.length).toBe(flaggedCount);
            expect(result.reviews.every(review => review.status === 'flagged')).toBe(true);
            expect(result.pagination.total).toBe(flaggedCount);
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
