/**
 * Property Tests for Wishlist Endpoints
 * 
 * Tests universal properties that should hold true for all wishlist operations
 * 
 * Properties tested:
 * - Property 24: Wishlist Add Operation
 * - Property 25: Wishlist Remove Operation
 * - Property 26: Wishlist Retrieval
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

const fc = require('fast-check');
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');
const Wishlist = require('../src/models/Wishlist');
const jwt = require('jsonwebtoken');

// Test configuration
const NUM_RUNS = 100;
const TIMEOUT = 30000;

// Helper function to generate auth token
const generateAuthToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

// Arbitraries for generating test data
const courseArbitrary = fc.record({
  title: fc.string({ minLength: 5, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  category: fc.constantFrom('Programming', 'Design', 'Business', 'Marketing'),
  level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
  status: fc.constant('Published'),
  price: fc.record({
    amount: fc.nat({ max: 1000 }),
    currency: fc.constant('USD'),
    isFree: fc.boolean()
  }),
  totalDuration: fc.nat({ min: 1, max: 100 }),
  totalLessons: fc.nat({ min: 1, max: 50 }),
  stats: fc.record({
    totalEnrollments: fc.nat({ max: 10000 }),
    averageRating: fc.float({ min: 0, max: 5 }),
    totalReviews: fc.nat({ max: 1000 })
  })
});

const notesArbitrary = fc.oneof(
  fc.constant(''),
  fc.string({ minLength: 1, maxLength: 500 })
);

describe('Wishlist Endpoints - Property Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await EducationalCourse.deleteMany({});
    await Wishlist.deleteMany({});

    // Create test user
    testUser = await User.create({
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'job_seeker'
    });

    authToken = generateAuthToken(testUser._id);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * Property 24: Wishlist Add Operation
   * 
   * For any published course, when added to wishlist:
   * 1. The course should appear in the wishlist
   * 2. The addedAt timestamp should be set
   * 3. Adding the same course twice should not create duplicates
   * 4. The wishlist count should increase by 1 (or stay same if duplicate)
   * 
   * Validates: Requirements 8.1
   */
  test('Property 24: Wishlist Add Operation', async () => {
    await fc.assert(
      fc.asyncProperty(courseArbitrary, notesArbitrary, async (courseData, notes) => {
        // Create a published course
        const course = await EducationalCourse.create(courseData);

        // Get initial wishlist count
        const initialWishlist = await Wishlist.findOne({ user: testUser._id });
        const initialCount = initialWishlist ? initialWishlist.courses.length : 0;

        // Add course to wishlist
        const response = await request(app)
          .post(`/wishlist/${course._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ notes });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);

        // Verify course is in wishlist
        const wishlist = await Wishlist.findOne({ user: testUser._id });
        expect(wishlist).toBeTruthy();
        expect(wishlist.courses.length).toBe(initialCount + 1);

        const addedCourse = wishlist.courses.find(
          item => item.course.toString() === course._id.toString()
        );
        expect(addedCourse).toBeTruthy();
        expect(addedCourse.addedAt).toBeInstanceOf(Date);
        expect(addedCourse.notes).toBe(notes);

        // Try adding the same course again
        const duplicateResponse = await request(app)
          .post(`/wishlist/${course._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ notes: 'Updated notes' });

        expect(duplicateResponse.status).toBe(200);

        // Verify no duplicate was created
        const updatedWishlist = await Wishlist.findOne({ user: testUser._id });
        expect(updatedWishlist.courses.length).toBe(initialCount + 1);

        // Cleanup
        await EducationalCourse.findByIdAndDelete(course._id);
      }),
      { numRuns: NUM_RUNS, timeout: TIMEOUT }
    );
  }, TIMEOUT);

  /**
   * Property 25: Wishlist Remove Operation
   * 
   * For any course in the wishlist:
   * 1. Removing it should decrease the wishlist count by 1
   * 2. The course should no longer appear in the wishlist
   * 3. Removing a non-existent course should return 404
   * 4. Other courses in the wishlist should remain unchanged
   * 
   * Validates: Requirements 8.2
   */
  test('Property 25: Wishlist Remove Operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(courseArbitrary, { minLength: 2, maxLength: 5 }),
        fc.nat(),
        async (coursesData, removeIndexSeed) => {
          // Create multiple courses
          const courses = await Promise.all(
            coursesData.map(data => EducationalCourse.create(data))
          );

          // Add all courses to wishlist
          for (const course of courses) {
            await request(app)
              .post(`/wishlist/${course._id}`)
              .set('Authorization', `Bearer ${authToken}`)
              .send({});
          }

          // Get initial wishlist
          const initialWishlist = await Wishlist.findOne({ user: testUser._id });
          const initialCount = initialWishlist.courses.length;

          // Select a course to remove
          const removeIndex = removeIndexSeed % courses.length;
          const courseToRemove = courses[removeIndex];
          const otherCourses = courses.filter((_, idx) => idx !== removeIndex);

          // Remove the course
          const response = await request(app)
            .delete(`/wishlist/${courseToRemove._id}`)
            .set('Authorization', `Bearer ${authToken}`);

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // Verify course was removed
          const updatedWishlist = await Wishlist.findOne({ user: testUser._id });
          expect(updatedWishlist.courses.length).toBe(initialCount - 1);

          const removedCourse = updatedWishlist.courses.find(
            item => item.course.toString() === courseToRemove._id.toString()
          );
          expect(removedCourse).toBeUndefined();

          // Verify other courses remain
          for (const course of otherCourses) {
            const stillExists = updatedWishlist.courses.find(
              item => item.course.toString() === course._id.toString()
            );
            expect(stillExists).toBeTruthy();
          }

          // Try removing the same course again (should fail)
          const duplicateResponse = await request(app)
            .delete(`/wishlist/${courseToRemove._id}`)
            .set('Authorization', `Bearer ${authToken}`);

          expect(duplicateResponse.status).toBe(404);

          // Cleanup
          await Promise.all(courses.map(c => EducationalCourse.findByIdAndDelete(c._id)));
        }
      ),
      { numRuns: NUM_RUNS, timeout: TIMEOUT }
    );
  }, TIMEOUT);

  /**
   * Property 26: Wishlist Retrieval
   * 
   * For any user's wishlist:
   * 1. GET /wishlist should return all courses in the wishlist
   * 2. The count should match the number of courses
   * 3. Each course should have populated details
   * 4. Courses should be ordered by addedAt (most recent first)
   * 5. Empty wishlist should return empty array
   * 
   * Validates: Requirements 8.3
   */
  test('Property 26: Wishlist Retrieval', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(courseArbitrary, { minLength: 0, maxLength: 10 }),
        async (coursesData) => {
          // Create courses
          const courses = await Promise.all(
            coursesData.map(data => EducationalCourse.create(data))
          );

          // Add courses to wishlist with delays to ensure different timestamps
          for (const course of courses) {
            await request(app)
              .post(`/wishlist/${course._id}`)
              .set('Authorization', `Bearer ${authToken}`)
              .send({ notes: `Notes for ${course.title}` });
            
            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          // Retrieve wishlist
          const response = await request(app)
            .get('/wishlist')
            .set('Authorization', `Bearer ${authToken}`);

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          const { wishlist, count } = response.body.data;

          // Verify count matches
          expect(count).toBe(courses.length);
          expect(wishlist.courses.length).toBe(courses.length);

          // Verify all courses are present
          for (const course of courses) {
            const found = wishlist.courses.find(
              item => item.course._id === course._id.toString()
            );
            expect(found).toBeTruthy();
            
            // Verify course details are populated
            if (found && found.course) {
              expect(found.course.title).toBeTruthy();
              expect(found.course.description).toBeTruthy();
              expect(found.course.category).toBeTruthy();
            }
          }

          // Verify ordering (most recent first)
          if (wishlist.courses.length > 1) {
            for (let i = 0; i < wishlist.courses.length - 1; i++) {
              const current = new Date(wishlist.courses[i].addedAt);
              const next = new Date(wishlist.courses[i + 1].addedAt);
              expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
            }
          }

          // Cleanup
          await Promise.all(courses.map(c => EducationalCourse.findByIdAndDelete(c._id)));
        }
      ),
      { numRuns: NUM_RUNS, timeout: TIMEOUT }
    );
  }, TIMEOUT);

  /**
   * Property 27: Notes Update Operation
   * 
   * For any course in the wishlist:
   * 1. Updating notes should preserve the course in the wishlist
   * 2. The notes should be updated correctly
   * 3. Other wishlist properties should remain unchanged
   * 4. Notes should be limited to 500 characters
   * 
   * Validates: Requirements 8.3
   */
  test('Property 27: Notes Update Operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        courseArbitrary,
        notesArbitrary,
        notesArbitrary,
        async (courseData, initialNotes, updatedNotes) => {
          // Create course
          const course = await EducationalCourse.create(courseData);

          // Add to wishlist with initial notes
          await request(app)
            .post(`/wishlist/${course._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ notes: initialNotes });

          // Get initial state
          const initialWishlist = await Wishlist.findOne({ user: testUser._id });
          const initialCount = initialWishlist.courses.length;
          const initialAddedAt = initialWishlist.courses[0].addedAt;

          // Update notes
          const response = await request(app)
            .post(`/wishlist/${course._id}/notes`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ notes: updatedNotes });

          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);

          // Verify notes were updated
          const updatedWishlist = await Wishlist.findOne({ user: testUser._id });
          expect(updatedWishlist.courses.length).toBe(initialCount);

          const courseItem = updatedWishlist.courses.find(
            item => item.course.toString() === course._id.toString()
          );
          expect(courseItem).toBeTruthy();
          expect(courseItem.notes).toBe(updatedNotes);
          expect(courseItem.addedAt.getTime()).toBe(initialAddedAt.getTime());

          // Cleanup
          await EducationalCourse.findByIdAndDelete(course._id);
        }
      ),
      { numRuns: NUM_RUNS, timeout: TIMEOUT }
    );
  }, TIMEOUT);

  /**
   * Property 28: Wishlist Isolation
   * 
   * For any two different users:
   * 1. User A's wishlist should not affect User B's wishlist
   * 2. Adding/removing courses for User A should not change User B's wishlist
   * 3. Each user should only see their own wishlist
   * 
   * Validates: Requirements 8.1, 8.2, 8.3
   */
  test('Property 28: Wishlist Isolation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(courseArbitrary, { minLength: 2, maxLength: 5 }),
        async (coursesData) => {
          // Create second user
          const userB = await User.create({
            fullName: 'User B',
            email: `userb${Date.now()}@example.com`,
            password: 'password123',
            role: 'job_seeker'
          });
          const tokenB = generateAuthToken(userB._id);

          // Create courses
          const courses = await Promise.all(
            coursesData.map(data => EducationalCourse.create(data))
          );

          // User A adds first half of courses
          const userACourses = courses.slice(0, Math.ceil(courses.length / 2));
          for (const course of userACourses) {
            await request(app)
              .post(`/wishlist/${course._id}`)
              .set('Authorization', `Bearer ${authToken}`)
              .send({});
          }

          // User B adds second half of courses
          const userBCourses = courses.slice(Math.ceil(courses.length / 2));
          for (const course of userBCourses) {
            await request(app)
              .post(`/wishlist/${course._id}`)
              .set('Authorization', `Bearer ${tokenB}`)
              .send({});
          }

          // Get both wishlists
          const responseA = await request(app)
            .get('/wishlist')
            .set('Authorization', `Bearer ${authToken}`);

          const responseB = await request(app)
            .get('/wishlist')
            .set('Authorization', `Bearer ${tokenB}`);

          expect(responseA.status).toBe(200);
          expect(responseB.status).toBe(200);

          const wishlistA = responseA.body.data.wishlist;
          const wishlistB = responseB.body.data.wishlist;

          // Verify isolation
          expect(wishlistA.courses.length).toBe(userACourses.length);
          expect(wishlistB.courses.length).toBe(userBCourses.length);

          // Verify User A only has their courses
          for (const course of userACourses) {
            const found = wishlistA.courses.find(
              item => item.course._id === course._id.toString()
            );
            expect(found).toBeTruthy();
          }

          // Verify User B only has their courses
          for (const course of userBCourses) {
            const found = wishlistB.courses.find(
              item => item.course._id === course._id.toString()
            );
            expect(found).toBeTruthy();
          }

          // Cleanup
          await User.findByIdAndDelete(userB._id);
          await Promise.all(courses.map(c => EducationalCourse.findByIdAndDelete(c._id)));
        }
      ),
      { numRuns: NUM_RUNS, timeout: TIMEOUT }
    );
  }, TIMEOUT);
});
