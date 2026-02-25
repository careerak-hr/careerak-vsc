const fc = require('fast-check');
const exportService = require('../src/services/exportService');
const { User } = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');
const EducationalCourse = require('../src/models/EducationalCourse');
const TrainingCourse = require('../src/models/TrainingCourse');
const ActivityLog = require('../src/models/ActivityLog');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const XLSX = require('xlsx');
const Papa = require('papaparse');

/**
 * Property-Based Tests for Export Data Completeness
 * Feature: admin-dashboard-enhancements
 * Property 7: Export Data Completeness
 * Validates: Requirements 3.1-3.5, 12.4
 */

describe('Property 7: Export Data Completeness', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  /**
   * Arbitraries for generating test data
   */
  const userArbitrary = fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 50 }),
    type: fc.constantFrom('jobSeeker', 'company', 'freelancer'),
    phone: fc.option(fc.string({ minLength: 10, maxLength: 15 })),
    city: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    country: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
    status: fc.constantFrom('active', 'inactive', 'suspended')
  });

  const jobArbitrary = fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }),
    field: fc.constantFrom('IT', 'Healthcare', 'Education', 'Finance', 'Engineering'),
    location: fc.string({ minLength: 1, maxLength: 100 }),
    jobType: fc.constantFrom('full-time', 'part-time', 'contract', 'freelance'),
    status: fc.constantFrom('active', 'closed', 'pending'),
    applicationsCount: fc.nat({ max: 100 })
  });

  const applicationArbitrary = fc.record({
    status: fc.constantFrom('pending', 'accepted', 'rejected', 'reviewed')
  });

  const courseArbitrary = fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }),
    field: fc.constantFrom('IT', 'Healthcare', 'Education', 'Finance', 'Engineering'),
    duration: fc.string({ minLength: 1, maxLength: 50 }),
    price: fc.nat({ max: 10000 }),
    enrollmentsCount: fc.nat({ max: 500 })
  });

  const activityLogArbitrary = fc.record({
    actorName: fc.string({ minLength: 1, maxLength: 100 }),
    actionType: fc.constantFrom(
      'user_registered',
      'job_posted',
      'application_submitted',
      'application_status_changed',
      'course_published',
      'content_deleted'
    ),
    targetType: fc.string({ minLength: 1, maxLength: 50 }),
    details: fc.string({ minLength: 1, maxLength: 500 }),
    ipAddress: fc.ipV4()
  });

  /**
   * Test: Users export completeness
   * For any set of users, the exported data should contain all users
   */
  test('users export should contain all users from database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 20 }),
        async (usersData) => {
          // Setup: Insert users into database
          const users = await User.insertMany(usersData);

          // Action: Fetch data for export
          const exportedData = await exportService.fetchDataForExport('users', {});

          // Assert: All users are in exported data
          expect(exportedData.length).toBe(users.length);

          // Verify each user is present
          for (const user of users) {
            const found = exportedData.find(
              (u) => u._id.toString() === user._id.toString()
            );
            expect(found).toBeDefined();
            expect(found.email).toBe(user.email);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Jobs export completeness
   * For any set of jobs, the exported data should contain all jobs
   */
  test('jobs export should contain all jobs from database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobArbitrary, { minLength: 1, maxLength: 20 }),
        async (jobsData) => {
          // Setup: Create a company user first
          const company = await User.create({
            name: 'Test Company',
            email: 'company@test.com',
            password: 'password123',
            type: 'company'
          });

          // Add companyId to jobs
          const jobsWithCompany = jobsData.map((job) => ({
            ...job,
            companyId: company._id
          }));

          // Insert jobs
          const jobs = await JobPosting.insertMany(jobsWithCompany);

          // Action: Fetch data for export
          const exportedData = await exportService.fetchDataForExport('jobs', {});

          // Assert: All jobs are in exported data
          expect(exportedData.length).toBe(jobs.length);

          // Verify each job is present
          for (const job of jobs) {
            const found = exportedData.find(
              (j) => j._id.toString() === job._id.toString()
            );
            expect(found).toBeDefined();
            expect(found.title).toBe(job.title);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Applications export completeness
   * For any set of applications, the exported data should contain all applications
   */
  test('applications export should contain all applications from database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(applicationArbitrary, { minLength: 1, maxLength: 20 }),
        async (applicationsData) => {
          // Setup: Create user and job
          const user = await User.create({
            name: 'Test User',
            email: 'user@test.com',
            password: 'password123',
            type: 'jobSeeker'
          });

          const company = await User.create({
            name: 'Test Company',
            email: 'company@test.com',
            password: 'password123',
            type: 'company'
          });

          const job = await JobPosting.create({
            title: 'Test Job',
            companyId: company._id,
            field: 'IT',
            location: 'Remote',
            jobType: 'full-time'
          });

          // Add userId and jobId to applications
          const applicationsWithRefs = applicationsData.map((app) => ({
            ...app,
            userId: user._id,
            jobId: job._id
          }));

          // Insert applications
          const applications = await JobApplication.insertMany(applicationsWithRefs);

          // Action: Fetch data for export
          const exportedData = await exportService.fetchDataForExport('applications', {});

          // Assert: All applications are in exported data
          expect(exportedData.length).toBe(applications.length);

          // Verify each application is present
          for (const app of applications) {
            const found = exportedData.find(
              (a) => a._id.toString() === app._id.toString()
            );
            expect(found).toBeDefined();
            expect(found.status).toBe(app.status);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Courses export completeness
   * For any set of courses, the exported data should contain all courses
   */
  test('courses export should contain all courses from database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(courseArbitrary, { minLength: 1, maxLength: 20 }),
        async (coursesData) => {
          // Setup: Split courses between educational and training
          const halfLength = Math.floor(coursesData.length / 2);
          const eduCoursesData = coursesData.slice(0, halfLength);
          const trainCoursesData = coursesData.slice(halfLength);

          // Insert educational courses
          const eduCourses = await EducationalCourse.insertMany(eduCoursesData);

          // Insert training courses
          const trainCourses = await TrainingCourse.insertMany(trainCoursesData);

          // Action: Fetch data for export
          const exportedData = await exportService.fetchDataForExport('courses', {});

          // Assert: All courses are in exported data
          expect(exportedData.length).toBe(eduCourses.length + trainCourses.length);

          // Verify each educational course is present
          for (const course of eduCourses) {
            const found = exportedData.find(
              (c) => c._id.toString() === course._id.toString()
            );
            expect(found).toBeDefined();
            expect(found.title).toBe(course.title);
            expect(found.courseType).toBe('educational');
          }

          // Verify each training course is present
          for (const course of trainCourses) {
            const found = exportedData.find(
              (c) => c._id.toString() === course._id.toString()
            );
            expect(found).toBeDefined();
            expect(found.title).toBe(course.title);
            expect(found.courseType).toBe('training');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Activity log export completeness
   * For any set of activity logs, the exported data should contain all logs
   */
  test('activity log export should contain all logs from database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(activityLogArbitrary, { minLength: 1, maxLength: 20 }),
        async (logsData) => {
          // Setup: Create a user for actorId
          const user = await User.create({
            name: 'Test User',
            email: 'user@test.com',
            password: 'password123',
            type: 'jobSeeker'
          });

          // Add actorId to logs
          const logsWithActor = logsData.map((log) => ({
            ...log,
            actorId: user._id,
            targetId: new mongoose.Types.ObjectId()
          }));

          // Insert logs
          const logs = await ActivityLog.insertMany(logsWithActor);

          // Action: Fetch data for export
          const exportedData = await exportService.fetchDataForExport('activity_log', {});

          // Assert: All logs are in exported data
          expect(exportedData.length).toBe(logs.length);

          // Verify each log is present
          for (const log of logs) {
            const found = exportedData.find(
              (l) => l._id.toString() === log._id.toString()
            );
            expect(found).toBeDefined();
            expect(found.actionType).toBe(log.actionType);
            expect(found.details).toBe(log.details);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Export with filters should only include filtered data
   * For any set of users with different types, filtering by type should only return matching users
   */
  test('filtered export should only contain matching records', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 5, maxLength: 20 }),
        fc.constantFrom('jobSeeker', 'company', 'freelancer'),
        async (usersData, filterType) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch data with filter
          const exportedData = await exportService.fetchDataForExport('users', {
            type: filterType
          });

          // Assert: All exported users match the filter
          for (const user of exportedData) {
            expect(user.type).toBe(filterType);
          }

          // Assert: Count matches expected
          const expectedCount = usersData.filter((u) => u.type === filterType).length;
          expect(exportedData.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Excel export should contain all data
   * For any set of users, the Excel export should contain all users
   */
  test('Excel export should contain all users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 10 }),
        async (usersData) => {
          // Setup: Insert users
          const users = await User.insertMany(usersData);

          // Action: Fetch and generate Excel
          const data = await exportService.fetchDataForExport('users', {});
          const excelBuffer = await exportService.generateExcel(data, 'users');

          // Parse Excel
          const workbook = XLSX.read(excelBuffer);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelData = XLSX.utils.sheet_to_json(worksheet);

          // Assert: All users are in Excel
          expect(excelData.length).toBe(users.length);

          // Verify each user is present
          for (const user of users) {
            const found = excelData.find((row) => row['البريد الإلكتروني'] === user.email);
            expect(found).toBeDefined();
          }
        }
      ),
      { numRuns: 50 } // Reduced runs for performance
    );
  });

  /**
   * Test: CSV export should contain all data
   * For any set of users, the CSV export should contain all users
   */
  test('CSV export should contain all users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 10 }),
        async (usersData) => {
          // Setup: Insert users
          const users = await User.insertMany(usersData);

          // Action: Fetch and generate CSV
          const data = await exportService.fetchDataForExport('users', {});
          const csvString = await exportService.generateCSV(data, 'users');

          // Parse CSV
          const parsed = Papa.parse(csvString, { header: true });
          const csvData = parsed.data;

          // Assert: All users are in CSV (excluding empty last row)
          const nonEmptyRows = csvData.filter((row) => row['البريد الإلكتروني']);
          expect(nonEmptyRows.length).toBe(users.length);

          // Verify each user is present
          for (const user of users) {
            const found = nonEmptyRows.find((row) => row['البريد الإلكتروني'] === user.email);
            expect(found).toBeDefined();
          }
        }
      ),
      { numRuns: 50 } // Reduced runs for performance
    );
  });
});
