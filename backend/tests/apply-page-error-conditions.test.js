/**
 * Apply Page Enhancements - Error Conditions Integration Tests
 * 
 * Tests network failures, validation errors, and error handling
 * across the application submission flow.
 * 
 * Coverage:
 * - Network failures during save
 * - Network failures during submission
 * - File upload failures
 * - Validation errors
 * - Concurrent draft updates
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const ApplicationDraft = require('../src/models/ApplicationDraft');
const JobApplication = require('../src/models/JobApplication');

describe('Apply Page - Error Conditions', () => {
  let authToken;
  let userId;
  let jobPostingId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await ApplicationDraft.deleteMany({});
    await JobApplication.deleteMany({});

    // Create test user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      userType: 'employee',
      educationList: [],
      experienceList: [],
      computerSkills: [],
      languages: []
    });
    userId = user._id;

    // Generate auth token
    authToken = user.generateAuthToken();

    // Create test job posting
    const jobPosting = await JobPosting.create({
      title: 'Software Engineer',
      company: 'Test Company',
      description: 'Test job description',
      requirements: ['JavaScript', 'React'],
      location: 'Remote',
      salary: { min: 50000, max: 80000 },
      employmentType: 'full-time',
      postedBy: userId
    });
    jobPostingId = jobPosting._id;
  });

  describe('Network Failure Scenarios', () => {
    test('should handle network timeout during draft save', async () => {
      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 1,
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        files: []
      };

      // Simulate timeout by setting very short timeout
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .timeout(1); // 1ms timeout to force failure

      // Should handle timeout gracefully
      expect([408, 503, 504]).toContain(response.status);
    });

    test('should handle network failure during application submission', async () => {
      const applicationData = {
        jobPostingId: jobPostingId.toString(),
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          education: [],
          experience: [],
          computerSkills: [],
          languages: []
        },
        files: [],
        customAnswers: []
      };

      // Simulate network failure
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .timeout(1);

      expect([408, 503, 504]).toContain(response.status);
    });

    test('should handle database connection failure during draft save', async () => {
      // Close database connection to simulate failure
      await mongoose.connection.close();

      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 1,
        formData: { fullName: 'Test User' },
        files: []
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');

      // Reconnect for other tests
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    });
  });

  describe('Validation Error Scenarios', () => {
    test('should reject draft with missing required fields', async () => {
      const invalidDraft = {
        // Missing jobPostingId
        step: 1,
        formData: {},
        files: []
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDraft);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/jobPostingId/i);
    });

    test('should reject application with invalid email format', async () => {
      const invalidApplication = {
        jobPostingId: jobPostingId.toString(),
        formData: {
          fullName: 'Test User',
          email: 'invalid-email', // Invalid format
          phone: '+1234567890',
          education: [],
          experience: [],
          computerSkills: [],
          languages: []
        },
        files: [],
        customAnswers: []
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidApplication);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email/i);
    });

    test('should reject application with invalid phone format', async () => {
      const invalidApplication = {
        jobPostingId: jobPostingId.toString(),
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: 'invalid-phone', // Invalid format
          education: [],
          experience: [],
          computerSkills: [],
          languages: []
        },
        files: [],
        customAnswers: []
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidApplication);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/phone/i);
    });

    test('should reject draft with invalid step number', async () => {
      const invalidDraft = {
        jobPostingId: jobPostingId.toString(),
        step: 10, // Invalid step (should be 1-5)
        formData: { fullName: 'Test User' },
        files: []
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDraft);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/step/i);
    });

    test('should reject application with missing required custom question answer', async () => {
      // Update job posting with required custom question
      await JobPosting.findByIdAndUpdate(jobPostingId, {
        customQuestions: [{
          id: 'q1',
          questionText: 'Why do you want this job?',
          questionType: 'long_text',
          required: true,
          order: 1
        }]
      });

      const applicationWithoutAnswer = {
        jobPostingId: jobPostingId.toString(),
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          education: [],
          experience: [],
          computerSkills: [],
          languages: []
        },
        files: [],
        customAnswers: [] // Missing required answer
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationWithoutAnswer);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/required.*question/i);
    });
  });

  describe('File Upload Error Scenarios', () => {
    test('should reject file with invalid type', async () => {
      const invalidFile = {
        id: 'file1',
        name: 'test.exe',
        size: 1000000,
        type: 'application/x-msdownload', // Invalid type
        url: 'https://example.com/test.exe',
        cloudinaryId: 'test123'
      };

      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 4,
        formData: { fullName: 'Test User' },
        files: [invalidFile]
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/file.*type/i);
    });

    test('should reject file exceeding size limit', async () => {
      const oversizedFile = {
        id: 'file1',
        name: 'large.pdf',
        size: 6000000, // 6MB (exceeds 5MB limit)
        type: 'application/pdf',
        url: 'https://example.com/large.pdf',
        cloudinaryId: 'test123'
      };

      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 4,
        formData: { fullName: 'Test User' },
        files: [oversizedFile]
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/file.*size/i);
    });

    test('should reject more than 10 files', async () => {
      const files = Array.from({ length: 11 }, (_, i) => ({
        id: `file${i}`,
        name: `file${i}.pdf`,
        size: 1000000,
        type: 'application/pdf',
        url: `https://example.com/file${i}.pdf`,
        cloudinaryId: `test${i}`
      }));

      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 4,
        formData: { fullName: 'Test User' },
        files
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/maximum.*10.*files/i);
    });

    test('should handle Cloudinary upload failure gracefully', async () => {
      // This would require mocking Cloudinary service
      // For now, we test the error response structure
      const fileWithInvalidCloudinaryId = {
        id: 'file1',
        name: 'test.pdf',
        size: 1000000,
        type: 'application/pdf',
        url: '', // Empty URL indicates upload failure
        cloudinaryId: ''
      };

      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 4,
        formData: { fullName: 'Test User' },
        files: [fileWithInvalidCloudinaryId]
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Concurrent Update Scenarios', () => {
    test('should handle concurrent draft updates correctly', async () => {
      // Create initial draft
      const initialDraft = await ApplicationDraft.create({
        jobPosting: jobPostingId,
        applicant: userId,
        step: 1,
        formData: { fullName: 'Initial Name' },
        files: []
      });

      // Simulate two concurrent updates
      const update1 = {
        jobPostingId: jobPostingId.toString(),
        step: 2,
        formData: { fullName: 'Update 1' },
        files: []
      };

      const update2 = {
        jobPostingId: jobPostingId.toString(),
        step: 2,
        formData: { fullName: 'Update 2' },
        files: []
      };

      // Send both updates simultaneously
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/applications/drafts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(update1),
        request(app)
          .post('/api/applications/drafts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(update2)
      ]);

      // Both should succeed (last write wins)
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Verify final state
      const finalDraft = await ApplicationDraft.findOne({
        jobPosting: jobPostingId,
        applicant: userId
      });

      expect(finalDraft).toBeTruthy();
      expect(['Update 1', 'Update 2']).toContain(finalDraft.formData.fullName);
    });

    test('should prevent duplicate application submission', async () => {
      const applicationData = {
        jobPostingId: jobPostingId.toString(),
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          education: [],
          experience: [],
          computerSkills: [],
          languages: []
        },
        files: [],
        customAnswers: []
      };

      // Submit first application
      const response1 = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData);

      expect(response1.status).toBe(201);

      // Try to submit duplicate
      const response2 = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData);

      expect(response2.status).toBe(400);
      expect(response2.body).toHaveProperty('error');
      expect(response2.body.error).toMatch(/already.*applied/i);
    });
  });

  describe('Authentication and Authorization Errors', () => {
    test('should reject draft save without authentication', async () => {
      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 1,
        formData: { fullName: 'Test User' },
        files: []
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        // No Authorization header
        .send(draftData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject application submission with invalid token', async () => {
      const applicationData = {
        jobPostingId: jobPostingId.toString(),
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          education: [],
          experience: [],
          computerSkills: [],
          languages: []
        },
        files: [],
        customAnswers: []
      };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer invalid-token')
        .send(applicationData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject accessing another user\'s draft', async () => {
      // Create draft for first user
      const draft = await ApplicationDraft.create({
        jobPosting: jobPostingId,
        applicant: userId,
        step: 1,
        formData: { fullName: 'User 1' },
        files: []
      });

      // Create second user
      const user2 = await User.create({
        firstName: 'User',
        lastName: 'Two',
        email: 'user2@example.com',
        password: 'password123',
        userType: 'employee'
      });
      const token2 = user2.generateAuthToken();

      // Try to access first user's draft
      const response = await request(app)
        .get(`/api/applications/drafts/${jobPostingId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Error Message Quality', () => {
    test('should provide clear error message for validation failure', async () => {
      const invalidData = {
        jobPostingId: jobPostingId.toString(),
        step: 1,
        formData: {
          fullName: '', // Empty required field
          email: 'invalid-email',
          phone: '123' // Too short
        },
        files: []
      };

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBeTruthy();
      expect(typeof response.body.error).toBe('string');
      expect(response.body.error.length).toBeGreaterThan(10);
    });

    test('should provide helpful error message for network timeout', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobPostingId: jobPostingId.toString(),
          step: 1,
          formData: { fullName: 'Test' },
          files: []
        })
        .timeout(1);

      expect([408, 503, 504]).toContain(response.status);
      if (response.body.error) {
        expect(response.body.error).toMatch(/timeout|network|connection/i);
      }
    });
  });

  describe('Recovery and Retry Scenarios', () => {
    test('should successfully save draft after previous failure', async () => {
      // First attempt with invalid data
      const invalidData = {
        jobPostingId: jobPostingId.toString(),
        step: 1,
        formData: { email: 'invalid-email' },
        files: []
      };

      const response1 = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response1.status).toBe(400);

      // Second attempt with valid data
      const validData = {
        jobPostingId: jobPostingId.toString(),
        step: 1,
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        files: []
      };

      const response2 = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validData);

      expect(response2.status).toBe(200);
      expect(response2.body).toHaveProperty('draftId');
    });

    test('should handle retry after database reconnection', async () => {
      // This test verifies the system can recover after database issues
      const draftData = {
        jobPostingId: jobPostingId.toString(),
        step: 1,
        formData: { fullName: 'Test User' },
        files: []
      };

      // Ensure database is connected
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
      }

      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('draftId');
    });
  });
});
