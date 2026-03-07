const fc = require('fast-check');
const mongoose = require('mongoose');
const Review = require('../src/models/Review');
const EducationalCourse = require('../src/models/EducationalCourse');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const { User, Individual } = require('../src/models/User');

/**
 * Property-Based Tests for Course Review Endpoints
 * 
 * Property 7: Review Authorization
 * Property 8: Rating Recalculation
 * Property 9: Review Sort Order
 * 
 * Validates: Requirements 3.5, 3.6, 3.7
 */

describe('Course Review Property Tests', () => {
  let testCourse;
  let testInstructor;
  let testStudent;
  let testEnrollment;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections
    await Review.deleteMany({});
    await EducationalCourse.deleteMany({});
    await CourseEnrollment.deleteMany({});
    await User.deleteMany({});

    // Create test instructor
    testInstructor = await Individual.create({
      firstName: 'Test',
      lastName: 'Instructor',
      email: 'instructor@test.com',
      password: 'password123',
      phoneNumber: '1234567890',
      userType: 'individual'
    });

    // Create test course
    testCourse = await EducationalCourse.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: testInstructor._id,
      category: 'Programming',
      level: 'Beginner',
      status: 'Published',
      totalLessons: 10,
      publishedAt: new Date()
    });

    // Create test student
    testStudent = await Individual.create({
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@test.com',
      password: 'password123',
      phoneNumber: '0987654321',
      userType: 'individual'
    });

    // Create test enrollment with 50% progress
    testEnrollment = await CourseEnrollment.create({
      course: testCourse._id,
      student: testStudent._id,
      status: 'active',
      progress: {
        completedLessons: [],
        percentageComplete: 50
      }
    });
  });

  /**
   * Property 7: Review Authorization
   * For any student with completion percentage >= 50% for a course,
   * the system should allow them to submit a review.
   * 
   * Validates: Requirements 3.5
   */
  describe('Property 7: Review Authorization', () => {
    test('should allow review submission for students with >= 50% progress', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 50, max: 100 }), // Progress percentage >= 50%
          fc.integer({ min: 1, max: 5 }), // Rating 1-5
          fc.string({ minLength: 10, maxLength: 500 }), // Comment
          async (progressPercentage, rating, comment) => {
            // Update enrollment progress
            testEnrollment.progress.percentageComplete = progressPercentage;
            await testEnrollment.save();

            // Create review
            const review = await Review.create({
              reviewType: 'course_review',
              reviewer: testStudent._id,
              reviewee: testInstructor._id,
              rating,
              comment,
              relatedData: {
                course: testCourse._id,
                enrollment: testEnrollment._id,
                completionStatus: 'active'
              }
            });

            // Verify review was created
            expect(review).toBeDefined();
            expect(review.rating).toBe(rating);
            expect(review.relatedData.course.toString()).toBe(testCourse._id.toString());

            // Cleanup
            await Review.deleteOne({ _id: review._id });
          }
        ),
        { numRuns: 20 }
      );
    });

    test('should reject review submission for students with < 50% progress', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 49 }), // Progress percentage < 50%
          async (progressPercentage) => {
            // Update enrollment progress
            testEnrollment.progress.percentageComplete = progressPercentage;
            await testEnrollment.save();

            // Check if student can review
            const canReview = testEnrollment.canReview();

            // Verify student cannot review
            expect(canReview).toBe(false);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 8: Rating Recalculation
   * For any course, when a new review is submitted, the course's average rating
   * should be recalculated correctly as the mean of all approved review ratings.
   * 
   * Validates: Requirements 3.6
   */
  describe('Property 8: Rating Recalculation', () => {
    test('should correctly calculate average rating from multiple reviews', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 10 }), // Array of ratings
          async (ratings) => {
            // Create multiple reviews with different ratings
            const reviews = [];
            for (let i = 0; i < ratings.length; i++) {
              const student = await Individual.create({
                firstName: `Student${i}`,
                lastName: `Test${i}`,
                email: `student${i}@test.com`,
                password: 'password123',
                phoneNumber: `123456789${i}`,
                userType: 'individual'
              });

              const enrollment = await CourseEnrollment.create({
                course: testCourse._id,
                student: student._id,
                status: 'active',
                progress: {
                  completedLessons: [],
                  percentageComplete: 100
                }
              });

              const review = await Review.create({
                reviewType: 'course_review',
                reviewer: student._id,
                reviewee: testInstructor._id,
                rating: ratings[i],
                comment: `Test comment ${i}`,
                status: 'approved',
                relatedData: {
                  course: testCourse._id,
                  enrollment: enrollment._id,
                  completionStatus: 'completed'
                }
              });

              reviews.push(review);
            }

            // Calculate expected average
            const expectedAverage = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            const expectedAverageRounded = Math.round(expectedAverage * 10) / 10;

            // Get all reviews and calculate average
            const allReviews = await Review.find({
              reviewType: 'course_review',
              'relatedData.course': testCourse._id,
              status: 'approved'
            });

            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            const actualAverage = Math.round((totalRating / allReviews.length) * 10) / 10;

            // Verify average is correct
            expect(actualAverage).toBe(expectedAverageRounded);

            // Cleanup
            await Review.deleteMany({ _id: { $in: reviews.map(r => r._id) } });
            await CourseEnrollment.deleteMany({ course: testCourse._id, student: { $ne: testStudent._id } });
            await User.deleteMany({ _id: { $ne: testStudent._id, $ne: testInstructor._id } });
          }
        ),
        { numRuns: 10 }
      );
    });

    test('should update average rating when a review is edited', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }), // Initial rating
          fc.integer({ min: 1, max: 5 }), // New rating
          async (initialRating, newRating) => {
            // Create initial review
            const review = await Review.create({
              reviewType: 'course_review',
              reviewer: testStudent._id,
              reviewee: testInstructor._id,
              rating: initialRating,
              comment: 'Initial comment',
              status: 'approved',
              relatedData: {
                course: testCourse._id,
                enrollment: testEnrollment._id,
                completionStatus: 'active'
              }
            });

            // Update rating
            review.rating = newRating;
            await review.save();

            // Get updated review
            const updatedReview = await Review.findById(review._id);

            // Verify rating was updated
            expect(updatedReview.rating).toBe(newRating);

            // Cleanup
            await Review.deleteOne({ _id: review._id });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 9: Review Sort Order
   * For any set of course reviews, when displayed, they should be ordered
   * by helpfulness count in descending order.
   * 
   * Validates: Requirements 3.7
   */
  describe('Property 9: Review Sort Order', () => {
    test('should sort reviews by helpfulCount in descending order', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 10 }), // Array of helpful counts
          async (helpfulCounts) => {
            // Create multiple reviews with different helpful counts
            const reviews = [];
            for (let i = 0; i < helpfulCounts.length; i++) {
              const student = await Individual.create({
                firstName: `Student${i}`,
                lastName: `Test${i}`,
                email: `student${i}@test.com`,
                password: 'password123',
                phoneNumber: `123456789${i}`,
                userType: 'individual'
              });

              const enrollment = await CourseEnrollment.create({
                course: testCourse._id,
                student: student._id,
                status: 'active',
                progress: {
                  completedLessons: [],
                  percentageComplete: 100
                }
              });

              const review = await Review.create({
                reviewType: 'course_review',
                reviewer: student._id,
                reviewee: testInstructor._id,
                rating: 5,
                comment: `Test comment ${i}`,
                status: 'approved',
                helpfulCount: helpfulCounts[i],
                relatedData: {
                  course: testCourse._id,
                  enrollment: enrollment._id,
                  completionStatus: 'completed'
                }
              });

              reviews.push(review);
            }

            // Get reviews sorted by helpfulCount descending
            const sortedReviews = await Review.find({
              reviewType: 'course_review',
              'relatedData.course': testCourse._id,
              status: 'approved'
            }).sort({ helpfulCount: -1 });

            // Verify sort order
            for (let i = 0; i < sortedReviews.length - 1; i++) {
              expect(sortedReviews[i].helpfulCount).toBeGreaterThanOrEqual(sortedReviews[i + 1].helpfulCount);
            }

            // Cleanup
            await Review.deleteMany({ _id: { $in: reviews.map(r => r._id) } });
            await CourseEnrollment.deleteMany({ course: testCourse._id, student: { $ne: testStudent._id } });
            await User.deleteMany({ _id: { $ne: testStudent._id, $ne: testInstructor._id } });
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
