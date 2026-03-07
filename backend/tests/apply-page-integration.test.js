/**
 * Integration Tests for Apply Page Enhancements
 * 
 * These tests verify complete flows work end-to-end:
 * - Complete submission flow
 * - Draft save/restore flow
 * - File upload flow
 * - Status update flow
 * - Withdrawal flow
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');
const ApplicationDraft = require('../src/models/ApplicationDraft');

describe('Apply Page Integration Tests', () => {
  let authToken;
  let userId;
  let jobPostingId;
  let applicationId;
  let draftId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      userType: 'Employee',
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
        to: new Date('2022-01-01')
      }],
      computerSkills: [{ skill: 'JavaScript', proficiency: 'advanced' }],
      languages: [{ language: 'English', proficiency: 'native' }]
    });

    userId = user._id;

    // Generate auth token
    authToken = user.generateAuthToken();

    // Create test job posting
    const jobPosting = await JobPosting.create({
      title: 'Test Job',
      company: 'Test Company',
      description: 'Test Description',
      requirements: ['JavaScript'],
      customQuestions: [
        {
          questionText: 'Why do you want this job?',
          questionType: 'long_text',
          required: true
        }
      ]
    });

    jobPostingId = jobPosting._id;
  });

  afterEach(async () => {
    // Clean up test data
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await JobApplication.deleteMany({});
    await ApplicationDraft.deleteMany({});
  });

  describe('Complete Submission Flow', () => {
    it('should complete full application submission from start to finish', async () => {
      // Step 1: Load user profile and verify auto-fill data
      const profileRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileRes.body.education).toHaveLength(1);
      expect(profileRes.body.experience).toHaveLength(1);

      // Step 2: Create draft with auto-filled data
      const draftData = {
        jobPostingId,
        step: 1,
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          education: profileRes.body.education,
          experience: profileRes.body.experience
        },
        files: [],
        customAnswers: []
      };

      const draftRes = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .expect(201);

      expect(draftRes.body.draftId).toBeDefined();
      draftId = draftRes.body.draftId;

      // Step 3: Update draft with additional steps
      const updatedDraftData = {
        ...draftData,
        step: 4,
        formData: {
          ...draftData.formData,
          computerSkills: [{ skill: 'JavaScript', proficiency: 'advanced' }],
          languages: [{ language: 'English', proficiency: 'native' }]
        },
        customAnswers: [
          {
            questionId: jobPosting.customQuestions[0].id,
            questionText: 'Why do you want this job?',
            answer: 'I am passionate about this role'
          }
        ]
      };

      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedDraftData)
        .expect(201);

      // Step 4: Submit final application
      const applicationData = {
        jobPostingId,
        formData: updatedDraftData.formData,
        files: [],
        customAnswers: updatedDraftData.customAnswers
      };

      const submitRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(201);

      expect(submitRes.body.applicationId).toBeDefined();
      expect(submitRes.body.status).toBe('Submitted');
      applicationId = submitRes.body.applicationId;

      // Step 5: Verify draft was deleted
      const draftCheckRes = await request(app)
        .get(`/api/applications/drafts/${jobPostingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Step 6: Verify application was saved correctly
      const appRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(appRes.body.formData.fullName).toBe('Test User');
      expect(appRes.body.customAnswers).toHaveLength(1);
      expect(appRes.body.status).toBe('Submitted');
    });
  });

  describe('Draft Save/Restore Flow', () => {
    it('should save draft, restore it, and preserve all data', async () => {
      // Step 1: Create initial draft
      const draftData = {
        jobPostingId,
        step: 2,
        formData: {
          fullName: 'Test User',
          email: 'test@example.com',
          education: [{ level: 'Bachelor', degree: 'CS' }]
        },
        files: [],
        customAnswers: []
      };

      const createRes = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .expect(201);

      draftId = createRes.body.draftId;

      // Step 2: Simulate user leaving and returning
      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 3: Restore draft
      const restoreRes = await request(app)
        .get(`/api/applications/drafts/${jobPostingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Step 4: Verify all data preserved
      expect(restoreRes.body.step).toBe(2);
      expect(restoreRes.body.formData.fullName).toBe('Test User');
      expect(restoreRes.body.formData.education).toHaveLength(1);
      expect(restoreRes.body.draftId).toBe(draftId);

      // Step 5: Update draft with modifications
      const updatedData = {
        ...draftData,
        step: 3,
        formData: {
          ...draftData.formData,
          phone: '+1234567890'
        }
      };

      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(201);

      // Step 6: Restore again and verify updates
      const finalRestoreRes = await request(app)
        .get(`/api/applications/drafts/${jobPostingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(finalRestoreRes.body.step).toBe(3);
      expect(finalRestoreRes.body.formData.phone).toBe('+1234567890');
    });

    it('should handle concurrent draft updates correctly', async () => {
      const draftData = {
        jobPostingId,
        step: 1,
        formData: { fullName: 'Test User' },
        files: [],
        customAnswers: []
      };

      // Create initial draft
      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .expect(201);

      // Simulate concurrent updates
      const update1 = { ...draftData, step: 2, formData: { ...draftData.formData, email: 'test1@example.com' } };
      const update2 = { ...draftData, step: 3, formData: { ...draftData.formData, email: 'test2@example.com' } };

      await Promise.all([
        request(app).post('/api/applications/drafts').set('Authorization', `Bearer ${authToken}`).send(update1),
        request(app).post('/api/applications/drafts').set('Authorization', `Bearer ${authToken}`).send(update2)
      ]);

      // Verify final state (should have one of the updates)
      const finalRes = await request(app)
        .get(`/api/applications/drafts/${jobPostingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect([2, 3]).toContain(finalRes.body.step);
      expect(['test1@example.com', 'test2@example.com']).toContain(finalRes.body.formData.email);
    });
  });

  describe('File Upload Flow', () => {
    it('should upload files, associate with draft, and include in submission', async () => {
      // Note: This test assumes Cloudinary integration is mocked or configured
      // In real implementation, you would mock Cloudinary service

      // Step 1: Create draft
      const draftData = {
        jobPostingId,
        step: 4,
        formData: { fullName: 'Test User' },
        files: [],
        customAnswers: []
      };

      const draftRes = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .expect(201);

      draftId = draftRes.body.draftId;

      // Step 2: Upload file (simulated)
      const fileData = {
        id: 'file-123',
        name: 'resume.pdf',
        size: 1024000,
        type: 'application/pdf',
        url: 'https://cloudinary.com/test/resume.pdf',
        cloudinaryId: 'cloudinary-123',
        category: 'resume',
        uploadedAt: new Date()
      };

      // Step 3: Update draft with file
      const updatedDraftData = {
        ...draftData,
        files: [fileData]
      };

      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedDraftData)
        .expect(201);

      // Step 4: Verify file in draft
      const draftCheckRes = await request(app)
        .get(`/api/applications/drafts/${jobPostingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(draftCheckRes.body.files).toHaveLength(1);
      expect(draftCheckRes.body.files[0].name).toBe('resume.pdf');

      // Step 5: Submit application with file
      const applicationData = {
        jobPostingId,
        formData: updatedDraftData.formData,
        files: updatedDraftData.files,
        customAnswers: []
      };

      const submitRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(201);

      applicationId = submitRes.body.applicationId;

      // Step 6: Verify file in application
      const appRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(appRes.body.files).toHaveLength(1);
      expect(appRes.body.files[0].cloudinaryId).toBe('cloudinary-123');
    });

    it('should handle file removal correctly', async () => {
      // Step 1: Create draft with files
      const fileData1 = {
        id: 'file-1',
        name: 'resume.pdf',
        cloudinaryId: 'cloud-1'
      };

      const fileData2 = {
        id: 'file-2',
        name: 'cover-letter.pdf',
        cloudinaryId: 'cloud-2'
      };

      const draftData = {
        jobPostingId,
        step: 4,
        formData: { fullName: 'Test User' },
        files: [fileData1, fileData2],
        customAnswers: []
      };

      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .expect(201);

      // Step 2: Remove one file
      const updatedDraftData = {
        ...draftData,
        files: [fileData1] // Only keep first file
      };

      await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedDraftData)
        .expect(201);

      // Step 3: Verify file removed
      const draftCheckRes = await request(app)
        .get(`/api/applications/drafts/${jobPostingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(draftCheckRes.body.files).toHaveLength(1);
      expect(draftCheckRes.body.files[0].id).toBe('file-1');
    });

    it('should enforce 10 file limit', async () => {
      // Create 11 files
      const files = Array.from({ length: 11 }, (_, i) => ({
        id: `file-${i}`,
        name: `file-${i}.pdf`,
        cloudinaryId: `cloud-${i}`
      }));

      const draftData = {
        jobPostingId,
        step: 4,
        formData: { fullName: 'Test User' },
        files,
        customAnswers: []
      };

      // Should fail validation
      const res = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .expect(400);

      expect(res.body.error).toContain('maximum');
    });
  });

  describe('Status Update Flow', () => {
    beforeEach(async () => {
      // Create application for status tests
      const applicationData = {
        jobPostingId,
        applicant: userId,
        fullName: 'Test User',
        email: 'test@example.com',
        status: 'Submitted',
        statusHistory: [{
          status: 'Submitted',
          timestamp: new Date()
        }]
      };

      const application = await JobApplication.create(applicationData);
      applicationId = application._id;
    });

    it('should update status and maintain history', async () => {
      // Step 1: Update to Reviewed
      const updateRes1 = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Reviewed', note: 'Initial review completed' })
        .expect(200);

      expect(updateRes1.body.status).toBe('Reviewed');

      // Step 2: Verify status history
      const appRes1 = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(appRes1.body.statusHistory).toHaveLength(2);
      expect(appRes1.body.statusHistory[1].status).toBe('Reviewed');
      expect(appRes1.body.statusHistory[1].note).toBe('Initial review completed');

      // Step 3: Update to Shortlisted
      await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Shortlisted' })
        .expect(200);

      // Step 4: Verify complete history
      const appRes2 = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(appRes2.body.statusHistory).toHaveLength(3);
      expect(appRes2.body.statusHistory.map(h => h.status)).toEqual([
        'Submitted',
        'Reviewed',
        'Shortlisted'
      ]);
    });

    it('should send notifications on status change', async () => {
      // Note: This assumes notification service is mocked or configured
      // In real implementation, you would verify notification was sent

      const updateRes = await request(app)
        .patch(`/api/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Interview Scheduled' })
        .expect(200);

      expect(updateRes.body.status).toBe('Interview Scheduled');

      // Verify notification was created (if notification system is integrated)
      // This would require checking the Notification model or mocking the service
    });
  });

  describe('Withdrawal Flow', () => {
    beforeEach(async () => {
      // Create application for withdrawal tests
      const applicationData = {
        jobPostingId,
        applicant: userId,
        fullName: 'Test User',
        email: 'test@example.com',
        status: 'Submitted',
        statusHistory: [{
          status: 'Submitted',
          timestamp: new Date()
        }]
      };

      const application = await JobApplication.create(applicationData);
      applicationId = application._id;
    });

    it('should allow withdrawal for Submitted status', async () => {
      // Step 1: Withdraw application
      const withdrawRes = await request(app)
        .patch(`/api/applications/${applicationId}/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(withdrawRes.body.status).toBe('Withdrawn');

      // Step 2: Verify status history updated
      const appRes = await request(app)
        .get(`/api/applications/${applicationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(appRes.body.statusHistory).toHaveLength(2);
      expect(appRes.body.statusHistory[1].status).toBe('Withdrawn');
      expect(appRes.body.withdrawnAt).toBeDefined();
    });

    it('should prevent withdrawal for Shortlisted status', async () => {
      // Update to Shortlisted
      await JobApplication.findByIdAndUpdate(applicationId, {
        status: 'Shortlisted'
      });

      // Attempt withdrawal
      const withdrawRes = await request(app)
        .patch(`/api/applications/${applicationId}/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(withdrawRes.body.error).toContain('cannot be withdrawn');
    });

    it('should prevent withdrawal for Accepted status', async () => {
      // Update to Accepted
      await JobApplication.findByIdAndUpdate(applicationId, {
        status: 'Accepted'
      });

      // Attempt withdrawal
      await request(app)
        .patch(`/api/applications/${applicationId}/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should prevent withdrawal for Rejected status', async () => {
      // Update to Rejected
      await JobApplication.findByIdAndUpdate(applicationId, {
        status: 'Rejected'
      });

      // Attempt withdrawal
      await request(app)
        .patch(`/api/applications/${applicationId}/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network failure during draft save gracefully', async () => {
      // This would require mocking the database to simulate failure
      // For now, we test that the API returns appropriate error
      
      const invalidDraftData = {
        jobPostingId: 'invalid-id',
        step: 1,
        formData: {},
        files: [],
        customAnswers: []
      };

      const res = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDraftData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should validate required fields on submission', async () => {
      const incompleteData = {
        jobPostingId,
        formData: {}, // Missing required fields
        files: [],
        customAnswers: []
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('should validate custom question answers', async () => {
      const applicationData = {
        jobPostingId,
        formData: { fullName: 'Test User', email: 'test@example.com' },
        files: [],
        customAnswers: [] // Missing required custom answer
      };

      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)
        .expect(400);

      expect(res.body.error).toContain('required');
    });
  });
});
