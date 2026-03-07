const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { User, Individual } = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const Review = require('../src/models/Review');
const Notification = require('../src/models/Notification');
const notificationService = require('../src/services/notificationService');
const logger = require('../src/utils/logger');

describe('Courses Integration Tests', () => {
  let studentToken, instructorToken;
  let studentId, instructorId;
  let courseId, enrollmentId;

  beforeAll(async () => {
    // إنشاء مستخدمين للاختبار
    const student = await Individual.create({
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@test.com',
      password: 'password123',
      phoneNumber: '1234567890',
      userType: 'individual'
    });
    studentId = student._id;
    studentToken = student.generateAuthToken();

    const instructor = await Individual.create({
      firstName: 'Test',
      lastName: 'Instructor',
      email: 'instructor@test.com',
      password: 'password123',
      phoneNumber: '0987654321',
      userType: 'individual'
    });
    instructorId = instructor._id;
    instructorToken = instructor.generateAuthToken();

    // إنشاء دورة للاختبار
    const course = await EducationalCourse.create({
      title: 'Test Course',
      description: 'Test course description',
      instructor: instructorId,
      category: 'Programming',
      level: 'Beginner',
      duration: { value: 10, unit: 'hours' },
      status: 'Published',
      price: { amount: 0, isFree: true },
      totalLessons: 5,
      totalDuration: 10,
      publishedAt: new Date()
    });
    courseId = course._id;
  });

  afterAll(async () => {
    // تنظيف البيانات
    await Individual.deleteMany({ email: { $in: ['student@test.com', 'instructor@test.com'] } });
    await EducationalCourse.deleteMany({ title: 'Test Course' });
    await CourseEnrollment.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
  });

  describe('Notification Integration', () => {
    test('should send notification on course enrollment', async () => {
      // التسجيل في الدورة
      const enrollment = await CourseEnrollment.create({
        course: courseId,
        student: studentId,
        status: 'active'
      });
      enrollmentId = enrollment._id;

      // إرسال إشعار
      const notification = await notificationService.notifyCourseEnrollment(
        studentId,
        courseId,
        'Test Course',
        'Test Instructor'
      );

      expect(notification).toBeDefined();
      expect(notification.recipient.toString()).toBe(studentId.toString());
      expect(notification.type).toBe('course_enrollment');
      expect(notification.title).toContain('تم التسجيل في الدورة بنجاح');
    });

    test('should send notification on course completion', async () => {
      // تحديث التسجيل لإكمال الدورة
      await CourseEnrollment.findByIdAndUpdate(enrollmentId, {
        status: 'completed',
        completedAt: new Date(),
        'progress.percentageComplete': 100,
        'certificateIssued.issued': true,
        'certificateIssued.certificateUrl': 'https://example.com/cert.pdf'
      });

      // إرسال إشعار
      const notification = await notificationService.notifyCourseCompletion(
        studentId,
        courseId,
        'Test Course',
        'https://example.com/cert.pdf'
      );

      expect(notification).toBeDefined();
      expect(notification.recipient.toString()).toBe(studentId.toString());
      expect(notification.type).toBe('course_completion');
      expect(notification.title).toContain('تهانينا');
    });

    test('should send notification on new course review', async () => {
      // إنشاء مراجعة
      await Review.create({
        reviewType: 'course_review',
        reviewer: studentId,
        course: courseId,
        enrollment: enrollmentId,
        rating: 5,
        comment: 'Great course!',
        completionStatus: 'completed'
      });

      // إرسال إشعار
      const notification = await notificationService.notifyCourseReview(
        instructorId,
        courseId,
        'Test Course',
        'Test Student',
        5
      );

      expect(notification).toBeDefined();
      expect(notification.recipient.toString()).toBe(instructorId.toString());
      expect(notification.type).toBe('course_review');
      expect(notification.title).toContain('مراجعة جديدة');
    });
  });

  describe('Review System Integration', () => {
    test('should create course review with correct type', async () => {
      const review = await Review.create({
        reviewType: 'course_review',
        reviewer: studentId,
        course: courseId,
        enrollment: enrollmentId,
        rating: 4,
        comment: 'Good course, learned a lot',
        completionStatus: 'completed',
        detailedRatings: {
          contentQuality: 4,
          instructorEffectiveness: 5,
          valueForMoney: 4,
          practicalApplication: 4
        }
      });

      expect(review.reviewType).toBe('course_review');
      expect(review.course.toString()).toBe(courseId.toString());
      expect(review.enrollment.toString()).toBe(enrollmentId.toString());
      expect(review.completionStatus).toBe('completed');
    });

    test('should update course stats after review', async () => {
      // الانتظار قليلاً للـ post-save middleware
      await new Promise(resolve => setTimeout(resolve, 100));

      const course = await EducationalCourse.findById(courseId);
      expect(course.stats.totalReviews).toBeGreaterThan(0);
      expect(course.stats.averageRating).toBeGreaterThan(0);
    });

    test('should calculate average rating for course', async () => {
      const stats = await Review.calculateAverageRating(courseId, 'course_review', 'course');
      
      expect(stats.totalReviews).toBeGreaterThan(0);
      expect(stats.averageRating).toBeGreaterThan(0);
      expect(stats.averageRating).toBeLessThanOrEqual(5);
    });

    test('should check if user can review course', async () => {
      const canReview = await Review.canReview(
        studentId,
        courseId,
        enrollmentId,
        'course_review'
      );

      // يجب أن يكون false لأن المستخدم قام بالمراجعة بالفعل
      expect(canReview).toBe(false);
    });
  });

  describe('Error Logging Integration', () => {
    test('should log errors with context', () => {
      const { logError } = require('../src/middleware/errorLogger');
      const error = new Error('Test error');
      const context = { userId: studentId, action: 'test' };

      // يجب ألا يرمي خطأ
      expect(() => logError(error, context)).not.toThrow();
    });

    test('should log database errors', () => {
      const { logDatabaseError } = require('../src/middleware/errorLogger');
      const error = new Error('Database connection failed');
      
      expect(() => logDatabaseError(error, 'find', 'Course', {})).not.toThrow();
    });

    test('should log validation errors', () => {
      const { logValidationError } = require('../src/middleware/errorLogger');
      const error = new Error('Validation failed');
      error.errors = { title: 'Title is required' };
      
      expect(() => logValidationError(error, {}, 'course')).not.toThrow();
    });
  });

  describe('Caching Headers Integration', () => {
    test('should set cache headers for GET requests', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      // التحقق من وجود Cache-Control header
      expect(response.headers['cache-control']).toBeDefined();
    });

    test('should set ETag header', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      // التحقق من وجود ETag header
      expect(response.headers['etag']).toBeDefined();
    });

    test('should return 304 for matching ETag', async () => {
      // الطلب الأول للحصول على ETag
      const firstResponse = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      const etag = firstResponse.headers['etag'];

      // الطلب الثاني مع If-None-Match
      const secondResponse = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .set('If-None-Match', etag);

      expect(secondResponse.status).toBe(304);
    });

    test('should not cache POST requests', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send({
          title: 'New Course',
          description: 'Description',
          category: 'Programming',
          level: 'Beginner',
          duration: { value: 5, unit: 'hours' }
        });

      // لا يجب أن يحتوي على Cache-Control للـ POST
      const cacheControl = response.headers['cache-control'];
      if (cacheControl) {
        expect(cacheControl).not.toContain('public');
      }
    });
  });

  describe('End-to-End Integration', () => {
    test('complete flow: enroll -> complete -> review -> notification', async () => {
      // 1. إنشاء دورة جديدة
      const newCourse = await EducationalCourse.create({
        title: 'Integration Test Course',
        description: 'Full integration test',
        instructor: instructorId,
        category: 'Testing',
        level: 'Advanced',
        duration: { value: 20, unit: 'hours' },
        status: 'Published',
        price: { amount: 0, isFree: true },
        totalLessons: 10,
        totalDuration: 20,
        publishedAt: new Date()
      });

      // 2. التسجيل
      const newEnrollment = await CourseEnrollment.create({
        course: newCourse._id,
        student: studentId,
        status: 'active'
      });

      const enrollNotification = await notificationService.notifyCourseEnrollment(
        studentId,
        newCourse._id,
        newCourse.title,
        'Test Instructor'
      );
      expect(enrollNotification).toBeDefined();

      // 3. إكمال الدورة
      await CourseEnrollment.findByIdAndUpdate(newEnrollment._id, {
        status: 'completed',
        completedAt: new Date(),
        'progress.percentageComplete': 100,
        'certificateIssued.issued': true,
        'certificateIssued.certificateUrl': 'https://example.com/cert2.pdf'
      });

      const completeNotification = await notificationService.notifyCourseCompletion(
        studentId,
        newCourse._id,
        newCourse.title,
        'https://example.com/cert2.pdf'
      );
      expect(completeNotification).toBeDefined();

      // 4. كتابة مراجعة
      const newReview = await Review.create({
        reviewType: 'course_review',
        reviewer: studentId,
        course: newCourse._id,
        enrollment: newEnrollment._id,
        rating: 5,
        comment: 'Excellent integration test course!',
        completionStatus: 'completed'
      });
      expect(newReview).toBeDefined();

      const reviewNotification = await notificationService.notifyCourseReview(
        instructorId,
        newCourse._id,
        newCourse.title,
        'Test Student',
        5
      );
      expect(reviewNotification).toBeDefined();

      // 5. التحقق من تحديث الإحصائيات
      await new Promise(resolve => setTimeout(resolve, 100));
      const updatedCourse = await EducationalCourse.findById(newCourse._id);
      expect(updatedCourse.stats.totalReviews).toBeGreaterThan(0);
      expect(updatedCourse.stats.averageRating).toBe(5);

      // تنظيف
      await EducationalCourse.findByIdAndDelete(newCourse._id);
      await CourseEnrollment.findByIdAndDelete(newEnrollment._id);
      await Review.findByIdAndDelete(newReview._id);
    });
  });
});
