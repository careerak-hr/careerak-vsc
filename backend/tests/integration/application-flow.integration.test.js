/**
 * Integration Tests: Complete Application Flow End-to-End
 * Tests Requirements: All (comprehensive flow testing)
 * 
 * This test suite covers:
 * - New application with auto-fill
 * - Draft save and restore
 * - File upload and removal
 * - Multi-step navigation
 * - Preview and submission
 * - Status updates
 * - Withdrawal
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const JobPosting = require('../../src/models/JobPosting');
const JobApplication = require('../../src/models/JobApplication');
const ApplicationDraft = require('../../src/models/ApplicationDraft');
const { User, Individual, Company } = require('../../src/models/User');

let mongoServer;
let applicantToken;
let hrToken;
let applicant;
let hrUser;
let company;
let jobPosting;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections
  await User.deleteMany({});
  await Individual.deleteMany({});
  await Company.deleteMany({});
  await JobPosting.deleteMany({});
  await JobApplication.deleteMany({});
  await ApplicationDraft.deleteMany({});

  // Create test users
  applicant = await Individual.create({
    name: 'Test Applicant',
    email: 'applicant@test.com',
    password: 'password123',
    userType: 'individual',
    role: 'Employee',
    // Profile data for auto-fill
    phone: '+1234567890',
    country: 'USA',
    city: 'New York',
    educationList: [{
      level: 'Bachelor',
      degree: 'Computer Science',
      institution: 'Test University',
      city: 'New York',
      country: 'USA',
      year: '2020',
      grade: 'A'
    }],
    experienceList: [{
      company: 'Test Company',
      position: 'Software Developer',
      from: new Date('2020-01-01'),
      to: new Date('2022-01-01'),
      current: false,
      tasks: 'Developed web applications',
      workType: 'Full-time',
      jobLevel: 'Mid-level',
      country: 'USA',
      city: 'New York'
    }],
    computerSkills: [{ skill: 'JavaScript', proficiency: 'Advanced' }],
    softwareSkills: [{ software: 'React', proficiency: 'Advanced' }],
    otherSkills: ['Problem Solving'],
    languages: [{ language: 'English', proficiency: 'Native' }]
  });

  company = await Company.create({
    name: 'Test Company',
    email: 'company@test.com',
    password: 'password123',
    userType: 'company',
    role: 'HR'
  });

  hrUser = company;

  // Generate tokens
  applicantToken = applicant.generateAuthToken();
  hrToken = hrUser.generateAuthToken();

  // Create test job posting
  jobPosting = await JobPosting.create({
    title: 'Senior Developer',
    description: 'Looking for a senior developer',
    company: company._id,
    location: 'New York',
    salary: { min: 80000, max: 120000 },
    jobType: 'Full-time',
    status: 'active',
    customQuestions: [
      {
        questionText: 'Why do you want to work here?',
        questionType: 'long_text',
        required: true,
        order: 1
      },
      {
        questionText: 'Are you available to start immediately?',
        questionType: 'yes_no',
        required: true,
        order: 2
      }
    ]
  });
});

describe('21.1 Complete Application Flow End-to-End', () => {
  
  describe('Auto-fill from Profile', () => {
    test('should auto-fill application form with user profile data', async () => {
      // In a real scenario, the frontend would fetch user profile
      // and populate the form. Here we verify the data is available.
      
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Applicant');
      expect(response.body.phone).toBe('+1234567890');
      expect(response.body.educationList).toHaveLength(1);
      expect(response.body.experienceList).toHaveLength(1);
      expect(response.body.computerSkills).toHaveLength(1);
      expect(response.body.languages).toHaveLength(1);
    });
  });

  describe('Draft Save and Restore', () => {
    test('should save draft application', async () => {
      const draftData = {
        jobPostingId: jobPosting._id.toString(),
        step: 2,
        formData: {
          fullName: 'Test Applicant',
          email: 'applicant@test.com',
          phone: '+1234567890',
          education: applicant.educationList
        },
        files: [],
        customAnswers: []
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send(draftData);

      expect(response.status).toBe(201);
      expect(response.body.draftId).toBeDefined();
      expect(response.body.savedAt).toBeDefined();
    });

    test('should retrieve saved draft', async () => {
      // First save a draft
      const draftData = {
        jobPostingId: jobPosting._id.toString(),
        step: 3,
        formData: {
          fullName: 'Test Applicant',
          email: 'applicant@test.com'
        },
        files: [],
        customAnswers: []
      };

      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send(draftData);

      // Then retrieve it
      const response = await request(app)
        .get(`/api/applications/drafts/${jobPosting._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.step).toBe(3);
      expect(response.body.formData.fullName).toBe('Test Applicant');
    });

    test('should update existing draft', async () => {
      // Save initial draft
      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: { fullName: 'Initial Name' },
          files: [],
          customAnswers: []
        });

      // Update draft
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 2,
          formData: { fullName: 'Updated Name' },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);

      // Verify update
      const getResponse = await request(app)
        .get(`/api/applications/drafts/${jobPosting._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(getResponse.body.step).toBe(2);
      expect(getResponse.body.formData.fullName).toBe('Updated Name');
    });
  });

  describe('File Upload and Removal', () => {
    test('should handle file upload in application', async () => {
      const applicationData = {
        jobPostingId: jobPosting._id.toString(),
        formData: {
          fullName: 'Test Applicant',
          email: 'applicant@test.com',
          phone: '+1234567890'
        },
        files: [
          {
            id: 'file1',
            name: 'resume.pdf',
            size: 1024000,
            type: 'application/pdf',
            url: 'https://cloudinary.com/resume.pdf',
            cloudinaryId: 'resume_123',
            category: 'resume',
            uploadedAt: new Date()
          }
        ],
        customAnswers: [
          {
            questionId: jobPosting.customQuestions[0]._id.toString(),
            questionText: 'Why do you want to work here?',
            questionType: 'long_text',
            answer: 'I am passionate about this role'
          },
          {
            questionId: jobPosting.customQuestions[1]._id.toString(),
            questionText: 'Are you available to start immediately?',
            questionType: 'yes_no',
            answer: 'yes'
          }
        ]
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.files).toHaveLength(1);
      expect(response.body.files[0].name).toBe('resume.pdf');
    });

    test('should validate file count limit (max 10)', async () => {
      const files = Array.from({ length: 11 }, (_, i) => ({
        id: `file${i}`,
        name: `file${i}.pdf`,
        size: 1024000,
        type: 'application/pdf',
        url: `https://cloudinary.com/file${i}.pdf`,
        cloudinaryId: `file_${i}`,
        category: 'other',
        uploadedAt: new Date()
      }));

      const applicationData = {
        jobPostingId: jobPosting._id.toString(),
        formData: {
          fullName: 'Test Applicant',
          email: 'applicant@test.com',
          phone: '+1234567890'
        },
        files,
        customAnswers: [
          {
            questionId: jobPosting.customQuestions[0]._id.toString(),
            answer: 'Test answer'
          },
          {
            questionId: jobPosting.customQuestions[1]._id.toString(),
            answer: 'yes'
          }
        ]
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send(applicationData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('10 files');
    });
  });

  describe('Multi-step Navigation', () => {
    test('should preserve data across draft saves (simulating navigation)', async () => {
      // Step 1: Personal Info
      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: {
            fullName: 'Test Applicant',
            email: 'applicant@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      // Step 2: Education & Experience
      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 2,
          formData: {
            fullName: 'Test Applicant',
            email: 'applicant@test.com',
            phone: '+1234567890',
            education: applicant.educationList,
            experience: applicant.experienceList
          },
          files: [],
          customAnswers: []
        });

      // Step 3: Skills & Languages
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 3,
          formData: {
            fullName: 'Test Applicant',
            email: 'applicant@test.com',
            phone: '+1234567890',
            education: applicant.educationList,
            experience: applicant.experienceList,
            computerSkills: applicant.computerSkills,
            languages: applicant.languages
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);

      // Verify all data preserved
      const getResponse = await request(app)
        .get(`/api/applications/drafts/${jobPosting._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(getResponse.body.step).toBe(3);
      expect(getResponse.body.formData.fullName).toBe('Test Applicant');
      expect(getResponse.body.formData.education).toHaveLength(1);
      expect(getResponse.body.formData.experience).toHaveLength(1);
      expect(getResponse.body.formData.computerSkills).toHaveLength(1);
    });
  });

  describe('Preview and Submission', () => {
    test('should submit complete application', async () => {
      const applicationData = {
        jobPostingId: jobPosting._id.toString(),
        formData: {
          fullName: 'Test Applicant',
          email: 'applicant@test.com',
          phone: '+1234567890',
          country: 'USA',
          city: 'New York',
          education: applicant.educationList,
          experience: applicant.experienceList,
          computerSkills: applicant.computerSkills,
          softwareSkills: applicant.softwareSkills,
          otherSkills: applicant.otherSkills,
          languages: applicant.languages
        },
        files: [],
        customAnswers: [
          {
            questionId: jobPosting.customQuestions[0]._id.toString(),
            questionText: 'Why do you want to work here?',
            questionType: 'long_text',
            answer: 'I am passionate about this role'
          },
          {
            questionId: jobPosting.customQuestions[1]._id.toString(),
            questionText: 'Are you available to start immediately?',
            questionType: 'yes_no',
            answer: 'yes'
          }
        ]
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send(applicationData);

      expect(response.status).toBe(201);
      expect(response.body.applicationId).toBeDefined();
      expect(response.body.status).toBe('Submitted');
      expect(response.body.submittedAt).toBeDefined();
    });

    test('should delete draft after successful submission', async () => {
      // Save draft first
      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 5,
          formData: { fullName: 'Test Applicant' },
          files: [],
          customAnswers: []
        });

      // Submit application
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'applicant@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            },
            {
              questionId: jobPosting.customQuestions[1]._id.toString(),
              answer: 'yes'
            }
          ]
        });

      // Verify draft deleted
      const response = await request(app)
        .get(`/api/applications/drafts/${jobPosting._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Status Updates', () => {
    let application;

    beforeEach(async () => {
      // Create an application
      const app = await JobApplication.create({
        jobPosting: jobPosting._id,
        applicant: applicant._id,
        fullName: 'Test Applicant',
        email: 'applicant@test.com',
        phone: '+1234567890',
        status: 'Submitted',
        statusHistory: [{
          status: 'Submitted',
          timestamp: new Date()
        }]
      });
      application = app;
    });

    test('should update application status (HR)', async () => {
      const response = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          status: 'Reviewed',
          note: 'Application reviewed'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('Reviewed');
      expect(response.body.statusHistory).toHaveLength(2);
    });

    test('should track status history', async () => {
      // Update to Reviewed
      await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ status: 'Reviewed' });

      // Update to Shortlisted
      await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ status: 'Shortlisted' });

      // Get application details
      const response = await request(app)
        .get(`/api/applications/${application._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.body.statusHistory).toHaveLength(3);
      expect(response.body.statusHistory[0].status).toBe('Submitted');
      expect(response.body.statusHistory[1].status).toBe('Reviewed');
      expect(response.body.statusHistory[2].status).toBe('Shortlisted');
    });
  });

  describe('Withdrawal', () => {
    let application;

    beforeEach(async () => {
      application = await JobApplication.create({
        jobPosting: jobPosting._id,
        applicant: applicant._id,
        fullName: 'Test Applicant',
        email: 'applicant@test.com',
        phone: '+1234567890',
        status: 'Submitted',
        statusHistory: [{
          status: 'Submitted',
          timestamp: new Date()
        }]
      });
    });

    test('should allow withdrawal for Pending status', async () => {
      const response = await request(app)
        .patch(`/api/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('Withdrawn');
      expect(response.body.withdrawnAt).toBeDefined();
    });

    test('should allow withdrawal for Reviewed status', async () => {
      // Update to Reviewed first
      application.status = 'Reviewed';
      application.statusHistory.push({
        status: 'Reviewed',
        timestamp: new Date()
      });
      await application.save();

      const response = await request(app)
        .patch(`/api/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('Withdrawn');
    });

    test('should not allow withdrawal for Shortlisted status', async () => {
      application.status = 'Shortlisted';
      await application.save();

      const response = await request(app)
        .patch(`/api/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot be withdrawn');
    });

    test('should not allow withdrawal for Accepted status', async () => {
      application.status = 'Accepted';
      await application.save();

      const response = await request(app)
        .patch(`/api/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(400);
    });

    test('should not allow withdrawal for Rejected status', async () => {
      application.status = 'Rejected';
      await application.save();

      const response = await request(app)
        .patch(`/api/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(response.status).toBe(400);
    });
  });
});
