const fc = require('fast-check');
const dataExportService = require('../src/services/dataExportService');
const { User } = require('../src/models/User');
const DataExportRequest = require('../src/models/DataExportRequest');
const mongoose = require('mongoose');

// Feature: settings-page-enhancements, Property 20: Data Export Time Limit
describe('Property 20: Data Export Time Limit', () => {
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

  test('export processing completes within reasonable time', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateUserData(),
        fc.subarray(['profile', 'activity'], { minLength: 1 }),
        fc.constantFrom('json', 'csv'),
        
        async (userData, dataTypes, format) => {
          const user = new User(userData);
          await user.save();

          const startTime = Date.now();
          const exportRequest = await dataExportService.requestExport(user._id, {
            dataTypes,
            format
          });

          let attempts = 0;
          const maxAttempts = 100;
          let completedRequest;

          while (attempts < maxAttempts) {
            completedRequest = await DataExportRequest.findById(exportRequest._id);
            
            if (completedRequest.status === 'completed' || completedRequest.status === 'failed') {
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          const processingTime = Date.now() - startTime;

          expect(['completed', 'failed']).toContain(completedRequest.status);
          expect(processingTime).toBeLessThan(10000);

          if (completedRequest.status === 'completed') {
            expect(completedRequest.completedAt).toBeDefined();
            expect(completedRequest.completedAt).not.toBeNull();
            expect(completedRequest.completedAt.getTime()).toBeGreaterThanOrEqual(
              completedRequest.requestedAt.getTime()
            );
          }
        }
      ),
      { numRuns: 20, timeout: 15000 }
    );
  }, 60000);

  test('export request tracks processing time accurately', async () => {
    await fc.assert(
      fc.asyncProperty(
        generateUserData(),
        
        async (userData) => {
          const user = new User(userData);
          await user.save();

          const exportRequest = await dataExportService.requestExport(user._id, {
            dataTypes: ['profile'],
            format: 'json'
          });

          await new Promise(resolve => setTimeout(resolve, 200));

          const completedRequest = await DataExportRequest.findById(exportRequest._id);

          if (completedRequest.status === 'completed') {
            const processingTime = completedRequest.completedAt - completedRequest.requestedAt;
            expect(processingTime).toBeGreaterThan(0);
            expect(processingTime).toBeLessThan(1000);
          }
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  }, 60000);
});
