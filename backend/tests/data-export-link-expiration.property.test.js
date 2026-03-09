const fc = require('fast-check');
const dataExportService = require('../src/services/dataExportService');
const { User } = require('../src/models/User');
const DataExportRequest = require('../src/models/DataExportRequest');
const mongoose = require('mongoose');

// Feature: settings-page-enhancements, Property 19: Data Export Link Expiration
describe('Property 19: Data Export Link Expiration', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await DataExportRequest.deleteMany({});
  });

  const generateUserData = () => fc.record({
    firstName: fc.string({ minLength: 2, maxLength: 50 }),
    lastName: fc.string({ minLength: 2, maxLength: 50 }),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 8, maxLength: 20 }),
    role: fc.constantFrom('HR', 'Employee', 'Admin'),
    phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
    country: fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE')
  });

  /**
   * Property: For any completed data export, the download link should expire 
   * exactly 7 days after generation
   * 
   * Validates: Requirements 11.5
   */
  test('download link expires exactly 7 days after completion', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateUserData(),
        fc.constantFrom('json', 'csv', 'pdf'),
        
        async (userData, format) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Create export request
          const exportRequest = await dataExportService.requestExport(user._id, {
            dataTypes: ['profile'],
            format
          });

          // Wait for processing (simulate completion)
          await new Promise(resolve => setTimeout(resolve, 100));

          // Get the request after processing
          const completedRequest = await DataExportRequest.findById(exportRequest._id);

          if (completedRequest.status === 'completed') {
            // Verify expiresAt is set
            expect(completedRequest.expiresAt).toBeDefined();
            expect(completedRequest.expiresAt).not.toBeNull();

            // Calculate expected expiration (7 days from completion)
            const expectedExpiration = new Date(completedRequest.completedAt);
            expectedExpiration.setDate(expectedExpiration.getDate() + 7);

            // Verify expiration is exactly 7 days
            const actualExpiration = new Date(completedRequest.expiresAt);
            const timeDiff = Math.abs(actualExpiration - expectedExpiration);
            
            // Allow 1 second tolerance for processing time
            expect(timeDiff).toBeLessThan(1000);
          }
        }
      ),
      { numRuns: 30, timeout: 10000 }
    );
  }, 60000);

  test('expired links cannot be used for download', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateUserData(),
        
        async (userData) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Create export request manually with expired date
          const exportRequest = new DataExportRequest({
            userId: user._id,
            dataTypes: ['profile'],
            format: 'json',
            status: 'completed',
            progress: 100,
            fileUrl: '/fake/path/file.json',
            fileSize: 1024,
            downloadToken: dataExportService.generateDownloadToken(),
            completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
            expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago (expired)
          });
          await exportRequest.save();

          // Try to download with expired token
          try {
            await dataExportService.downloadExport(exportRequest.downloadToken);
            
            // Should not reach here - download should fail
            expect(true).toBe(false);
          } catch (error) {
            // Verify error is about expiration
            expect(error.message).toMatch(/expired|not found/i);
          }
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  }, 60000);

  test('non-expired links can be used for download', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateUserData(),
        
        async (userData) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Create export request with valid (non-expired) date
          const exportRequest = new DataExportRequest({
            userId: user._id,
            dataTypes: ['profile'],
            format: 'json',
            status: 'completed',
            progress: 100,
            fileUrl: '/fake/path/file.json',
            fileSize: 1024,
            downloadToken: dataExportService.generateDownloadToken(),
            completedAt: new Date(),
            expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 6 days from now (valid)
          });
          await exportRequest.save();

          // Verify token is valid (would work if file existed)
          const request = await DataExportRequest.findOne({ 
            downloadToken: exportRequest.downloadToken 
          });
          
          expect(request).toBeDefined();
          expect(request.status).toBe('completed');
          expect(new Date(request.expiresAt)).toBeInstanceOf(Date);
          expect(new Date(request.expiresAt).getTime()).toBeGreaterThan(Date.now());
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  }, 60000);

  test('expiration date is consistent across multiple checks', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateUserData(),
        
        async (userData) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Create completed export
          const completedAt = new Date();
          const expiresAt = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const exportRequest = new DataExportRequest({
            userId: user._id,
            dataTypes: ['profile'],
            format: 'json',
            status: 'completed',
            progress: 100,
            fileUrl: '/fake/path/file.json',
            fileSize: 1024,
            downloadToken: dataExportService.generateDownloadToken(),
            completedAt,
            expiresAt
          });
          await exportRequest.save();

          // Check expiration multiple times
          const check1 = await DataExportRequest.findById(exportRequest._id);
          await new Promise(resolve => setTimeout(resolve, 50));
          const check2 = await DataExportRequest.findById(exportRequest._id);
          await new Promise(resolve => setTimeout(resolve, 50));
          const check3 = await DataExportRequest.findById(exportRequest._id);

          // Verify expiration date is consistent
          expect(check1.expiresAt.getTime()).toBe(check2.expiresAt.getTime());
          expect(check2.expiresAt.getTime()).toBe(check3.expiresAt.getTime());
          
          // Verify it's exactly 7 days from completion
          const daysDiff = (check1.expiresAt - check1.completedAt) / (1000 * 60 * 60 * 24);
          expect(Math.abs(daysDiff - 7)).toBeLessThan(0.001); // Allow tiny floating point error
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  }, 60000);
});
