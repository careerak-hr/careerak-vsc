const mongoose = require('mongoose');
const CourseEnrollment = require('../../src/models/CourseEnrollment');
const EducationalCourse = require('../../src/models/EducationalCourse');
const User = require('../../src/models/User');

describe('CourseEnrollment Model - Unit Tests', () => {
  let testCourse;
  let testStudent;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  beforeEach(async () => {
    // Clear collections
    await CourseEnrollment.deleteMany({});
    await EducationalCourse.deleteMany({});
    await User.deleteMany({});

    // Create test course
    testCourse = await EducationalCourse.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: new mongoose.Types.ObjectId(),
      category: 'Programming',
      level: 'Beginner',
      totalLessons: 10,
      totalDuration: 20,
      status: 'Published'
    });

    // Create test student
    testStudent = await User.create({
      fullName: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'job_seeker'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ========== Validation Tests ==========

  describe('Required Fields Validation', () => {
    it('should require course field', async () => {
      const enrollment = new CourseEnrollment({
        student: testStudent._id
      });

      await expect(enrollment.save()).rejects.toThrow(/Course is required/);
    });

    it('should require student field', async () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id
      });

      await expect(enrollment.save()).rejects.toThrow(/Student is required/);
    });

    it('should create enrollment with required fields', async () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id
      });

      const saved = await enrollment.save();
      expect(saved._id).toBeDefined();
      expect(saved.course.toString()).toBe(testCourse._id.toString());
      expect(saved.student.toString()).toBe(testStudent._id.toString());
    });
  });

  describe('Status Enum Validation', () => {
    it('should accept valid status values', async () => {
      const validStatuses = ['active', 'completed', 'dropped', 'expired'];

      for (const status of validStatuses) {
        const enrollment = new CourseEnrollment({
          course: testCourse._id,
          student: testStudent._id,
          status
        });

        const saved = await enrollment.save();
        expect(saved.status).toBe(status);
        await CourseEnrollment.deleteMany({});
      }
    });

    it('should reject invalid status values', async () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        status: 'invalid_status'
      });

      await expect(enrollment.save()).rejects.toThrow();
    });

    it('should default to active status', async () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id
      });

      const saved = await enrollment.save();
      expect(saved.status).toBe('active');
    });
  });

  describe('Progress Percentage Validation', () => {
    it('should enforce minimum percentage of 0', async () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { percentageComplete: -10 }
      });

      await expect(enrollment.save()).rejects.toThrow();
    });

    it('should enforce maximum percentage of 100', async () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { percentageComplete: 150 }
      });

      await expect(enrollment.save()).rejects.toThrow();
    });

    it('should accept valid percentage values', async () => {
      const validPercentages = [0, 25, 50, 75, 100];

      for (const percentage of validPercentages) {
        const enrollment = new CourseEnrollment({
          course: testCourse._id,
          student: testStudent._id,
          progress: { percentageComplete: percentage }
        });

        const saved = await enrollment.save();
        expect(saved.progress.percentageComplete).toBe(percentage);
        await CourseEnrollment.deleteMany({});
      }
    });

    it('should default percentage to 0', async () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id
      });

      const saved = await enrollment.save();
      expect(saved.progress.percentageComplete).toBe(0);
    });
  });

  describe('Unique Enrollment Constraint', () => {
    it('should prevent duplicate enrollments for same student and course', async () => {
      // Create first enrollment
      await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });

      // Attempt to create duplicate
      const duplicate = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id
      });

      await expect(duplicate.save()).rejects.toThrow();
    });

    it('should allow same student to enroll in different courses', async () => {
      const course2 = await EducationalCourse.create({
        title: 'Test Course 2',
        description: 'Test Description 2',
        instructor: new mongoose.Types.ObjectId(),
        category: 'Programming',
        level: 'Intermediate',
        totalLessons: 15,
        totalDuration: 30,
        status: 'Published'
      });

      const enrollment1 = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });

      const enrollment2 = await CourseEnrollment.create({
        course: course2._id,
        student: testStudent._id
      });

      expect(enrollment1._id).toBeDefined();
      expect(enrollment2._id).toBeDefined();
      expect(enrollment1._id.toString()).not.toBe(enrollment2._id.toString());
    });

    it('should allow different students to enroll in same course', async () => {
      const student2 = await User.create({
        fullName: 'Test Student 2',
        email: 'student2@test.com',
        password: 'password123',
        role: 'job_seeker'
      });

      const enrollment1 = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });

      const enrollment2 = await CourseEnrollment.create({
        course: testCourse._id,
        student: student2._id
      });

      expect(enrollment1._id).toBeDefined();
      expect(enrollment2._id).toBeDefined();
      expect(enrollment1._id.toString()).not.toBe(enrollment2._id.toString());
    });
  });

  // ========== Method Tests ==========

  describe('calculateProgress() Method', () => {
    it('should return 0 when no lessons completed', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { completedLessons: [] }
      });

      const progress = enrollment.calculateProgress(10);
      expect(progress).toBe(0);
    });

    it('should return 0 when totalLessons is 0', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { completedLessons: [new mongoose.Types.ObjectId()] }
      });

      const progress = enrollment.calculateProgress(0);
      expect(progress).toBe(0);
    });

    it('should return 0 when totalLessons is undefined', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { completedLessons: [new mongoose.Types.ObjectId()] }
      });

      const progress = enrollment.calculateProgress(undefined);
      expect(progress).toBe(0);
    });

    it('should calculate correct percentage for partial completion', () => {
      const lessonIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ];

      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { completedLessons: lessonIds }
      });

      const progress = enrollment.calculateProgress(10);
      expect(progress).toBe(30); // 3/10 = 30%
    });

    it('should return 100 when all lessons completed', () => {
      const lessonIds = Array.from({ length: 10 }, () => new mongoose.Types.ObjectId());

      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { completedLessons: lessonIds }
      });

      const progress = enrollment.calculateProgress(10);
      expect(progress).toBe(100);
    });

    it('should round percentage to nearest integer', () => {
      const lessonIds = [new mongoose.Types.ObjectId()];

      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { completedLessons: lessonIds }
      });

      const progress = enrollment.calculateProgress(3);
      expect(progress).toBe(33); // 1/3 = 33.33... rounds to 33
    });

    it('should cap percentage at 100', () => {
      // Edge case: more completed lessons than total (shouldn't happen but test boundary)
      const lessonIds = Array.from({ length: 15 }, () => new mongoose.Types.ObjectId());

      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { completedLessons: lessonIds }
      });

      const progress = enrollment.calculateProgress(10);
      expect(progress).toBe(100);
    });
  });

  describe('canReview() Method', () => {
    it('should return false when progress is less than 50%', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { percentageComplete: 49 }
      });

      expect(enrollment.canReview()).toBe(false);
    });

    it('should return true when progress is exactly 50%', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { percentageComplete: 50 }
      });

      expect(enrollment.canReview()).toBe(true);
    });

    it('should return true when progress is greater than 50%', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { percentageComplete: 75 }
      });

      expect(enrollment.canReview()).toBe(true);
    });

    it('should return true when progress is 100%', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { percentageComplete: 100 }
      });

      expect(enrollment.canReview()).toBe(true);
    });

    it('should return false when progress is 0%', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: { percentageComplete: 0 }
      });

      expect(enrollment.canReview()).toBe(false);
    });
  });

  // ========== Pre-save Middleware Tests ==========

  describe('Pre-save Middleware - Progress Calculation', () => {
    it('should auto-calculate percentageComplete when completedLessons changes', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });

      // Add completed lessons
      enrollment.progress.completedLessons = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ];

      await enrollment.save();

      // Should be 30% (3/10 lessons)
      expect(enrollment.progress.percentageComplete).toBe(30);
    });

    it('should auto-complete enrollment when progress reaches 100%', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        status: 'active'
      });

      // Complete all lessons
      enrollment.progress.completedLessons = Array.from(
        { length: 10 },
        () => new mongoose.Types.ObjectId()
      );

      await enrollment.save();

      expect(enrollment.progress.percentageComplete).toBe(100);
      expect(enrollment.status).toBe('completed');
      expect(enrollment.completedAt).toBeDefined();
    });

    it('should not change status if already completed', async () => {
      const completedDate = new Date('2024-01-01');
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        status: 'completed',
        completedAt: completedDate,
        progress: {
          completedLessons: Array.from({ length: 10 }, () => new mongoose.Types.ObjectId()),
          percentageComplete: 100
        }
      });

      // Modify something else
      enrollment.progress.lastAccessedAt = new Date();
      await enrollment.save();

      expect(enrollment.status).toBe('completed');
      expect(enrollment.completedAt.getTime()).toBe(completedDate.getTime());
    });

    it('should not auto-complete if status is not active', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        status: 'dropped'
      });

      // Complete all lessons
      enrollment.progress.completedLessons = Array.from(
        { length: 10 },
        () => new mongoose.Types.ObjectId()
      );

      await enrollment.save();

      expect(enrollment.progress.percentageComplete).toBe(100);
      expect(enrollment.status).toBe('dropped'); // Should remain dropped
      expect(enrollment.completedAt).toBeUndefined();
    });
  });

  // ========== Static Method Tests ==========

  describe('isEnrolled() Static Method', () => {
    it('should return true when student is enrolled', async () => {
      await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });

      const isEnrolled = await CourseEnrollment.isEnrolled(
        testStudent._id,
        testCourse._id
      );

      expect(isEnrolled).toBe(true);
    });

    it('should return false when student is not enrolled', async () => {
      const isEnrolled = await CourseEnrollment.isEnrolled(
        testStudent._id,
        testCourse._id
      );

      expect(isEnrolled).toBe(false);
    });

    it('should return false for non-existent student', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();

      const isEnrolled = await CourseEnrollment.isEnrolled(
        fakeStudentId,
        testCourse._id
      );

      expect(isEnrolled).toBe(false);
    });

    it('should return false for non-existent course', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();

      const isEnrolled = await CourseEnrollment.isEnrolled(
        testStudent._id,
        fakeCourseId
      );

      expect(isEnrolled).toBe(false);
    });
  });

  describe('getActiveEnrollments() Static Method', () => {
    it('should return only active enrollments', async () => {
      // Create multiple enrollments with different statuses
      const course2 = await EducationalCourse.create({
        title: 'Course 2',
        description: 'Description 2',
        instructor: new mongoose.Types.ObjectId(),
        category: 'Programming',
        level: 'Intermediate',
        totalLessons: 5,
        totalDuration: 10,
        status: 'Published'
      });

      await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        status: 'active',
        progress: { lastAccessedAt: new Date('2024-01-02') }
      });

      await CourseEnrollment.create({
        course: course2._id,
        student: testStudent._id,
        status: 'completed'
      });

      const activeEnrollments = await CourseEnrollment.getActiveEnrollments(testStudent._id);

      expect(activeEnrollments).toHaveLength(1);
      expect(activeEnrollments[0].status).toBe('active');
    });

    it('should sort by lastAccessedAt descending', async () => {
      const course2 = await EducationalCourse.create({
        title: 'Course 2',
        description: 'Description 2',
        instructor: new mongoose.Types.ObjectId(),
        category: 'Programming',
        level: 'Intermediate',
        totalLessons: 5,
        totalDuration: 10,
        status: 'Published'
      });

      await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        status: 'active',
        progress: { lastAccessedAt: new Date('2024-01-01') }
      });

      await CourseEnrollment.create({
        course: course2._id,
        student: testStudent._id,
        status: 'active',
        progress: { lastAccessedAt: new Date('2024-01-03') }
      });

      const activeEnrollments = await CourseEnrollment.getActiveEnrollments(testStudent._id);

      expect(activeEnrollments).toHaveLength(2);
      expect(activeEnrollments[0].course.title).toBe('Course 2'); // More recent
      expect(activeEnrollments[1].course.title).toBe('Test Course');
    });

    it('should return empty array when no active enrollments', async () => {
      const activeEnrollments = await CourseEnrollment.getActiveEnrollments(testStudent._id);

      expect(activeEnrollments).toHaveLength(0);
    });
  });

  // ========== Default Values Tests ==========

  describe('Default Values', () => {
    it('should set enrolledAt to current date', async () => {
      const before = new Date();
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });
      const after = new Date();

      expect(enrollment.enrolledAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(enrollment.enrolledAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should initialize empty completedLessons array', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });

      expect(enrollment.progress.completedLessons).toEqual([]);
    });

    it('should set certificate issued to false', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });

      expect(enrollment.certificateIssued.issued).toBe(false);
    });

    it('should set payment currency to USD', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        payment: { amount: 99.99 }
      });

      expect(enrollment.payment.currency).toBe('USD');
    });
  });

  // ========== Virtual Tests ==========

  describe('enrollmentDuration Virtual', () => {
    it('should calculate duration in days for active enrollment', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        enrolledAt: pastDate
      });

      const duration = enrollment.enrollmentDuration;
      expect(duration).toBeGreaterThanOrEqual(9); // Allow for timing variations
      expect(duration).toBeLessThanOrEqual(11);
    });

    it('should calculate duration using completedAt for completed enrollment', async () => {
      const enrolledDate = new Date('2024-01-01');
      const completedDate = new Date('2024-01-15');

      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        enrolledAt: enrolledDate,
        completedAt: completedDate,
        status: 'completed'
      });

      const duration = enrollment.enrollmentDuration;
      expect(duration).toBe(14); // 14 days
    });
  });
});
