const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const EducationalCourse = require('../src/models/EducationalCourse');

/**
 * Property-Based Test for CourseEnrollment Progress Calculation
 * 
 * Feature: courses-page-enhancements
 * Property 18: Progress Calculation
 * 
 * **Validates: Requirements 6.1**
 * 
 * Property: For any enrollment, the completion percentage should equal 
 * (completedLessons.length / course.totalLessons) * 100, rounded to nearest integer.
 */

describe('Feature: courses-page-enhancements, Property 18: Progress Calculation', () => {
  let mongoServer;

  beforeAll(async () => {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await CourseEnrollment.deleteMany({});
    await EducationalCourse.deleteMany({});
  });

  /**
   * Arbitrary: Generate a course with totalLessons
   */
  const courseArbitrary = () =>
    fc.record({
      title: fc.string({ minLength: 5, maxLength: 100 }),
      description: fc.string({ minLength: 10, maxLength: 500 }),
      instructor: fc.constant(new mongoose.Types.ObjectId()),
      category: fc.constantFrom('Programming', 'Design', 'Business', 'Marketing'),
      level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
      status: fc.constant('Published'),
      totalLessons: fc.integer({ min: 1, max: 100 }),
      totalDuration: fc.integer({ min: 1, max: 200 }),
      price: fc.record({
        amount: fc.integer({ min: 0, max: 1000 }),
        currency: fc.constant('USD'),
        isFree: fc.boolean()
      })
    });

  /**
   * Property Test: Progress calculation correctness
   * 
   * For any enrollment with any number of completed lessons (0 to totalLessons),
   * the percentageComplete should equal (completedLessons.length / totalLessons) * 100,
   * rounded to the nearest integer.
   */
  it('should calculate progress percentage correctly for any enrollment', async () => {
    await fc.assert(
      fc.asyncProperty(
        courseArbitrary(),
        fc.nat({ max: 100 }), // completedCount
        async (courseData, completedCount) => {
          // Ensure completedCount doesn't exceed totalLessons
          const actualCompletedCount = Math.min(completedCount, courseData.totalLessons);
          
          // Create a test student ID
          const studentId = new mongoose.Types.ObjectId();

          // Create the course
          const course = await EducationalCourse.create(courseData);

          // Generate completed lesson IDs
          const completedLessonIds = Array.from(
            { length: actualCompletedCount },
            () => new mongoose.Types.ObjectId()
          );

          // Create enrollment with completed lessons
          const enrollment = await CourseEnrollment.create({
            course: course._id,
            student: studentId,
            status: 'active',
            progress: {
              completedLessons: completedLessonIds,
              percentageComplete: 0 // Will be calculated
            }
          });

          // Calculate expected percentage
          const expectedPercentage = Math.round(
            (actualCompletedCount / courseData.totalLessons) * 100
          );

          // Call the calculateProgress method
          const calculatedPercentage = enrollment.calculateProgress(courseData.totalLessons);

          // Verify the property holds
          expect(calculatedPercentage).toBe(expectedPercentage);
          expect(calculatedPercentage).toBeGreaterThanOrEqual(0);
          expect(calculatedPercentage).toBeLessThanOrEqual(100);
          
          // Verify it's an integer
          expect(Number.isInteger(calculatedPercentage)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Progress calculation with pre-save middleware
   * 
   * When an enrollment is saved with modified completedLessons,
   * the percentageComplete should be automatically updated correctly.
   */
  it('should auto-update percentageComplete on save when completedLessons changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        courseArbitrary(),
        fc.nat({ max: 100 }), // initial completed count
        fc.nat({ max: 100 }), // updated completed count
        async (courseData, initialCount, updatedCount) => {
          // Ensure counts don't exceed totalLessons
          const actualInitialCount = Math.min(initialCount, courseData.totalLessons);
          const actualUpdatedCount = Math.min(updatedCount, courseData.totalLessons);
          
          // Create a test student ID
          const studentId = new mongoose.Types.ObjectId();

          // Create the course
          const course = await EducationalCourse.create(courseData);

          // Generate initial completed lesson IDs
          const initialLessonIds = Array.from(
            { length: actualInitialCount },
            () => new mongoose.Types.ObjectId()
          );

          // Create enrollment
          const enrollment = await CourseEnrollment.create({
            course: course._id,
            student: studentId,
            status: 'active',
            progress: {
              completedLessons: initialLessonIds,
              percentageComplete: 0
            }
          });

          // Verify initial percentage
          const expectedInitialPercentage = Math.round(
            (actualInitialCount / courseData.totalLessons) * 100
          );
          expect(enrollment.progress.percentageComplete).toBe(expectedInitialPercentage);

          // Update completed lessons
          const updatedLessonIds = Array.from(
            { length: actualUpdatedCount },
            () => new mongoose.Types.ObjectId()
          );
          
          enrollment.progress.completedLessons = updatedLessonIds;
          await enrollment.save();

          // Verify updated percentage
          const expectedUpdatedPercentage = Math.round(
            (actualUpdatedCount / courseData.totalLessons) * 100
          );
          expect(enrollment.progress.percentageComplete).toBe(expectedUpdatedPercentage);
          
          // Verify it's within valid range
          expect(enrollment.progress.percentageComplete).toBeGreaterThanOrEqual(0);
          expect(enrollment.progress.percentageComplete).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Progress calculation edge cases
   * 
   * Test boundary conditions:
   * - 0 completed lessons = 0%
   * - All lessons completed = 100%
   * - 0 total lessons = 0% (edge case)
   */
  it('should handle edge cases correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }), // totalLessons
        async (totalLessons) => {
          // Create a test student ID
          const studentId = new mongoose.Types.ObjectId();

          // Create the course
          const course = await EducationalCourse.create({
            title: 'Test Course',
            description: 'Test Description',
            instructor: new mongoose.Types.ObjectId(),
            category: 'Programming',
            level: 'Beginner',
            status: 'Published',
            totalLessons: totalLessons,
            totalDuration: 10,
            price: { amount: 0, currency: 'USD', isFree: true }
          });

          // Test Case 1: 0 completed lessons = 0%
          const enrollment1 = await CourseEnrollment.create({
            course: course._id,
            student: studentId,
            status: 'active',
            progress: {
              completedLessons: [],
              percentageComplete: 0
            }
          });
          expect(enrollment1.progress.percentageComplete).toBe(0);

          // Test Case 2: All lessons completed = 100%
          const allLessonIds = Array.from(
            { length: totalLessons },
            () => new mongoose.Types.ObjectId()
          );
          const enrollment2 = await CourseEnrollment.create({
            course: course._id,
            student: new mongoose.Types.ObjectId(),
            status: 'active',
            progress: {
              completedLessons: allLessonIds,
              percentageComplete: 0
            }
          });
          expect(enrollment2.progress.percentageComplete).toBe(100);

          // Test Case 3: Method handles 0 totalLessons gracefully
          const percentageWithZeroLessons = enrollment1.calculateProgress(0);
          expect(percentageWithZeroLessons).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Progress calculation is idempotent
   * 
   * Calling calculateProgress multiple times with the same data
   * should always return the same result.
   */
  it('should return consistent results when called multiple times', async () => {
    await fc.assert(
      fc.asyncProperty(
        courseArbitrary(),
        fc.nat({ max: 100 }),
        async (courseData, completedCount) => {
          const actualCompletedCount = Math.min(completedCount, courseData.totalLessons);
          
          // Create a test student ID
          const studentId = new mongoose.Types.ObjectId();

          // Create the course
          const course = await EducationalCourse.create(courseData);

          // Generate completed lesson IDs
          const completedLessonIds = Array.from(
            { length: actualCompletedCount },
            () => new mongoose.Types.ObjectId()
          );

          // Create enrollment
          const enrollment = await CourseEnrollment.create({
            course: course._id,
            student: studentId,
            status: 'active',
            progress: {
              completedLessons: completedLessonIds,
              percentageComplete: 0
            }
          });

          // Call calculateProgress multiple times
          const result1 = enrollment.calculateProgress(courseData.totalLessons);
          const result2 = enrollment.calculateProgress(courseData.totalLessons);
          const result3 = enrollment.calculateProgress(courseData.totalLessons);

          // All results should be identical
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Percentage is always between 0 and 100
   * 
   * For any valid enrollment, the percentage should never be negative
   * or exceed 100, even with edge cases.
   */
  it('should always return percentage between 0 and 100', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }), // totalLessons
        fc.integer({ min: 0, max: 150 }), // completedCount (can exceed totalLessons)
        async (totalLessons, completedCount) => {
          // Create a test student ID
          const studentId = new mongoose.Types.ObjectId();

          // Create the course
          const course = await EducationalCourse.create({
            title: 'Test Course',
            description: 'Test Description',
            instructor: new mongoose.Types.ObjectId(),
            category: 'Programming',
            level: 'Beginner',
            status: 'Published',
            totalLessons: totalLessons,
            totalDuration: 10,
            price: { amount: 0, currency: 'USD', isFree: true }
          });

          // Generate completed lesson IDs (can be more than totalLessons)
          const completedLessonIds = Array.from(
            { length: completedCount },
            () => new mongoose.Types.ObjectId()
          );

          // Create enrollment
          const enrollment = await CourseEnrollment.create({
            course: course._id,
            student: studentId,
            status: 'active',
            progress: {
              completedLessons: completedLessonIds,
              percentageComplete: 0
            }
          });

          // Calculate percentage
          const percentage = enrollment.calculateProgress(totalLessons);

          // Verify it's within valid range (method should cap at 100)
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });
});
