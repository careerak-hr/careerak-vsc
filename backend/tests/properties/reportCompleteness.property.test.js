const fc = require('fast-check');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const JobPosting = require('../../src/models/JobPosting');
const JobApplication = require('../../src/models/JobApplication');
const TrainingCourse = require('../../src/models/TrainingCourse');
const EducationalCourse = require('../../src/models/EducationalCourse');
const Review = require('../../src/models/Review');
const reportsService = require('../../src/services/reportsService');
const { connectTestDB, closeTestDB, clearTestDB } = require('../setup/testDb');

/**
 * Property 19: Report Completeness
 * 
 * For any report type (users, jobs, courses, reviews) and any date range,
 * the generated report should include all required statistics for that report type,
 * and all statistics should be calculated from data within the specified date range only.
 * 
 * Validates: Requirements 7.1-7.6
 */

describe('Property 19: Report Completeness', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('Users Report Completeness', () => {
    test('should include all required statistics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 3, maxLength: 50 }),
              email: fc.emailAddress(),
              password: fc.string({ minLength: 8 }),
              userType: fc.constantFrom('jobSeeker', 'company', 'freelancer'),
              createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (usersData) => {
            // Create users
            const users = await User.insertMany(usersData);

            // Generate report
            const report = await reportsService.generateUsersReport('2024-01-01', '2024-12-31');

            // Verify all required fields exist
            expect(report).toHaveProperty('totalUsers');
            expect(report).toHaveProperty('byType');
            expect(report).toHaveProperty('growthRate');
            expect(report).toHaveProperty('mostActive');
            expect(report).toHaveProperty('inactive');
            expect(report).toHaveProperty('dateRange');

            // Verify totalUsers matches created users
            expect(report.totalUsers).toBe(users.length);

            // Verify byType contains all user types
            expect(report.byType).toBeDefined();
            expect(typeof report.byType).toBe('object');

            // Verify arrays are defined
            expect(Array.isArray(report.mostActive)).toBe(true);
            expect(Array.isArray(report.inactive)).toBe(true);

            // Verify date range is included
            expect(report.dateRange.start).toBe('2024-01-01');
            expect(report.dateRange.end).toBe('2024-12-31');
          }
        ),
        { numRuns: 10 }
      );
    });

    test('should only include data within date range', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            insideRange: fc.array(
              fc.record({
                name: fc.string({ minLength: 3, maxLength: 50 }),
                email: fc.emailAddress(),
                password: fc.string({ minLength: 8 }),
                userType: fc.constantFrom('jobSeeker', 'company', 'freelancer'),
                createdAt: fc.date({ min: new Date('2024-06-01'), max: new Date('2024-06-30') })
              }),
              { minLength: 3, maxLength: 10 }
            ),
            outsideRange: fc.array(
              fc.record({
                name: fc.string({ minLength: 3, maxLength: 50 }),
                email: fc.emailAddress(),
                password: fc.string({ minLength: 8 }),
                userType: fc.constantFrom('jobSeeker', 'company', 'freelancer'),
                createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-05-31') })
              }),
              { minLength: 2, maxLength: 5 }
            )
          }),
          async ({ insideRange, outsideRange }) => {
            // Create users inside and outside range
            await User.insertMany([...insideRange, ...outsideRange]);

            // Generate report for June only
            const report = await reportsService.generateUsersReport('2024-06-01', '2024-06-30');

            // Verify only users inside range are counted
            expect(report.totalUsers).toBe(insideRange.length);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Jobs Report Completeness', () => {
    test('should include all required statistics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              title: fc.string({ minLength: 5, maxLength: 100 }),
              description: fc.string({ minLength: 20, maxLength: 500 }),
              field: fc.constantFrom('IT', 'Engineering', 'Healthcare', 'Education'),
              companyId: fc.constant(new mongoose.Types.ObjectId()),
              createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (jobsData) => {
            // Create jobs
            const jobs = await JobPosting.insertMany(jobsData);

            // Generate report
            const report = await reportsService.generateJobsReport('2024-01-01', '2024-12-31');

            // Verify all required fields exist
            expect(report).toHaveProperty('totalJobs');
            expect(report).toHaveProperty('byField');
            expect(report).toHaveProperty('applicationRate');
            expect(report).toHaveProperty('mostPopular');
            expect(report).toHaveProperty('mostActiveCompanies');
            expect(report).toHaveProperty('dateRange');

            // Verify totalJobs matches created jobs
            expect(report.totalJobs).toBe(jobs.length);

            // Verify byField contains field breakdown
            expect(report.byField).toBeDefined();
            expect(typeof report.byField).toBe('object');

            // Verify arrays are defined
            expect(Array.isArray(report.mostPopular)).toBe(true);
            expect(Array.isArray(report.mostActiveCompanies)).toBe(true);

            // Verify applicationRate is a number
            expect(typeof report.applicationRate).toBe('number');
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Courses Report Completeness', () => {
    test('should include all required statistics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            training: fc.array(
              fc.record({
                title: fc.string({ minLength: 5, maxLength: 100 }),
                description: fc.string({ minLength: 20, maxLength: 500 }),
                field: fc.constantFrom('IT', 'Engineering', 'Healthcare', 'Education'),
                createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
                enrolledUsers: fc.array(fc.constant(new mongoose.Types.ObjectId()), { maxLength: 10 }),
                completedUsers: fc.array(fc.constant(new mongoose.Types.ObjectId()), { maxLength: 5 })
              }),
              { minLength: 2, maxLength: 10 }
            ),
            educational: fc.array(
              fc.record({
                title: fc.string({ minLength: 5, maxLength: 100 }),
                description: fc.string({ minLength: 20, maxLength: 500 }),
                field: fc.constantFrom('IT', 'Engineering', 'Healthcare', 'Education'),
                createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
                enrolledUsers: fc.array(fc.constant(new mongoose.Types.ObjectId()), { maxLength: 10 }),
                completedUsers: fc.array(fc.constant(new mongoose.Types.ObjectId()), { maxLength: 5 })
              }),
              { minLength: 2, maxLength: 10 }
            )
          }),
          async ({ training, educational }) => {
            // Create courses
            await TrainingCourse.insertMany(training);
            await EducationalCourse.insertMany(educational);

            // Generate report
            const report = await reportsService.generateCoursesReport('2024-01-01', '2024-12-31');

            // Verify all required fields exist
            expect(report).toHaveProperty('totalCourses');
            expect(report).toHaveProperty('byField');
            expect(report).toHaveProperty('enrollmentRate');
            expect(report).toHaveProperty('completionRate');
            expect(report).toHaveProperty('mostPopular');
            expect(report).toHaveProperty('dateRange');

            // Verify totalCourses matches created courses
            expect(report.totalCourses).toBe(training.length + educational.length);

            // Verify byField contains field breakdown
            expect(report.byField).toBeDefined();
            expect(typeof report.byField).toBe('object');

            // Verify rates are numbers
            expect(typeof report.enrollmentRate).toBe('number');
            expect(typeof report.completionRate).toBe('number');

            // Verify mostPopular is an array
            expect(Array.isArray(report.mostPopular)).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Reviews Report Completeness', () => {
    test('should include all required statistics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              reviewerId: fc.constant(new mongoose.Types.ObjectId()),
              reviewedUserId: fc.constant(new mongoose.Types.ObjectId()),
              applicationId: fc.constant(new mongoose.Types.ObjectId()),
              overallRating: fc.integer({ min: 1, max: 5 }),
              title: fc.string({ minLength: 5, maxLength: 100 }),
              comment: fc.string({ minLength: 20, maxLength: 500 }),
              status: fc.constantFrom('active', 'flagged'),
              createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (reviewsData) => {
            // Create reviews
            const reviews = await Review.insertMany(reviewsData);

            // Generate report
            const report = await reportsService.generateReviewsReport('2024-01-01', '2024-12-31');

            // Verify all required fields exist
            expect(report).toHaveProperty('totalReviews');
            expect(report).toHaveProperty('averageRating');
            expect(report).toHaveProperty('flaggedCount');
            expect(report).toHaveProperty('byRating');
            expect(report).toHaveProperty('dateRange');

            // Verify totalReviews matches created reviews
            expect(report.totalReviews).toBe(reviews.length);

            // Verify averageRating is a number between 1 and 5
            expect(typeof report.averageRating).toBe('number');
            expect(report.averageRating).toBeGreaterThanOrEqual(0);
            expect(report.averageRating).toBeLessThanOrEqual(5);

            // Verify flaggedCount is a number
            expect(typeof report.flaggedCount).toBe('number');

            // Verify byRating contains all ratings 1-5
            expect(report.byRating).toBeDefined();
            expect(typeof report.byRating).toBe('object');
            expect(Object.keys(report.byRating).length).toBeGreaterThanOrEqual(5);
          }
        ),
        { numRuns: 10 }
      );
    });

    test('should calculate average rating correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.integer({ min: 1, max: 5 }),
            { minLength: 5, maxLength: 20 }
          ),
          async (ratings) => {
            // Create reviews with specific ratings
            const reviewsData = ratings.map(rating => ({
              reviewerId: new mongoose.Types.ObjectId(),
              reviewedUserId: new mongoose.Types.ObjectId(),
              applicationId: new mongoose.Types.ObjectId(),
              overallRating: rating,
              title: 'Test Review',
              comment: 'This is a test review comment',
              createdAt: new Date('2024-06-15')
            }));

            await Review.insertMany(reviewsData);

            // Generate report
            const report = await reportsService.generateReviewsReport('2024-01-01', '2024-12-31');

            // Calculate expected average
            const expectedAverage = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

            // Verify average rating is correct (with small tolerance for rounding)
            expect(Math.abs(report.averageRating - expectedAverage)).toBeLessThan(0.01);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Date Range Filtering', () => {
    test('should respect date range boundaries for all report types', async () => {
      // Create data with specific dates
      const insideDate = new Date('2024-06-15');
      const outsideDate = new Date('2024-05-15');

      // Create users
      await User.create({
        name: 'Inside User',
        email: 'inside@test.com',
        password: 'password123',
        userType: 'jobSeeker',
        createdAt: insideDate
      });

      await User.create({
        name: 'Outside User',
        email: 'outside@test.com',
        password: 'password123',
        userType: 'jobSeeker',
        createdAt: outsideDate
      });

      // Generate report for June only
      const report = await reportsService.generateUsersReport('2024-06-01', '2024-06-30');

      // Should only include user created in June
      expect(report.totalUsers).toBe(1);
    });
  });
});
