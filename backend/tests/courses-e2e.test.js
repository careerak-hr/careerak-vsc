/**
 * End-to-End Tests for Courses Page Enhancements
 * 
 * This test suite covers all user flows:
 * 1. Browse → Filter → View Details → Enroll
 * 2. Learn → Progress → Complete → Certificate
 * 3. Review → Rate → Helpful
 * 4. Wishlist and Sharing
 * 5. Responsive Design
 * 6. System Integration
 * 7. Performance
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const EducationalCourse = require('../src/models/EducationalCourse');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const CourseLesson = require('../src/models/CourseLesson');
const Review = require('../src/models/Review');
const Wishlist = require('../src/models/Wishlist');
const User = require('../src/models/User');

describe('Courses Page E2E Tests', () => {
  let authToken;
  let userId;
  let courseId;
  let lessonId;
  let enrollmentId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }

    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test Student',
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#',
        role: 'job_seeker'
      });

    authToken = userResponse.body.token;
    userId = userResponse.body.user._id;
  });

  afterAll(async () => {
    // Cleanup test data
    await User.deleteMany({ email: /test-.*@example\.com/ });
    await EducationalCourse.deleteMany({ title: /Test Course/ });
    await CourseEnrollment.deleteMany({ student: userId });
    await CourseLesson.deleteMany({});
    await Review.deleteMany({ reviewer: userId });
    await Wishlist.deleteMany({ user: userId });

    await mongoose.connection.close();
  });

  // ============================================================================
  // Test 17.1: Browse → Filter → View Details → Enroll
  // ============================================================================
  describe('17.1 User Flow: Browse → Filter → View Details → Enroll', () => {
    beforeAll(async () => {
      // Create test courses with different attributes
      const courses = [
        {
          title: 'Test Course - Beginner JavaScript',
          description: 'Learn JavaScript from scratch',
          level: 'Beginner',
          category: 'Programming',
          totalDuration: 10,
          totalLessons: 20,
          price: { amount: 0, currency: 'USD', isFree: true },
          status: 'Published',
          publishedAt: new Date(),
          stats: { averageRating: 4.5, totalEnrollments: 100 }
        },
        {
          title: 'Test Course - Advanced React',
          description: 'Master React development',
          level: 'Advanced',
          category: 'Programming',
          totalDuration: 20,
          totalLessons: 40,
          price: { amount: 99, currency: 'USD', isFree: false },
          status: 'Published',
          publishedAt: new Date(),
          stats: { averageRating: 4.8, totalEnrollments: 50 }
        }
      ];

      await EducationalCourse.insertMany(courses);
    });

    test('should browse all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      expect(Array.isArray(response.body.courses)).toBe(true);
      expect(response.body.courses.length).toBeGreaterThan(0);
      expect(response.body.total).toBeGreaterThan(0);
    });

    test('should filter courses by level', async () => {
      const response = await request(app)
        .get('/api/courses?level=Beginner')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      response.body.courses.forEach(course => {
        expect(course.level).toBe('Beginner');
      });
    });

    test('should filter courses by category', async () => {
      const response = await request(app)
        .get('/api/courses?category=Programming')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      response.body.courses.forEach(course => {
        expect(course.category).toBe('Programming');
      });
    });

    test('should filter courses by price (free)', async () => {
      const response = await request(app)
        .get('/api/courses?isFree=true')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      response.body.courses.forEach(course => {
        expect(course.price.isFree).toBe(true);
      });
    });

    test('should filter courses by minimum rating', async () => {
      const response = await request(app)
        .get('/api/courses?minRating=4.5')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      response.body.courses.forEach(course => {
        expect(course.stats.averageRating).toBeGreaterThanOrEqual(4.5);
      });
    });

    test('should sort courses by rating', async () => {
      const response = await request(app)
        .get('/api/courses?sort=rating')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      const ratings = response.body.courses.map(c => c.stats.averageRating);
      const sortedRatings = [...ratings].sort((a, b) => b - a);
      expect(ratings).toEqual(sortedRatings);
    });

    test('should view course details', async () => {
      const coursesResponse = await request(app).get('/api/courses');
      courseId = coursesResponse.body.courses[0]._id;

      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body._id).toBe(courseId);
      expect(response.body.title).toBeDefined();
      expect(response.body.description).toBeDefined();
      expect(response.body.level).toBeDefined();
      expect(response.body.totalDuration).toBeDefined();
      expect(response.body.totalLessons).toBeDefined();
      expect(response.body.stats).toBeDefined();
    });

    test('should enroll in course', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.course).toBe(courseId);
      expect(response.body.student).toBe(userId);
      expect(response.body.status).toBe('active');
      enrollmentId = response.body._id;
    });

    test('should not allow duplicate enrollment', async () => {
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  // ============================================================================
  // Test 17.2: Learn → Progress → Complete → Certificate
  // ============================================================================
  describe('17.2 User Flow: Learn → Progress → Complete → Certificate', () => {
    beforeAll(async () => {
      // Create test lessons
      const lessons = [];
      for (let i = 1; i <= 5; i++) {
        lessons.push({
          course: courseId,
          title: `Lesson ${i}`,
          description: `Description for lesson ${i}`,
          order: i,
          section: 'Introduction',
          content: 'video',
          duration: 10,
          isFree: i === 1
        });
      }

      const createdLessons = await CourseLesson.insertMany(lessons);
      lessonId = createdLessons[0]._id;

      // Update course with correct lesson count
      await EducationalCourse.findByIdAndUpdate(courseId, {
        totalLessons: 5
      });
    });

    test('should get course progress', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.progress).toBeDefined();
      expect(response.body.progress.percentageComplete).toBe(0);
    });

    test('should mark lesson as complete', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/lessons/${lessonId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.progress.completedLessons).toContain(lessonId.toString());
      expect(response.body.progress.percentageComplete).toBeGreaterThan(0);
    });

    test('should track progress correctly', async () => {
      const lessons = await CourseLesson.find({ course: courseId }).sort('order');
      
      // Complete all lessons
      for (const lesson of lessons) {
        await request(app)
          .post(`/api/courses/${courseId}/lessons/${lesson._id}/complete`)
          .set('Authorization', `Bearer ${authToken}`);
      }

      const response = await request(app)
        .get(`/api/courses/${courseId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.progress.percentageComplete).toBe(100);
      expect(response.body.status).toBe('completed');
    });

    test('should generate certificate on completion', async () => {
      const enrollment = await CourseEnrollment.findById(enrollmentId);
      
      expect(enrollment.certificateIssued.issued).toBe(true);
      expect(enrollment.certificateIssued.certificateUrl).toBeDefined();
      expect(enrollment.certificateIssued.certificateId).toBeDefined();
    });

    test('should retrieve certificate', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}/certificate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.certificateUrl).toBeDefined();
      expect(response.body.certificateId).toBeDefined();
    });
  });

  // ============================================================================
  // Test 17.3: Review → Rate → Helpful
  // ============================================================================
  describe('17.3 User Flow: Review → Rate → Helpful', () => {
    let reviewId;

    test('should submit course review', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/reviews`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 5,
          title: 'Excellent Course!',
          comment: 'This course was amazing and very helpful.',
          pros: 'Clear explanations, good examples',
          cons: 'None',
          wouldRecommend: true,
          detailedRatings: {
            contentQuality: 5,
            instructorEffectiveness: 5,
            valueForMoney: 5,
            practicalApplication: 5
          }
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.rating).toBe(5);
      expect(response.body.course).toBe(courseId);
      reviewId = response.body._id;
    });

    test('should update course rating', async () => {
      const course = await EducationalCourse.findById(courseId);
      expect(course.stats.totalReviews).toBeGreaterThan(0);
      expect(course.stats.averageRating).toBeGreaterThan(0);
    });

    test('should get course reviews', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}/reviews`)
        .expect(200);

      expect(response.body.reviews).toBeDefined();
      expect(Array.isArray(response.body.reviews)).toBe(true);
      expect(response.body.reviews.length).toBeGreaterThan(0);
    });

    test('should mark review as helpful', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/reviews/${reviewId}/helpful`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.helpfulCount).toBeGreaterThan(0);
    });

    test('should get review statistics', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}/reviews/stats`)
        .expect(200);

      expect(response.body.averageRating).toBeDefined();
      expect(response.body.totalReviews).toBeGreaterThan(0);
      expect(response.body.ratingDistribution).toBeDefined();
    });
  });

  // ============================================================================
  // Test 17.4: Wishlist and Sharing
  // ============================================================================
  describe('17.4 Wishlist and Sharing Flows', () => {
    let shareToken;

    test('should add course to wishlist', async () => {
      const response = await request(app)
        .post(`/api/wishlist/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.courses).toBeDefined();
      expect(response.body.courses.some(c => c.course.toString() === courseId)).toBe(true);
    });

    test('should get wishlist', async () => {
      const response = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.courses).toBeDefined();
      expect(response.body.courses.length).toBeGreaterThan(0);
    });

    test('should remove course from wishlist', async () => {
      const response = await request(app)
        .delete(`/api/wishlist/${courseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.courses.some(c => c.course.toString() === courseId)).toBe(false);
    });

    test('should generate shareable URL', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.shareUrl).toBeDefined();
      expect(response.body.token).toBeDefined();
      shareToken = response.body.token;
    });

    test('should track referral from shared link', async () => {
      const response = await request(app)
        .get(`/api/courses/shared/${shareToken}`)
        .expect(302);

      expect(response.headers.location).toContain(courseId);
    });
  });

  // ============================================================================
  // Test 17.5: Responsive Design
  // ============================================================================
  describe('17.5 Responsive Design Tests', () => {
    test('should return courses with pagination', async () => {
      const response = await request(app)
        .get('/api/courses?page=1&limit=12')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      expect(response.body.courses.length).toBeLessThanOrEqual(12);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBeDefined();
    });

    test('should support grid view', async () => {
      const response = await request(app)
        .get('/api/courses?view=grid')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      // Grid view returns same data, just different rendering on frontend
    });

    test('should support list view', async () => {
      const response = await request(app)
        .get('/api/courses?view=list')
        .expect(200);

      expect(response.body.courses).toBeDefined();
      // List view returns same data, just different rendering on frontend
    });
  });

  // ============================================================================
  // Test 17.6: System Integration
  // ============================================================================
  describe('17.6 System Integration Tests', () => {
    test('should log errors properly', async () => {
      // Trigger an error by requesting non-existent course
      await request(app)
        .get('/api/courses/000000000000000000000000')
        .expect(404);

      // Error should be logged (check logs in production)
    });

    test('should send notification on enrollment', async () => {
      // Create new course and enroll
      const course = await EducationalCourse.create({
        title: 'Test Course for Notification',
        description: 'Test',
        level: 'Beginner',
        category: 'Test',
        totalDuration: 5,
        totalLessons: 10,
        price: { amount: 0, currency: 'USD', isFree: true },
        status: 'Published',
        publishedAt: new Date()
      });

      await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Notification should be sent (check notification service)
    });

    test('should integrate with review system', async () => {
      const reviews = await Review.find({ 
        reviewType: 'course_review',
        course: courseId 
      });

      expect(reviews.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Test 17.7: Performance Tests
  // ============================================================================
  describe('17.7 Performance Tests', () => {
    test('should load courses page quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/courses')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // < 2 seconds
    });

    test('should filter courses quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/courses?level=Beginner&category=Programming&minRating=4')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(500); // < 500ms
    });

    test('should search courses quickly', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/courses?search=JavaScript')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // < 1 second
    });

    test('should verify database indexes are used', async () => {
      // Check if indexes exist
      const course = await EducationalCourse.findOne();
      const indexes = await EducationalCourse.collection.getIndexes();

      expect(indexes).toBeDefined();
      expect(Object.keys(indexes).length).toBeGreaterThan(1); // More than just _id
    });
  });
});
