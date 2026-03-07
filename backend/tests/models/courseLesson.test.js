const mongoose = require('mongoose');
const CourseLesson = require('../../src/models/CourseLesson');
const EducationalCourse = require('../../src/models/EducationalCourse');

describe('CourseLesson Model - Unit Tests', () => {
  let testCourse;

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
    await CourseLesson.deleteMany({});
    await EducationalCourse.deleteMany({});

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
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ========== Required Fields Validation ==========

  describe('Required Fields Validation', () => {
    it('should require course field', async () => {
      const lesson = new CourseLesson({
        title: 'Test Lesson',
        order: 1,
        content: 'video'
      });

      await expect(lesson.save()).rejects.toThrow(/Course is required/);
    });

    it('should require title field', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        order: 1,
        content: 'video'
      });

      await expect(lesson.save()).rejects.toThrow(/Lesson title is required/);
    });

    it('should require order field', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        content: 'video'
      });

      await expect(lesson.save()).rejects.toThrow(/Lesson order is required/);
    });

    it('should require content type field', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1
      });

      await expect(lesson.save()).rejects.toThrow(/Content type is required/);
    });

    it('should create lesson with all required fields', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4'
      });

      const saved = await lesson.save();
      expect(saved._id).toBeDefined();
      expect(saved.title).toBe('Test Lesson');
    });
  });

  // ========== Order Validation ==========

  describe('Order Field Validation', () => {
    it('should enforce minimum order of 1', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 0,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4'
      });

      await expect(lesson.save()).rejects.toThrow(/Lesson order must be at least 1/);
    });

    it('should reject negative order values', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: -1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4'
      });

      await expect(lesson.save()).rejects.toThrow();
    });

    it('should accept valid positive order values', async () => {
      const validOrders = [1, 5, 10, 100];

      for (const order of validOrders) {
        const lesson = new CourseLesson({
          course: testCourse._id,
          title: `Lesson ${order}`,
          order,
          content: 'text',
          textContent: 'Content'
        });

        const saved = await lesson.save();
        expect(saved.order).toBe(order);
        await CourseLesson.deleteMany({});
      }
    });
  });

  // ========== Order Uniqueness Validation ==========

  describe('Order Uniqueness Within Course', () => {
    it('should prevent duplicate order within same course', async () => {
      // Create first lesson
      await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 1',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video1.mp4'
      });

      // Attempt to create lesson with same order
      const duplicate = new CourseLesson({
        course: testCourse._id,
        title: 'Lesson 2',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video2.mp4'
      });

      await expect(duplicate.save()).rejects.toThrow(/A lesson with order 1 already exists/);
    });

    it('should allow same order in different courses', async () => {
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

      const lesson1 = await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 1',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video1.mp4'
      });

      const lesson2 = await CourseLesson.create({
        course: course2._id,
        title: 'Lesson 1',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video2.mp4'
      });

      expect(lesson1._id).toBeDefined();
      expect(lesson2._id).toBeDefined();
      expect(lesson1._id.toString()).not.toBe(lesson2._id.toString());
    });

    it('should allow different orders in same course', async () => {
      const lesson1 = await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 1',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video1.mp4'
      });

      const lesson2 = await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 2',
        order: 2,
        content: 'video',
        videoUrl: 'https://example.com/video2.mp4'
      });

      expect(lesson1._id).toBeDefined();
      expect(lesson2._id).toBeDefined();
      expect(lesson1.order).toBe(1);
      expect(lesson2.order).toBe(2);
    });

    it('should allow updating lesson without changing order', async () => {
      const lesson = await CourseLesson.create({
        course: testCourse._id,
        title: 'Original Title',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4'
      });

      lesson.title = 'Updated Title';
      await lesson.save();

      expect(lesson.title).toBe('Updated Title');
      expect(lesson.order).toBe(1);
    });

    it('should prevent changing order to existing order', async () => {
      await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 1',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video1.mp4'
      });

      const lesson2 = await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 2',
        order: 2,
        content: 'video',
        videoUrl: 'https://example.com/video2.mp4'
      });

      lesson2.order = 1;
      await expect(lesson2.save()).rejects.toThrow(/A lesson with order 1 already exists/);
    });
  });

  // ========== Content Type Enum Validation ==========

  describe('Content Type Enum Validation', () => {
    it('should accept valid content types', async () => {
      const validTypes = ['video', 'text', 'quiz', 'assignment', 'resource'];

      for (const type of validTypes) {
        const lesson = new CourseLesson({
          course: testCourse._id,
          title: `${type} Lesson`,
          order: 1,
          content: type,
          ...(type === 'video' && { videoUrl: 'https://example.com/video.mp4' }),
          ...(type === 'text' && { textContent: 'Some text content' }),
          ...(type === 'quiz' && { 
            quiz: { 
              questions: [{ 
                question: 'Q1', 
                options: ['A', 'B'], 
                correctAnswer: 0 
              }] 
            } 
          })
        });

        const saved = await lesson.save();
        expect(saved.content).toBe(type);
        await CourseLesson.deleteMany({});
      }
    });

    it('should reject invalid content types', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1,
        content: 'invalid_type'
      });

      await expect(lesson.save()).rejects.toThrow();
    });
  });

  // ========== Content-Specific Validation ==========

  describe('Video Content Validation', () => {
    it('should require videoUrl for video content', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Video Lesson',
        order: 1,
        content: 'video'
      });

      await expect(lesson.save()).rejects.toThrow(/Video URL is required/);
    });

    it('should accept video lesson with videoUrl', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Video Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4'
      });

      const saved = await lesson.save();
      expect(saved.videoUrl).toBe('https://example.com/video.mp4');
    });
  });

  describe('Text Content Validation', () => {
    it('should require textContent for text content type', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Text Lesson',
        order: 1,
        content: 'text'
      });

      await expect(lesson.save()).rejects.toThrow(/Text content is required/);
    });

    it('should accept text lesson with textContent', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Text Lesson',
        order: 1,
        content: 'text',
        textContent: 'This is the lesson content'
      });

      const saved = await lesson.save();
      expect(saved.textContent).toBe('This is the lesson content');
    });
  });

  describe('Quiz Content Validation', () => {
    it('should require at least one question for quiz content', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Quiz Lesson',
        order: 1,
        content: 'quiz'
      });

      await expect(lesson.save()).rejects.toThrow(/At least one quiz question is required/);
    });

    it('should require at least 2 options per question', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Quiz Lesson',
        order: 1,
        content: 'quiz',
        quiz: {
          questions: [{
            question: 'What is 2+2?',
            options: ['4'], // Only 1 option
            correctAnswer: 0
          }]
        }
      });

      await expect(lesson.save()).rejects.toThrow(/must have at least 2 options/);
    });

    it('should validate correctAnswer is within options range', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Quiz Lesson',
        order: 1,
        content: 'quiz',
        quiz: {
          questions: [{
            question: 'What is 2+2?',
            options: ['3', '4', '5'],
            correctAnswer: 5 // Out of range
          }]
        }
      });

      await expect(lesson.save()).rejects.toThrow(/Correct answer index .* is out of range/);
    });

    it('should accept valid quiz with multiple questions', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Quiz Lesson',
        order: 1,
        content: 'quiz',
        quiz: {
          questions: [
            {
              question: 'What is 2+2?',
              options: ['3', '4', '5'],
              correctAnswer: 1,
              explanation: 'Basic math'
            },
            {
              question: 'What is 3+3?',
              options: ['5', '6', '7'],
              correctAnswer: 1
            }
          ],
          passingScore: 70
        }
      });

      const saved = await lesson.save();
      expect(saved.quiz.questions).toHaveLength(2);
      expect(saved.quiz.passingScore).toBe(70);
    });
  });

  // ========== Duration Validation ==========

  describe('Duration Validation', () => {
    it('should reject negative duration', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1,
        content: 'text',
        textContent: 'Content',
        duration: -10
      });

      await expect(lesson.save()).rejects.toThrow(/Duration cannot be negative/);
    });

    it('should accept zero duration', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1,
        content: 'text',
        textContent: 'Content',
        duration: 0
      });

      const saved = await lesson.save();
      expect(saved.duration).toBe(0);
    });

    it('should default duration to 0', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1,
        content: 'text',
        textContent: 'Content'
      });

      const saved = await lesson.save();
      expect(saved.duration).toBe(0);
    });

    it('should accept positive duration values', async () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4',
        duration: 45
      });

      const saved = await lesson.save();
      expect(saved.duration).toBe(45);
    });
  });

  // ========== Method Tests ==========

  describe('isPreview() Method', () => {
    it('should return true for free lessons', () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Free Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4',
        isFree: true
      });

      expect(lesson.isPreview()).toBe(true);
    });

    it('should return false for paid lessons', () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Paid Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4',
        isFree: false
      });

      expect(lesson.isPreview()).toBe(false);
    });

    it('should default to false', () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4'
      });

      expect(lesson.isPreview()).toBe(false);
    });
  });

  describe('calculateQuizScore() Method', () => {
    let quizLesson;

    beforeEach(() => {
      quizLesson = new CourseLesson({
        course: testCourse._id,
        title: 'Quiz Lesson',
        order: 1,
        content: 'quiz',
        quiz: {
          questions: [
            { question: 'Q1', options: ['A', 'B', 'C'], correctAnswer: 1 },
            { question: 'Q2', options: ['A', 'B', 'C'], correctAnswer: 0 },
            { question: 'Q3', options: ['A', 'B', 'C'], correctAnswer: 2 },
            { question: 'Q4', options: ['A', 'B', 'C'], correctAnswer: 1 }
          ],
          passingScore: 75
        }
      });
    });

    it('should throw error for non-quiz lessons', () => {
      const textLesson = new CourseLesson({
        course: testCourse._id,
        title: 'Text Lesson',
        order: 1,
        content: 'text',
        textContent: 'Content'
      });

      expect(() => textLesson.calculateQuizScore([0, 1])).toThrow(/does not have a quiz/);
    });

    it('should throw error for invalid number of answers', () => {
      expect(() => quizLesson.calculateQuizScore([0, 1])).toThrow(/Invalid number of answers/);
    });

    it('should calculate 100% score for all correct answers', () => {
      const result = quizLesson.calculateQuizScore([1, 0, 2, 1]);

      expect(result.correctCount).toBe(4);
      expect(result.totalQuestions).toBe(4);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('should calculate 0% score for all wrong answers', () => {
      const result = quizLesson.calculateQuizScore([0, 1, 0, 0]);

      expect(result.correctCount).toBe(0);
      expect(result.totalQuestions).toBe(4);
      expect(result.percentage).toBe(0);
      expect(result.passed).toBe(false);
    });

    it('should calculate partial score correctly', () => {
      const result = quizLesson.calculateQuizScore([1, 0, 0, 1]);

      expect(result.correctCount).toBe(2);
      expect(result.totalQuestions).toBe(4);
      expect(result.percentage).toBe(50);
      expect(result.passed).toBe(false);
    });

    it('should mark as passed when score equals passing score', () => {
      const result = quizLesson.calculateQuizScore([1, 0, 2, 0]);

      expect(result.correctCount).toBe(3);
      expect(result.percentage).toBe(75);
      expect(result.passed).toBe(true);
    });

    it('should mark as passed when score exceeds passing score', () => {
      const result = quizLesson.calculateQuizScore([1, 0, 2, 1]);

      expect(result.correctCount).toBe(4);
      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
    });
  });

  // ========== Static Method Tests ==========

  describe('getLessonsByCourse() Static Method', () => {
    it('should return lessons ordered by order field', async () => {
      await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 3',
        order: 3,
        content: 'text',
        textContent: 'Content 3'
      });

      await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 1',
        order: 1,
        content: 'text',
        textContent: 'Content 1'
      });

      await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 2',
        order: 2,
        content: 'text',
        textContent: 'Content 2'
      });

      const lessons = await CourseLesson.getLessonsByCourse(testCourse._id);

      expect(lessons).toHaveLength(3);
      expect(lessons[0].order).toBe(1);
      expect(lessons[1].order).toBe(2);
      expect(lessons[2].order).toBe(3);
    });

    it('should return empty array for course with no lessons', async () => {
      const lessons = await CourseLesson.getLessonsByCourse(testCourse._id);

      expect(lessons).toHaveLength(0);
    });
  });

  describe('getPreviewLessons() Static Method', () => {
    it('should return only free lessons', async () => {
      await CourseLesson.create({
        course: testCourse._id,
        title: 'Free Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video1.mp4',
        isFree: true
      });

      await CourseLesson.create({
        course: testCourse._id,
        title: 'Paid Lesson',
        order: 2,
        content: 'video',
        videoUrl: 'https://example.com/video2.mp4',
        isFree: false
      });

      const previewLessons = await CourseLesson.getPreviewLessons(testCourse._id);

      expect(previewLessons).toHaveLength(1);
      expect(previewLessons[0].isFree).toBe(true);
      expect(previewLessons[0].title).toBe('Free Lesson');
    });

    it('should return empty array when no free lessons', async () => {
      await CourseLesson.create({
        course: testCourse._id,
        title: 'Paid Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4',
        isFree: false
      });

      const previewLessons = await CourseLesson.getPreviewLessons(testCourse._id);

      expect(previewLessons).toHaveLength(0);
    });
  });

  describe('countLessons() Static Method', () => {
    it('should return correct count of lessons', async () => {
      await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 1',
        order: 1,
        content: 'text',
        textContent: 'Content 1'
      });

      await CourseLesson.create({
        course: testCourse._id,
        title: 'Lesson 2',
        order: 2,
        content: 'text',
        textContent: 'Content 2'
      });

      const count = await CourseLesson.countLessons(testCourse._id);

      expect(count).toBe(2);
    });

    it('should return 0 for course with no lessons', async () => {
      const count = await CourseLesson.countLessons(testCourse._id);

      expect(count).toBe(0);
    });
  });

  // ========== Virtual Tests ==========

  describe('Virtuals', () => {
    it('should calculate durationInHours correctly', () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Test Lesson',
        order: 1,
        content: 'video',
        videoUrl: 'https://example.com/video.mp4',
        duration: 90 // 90 minutes
      });

      expect(lesson.durationInHours).toBe(1.5);
    });

    it('should return quizQuestionCount for quiz lessons', () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Quiz Lesson',
        order: 1,
        content: 'quiz',
        quiz: {
          questions: [
            { question: 'Q1', options: ['A', 'B'], correctAnswer: 0 },
            { question: 'Q2', options: ['A', 'B'], correctAnswer: 1 }
          ]
        }
      });

      expect(lesson.quizQuestionCount).toBe(2);
    });

    it('should return 0 quizQuestionCount for non-quiz lessons', () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Text Lesson',
        order: 1,
        content: 'text',
        textContent: 'Content'
      });

      expect(lesson.quizQuestionCount).toBe(0);
    });

    it('should return resourceCount', () => {
      const lesson = new CourseLesson({
        course: testCourse._id,
        title: 'Resource Lesson',
        order: 1,
        content: 'resource',
        resources: [
          { title: 'PDF', url: 'https://example.com/file.pdf', type: 'pdf' },
          { title: 'Link', url: 'https://example.com', type: 'link' }
        ]
      });

      expect(lesson.resourceCount).toBe(2);
    });
  });
});
