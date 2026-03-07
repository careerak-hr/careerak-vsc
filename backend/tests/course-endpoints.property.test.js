/**
 * Property Tests for Course Endpoints
 * Tests universal correctness properties with multiple iterations
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const EducationalCourse = require('../src/models/EducationalCourse');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const CourseLesson = require('../src/models/CourseLesson');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

// Test configuration
const PROPERTY_TEST_ITERATIONS = 10; // Reduced for faster testing

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test_secret', {
    expiresIn: '1d'
  });
};

// Helper function to create test user
const createTestUser = async (role = 'user') => {
  const user = await User.create({
    fullName: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    role,
    accountType: 'employee'
  });
  return user;
};

// Helper function to create test course
const createTestCourse = async (instructor, overrides = {}) => {
  const course = await EducationalCourse.create({
    title: `Test Course ${Date.now()}`,
    description: 'Test course description',
    instructor: instructor._id,
    category: 'Programming',
    level: 'Beginner',
    status: 'Published',
    totalLessons: 10,
    totalDuration: 20,
    publishedAt: new Date(),
    price: {
      amount: 0,
      isFree: true
    },
    stats: {
      totalEnrollments: 0,
      activeEnrollments: 0,
      completionRate: 0,
      averageRating: 0,
      totalReviews: 0,
      previewViews: 0
    },
    ...overrides
  });
  return course;
};

// Helper function to create test lesson
const createTestLesson = async (course, order, isFree = false) => {
  const lesson = await CourseLesson.create({
    course: course._id,
    title: `Lesson ${order}`,
    description: 'Test lesson',
    order,
    section: 'Section 1',
    content: 'video',
    duration: 30,
    isFree
  });
  return lesson;
};

describe('Course Endpoints - Property Tests', () => {
  let testDb;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test';
    testDb = await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await EducationalCourse.deleteMany({});
    await CourseEnrollment.deleteMany({});
    await CourseLesson.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await EducationalCourse.deleteMany({});
    await CourseEnrollment.deleteMany({});
    await CourseLesson.deleteMany({});
    await User.deleteMany({});
  });

  /**
   * Property 5: Course Update Consistency
   * For any course, when its information is updated by an instructor,
   * subsequent reads should immediately reflect the updated data.
   * Validates: Requirements 2.7
   */
  describe('Property 5: Course Update Consistency', () => {
    test('should reflect course updates immediately in subsequent reads', async () => {
      for (let i = 0; i < PROPERTY_TEST_ITERATIONS; i++) {
        // Create instructor and course
        const instructor = await createTestUser('instructor');
        const course = await createTestCourse(instructor);
        const token = generateToken(instructor._id);

        // Update course
        const updatedTitle = `Updated Course ${Date.now()}`;
        course.title = updatedTitle;
        course.description = 'Updated description';
        await course.save();

        // Read course immediately
        const response = await request(app)
          .get(`/courses/${course._id}`)
          .set('Authorization', `Bearer ${token}`);

        // Verify updates are reflected
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.course.title).toBe(updatedTitle);
        expect(response.body.data.course.description).toBe('Updated description');
      }
    });
  });

  /**
   * Property 10: Preview Access Without Enrollment
   * For any course, the first lesson marked as free preview should be
   * accessible to users without requiring enrollment.
   * Validates: Requirements 4.1, 4.5
   */
  describe('Property 10: Preview Access Without Enrollment', () => {
    test('should allow preview access without enrollment', async () => {
      for (let i = 0; i < PROPERTY_TEST_ITERATIONS; i++) {
        // Create course with free lesson
        const instructor = await createTestUser('instructor');
        const course = await createTestCourse(instructor);
        const freeLesson = await createTestLesson(course, 1, true);

        // Try to access preview without authentication
        const response = await request(app)
          .get(`/courses/${course._id}/preview`);

        // Verify preview is accessible
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.freeLesson).toBeDefined();
        expect(response.body.data.freeLesson._id.toString()).toBe(freeLesson._id.toString());
      }
    });

    test('should not require authentication for preview', async () => {
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      await createTestLesson(course, 1, true);

      // Access without token
      const response = await request(app)
        .get(`/courses/${course._id}/preview`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  /**
   * Property 11: Preview View Tracking
   * For any course, when a user plays a preview lesson,
   * the preview view count should increment by exactly 1.
   * Validates: Requirements 4.4
   */
  describe('Property 11: Preview View Tracking', () => {
    test('should increment preview views by exactly 1', async () => {
      for (let i = 0; i < PROPERTY_TEST_ITERATIONS; i++) {
        // Create course
        const instructor = await createTestUser('instructor');
        const course = await createTestCourse(instructor);
        await createTestLesson(course, 1, true);

        // Get initial preview views
        const initialViews = course.stats.previewViews;

        // Access preview
        await request(app)
          .get(`/courses/${course._id}/preview`);

        // Check updated views
        const updatedCourse = await EducationalCourse.findById(course._id);
        expect(updatedCourse.stats.previewViews).toBe(initialViews + 1);
      }
    });

    test('should track multiple preview views correctly', async () => {
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      await createTestLesson(course, 1, true);

      const viewCount = 5;
      for (let i = 0; i < viewCount; i++) {
        await request(app)
          .get(`/courses/${course._id}/preview`);
      }

      const updatedCourse = await EducationalCourse.findById(course._id);
      expect(updatedCourse.stats.previewViews).toBe(viewCount);
    });
  });

  /**
   * Property 21: Enrollment Sort Order
   * For any user's enrollments, when displayed, they should be
   * ordered by progress.lastAccessedAt in descending order.
   * Validates: Requirements 6.6
   */
  describe('Property 21: Enrollment Sort Order', () => {
    test('should sort enrollments by lastAccessedAt descending', async () => {
      for (let i = 0; i < PROPERTY_TEST_ITERATIONS; i++) {
        // Create user and multiple courses
        const student = await createTestUser();
        const instructor = await createTestUser('instructor');
        const token = generateToken(student._id);

        const enrollments = [];
        for (let j = 0; j < 5; j++) {
          const course = await createTestCourse(instructor);
          const enrollment = await CourseEnrollment.create({
            course: course._id,
            student: student._id,
            status: 'active',
            progress: {
              completedLessons: [],
              percentageComplete: 0,
              lastAccessedAt: new Date(Date.now() - j * 1000 * 60 * 60) // Different times
            }
          });
          enrollments.push(enrollment);
        }

        // Get user's enrollments
        const response = await request(app)
          .get('/courses/my-courses')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        const returnedEnrollments = response.body.data.enrollments;
        
        // Verify sort order (most recent first)
        for (let k = 0; k < returnedEnrollments.length - 1; k++) {
          const current = new Date(returnedEnrollments[k].progress.lastAccessedAt);
          const next = new Date(returnedEnrollments[k + 1].progress.lastAccessedAt);
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
        }
      }
    });
  });
});
