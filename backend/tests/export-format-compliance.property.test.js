const fc = require('fast-check');
const exportService = require('../src/services/exportService');
const { User } = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const ActivityLog = require('../src/models/ActivityLog');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const { jsPDF } = require('jspdf');

/**
 * Property-Based Tests for Export Format Compliance
 * Feature: admin-dashboard-enhancements
 * Property 8: Export Format Compliance
 * Validates: Requirements 3.6, 3.7, 3.8
 */

describe('Property 8: Export Format Compliance', () => {
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
    country: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
  });

  const jobArbitrary = fc.record({
    title: fc.string({ minLength: 1, maxLength: 200 }),
    field: fc.constantFrom('IT', 'Healthcare', 'Education', 'Finance'),
    location: fc.string({ minLength: 1, maxLength: 100 }),
    jobType: fc.constantFrom('full-time', 'part-time', 'contract'),
    status: fc.constantFrom('active', 'closed', 'pending')
  });

  const activityLogArbitrary = fc.record({
    actorName: fc.string({ minLength: 1, maxLength: 100 }),
    actionType: fc.constantFrom(
      'user_registered',
      'job_posted',
      'application_submitted',
      'content_deleted'
    ),
    targetType: fc.string({ minLength: 1, maxLength: 50 }),
    details: fc.string({ minLength: 1, maxLength: 500 }),
    ipAddress: fc.ipV4()
  });

  /**
   * Test: Excel exports should include column headers
   * Requirement 3.6: Excel exports should include column headers and proper formatting
   */
  test('Excel exports should include column headers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 10 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate Excel
          const data = await exportService.fetchDataForExport('users', {});
          const excelBuffer = await exportService.generateExcel(data, 'users');

          // Parse Excel
          const workbook = XLSX.read(excelBuffer);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];

          // Assert: First row contains headers
          const headers = [
            'الاسم',
            'البريد الإلكتروني',
            'نوع المستخدم',
            'الحالة',
            'رقم الهاتف',
            'المدينة',
            'الدولة',
            'تاريخ التسجيل'
          ];

          for (let i = 0; i < headers.length; i++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
            const cell = worksheet[cellAddress];
            expect(cell).toBeDefined();
            expect(cell.v).toBe(headers[i]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Excel exports should create separate sheets for different categories
   * Requirement 3.8: Excel exports should create separate sheets for different data categories
   */
  test('Excel exports should create separate sheets (data + summary)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 10 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate Excel
          const data = await exportService.fetchDataForExport('users', {});
          const excelBuffer = await exportService.generateExcel(data, 'users');

          // Parse Excel
          const workbook = XLSX.read(excelBuffer);

          // Assert: Should have at least 2 sheets (data + summary)
          expect(workbook.SheetNames.length).toBeGreaterThanOrEqual(2);

          // Assert: First sheet is data sheet
          expect(workbook.SheetNames[0]).toBe('المستخدمون');

          // Assert: Second sheet is summary sheet
          expect(workbook.SheetNames[1]).toBe('الملخص');

          // Verify summary sheet has content
          const summarySheet = workbook.Sheets['الملخص'];
          expect(summarySheet).toBeDefined();

          // Check summary has expected metrics
          const summaryData = XLSX.utils.sheet_to_json(summarySheet);
          expect(summaryData.length).toBeGreaterThan(0);
          expect(summaryData[0]).toHaveProperty('المقياس');
          expect(summaryData[0]).toHaveProperty('القيمة');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: CSV exports should include headers
   * Requirement 3.6: CSV exports should include column headers
   */
  test('CSV exports should include headers', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 10 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate CSV
          const data = await exportService.fetchDataForExport('users', {});
          const csvString = await exportService.generateCSV(data, 'users');

          // Parse CSV
          const parsed = Papa.parse(csvString, { header: true });

          // Assert: Headers are present
          const expectedHeaders = [
            'الاسم',
            'البريد الإلكتروني',
            'نوع المستخدم',
            'الحالة',
            'رقم الهاتف',
            'المدينة',
            'الدولة',
            'تاريخ التسجيل'
          ];

          expect(parsed.meta.fields).toEqual(expectedHeaders);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: CSV exports should use proper delimiters
   * Requirement 3.6: CSV exports should use proper formatting
   */
  test('CSV exports should use comma delimiter', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 10 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate CSV
          const data = await exportService.fetchDataForExport('users', {});
          const csvString = await exportService.generateCSV(data, 'users');

          // Assert: CSV uses comma delimiter
          expect(csvString).toContain(',');

          // Parse CSV with comma delimiter
          const parsed = Papa.parse(csvString, { header: true, delimiter: ',' });

          // Assert: Parsing was successful
          expect(parsed.errors.length).toBe(0);
          expect(parsed.data.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: PDF exports should include platform logo
   * Requirement 3.7: PDF exports should include the platform logo
   */
  test('PDF exports should include platform logo text', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 5 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate PDF
          const data = await exportService.fetchDataForExport('users', {});
          const pdfBuffer = await exportService.generatePDF(data, 'users');

          // Assert: PDF buffer is not empty
          expect(pdfBuffer.length).toBeGreaterThan(0);

          // Convert buffer to string to check for logo text
          const pdfString = pdfBuffer.toString('latin1');

          // Assert: PDF contains logo text "Careerak"
          expect(pdfString).toContain('Careerak');
        }
      ),
      { numRuns: 50 } // Reduced runs for performance
    );
  });

  /**
   * Test: PDF exports should include export timestamp
   * Requirement 3.7: PDF exports should include export timestamp
   */
  test('PDF exports should include export timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 5 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate PDF
          const data = await exportService.fetchDataForExport('users', {});
          const pdfBuffer = await exportService.generatePDF(data, 'users');

          // Convert buffer to string to check for timestamp
          const pdfString = pdfBuffer.toString('latin1');

          // Assert: PDF contains timestamp text
          expect(pdfString).toContain('تاريخ التصدير');
        }
      ),
      { numRuns: 50 } // Reduced runs for performance
    );
  });

  /**
   * Test: Activity log exports should include all required fields
   * Requirement 3.9: Activity log exports should include all log fields
   */
  test('activity log exports should include all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(activityLogArbitrary, { minLength: 1, maxLength: 10 }),
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
          await ActivityLog.insertMany(logsWithActor);

          // Action: Fetch and generate CSV
          const data = await exportService.fetchDataForExport('activity_log', {});
          const csvString = await exportService.generateCSV(data, 'activity_log');

          // Parse CSV
          const parsed = Papa.parse(csvString, { header: true });

          // Assert: All required fields are present in headers
          const requiredFields = [
            'التاريخ والوقت',
            'المستخدم',
            'نوع الإجراء',
            'نوع الهدف',
            'التفاصيل',
            'عنوان IP'
          ];

          for (const field of requiredFields) {
            expect(parsed.meta.fields).toContain(field);
          }

          // Assert: Each row has all required fields
          const nonEmptyRows = parsed.data.filter((row) => row['نوع الإجراء']);
          for (const row of nonEmptyRows) {
            for (const field of requiredFields) {
              expect(row).toHaveProperty(field);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Jobs export should include all required fields
   * Requirement 3.6: Exports should include proper formatting
   */
  test('jobs export should include all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(jobArbitrary, { minLength: 1, maxLength: 10 }),
        async (jobsData) => {
          // Setup: Create a company user
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
          await JobPosting.insertMany(jobsWithCompany);

          // Action: Fetch and generate Excel
          const data = await exportService.fetchDataForExport('jobs', {});
          const excelBuffer = await exportService.generateExcel(data, 'jobs');

          // Parse Excel
          const workbook = XLSX.read(excelBuffer);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelData = XLSX.utils.sheet_to_json(worksheet);

          // Assert: Each row has all required fields
          const requiredFields = [
            'عنوان الوظيفة',
            'الشركة',
            'المجال',
            'الموقع',
            'نوع الوظيفة',
            'الحالة',
            'عدد المتقدمين',
            'تاريخ النشر'
          ];

          for (const row of excelData) {
            for (const field of requiredFields) {
              expect(row).toHaveProperty(field);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: Excel exports should have proper formatting
   * Requirement 3.6: Exports should include proper formatting
   */
  test('Excel exports should have proper cell formatting', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 10 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate Excel
          const data = await exportService.fetchDataForExport('users', {});
          const excelBuffer = await exportService.generateExcel(data, 'users');

          // Parse Excel
          const workbook = XLSX.read(excelBuffer);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];

          // Assert: Worksheet has cells
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          expect(range.e.r).toBeGreaterThan(0); // At least header + 1 data row

          // Assert: All cells in header row are defined
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            const cell = worksheet[cellAddress];
            expect(cell).toBeDefined();
            expect(cell.v).toBeTruthy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test: PDF exports should have proper structure
   * Requirement 3.7: PDF exports should include proper formatting
   */
  test('PDF exports should have proper structure with title', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(userArbitrary, { minLength: 1, maxLength: 5 }),
        async (usersData) => {
          // Setup: Insert users
          await User.insertMany(usersData);

          // Action: Fetch and generate PDF
          const data = await exportService.fetchDataForExport('users', {});
          const pdfBuffer = await exportService.generatePDF(data, 'users');

          // Convert buffer to string
          const pdfString = pdfBuffer.toString('latin1');

          // Assert: PDF contains title
          expect(pdfString).toContain('تقرير المستخدمين');

          // Assert: PDF contains page numbers
          expect(pdfString).toContain('صفحة');
        }
      ),
      { numRuns: 50 } // Reduced runs for performance
    );
  });
});
