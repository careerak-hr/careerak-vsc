/**
 * Unit Tests for Wishlist Controller
 * 
 * Tests specific functionality and edge cases for wishlist operations
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');
const Wishlist = require('../src/models/Wishlist');
const jwt = require('jsonwebtoken');

// Helper function to generate auth token
const generateAuthToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

describe('Wishlist Controller - Unit Tests', () => {
  let testUser;
  let authToken;
  let testCourse;

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

    // Create test course
    testCourse = await EducationalCourse.create({
      title: 'Test Course',
      description: 'Test course description',
      category: 'Programming',
      level: 'Beginner',
      status: 'Published',
      price: {
        amount: 99,
        currency: 'USD',
        isFree: false
      },
      totalDuration: 10,
      totalLessons: 20,
      stats: {
        totalEnrollments: 100,
        averageRating: 4.5,
        totalReviews: 50
      }
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /wishlist', () => {
    test('should return empty wishlist for new user', async () => {
      const response = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wishlist.courses).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });

    test('should return wishlist with populated course details', async () => {
      // Add course to wishlist
      await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Test notes' });

      // Get wishlist
      const response = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(1);
      
      const courseItem = response.body.data.wishlist.courses[0];
      expect(courseItem.course.title).toBe('Test Course');
      expect(courseItem.course.description).toBe('Test course description');
      expect(courseItem.notes).toBe('Test notes');
      expect(courseItem.addedAt).toBeTruthy();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/wishlist');

      expect(response.status).toBe(401);
    });

    test('should filter out deleted courses', async () => {
      // Add course to wishlist
      await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // Delete the course
      await EducationalCourse.findByIdAndDelete(testCourse._id);

      // Get wishlist
      const response = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('POST /wishlist/:courseId', () => {
    test('should add course to wishlist successfully', async () => {
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Interesting course' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('added to wishlist');
      expect(response.body.data.addedCourse.notes).toBe('Interesting course');
    });

    test('should handle duplicate adds gracefully', async () => {
      // First add
      await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'First notes' });

      // Second add (duplicate)
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Updated notes' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('already in wishlist');
      expect(response.body.data.addedCourse.notes).toBe('Updated notes');

      // Verify only one entry exists
      const wishlist = await Wishlist.findOne({ user: testUser._id });
      expect(wishlist.courses.length).toBe(1);
    });

    test('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/wishlist/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    test('should reject unpublished courses', async () => {
      // Create draft course
      const draftCourse = await EducationalCourse.create({
        title: 'Draft Course',
        description: 'Draft description',
        category: 'Programming',
        level: 'Beginner',
        status: 'Draft'
      });

      const response = await request(app)
        .post(`/wishlist/${draftCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('unpublished');
    });

    test('should add course without notes', async () => {
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.data.addedCourse.notes).toBe('');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /wishlist/:courseId', () => {
    beforeEach(async () => {
      // Add course to wishlist before each test
      await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Test notes' });
    });

    test('should remove course from wishlist successfully', async () => {
      const response = await request(app)
        .delete(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed');
      expect(response.body.data.count).toBe(0);
    });

    test('should return 404 for non-existent course', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/wishlist/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found in wishlist');
    });

    test('should return 404 if wishlist does not exist', async () => {
      // Delete wishlist
      await Wishlist.deleteOne({ user: testUser._id });

      const response = await request(app)
        .delete(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Wishlist not found');
    });

    test('should preserve other courses when removing one', async () => {
      // Add second course
      const course2 = await EducationalCourse.create({
        title: 'Course 2',
        description: 'Description 2',
        category: 'Design',
        level: 'Intermediate',
        status: 'Published'
      });

      await request(app)
        .post(`/wishlist/${course2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // Remove first course
      const response = await request(app)
        .delete(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(1);

      // Verify second course still exists
      const wishlist = await Wishlist.findOne({ user: testUser._id });
      expect(wishlist.courses.length).toBe(1);
      expect(wishlist.courses[0].course.toString()).toBe(course2._id.toString());
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/wishlist/${testCourse._id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /wishlist/:courseId/notes', () => {
    beforeEach(async () => {
      // Add course to wishlist before each test
      await request(app)
        .post(`/wishlist/${testCourse._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Initial notes' });
    });

    test('should update notes successfully', async () => {
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Updated notes' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated');
      expect(response.body.data.wishlistItem.notes).toBe('Updated notes');
    });

    test('should allow empty notes', async () => {
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: '' });

      expect(response.status).toBe(200);
      expect(response.body.data.wishlistItem.notes).toBe('');
    });

    test('should reject notes exceeding 500 characters', async () => {
      const longNotes = 'a'.repeat(501);
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: longNotes });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('500 characters');
    });

    test('should require notes field', async () => {
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required');
    });

    test('should return 404 for course not in wishlist', async () => {
      const course2 = await EducationalCourse.create({
        title: 'Course 2',
        description: 'Description 2',
        category: 'Design',
        level: 'Intermediate',
        status: 'Published'
      });

      const response = await request(app)
        .post(`/wishlist/${course2._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'New notes' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found in wishlist');
    });

    test('should return 404 if wishlist does not exist', async () => {
      // Delete wishlist
      await Wishlist.deleteOne({ user: testUser._id });

      const response = await request(app)
        .post(`/wishlist/${testCourse._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'New notes' });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Wishlist not found');
    });

    test('should preserve other wishlist properties', async () => {
      // Get initial state
      const initialWishlist = await Wishlist.findOne({ user: testUser._id });
      const initialAddedAt = initialWishlist.courses[0].addedAt;

      // Update notes
      await request(app)
        .post(`/wishlist/${testCourse._id}/notes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Updated notes' });

      // Verify other properties unchanged
      const updatedWishlist = await Wishlist.findOne({ user: testUser._id });
      expect(updatedWishlist.courses[0].addedAt.getTime()).toBe(initialAddedAt.getTime());
      expect(updatedWishlist.courses[0].course.toString()).toBe(testCourse._id.toString());
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/wishlist/${testCourse._id}/notes`)
        .send({ notes: 'New notes' });

      expect(response.status).toBe(401);
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid course ID format', async () => {
      const response = await request(app)
        .post('/wishlist/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(500);
    });

    test('should handle concurrent adds to wishlist', async () => {
      // Create multiple courses
      const courses = await Promise.all([
        EducationalCourse.create({
          title: 'Course 1',
          description: 'Description 1',
          category: 'Programming',
          level: 'Beginner',
          status: 'Published'
        }),
        EducationalCourse.create({
          title: 'Course 2',
          description: 'Description 2',
          category: 'Design',
          level: 'Intermediate',
          status: 'Published'
        }),
        EducationalCourse.create({
          title: 'Course 3',
          description: 'Description 3',
          category: 'Business',
          level: 'Advanced',
          status: 'Published'
        })
      ]);

      // Add all courses concurrently
      const responses = await Promise.all(
        courses.map(course =>
          request(app)
            .post(`/wishlist/${course._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
        )
      );

      // Verify all succeeded
      responses.forEach(response => {
        expect([201, 200]).toContain(response.status);
      });

      // Verify all courses in wishlist
      const wishlist = await Wishlist.findOne({ user: testUser._id });
      expect(wishlist.courses.length).toBe(3);
    });

    test('should handle large wishlist (100+ courses)', async () => {
      // Create 100 courses
      const courses = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          EducationalCourse.create({
            title: `Course ${i}`,
            description: `Description ${i}`,
            category: 'Programming',
            level: 'Beginner',
            status: 'Published'
          })
        )
      );

      // Add all to wishlist
      for (const course of courses) {
        await request(app)
          .post(`/wishlist/${course._id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({});
      }

      // Get wishlist
      const response = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(100);
    }, 60000); // Increase timeout for this test
  });
});
