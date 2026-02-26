/**
 * End-to-End Test: Admin Data Export with Filters
 * 
 * Test Flow:
 * 1. Admin login
 * 2. Apply filters to data
 * 3. Export data in various formats (Excel, CSV, PDF)
 * 4. Verify export matches applied filters
 * 5. Verify export file format and content
 * 
 * Validates: Requirements 3.1-3.9, 12.4, 12.5
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const JobPosting = require('../../src/models/JobPosting');
const JobApplication = require('../../src/models/JobApplication');
const EducationalCourse = require('../../src/models/EducationalCourse');
const ActivityLog = require('../../src/models/ActivityLog');
const { generateToken } = require('../../src/utils/auth');

describe('E2E: Admin Data Export with Filters', () => {
  let adminUser;
  let adminToken;
  let testUsers;
  let testJobs;
  let testApplications;
  let testCourses;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await JobApplication.deleteMany({});
    await EducationalCourse.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
      userType: 'admin'
    });

    adminToken = generateToken(adminUser._id);

    // Create test users with different types and dates
    testUsers = await User.insertMany([
      {
        name: 'Job Seeker 1',
        email: 'seeker1@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'jobSeeker',
        createdAt: new Date('2024-01-15'),
        isActive: true
      },
      {
        name: 'Job Seeker 2',
        email: 'seeker2@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'jobSeeker',
        createdAt: new Date('2024-02-20'),
        isActive: true
      },
      {
        name: 'Employer 1',
        email: 'employer1@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'employer',
        createdAt: new Date('2024-01-10'),
        isActive: true
      },
      {
        name: 'Disabled User',
        email: 'disabled@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'jobSeeker',
        createdAt: new Date('2024-03-01'),
        isActive: false
      }
    ]);

    // Create test jobs
    testJobs = await JobPosting.insertMany([
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        employerId: testUsers[2]._id,
        status: 'active',
        createdAt: new Date('2024-02-01')
      },
      {
        title: 'Data Analyst',
        company: 'Data Inc',
        location: 'New York',
        employerId: testUsers[2]._id,
        status: 'closed',
        createdAt: new Date('2024-01-20')
      },
      {
        title: 'Frontend Developer',
        company: 'Web Solutions',
        location: 'San Francisco',
        employerId: testUsers[2]._id,
        status: 'pending',
        createdAt: new Date('2024-02-15')
      }
    ]);

    // Create test applications
    testApplications = await JobApplication.insertMany([
      {
        jobId: testJobs[0]._id,
        applicantId: testUsers[0]._id,
        status: 'pending',
        createdAt: new Date('2024-02-05')
      },
      {
        jobId: testJobs[0]._id,
        applicantId: testUsers[1]._id,
        status: 'accepted',
        createdAt: new Date('2024-02-10')
      },
      {
        jobId: testJobs[1]._id,
        applicantId: testUsers[0]._id,
        status: 'rejected',
        createdAt: new Date('2024-01-25')
      }
    ]);

    // Create test courses
    testCourses = await EducationalCourse.insertMany([
      {
        title: 'React Basics',
        instructor: 'John Doe',
        duration: 40,
        level: 'beginner',
        createdAt: new Date('2024-01-05')
      },
      {
        title: 'Node.js Advanced',
        instructor: 'Jane Smith',
        duration: 60,
        level: 'advanced',
        createdAt: new Date('2024-02-10')
      }
    ]);
  });

  test('Complete flow: login → apply filters → export users to Excel → verify export', async () => {
    // Step 1: Admin login (token already generated)
    expect(adminToken).toBeDefined();

    // Step 2: Apply filters - export only active job seekers
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          userType: 'jobSeeker',
          isActive: true,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      })
      .expect(200);

    // Step 3: Verify export response
    expect(exportResponse.body).toHaveProperty('downloadUrl');
    expect(exportResponse.body).toHaveProperty('filename');
    expect(exportResponse.body).toHaveProperty('expiresAt');
    expect(exportResponse.body.filename).toMatch(/\.xlsx$/);

    // Step 4: Verify export metadata
    expect(exportResponse.body.recordCount).toBe(2); // 2 active job seekers
    expect(exportResponse.body.format).toBe('excel');
  });

  test('Export users to CSV format', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'csv',
        filters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      })
      .expect(200);

    expect(exportResponse.body.filename).toMatch(/\.csv$/);
    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.recordCount).toBe(4); // All 4 users
  });

  test('Export users to PDF format', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'pdf',
        filters: {
          userType: 'employer'
        }
      })
      .expect(200);

    expect(exportResponse.body.filename).toMatch(/\.pdf$/);
    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.recordCount).toBe(1); // 1 employer
  });

  test('Export jobs with status filter', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          status: 'active'
        }
      })
      .expect(200);

    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.recordCount).toBe(1); // 1 active job
  });

  test('Export applications with date range filter', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/applications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          startDate: '2024-02-01',
          endDate: '2024-02-28'
        }
      })
      .expect(200);

    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.recordCount).toBe(2); // 2 applications in February
  });

  test('Export courses with all data', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {}
      })
      .expect(200);

    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.recordCount).toBe(2); // All 2 courses
  });

  test('Export activity log with action filter', async () => {
    // Create some activity logs
    await ActivityLog.insertMany([
      {
        adminId: adminUser._id,
        action: 'user_created',
        targetType: 'User',
        targetId: testUsers[0]._id,
        details: { userName: 'User 1' },
        ipAddress: '192.168.1.1',
        timestamp: new Date('2024-02-01')
      },
      {
        adminId: adminUser._id,
        action: 'job_approved',
        targetType: 'JobPosting',
        targetId: testJobs[0]._id,
        details: { jobTitle: 'Software Engineer' },
        ipAddress: '192.168.1.1',
        timestamp: new Date('2024-02-02')
      }
    ]);

    const exportResponse = await request(app)
      .post('/api/admin/export/activity-log')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          action: 'user_created'
        }
      })
      .expect(200);

    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.recordCount).toBe(1); // 1 user_created action
  });

  test('Export with empty filters returns all data', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {}
      })
      .expect(200);

    expect(exportResponse.body.recordCount).toBe(4); // All 4 users
  });

  test('Export with invalid format returns error', async () => {
    await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'invalid_format',
        filters: {}
      })
      .expect(400);
  });

  test('Export with invalid date range returns error', async () => {
    await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          startDate: '2024-12-31',
          endDate: '2024-01-01'
        }
      })
      .expect(400);
  });

  test('Export requires authentication', async () => {
    await request(app)
      .post('/api/admin/export/users')
      .send({
        format: 'excel',
        filters: {}
      })
      .expect(401);
  });

  test('Export requires admin role', async () => {
    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'User123!@#',
      role: 'user',
      userType: 'jobSeeker'
    });

    const userToken = generateToken(regularUser._id);

    await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        format: 'excel',
        filters: {}
      })
      .expect(403);
  });

  test('Export URL expires after specified time', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {}
      })
      .expect(200);

    expect(exportResponse.body.expiresAt).toBeDefined();
    
    // Verify expiration is in the future
    const expiresAt = new Date(exportResponse.body.expiresAt);
    const now = new Date();
    expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
  });

  test('Multiple exports can be generated simultaneously', async () => {
    // Generate multiple exports at once
    const exports = await Promise.all([
      request(app)
        .post('/api/admin/export/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ format: 'excel', filters: {} }),
      request(app)
        .post('/api/admin/export/jobs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ format: 'csv', filters: {} }),
      request(app)
        .post('/api/admin/export/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ format: 'pdf', filters: {} })
    ]);

    // Verify all exports succeeded
    exports.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.downloadUrl).toBeDefined();
    });

    // Verify different filenames
    const filenames = exports.map(r => r.body.filename);
    const uniqueFilenames = new Set(filenames);
    expect(uniqueFilenames.size).toBe(3);
  });

  test('Export includes timestamp in filename', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {}
      })
      .expect(200);

    // Filename should include timestamp
    expect(exportResponse.body.filename).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('Export with complex filters', async () => {
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          userType: 'jobSeeker',
          isActive: true,
          startDate: '2024-01-01',
          endDate: '2024-02-28'
        }
      })
      .expect(200);

    expect(exportResponse.body.recordCount).toBe(2); // 2 active job seekers in date range
  });

  test('Export empty dataset returns valid file', async () => {
    // Export with filters that match no records
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          userType: 'nonexistent_type'
        }
      })
      .expect(200);

    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.recordCount).toBe(0);
  });
});
