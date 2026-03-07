/**
 * Integration Tests: Error Scenarios
 * Tests Requirements: 2.6, 4.6, 9.6, 11.2, 11.3
 * 
 * This test suite covers:
 * - Network failures during save
 * - Network failures during submission
 * - File upload failures
 * - Validation errors
 * - Concurrent draft updates
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
let applicant;
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
  await User.deleteMany({});
  await Individual.deleteMany({});
  await Company.deleteMany({});
  await JobPosting.deleteMany({});
  await JobApplication.deleteMany({});
  await ApplicationDraft.deleteMany({});

  applicant = await Individual.create({
    name: 'Test Applicant',
    email: 'applicant@test.com',
    password: 'password123',
    userType: 'individual',
    role: 'Employee'
  });

  company = await Company.create({
    name: 'Test Company',
    email: 'company@test.com',
    password: 'password123',
    userType: 'company',
    role: 'HR'
  });

  applicantToken = applicant.generateAuthToken();

  jobPosting = await JobPosting.create({
    title: 'Test Job',
    description: 'Test Description',
    company: company._id,
    location: 'Test Location',
    salary: { min: 50000, max: 80000 },
    jobType: 'Full-time',
    status: 'active',
    customQuestions: [
      {
        questionText: 'Test Question',
        questionType: 'short_text',
        required: true,
        order: 1
      }
    ]
  });
});

describe('21.2 Error Scenarios', () => {
  
  describe('Network Failures During Save', () => {
    test('should handle database connection error during draft save', async () => {
      // Simulate database error by closing connection temporarily
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: { fullName: 'Test' },
          files: [],
          customAnswers: []
        });

      // Reconnect for cleanup
      await mongoose.connect(mongoServer.getUri());

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    test('should handle timeout during draft save', async () => {
      // Create a very large draft to simulate timeout
      const largeFormData = {
        fullName: 'Test',
        description: 'x'.repeat(1000000) // 1MB of text
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: largeFormData,
          files: [],
          customAnswers: []
        });

      // Should either succeed or fail gracefully
      expect([200, 201, 413, 500]).toContain(response.status);
    });

    test('should handle invalid data during draft save', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          // Missing required jobPostingId
          step: 1,
          formData: { fullName: 'Test' },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Network Failures During Submission', () => {
    test('should handle database error during application submission', async () => {
      await mongoose.connection.close();

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            }
          ]
        });

      await mongoose.connect(mongoServer.getUri());

      expect(response.status).toBe(500);
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            // Missing required fields: fullName, email, phone
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('should handle invalid job posting ID', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: new mongoose.Types.ObjectId().toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(404);
    });

    test('should handle duplicate application submission', async () => {
      const applicationData = {
        jobPostingId: jobPosting._id.toString(),
        formData: {
          fullName: 'Test Applicant',
          email: 'test@test.com',
          phone: '+1234567890'
        },
        files: [],
        customAnswers: [
          {
            questionId: jobPosting.customQuestions[0]._id.toString(),
            answer: 'Test answer'
          }
        ]
      };

      // First submission
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send(applicationData);

      // Second submission (duplicate)
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send(applicationData);

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already applied');
    });
  });

  describe('File Upload Failures', () => {
    test('should reject files exceeding size limit', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [
            {
              id: 'file1',
              name: 'large-file.pdf',
              size: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
              type: 'application/pdf',
              url: 'https://cloudinary.com/large-file.pdf',
              cloudinaryId: 'large_file_123',
              category: 'resume',
              uploadedAt: new Date()
            }
          ],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('size');
    });

    test('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [
            {
              id: 'file1',
              name: 'malicious.exe',
              size: 1024000,
              type: 'application/x-msdownload',
              url: 'https://cloudinary.com/malicious.exe',
              cloudinaryId: 'malicious_123',
              category: 'other',
              uploadedAt: new Date()
            }
          ],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('type');
    });

    test('should reject too many files', async () => {
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

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files,
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('10 files');
    });

    test('should handle missing file metadata', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [
            {
              // Missing required fields: name, size, type, url
              id: 'file1',
              cloudinaryId: 'file_123'
            }
          ],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            }
          ]
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Validation Errors', () => {
    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'invalid-email', // Invalid format
            phone: '+1234567890'
          },
          files: [],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    test('should validate phone format', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '123' // Invalid format
          },
          files: [],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 'Test answer'
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('phone');
    });

    test('should validate required custom questions', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: [] // Missing required custom question answer
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('should validate custom question answer types', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: [
            {
              questionId: jobPosting.customQuestions[0]._id.toString(),
              answer: 123 // Should be string for short_text
            }
          ]
        });

      expect(response.status).toBe(400);
    });

    test('should validate step number in draft', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 10, // Invalid step (should be 1-5)
          formData: { fullName: 'Test' },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('step');
    });
  });

  describe('Concurrent Draft Updates', () => {
    test('should handle concurrent draft updates', async () => {
      const draftData = {
        jobPostingId: jobPosting._id.toString(),
        step: 1,
        formData: { fullName: 'Test' },
        files: [],
        customAnswers: []
      };

      // Simulate concurrent updates
      const promises = [
        request(app)
          .post('/api/applications/drafts')
          .set('Authorization', `Bearer ${applicantToken}`)
          .send({ ...draftData, formData: { fullName: 'Update 1' } }),
        
        request(app)
          .post('/api/applications/drafts')
          .set('Authorization', `Bearer ${applicantToken}`)
          .send({ ...draftData, formData: { fullName: 'Update 2' } }),
        
        request(app)
          .post('/api/applications/drafts')
          .set('Authorization', `Bearer ${applicantToken}`)
          .send({ ...draftData, formData: { fullName: 'Update 3' } })
      ];

      const responses = await Promise.all(promises);

      // All should succeed (last write wins)
      responses.forEach(response => {
        expect([200, 201]).toContain(response.status);
      });

      // Verify final state
      const getResponse = await request(app)
        .get(`/api/applications/drafts/${jobPosting._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(getResponse.status).toBe(200);
      // Should have one of the updates
      expect(['Update 1', 'Update 2', 'Update 3']).toContain(
        getResponse.body.formData.fullName
      );
    });

    test('should handle race condition between draft save and application submit', async () => {
      const draftData = {
        jobPostingId: jobPosting._id.toString(),
        step: 5,
        formData: {
          fullName: 'Test Applicant',
          email: 'test@test.com',
          phone: '+1234567890'
        },
        files: [],
        customAnswers: []
      };

      const applicationData = {
        jobPostingId: jobPosting._id.toString(),
        formData: {
          fullName: 'Test Applicant',
          email: 'test@test.com',
          phone: '+1234567890'
        },
        files: [],
        customAnswers: [
          {
            questionId: jobPosting.customQuestions[0]._id.toString(),
            answer: 'Test answer'
          }
        ]
      };

      // Simulate race condition
      const [draftResponse, submitResponse] = await Promise.all([
        request(app)
          .post('/api/applications/drafts')
          .set('Authorization', `Bearer ${applicantToken}`)
          .send(draftData),
        
        request(app)
          .post('/api/applications')
          .set('Authorization', `Bearer ${applicantToken}`)
          .send(applicationData)
      ]);

      // Both should succeed
      expect([200, 201]).toContain(draftResponse.status);
      expect(submitResponse.status).toBe(201);

      // Draft should be deleted after submission
      const getDraftResponse = await request(app)
        .get(`/api/applications/drafts/${jobPosting._id}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      expect(getDraftResponse.status).toBe(404);
    });
  });

  describe('Authentication and Authorization Errors', () => {
    test('should reject unauthenticated draft save', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: { fullName: 'Test' },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(401);
    });

    test('should reject unauthenticated application submission', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(401);
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: { fullName: 'Test' },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(401);
    });
  });
});
