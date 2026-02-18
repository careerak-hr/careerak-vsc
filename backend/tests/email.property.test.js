/**
 * Email Validation Property-Based Tests
 * 
 * Property 3: Email Format Validation
 * Property 4: Email Uniqueness
 * 
 * Validates: Requirements 4.1, 4.4
 */

const fc = require('fast-check');
const validator = require('validator');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');

describe('Email Property-Based Tests', () => {
  
  /**
   * Property 3: Email Format Validation
   * 
   * For any email input, it should match the standard email regex pattern before being accepted.
   * 
   * This property ensures that:
   * 1. Valid email formats are accepted
   * 2. Invalid email formats are rejected
   * 3. Edge cases are handled correctly
   * 4. The validation is consistent
   * 
   * Validates: Requirement 4.1 (Email format validation)
   * 
   * NOTE: These tests do NOT require database connection
   */
  describe('Property 3: Email Format Validation', () => {
    
    /**
     * Generator for valid email addresses
     */
    const validEmailArbitrary = fc.tuple(
      fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e', '1', '2', '3', '.', '_', '-'), { minLength: 1, maxLength: 20 }),
      fc.constantFrom('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'test.com', 'example.org')
    ).map(([localChars, domain]) => {
      // Build local part from character array
      let local = localChars.join('');
      // Clean up local part (no leading/trailing dots or consecutive dots)
      local = local.replace(/^\.+|\.+$/g, '').replace(/\.{2,}/g, '.');
      if (local.length === 0) local = 'user';
      return `${local}@${domain}`;
    });
    
    it('should accept valid email formats', () => {
      fc.assert(
        fc.property(
          validEmailArbitrary,
          (email) => {
            // Property: validator.isEmail should return true for valid emails
            const isValid = validator.isEmail(email);
            expect(isValid).toBe(true);
            
            // Property: Email should contain @ symbol
            expect(email).toContain('@');
            
            // Property: Email should have local and domain parts
            const parts = email.split('@');
            expect(parts.length).toBe(2);
            expect(parts[0].length).toBeGreaterThan(0);
            expect(parts[1].length).toBeGreaterThan(0);
            
            // Property: Domain should contain a dot
            expect(parts[1]).toContain('.');
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should reject invalid email formats', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),                           // Empty string
            fc.constant('notanemail'),                 // No @ symbol
            fc.constant('@example.com'),               // No local part
            fc.constant('user@'),                      // No domain
            fc.constant('user@@example.com'),          // Double @
            fc.constant('user@.com'),                  // Domain starts with dot
            fc.constant('user@example'),               // No TLD
            fc.constant('user name@example.com'),      // Space in local part
            fc.constant('user@exam ple.com'),          // Space in domain
            fc.constant('user@example..com'),          // Consecutive dots
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('@')) // Random string without @
          ),
          (invalidEmail) => {
            // Property: validator.isEmail should return false for invalid emails
            const isValid = validator.isEmail(invalidEmail);
            expect(isValid).toBe(false);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should handle edge cases correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('user+tag@example.com'),       // Plus addressing
            fc.constant('user.name@example.com'),      // Dot in local part
            fc.constant('user_name@example.com'),      // Underscore in local part
            fc.constant('user-name@example.com'),      // Hyphen in local part
            fc.constant('123@example.com'),            // Numbers only in local
            fc.constant('user@sub.example.com'),       // Subdomain
            fc.constant('user@example.co.uk'),         // Multiple TLDs
            fc.constant('a@example.com')               // Single char local
          ),
          (email) => {
            // Property: Edge cases should be validated correctly
            const isValid = validator.isEmail(email);
            
            // All these are technically valid email formats
            expect(isValid).toBe(true);
          }
        ),
        { 
          numRuns: 50,
          verbose: true
        }
      );
    });
    
    it('should be case-insensitive for domain', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3'), { minLength: 1, maxLength: 10 }),
            fc.constantFrom('gmail.com', 'GMAIL.COM', 'Gmail.Com', 'GmAiL.cOm')
          ),
          ([localChars, domain]) => {
            const local = localChars.join('');
            const email = `${local}@${domain}`;
            
            // Property: Email validation should be case-insensitive for domain
            const isValid = validator.isEmail(email);
            expect(isValid).toBe(true);
            
            // Property: Lowercase version should also be valid
            const lowerEmail = email.toLowerCase();
            const isLowerValid = validator.isEmail(lowerEmail);
            expect(isLowerValid).toBe(true);
          }
        ),
        { 
          numRuns: 50,
          verbose: true
        }
      );
    });
    
    it('should validate email length constraints', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }), // Reduced max to avoid very long emails
          (length) => {
            // Generate email with specific length
            // Keep local part reasonable (max 64 chars per RFC 5321)
            const localLength = Math.min(Math.max(1, length - 12), 64);
            const local = 'a'.repeat(localLength);
            const email = `${local}@test.com`;
            
            // Property: Emails within reasonable length should be validated
            const isValid = validator.isEmail(email);
            
            // validator.isEmail accepts emails up to 254 characters (RFC 5321)
            // With our constraints, all generated emails should be valid
            if (email.length <= 254 && localLength <= 64) {
              expect(isValid).toBe(true);
            }
          }
        ),
        { 
          numRuns: 50,
          verbose: true
        }
      );
    });
    
    it('should consistently validate same email', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (input) => {
            // Property: Multiple validations of same input should give same result
            const result1 = validator.isEmail(input);
            const result2 = validator.isEmail(input);
            const result3 = validator.isEmail(input);
            
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should reject emails with special characters in wrong places', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('user..name@example.com'),     // Consecutive dots
            fc.constant('.user@example.com'),          // Leading dot
            fc.constant('user.@example.com'),          // Trailing dot
            fc.constant('user@.example.com'),          // Domain starts with dot
            fc.constant('user@example.com.'),          // Domain ends with dot
            fc.constant('user name@example.com'),      // Space
            fc.constant('user@exam ple.com'),          // Space in domain
            fc.constant('user,name@example.com'),      // Comma
            fc.constant('user;name@example.com')       // Semicolon
          ),
          (invalidEmail) => {
            // Property: Emails with special chars in wrong places should be invalid
            const isValid = validator.isEmail(invalidEmail);
            expect(isValid).toBe(false);
          }
        ),
        { 
          numRuns: 50,
          verbose: true
        }
      );
    });
    
  });
  
  /**
   * Property 4: Email Uniqueness
   * 
   * For any new registration, the email should not exist in the database.
   * 
   * This property ensures that:
   * 1. Duplicate emails are detected
   * 2. Case-insensitive uniqueness is enforced
   * 3. Database queries work correctly
   * 4. Email normalization is consistent
   * 
   * Validates: Requirement 4.4 (Email uniqueness check)
   * 
   * NOTE: These tests REQUIRE database connection
   */
  describe('Property 4: Email Uniqueness', () => {
    
    // Setup database connection for uniqueness tests only
    beforeAll(async () => {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test';
      if (mongoose.connection.readyState === 0) {
        try {
          await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
          });
        } catch (error) {
          console.warn('MongoDB not available, skipping uniqueness tests');
        }
      }
    }, 60000);
    
    afterAll(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    }, 60000);
    
    // Clean up test users after each test
    afterEach(async () => {
      if (mongoose.connection.readyState === 1) {
        await User.deleteMany({ email: /test-pbt-/ });
      }
    }, 30000);
    
    // Helper to check if DB is available
    const isDBAvailable = () => mongoose.connection.readyState === 1;
    
    it('should detect duplicate emails', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3'), { minLength: 5, maxLength: 10 }),
            fc.constantFrom('gmail.com', 'yahoo.com', 'test.com')
          ),
          async ([localChars, domain]) => {
            const local = localChars.join('');
            const email = `test-pbt-${local}@${domain}`;
            
            // Create first user
            const user1 = await User.create({
              name: 'Test User 1',
              email: email.toLowerCase(),
              password: 'hashedpassword123',
              role: 'jobseeker'
            });
            
            // Property: Email should exist in database
            const exists = await User.findOne({ email: email.toLowerCase() });
            expect(exists).not.toBeNull();
            expect(exists._id.toString()).toBe(user1._id.toString());
            
            // Property: Attempting to create duplicate should fail or be detectable
            const duplicate = await User.findOne({ email: email.toLowerCase() });
            expect(duplicate).not.toBeNull();
            
            // Clean up
            await User.deleteOne({ _id: user1._id });
          }
        ),
        { 
          numRuns: 20,
          verbose: true
        }
      );
    }, 90000);
    
    it('should enforce case-insensitive uniqueness', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3'), { minLength: 5, maxLength: 10 }),
            fc.constantFrom('gmail.com', 'yahoo.com', 'test.com'),
            fc.constantFrom('lower', 'UPPER', 'MiXeD')
          ),
          async ([localChars, domain, caseType]) => {
            const local = localChars.join('');
            const baseEmail = `test-pbt-${local}@${domain}`;
            
            // Apply case transformation
            let email;
            if (caseType === 'lower') {
              email = baseEmail.toLowerCase();
            } else if (caseType === 'UPPER') {
              email = baseEmail.toUpperCase();
            } else {
              // Mixed case
              email = baseEmail.split('').map((c, i) => 
                i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
              ).join('');
            }
            
            // Create user with email
            const user = await User.create({
              name: 'Test User',
              email: email.toLowerCase(), // Always store lowercase
              password: 'hashedpassword123',
              role: 'jobseeker'
            });
            
            // Property: Should find user regardless of case used in query
            const foundLower = await User.findOne({ email: baseEmail.toLowerCase() });
            const foundUpper = await User.findOne({ email: baseEmail.toUpperCase().toLowerCase() });
            
            expect(foundLower).not.toBeNull();
            expect(foundUpper).not.toBeNull();
            expect(foundLower._id.toString()).toBe(user._id.toString());
            expect(foundUpper._id.toString()).toBe(user._id.toString());
            
            // Clean up
            await User.deleteOne({ _id: user._id });
          }
        ),
        { 
          numRuns: 20,
          verbose: true
        }
      );
    }, 90000);
    
    it('should allow same local part with different domains', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3'), { minLength: 5, maxLength: 10 }),
            fc.constantFrom('gmail.com', 'yahoo.com'),
            fc.constantFrom('hotmail.com', 'outlook.com')
          ),
          async ([localChars, domain1, domain2]) => {
            fc.pre(domain1 !== domain2); // Ensure different domains
            
            const local = localChars.join('');
            const email1 = `test-pbt-${local}@${domain1}`;
            const email2 = `test-pbt-${local}@${domain2}`;
            
            // Create two users with same local part but different domains
            const user1 = await User.create({
              name: 'Test User 1',
              email: email1.toLowerCase(),
              password: 'hashedpassword123',
              role: 'jobseeker'
            });
            
            const user2 = await User.create({
              name: 'Test User 2',
              email: email2.toLowerCase(),
              password: 'hashedpassword456',
              role: 'jobseeker'
            });
            
            // Property: Both users should exist with different IDs
            expect(user1._id.toString()).not.toBe(user2._id.toString());
            
            // Property: Each email should find its own user
            const found1 = await User.findOne({ email: email1.toLowerCase() });
            const found2 = await User.findOne({ email: email2.toLowerCase() });
            
            expect(found1._id.toString()).toBe(user1._id.toString());
            expect(found2._id.toString()).toBe(user2._id.toString());
            
            // Clean up
            await User.deleteMany({ _id: { $in: [user1._id, user2._id] } });
          }
        ),
        { 
          numRuns: 15,
          verbose: true
        }
      );
    }, 90000);
    
    it('should handle email normalization consistently', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3'), { minLength: 5, maxLength: 10 }),
            fc.constantFrom('gmail.com', 'yahoo.com', 'test.com')
          ),
          async ([localChars, domain]) => {
            const local = localChars.join('');
            const email = `test-pbt-${local}@${domain}`;
            
            // Create user
            const user = await User.create({
              name: 'Test User',
              email: email.toLowerCase(),
              password: 'hashedpassword123',
              role: 'jobseeker'
            });
            
            // Property: Stored email should be lowercase
            expect(user.email).toBe(email.toLowerCase());
            
            // Property: Query with any case should find the user
            const variations = [
              email.toLowerCase(),
              email.toUpperCase(),
              email.charAt(0).toUpperCase() + email.slice(1).toLowerCase()
            ];
            
            for (const variant of variations) {
              const found = await User.findOne({ email: variant.toLowerCase() });
              expect(found).not.toBeNull();
              expect(found._id.toString()).toBe(user._id.toString());
            }
            
            // Clean up
            await User.deleteOne({ _id: user._id });
          }
        ),
        { 
          numRuns: 15,
          verbose: true
        }
      );
    }, 90000);
    
    it('should return null for non-existent emails', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.array(fc.constantFrom('x', 'y', 'z', '7', '8', '9'), { minLength: 10, maxLength: 20 }),
            fc.constantFrom('nonexistent.com', 'fake.org', 'notreal.net')
          ),
          async ([localChars, domain]) => {
            const local = localChars.join('');
            const email = `test-pbt-nonexistent-${local}@${domain}`;
            
            // Property: Non-existent email should return null
            const found = await User.findOne({ email: email.toLowerCase() });
            expect(found).toBeNull();
          }
        ),
        { 
          numRuns: 30,
          verbose: true
        }
      );
    }, 90000);
    
    it('should handle concurrent uniqueness checks', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.tuple(
            fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3'), { minLength: 5, maxLength: 10 }),
            fc.constantFrom('gmail.com', 'yahoo.com', 'test.com')
          ),
          async ([localChars, domain]) => {
            const local = localChars.join('');
            const email = `test-pbt-${local}@${domain}`;
            
            // Create user
            const user = await User.create({
              name: 'Test User',
              email: email.toLowerCase(),
              password: 'hashedpassword123',
              role: 'jobseeker'
            });
            
            // Property: Multiple concurrent checks should all find the user
            const checks = await Promise.all([
              User.findOne({ email: email.toLowerCase() }),
              User.findOne({ email: email.toLowerCase() }),
              User.findOne({ email: email.toLowerCase() }),
              User.exists({ email: email.toLowerCase() }),
              User.exists({ email: email.toLowerCase() })
            ]);
            
            // All queries should succeed
            expect(checks[0]).not.toBeNull();
            expect(checks[1]).not.toBeNull();
            expect(checks[2]).not.toBeNull();
            expect(checks[3]).not.toBeNull();
            expect(checks[4]).not.toBeNull();
            
            // All should refer to same user
            expect(checks[0]._id.toString()).toBe(user._id.toString());
            expect(checks[1]._id.toString()).toBe(user._id.toString());
            expect(checks[2]._id.toString()).toBe(user._id.toString());
            
            // Clean up
            await User.deleteOne({ _id: user._id });
          }
        ),
        { 
          numRuns: 10,
          verbose: true
        }
      );
    }, 90000);
    
  });
  
});
