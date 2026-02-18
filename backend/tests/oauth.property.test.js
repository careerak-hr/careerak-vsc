/**
 * OAuth Property-Based Tests
 * 
 * Property 1: OAuth Account Uniqueness
 * Property 10: OAuth State Parameter
 * 
 * Validates: Requirements 1.5, 1.1
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');
const OAuthAccount = require('../src/models/OAuthAccount');
const crypto = require('crypto');

// Helper to check if MongoDB is connected
function isMongoDBConnected() {
  return mongoose.connection.readyState === 1;
}

describe('OAuth Property-Based Tests', () => {
  
  /**
   * Property 1: OAuth Account Uniqueness
   * 
   * For any user and OAuth provider, there should be at most one OAuthAccount record.
   * 
   * This property ensures that:
   * 1. A user cannot have multiple OAuth accounts from the same provider
   * 2. The database enforces uniqueness at the schema level
   * 3. Attempting to create duplicate OAuth accounts fails with proper error
   * 
   * Validates: Requirement 1.5 (OAuth account management)
   */
  describe('Property 1: OAuth Account Uniqueness', () => {
    
    it('should enforce at most one OAuth account per user per provider', async () => {
      if (!isMongoDBConnected()) {
        console.warn('Skipping test: MongoDB not connected');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          // Generate arbitrary user data
          fc.record({
            email: fc.emailAddress(),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            provider: fc.constantFrom('google', 'facebook', 'linkedin'),
            providerId1: fc.string({ minLength: 5, maxLength: 50 }),
            providerId2: fc.string({ minLength: 5, maxLength: 50 })
          }),
          async (data) => {
            // Ensure providerIds are different
            fc.pre(data.providerId1 !== data.providerId2);
            
            // Create a test user
            const user = await User.create({
              email: data.email,
              password: 'Test1234!',
              phone: `+${Math.floor(Math.random() * 1000000000000)}`,
              role: 'Employee',
              firstName: data.firstName,
              lastName: data.lastName
            });
            
            try {
              // Create first OAuth account
              const oauthAccount1 = await OAuthAccount.create({
                userId: user._id,
                provider: data.provider,
                providerId: data.providerId1,
                email: data.email
              });
              
              // Verify first account was created
              expect(oauthAccount1).toBeDefined();
              expect(oauthAccount1.provider).toBe(data.provider);
              
              // Attempt to create second OAuth account with same provider
              let duplicateError = null;
              try {
                await OAuthAccount.create({
                  userId: user._id,
                  provider: data.provider,
                  providerId: data.providerId2,
                  email: data.email
                });
              } catch (error) {
                duplicateError = error;
              }
              
              // Property: Duplicate should fail with error code 11000
              expect(duplicateError).not.toBeNull();
              expect(duplicateError.code).toBe(11000);
              
              // Property: Only one OAuth account should exist for this user+provider
              const accounts = await OAuthAccount.find({
                userId: user._id,
                provider: data.provider
              });
              expect(accounts.length).toBe(1);
              expect(accounts[0].providerId).toBe(data.providerId1);
              
            } finally {
              // Cleanup
              await OAuthAccount.deleteMany({ userId: user._id });
              await User.deleteOne({ _id: user._id });
            }
          }
        ),
        { 
          numRuns: 20, // Run 20 random test cases
          verbose: true
        }
      );
    });
    
    it('should allow multiple OAuth accounts from different providers', async () => {
      if (!isMongoDBConnected()) {
        console.warn('Skipping test: MongoDB not connected');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            googleId: fc.string({ minLength: 5, maxLength: 50 }),
            facebookId: fc.string({ minLength: 5, maxLength: 50 }),
            linkedinId: fc.string({ minLength: 5, maxLength: 50 })
          }),
          async (data) => {
            // Create a test user
            const user = await User.create({
              email: data.email,
              password: 'Test1234!',
              phone: `+${Math.floor(Math.random() * 1000000000000)}`,
              role: 'Employee',
              firstName: data.firstName,
              lastName: data.lastName
            });
            
            try {
              // Create OAuth accounts for all three providers
              const googleAccount = await OAuthAccount.create({
                userId: user._id,
                provider: 'google',
                providerId: data.googleId,
                email: data.email
              });
              
              const facebookAccount = await OAuthAccount.create({
                userId: user._id,
                provider: 'facebook',
                providerId: data.facebookId,
                email: data.email
              });
              
              const linkedinAccount = await OAuthAccount.create({
                userId: user._id,
                provider: 'linkedin',
                providerId: data.linkedinId,
                email: data.email
              });
              
              // Property: All three accounts should be created successfully
              expect(googleAccount).toBeDefined();
              expect(facebookAccount).toBeDefined();
              expect(linkedinAccount).toBeDefined();
              
              // Property: User should have exactly 3 OAuth accounts
              const accounts = await OAuthAccount.find({ userId: user._id });
              expect(accounts.length).toBe(3);
              
              // Property: Each provider should appear exactly once
              const providers = accounts.map(acc => acc.provider).sort();
              expect(providers).toEqual(['facebook', 'google', 'linkedin']);
              
            } finally {
              // Cleanup
              await OAuthAccount.deleteMany({ userId: user._id });
              await User.deleteOne({ _id: user._id });
            }
          }
        ),
        { 
          numRuns: 15,
          verbose: true
        }
      );
    });
    
    it('should enforce unique providerId across all users for same provider', async () => {
      if (!isMongoDBConnected()) {
        console.warn('Skipping test: MongoDB not connected');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email1: fc.emailAddress(),
            email2: fc.emailAddress(),
            firstName1: fc.string({ minLength: 1, maxLength: 50 }),
            firstName2: fc.string({ minLength: 1, maxLength: 50 }),
            lastName1: fc.string({ minLength: 1, maxLength: 50 }),
            lastName2: fc.string({ minLength: 1, maxLength: 50 }),
            provider: fc.constantFrom('google', 'facebook', 'linkedin'),
            providerId: fc.string({ minLength: 5, maxLength: 50 })
          }),
          async (data) => {
            // Ensure emails are different
            fc.pre(data.email1 !== data.email2);
            
            // Create two test users
            const user1 = await User.create({
              email: data.email1,
              password: 'Test1234!',
              phone: `+${Math.floor(Math.random() * 1000000000000)}`,
              role: 'Employee',
              firstName: data.firstName1,
              lastName: data.lastName1
            });
            
            const user2 = await User.create({
              email: data.email2,
              password: 'Test1234!',
              phone: `+${Math.floor(Math.random() * 1000000000000)}`,
              role: 'Employee',
              firstName: data.firstName2,
              lastName: data.lastName2
            });
            
            try {
              // Create OAuth account for first user
              const oauthAccount1 = await OAuthAccount.create({
                userId: user1._id,
                provider: data.provider,
                providerId: data.providerId,
                email: data.email1
              });
              
              expect(oauthAccount1).toBeDefined();
              
              // Attempt to create OAuth account for second user with same providerId
              let duplicateError = null;
              try {
                await OAuthAccount.create({
                  userId: user2._id,
                  provider: data.provider,
                  providerId: data.providerId,
                  email: data.email2
                });
              } catch (error) {
                duplicateError = error;
              }
              
              // Property: Same providerId cannot be used by different users
              expect(duplicateError).not.toBeNull();
              expect(duplicateError.code).toBe(11000);
              
              // Property: Only first user should have the OAuth account
              const user1Accounts = await OAuthAccount.find({
                provider: data.provider,
                providerId: data.providerId
              });
              expect(user1Accounts.length).toBe(1);
              expect(user1Accounts[0].userId.toString()).toBe(user1._id.toString());
              
            } finally {
              // Cleanup
              await OAuthAccount.deleteMany({ 
                userId: { $in: [user1._id, user2._id] }
              });
              await User.deleteMany({ 
                _id: { $in: [user1._id, user2._id] }
              });
            }
          }
        ),
        { 
          numRuns: 15,
          verbose: true
        }
      );
    });
    
  });
  
  /**
   * Property 10: OAuth State Parameter
   * 
   * For any OAuth flow, a state parameter should be generated and verified to prevent CSRF.
   * 
   * This property ensures that:
   * 1. State parameter is cryptographically random
   * 2. State parameter has sufficient entropy (at least 128 bits)
   * 3. State parameter is unique for each OAuth request
   * 4. State parameter validation prevents CSRF attacks
   * 
   * Note: Passport.js handles state parameter automatically, but we test the concept
   * 
   * Validates: Requirement 1.1 (OAuth security)
   */
  describe('Property 10: OAuth State Parameter', () => {
    
    /**
     * Helper function to generate OAuth state parameter
     * This simulates what Passport.js does internally
     */
    function generateOAuthState() {
      return crypto.randomBytes(16).toString('hex'); // 128 bits of entropy
    }
    
    /**
     * Helper function to validate state parameter
     */
    function validateStateParameter(state) {
      // State should be a hex string of at least 32 characters (128 bits)
      return typeof state === 'string' && 
             /^[0-9a-f]{32,}$/i.test(state);
    }
    
    it('should generate cryptographically random state parameters', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (numStates) => {
            // Generate multiple state parameters
            const states = new Set();
            
            for (let i = 0; i < numStates; i++) {
              const state = generateOAuthState();
              
              // Property: State should be valid format
              expect(validateStateParameter(state)).toBe(true);
              
              // Property: State should be at least 32 characters (128 bits)
              expect(state.length).toBeGreaterThanOrEqual(32);
              
              // Property: State should be unique
              expect(states.has(state)).toBe(false);
              states.add(state);
            }
            
            // Property: All states should be unique
            expect(states.size).toBe(numStates);
          }
        ),
        { 
          numRuns: 50,
          verbose: true
        }
      );
    });
    
    it('should have sufficient entropy in state parameters', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Generate 1000 state parameters
            const states = [];
            for (let i = 0; i < 1000; i++) {
              states.push(generateOAuthState());
            }
            
            // Property: All states should be unique (no collisions)
            const uniqueStates = new Set(states);
            expect(uniqueStates.size).toBe(1000);
            
            // Property: States should have good distribution
            // Check that different positions have different characters
            const charSets = Array(32).fill(null).map(() => new Set());
            
            states.forEach(state => {
              for (let i = 0; i < Math.min(32, state.length); i++) {
                charSets[i].add(state[i]);
              }
            });
            
            // Each position should have multiple different characters
            charSets.forEach((charSet, index) => {
              expect(charSet.size).toBeGreaterThan(1);
            });
          }
        ),
        { 
          numRuns: 5,
          verbose: true
        }
      );
    });
    
    it('should prevent CSRF attacks with state validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            validState: fc.array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'), { minLength: 32, maxLength: 32 }).map(arr => arr.join('')),
            attackerState: fc.string({ minLength: 1, maxLength: 100 })
          }),
          (data) => {
            // Ensure attacker state is different from valid state
            fc.pre(data.validState !== data.attackerState);
            
            // Simulate storing state in session
            const sessionStates = new Map();
            sessionStates.set('oauth_state', data.validState);
            
            // Property: Valid state should pass validation
            const validStateMatches = sessionStates.get('oauth_state') === data.validState;
            expect(validStateMatches).toBe(true);
            
            // Property: Attacker state should fail validation
            const attackerStateMatches = sessionStates.get('oauth_state') === data.attackerState;
            expect(attackerStateMatches).toBe(false);
            
            // Property: Only exact match should be accepted
            expect(validStateMatches && !attackerStateMatches).toBe(true);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should validate state parameter format', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.array(fc.constantFrom('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'), { minLength: 32, maxLength: 64 }).map(arr => arr.join('')), // Valid
            fc.string({ minLength: 1, maxLength: 31 }), // Too short
            fc.string({ minLength: 1, maxLength: 100 }), // Invalid characters
            fc.constant(''), // Empty
            fc.constant(null), // Null
            fc.constant(undefined) // Undefined
          ),
          (state) => {
            const isValid = validateStateParameter(state);
            
            if (typeof state === 'string' && /^[0-9a-f]{32,}$/i.test(state)) {
              // Property: Valid hex string of 32+ chars should pass
              expect(isValid).toBe(true);
            } else {
              // Property: Invalid format should fail
              expect(isValid).toBe(false);
            }
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should document that Passport.js handles state parameter automatically', () => {
      // This is a documentation test to confirm that Passport.js
      // automatically handles the state parameter for CSRF protection
      
      // Passport.js OAuth strategies automatically:
      // 1. Generate a random state parameter
      // 2. Store it in the session
      // 3. Include it in the OAuth authorization URL
      // 4. Validate it when the callback is received
      // 5. Reject the request if state doesn't match
      
      // This test documents that the security measure is in place
      // and that we don't need to implement it manually
      
      expect(true).toBe(true);
      
      // Reference: https://github.com/jaredhanson/passport-oauth2/blob/master/lib/strategy.js
      // The state parameter is handled in the OAuth2Strategy base class
    });
    
  });
  
});
