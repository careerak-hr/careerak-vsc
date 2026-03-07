/**
 * Unit Tests: EducationalCourse Model Enhancement Fields
 * 
 * Tests the new enhancement fields added to the EducationalCourse model
 */

const mongoose = require('mongoose');
const EducationalCourse = require('../../models/EducationalCourse');

describe('EducationalCourse Model - Enhancement Fields', () => {
  
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak_test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });
  
  afterAll(async () => {
    // Clean up and close connection
    await EducationalCourse.deleteMany({});
    await mongoose.connection.close();
  });
  
  afterEach(async () => {
    // Clean up after each test
    await EducationalCourse.deleteMany({});
  });
  
  describe('Price Field', () => {
    it('should create course with default free pricing', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming'
      });
      
      expect(course.price).toBeDefined();
      expect(course.price.amount).toBe(0);
      expect(course.price.currency).toBe('USD');
      expect(course.price.isFree).toBe(true);
    });
    
    it('should create course with paid pricing', async () => {
      const course = await EducationalCourse.create({
        title: 'Paid Course',
        description: 'Test Description',
        category: 'Programming',
        price: {
          amount: 99.99,
          currency: 'USD',
          isFree: false
        }
      });
      
      expect(course.price.amount).toBe(99.99);
      expect(course.price.isFree).toBe(false);
    });
  });
  
  describe('Topics, Prerequisites, and Learning Outcomes', () => {
    it('should store topics array', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        topics: ['JavaScript', 'React', 'Node.js']
      });
      
      expect(course.topics).toHaveLength(3);
      expect(course.topics).toContain('JavaScript');
    });
    
    it('should store prerequisites array', async () => {
      const course = await EducationalCourse.create({
        title: 'Advanced Course',
        description: 'Test Description',
        category: 'Programming',
        prerequisites: ['Basic JavaScript', 'HTML/CSS']
      });
      
      expect(course.prerequisites).toHaveLength(2);
      expect(course.prerequisites).toContain('Basic JavaScript');
    });
    
    it('should store learning outcomes array', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        learningOutcomes: [
          'Build web applications',
          'Understand React hooks',
          'Deploy to production'
        ]
      });
      
      expect(course.learningOutcomes).toHaveLength(3);
      expect(course.learningOutcomes[0]).toBe('Build web applications');
    });
  });
  
  describe('Course Metrics', () => {
    it('should initialize with default totalLessons and totalDuration', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming'
      });
      
      expect(course.totalLessons).toBe(0);
      expect(course.totalDuration).toBe(0);
    });
    
    it('should store totalLessons and totalDuration', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        totalLessons: 25,
        totalDuration: 10.5
      });
      
      expect(course.totalLessons).toBe(25);
      expect(course.totalDuration).toBe(10.5);
    });
  });
  
  describe('Media Fields', () => {
    it('should store thumbnail and previewVideo URLs', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        thumbnail: 'https://example.com/thumbnail.jpg',
        previewVideo: 'https://example.com/preview.mp4'
      });
      
      expect(course.thumbnail).toBe('https://example.com/thumbnail.jpg');
      expect(course.previewVideo).toBe('https://example.com/preview.mp4');
    });
  });
  
  describe('Syllabus Field', () => {
    it('should store syllabus with sections and lessons', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        syllabus: [
          {
            section: 'Introduction',
            lessons: [
              { title: 'Welcome', duration: 5, isFree: true },
              { title: 'Setup', duration: 10, isFree: true }
            ]
          },
          {
            section: 'Advanced Topics',
            lessons: [
              { title: 'Deep Dive', duration: 30, isFree: false }
            ]
          }
        ]
      });
      
      expect(course.syllabus).toHaveLength(2);
      expect(course.syllabus[0].section).toBe('Introduction');
      expect(course.syllabus[0].lessons).toHaveLength(2);
      expect(course.syllabus[0].lessons[0].title).toBe('Welcome');
      expect(course.syllabus[0].lessons[0].isFree).toBe(true);
    });
  });
  
  describe('Instructor Info Field', () => {
    it('should store instructor information', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        instructorInfo: {
          bio: 'Experienced developer with 10 years',
          credentials: ['PhD Computer Science', 'AWS Certified'],
          socialLinks: {
            linkedin: 'https://linkedin.com/in/instructor',
            twitter: 'https://twitter.com/instructor',
            website: 'https://instructor.com'
          }
        }
      });
      
      expect(course.instructorInfo.bio).toBe('Experienced developer with 10 years');
      expect(course.instructorInfo.credentials).toHaveLength(2);
      expect(course.instructorInfo.socialLinks.linkedin).toBe('https://linkedin.com/in/instructor');
    });
  });
  
  describe('Stats Field', () => {
    it('should initialize with default stats', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming'
      });
      
      expect(course.stats.totalEnrollments).toBe(0);
      expect(course.stats.activeEnrollments).toBe(0);
      expect(course.stats.completionRate).toBe(0);
      expect(course.stats.averageRating).toBe(0);
      expect(course.stats.totalReviews).toBe(0);
      expect(course.stats.previewViews).toBe(0);
    });
    
    it('should update stats values', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        stats: {
          totalEnrollments: 100,
          activeEnrollments: 80,
          completionRate: 75,
          averageRating: 4.5,
          totalReviews: 50,
          previewViews: 500
        }
      });
      
      expect(course.stats.totalEnrollments).toBe(100);
      expect(course.stats.averageRating).toBe(4.5);
      expect(course.stats.completionRate).toBe(75);
    });
  });
  
  describe('Badges Field', () => {
    it('should store badges array', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        badges: [
          { type: 'most_popular', awardedAt: new Date() },
          { type: 'recommended', awardedAt: new Date() }
        ]
      });
      
      expect(course.badges).toHaveLength(2);
      expect(course.badges[0].type).toBe('most_popular');
      expect(course.badges[1].type).toBe('recommended');
    });
    
    it('should only accept valid badge types', async () => {
      await expect(
        EducationalCourse.create({
          title: 'Test Course',
          description: 'Test Description',
          category: 'Programming',
          badges: [{ type: 'invalid_badge' }]
        })
      ).rejects.toThrow();
    });
  });
  
  describe('Settings Field', () => {
    it('should initialize with default settings', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming'
      });
      
      expect(course.settings.allowReviews).toBe(true);
      expect(course.settings.certificateEnabled).toBe(true);
      expect(course.settings.autoEnroll).toBe(false);
    });
    
    it('should store custom settings', async () => {
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        settings: {
          allowReviews: false,
          certificateEnabled: false,
          autoEnroll: true
        }
      });
      
      expect(course.settings.allowReviews).toBe(false);
      expect(course.settings.certificateEnabled).toBe(false);
      expect(course.settings.autoEnroll).toBe(true);
    });
  });
  
  describe('PublishedAt Field', () => {
    it('should store publishedAt date', async () => {
      const publishDate = new Date('2024-01-01');
      const course = await EducationalCourse.create({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Programming',
        status: 'Published',
        publishedAt: publishDate
      });
      
      expect(course.publishedAt).toEqual(publishDate);
    });
  });
  
  describe('Indexes', () => {
    it('should have index definitions in schema', () => {
      const indexes = EducationalCourse.schema.indexes();
      
      // Should have multiple indexes defined
      expect(indexes.length).toBeGreaterThan(0);
      
      // Check for some key indexes
      const hasLevelCategoryIndex = indexes.some(
        index => index[0].level && index[0].category
      );
      expect(hasLevelCategoryIndex).toBe(true);
      
      const hasPriceIndex = indexes.some(
        index => index[0]['price.isFree']
      );
      expect(hasPriceIndex).toBe(true);
      
      const hasRatingIndex = indexes.some(
        index => index[0]['stats.averageRating']
      );
      expect(hasRatingIndex).toBe(true);
      
      const hasTextIndex = indexes.some(
        index => index[0].title === 'text' || index[0].description === 'text' || index[0].topics === 'text'
      );
      expect(hasTextIndex).toBe(true);
    });
  });
  
  describe('Backward Compatibility', () => {
    it('should work with existing course structure', async () => {
      // Create course with only original fields
      const course = await EducationalCourse.create({
        title: 'Legacy Course',
        description: 'Test Description',
        category: 'Programming',
        level: 'Beginner',
        status: 'Published'
      });
      
      // Should have default values for new fields
      expect(course.price.isFree).toBe(true);
      expect(course.stats.totalEnrollments).toBe(0);
      expect(course.settings.allowReviews).toBe(true);
      expect(course.topics).toEqual([]);
    });
  });
});
