const mongoose = require('mongoose');
const User = require('../../src/models/User');
const JobPosting = require('../../src/models/JobPosting');
const JobApplication = require('../../src/models/JobApplication');
const TrainingCourse = require('../../src/models/TrainingCourse');
const EducationalCourse = require('../../src/models/EducationalCourse');
const Review = require('../../src/models/Review');
const reportsService = require('../../src/services/reportsService');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup/testDb');

describe('Reports Service Unit Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('generateUsersReport', () => {
    test('should handle empty date range', async () => {
      // Create users
      await User.create([
        {
          name: 'User 1',
          email: 'user1@test.com',
          password: 'password123',
          userType: 'jobSeeker',
          createdAt: new Date('2024-01-15')
        },
        {
          name: 'User 2',
          email: 'user2@test.com',
          password: 'password123',
          userType: 'company',
          createdAt: new Date('2024-06-15')
        }
      ]);

      // Generate report without date range
      const report = await reportsService.generateUsersReport();

      // Should include all users
      expect(report.totalUsers).toBe(2);
      expect(report.dateRange.start).toBeNull();
      expect(report.dateRange.end).toBeNull();
    });

    test('should handle future dates', async () => {
      // Create users in the past
      await User.create({
        name: 'Past User',
        email: 'past@test.com',
        password: 'password123',
        userType: 'jobSeeker',
        createdAt: new Date('2024-01-15')
      });

      // Generate report for future dates
      const futureStart = new Date();
      futureStart.setFullYear(futureStart.getFullYear() + 1);
      const futureEnd = new Date();
      futureEnd.setFullYear(futureEnd.getFullYear() + 2);

      const report = await reportsService.generateUsersReport(futureStart, futureEnd);

      // Should return zero users
      expect(report.totalUsers).toBe(0);
      expect(report.byType).toEqual({});
    });

    test('should calculate growth rate correctly with zero previous value', async () => {
      // Create users only in current period
      await User.create({
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        userType: 'jobSeeker',
        createdAt: new Date('2024-06-15')
      });

      // Generate report for June (no users in May)
      const report = await reportsService.generateUsersReport('2024-06-01', '2024-06-30');

      // Growth rate should be 0 when previous count is 0
      expect(report.growthRate).toBe(0);
    });

    test('should identify inactive users correctly', async () => {
      const now = new Date();
      const thirtyOneDaysAgo = new Date(now);
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      // Create inactive user
      await User.create({
        name: 'Inactive User',
        email: 'inactive@test.com',
        password: 'password123',
        userType: 'jobSeeker',
        lastLogin: thirtyOneDaysAgo,
        createdAt: new Date('2024-01-15')
      });

      // Create active user
      await User.create({
        name: 'Active User',
        email: 'active@test.com',
        password: 'password123',
        userType: 'jobSeeker',
        lastLogin: now,
        createdAt: new Date('2024-01-15')
      });

      const report = await reportsService.generateUsersReport();

      // Should identify inactive user
      expect(report.inactive.length).toBeGreaterThan(0);
      expect(report.inactive[0].name).toBe('Inactive User');
    });
  });

  describe('generateJobsReport', () => {
    test('should handle empty database', async () => {
      const report = await reportsService.generateJobsReport();

      expect(report.totalJobs).toBe(0);
      expect(report.byField).toEqual({});
      expect(report.applicationRate).toBe(0);
      expect(report.mostPopular).toEqual([]);
      expect(report.mostActiveCompanies).toEqual([]);
    });

    test('should calculate application rate correctly', async () => {
      const companyId = new mongoose.Types.ObjectId();

      // Create jobs
      const job1 = await JobPosting.create({
        title: 'Software Engineer',
        description: 'Job description',
        field: 'IT',
        companyId,
        createdAt: new Date('2024-06-15')
      });

      const job2 = await JobPosting.create({
        title: 'Data Analyst',
        description: 'Job description',
        field: 'IT',
        companyId,
        createdAt: new Date('2024-06-16')
      });

      // Create applications
      await JobApplication.create([
        {
          jobId: job1._id,
          applicantId: new mongoose.Types.ObjectId(),
          status: 'pending',
          createdAt: new Date('2024-06-17')
        },
        {
          jobId: job1._id,
          applicantId: new mongoose.Types.ObjectId(),
          status: 'pending',
          createdAt: new Date('2024-06-18')
        },
        {
          jobId: job2._id,
          applicantId: new mongoose.Types.ObjectId(),
          status: 'pending',
          createdAt: new Date('2024-06-19')
        }
      ]);

      const report = await reportsService.generateJobsReport('2024-06-01', '2024-06-30');

      // Application rate = 3 applications / 2 jobs = 1.5
      expect(report.applicationRate).toBe(1.5);
    });

    test('should group jobs by field correctly', async () => {
      const companyId = new mongoose.Types.ObjectId();

      await JobPosting.create([
        {
          title: 'Software Engineer',
          description: 'Job description',
          field: 'IT',
          companyId,
          createdAt: new Date('2024-06-15')
        },
        {
          title: 'Data Analyst',
          description: 'Job description',
          field: 'IT',
          companyId,
          createdAt: new Date('2024-06-16')
        },
        {
          title: 'Mechanical Engineer',
          description: 'Job description',
          field: 'Engineering',
          companyId,
          createdAt: new Date('2024-06-17')
        }
      ]);

      const report = await reportsService.generateJobsReport('2024-06-01', '2024-06-30');

      expect(report.byField.IT).toBe(2);
      expect(report.byField.Engineering).toBe(1);
    });
  });

  describe('generateCoursesReport', () => {
    test('should handle empty database', async () => {
      const report = await reportsService.generateCoursesReport();

      expect(report.totalCourses).toBe(0);
      expect(report.byField).toEqual({});
      expect(report.enrollmentRate).toBe(0);
      expect(report.completionRate).toBe(0);
      expect(report.mostPopular).toEqual([]);
    });

    test('should calculate enrollment rate correctly', async () => {
      // Create courses with enrollments
      await TrainingCourse.create({
        title: 'Python Course',
        description: 'Learn Python',
        field: 'IT',
        enrolledUsers: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
        createdAt: new Date('2024-06-15')
      });

      await EducationalCourse.create({
        title: 'Math Course',
        description: 'Learn Math',
        field: 'Education',
        enrolledUsers: [new mongoose.Types.ObjectId()],
        createdAt: new Date('2024-06-16')
      });

      const report = await reportsService.generateCoursesReport('2024-06-01', '2024-06-30');

      // Enrollment rate = 3 enrollments / 2 courses = 1.5
      expect(report.enrollmentRate).toBe(1.5);
    });

    test('should calculate completion rate correctly', async () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();
      const userId3 = new mongoose.Types.ObjectId();

      // Create course with enrollments and completions
      await TrainingCourse.create({
        title: 'Python Course',
        description: 'Learn Python',
        field: 'IT',
        enrolledUsers: [userId1, userId2, userId3],
        completedUsers: [userId1, userId2],
        createdAt: new Date('2024-06-15')
      });

      const report = await reportsService.generateCoursesReport('2024-06-01', '2024-06-30');

      // Completion rate = 2 completions / 3 enrollments = 66.67%
      expect(report.completionRate).toBeCloseTo(66.67, 1);
    });

    test('should combine training and educational courses', async () => {
      await TrainingCourse.create({
        title: 'Python Course',
        description: 'Learn Python',
        field: 'IT',
        createdAt: new Date('2024-06-15')
      });

      await EducationalCourse.create({
        title: 'Math Course',
        description: 'Learn Math',
        field: 'Education',
        createdAt: new Date('2024-06-16')
      });

      const report = await reportsService.generateCoursesReport('2024-06-01', '2024-06-30');

      expect(report.totalCourses).toBe(2);
    });
  });

  describe('generateReviewsReport', () => {
    test('should handle empty database', async () => {
      const report = await reportsService.generateReviewsReport();

      expect(report.totalReviews).toBe(0);
      expect(report.averageRating).toBe(0);
      expect(report.flaggedCount).toBe(0);
      expect(report.byRating).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    });

    test('should calculate average rating correctly', async () => {
      await Review.create([
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 5,
          title: 'Excellent',
          comment: 'Great experience',
          createdAt: new Date('2024-06-15')
        },
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 3,
          title: 'Average',
          comment: 'Okay experience',
          createdAt: new Date('2024-06-16')
        },
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 4,
          title: 'Good',
          comment: 'Good experience',
          createdAt: new Date('2024-06-17')
        }
      ]);

      const report = await reportsService.generateReviewsReport('2024-06-01', '2024-06-30');

      // Average = (5 + 3 + 4) / 3 = 4
      expect(report.averageRating).toBe(4);
    });

    test('should count flagged reviews correctly', async () => {
      await Review.create([
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 5,
          title: 'Good',
          comment: 'Good experience',
          status: 'active',
          createdAt: new Date('2024-06-15')
        },
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 1,
          title: 'Bad',
          comment: 'Bad experience',
          status: 'flagged',
          createdAt: new Date('2024-06-16')
        },
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 2,
          title: 'Poor',
          comment: 'Poor experience',
          status: 'flagged',
          createdAt: new Date('2024-06-17')
        }
      ]);

      const report = await reportsService.generateReviewsReport('2024-06-01', '2024-06-30');

      expect(report.flaggedCount).toBe(2);
    });

    test('should distribute ratings correctly', async () => {
      await Review.create([
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 5,
          title: 'Excellent',
          comment: 'Great',
          createdAt: new Date('2024-06-15')
        },
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 5,
          title: 'Excellent',
          comment: 'Great',
          createdAt: new Date('2024-06-16')
        },
        {
          reviewerId: new mongoose.Types.ObjectId(),
          reviewedUserId: new mongoose.Types.ObjectId(),
          applicationId: new mongoose.Types.ObjectId(),
          overallRating: 3,
          title: 'Average',
          comment: 'Okay',
          createdAt: new Date('2024-06-17')
        }
      ]);

      const report = await reportsService.generateReviewsReport('2024-06-01', '2024-06-30');

      expect(report.byRating[5]).toBe(2);
      expect(report.byRating[3]).toBe(1);
      expect(report.byRating[1]).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Close database connection to simulate error
      await mongoose.connection.close();

      await expect(reportsService.generateUsersReport()).rejects.toThrow();

      // Reconnect for other tests
      await connectTestDB();
    });
  });
});
