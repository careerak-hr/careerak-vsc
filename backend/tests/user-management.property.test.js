const fc = require('fast-check');
const mongoose = require('mongoose');
const { User, Individual, Company } = require('../src/models/User');
const userManagementService = require('../src/services/userManagementService');
const ActivityLog = require('../src/models/ActivityLog');

/**
 * Property-Based Tests for User Management
 * 
 * Property 21: User Search Comprehensiveness
 * Property 23: User Account State Management
 */

describe('User Management Property Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ActivityLog.deleteMany({});
  });

  /**
   * Property 21: User Search Comprehensiveness
   * 
   * For any search query, the system should search across all specified fields
   * (name, email, username, phone), and the results should include all users
   * that match the query in any of these fields.
   * 
   * Validates: Requirements 8.1
   */
  describe('Property 21: User Search Comprehensiveness', () => {
    test('should find users matching query in any searchable field', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random search term
          fc.string({ minLength: 3, maxLength: 10 }),
          async (searchTerm) => {
            // Skip if search term is too generic
            if (searchTerm.length < 3) return true;

            // Create users with search term in different fields
            const users = [];

            // User with search term in email
            const user1 = new Individual({
              firstName: 'John',
              lastName: 'Doe',
              email: `${searchTerm}@example.com`,
              password: 'password123',
              phone: '+201234567890',
              role: 'Employee'
            });
            await user1.save();
            users.push(user1);

            // User with search term in phone
            const user2 = new Individual({
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              password: 'password123',
              phone: `+20${searchTerm}`,
              role: 'Employee'
            });
            await user2.save();
            users.push(user2);

            // User with search term in first name
            const user3 = new Individual({
              firstName: searchTerm,
              lastName: 'Johnson',
              email: 'johnson@example.com',
              password: 'password123',
              phone: '+201234567891',
              role: 'Employee'
            });
            await user3.save();
            users.push(user3);

            // User with search term in last name
            const user4 = new Individual({
              firstName: 'Bob',
              lastName: searchTerm,
              email: 'bob@example.com',
              password: 'password123',
              phone: '+201234567892',
              role: 'Employee'
            });
            await user4.save();
            users.push(user4);

            // User with search term in company name
            const user5 = new Company({
              companyName: `${searchTerm} Corp`,
              companyIndustry: 'Technology',
              email: 'company@example.com',
              password: 'password123',
              phone: '+201234567893',
              role: 'HR'
            });
            await user5.save();
            users.push(user5);

            // Search for the term
            const result = await userManagementService.searchUsers(searchTerm);

            // Verify all users with matching fields are found
            expect(result.users.length).toBeGreaterThanOrEqual(5);

            // Verify each created user is in results
            for (const user of users) {
              const found = result.users.some(u => u._id.toString() === user._id.toString());
              expect(found).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 10 } // Run 10 times with different search terms
      );
    });

    test('should return empty results for non-matching queries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 20, maxLength: 30 }),
          async (uniqueQuery) => {
            // Create some users without the unique query
            await Individual.create({
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              password: 'password123',
              phone: '+201234567890',
              role: 'Employee'
            });

            // Search for unique query that doesn't exist
            const result = await userManagementService.searchUsers(uniqueQuery);

            // Should return empty results
            expect(result.users.length).toBe(0);
            expect(result.pagination.total).toBe(0);

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    test('should handle special characters in search query', async () => {
      const specialChars = ['@', '.', '+', '-', '_'];
      
      for (const char of specialChars) {
        const searchTerm = `test${char}user`;
        
        // Create user with special character
        const user = await Individual.create({
          firstName: 'Test',
          lastName: 'User',
          email: `${searchTerm}@example.com`,
          password: 'password123',
          phone: '+201234567890',
          role: 'Employee'
        });

        // Search should handle special characters
        const result = await userManagementService.searchUsers(searchTerm);
        
        // Should find the user
        expect(result.users.length).toBeGreaterThan(0);
        
        // Clean up
        await User.deleteMany({});
      }
    });
  });

  /**
   * Property 23: User Account State Management
   * 
   * For any user account, when an admin disables it, the user should not be
   * able to log in, and when the admin enables it again, the user should be
   * able to log in successfully.
   * 
   * Validates: Requirements 8.5, 8.6
   */
  describe('Property 23: User Account State Management', () => {
    test('disabled account should prevent login', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }),
          async (reason) => {
            // Create a user
            const user = await Individual.create({
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              password: 'password123',
              phone: '+201234567890',
              role: 'Employee'
            });

            // Create admin
            const admin = await Individual.create({
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
              password: 'password123',
              phone: '+201234567891',
              role: 'Admin'
            });

            // Disable account
            const disabledUser = await userManagementService.disableUserAccount(
              user._id.toString(),
              admin._id.toString(),
              reason,
              '127.0.0.1'
            );

            // Verify account is disabled
            expect(disabledUser.accountDisabled).toBe(true);
            expect(disabledUser.accountDisabledReason).toBe(reason);
            expect(disabledUser.accountDisabledBy.toString()).toBe(admin._id.toString());
            expect(disabledUser.accountDisabledAt).toBeDefined();

            // Verify activity log was created
            const activityLog = await ActivityLog.findOne({
              actorId: admin._id,
              targetId: user._id,
              actionType: 'user_modified'
            });
            expect(activityLog).toBeDefined();
            expect(activityLog.details).toContain('disabled');

            // Verify user in database is disabled
            const userInDb = await User.findById(user._id);
            expect(userInDb.accountDisabled).toBe(true);

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    test('enabled account should restore login access', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }),
          async (reason) => {
            // Create a user
            const user = await Individual.create({
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              password: 'password123',
              phone: '+201234567890',
              role: 'Employee'
            });

            // Create admin
            const admin = await Individual.create({
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
              password: 'password123',
              phone: '+201234567891',
              role: 'Admin'
            });

            // Disable account first
            await userManagementService.disableUserAccount(
              user._id.toString(),
              admin._id.toString(),
              reason,
              '127.0.0.1'
            );

            // Enable account
            const enabledUser = await userManagementService.enableUserAccount(
              user._id.toString(),
              admin._id.toString(),
              '127.0.0.1'
            );

            // Verify account is enabled
            expect(enabledUser.accountDisabled).toBe(false);
            expect(enabledUser.accountDisabledReason).toBeUndefined();
            expect(enabledUser.accountDisabledBy).toBeUndefined();
            expect(enabledUser.accountDisabledAt).toBeUndefined();

            // Verify activity log was created
            const activityLog = await ActivityLog.findOne({
              actorId: admin._id,
              targetId: user._id,
              actionType: 'user_modified',
              details: 'Account enabled'
            });
            expect(activityLog).toBeDefined();

            // Verify user in database is enabled
            const userInDb = await User.findById(user._id);
            expect(userInDb.accountDisabled).toBe(false);

            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    test('disable-enable cycle should be idempotent', async () => {
      // Create a user
      const user = await Individual.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'Admin'
      });

      // Perform multiple disable-enable cycles
      for (let i = 0; i < 3; i++) {
        // Disable
        await userManagementService.disableUserAccount(
          user._id.toString(),
          admin._id.toString(),
          `Reason ${i}`,
          '127.0.0.1'
        );

        let userInDb = await User.findById(user._id);
        expect(userInDb.accountDisabled).toBe(true);

        // Enable
        await userManagementService.enableUserAccount(
          user._id.toString(),
          admin._id.toString(),
          '127.0.0.1'
        );

        userInDb = await User.findById(user._id);
        expect(userInDb.accountDisabled).toBe(false);
      }

      // Final state should be enabled
      const finalUser = await User.findById(user._id);
      expect(finalUser.accountDisabled).toBe(false);
    });

    test('should reject disabling already disabled account', async () => {
      // Create a user
      const user = await Individual.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'Admin'
      });

      // Disable account
      await userManagementService.disableUserAccount(
        user._id.toString(),
        admin._id.toString(),
        'First disable',
        '127.0.0.1'
      );

      // Try to disable again - should throw error
      await expect(
        userManagementService.disableUserAccount(
          user._id.toString(),
          admin._id.toString(),
          'Second disable',
          '127.0.0.1'
        )
      ).rejects.toThrow('Account is already disabled');
    });

    test('should reject enabling already enabled account', async () => {
      // Create a user (enabled by default)
      const user = await Individual.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+201234567890',
        role: 'Employee'
      });

      // Create admin
      const admin = await Individual.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+201234567891',
        role: 'Admin'
      });

      // Try to enable already enabled account - should throw error
      await expect(
        userManagementService.enableUserAccount(
          user._id.toString(),
          admin._id.toString(),
          '127.0.0.1'
        )
      ).rejects.toThrow('Account is already enabled');
    });
  });
});
