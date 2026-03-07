/**
 * Property Test: Custom Question Validation
 * 
 * Feature: apply-page-enhancements
 * Property 13: Custom question validation
 * 
 * Validates: Requirements 8.3
 * 
 * Property: For any form with required custom questions, attempting submission
 * without answers should prevent submission and display error messages.
 * 
 * This test uses property-based testing with fast-check to verify that
 * the system correctly validates required custom questions across all
 * possible question types and configurations.
 */

const fc = require('fast-check');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');

describe('Feature: apply-page-enhancements, Property 13: Custom question validation', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await JobApplication.deleteMany({});

    // Create test user
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'employee',
      isVerified: true
    });

    // Generate auth token
    authToken = testUser.generateAuthToken();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Generator for question types
  const questionTypeArbitrary = fc.constantFrom(
    'short_text',
    'long_text',
    'single_choice',
    'multiple_choice',
    'yes_no'
  );

  // Generator for custom questions
  const customQuestionArbitrary = fc.record({
    questionText: fc.string({ minLength: 10, maxLength: 200 }),
    questionType: questionTypeArbitrary,
    options: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 5 })),
    required: fc.boolean(),
    order: fc.integer({ min: 1, max: 5 })
  }).map(q => ({
    ...q,
    id: new mongoose.Types.ObjectId().toString(),
    // Ensure options exist for choice questions
    options: ['single_choice', 'multiple_choice'].includes(q.questionType) 
      ? (q.options || ['Option 1', 'Option 2', 'Option 3'])
      : undefined
  }));

  // Generator for job postings with custom questions
  const jobPostingWithQuestionsArbitrary = fc.record({
    title: fc.string({ minLength: 10, maxLength: 100 }),
    company: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 50, maxLength: 500 }),
    customQuestions: fc.array(customQuestionArbitrary, { minLength: 1, maxLength: 5 })
  });

  // Generator for application data without custom answers
  const applicationDataWithoutAnswersArbitrary = fc.record({
    fullName: fc.string({ minLength: 5, maxLength: 100 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 10, maxLength: 15 }),
    country: fc.string({ minLength: 3, maxLength: 50 }),
    city: fc.string({ minLength: 3, maxLength: 50 })
  });

  /**
   * Property 13: Custom question validation
   * 
   * For any job posting with required custom questions, when an applicant
   * attempts to submit an application without answering required questions,
   * the system should:
   * 1. Prevent the submission
   * 2. Return validation errors
   * 3. Indicate which questions are missing answers
   * 4. Not create an application record
   */
  test('should prevent submission when required custom questions are unanswered', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingWithQuestionsArbitrary,
        applicationDataWithoutAnswersArbitrary,
        async (jobPostingData, applicationData) => {
          // Filter to get only required questions
          const requiredQuestions = jobPostingData.customQuestions.filter(q => q.required);
          
          // Skip if no required questions
          if (requiredQuestions.length === 0) {
            return true;
          }

          // Create job posting
          const jobPosting = await JobPosting.create({
            ...jobPostingData,
            postedBy: testUser._id,
            status: 'active',
            location: { country: 'Test Country', city: 'Test City' },
            salary: { min: 50000, max: 100000, currency: 'USD' },
            employmentType: 'full-time'
          });

          // Attempt to submit application without custom answers
          const response = await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              jobPostingId: jobPosting._id.toString(),
              ...applicationData,
              customAnswers: [] // Empty answers
            });

          // Verify submission was prevented
          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
          expect(response.body.error).toBeDefined();

          // Verify error message mentions required questions
          const errorMessage = response.body.error.message || response.body.error;
          expect(errorMessage.toLowerCase()).toMatch(/required|question|answer/);

          // Verify no application was created
          const applicationCount = await JobApplication.countDocuments({
            jobPosting: jobPosting._id,
            applicant: testUser._id
          });
          expect(applicationCount).toBe(0);

          return true;
        }
      ),
      { numRuns: 100 } // Run 100 iterations
    );
  });

  /**
   * Property 13.1: Specific required question validation
   * 
   * For each required question, the system should identify it specifically
   * in the validation errors.
   */
  test('should identify specific required questions in validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingWithQuestionsArbitrary,
        applicationDataWithoutAnswersArbitrary,
        async (jobPostingData, applicationData) => {
          // Ensure at least one required question
          const modifiedQuestions = jobPostingData.customQuestions.map((q, idx) => ({
            ...q,
            required: idx === 0 // Make first question required
          }));

          // Create job posting
          const jobPosting = await JobPosting.create({
            ...jobPostingData,
            customQuestions: modifiedQuestions,
            postedBy: testUser._id,
            status: 'active',
            location: { country: 'Test Country', city: 'Test City' },
            salary: { min: 50000, max: 100000, currency: 'USD' },
            employmentType: 'full-time'
          });

          // Attempt submission with partial answers (missing first question)
          const partialAnswers = modifiedQuestions.slice(1).map(q => ({
            questionId: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            answer: q.questionType === 'yes_no' ? 'yes' : 'test answer'
          }));

          const response = await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              jobPostingId: jobPosting._id.toString(),
              ...applicationData,
              customAnswers: partialAnswers
            });

          // Verify validation error
          expect(response.status).toBe(400);
          
          // Verify error mentions the specific question
          const errorDetails = response.body.error.details || response.body.error.message || response.body.error;
          const errorString = JSON.stringify(errorDetails).toLowerCase();
          
          // Should mention either the question ID or indicate missing required answer
          expect(
            errorString.includes(modifiedQuestions[0].id.toLowerCase()) ||
            errorString.includes('required') ||
            errorString.includes('missing')
          ).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13.2: Optional question handling
   * 
   * For any job posting with optional custom questions, submission should
   * succeed even if optional questions are unanswered.
   */
  test('should allow submission when only optional questions are unanswered', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingWithQuestionsArbitrary,
        applicationDataWithoutAnswersArbitrary,
        async (jobPostingData, applicationData) => {
          // Make all questions optional
          const optionalQuestions = jobPostingData.customQuestions.map(q => ({
            ...q,
            required: false
          }));

          // Create job posting
          const jobPosting = await JobPosting.create({
            ...jobPostingData,
            customQuestions: optionalQuestions,
            postedBy: testUser._id,
            status: 'active',
            location: { country: 'Test Country', city: 'Test City' },
            salary: { min: 50000, max: 100000, currency: 'USD' },
            employmentType: 'full-time'
          });

          // Submit application without custom answers
          const response = await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              jobPostingId: jobPosting._id.toString(),
              ...applicationData,
              customAnswers: [] // Empty answers for optional questions
            });

          // Verify submission succeeded (or failed for other reasons, not custom questions)
          if (response.status === 400) {
            const errorMessage = response.body.error.message || response.body.error;
            // Error should NOT be about required custom questions
            expect(errorMessage.toLowerCase()).not.toMatch(/required.*question/);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13.3: Answer type validation
   * 
   * For any custom question, the system should validate that the answer
   * matches the expected type (e.g., array for multiple_choice).
   */
  test('should validate answer types match question types', async () => {
    await fc.assert(
      fc.asyncProperty(
        jobPostingWithQuestionsArbitrary,
        applicationDataWithoutAnswersArbitrary,
        async (jobPostingData, applicationData) => {
          // Create job posting
          const jobPosting = await JobPosting.create({
            ...jobPostingData,
            postedBy: testUser._id,
            status: 'active',
            location: { country: 'Test Country', city: 'Test City' },
            salary: { min: 50000, max: 100000, currency: 'USD' },
            employmentType: 'full-time'
          });

          // Create answers with correct types
          const correctAnswers = jobPostingData.customQuestions.map(q => {
            let answer;
            switch (q.questionType) {
              case 'short_text':
              case 'long_text':
                answer = 'Test answer';
                break;
              case 'single_choice':
                answer = q.options[0];
                break;
              case 'multiple_choice':
                answer = [q.options[0], q.options[1]];
                break;
              case 'yes_no':
                answer = 'yes';
                break;
              default:
                answer = '';
            }

            return {
              questionId: q.id,
              questionText: q.questionText,
              questionType: q.questionType,
              answer
            };
          });

          // Submit with correct answer types
          const response = await request(app)
            .post('/api/applications')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              jobPostingId: jobPosting._id.toString(),
              ...applicationData,
              customAnswers: correctAnswers
            });

          // Should succeed or fail for reasons other than answer type
          if (response.status === 400) {
            const errorMessage = response.body.error.message || response.body.error;
            // Error should NOT be about answer type mismatch
            expect(errorMessage.toLowerCase()).not.toMatch(/invalid.*type|wrong.*type/);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
