/**
 * Unit Tests for Application Controller
 * Feature: apply-page-enhancements
 * 
 * These tests verify specific examples, edge cases, and error conditions
 * for the application submission API endpoints.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const JobApplication = require('../src/models/JobApplication');
const ApplicationDraft = require('../src/models/ApplicationDraft');
const JobPosting = require('../src/models/JobPosting');
const { User, Individual, Company } = require('../src/models/User');
const jobApplicationController = require('../src/controllers/jobApplicationController');

let mongoServer;

// Setup and teardown
beforeAll(async () => {
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  await JobApplication.deleteMany({});
  await ApplicationDraft.deleteMany({});
  await JobPosting.deleteMany({});
  await User.deleteMany({});
});

// Helper function to create test data
async function createTestData() {
  const applicant = await Individual.create({
    firstName: 'John',
    lastName: 'Doe',
    email: `test${Date.now()}@example.com`,
    password: 'hashedPassword123',
    role: 'Employee',
    phone: `+1${Date.now()}`,
    country: 'USA'
  });

  const company = await Company.create({
    companyName: 'Test Company',
    companyIndustry: 'Technology',
    email: `company${Date.now()}@test.com`,
    password: 'hashedPassword123',
    role: 'HR',
    phone: `+2${Date.now()}`,
    country: 'USA'
  });

  const jobPosting = await JobPosting.create({
    title: 'Software Engineer',
    description: 'Test job description',
    requirements: 'Test requirements',
    location: {
      type: 'Remote',
      city: 'New York',
      country: 'USA',
      coordinates: {
        type: 'Point',
        coordinates: [-74.006, 40.7128] // NYC coordinates [longitude, latitude]
      }
    },
    postedBy: company._id,
    status: 'Open'
  });

  return { applicant, company, jobPosting };
}

// Mock request and response objects
function createMockReqRes(user, body = {}, params = {}) {
  const req = {
    user: { id: user._id.toString(), role: user.role },
    body,
    params
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };

  return { req, res };
}

describe('Application Controller - Submit Application', () => {
  test('should successfully submit application with valid data', async () => {
    const { applicant, company, jobPosting } = await createTestData();

    const applicationData = {
      jobPostingId: jobPosting._id.toString(),
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      country: 'USA',
      city: 'New York',
      education: [{
        level: 'Bachelor',
        degree: 'Computer Science',
        institution: 'MIT',
        year: '2020'
      }],
      experience: [{
        company: 'Tech Corp',
        position: 'Developer',
        from: new Date('2020-01-01'),
        to: new Date('2023-01-01'),
        current: false
      }],
      computerSkills: [{
        skill: 'JavaScript',
        proficiency: 'expert'
      }]
    };

    const { req, res } = createMockReqRes(applicant, applicationData);

    await jobApplicationController.submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Application submitted successfully',
        data: expect.objectContaining({
          applicationId: expect.any(String),
          status: 'Submitted'
        })
      })
    );

    // Verify application was created in database
    const application = await JobApplication.findOne({ applicant: applicant._id });
    expect(application).not.toBeNull();
    expect(application.status).toBe('Submitted');
  });

  test('should return 400 for missing required fields', async () => {
    const { applicant } = await createTestData();

    const { req, res } = createMockReqRes(applicant, {
      // Missing required fields
      jobPostingId: 'some-id'
    });

    await jobApplicationController.submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR'
        })
      })
    );
  });

  test('should return 404 for non-existent job posting', async () => {
    const { applicant } = await createTestData();

    const { req, res } = createMockReqRes(applicant, {
      jobPostingId: new mongoose.Types.ObjectId().toString(),
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone
    });

    await jobApplicationController.submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'JOB_NOT_FOUND'
        })
      })
    );
  });

  test('should return 409 for duplicate application', async () => {
    const { applicant, jobPosting } = await createTestData();

    // Create existing application
    await JobApplication.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      status: 'Submitted'
    });

    const { req, res } = createMockReqRes(applicant, {
      jobPostingId: jobPosting._id.toString(),
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone
    });

    await jobApplicationController.submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'DUPLICATE_APPLICATION'
        })
      })
    );
  });

  test('should delete draft after successful submission', async () => {
    const { applicant, jobPosting } = await createTestData();

    // Create draft
    await ApplicationDraft.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      step: 3,
      formData: {
        fullName: 'John Doe',
        email: applicant.email
      }
    });

    const { req, res } = createMockReqRes(applicant, {
      jobPostingId: jobPosting._id.toString(),
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone
    });

    await jobApplicationController.submitApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    // Verify draft was deleted
    const draft = await ApplicationDraft.findOne({
      jobPosting: jobPosting._id,
      applicant: applicant._id
    });
    expect(draft).toBeNull();
  });
});

describe('Application Controller - Get Application Details', () => {
  test('should return application details for applicant', async () => {
    const { applicant, jobPosting } = await createTestData();

    const application = await JobApplication.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      status: 'Submitted'
    });

    const { req, res } = createMockReqRes(applicant, {}, { applicationId: application._id.toString() });

    await jobApplicationController.getApplicationDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          _id: application._id
        })
      })
    );
  });

  test('should return 404 for non-existent application', async () => {
    const { applicant } = await createTestData();

    const { req, res } = createMockReqRes(applicant, {}, { 
      applicationId: new mongoose.Types.ObjectId().toString() 
    });

    await jobApplicationController.getApplicationDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'APPLICATION_NOT_FOUND'
        })
      })
    );
  });
});

describe('Application Controller - Withdraw Application', () => {
  test('should successfully withdraw application with Submitted status', async () => {
    const { applicant, jobPosting } = await createTestData();

    const application = await JobApplication.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      status: 'Submitted'
    });

    const { req, res } = createMockReqRes(applicant, {}, { applicationId: application._id.toString() });

    await jobApplicationController.withdrawApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          status: 'Withdrawn'
        })
      })
    );

    // Verify status was updated
    const withdrawnApp = await JobApplication.findById(application._id);
    expect(withdrawnApp.status).toBe('Withdrawn');
    expect(withdrawnApp.withdrawnAt).toBeDefined();
  });

  test('should reject withdrawal for Shortlisted status', async () => {
    const { applicant, jobPosting } = await createTestData();

    const application = await JobApplication.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      status: 'Shortlisted'
    });

    const { req, res } = createMockReqRes(applicant, {}, { applicationId: application._id.toString() });

    await jobApplicationController.withdrawApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'WITHDRAWAL_NOT_ALLOWED'
        })
      })
    );
  });

  test('should reject withdrawal for Accepted status', async () => {
    const { applicant, jobPosting } = await createTestData();

    const application = await JobApplication.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      status: 'Accepted'
    });

    const { req, res } = createMockReqRes(applicant, {}, { applicationId: application._id.toString() });

    await jobApplicationController.withdrawApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('Application Controller - Update Application Status', () => {
  test('should successfully update status to Reviewed', async () => {
    const { applicant, company, jobPosting } = await createTestData();

    const application = await JobApplication.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      status: 'Submitted',
      statusHistory: [{
        status: 'Submitted',
        timestamp: new Date(),
        note: 'Application submitted'
      }]
    });

    const { req, res } = createMockReqRes(company, 
      { status: 'Reviewed', note: 'Application reviewed' }, 
      { applicationId: application._id.toString() }
    );

    await jobApplicationController.updateApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          status: 'Reviewed'
        })
      })
    );

    // Verify status was updated
    const updatedApp = await JobApplication.findById(application._id);
    expect(updatedApp.status).toBe('Reviewed');
    expect(updatedApp.statusHistory).toHaveLength(2);
  });

  test('should return 400 for invalid status', async () => {
    const { applicant, company, jobPosting } = await createTestData();

    const application = await JobApplication.create({
      jobPosting: jobPosting._id,
      applicant: applicant._id,
      fullName: 'John Doe',
      email: applicant.email,
      phone: applicant.phone,
      status: 'Submitted'
    });

    const { req, res } = createMockReqRes(company, 
      { status: 'InvalidStatus' }, 
      { applicationId: application._id.toString() }
    );

    await jobApplicationController.updateApplicationStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_STATUS'
        })
      })
    );
  });
});
