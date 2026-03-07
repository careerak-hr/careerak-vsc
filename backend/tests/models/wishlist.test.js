const mongoose = require('mongoose');
const Wishlist = require('../../src/models/Wishlist');
const User = require('../../src/models/User');
const EducationalCourse = require('../../src/models/EducationalCourse');

describe('Wishlist Model - Unit Tests', () => {
  let testUser;
  let testCourse1;
  let testCourse2;

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
    await Wishlist.deleteMany({});
    await User.deleteMany({});
    await EducationalCourse.deleteMany({});

    // Create test user
    testUser = await User.create({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'job_seeker'
    });

    // Create test courses
    testCourse1 = await EducationalCourse.create({
      title: 'Course 1',
      description: 'Description 1',
      instructor: new mongoose.Types.ObjectId(),
      category: 'Programming',
      level: 'Beginner',
      totalLessons: 10,
      totalDuration: 20,
      status: 'Published'
    });

    testCourse2 = await EducationalCourse.create({
      title: 'Course 2',
      description: 'Description 2',
      instructor: new mongoose.Types.ObjectId(),
      category: 'Design',
      level: 'Intermediate',
      totalLessons: 15,
      totalDuration: 30,
      status: 'Published'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ========== Required Fields Validation ==========

  describe('Required Fields Validation', () => {
    it('should require user field', async () => {
      const wishlist = new Wishlist({
        courses: []
      });

      await expect(wishlist.save()).rejects.toThrow();
    });

    it('should create wishlist with user', async () => {
      const wishlist = new Wishlist({
        user: testUser._id,
        courses: []
      });

      const saved = await wishlist.save();
      expect(saved._id).toBeDefined();
      expect(saved.user.toString()).toBe(testUser._id.toString());
    });

    it('should create wishlist with courses', async () => {
      const wishlist = new Wishlist({
        user: testUser._id,
        courses: [{
          course: testCourse1._id,
          notes: 'Interesting course'
        }]
      });

      const saved = await wishlist.save();
      expect(saved.courses).toHaveLength(1);
      expect(saved.courses[0].course.toString()).toBe(testCourse1._id.toString());
    });
  });

  // ========== Unique User Constraint ==========

  describe('Unique User Constraint', () => {
    it('should prevent duplicate wishlists for same user', async () => {
      // Create first wishlist
      await Wishlist.create({
        user: testUser._id,
        courses: []
      });

      // Attempt to create duplicate
      const duplicate = new Wishlist({
        user: testUser._id,
        courses: []
      });

      await expect(duplicate.save()).rejects.toThrow();
    });

    it('should allow wishlists for different users', async () => {
      const user2 = await User.create({
        fullName: 'User 2',
        email: 'user2@test.com',
        password: 'password123',
        role: 'job_seeker'
      });

      const wishlist1 = await Wishlist.create({
        user: testUser._id,
        courses: []
      });

      const wishlist2 = await Wishlist.create({
        user: user2._id,
        courses: []
      });

      expect(wishlist1._id).toBeDefined();
      expect(wishlist2._id).toBeDefined();
      expect(wishlist1._id.toString()).not.toBe(wishlist2._id.toString());
    });
  });

  // ========== Course Notes Validation ==========

  describe('Course Notes Validation', () => {
    it('should enforce maximum notes length of 500 characters', async () => {
      const longNotes = 'a'.repeat(501);

      const wishlist = new Wishlist({
        user: testUser._id,
        courses: [{
          course: testCourse1._id,
          notes: longNotes
        }]
      });

      await expect(wishlist.save()).rejects.toThrow();
    });

    it('should accept notes within 500 character limit', async () => {
      const validNotes = 'a'.repeat(500);

      const wishlist = new Wishlist({
        user: testUser._id,
        courses: [{
          course: testCourse1._id,
          notes: validNotes
        }]
      });

      const saved = await wishlist.save();
      expect(saved.courses[0].notes).toBe(validNotes);
    });

    it('should default notes to empty string', async () => {
      const wishlist = new Wishlist({
        user: testUser._id,
        courses: [{
          course: testCourse1._id
        }]
      });

      const saved = await wishlist.save();
      expect(saved.courses[0].notes).toBe('');
    });
  });

  // ========== addCourse() Method ==========

  describe('addCourse() Method', () => {
    let wishlist;

    beforeEach(async () => {
      wishlist = await Wishlist.create({
        user: testUser._id,
        courses: []
      });
    });

    it('should add course to empty wishlist', async () => {
      wishlist.addCourse(testCourse1._id, 'Great course');
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].course.toString()).toBe(testCourse1._id.toString());
      expect(wishlist.courses[0].notes).toBe('Great course');
      expect(wishlist.courses[0].addedAt).toBeDefined();
    });

    it('should add course without notes', async () => {
      wishlist.addCourse(testCourse1._id);
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].notes).toBe('');
    });

    it('should add multiple courses', async () => {
      wishlist.addCourse(testCourse1._id, 'Course 1 notes');
      wishlist.addCourse(testCourse2._id, 'Course 2 notes');
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(2);
      expect(wishlist.courses[0].course.toString()).toBe(testCourse1._id.toString());
      expect(wishlist.courses[1].course.toString()).toBe(testCourse2._id.toString());
    });

    it('should not add duplicate course', async () => {
      wishlist.addCourse(testCourse1._id, 'First add');
      wishlist.addCourse(testCourse1._id, 'Second add');
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(1);
    });

    it('should update notes when adding existing course with notes', async () => {
      wishlist.addCourse(testCourse1._id, 'Original notes');
      await wishlist.save();

      wishlist.addCourse(testCourse1._id, 'Updated notes');
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].notes).toBe('Updated notes');
    });

    it('should not update notes when adding existing course without notes', async () => {
      wishlist.addCourse(testCourse1._id, 'Original notes');
      await wishlist.save();

      wishlist.addCourse(testCourse1._id);
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].notes).toBe('Original notes');
    });
  });

  // ========== removeCourse() Method ==========

  describe('removeCourse() Method', () => {
    let wishlist;

    beforeEach(async () => {
      wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id, notes: 'Course 1' },
          { course: testCourse2._id, notes: 'Course 2' }
        ]
      });
    });

    it('should remove course from wishlist', async () => {
      wishlist.removeCourse(testCourse1._id);
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].course.toString()).toBe(testCourse2._id.toString());
    });

    it('should remove all courses', async () => {
      wishlist.removeCourse(testCourse1._id);
      wishlist.removeCourse(testCourse2._id);
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(0);
    });

    it('should handle removing non-existent course gracefully', async () => {
      const fakeCourseId = new mongoose.Types.ObjectId();
      wishlist.removeCourse(fakeCourseId);
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(2);
    });

    it('should handle removing from empty wishlist', async () => {
      wishlist.courses = [];
      await wishlist.save();

      wishlist.removeCourse(testCourse1._id);
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(0);
    });
  });

  // ========== hasCourse() Method ==========

  describe('hasCourse() Method', () => {
    let wishlist;

    beforeEach(async () => {
      wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id, notes: 'Course 1' }
        ]
      });
    });

    it('should return true for existing course', () => {
      expect(wishlist.hasCourse(testCourse1._id)).toBe(true);
    });

    it('should return false for non-existing course', () => {
      expect(wishlist.hasCourse(testCourse2._id)).toBe(false);
    });

    it('should return false for empty wishlist', async () => {
      wishlist.courses = [];
      await wishlist.save();

      expect(wishlist.hasCourse(testCourse1._id)).toBe(false);
    });

    it('should work with ObjectId strings', () => {
      expect(wishlist.hasCourse(testCourse1._id.toString())).toBe(true);
    });
  });

  // ========== getCourse() Method ==========

  describe('getCourse() Method', () => {
    let wishlist;

    beforeEach(async () => {
      wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id, notes: 'Course 1 notes' }
        ]
      });
    });

    it('should return course item when found', () => {
      const courseItem = wishlist.getCourse(testCourse1._id);

      expect(courseItem).toBeDefined();
      expect(courseItem.course.toString()).toBe(testCourse1._id.toString());
      expect(courseItem.notes).toBe('Course 1 notes');
    });

    it('should return null when course not found', () => {
      const courseItem = wishlist.getCourse(testCourse2._id);

      expect(courseItem).toBeNull();
    });

    it('should return null for empty wishlist', async () => {
      wishlist.courses = [];
      await wishlist.save();

      const courseItem = wishlist.getCourse(testCourse1._id);

      expect(courseItem).toBeNull();
    });
  });

  // ========== updateNotes() Method ==========

  describe('updateNotes() Method', () => {
    let wishlist;

    beforeEach(async () => {
      wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id, notes: 'Original notes' }
        ]
      });
    });

    it('should update notes for existing course', async () => {
      const updated = wishlist.updateNotes(testCourse1._id, 'Updated notes');
      await wishlist.save();

      expect(updated).toBe(true);
      expect(wishlist.courses[0].notes).toBe('Updated notes');
    });

    it('should return false for non-existing course', () => {
      const updated = wishlist.updateNotes(testCourse2._id, 'New notes');

      expect(updated).toBe(false);
    });

    it('should allow clearing notes', async () => {
      const updated = wishlist.updateNotes(testCourse1._id, '');
      await wishlist.save();

      expect(updated).toBe(true);
      expect(wishlist.courses[0].notes).toBe('');
    });
  });

  // ========== getCount() Method ==========

  describe('getCount() Method', () => {
    it('should return 0 for empty wishlist', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: []
      });

      expect(wishlist.getCount()).toBe(0);
    });

    it('should return correct count for wishlist with courses', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id },
          { course: testCourse2._id }
        ]
      });

      expect(wishlist.getCount()).toBe(2);
    });

    it('should update count after adding course', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: []
      });

      expect(wishlist.getCount()).toBe(0);

      wishlist.addCourse(testCourse1._id);
      expect(wishlist.getCount()).toBe(1);
    });

    it('should update count after removing course', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id },
          { course: testCourse2._id }
        ]
      });

      expect(wishlist.getCount()).toBe(2);

      wishlist.removeCourse(testCourse1._id);
      expect(wishlist.getCount()).toBe(1);
    });
  });

  // ========== Static Method Tests ==========

  describe('findOrCreate() Static Method', () => {
    it('should create new wishlist if none exists', async () => {
      const wishlist = await Wishlist.findOrCreate(testUser._id);

      expect(wishlist._id).toBeDefined();
      expect(wishlist.user.toString()).toBe(testUser._id.toString());
      expect(wishlist.courses).toHaveLength(0);
    });

    it('should return existing wishlist if one exists', async () => {
      const existing = await Wishlist.create({
        user: testUser._id,
        courses: [{ course: testCourse1._id }]
      });

      const wishlist = await Wishlist.findOrCreate(testUser._id);

      expect(wishlist._id.toString()).toBe(existing._id.toString());
      expect(wishlist.courses).toHaveLength(1);
    });
  });

  describe('addCourseToUserWishlist() Static Method', () => {
    it('should create wishlist and add course for new user', async () => {
      const wishlist = await Wishlist.addCourseToUserWishlist(
        testUser._id,
        testCourse1._id,
        'Great course'
      );

      expect(wishlist.user.toString()).toBe(testUser._id.toString());
      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].course.toString()).toBe(testCourse1._id.toString());
      expect(wishlist.courses[0].notes).toBe('Great course');
    });

    it('should add course to existing wishlist', async () => {
      await Wishlist.create({
        user: testUser._id,
        courses: [{ course: testCourse1._id }]
      });

      const wishlist = await Wishlist.addCourseToUserWishlist(
        testUser._id,
        testCourse2._id,
        'Another course'
      );

      expect(wishlist.courses).toHaveLength(2);
    });

    it('should add course without notes', async () => {
      const wishlist = await Wishlist.addCourseToUserWishlist(
        testUser._id,
        testCourse1._id
      );

      expect(wishlist.courses[0].notes).toBe('');
    });
  });

  describe('removeCourseFromUserWishlist() Static Method', () => {
    it('should remove course from user wishlist', async () => {
      await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id },
          { course: testCourse2._id }
        ]
      });

      const wishlist = await Wishlist.removeCourseFromUserWishlist(
        testUser._id,
        testCourse1._id
      );

      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].course.toString()).toBe(testCourse2._id.toString());
    });

    it('should throw error if wishlist not found', async () => {
      await expect(
        Wishlist.removeCourseFromUserWishlist(testUser._id, testCourse1._id)
      ).rejects.toThrow(/Wishlist not found/);
    });
  });

  describe('userHasCourse() Static Method', () => {
    it('should return true if user has course in wishlist', async () => {
      await Wishlist.create({
        user: testUser._id,
        courses: [{ course: testCourse1._id }]
      });

      const hasCourse = await Wishlist.userHasCourse(testUser._id, testCourse1._id);

      expect(hasCourse).toBe(true);
    });

    it('should return false if user does not have course', async () => {
      await Wishlist.create({
        user: testUser._id,
        courses: [{ course: testCourse1._id }]
      });

      const hasCourse = await Wishlist.userHasCourse(testUser._id, testCourse2._id);

      expect(hasCourse).toBe(false);
    });

    it('should return false if user has no wishlist', async () => {
      const hasCourse = await Wishlist.userHasCourse(testUser._id, testCourse1._id);

      expect(hasCourse).toBe(false);
    });
  });

  // ========== Virtual Tests ==========

  describe('courseCount Virtual', () => {
    it('should return 0 for empty wishlist', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: []
      });

      expect(wishlist.courseCount).toBe(0);
    });

    it('should return correct count', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [
          { course: testCourse1._id },
          { course: testCourse2._id }
        ]
      });

      expect(wishlist.courseCount).toBe(2);
    });

    it('should be included in JSON output', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [{ course: testCourse1._id }]
      });

      const json = wishlist.toJSON();
      expect(json.courseCount).toBe(1);
    });
  });

  // ========== Default Values Tests ==========

  describe('Default Values', () => {
    it('should set addedAt to current date when adding course', async () => {
      const before = new Date();
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [{ course: testCourse1._id }]
      });
      const after = new Date();

      const addedAt = wishlist.courses[0].addedAt;
      expect(addedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(addedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should initialize empty courses array', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id
      });

      expect(wishlist.courses).toEqual([]);
    });
  });

  // ========== Edge Cases ==========

  describe('Edge Cases', () => {
    it('should handle adding same course multiple times in one operation', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: []
      });

      wishlist.addCourse(testCourse1._id, 'First');
      wishlist.addCourse(testCourse1._id, 'Second');
      wishlist.addCourse(testCourse1._id, 'Third');
      await wishlist.save();

      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].notes).toBe('Third');
    });

    it('should handle removing and re-adding same course', async () => {
      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses: [{ course: testCourse1._id, notes: 'Original' }]
      });

      wishlist.removeCourse(testCourse1._id);
      await wishlist.save();
      expect(wishlist.courses).toHaveLength(0);

      wishlist.addCourse(testCourse1._id, 'Re-added');
      await wishlist.save();
      expect(wishlist.courses).toHaveLength(1);
      expect(wishlist.courses[0].notes).toBe('Re-added');
    });

    it('should handle large number of courses', async () => {
      const courses = [];
      for (let i = 0; i < 100; i++) {
        courses.push({
          course: new mongoose.Types.ObjectId(),
          notes: `Course ${i}`
        });
      }

      const wishlist = await Wishlist.create({
        user: testUser._id,
        courses
      });

      expect(wishlist.courses).toHaveLength(100);
      expect(wishlist.courseCount).toBe(100);
    });
  });
});
