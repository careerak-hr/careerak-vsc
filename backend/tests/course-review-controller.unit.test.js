const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const Review = require('../src/models/Review');
const EducationalCourse = require('../src/models/EducationalCourse');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const { User, Individual } = require('../src/models/User');
const jwt = require('jsonwebtoken');

/**
 * Unit Tests for Course Review Controller
 * 
 * Tests:
 * - Review creation with progress check
 * - Rating recalculation accuracy
 * - Review sorting by helpfulness
 * - Instructor response functionality
 * 
 * Validates: Requirements 3.5, 3.6, 3.7
 */

describe('Course Review Controller Unit Tests', () => {
  let testCourse;
  let testInstructor;
  let testStudent;
  let testEnrollment;
  let studentToken;
  let instructorToken;

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

    // Create instructor token
    instructorToken = jwt.sign(
      { _id: testInstructor._id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    // Create test course
    testCourse = await EducationalCourse.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: testInstructor._id,
      category: 'Programming',
      level: 'Beginner',
      status: 'Published',
      totalLessons: 10,
      publishedAt: new Date(),
      stats: {
        averageRating: 0,
        totalReviews: 0
      }
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

    // Create student token
    studentToken = jwt.sign(
      { _id: testStudent._id },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

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
   * Test review creation with progress check
   * Requirements: 3.5
   */
  describe('POST /courses/:id/reviews - Create Review', () => {
    test('should create review when student has >= 50% progress', async () => {
      const reviewData = {
        rating: 5,
        comment: 'Great course! Very informative.',
        title: 'Excellent Course',
        pros: 'Clear explanations',
        cons: 'None',
        wouldRecommend: true
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(reviewData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.review).toBeDefined();
      expect(response.body.review.rating).toBe(5);
      expect(response.body.review.comment).toBe(reviewData.comment);
    });

    test('should reject review when student has < 50% progress', async () => {
      // Update enrollment to have less than 50% progress
      testEnrollment.progress.percentageComplete = 30;
      await testEnrollment.save();

      const reviewData = {
        rating: 5,
        comment: 'Great course!',
        title: 'Good'
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(reviewData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('50%');
    });

    test('should reject review when student is not enrolled', async () => {
      // Delete enrollment
      await CourseEnrollment.deleteOne({ _id: testEnrollment._id });

      const reviewData = {
        rating: 5,
        comment: 'Great course!',
        title: 'Good'
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(reviewData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('enrolled');
    });

    test('should reject duplicate review from same student', async () => {
      // Create first review
      await Review.create({
        reviewType: 'course_review',
        reviewer: testStudent._id,
        reviewee: testInstructor._id,
        rating: 5,
        comment: 'First review',
        relatedData: {
          course: testCourse._id,
          enrollment: testEnrollment._id
        }
      });

      // Try to create second review
      const reviewData = {
        rating: 4,
        comment: 'Second review',
        title: 'Another review'
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/reviews`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(reviewData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already reviewed');
    });
  });

  /**
   * Test rating recalculation accuracy
   * Requirements: 3.6
   */
  describe('Rating Recalculation', () => {
    test('should correctly calculate average rating from multiple reviews', async () => {
      // Create multiple students and reviews
      const ratings = [5, 4, 5, 3, 4];
      const expectedAverage = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      const expectedAverageRounded = Math.round(expectedAverage * 10) / 10;

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

        await Review.create({
          reviewType: 'course_review',
          reviewer: student._id,
          reviewee: testInstructor._id,
          rating: ratings[i],
          comment: `Review ${i}`,
          status: 'approved',
          relatedData: {
            course: testCourse._id,
            enrollment: enrollment._id
          }
        });
      }

      // Manually trigger rating recalculation
      const { updateCourseRatingStats } = require('../src/controllers/courseReviewController');
      await updateCourseRatingStats(testCourse._id);

      // Get updated course
      const updatedCourse = await EducationalCourse.findById(testCourse._id);

      expect(updatedCourse.stats.averageRating).toBe(expectedAverageRounded);
      expect(updatedCourse.stats.totalReviews).toBe(ratings.length);
    });

    test('should update average rating when review is edited', async () => {
      // Create initial review
      const review = await Review.create({
        reviewType: 'course_review',
        reviewer: testStudent._id,
        reviewee: testInstructor._id,
        rating: 3,
        comment: 'Initial review',
        status: 'approved',
        relatedData: {
          course: testCourse._id,
          enrollment: testEnrollment._id
        }
      });

      // Update course stats
      const { updateCourseRatingStats } = require('../src/controllers/courseReviewController');
      await updateCourseRatingStats(testCourse._id);

      let course = await EducationalCourse.findById(testCourse._id);
      expect(course.stats.averageRating).toBe(3);

      // Update review rating
      review.rating = 5;
      await review.save();

      // Update course stats again
      await updateCourseRatingStats(testCourse._id);

      course = await EducationalCourse.findById(testCourse._id);
      expect(course.stats.averageRating).toBe(5);
    });
  });

  /**
   * Test review sorting by helpfulness
   * Requirements: 3.7
   */
  describe('GET /courses/:id/reviews - Review Sorting', () => {
    test('should return reviews sorted by helpfulCount descending', async () => {
      // Create multiple reviews with different helpful counts
      const helpfulCounts = [10, 5, 20, 2, 15];

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

        await Review.create({
          reviewType: 'course_review',
          reviewer: student._id,
          reviewee: testInstructor._id,
          rating: 5,
          comment: `Review ${i}`,
          status: 'approved',
          helpfulCount: helpfulCounts[i],
          relatedData: {
            course: testCourse._id,
            enrollment: enrollment._id
          }
        });
      }

      const response = await request(app)
        .get(`/api/courses/${testCourse._id}/reviews`)
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reviews).toHaveLength(5);

      // Verify sort order
      const reviews = response.body.reviews;
      for (let i = 0; i < reviews.length - 1; i++) {
        expect(reviews[i].helpfulCount).toBeGreaterThanOrEqual(reviews[i + 1].helpfulCount);
      }

      // Verify the order matches expected (20, 15, 10, 5, 2)
      expect(reviews[0].helpfulCount).toBe(20);
      expect(reviews[1].helpfulCount).toBe(15);
      expect(reviews[2].helpfulCount).toBe(10);
      expect(reviews[3].helpfulCount).toBe(5);
      expect(reviews[4].helpfulCount).toBe(2);
    });
  });

  /**
   * Test instructor response functionality
   * Requirements: 3.6
   */
  describe('POST /courses/:id/reviews/:reviewId/response - Instructor Response', () => {
    let testReview;

    beforeEach(async () => {
      // Create a review
      testReview = await Review.create({
        reviewType: 'course_review',
        reviewer: testStudent._id,
        reviewee: testInstructor._id,
        rating: 4,
        comment: 'Good course',
        status: 'approved',
        relatedData: {
          course: testCourse._id,
          enrollment: testEnrollment._id
        }
      });
    });

    test('should allow instructor to add response to review', async () => {
      const responseData = {
        responseText: 'Thank you for your feedback!'
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/reviews/${testReview._id}/response`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(responseData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeDefined();
      expect(response.body.response.text).toBe(responseData.responseText);
    });

    test('should reject response from non-instructor', async () => {
      const responseData = {
        responseText: 'I am not the instructor'
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/reviews/${testReview._id}/response`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(responseData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('instructor');
    });

    test('should reject duplicate response', async () => {
      // Add first response
      testReview.response = {
        text: 'First response',
        respondedAt: new Date()
      };
      await testReview.save();

      // Try to add second response
      const responseData = {
        responseText: 'Second response'
      };

      const response = await request(app)
        .post(`/api/courses/${testCourse._id}/reviews/${testReview._id}/response`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(responseData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already been added');
    });
  });

  /**
   * Test review statistics endpoint
   * Requirements: 3.1, 3.2, 3.3
   */
  describe('GET /courses/:id/reviews/stats - Review Statistics', () => {
    test('should return correct review statistics', async () => {
      // Create reviews with different ratings
      const ratings = [5, 4, 5, 3, 4, 5, 2, 4];

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

        await Review.create({
          reviewType: 'course_review',
          reviewer: student._id,
          reviewee: testInstructor._id,
          rating: ratings[i],
          comment: `Review ${i}`,
          status: 'approved',
          relatedData: {
            course: testCourse._id,
            enrollment: enrollment._id
          }
        });
      }

      const response = await request(app)
        .get(`/api/courses/${testCourse._id}/reviews/stats`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();

      const stats = response.body.stats;
      expect(stats.totalReviews).toBe(8);
      expect(stats.averageRating).toBeCloseTo(4, 1);

      // Verify rating distribution
      expect(stats.ratingDistribution[5]).toBe(3); // Three 5-star reviews
      expect(stats.ratingDistribution[4]).toBe(3); // Three 4-star reviews
      expect(stats.ratingDistribution[3]).toBe(1); // One 3-star review
      expect(stats.ratingDistribution[2]).toBe(1); // One 2-star review
    });
  });
});
