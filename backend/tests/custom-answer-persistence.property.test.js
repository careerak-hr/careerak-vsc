/**
 * Property-Based Test: Custom Answer Persistence
 * Feature: apply-page-enhancements
 * Property 14: Custom answer persistence
 * 
 * Validates: Requirements 8.6
 * 
 * Property: For any custom question answer provided by an applicant,
 * the answer should be stored with the application data and correctly
 * displayed to the employer when viewing the application.
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');
const { User } = require('../src/models/User');

describe('Feature: apply-page-enhancements, Property 14: Custom answer persistence', () => {
  let testUser;
  let testJobPosting;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test Applicant',
      email: `test-${Date.now()}@example.com`,
      password: 'hashedpassword123',
      phone: '+1234567890',
      role: 'Employee'
    });
  });

  afterEach(async () => {
    // Clean up test data
    await JobApplication.deleteMany({ applicant: testUser._id });
    await JobPosting.deleteMany({});
    await User.deleteMany({ _id: testUser._id });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * Arbitrary: Generate random custom questions
   */
  const customQuestionArbitrary = fc.record({
    id: fc.uuid(),
    questionText: fc.string({ minLength: 10, maxLength: 200 }),
    questionType: fc.constantFrom('short_text', 'long_text', 'single_choice', 'multiple_choice', 'yes_no'),
    required: fc.boolean(),
    order: fc.integer({ min: 1, max: 5 })
  }).chain(question => {
    // Add options for choice questions
    if (question.questionType === 'single_choice' || question.questionType === 'multiple_choice') {
      return fc.constant({
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        required: question.required,
        order: question.order,
        options: ['Option A', 'Option B', 'Option C']
      });
    }
    return fc.constant(question);
  });

  /**
   * Arbitrary: Generate random custom answers based on question type
   */
  const customAnswerArbitrary = (question) => {
    const baseAnswer = {
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType
    };

    switch (question.questionType) {
      case 'short_text':
        return fc.record({
          ...baseAnswer,
          answer: fc.string({ minLength: 1, maxLength: 100 })
        });
      
      case 'long_text':
        return fc.record({
          ...baseAnswer,
          answer: fc.string({ minLength: 10, maxLength: 1000 })
        });
      
      case 'single_choice':
        return fc.record({
          ...baseAnswer,
          answer: fc.constantFrom(...question.options)
        });
      
      case 'multiple_choice':
        return fc.record({
          ...baseAnswer,
          answer: fc.subarray(question.options, { minLength: 1, maxLength: question.options.length })
        });
      
      case 'yes_no':
        return fc.record({
          ...baseAnswer,
          answer: fc.boolean()
        });
      
      default:
        return fc.constant(baseAnswer);
    }
  };

  test('Property 14: Custom answers persist correctly for all question types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(customQuestionArbitrary, { minLength: 1, maxLength: 5 }),
        async (customQuestions) => {
          // Create job posting with custom questions
          testJobPosting = await JobPosting.create({
            title: 'Test Job',
            company: new mongoose.Types.ObjectId(),
            postedBy: testUser._id,
            description: 'Test description',
            requirements: 'Test requirements',
            location: { city: 'Test City', country: 'Test Country' },
            salary: { min: 3000, max: 5000, currency: 'USD' },
            employmentType: 'Full-time',
            customQuestions: customQuestions
          });

          // Generate answers for all questions
          const customAnswersPromises = customQuestions.map(question =>
            fc.sample(customAnswerArbitrary(question), 1)[0]
          );
          const customAnswers = await Promise.all(customAnswersPromises);

          // Create application with custom answers
          const application = await JobApplication.create({
            jobPosting: testJobPosting._id,
            applicant: testUser._id,
            fullName: testUser.name,
            email: testUser.email,
            phone: '+1234567890',
            customAnswers: customAnswers,
            status: 'Submitted'
          });

          // Retrieve application (simulating employer view)
          const retrievedApplication = await JobApplication.findById(application._id)
            .populate('jobPosting')
            .lean();

          // Verify all custom answers are stored
          expect(retrievedApplication.customAnswers).toHaveLength(customAnswers.length);

          // Verify each answer matches the original
          customAnswers.forEach((originalAnswer, index) => {
            const storedAnswer = retrievedApplication.customAnswers[index];
            
            expect(storedAnswer.questionId).toBe(originalAnswer.questionId);
            expect(storedAnswer.questionText).toBe(originalAnswer.questionText);
            expect(storedAnswer.questionType).toBe(originalAnswer.questionType);

            // Verify answer content based on type
            if (originalAnswer.questionType === 'multiple_choice') {
              expect(storedAnswer.answer).toEqual(expect.arrayContaining(originalAnswer.answer));
              expect(originalAnswer.answer).toEqual(expect.arrayContaining(storedAnswer.answer));
            } else {
              expect(storedAnswer.answer).toEqual(originalAnswer.answer);
            }
          });

          // Verify answers are correctly displayed (formatted for employer)
          retrievedApplication.customAnswers.forEach(answer => {
            expect(answer.questionText).toBeTruthy();
            expect(answer.answer).toBeDefined();
            
            // Verify answer is not null or undefined
            if (answer.questionType === 'yes_no') {
              expect(typeof answer.answer).toBe('boolean');
            } else if (answer.questionType === 'multiple_choice') {
              expect(Array.isArray(answer.answer)).toBe(true);
              expect(answer.answer.length).toBeGreaterThan(0);
            } else {
              expect(answer.answer).toBeTruthy();
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14: Empty optional answers are stored correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(customQuestionArbitrary, { minLength: 2, maxLength: 5 }),
        async (customQuestions) => {
          // Mark some questions as optional
          const questionsWithOptional = customQuestions.map((q, i) => ({
            ...q,
            required: i % 2 === 0 // Every other question is required
          }));

          testJobPosting = await JobPosting.create({
            title: 'Test Job',
            company: new mongoose.Types.ObjectId(),
            postedBy: testUser._id,
            description: 'Test description',
            requirements: 'Test requirements',
            location: { city: 'Test City', country: 'Test Country' },
            salary: { min: 3000, max: 5000, currency: 'USD' },
            employmentType: 'Full-time',
            customQuestions: questionsWithOptional
          });

          // Answer only required questions
          const requiredQuestions = questionsWithOptional.filter(q => q.required);
          const customAnswersPromises = requiredQuestions.map(question =>
            fc.sample(customAnswerArbitrary(question), 1)[0]
          );
          const customAnswers = await Promise.all(customAnswersPromises);

          // Create application
          const application = await JobApplication.create({
            jobPosting: testJobPosting._id,
            applicant: testUser._id,
            fullName: testUser.name,
            email: testUser.email,
            phone: '+1234567890',
            customAnswers: customAnswers,
            status: 'Submitted'
          });

          // Retrieve application
          const retrievedApplication = await JobApplication.findById(application._id).lean();

          // Verify only answered questions are stored
          expect(retrievedApplication.customAnswers).toHaveLength(requiredQuestions.length);

          // Verify no null or undefined answers
          retrievedApplication.customAnswers.forEach(answer => {
            expect(answer.answer).toBeDefined();
            expect(answer.answer).not.toBeNull();
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14: Special characters in answers are preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 200 }),
        async (specialText) => {
          // Create question
          const question = {
            id: new mongoose.Types.ObjectId().toString(),
            questionText: 'Describe your experience',
            questionType: 'long_text',
            required: true,
            order: 1
          };

          testJobPosting = await JobPosting.create({
            title: 'Test Job',
            company: new mongoose.Types.ObjectId(),
            postedBy: testUser._id,
            description: 'Test description',
            requirements: 'Test requirements',
            location: { city: 'Test City', country: 'Test Country' },
            salary: { min: 3000, max: 5000, currency: 'USD' },
            employmentType: 'Full-time',
            customQuestions: [question]
          });

          // Create answer with special characters
          const customAnswer = {
            questionId: question.id,
            questionText: question.questionText,
            questionType: question.questionType,
            answer: specialText
          };

          // Create application
          const application = await JobApplication.create({
            jobPosting: testJobPosting._id,
            applicant: testUser._id,
            fullName: testUser.name,
            email: testUser.email,
            phone: '+1234567890',
            customAnswers: [customAnswer],
            status: 'Submitted'
          });

          // Retrieve application
          const retrievedApplication = await JobApplication.findById(application._id).lean();

          // Verify special characters are preserved exactly
          expect(retrievedApplication.customAnswers[0].answer).toBe(specialText);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14: Multiple applications with different answers are stored independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(customQuestionArbitrary, { minLength: 1, maxLength: 3 }),
        fc.integer({ min: 2, max: 5 }),
        async (customQuestions, numApplications) => {
          testJobPosting = await JobPosting.create({
            title: 'Test Job',
            company: new mongoose.Types.ObjectId(),
            postedBy: testUser._id,
            description: 'Test description',
            requirements: 'Test requirements',
            location: { city: 'Test City', country: 'Test Country' },
            salary: { min: 3000, max: 5000, currency: 'USD' },
            employmentType: 'Full-time',
            customQuestions: customQuestions
          });

          // Create multiple applications with different answers
          const applications = [];
          for (let i = 0; i < numApplications; i++) {
            const customAnswersPromises = customQuestions.map(question =>
              fc.sample(customAnswerArbitrary(question), 1)[0]
            );
            const customAnswers = await Promise.all(customAnswersPromises);

            const user = await User.create({
              name: `Test User ${i}`,
              email: `test-${i}-${Date.now()}@example.com`,
              password: 'hashedpassword123',
              phone: `+123456789${i}`,
              role: 'Employee'
            });

            const application = await JobApplication.create({
              jobPosting: testJobPosting._id,
              applicant: user._id,
              fullName: user.name,
              email: user.email,
              phone: `+123456789${i}`,
              customAnswers: customAnswers,
              status: 'Submitted'
            });

            applications.push({ application, customAnswers, user });
          }

          // Verify each application has its own answers
          for (const { application, customAnswers } of applications) {
            const retrieved = await JobApplication.findById(application._id).lean();
            
            expect(retrieved.customAnswers).toHaveLength(customAnswers.length);
            
            customAnswers.forEach((originalAnswer, index) => {
              const storedAnswer = retrieved.customAnswers[index];
              expect(storedAnswer.questionId).toBe(originalAnswer.questionId);
              
              if (originalAnswer.questionType === 'multiple_choice') {
                expect(storedAnswer.answer).toEqual(expect.arrayContaining(originalAnswer.answer));
              } else {
                expect(storedAnswer.answer).toEqual(originalAnswer.answer);
              }
            });
          }

          // Clean up additional users
          await User.deleteMany({ _id: { $in: applications.map(a => a.user._id) } });

          return true;
        }
      ),
      { numRuns: 50 } // Reduced runs due to multiple DB operations
    );
  });
});
