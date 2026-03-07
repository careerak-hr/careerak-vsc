const mongoose = require('mongoose');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const EducationalCourse = require('../src/models/EducationalCourse');
const User = require('../src/models/User');

// Mock MongoDB connection for testing
beforeAll(async () => {
  // Use in-memory MongoDB for testing
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak_test';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear collections before each test
  await CourseEnrollment.deleteMany({});
  await EducationalCourse.deleteMany({});
  await User.deleteMany({});
});

describe('CourseEnrollment Model', () => {
  let testCourse;
  let testStudent;
  
  beforeEach(async () => {
    // Create test course
    testCourse = await EducationalCourse.create({
      title: 'Test Course',
      description: 'Test Description',
      instructor: new mongoose.Types.ObjectId(),
      category: 'Technology',
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
  
  describe('Schema Validation', () => {
    it('should create enrollment with required fields', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });
      
      expect(enrollment.course).toEqual(testCourse._id);
      expect(enrollment.student).toEqual(testStudent._id);
      expect(enrollment.status).toBe('active');
      expect(enrollment.progress.percentageComplete).toBe(0);
      expect(enrollment.enrolledAt).toBeDefined();
    });
    
    it('should fail without required course field', async () => {
      await expect(
        CourseEnrollment.create({
          student: testStudent._id
        })
      ).rejects.toThrow();
    });
    
    it('should fail without required student field', async () => {
      await expect(
        CourseEnrollment.create({
          course: testCourse._id
        })
      ).rejects.toThrow();
    });
    
    it('should only allow valid status values', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        status: 'active'
      });
      
      expect(enrollment.status).toBe('active');
      
      // Test other valid statuses
      enrollment.status = 'completed';
      await enrollment.save();
      expect(enrollment.status).toBe('completed');
      
      enrollment.status = 'dropped';
      await enrollment.save();
      expect(enrollment.status).toBe('dropped');
      
      enrollment.status = 'expired';
      await enrollment.save();
      expect(enrollment.status).toBe('expired');
    });
    
    it('should enforce percentage range (0-100)', async () => {
      const enrollment = await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id,
        progress: {
          percentageComplete: 50
        }
      });
      
      expect(enrollment.progress.percentageComplete).toBe(50);
      
      // Test boundary values
      enrollment.progress.percentageComplete = 0;
      await enrollment.save();
      expect(enrollment.progress.percentageComplete).toBe(0);
      
      enrollment.progress.percentageComplete = 100;
      await enrollment.save();
      expect(enrollment.progress.percentageComplete).toBe(100);
    });
  });
  
  describe('Indexes', () => {
    it('should enforce unique student-course combination', async () => {
      await CourseEnrollment.create({
        course: testCourse._id,
        student: testStudent._id
      });
      
      // Attempt duplicate enrollment
      await expect(
        CourseEnrollment.create({
          course: testCourse._id,
          student: testStudent._id
        })
      ).rejects.toThrow();
    });
    
    it('should allow same student in different courses', async () => {
      const course2 = await EducationalCourse.create({
        title: 'Test Course 2',
        description: 'Test Description 2',
        instructor: new mongoose.Types.ObjectId(),
        category: 'Technology',
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
      
      expect(enrollment1._id).not.toEqual(enrollment2._id);
    });
    
    it('should allow different students in same course', async () => {
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
      
      expect(enrollment1._id).not.toEqual(enrollment2._id);
    });
  });
  
  describe('calculateProgress Method', () => {
    it('should calculate 0% for no completed lessons', () => {
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: {
          completedLessons: []
        }
      });
      
      const progress = enrollment.calculateProgress(10);
      expect(progress).toBe(0);
    });
    
    it('should calculate 50% for half completed lessons', () => {
      const lessonIds = Array(5).fill(null).map(() => new mongoose.Types.ObjectId());
      
      const enrollment = new CourseEnrollment({
        course: testCourse._id,
        student: testStudent._id,
        progress: {
          completedLessons: lessonIds
        }
      });
      
      const progress = enrollment.