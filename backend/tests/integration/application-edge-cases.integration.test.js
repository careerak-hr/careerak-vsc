/**
 * Integration Tests: Edge Cases
 * Tests Requirements: 1.7, 4.8, 8.1
 * 
 * This test suite covers:
 * - Test with empty profile
 * - Test with maximum files (10)
 * - Test with maximum custom questions (5)
 * - Test with very long text inputs
 * - Test with special characters
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
    customQuestions: []
  });
});

describe('21.3 Edge Cases', () => {
  
  describe('Empty Profile (Requirement 1.7)', () => {
    test('should handle application with completely empty profile', async () => {
      // Applicant has no profile data (already created with minimal data)
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890'
            // No education, experience, skills, languages
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
      expect(response.body.applicationId).toBeDefined();
    });

    test('should handle draft with empty profile fields', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: {
            fullName: '',
            email: '',
            phone: '',
            country: '',
            city: ''
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
      expect(response.body.draftId).toBeDefined();
    });

    test('should handle application with empty arrays', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            education: [],
            experience: [],
            computerSkills: [],
            softwareSkills: [],
            otherSkills: [],
            languages: []
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });

    test('should handle null values in profile fields', async () => {
      const response = await request(app)
        .post('/api/applications/drafts')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          step: 1,
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            country: null,
            city: null,
            coverLetter: null,
            expectedSalary: null
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Maximum Files (Requirement 4.8)', () => {
    test('should accept exactly 10 files', async () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        id: `file${i}`,
        name: `document${i}.pdf`,
        size: 1024000,
        type: 'application/pdf',
        url: `https://cloudinary.com/document${i}.pdf`,
        cloudinaryId: `doc_${i}`,
        category: i === 0 ? 'resume' : 'other',
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
          customAnswers: []
        });

      expect(response.status).toBe(201);
      expect(response.body.files).toHaveLength(10);
    });

    test('should handle files with maximum allowed size (5MB each)', async () => {
      const files = [
        {
          id: 'file1',
          name: 'large-resume.pdf',
          size: 5 * 1024 * 1024, // Exactly 5MB
          type: 'application/pdf',
          url: 'https://cloudinary.com/large-resume.pdf',
          cloudinaryId: 'large_resume_123',
          category: 'resume',
          uploadedAt: new Date()
        }
      ];

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
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });

    test('should handle all supported file types', async () => {
      const files = [
        {
          id: 'file1',
          name: 'resume.pdf',
          size: 1024000,
          type: 'application/pdf',
          url: 'https://cloudinary.com/resume.pdf',
          cloudinaryId: 'resume_123',
          category: 'resume',
          uploadedAt: new Date()
        },
        {
          id: 'file2',
          name: 'cover.doc',
          size: 1024000,
          type: 'application/msword',
          url: 'https://cloudinary.com/cover.doc',
          cloudinaryId: 'cover_123',
          category: 'cover_letter',
          uploadedAt: new Date()
        },
        {
          id: 'file3',
          name: 'certificate.docx',
          size: 1024000,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          url: 'https://cloudinary.com/certificate.docx',
          cloudinaryId: 'cert_123',
          category: 'certificate',
          uploadedAt: new Date()
        },
        {
          id: 'file4',
          name: 'photo.jpg',
          size: 1024000,
          type: 'image/jpeg',
          url: 'https://cloudinary.com/photo.jpg',
          cloudinaryId: 'photo_123',
          category: 'portfolio',
          uploadedAt: new Date()
        },
        {
          id: 'file5',
          name: 'portfolio.png',
          size: 1024000,
          type: 'image/png',
          url: 'https://cloudinary.com/portfolio.png',
          cloudinaryId: 'portfolio_123',
          category: 'portfolio',
          uploadedAt: new Date()
        }
      ];

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
          customAnswers: []
        });

      expect(response.status).toBe(201);
      expect(response.body.files).toHaveLength(5);
    });
  });

  describe('Maximum Custom Questions (Requirement 8.1)', () => {
    beforeEach(async () => {
      // Create job posting with maximum 5 custom questions
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
            questionText: 'Question 1',
            questionType: 'short_text',
            required: true,
            order: 1
          },
          {
            questionText: 'Question 2',
            questionType: 'long_text',
            required: true,
            order: 2
          },
          {
            questionText: 'Question 3',
            questionType: 'single_choice',
            options: ['Option A', 'Option B', 'Option C'],
            required: true,
            order: 3
          },
          {
            questionText: 'Question 4',
            questionType: 'multiple_choice',
            options: ['Option 1', 'Option 2', 'Option 3'],
            required: false,
            order: 4
          },
          {
            questionText: 'Question 5',
            questionType: 'yes_no',
            required: true,
            order: 5
          }
        ]
      });
    });

    test('should handle application with 5 custom questions', async () => {
      const customAnswers = jobPosting.customQuestions.map((q, i) => ({
        questionId: q._id.toString(),
        questionText: q.questionText,
        questionType: q.questionType,
        answer: q.questionType === 'yes_no' ? 'yes' : 
                q.questionType === 'single_choice' ? 'Option A' :
                q.questionType === 'multiple_choice' ? ['Option 1', 'Option 2'] :
                `Answer to question ${i + 1}`
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
          files: [],
          customAnswers
        });

      expect(response.status).toBe(201);
      expect(response.body.customAnswers).toHaveLength(5);
    });

    test('should handle all custom question types', async () => {
      const customAnswers = [
        {
          questionId: jobPosting.customQuestions[0]._id.toString(),
          answer: 'Short text answer'
        },
        {
          questionId: jobPosting.customQuestions[1]._id.toString(),
          answer: 'This is a long text answer that contains multiple sentences and provides detailed information about the question being asked.'
        },
        {
          questionId: jobPosting.customQuestions[2]._id.toString(),
          answer: 'Option B'
        },
        {
          questionId: jobPosting.customQuestions[3]._id.toString(),
          answer: ['Option 1', 'Option 3']
        },
        {
          questionId: jobPosting.customQuestions[4]._id.toString(),
          answer: 'no'
        }
      ];

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
          customAnswers
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Very Long Text Inputs', () => {
    test('should handle very long cover letter', async () => {
      const longCoverLetter = 'A'.repeat(10000); // 10,000 characters

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            coverLetter: longCoverLetter
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
      expect(response.body.coverLetter).toHaveLength(10000);
    });

    test('should handle very long custom question answer', async () => {
      await JobPosting.findByIdAndUpdate(jobPosting._id, {
        customQuestions: [{
          questionText: 'Tell us about yourself',
          questionType: 'long_text',
          required: true,
          order: 1
        }]
      });

      const longAnswer = 'B'.repeat(5000); // 5,000 characters

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
          customAnswers: [{
            questionId: (await JobPosting.findById(jobPosting._id)).customQuestions[0]._id.toString(),
            answer: longAnswer
          }]
        });

      expect(response.status).toBe(201);
    });

    test('should handle very long experience description', async () => {
      const longTasks = 'C'.repeat(3000); // 3,000 characters

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            experience: [{
              company: 'Test Company',
              position: 'Developer',
              from: new Date('2020-01-01'),
              to: new Date('2022-01-01'),
              tasks: longTasks
            }]
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });

    test('should handle maximum length name', async () => {
      const longName = 'John ' + 'Doe '.repeat(50); // Very long name

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: longName,
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });
  });

  describe('Special Characters', () => {
    test('should handle special characters in name', async () => {
      const specialName = "O'Brien-Smith (José) <Test>";

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: specialName,
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
      expect(response.body.fullName).toBe(specialName);
    });

    test('should handle Unicode characters (Arabic, Chinese, Emoji)', async () => {
      const unicodeName = 'محمد 李明 👨‍💻';

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: unicodeName,
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
      expect(response.body.fullName).toBe(unicodeName);
    });

    test('should handle special characters in custom answers', async () => {
      await JobPosting.findByIdAndUpdate(jobPosting._id, {
        customQuestions: [{
          questionText: 'Test Question',
          questionType: 'long_text',
          required: true,
          order: 1
        }]
      });

      const specialAnswer = 'Test & <script>alert("XSS")</script> "quotes" \'apostrophes\' \\backslash';

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
          customAnswers: [{
            questionId: (await JobPosting.findById(jobPosting._id)).customQuestions[0]._id.toString(),
            answer: specialAnswer
          }]
        });

      expect(response.status).toBe(201);
      // Should be sanitized or escaped
      expect(response.body.customAnswers[0].answer).toBeDefined();
    });

    test('should handle special characters in file names', async () => {
      const files = [
        {
          id: 'file1',
          name: 'résumé (2024) - v1.2 [final].pdf',
          size: 1024000,
          type: 'application/pdf',
          url: 'https://cloudinary.com/resume.pdf',
          cloudinaryId: 'resume_123',
          category: 'resume',
          uploadedAt: new Date()
        }
      ];

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
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });

    test('should handle newlines and tabs in text fields', async () => {
      const textWithFormatting = 'Line 1\nLine 2\n\tIndented\n\n\nMultiple newlines';

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            coverLetter: textWithFormatting
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });

    test('should handle SQL injection attempts', async () => {
      const sqlInjection = "'; DROP TABLE users; --";

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: sqlInjection,
            email: 'test@test.com',
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
      // Should be safely stored without executing SQL
    });

    test('should handle NoSQL injection attempts', async () => {
      const noSqlInjection = { $ne: null };

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: noSqlInjection,
            phone: '+1234567890'
          },
          files: [],
          customAnswers: []
        });

      // Should reject or sanitize
      expect([400, 201]).toContain(response.status);
    });
  });

  describe('Boundary Values', () => {
    test('should handle minimum valid phone number', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1' // Minimum valid
          },
          files: [],
          customAnswers: []
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    test('should handle zero salary expectation', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            expectedSalary: 0
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });

    test('should handle very high salary expectation', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            expectedSalary: 999999999
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });

    test('should handle date boundaries', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id.toString(),
          formData: {
            fullName: 'Test Applicant',
            email: 'test@test.com',
            phone: '+1234567890',
            availableFrom: new Date('1970-01-01'), // Unix epoch
            experience: [{
              company: 'Old Company',
              position: 'Developer',
              from: new Date('1990-01-01'),
              to: new Date('2000-12-31')
            }]
          },
          files: [],
          customAnswers: []
        });

      expect(response.status).toBe(201);
    });
  });
});
