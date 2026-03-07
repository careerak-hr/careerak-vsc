/**
 * Unit Tests for Course Controller
 * Tests specific examples, edge cases, and error conditions
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const EducationalCourse = require('../src/models/EducationalCourse');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const CourseLesson = require('../src/models/CourseLesson');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

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

describe('Course Controller - Unit Tests', () => {
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

  describe('POST /courses/:id/enroll - Enrollment Creation', () => {
    test('should create enrollment successfully for free course', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      const token = generateToken(student._id);

      const response = await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment).toBeDefined();
      expect(response.body.data.enrollment.student.toString()).toBe(student._id.toString());
      expect(response.body.data.enrollment.course.toString()).toBe(course._id.toString());
    });

    test('should prevent duplicate enrollment', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      const token = generateToken(student._id);

      // First enrollment
      await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      // Second enrollment attempt
      const response = await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already enrolled');
    });

    test('should reject enrollment for unpublished course', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor, { status: 'Draft' });
      const token = generateToken(student._id);

      const response = await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('should update course enrollment stats', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      const token = generateToken(student._id);

      await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      const updatedCourse = await EducationalCourse.findById(course._id);
      expect(updatedCourse.stats.totalEnrollments).toBe(1);
      expect(updatedCourse.stats.activeEnrollments).toBe(1);
    });
  });

  describe('POST /courses/:id/lessons/:lessonId/complete - Progress Tracking', () => {
    test('should mark lesson as complete', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      const lesson = await createTestLesson(course, 1);
      const token = generateToken(student._id);

      // Enroll first
      await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      // Mark lesson complete
      const response = await request(app)
        .post(`/courses/${course._id}/lessons/${lesson._id}/complete`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.progress.percentageComplete).toBe(10); // 1/10 lessons
    });

    test('should detect course completion at 100%', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor, { totalLessons: 2 });
      const lesson1 = await createTestLesson(course, 1);
      const lesson2 = await createTestLesson(course, 2);
      const token = generateToken(student._id);

      // Enroll
      await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      // Complete first lesson
      await request(app)
        .post(`/courses/${course._id}/lessons/${lesson1._id}/complete`)
        .set('Authorization', `Bearer ${token}`);

      // Complete second lesson
      const response = await request(app)
        .post(`/courses/${course._id}/lessons/${lesson2._id}/complete`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.progress.percentageComplete).toBe(100);
      expect(response.body.data.progress.status).toBe('completed');
      expect(response.body.message).toContain('completed the course');
    });

    test('should reject completion for non-enrolled user', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      const lesson = await createTestLesson(course, 1);
      const token = generateToken(student._id);

      const response = await request(app)
        .post(`/courses/${course._id}/lessons/${lesson._id}/complete`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not enrolled');
    });
  });

  describe('GET /courses/:id/certificate - Certificate Retrieval', () => {
    test('should return certificate for completed course', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor, { totalLessons: 1 });
      const lesson = await createTestLesson(course, 1);
      const token = generateToken(student._id);

      // Enroll and complete
      await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      await request(app)
        .post(`/courses/${course._id}/lessons/${lesson._id}/complete`)
        .set('Authorization', `Bearer ${token}`);

      // Get certificate
      const response = await request(app)
        .get(`/courses/${course._id}/certificate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.certificate).toBeDefined();
      expect(response.body.data.certificate.certificateUrl).toBeDefined();
      expect(response.body.data.certificate.certificateId).toBeDefined();
    });

    test('should reject certificate request for incomplete course', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      const token = generateToken(student._id);

      // Enroll but don't complete
      await request(app)
        .post(`/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get(`/courses/${course._id}/certificate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not completed');
    });

    test('should reject certificate request for non-enrolled user', async () => {
      const student = await createTestUser();
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);
      const token = generateToken(student._id);

      const response = await request(app)
        .get(`/courses/${course._id}/certificate`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not enrolled');
    });
  });

  describe('Error Cases', () => {
    test('should return 404 for non-existent course', async () => {
      const student = await createTestUser();
      const token = generateToken(student._id);
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/courses/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should return 401 for unauthorized access to protected routes', async () => {
      const instructor = await createTestUser('instructor');
      const course = await createTestCourse(instructor);

      const response = await request(app)
        .post(`/courses/${course._id}/enroll`);

      expect(response.status).toBe(401);
    });

    test('should handle invalid course ID format', async () => {
      const student = await createTestUser();
      const token = generateToken(student._id);

      const response = await request(app)
        .get('/courses/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
    });
  });
});
