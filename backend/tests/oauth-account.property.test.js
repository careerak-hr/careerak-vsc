/**
 * Property-Based Tests for OAuthAccount Model
 * 
 * Property 1: OAuth Account Uniqueness
 * For any user and OAuth provider, there should be at most one OAuthAccount record.
 * Validates: Requirements 1.5
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const OAuthAccount = require('../src/models/OAuthAccount');
const User = require('../src/models/User');

// MongoDB Memory Server for testing
const { MongoMemoryServer } = require('mongodb-memory-server');

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

beforeEach(async () => {
  await OAuthAccount.deleteMany({});
  // Use the base User model's collection
  await mongoose.connection.collection('users').deleteMany({});
});

describe('OAuthAccount Property-Based Tests', () => {
  /**
   * Property 1: OAuth Account Uniqueness
   * For any user and provider combination, there should be at most one OAuthAccount
   */
  test('Property 1: OAuth Account Uniqueness - no duplicate user+provider combinations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          provider: fc.constantFrom('google', 'facebook', 'linkedin'),
          providerId: fc.string({ minLength: 10, maxLength: 50 }),
          email: fc.emailAddress(),
          displayName: fc.string({ minLength: 3, maxLength: 50 })
        }),
        async (oauthData) => {
          // Create a test user directly in the collection
          const userDoc = {
            email: 'test@example.com',
            password: 'hashedpassword123',
            role: 'Employee',
            phone: '+201234567890',
            country: 'Egypt',
            userType: 'Individual',
            privacyAccepted: true
          };
          
          const result = await mongoose.connection.collection('users').insertOne(userDoc);
          const userId = result.insertedId;

          // First creation should succeed
          const firstAccount = await OAuthAccount.create({
            userId: userId,
            provider: oauthData.provider,
            providerId: oauthData.providerId,
            email: oauthData.email,
            displayName: oauthData.displayName
          });

          expect(firstAccount).toBeDefined();
          expect(firstAccount.userId.toString()).toBe(userId.toString());
          expect(firstAccount.provider).toBe(oauthData.provider);

          // Attempt to create duplicate should fail
          let duplicateError = null;
          try {
            await OAuthAccount.create({
              userId: userId,
              provider: oauthData.provider,
              providerId: 'different-provider-id',
              email: 'different@example.com'
            });
          } catch (error) {
            duplicateError = error;
          }

          // Should have thrown a duplicate key error
          expect(duplicateError).toBeDefined();
          expect(duplicateError.code).toBe(11000); // MongoDB duplicate key error

          // Verify only one account exists for this user+provider
          const accounts = await OAuthAccount.find({
            userId: userId,
            provider: oauthData.provider
          });
          expect(accounts).toHaveLength(1);

          // Cleanup
          await OAuthAccount.deleteMany({ userId: userId });
          await mongoose.connection.collection('users').deleteOne({ _id: userId });
        }
      ),
      { numRuns: 20 } // Run 20 test cases
    );
  });

  /**
   * Property 2: Provider ID Uniqueness
   * For any provider and providerId combination, there should be at most one OAuthAccount
   */
  test('Property 2: Provider ID Uniqueness - no duplicate provider+providerId combinations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          provider: fc.constantFrom('google', 'facebook', 'linkedin'),
          providerId: fc.string({ minLength: 10, maxLength: 50 }),
          email: fc.emailAddress()
        }),
        async (oauthData) => {
          // Create two different users directly in the collection
          const user1Doc = {
            email: 'user1@example.com',
            password: 'hashedpassword123',
            role: 'Employee',
            phone: '+201234567891',
            country: 'Egypt',
            userType: 'Individual',
            privacyAccepted: true
          };
          
          const user2Doc = {
            email: 'user2@example.com',
            password: 'hashedpassword123',
            role: 'Employee',
            phone: '+201234567892',
            country: 'Egypt',
            userType: 'Individual',
            privacyAccepted: true
          };

          const result1 = await mongoose.connection.collection('users').insertOne(user1Doc);
          const result2 = await mongoose.connection.collection('users').insertOne(user2Doc);
          const user1Id = result1.insertedId;
          const user2Id = result2.insertedId;

          // First account creation should succeed
          const firstAccount = await OAuthAccount.create({
            userId: user1Id,
            provider: oauthData.provider,
            providerId: oauthData.providerId,
            email: oauthData.email
          });

          expect(firstAccount).toBeDefined();

          // Attempt to create account with same provider+providerId for different user should fail
          let duplicateError = null;
          try {
            await OAuthAccount.create({
              userId: user2Id,
              provider: oauthData.provider,
              providerId: oauthData.providerId, // Same providerId
              email: 'different@example.com'
            });
          } catch (error) {
            duplicateError = error;
          }

          // Should have thrown a duplicate key error
          expect(duplicateError).toBeDefined();
          expect(duplicateError.code).toBe(11000);

          // Cleanup
          await OAuthAccount.deleteMany({});
          await mongoose.connection.collection('users').deleteMany({});
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3: Token Encryption
   * For any access token or refresh token, it should be encrypted when saved
   */
  test('Property 3: Token Encryption - tokens are encrypted in database', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          provider: fc.constantFrom('google', 'facebook', 'linkedin'),
          providerId: fc.string({ minLength: 10, maxLength: 50 }),
          accessToken: fc.string({ minLength: 20, maxLength: 100 }),
          refreshToken: fc.string({ minLength: 20, maxLength: 100 })
        }),
        async (oauthData) => {
          const userDoc = {
            email: 'test@example.com',
            password: 'hashedpassword123',
            role: 'Employee',
            phone: '+201234567893',
            country: 'Egypt',
            userType: 'Individual',
            privacyAccepted: true
          };
          
          const result = await mongoose.connection.collection('users').insertOne(userDoc);
          const userId = result.insertedId;

          const originalAccessToken = oauthData.accessToken;
          const originalRefreshToken = oauthData.refreshToken;

          // Create account with tokens
          const account = await OAuthAccount.create({
            userId: userId,
            provider: oauthData.provider,
            providerId: oauthData.providerId,
            accessToken: originalAccessToken,
            refreshToken: originalRefreshToken
          });

          // Retrieve from database
          const savedAccount = await OAuthAccount.findById(account._id);

          // Tokens in database should be encrypted (different from original)
          expect(savedAccount.accessToken).not.toBe(originalAccessToken);
          expect(savedAccount.refreshToken).not.toBe(originalRefreshToken);

          // Encrypted tokens should contain ':' separator (iv:encrypted)
          expect(savedAccount.accessToken).toContain(':');
          expect(savedAccount.refreshToken).toContain(':');

          // Decrypted tokens should match original
          const decrypted = savedAccount.getDecryptedTokens();
          expect(decrypted.accessToken).toBe(originalAccessToken);
          expect(decrypted.refreshToken).toBe(originalRefreshToken);

          // Cleanup
          await OAuthAccount.deleteMany({});
          await mongoose.connection.collection('users').deleteMany({});
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4: Valid Provider Values
   * For any OAuthAccount, the provider must be one of: google, facebook, linkedin
   */
  test('Property 4: Valid Provider Values - only allowed providers accepted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        async (invalidProvider) => {
          // Skip if it's actually a valid provider
          if (['google', 'facebook', 'linkedin'].includes(invalidProvider)) {
            return true;
          }

          const userDoc = {
            email: 'test@example.com',
            password: 'hashedpassword123',
            role: 'Employee',
            phone: '+201234567894',
            country: 'Egypt',
            userType: 'Individual',
            privacyAccepted: true
          };
          
          const result = await mongoose.connection.collection('users').insertOne(userDoc);
          const userId = result.insertedId;

          let validationError = null;
          try {
            await OAuthAccount.create({
              userId: userId,
              provider: invalidProvider,
              providerId: 'test-provider-id'
            });
          } catch (error) {
            validationError = error;
          }

          // Should have thrown a validation error
          expect(validationError).toBeDefined();
          expect(validationError.name).toBe('ValidationError');

          // Cleanup
          await mongoose.connection.collection('users').deleteMany({});
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 5: Timestamps
   * For any OAuthAccount, connectedAt and lastUsed should be valid dates
   */
  test('Property 5: Timestamps - connectedAt and lastUsed are valid dates', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          provider: fc.constantFrom('google', 'facebook', 'linkedin'),
          providerId: fc.string({ minLength: 10, maxLength: 50 })
        }),
        async (oauthData) => {
          const userDoc = {
            email: 'test@example.com',
            password: 'hashedpassword123',
            role: 'Employee',
            phone: '+201234567895',
            country: 'Egypt',
            userType: 'Individual',
            privacyAccepted: true
          };
          
          const result = await mongoose.connection.collection('users').insertOne(userDoc);
          const userId = result.insertedId;

          const beforeCreate = new Date();

          const account = await OAuthAccount.create({
            userId: userId,
            provider: oauthData.provider,
            providerId: oauthData.providerId
          });

          const afterCreate = new Date();

          // connectedAt should be a valid date between before and after
          expect(account.connectedAt).toBeInstanceOf(Date);
          expect(account.connectedAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
          expect(account.connectedAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());

          // lastUsed should be a valid date
          expect(account.lastUsed).toBeInstanceOf(Date);
          expect(account.lastUsed.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
          expect(account.lastUsed.getTime()).toBeLessThanOrEqual(afterCreate.getTime());

          // Cleanup
          await OAuthAccount.deleteMany({});
          await mongoose.connection.collection('users').deleteMany({});
        }
      ),
      { numRuns: 20 }
    );
  });
});
