const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const EducationalCourse = require('../src/models/EducationalCourse');
const Review = require('../src/models/Review');
const User = require('../src/models/User');
const JobApplication = require('../src/models/JobApplication');
const contentManagementService = require('../src/services/contentManagementService');
const { createActivityLog } = require('../src/services/activityLogService');
const { createAdminNotification } = require('../src/services/adminNotificationService');

// Mock services
jest.mock('../src/services/activityLogService');
jest.mock('../src/services/adminNotificationService');

describe('Content Management Service Unit Tests', () => {
  let testUsers = [];
  let adminUser, companyUser, jobSeekerUser;
  
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
    await JobApplication.deleteMany({});
    
    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      userType: 'admin'
    });
    
    companyUser = await User.create({
      name: 'Company User',
      email: 'company@test.com',
      password: 'password123',
      userType: 'company'
    });
    
    jobSeekerUser = await User.create({
      name: 'Job Seeker',
      email: 'seeker@test.com',
      password: 'password123',
      userType: 'job_seeker'
    });
    
    testUsers = [adminUser, companyUser, jobSeekerUser];
    
    // Reset mocks
    createActivityLog.mockClear();
    createAdminNotification.mockClear();
  });
  
  describe('approveContent', () => {
    test('should approve job and send notification to creator', async () => {
      // Create pending job
      const job = await JobPosting.create({
        title: 'Software Engineer',
        description: 'Great opportunity',
        requirements: 'Bachelor degree',
        location: 'Remote',
        postedBy: companyUser._id,
        status: 'Closed'
      });
      
      // Approve job
      const approved = await contentManagementService.approveContent(
        'job',
        job._id.toString(),
        adminUser._id.toString()
      );
      
      // Verify status changed
      expect(approved.status).toBe('Open');
      
      // Verify activity log created
      expect(createActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: adminUser._id.toString(),
          actionType: 'content_approved',
          targetType: 'job',
          targetId: job._id.toString()
        })
      );
      
      // Verify notification sent
      expect(createAdminNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: companyUser._id,
          type: 'content_approved',
          priority: 'medium',
          message: expect.stringContaining('approved')
        })
      );
    });
    
    test('should approve course and send notification to instructor', async () => {
      // Create pending course
      const course = await EducationalCourse.create({
        title: 'Web Development',
        description: 'Learn web development',
        category: 'Programming',
        instructor: companyUser._id,
        status: 'Draft'
      });
      
      // Approve course
      const approved = await contentManagementService.approveContent(
        'course',
        course._id.toString(),
        adminUser._id.toString()
      );
      
      // Verify status changed
      expect(approved.status).toBe('Published');
      
      // Verify notification sent to instructor
      expect(createAdminNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: companyUser._id,
          type: 'content_approved'
        })
      );
    });
    
    test('should approve review and send notification to reviewer', async () => {
      // Create job and application
      const job = await JobPosting.create({
        title: 'Test Job',
        description: 'Test Description',
        requirements: 'Test Requirements',
        location: 'Test Location',
        postedBy: companyUser._id
      });
      
      const application = await JobApplication.create({
        jobPosting: job._id,
        applicant: jobSeekerUser._id,
        status: 'hired'
      });
      
      // Create flagged review
      const review = await Review.create({
        reviewType: 'employee_to_company',
        reviewer: jobSeekerUser._id,
        reviewee: companyUser._id,
        jobPosting: job._id,
        jobApplication: application._id,
        rating: 4,
        comment: 'Good company to work with',
        status: 'flagged'
      });
      
      // Approve review
      const approved = await contentManagementService.approveContent(
        'review',
        review._id.toString(),
        adminUser._id.toString()
      );
      
      // Verify status changed
      expect(approved.status).toBe('approved');
      expect(approved.moderationNote).toBe('Approved by admin');
      
      // Verify notification sent to reviewer
      expect(createAdminNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: jobSeekerUser._id,
          type: 'content_approved'
        })
      );
    });
  });
  
  describe('rejectContent', () => {
    test('should reject job with reason and notify creator', async () => {
      // Create job
      const job = await JobPosting.create({
        title: 'Software Engineer',
        description: 'Great opportunity',
        requirements: 'Bachelor degree',
        location: 'Remote',
        postedBy: companyUser._id,
        status: 'Closed'
      });
      
      const reason = 'Job description is incomplete and does not meet our quality standards';
      
      // Reject job
      const rejected = await contentManagementService.rejectContent(
        'job',
        job._id.toString(),
        adminUser._id.toString(),
        reason
      );
      
      // Verify status changed
      expect(rejected.status).toBe('Closed');
      
      // Verify activity log includes reason
      expect(createActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'content_rejected',
          details: expect.stringContaining(reason)
        })
      );
      
      // Verify notification includes reason
      expect(createAdminNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: companyUser._id,
          type: 'content_rejected',
          priority: 'high',
          message: expect.stringContaining(reason)
        })
      );
    });
    
    test('should reject course with reason and notify instructor', async () => {
      // Create course
      const course = await EducationalCourse.create({
        title: 'Web Development',
        description: 'Learn web development',
        category: 'Programming',
        instructor: companyUser._id,
        status: 'Draft'
      });
      
      const reason = 'Course content is not comprehensive enough';
      
      // Reject course
      const rejected = await contentManagementService.rejectContent(
        'course',
        course._id.toString(),
        adminUser._id.toString(),
        reason
      );
      
      // Verify status changed
      expect(rejected.status).toBe('Archived');
      
      // Verify notification includes reason
      expect(createAdminNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(reason)
        })
      );
    });
    
    test('should reject review with reason stored in moderationNote', async () => {
      // Create job and application
      const job = await JobPosting.create({
        title: 'Test Job',
        description: 'Test Description',
        requirements: 'Test Requirements',
        location: 'Test Location',
        postedBy: companyUser._id
      });
      
      const application = await JobApplication.create({
        jobPosting: job._id,
        applicant: jobSeekerUser._id,
        status: 'hired'
      });
      
      // Create review
      const review = await Review.create({
        reviewType: 'employee_to_company',
        reviewer: jobSeekerUser._id,
        reviewee: companyUser._id,
        jobPosting: job._id,
        jobApplication: application._id,
        rating: 4,
        comment: 'Inappropriate content',
        status: 'flagged'
      });
      
      const reason = 'Review contains inappropriate language';
      
      // Reject review
      const rejected = await contentManagementService.rejectContent(
        'review',
        review._id.toString(),
        adminUser._id.toString(),
        reason
      );
      
      // Verify status and moderation note
      expect(rejected.status).toBe('rejected');
      expect(rejected.moderationNote).toBe(reason);
    });
    
    test('should throw error if rejection reason is empty', async () => {
      // Create job
      const job = await JobPosting.create({
        title: 'Software Engineer',
        description: 'Great opportunity',
        requirements: 'Bachelor degree',
        location: 'Remote',
        postedBy: companyUser._id
      });
      
      // Try to reject without reason
      await expect(
        contentManagementService.rejectContent(
          'job',
          job._id.toString(),
          adminUser._id.toString(),
          ''
        )
      ).rejects.toThrow('Rejection reason is required');
    });
  });
  
  describe('deleteContent', () => {
    test('should delete job and create activity log (no notification)', async () => {
      // Create job
      const job = await JobPosting.create({
        title: 'Software Engineer',
        description: 'Great opportunity',
        requirements: 'Bachelor degree',
        location: 'Remote',
        postedBy: companyUser._id
      });
      
      const jobId = job._id.toString();
      
      // Delete job
      const result = await contentManagementService.deleteContent(
        'job',
        jobId,
        adminUser._id.toString()
      );
      
      // Verify deletion successful
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
      
      // Verify job no longer exists
      const deletedJob = await JobPosting.findById(jobId);
      expect(deletedJob).toBeNull();
      
      // Verify activity log created
      expect(createActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: adminUser._id.toString(),
          actionType: 'content_deleted',
          targetType: 'job',
          targetId: jobId
        })
      );
      
      // Verify NO notification sent
      expect(createAdminNotification).not.toHaveBeenCalled();
    });
    
    test('should delete course and create activity log', async () => {
      // Create course
      const course = await EducationalCourse.create({
        title: 'Web Development',
        description: 'Learn web development',
        category: 'Programming',
        instructor: companyUser._id
      });
      
      const courseId = course._id.toString();
      
      // Delete course
      const result = await contentManagementService.deleteContent(
        'course',
        courseId,
        adminUser._id.toString()
      );
      
      // Verify deletion successful
      expect(result.success).toBe(true);
      
      // Verify course no longer exists
      const deletedCourse = await EducationalCourse.findById(courseId);
      expect(deletedCourse).toBeNull();
      
      // Verify activity log created
      expect(createActivityLog).toHaveBeenCalled();
      
      // Verify NO notification sent
      expect(createAdminNotification).not.toHaveBeenCalled();
    });
    
    test('should delete review and create activity log', async () => {
      // Create job and application
      const job = await JobPosting.create({
        title: 'Test Job',
        description: 'Test Description',
        requirements: 'Test Requirements',
        location: 'Test Location',
        postedBy: companyUser._id
      });
      
      const application = await JobApplication.create({
        jobPosting: job._id,
        applicant: jobSeekerUser._id,
        status: 'hired'
      });
      
      // Create review
      const review = await Review.create({
        reviewType: 'employee_to_company',
        reviewer: jobSeekerUser._id,
        reviewee: companyUser._id,
        jobPosting: job._id,
        jobApplication: application._id,
        rating: 4,
        comment: 'Test review'
      });
      
      const reviewId = review._id.toString();
      
      // Delete review
      const result = await contentManagementService.deleteContent(
        'review',
        reviewId,
        adminUser._id.toString()
      );
      
      // Verify deletion successful
      expect(result.success).toBe(true);
      
      // Verify review no longer exists
      const deletedReview = await Review.findById(reviewId);
      expect(deletedReview).toBeNull();
      
      // Verify activity log created
      expect(createActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'content_deleted',
          targetType: 'review'
        })
      );
    });
  });
  
  describe('Filtering and Pagination', () => {
    test('should filter pending jobs by posting type', async () => {
      // Create jobs with different types
      await JobPosting.create([
        {
          title: 'Permanent Job 1',
          description: 'Test',
          requirements: 'Test',
          location: 'Remote',
          postedBy: companyUser._id,
          postingType: 'Permanent Job',
          status: 'Closed'
        },
        {
          title: 'Temporary Job 1',
          description: 'Test',
          requirements: 'Test',
          location: 'Remote',
          postedBy: companyUser._id,
          postingType: 'Temporary/Lecturer',
          status: 'Closed'
        },
        {
          title: 'Permanent Job 2',
          description: 'Test',
          requirements: 'Test',
          location: 'Remote',
          postedBy: companyUser._id,
          postingType: 'Permanent Job',
          status: 'Closed'
        }
      ]);
      
      // Filter by Permanent Job
      const result = await contentManagementService.getPendingJobs({
        postingType: 'Permanent Job'
      });
      
      // Verify only Permanent Jobs returned
      expect(result.jobs.length).toBe(2);
      expect(result.jobs.every(job => job.postingType === 'Permanent Job')).toBe(true);
    });
    
    test('should filter pending courses by level', async () => {
      // Create courses with different levels
      await EducationalCourse.create([
        {
          title: 'Beginner Course 1',
          description: 'Test',
          category: 'Programming',
          instructor: companyUser._id,
          level: 'Beginner',
          status: 'Draft'
        },
        {
          title: 'Advanced Course 1',
          description: 'Test',
          category: 'Programming',
          instructor: companyUser._id,
          level: 'Advanced',
          status: 'Draft'
        },
        {
          title: 'Beginner Course 2',
          description: 'Test',
          category: 'Programming',
          instructor: companyUser._id,
          level: 'Beginner',
          status: 'Draft'
        }
      ]);
      
      // Filter by Beginner level
      const result = await contentManagementService.getPendingCourses({
        level: 'Beginner'
      });
      
      // Verify only Beginner courses returned
      expect(result.courses.length).toBe(2);
      expect(result.courses.every(course => course.level === 'Beginner')).toBe(true);
    });
    
    test('should paginate results correctly', async () => {
      // Create 25 pending jobs
      const jobs = [];
      for (let i = 0; i < 25; i++) {
        jobs.push({
          title: `Job ${i}`,
          description: 'Test',
          requirements: 'Test',
          location: 'Remote',
          postedBy: companyUser._id,
          status: 'Closed'
        });
      }
      await JobPosting.create(jobs);
      
      // Get first page (20 items)
      const page1 = await contentManagementService.getPendingJobs({}, 1, 20);
      expect(page1.jobs.length).toBe(20);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.pages).toBe(2);
      expect(page1.pagination.total).toBe(25);
      
      // Get second page (5 items)
      const page2 = await contentManagementService.getPendingJobs({}, 2, 20);
      expect(page2.jobs.length).toBe(5);
      expect(page2.pagination.page).toBe(2);
    });
  });
});
