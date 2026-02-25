const exportService = require('../src/services/exportService');
const { User } = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const ActivityLog = require('../src/models/ActivityLog');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const XLSX = require('xlsx');
const Papa = require('papaparse');

/**
 * Unit Tests for Export Service
 * Tests specific examples and edge cases
 * Requirements: 3.1-3.9
 */

describe('Export Service Unit Tests', () => {
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

  describe('Excel Multi-Sheet Generation', () => {
    /**
     * Test: Excel should create separate sheets for data and summary
     * Requirement 3.8: Excel exports should create separate sheets
     */
    test('should create data sheet and summary sheet for users', async () => {
      // Setup: Create users with different types
      await User.create([
        { name: 'User 1', email: 'user1@test.com', password: 'pass123', type: 'jobSeeker' },
        { name: 'User 2', email: 'user2@test.com', password: 'pass123', type: 'company' },
        { name: 'User 3', email: 'user3@test.com', password: 'pass123', type: 'freelancer' },
        { name: 'User 4', email: 'user4@test.com', password: 'pass123', type: 'jobSeeker' }
      ]);

      // Action: Generate Excel
      const data = await exportService.fetchDataForExport('users', {});
      const excelBuffer = await exportService.generateExcel(data, 'users');

      // Parse Excel
      const workbook = XLSX.read(excelBuffer);

      // Assert: Should have 2 sheets
      expect(workbook.SheetNames.length).toBe(2);
      expect(workbook.SheetNames[0]).toBe('المستخدمون');
      expect(workbook.SheetNames[1]).toBe('الملخص');

      // Verify data sheet
      const dataSheet = workbook.Sheets['المستخدمون'];
      const dataRows = XLSX.utils.sheet_to_json(dataSheet);
      expect(dataRows.length).toBe(4);

      // Verify summary sheet
      const summarySheet = workbook.Sheets['الملخص'];
      const summaryRows = XLSX.utils.sheet_to_json(summarySheet);
      expect(summaryRows.length).toBeGreaterThan(0);

      // Check summary contains expected metrics
      const totalUsersRow = summaryRows.find((row) => row['المقياس'] === 'إجمالي المستخدمين');
      expect(totalUsersRow).toBeDefined();
      expect(totalUsersRow['القيمة']).toBe(4);

      const jobSeekersRow = summaryRows.find((row) => row['المقياس'] === 'باحثون عن عمل');
      expect(jobSeekersRow).toBeDefined();
      expect(jobSeekersRow['القيمة']).toBe(2);
    });

    test('should create data sheet and summary sheet for jobs', async () => {
      // Setup: Create company and jobs
      const company = await User.create({
        name: 'Test Company',
        email: 'company@test.com',
        password: 'pass123',
        type: 'company'
      });

      await JobPosting.create([
        { title: 'Job 1', companyId: company._id, field: 'IT', location: 'Remote', jobType: 'full-time', status: 'active' },
        { title: 'Job 2', companyId: company._id, field: 'IT', location: 'Remote', jobType: 'part-time', status: 'active' },
        { title: 'Job 3', companyId: company._id, field: 'IT', location: 'Remote', jobType: 'contract', status: 'closed' }
      ]);

      // Action: Generate Excel
      const data = await exportService.fetchDataForExport('jobs', {});
      const excelBuffer = await exportService.generateExcel(data, 'jobs');

      // Parse Excel
      const workbook = XLSX.read(excelBuffer);

      // Assert: Should have 2 sheets
      expect(workbook.SheetNames.length).toBe(2);
      expect(workbook.SheetNames[0]).toBe('الوظائف');
      expect(workbook.SheetNames[1]).toBe('الملخص');

      // Verify summary sheet
      const summarySheet = workbook.Sheets['الملخص'];
      const summaryRows = XLSX.utils.sheet_to_json(summarySheet);

      const totalJobsRow = summaryRows.find((row) => row['المقياس'] === 'إجمالي الوظائف');
      expect(totalJobsRow).toBeDefined();
      expect(totalJobsRow['القيمة']).toBe(3);

      const activeJobsRow = summaryRows.find((row) => row['المقياس'] === 'وظائف نشطة');
      expect(activeJobsRow).toBeDefined();
      expect(activeJobsRow['القيمة']).toBe(2);
    });
  });

  describe('PDF with Logo and Timestamp', () => {
    /**
     * Test: PDF should include logo and timestamp
     * Requirement 3.7: PDF exports should include platform logo and timestamp
     */
    test('should include logo text in PDF', async () => {
      // Setup: Create a user
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'pass123',
        type: 'jobSeeker'
      });

      // Action: Generate PDF
      const data = await exportService.fetchDataForExport('users', {});
      const pdfBuffer = await exportService.generatePDF(data, 'users');

      // Assert: PDF contains logo text
      const pdfString = pdfBuffer.toString('latin1');
      expect(pdfString).toContain('Careerak');
    });

    test('should include timestamp in PDF', async () => {
      // Setup: Create a user
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'pass123',
        type: 'jobSeeker'
      });

      // Action: Generate PDF
      const data = await exportService.fetchDataForExport('users', {});
      const pdfBuffer = await exportService.generatePDF(data, 'users');

      // Assert: PDF contains timestamp text
      const pdfString = pdfBuffer.toString('latin1');
      expect(pdfString).toContain('تاريخ التصدير');
    });

    test('should include title in PDF', async () => {
      // Setup: Create a user
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'pass123',
        type: 'jobSeeker'
      });

      // Action: Generate PDF
      const data = await exportService.fetchDataForExport('users', {});
      const pdfBuffer = await exportService.generatePDF(data, 'users');

      // Assert: PDF contains title
      const pdfString = pdfBuffer.toString('latin1');
      expect(pdfString).toContain('تقرير المستخدمين');
    });

    test('should include page numbers in PDF', async () => {
      // Setup: Create multiple users to generate multiple pages
      const users = [];
      for (let i = 0; i < 50; i++) {
        users.push({
          name: `User ${i}`,
          email: `user${i}@test.com`,
          password: 'pass123',
          type: 'jobSeeker'
        });
      }
      await User.create(users);

      // Action: Generate PDF
      const data = await exportService.fetchDataForExport('users', {});
      const pdfBuffer = await exportService.generatePDF(data, 'users');

      // Assert: PDF contains page numbers
      const pdfString = pdfBuffer.toString('latin1');
      expect(pdfString).toContain('صفحة');
    });
  });

  describe('CSV Delimiter Handling', () => {
    /**
     * Test: CSV should use comma delimiter
     * Requirement 3.6: CSV exports should use proper formatting
     */
    test('should use comma delimiter in CSV', async () => {
      // Setup: Create users
      await User.create([
        { name: 'User 1', email: 'user1@test.com', password: 'pass123', type: 'jobSeeker' },
        { name: 'User 2', email: 'user2@test.com', password: 'pass123', type: 'company' }
      ]);

      // Action: Generate CSV
      const data = await exportService.fetchDataForExport('users', {});
      const csvString = await exportService.generateCSV(data, 'users');

      // Assert: CSV uses comma delimiter
      expect(csvString).toContain(',');

      // Parse with comma delimiter
      const parsed = Papa.parse(csvString, { header: true, delimiter: ',' });
      expect(parsed.errors.length).toBe(0);
      expect(parsed.data.length).toBeGreaterThan(0);
    });

    test('should handle special characters in CSV', async () => {
      // Setup: Create user with special characters
      await User.create({
        name: 'User, with comma',
        email: 'user@test.com',
        password: 'pass123',
        type: 'jobSeeker',
        city: 'City "with quotes"'
      });

      // Action: Generate CSV
      const data = await exportService.fetchDataForExport('users', {});
      const csvString = await exportService.generateCSV(data, 'users');

      // Parse CSV
      const parsed = Papa.parse(csvString, { header: true });

      // Assert: Special characters are handled correctly
      expect(parsed.errors.length).toBe(0);
      const nonEmptyRows = parsed.data.filter((row) => row['البريد الإلكتروني']);
      expect(nonEmptyRows.length).toBe(1);
      expect(nonEmptyRows[0]['الاسم']).toBe('User, with comma');
    });

    test('should handle empty fields in CSV', async () => {
      // Setup: Create user with empty optional fields
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'pass123',
        type: 'jobSeeker'
        // phone, city, country are undefined
      });

      // Action: Generate CSV
      const data = await exportService.fetchDataForExport('users', {});
      const csvString = await exportService.generateCSV(data, 'users');

      // Parse CSV
      const parsed = Papa.parse(csvString, { header: true });

      // Assert: Empty fields are handled correctly
      expect(parsed.errors.length).toBe(0);
      const nonEmptyRows = parsed.data.filter((row) => row['البريد الإلكتروني']);
      expect(nonEmptyRows.length).toBe(1);
      expect(nonEmptyRows[0]['رقم الهاتف']).toBe('');
      expect(nonEmptyRows[0]['المدينة']).toBe('');
    });
  });

  describe('Export with Empty Data', () => {
    /**
     * Test: Export should handle empty data gracefully
     * Edge case: Empty database
     */
    test('should handle empty users export', async () => {
      // Action: Generate Excel with no data
      const data = await exportService.fetchDataForExport('users', {});
      const excelBuffer = await exportService.generateExcel(data, 'users');

      // Parse Excel
      const workbook = XLSX.read(excelBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Assert: Should have headers but no data rows
      expect(rows.length).toBe(0);

      // Verify headers exist
      const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
      expect(headerRow).toBeDefined();
      expect(headerRow.length).toBeGreaterThan(0);
    });

    test('should handle empty jobs export', async () => {
      // Action: Generate CSV with no data
      const data = await exportService.fetchDataForExport('jobs', {});
      const csvString = await exportService.generateCSV(data, 'jobs');

      // Parse CSV
      const parsed = Papa.parse(csvString, { header: true });

      // Assert: Should have headers but no data rows
      expect(parsed.meta.fields).toBeDefined();
      expect(parsed.meta.fields.length).toBeGreaterThan(0);

      const nonEmptyRows = parsed.data.filter((row) => Object.values(row).some((v) => v));
      expect(nonEmptyRows.length).toBe(0);
    });

    test('should handle empty activity log export', async () => {
      // Action: Generate PDF with no data
      const data = await exportService.fetchDataForExport('activity_log', {});
      const pdfBuffer = await exportService.generatePDF(data, 'activity_log');

      // Assert: PDF should be generated even with no data
      expect(pdfBuffer.length).toBeGreaterThan(0);

      const pdfString = pdfBuffer.toString('latin1');
      expect(pdfString).toContain('سجل النشاطات');
    });
  });

  describe('Filter Support', () => {
    /**
     * Test: Export should respect filters
     * Requirement 3.5: Exports should include only filtered data
     */
    test('should filter users by type', async () => {
      // Setup: Create users with different types
      await User.create([
        { name: 'User 1', email: 'user1@test.com', password: 'pass123', type: 'jobSeeker' },
        { name: 'User 2', email: 'user2@test.com', password: 'pass123', type: 'company' },
        { name: 'User 3', email: 'user3@test.com', password: 'pass123', type: 'jobSeeker' }
      ]);

      // Action: Fetch with filter
      const data = await exportService.fetchDataForExport('users', { type: 'jobSeeker' });

      // Assert: Only jobSeekers are returned
      expect(data.length).toBe(2);
      for (const user of data) {
        expect(user.type).toBe('jobSeeker');
      }
    });

    test('should filter jobs by status', async () => {
      // Setup: Create company and jobs
      const company = await User.create({
        name: 'Test Company',
        email: 'company@test.com',
        password: 'pass123',
        type: 'company'
      });

      await JobPosting.create([
        { title: 'Job 1', companyId: company._id, field: 'IT', location: 'Remote', jobType: 'full-time', status: 'active' },
        { title: 'Job 2', companyId: company._id, field: 'IT', location: 'Remote', jobType: 'part-time', status: 'closed' },
        { title: 'Job 3', companyId: company._id, field: 'IT', location: 'Remote', jobType: 'contract', status: 'active' }
      ]);

      // Action: Fetch with filter
      const data = await exportService.fetchDataForExport('jobs', { status: 'active' });

      // Assert: Only active jobs are returned
      expect(data.length).toBe(2);
      for (const job of data) {
        expect(job.status).toBe('active');
      }
    });

    test('should filter by date range', async () => {
      // Setup: Create users with different dates
      const oldDate = new Date('2023-01-01');
      const recentDate = new Date('2024-01-01');

      await User.create([
        { name: 'Old User', email: 'old@test.com', password: 'pass123', type: 'jobSeeker', createdAt: oldDate },
        { name: 'Recent User', email: 'recent@test.com', password: 'pass123', type: 'jobSeeker', createdAt: recentDate }
      ]);

      // Action: Fetch with date range filter
      const data = await exportService.fetchDataForExport('users', {
        dateRange: {
          start: '2023-12-01',
          end: '2024-12-31'
        }
      });

      // Assert: Only recent user is returned
      expect(data.length).toBe(1);
      expect(data[0].email).toBe('recent@test.com');
    });
  });

  describe('Activity Log Export', () => {
    /**
     * Test: Activity log export should include all required fields
     * Requirement 3.9: Activity log exports should include all fields
     */
    test('should include all required fields in activity log export', async () => {
      // Setup: Create user and activity log
      const user = await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'pass123',
        type: 'jobSeeker'
      });

      await ActivityLog.create({
        actorId: user._id,
        actorName: user.name,
        actionType: 'user_registered',
        targetType: 'user',
        targetId: user._id,
        details: 'User registered successfully',
        ipAddress: '192.168.1.1'
      });

      // Action: Generate CSV
      const data = await exportService.fetchDataForExport('activity_log', {});
      const csvString = await exportService.generateCSV(data, 'activity_log');

      // Parse CSV
      const parsed = Papa.parse(csvString, { header: true });

      // Assert: All required fields are present
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

      // Verify data
      const nonEmptyRows = parsed.data.filter((row) => row['نوع الإجراء']);
      expect(nonEmptyRows.length).toBe(1);
      expect(nonEmptyRows[0]['نوع الإجراء']).toBe('user_registered');
      expect(nonEmptyRows[0]['عنوان IP']).toBe('192.168.1.1');
    });
  });

  describe('Error Handling', () => {
    /**
     * Test: Export should handle invalid data types
     */
    test('should throw error for unknown data type', async () => {
      await expect(
        exportService.fetchDataForExport('invalid_type', {})
      ).rejects.toThrow('Unknown data type: invalid_type');
    });

    test('should throw error for unknown export format', async () => {
      const data = [{ name: 'Test' }];
      
      await expect(
        exportService.processExportJob({
          dataType: 'users',
          format: 'invalid_format',
          filters: {}
        })
      ).rejects.toThrow('Unknown format: invalid_format');
    });
  });
});
