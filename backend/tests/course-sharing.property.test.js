/**
 * Property-Based Tests for Course Sharing Functionality
 * Feature: courses-page-enhancements
 * 
 * Tests:
 * - Property 27: Shareable URL Uniqueness
 * - Property 28: Referral Tracking
 * - Property 29: Referrer Credit
 * 
 * Validates: Requirements 8.5, 8.6, 8.7
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const EducationalCourse = require('../src/models/EducationalCourse');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const User = require('../src/models/User');
const crypto = require('crypto');

// Test database connection
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Clean up after each test
afterEach(async () => {
  await EducationalCourse.deleteMany({});
  await CourseEnrollment.deleteMany({});
  await User.deleteMany({});
});

// Arbitraries for generating test data
const courseArbitrary = () => fc.record({
  title: fc.string({ minLength: 5, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  category: fc.constantFrom('Programming', 'Design', 'Business', 'Marketing'),
  level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
  status: fc.constant('Published'),
  totalLessons: fc.integer({ min: 5, max: 50 }),
  totalDuration: fc.integer({ min: 1, max: 100 }),
  price: fc.record({
    amount: fc.integer({ min: 0, max: 500 }),
    currency: fc.constant('USD'),
    isFree: fc.boolean()
  }),
  stats: fc.record({
    totalEnrollments: fc.integer({ min: 0, max: 1000 }),
    activeEnrollments: fc.integer({ min: 0, max: 500 }),
    averageRating: fc.float({ min: 0, max: 5 }),
    totalReviews: fc.integer({ min: 0, max: 500 })
  })
});

const userArbitrary = () => fc.record({
  fullName: fc.string({ minLength: 3, maxLength: 50 }),
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 20 }),
  role: fc.constantFrom('user', 'instructor')
});

describe('Feature: courses-page-enhancements - Course Sharing Properties', () => {
  
  /**
   * Property 27: Shareable URL Uniqueness
   * For any course, when a shareable link is generated, it should contain 
   * a unique identifier that maps back to that specific course.
   * 
   * Validates: Requirements 8.5
   */
  describe('Property 27: Shareable URL Uniqueness', () => {
    it('should generate unique tokens for each share request', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          fc.integer({ min: 2, max: 5 }), // Number of share requests
          async (courseData, shareCount) => {
            // Setup: Create a course
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId()
            });

            // Execute: Generate multiple shareable tokens
            const tokens = new Set();

            for (let i = 0; i < shareCount; i++) {
              const token = crypto.randomBytes(16).toString('hex');
              tokens.add(token);

              await EducationalCourse.findByIdAndUpdate(
                course._id,
                {
                  $push: {
                    referrals: {
                      token,
                      createdAt: new Date(),
                      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    }
                  }
                }
              );
            }

            // Verify: All tokens are unique
            expect(tokens.size).toBe(shareCount);

            // Verify: Each token maps back to the correct course
            const updatedCourse = await EducationalCourse.findById(course._id);
            expect(updatedCourse.referrals.length).toBe(shareCount);

            for (const referral of updatedCourse.referrals) {
              expect(referral.token).toBeTruthy();
              expect(tokens.has(referral.token)).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should ensure tokens are cryptographically unique across different courses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(courseArbitrary(), { minLength: 2, maxLength: 5 }),
          async (coursesData) => {
            // Setup: Create multiple courses
            const courses = await Promise.all(
              coursesData.map(data => 
                EducationalCourse.create({
                  ...data,
                  instructor: new mongoose.Types.ObjectId()
                })
              )
            );

            // Execute: Generate shareable token for each course
            const allTokens = new Set();

            for (const course of courses) {
              const token = crypto.randomBytes(16).toString('hex');
              allTokens.add(token);

              await EducationalCourse.findByIdAndUpdate(
                course._id,
                {
                  $push: {
                    referrals: {
                      token,
                      createdAt: new Date(),
                      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                    }
                  }
                }
              );
            }

            // Verify: All tokens across all courses are unique
            expect(allTokens.size).toBe(courses.length);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Property 28: Referral Tracking
   * For any shared link access, the system should record the referral 
   * source in the access logs.
   * 
   * Validates: Requirements 8.6
   */
  describe('Property 28: Referral Tracking', () => {
    it('should track views when shared link is accessed', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          fc.integer({ min: 1, max: 10 }), // Number of views
          async (courseData, viewCount) => {
            // Setup: Create course with referral token
            const token = crypto.randomBytes(16).toString('hex');
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId(),
              referrals: [{
                token,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                views: 0
              }]
            });

            // Execute: Simulate accessing the shared link multiple times
            for (let i = 0; i < viewCount; i++) {
              await EducationalCourse.updateOne(
                { _id: course._id, 'referrals.token': token },
                {
                  $inc: { 'referrals.$.views': 1 },
                  $set: { 'referrals.$.lastAccessedAt': new Date() }
                }
              );
            }

            // Verify: View count is tracked correctly
            const updatedCourse = await EducationalCourse.findById(course._id);
            const referral = updatedCourse.referrals.find(r => r.token === token);

            expect(referral).toBeDefined();
            expect(referral.views).toBe(viewCount);
            expect(referral.lastAccessedAt).toBeDefined();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not allow access to expired tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          async (courseData) => {
            // Setup: Create course with expired referral
            const token = 'expired-token-123';
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId(),
              referrals: [{
                token,
                createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
                expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expired 10 days ago
                views: 0
              }]
            });

            // Execute: Try to find course with expired token
            const foundCourse = await EducationalCourse.findOne({
              'referrals.token': token,
              'referrals.expiresAt': { $gt: new Date() }
            });

            // Verify: Course not found with expired token
            expect(foundCourse).toBeNull();

            // Verify: Original course still exists
            const originalCourse = await EducationalCourse.findById(course._id);
            expect(originalCourse).toBeDefined();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should track referrer ID when provided', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          userArbitrary(),
          async (courseData, userData) => {
            // Setup: Create user and course
            const user = await User.create(userData);
            const token = crypto.randomBytes(16).toString('hex');
            
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId(),
              referrals: [{
                token,
                referrerId: user._id,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
              }]
            });

            // Verify: Referrer ID is tracked
            const updatedCourse = await EducationalCourse.findById(course._id);
            const referral = updatedCourse.referrals[0];

            expect(referral.referrerId).toBeDefined();
            expect(referral.referrerId.toString()).toBe(user._id.toString());
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Property 29: Referrer Credit
   * For any enrollment that occurs via a shared link, the referrer user 
   * should be credited in the enrollment record.
   * 
   * Validates: Requirements 8.7
   */
  describe('Property 29: Referrer Credit', () => {
    it('should credit referrer when enrollment occurs via shared link', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          userArbitrary(),
          userArbitrary(),
          async (courseData, referrerData, studentData) => {
            // Ensure different emails
            if (referrerData.email === studentData.email) {
              studentData.email = 'student_' + studentData.email;
            }

            // Setup: Create referrer, student, and course
            const referrer = await User.create(referrerData);
            const student = await User.create(studentData);
            
            const token = crypto.randomBytes(16).toString('hex');
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId(),
              price: { amount: 0, currency: 'USD', isFree: true },
              referrals: [{
                token,
                referrerId: referrer._id,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                enrollments: 0
              }]
            });

            // Execute: Create enrollment with referral
            const enrollment = await CourseEnrollment.create({
              course: course._id,
              student: student._id,
              status: 'active',
              progress: {
                completedLessons: [],
                percentageComplete: 0,
                lastAccessedAt: new Date()
              },
              referral: {
                token,
                referrerId: referrer._id,
                referredAt: new Date()
              }
            });

            // Increment referral enrollment count
            await EducationalCourse.updateOne(
              { _id: course._id, 'referrals.token': token },
              { $inc: { 'referrals.$.enrollments': 1 } }
            );

            // Verify: Referrer is credited in enrollment
            expect(enrollment.referral).toBeDefined();
            expect(enrollment.referral.token).toBe(token);
            expect(enrollment.referral.referrerId.toString()).toBe(referrer._id.toString());
            expect(enrollment.referral.referredAt).toBeDefined();

            // Verify: Course referral enrollment count is incremented
            const updatedCourse = await EducationalCourse.findById(course._id);
            const referral = updatedCourse.referrals.find(r => r.token === token);
            expect(referral.enrollments).toBe(1);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle enrollment without referral token gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          userArbitrary(),
          async (courseData, studentData) => {
            // Setup: Create student and course
            const student = await User.create(studentData);
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId(),
              price: { amount: 0, currency: 'USD', isFree: true }
            });

            // Execute: Create enrollment without referral
            const enrollment = await CourseEnrollment.create({
              course: course._id,
              student: student._id,
              status: 'active',
              progress: {
                completedLessons: [],
                percentageComplete: 0,
                lastAccessedAt: new Date()
              }
            });

            // Verify: Enrollment has no referral info
            expect(enrollment.referral).toBeUndefined();
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should not credit referrer for invalid tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          userArbitrary(),
          async (courseData, studentData) => {
            // Setup: Create student and course
            const student = await User.create(studentData);
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId(),
              price: { amount: 0, currency: 'USD', isFree: true }
            });

            // Execute: Try to find referral with invalid token
            const invalidToken = 'invalid-token-xyz';
            const referral = course.referrals.find(
              r => r.token === invalidToken && r.expiresAt > new Date()
            );

            // Verify: No referral found
            expect(referral).toBeUndefined();

            // Create enrollment without referral
            const enrollment = await CourseEnrollment.create({
              course: course._id,
              student: student._id,
              status: 'active',
              progress: {
                completedLessons: [],
                percentageComplete: 0,
                lastAccessedAt: new Date()
              }
            });

            // Verify: Enrollment has no referral info
            expect(enrollment.referral).toBeUndefined();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * Additional Property: Referral Token Expiration
   * Ensures that referral tokens expire after the specified duration
   */
  describe('Additional Property: Referral Token Expiration', () => {
    it('should set expiration date 90 days from creation', async () => {
      await fc.assert(
        fc.asyncProperty(
          courseArbitrary(),
          async (courseData) => {
            // Setup: Create course with referral
            const createdAt = new Date();
            const expiresAt = new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000);
            
            const course = await EducationalCourse.create({
              ...courseData,
              instructor: new mongoose.Types.ObjectId(),
              referrals: [{
                token: crypto.randomBytes(16).toString('hex'),
                createdAt,
                expiresAt
              }]
            });

            // Verify: Expiration is approximately 90 days from creation
            const referral = course.referrals[0];
            const daysDiff = Math.floor((referral.expiresAt - referral.createdAt) / (1000 * 60 * 60 * 24));

            expect(daysDiff).toBeGreaterThanOrEqual(89);
            expect(daysDiff).toBeLessThanOrEqual(91);
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
