const fc = require('fast-check');
const dataExportService = require('../src/services/dataExportService');
const { User } = require('../src/models/User');
const DataExportRequest = require('../src/models/DataExportRequest');
const mongoose = require('mongoose');

// Feature: settings-page-enhancements, Property 18: Data Export Completeness
describe('Property 18: Data Export Completeness', () => {
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

  /**
   * Property: For any data export request, the exported data should include 
   * all selected data types with no missing records
   * 
   * Validates: Requirements 11.6
   */
  test('exported data includes all selected data types', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate user data
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 50 }),
          lastName: fc.string({ minLength: 2, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          role: fc.constantFrom('HR', 'Employee', 'Admin'),
          phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
          country: fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE'),
          specialization: fc.option(fc.string({ minLength: 2, maxLength: 20 })),
          interests: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 5 })
        }),
        // Generate data types to export
        fc.subarray(['profile', 'activity', 'messages', 'applications', 'courses'], { minLength: 1 }),
        // Generate format
        fc.constantFrom('json', 'csv', 'pdf'),
        
        async (userData, dataTypes, format) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Collect data
          const collectedData = await dataExportService.collectUserData(user._id, dataTypes);

          // Verify all requested data types are present
          for (const dataType of dataTypes) {
            expect(collectedData).toHaveProperty(dataType);
            
            // Verify data is not null or undefined
            expect(collectedData[dataType]).toBeDefined();
            
            // For profile, verify it matches user data
            if (dataType === 'profile' && collectedData.profile) {
              expect(collectedData.profile.email).toBe(userData.email);
              expect(collectedData.profile.role).toBe(userData.role);
              expect(collectedData.profile.phone).toBe(userData.phone);
            }
          }

          // Verify metadata is present
          expect(collectedData).toHaveProperty('exportDate');
          expect(collectedData).toHaveProperty('userId');
          expect(collectedData.userId.toString()).toBe(user._id.toString());
        }
      ),
      { numRuns: 50, timeout: 10000 }
    );
  }, 60000);

  test('exported data includes all profile fields when profile is requested', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 50 }),
          lastName: fc.string({ minLength: 2, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          role: fc.constantFrom('HR', 'Employee', 'Admin'),
          phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
          country: fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE'),
          city: fc.option(fc.string({ minLength: 2, maxLength: 30 })),
          bio: fc.option(fc.string({ minLength: 10, maxLength: 200 })),
          specialization: fc.option(fc.string({ minLength: 2, maxLength: 20 })),
          interests: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { maxLength: 5 })
        }),
        
        async (userData) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Collect profile data
          const collectedData = await dataExportService.collectUserData(user._id, ['profile']);

          // Verify profile exists
          expect(collectedData.profile).toBeDefined();
          expect(collectedData.profile).not.toBeNull();

          // Verify all fields are present
          expect(collectedData.profile.email).toBe(userData.email);
          expect(collectedData.profile.role).toBe(userData.role);
          expect(collectedData.profile.phone).toBe(userData.phone);
          
          // Verify optional fields
          if (userData.city) {
            expect(collectedData.profile.city).toBe(userData.city);
          }
          if (userData.bio) {
            expect(collectedData.profile.bio).toBe(userData.bio);
          }
          
          // Verify arrays
          expect(collectedData.profile.interests).toEqual(userData.interests);
        }
      ),
      { numRuns: 50, timeout: 10000 }
    );
  }, 60000);

  test('exported data with "all" includes all available data types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 50 }),
          lastName: fc.string({ minLength: 2, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          role: fc.constantFrom('HR', 'Employee', 'Admin'),
          phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
          country: fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE')
        }),
        
        async (userData) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Collect all data
          const collectedData = await dataExportService.collectUserData(user._id, ['all']);

          // Verify all data types are present
          expect(collectedData).toHaveProperty('profile');
          expect(collectedData).toHaveProperty('activity');
          expect(collectedData).toHaveProperty('messages');
          expect(collectedData).toHaveProperty('applications');
          expect(collectedData).toHaveProperty('courses');

          // Verify profile is complete
          expect(collectedData.profile).toBeDefined();
          expect(collectedData.profile.email).toBe(userData.email);
        }
      ),
      { numRuns: 30, timeout: 10000 }
    );
  }, 60000);

  test('no data is lost during collection process', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 50 }),
          lastName: fc.string({ minLength: 2, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          role: fc.constantFrom('HR', 'Employee', 'Admin'),
          phone: fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
          country: fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE'),
          interests: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 5, maxLength: 15 })
        }),
        
        async (userData) => {
          // Create user
          const user = new User(userData);
          await user.save();

          // Collect data multiple times
          const collection1 = await dataExportService.collectUserData(user._id, ['profile']);
          const collection2 = await dataExportService.collectUserData(user._id, ['profile']);

          // Verify consistency - same data collected each time
          expect(collection1.profile.email).toBe(collection2.profile.email);
          expect(collection1.profile.phone).toBe(collection2.profile.phone);
          expect(collection1.profile.interests).toEqual(collection2.profile.interests);
          
          // Verify no data loss - all interests present
          expect(collection1.profile.interests.length).toBe(userData.interests.length);
          expect(collection2.profile.interests.length).toBe(userData.interests.length);
        }
      ),
      { numRuns: 30, timeout: 10000 }
    );
  }, 60000);
});
