/**
 * Unit Tests: Preview and Submission
 * Feature: apply-page-enhancements
 * 
 * Validates: Requirements 3.1, 3.2, 3.4, 3.6
 * 
 * Tests:
 * - Preview rendering with complete data
 * - Edit navigation from preview
 * - Submission flow
 * - Success handling
 * - Error handling
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');
const ApplicationDraft = require('../src/models/ApplicationDraft');
const { User } = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Preview and Submission Unit Tests', () => {
  let authToken;
  let testUser;
  let testCompany;
  let testJobPosting;
  let testDraft;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // Create test user (applicant)
    testUser = await User.create({
      name: 'Test Applicant',
      email: `applicant-${Date.now()}@example.com`,
      password: 'hashedpassword123',
      phone: '+1234567890',
      role: 'Employee',
      profile: {
        education: [{
          level: 'Bachelor',
          degree: 'Computer Science',
          institution: 'Test University',
          year: '2020'
        }],
        experience: [{
          company: 'Test Company',
          position: 'Developer',
          from: new Date('2020-01-01'),
          to: new Date('2022-01-01'),
          current: false
        }],
        skills: {
          computerSkills: [{ skill: 'JavaScript', proficiency: 'Advanced' }],
          languages: [{ language: 'English', proficiency: 'Native' }]
        }
      }
    });

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test company
    testCompany = await User.create({
      name: 'Test Company',
      email: `company-${Date.now()}@example.com`,
      password: 'hashedpassword123',
      phone: '+9876543210',
      role: 'HR'
    });

    // Create test job posting
    testJobPosting = await JobPosting.create({
      title: 'Software Developer',
      company: testCompany._id,
      postedBy: testCompany._id,
      description: 'We are looking for a talented developer',
      requirements: 'Bachelor degree in CS, 2+ years experience',
      location: { city: 'New York', country: 'USA' },
      salary: { min: 60000, max: 80000, currency: 'USD' },
      employmentType: 'Full-time',
      customQuestions: [
        {
          id: new mongoose.Types.ObjectId().toString(),
          questionText: 'Why do you want to work here?',
          questionType: 'long_text',
          required: true,
          order: 1
        }
      ]
    });

    // Create test draft
    testDraft = await ApplicationDraft.create({
      jobPosting: testJobPosting._id,
      applicant: testUser._id,
      step: 5, // Preview step
      formData: {
        fullName: testUser.name,
        email: testUser.email,
        phone: '+1234567890',
        country: 'USA',
        city: 'New York',
        education: testUser.profile.education,
        experience: testUser.profile.experience,
        computerSkills: testUser.profile.skills.computerSkills,
        languages: testUser.profile.skills.languages,
        coverLetter: 'I am very interested in this position'
      },
      files: [
        {
          id: 'file1',
          name: 'resume.pdf',
          size: 1024000,
          type: 'application/pdf',
          url: 'https://cloudinary.com/resume.pdf',
          cloudinaryId: 'cloudinary_id_1',
          category: 'resume',
          uploadedAt: new Date()
        }
      ],
      customAnswers: [
        {
          questionId: testJobPosting.customQuestions[0].id,
          questionText: testJobPosting.customQuestions[0].questionText,
          questionType: testJobPosting.customQuestions[0].questionType,
          answer: 'I want to work here because of the great culture'
        }
      ]
    });
  });

  afterEach(async () => {
    // Clean up test data
    await JobApplication.deleteMany({});
    await ApplicationDraft.deleteMany({});
    await JobPosting.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Preview Rendering (Requirement 3.2)', () => {
    test('should render preview with all personal information', async () => {
      const response = await request(app)
        .get(`/api/applications/drafts/${testJobPosting._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.formData.fullName).toBe(testUser.name);
      expect(response.body.formData.email).toBe(testUser.email);
      expect(response.body.formData.phone).toBe('+1234567890');
      expect(response.body.formData.country).toBe('USA');
      expect(response.body.formData.city).toBe('New York');
    });

    test('should render preview with all education entries', async () => {
      const response = await request(app)
        .get(`/api/applications/drafts/${testJobPosting._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.formData.education).toHaveLength(1);
      expect(response.body.formData.education[0].level).toBe('Bachelor');
      expect(response.body.formData.education[0].degree).toBe('Computer Science');
      expect(response.body.formData.education[0].institution).toBe('Test University');
    });

    test('should render preview with all experience entries', async () => {
      const response = await request(app)
        .get(`/api/applications/drafts/${testJobPosting._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.formData.experience).toHaveLength(1);
      expect(response.body.formData.experience[0].company).toBe('Test Company');
      expect(response.body.formData.experience[0].position).toBe('Developer');
    });

    test('should render preview with all skills', async () => {
      const response = await request(app)
        .get(`/api/applications/drafts/${testJobPosting._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.formData.computerSkills).toHaveLength(1);
      expect(response.body.formData.computerSkills[0].skill).toBe('JavaScript');
      expect(response.body.formData.computerSkills[0].proficiency).toBe('Advanced');
    });

    test('should render preview with all uploaded files', async () => {
      const response = await request(app)
        .get(`/api/applications/drafts/${testJobPosting._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.files).toHaveLength(1);
      expect(response.body.files[0].name).toBe('resume.pdf');
      expect(response.body.files[0].category).toBe('resume');
      expect(response.body.files[0].url).toBeTruthy();
    });

    test('should render preview with all custom question answers', async () => {
      const response = await request(app)
        .get(`/api/applications/drafts/${testJobPosting._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.customAnswers).toHaveLength(1);
      expect(response.body.customAnswers[0].questionText).toBe('Why do you want to work here?');
      expect(response.body.customAnswers[0].answer).toBe('I want to work here because of the great culture');
    });

    test('should render preview with cover letter', async () => {
      const response = await request(app)
        .get(`/api/applications/drafts/${testJobPosting._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.formData.coverLetter).toBe('I am very interested in this position');
    });
  });

  describe('Edit Navigation (Requirement 3.1)', () => {
    test('should allow navigation back to personal info step', async () => {
      // Update draft to go back to step 1
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          step: 1,
          formData: testDraft.formData,
          files: testDraft.files
        });

      expect(response.status).toBe(200);
      expect(response.body.step).toBe(1);
      
      // Verify data is preserved
      const draft = await ApplicationDraft.findOne({
        jobPosting: testJobPosting._id,
        applicant: testUser._id
      });
      expect(draft.formData.fullName).toBe(testUser.name);
      expect(draft.formData.email).toBe(testUser.email);
    });

    test('should allow navigation back to education step', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          step: 2,
          formData: testDraft.formData,
          files: testDraft.files
        });

      expect(response.status).toBe(200);
      expect(response.body.step).toBe(2);
      
      // Verify education data is preserved
      const draft = await ApplicationDraft.findOne({
        jobPosting: testJobPosting._id,
        applicant: testUser._id
      });
      expect(draft.formData.education).toHaveLength(1);
    });

    test('should allow navigation back to any previous step', async () => {
      for (let step = 1; step <= 4; step++) {
        const response = await request(app)
          .post('/api/applications/drafts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            jobPostingId: testJobPosting._id,
            step: step,
            formData: testDraft.formData,
            files: testDraft.files
          });

        expect(response.status).toBe(200);
        expect(response.body.step).toBe(step);
      }
    });
  });

  describe('Submission Flow (Requirement 3.4)', () => {
    test('should successfully submit complete application', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('Submitted');
      expect(response.body.applicationId).toBeTruthy();
      expect(response.body.submittedAt).toBeTruthy();
    });

    test('should delete draft after successful submission', async () => {
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      // Verify draft is deleted
      const draft = await ApplicationDraft.findOne({
        jobPosting: testJobPosting._id,
        applicant: testUser._id
      });
      expect(draft).toBeNull();
    });

    test('should store all application data in database', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      const application = await JobApplication.findById(response.body.applicationId);
      expect(application).toBeTruthy();
      expect(application.fullName).toBe(testUser.name);
      expect(application.email).toBe(testUser.email);
      expect(application.education).toHaveLength(1);
      expect(application.experience).toHaveLength(1);
      expect(application.files).toHaveLength(1);
      expect(application.customAnswers).toHaveLength(1);
    });

    test('should initialize status as Submitted', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      const application = await JobApplication.findById(response.body.applicationId);
      expect(application.status).toBe('Submitted');
      expect(application.statusHistory).toHaveLength(1);
      expect(application.statusHistory[0].status).toBe('Submitted');
    });

    test('should prevent duplicate submissions for same job', async () => {
      // First submission
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      // Second submission attempt
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/already applied/i);
    });
  });

  describe('Success Handling (Requirement 3.6)', () => {
    test('should return application ID on successful submission', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      expect(response.status).toBe(201);
      expect(response.body.applicationId).toBeTruthy();
      expect(mongoose.Types.ObjectId.isValid(response.body.applicationId)).toBe(true);
    });

    test('should return submission timestamp', async () => {
      const beforeSubmit = new Date();
      
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      const afterSubmit = new Date();
      const submittedAt = new Date(response.body.submittedAt);

      expect(response.status).toBe(201);
      expect(submittedAt.getTime()).toBeGreaterThanOrEqual(beforeSubmit.getTime());
      expect(submittedAt.getTime()).toBeLessThanOrEqual(afterSubmit.getTime());
    });

    test('should return success message', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      expect(response.status).toBe(201);
      expect(response.body.message || response.body.status).toBeTruthy();
    });
  });

  describe('Error Handling (Requirement 3.6)', () => {
    test('should reject submission without authentication', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      expect(response.status).toBe(401);
    });

    test('should reject submission with missing required fields', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: {
            // Missing required fields
            fullName: testUser.name
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    test('should reject submission with invalid job posting ID', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: new mongoose.Types.ObjectId(),
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/job posting not found/i);
    });

    test('should reject submission with unanswered required custom questions', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: [] // Missing required answer
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/required question/i);
    });

    test('should return clear error message for validation failures', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: {
            fullName: '', // Empty required field
            email: 'invalid-email', // Invalid email
            phone: testDraft.formData.phone
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
      expect(typeof response.body.error).toBe('string');
    });

    test('should handle database errors gracefully', async () => {
      // Simulate database error by closing connection temporarily
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: testJobPosting._id,
          formData: testDraft.formData,
          files: testDraft.files,
          customAnswers: testDraft.customAnswers
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeTruthy();

      // Reconnect for cleanup
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    });
  });
});
