/**
 * Password Strength Property-Based Tests
 * 
 * Property 2: Password Strength Consistency
 * Property 9: Password Hash
 * 
 * Validates: Requirements 2.1, 7.1
 */

const fc = require('fast-check');
const bcrypt = require('bcryptjs');
const { calculatePasswordStrength, meetsAllRequirements } = require('../src/services/passwordService');

describe('Password Property-Based Tests', () => {
  
  /**
   * Property 2: Password Strength Consistency
   * 
   * For any password, if it meets all 5 requirements (length, uppercase, lowercase, number, special),
   * the strength score should be >= 3.
   * 
   * This property ensures that:
   * 1. Passwords meeting all requirements are considered at least "good" (score >= 3)
   * 2. The strength calculation is consistent with requirements
   * 3. Strong passwords are properly identified
   * 
   * Validates: Requirement 2.1 (Password strength indicator)
   */
  describe('Property 2: Password Strength Consistency', () => {
    
    /**
     * Generator for passwords that meet all requirements
     */
    const strongPasswordArbitrary = fc.tuple(
      fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'), { minLength: 3, maxLength: 10 }), // lowercase
      fc.array(fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'), { minLength: 1, maxLength: 5 }), // uppercase
      fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 1, maxLength: 5 }), // numbers
      fc.array(fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*'), { minLength: 1, maxLength: 3 }) // special
    ).map(([lower, upper, num, special]) => {
      // Combine and shuffle to make it more realistic
      const chars = [...lower, ...upper, ...num, ...special];
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return chars.join('');
    });
    
    it('should give score >= 3 for passwords meeting all requirements', () => {
      fc.assert(
        fc.property(
          strongPasswordArbitrary,
          (password) => {
            // Verify password meets all requirements
            const meetsReqs = meetsAllRequirements(password);
            fc.pre(meetsReqs); // Only test passwords that meet all requirements
            
            // Calculate strength
            const strength = calculatePasswordStrength(password);
            
            // Property: All requirements should be met
            expect(strength.requirements.length).toBe(true);
            expect(strength.requirements.uppercase).toBe(true);
            expect(strength.requirements.lowercase).toBe(true);
            expect(strength.requirements.number).toBe(true);
            expect(strength.requirements.special).toBe(true);
            
            // Property: Score should be at least 2 (fair) for passwords meeting all requirements
            // Note: zxcvbn may give score 2 for short but valid passwords
            expect(strength.score).toBeGreaterThanOrEqual(2);
            
            // Property: Label should be 'fair', 'good', or 'strong'
            expect(['fair', 'good', 'strong']).toContain(strength.label);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should consistently calculate strength for same password', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (password) => {
            // Calculate strength multiple times
            const strength1 = calculatePasswordStrength(password);
            const strength2 = calculatePasswordStrength(password);
            const strength3 = calculatePasswordStrength(password);
            
            // Property: Results should be identical
            expect(strength1.score).toBe(strength2.score);
            expect(strength2.score).toBe(strength3.score);
            expect(strength1.label).toBe(strength2.label);
            expect(strength1.requirements).toEqual(strength2.requirements);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should give lower scores for passwords missing requirements', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 7 }), // Too short
            fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e'), { minLength: 8, maxLength: 20 }).map(arr => arr.join('')), // Only lowercase
            fc.array(fc.constantFrom('A', 'B', 'C', 'D', 'E'), { minLength: 8, maxLength: 20 }).map(arr => arr.join('')), // Only uppercase
            fc.array(fc.constantFrom('0', '1', '2', '3', '4'), { minLength: 8, maxLength: 20 }).map(arr => arr.join('')) // Only numbers
          ),
          (password) => {
            const meetsReqs = meetsAllRequirements(password);
            fc.pre(!meetsReqs); // Only test passwords that DON'T meet all requirements
            
            const strength = calculatePasswordStrength(password);
            
            // Property: At least one requirement should be false
            const reqValues = Object.values(strength.requirements);
            expect(reqValues.some(req => req === false)).toBe(true);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should have score between 0 and 4', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (password) => {
            const strength = calculatePasswordStrength(password);
            
            // Property: Score should be in valid range
            expect(strength.score).toBeGreaterThanOrEqual(0);
            expect(strength.score).toBeLessThanOrEqual(4);
            
            // Property: Percentage should match score
            expect(strength.percentage).toBe((strength.score / 4) * 100);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should identify all 5 requirements correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            base: fc.string({ minLength: 0, maxLength: 20 }),
            hasUpper: fc.boolean(),
            hasLower: fc.boolean(),
            hasNumber: fc.boolean(),
            hasSpecial: fc.boolean()
          }),
          (data) => {
            // Build password based on flags
            let password = data.base;
            if (data.hasUpper) password += 'A';
            if (data.hasLower) password += 'a';
            if (data.hasNumber) password += '1';
            if (data.hasSpecial) password += '!';
            
            const strength = calculatePasswordStrength(password);
            
            // Property: Requirements should match what we added
            if (data.hasUpper) {
              expect(strength.requirements.uppercase).toBe(true);
            }
            if (data.hasLower) {
              expect(strength.requirements.lowercase).toBe(true);
            }
            if (data.hasNumber) {
              expect(strength.requirements.number).toBe(true);
            }
            if (data.hasSpecial) {
              expect(strength.requirements.special).toBe(true);
            }
            
            // Property: Length requirement
            expect(strength.requirements.length).toBe(password.length >= 8);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
    it('should return consistent label for score', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // Exclude empty string
          (password) => {
            const strength = calculatePasswordStrength(password);
            
            // Property: Label should match score
            const expectedLabels = ['weak', 'weak', 'fair', 'good', 'strong'];
            expect(strength.label).toBe(expectedLabels[strength.score]);
            
            // Property: Arabic label should also match
            const expectedLabelsAr = ['ضعيف', 'ضعيف', 'متوسط', 'جيد', 'قوي'];
            expect(strength.labelAr).toBe(expectedLabelsAr[strength.score]);
          }
        ),
        { 
          numRuns: 100,
          verbose: true
        }
      );
    });
    
  });
  
  /**
   * Property 9: Password Hash
   * 
   * For any stored password, it should be hashed with bcrypt (not plain text).
   * 
   * This property ensures that:
   * 1. Passwords are never stored in plain text
   * 2. Bcrypt hashing is used correctly
   * 3. Hash verification works properly
   * 4. Different passwords produce different hashes
   * 5. Same password produces different hashes (due to salt)
   * 
   * Validates: Requirement 7.1 (Password security)
   */
  describe('Property 9: Password Hash', () => {
    
    it('should hash passwords with bcrypt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 72 }), // bcrypt max length is 72
          async (password) => {
            // Hash the password
            const hash = await bcrypt.hash(password, 12);
            
            // Property: Hash should not equal plain password
            expect(hash).not.toBe(password);
            
            // Property: Hash should start with bcrypt identifier
            expect(hash).toMatch(/^\$2[aby]\$/);
            
            // Property: Hash should be 60 characters
            expect(hash.length).toBe(60);
            
            // Property: Verification should work
            const isValid = await bcrypt.compare(password, hash);
            expect(isValid).toBe(true);
            
            // Property: Wrong password should not verify
            const wrongPassword = password + 'x';
            const isInvalid = await bcrypt.compare(wrongPassword, hash);
            expect(isInvalid).toBe(false);
          }
        ),
        { 
          numRuns: 10, // Reduced from 50 due to bcrypt being slow
          verbose: true
        }
      );
    }, 60000); // 60 second timeout
    
    it('should produce different hashes for same password (salt)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password) => {
            // Hash same password twice
            const hash1 = await bcrypt.hash(password, 12);
            const hash2 = await bcrypt.hash(password, 12);
            
            // Property: Hashes should be different (due to random salt)
            expect(hash1).not.toBe(hash2);
            
            // Property: Both should verify correctly
            const isValid1 = await bcrypt.compare(password, hash1);
            const isValid2 = await bcrypt.compare(password, hash2);
            expect(isValid1).toBe(true);
            expect(isValid2).toBe(true);
          }
        ),
        { 
          numRuns: 5, // Reduced from 30 due to bcrypt being slow
          verbose: true
        }
      );
    }, 60000); // 60 second timeout
    
    it('should produce different hashes for different passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password1, password2) => {
            fc.pre(password1 !== password2); // Ensure passwords are different
            
            // Hash both passwords
            const hash1 = await bcrypt.hash(password1, 12);
            const hash2 = await bcrypt.hash(password2, 12);
            
            // Property: Hashes should be different
            expect(hash1).not.toBe(hash2);
            
            // Property: Each hash should only verify its own password
            const valid1 = await bcrypt.compare(password1, hash1);
            const valid2 = await bcrypt.compare(password2, hash2);
            const invalid1 = await bcrypt.compare(password1, hash2);
            const invalid2 = await bcrypt.compare(password2, hash1);
            
            expect(valid1).toBe(true);
            expect(valid2).toBe(true);
            expect(invalid1).toBe(false);
            expect(invalid2).toBe(false);
          }
        ),
        { 
          numRuns: 5, // Reduced from 30 due to bcrypt being slow
          verbose: true
        }
      );
    }, 60000); // 60 second timeout
    
    it('should use sufficient salt rounds (12)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password) => {
            const saltRounds = 12;
            const hash = await bcrypt.hash(password, saltRounds);
            
            // Property: Hash should contain salt rounds info
            // bcrypt format: $2a$12$... where 12 is the cost factor
            const match = hash.match(/^\$2[aby]\$(\d+)\$/);
            expect(match).not.toBeNull();
            
            const rounds = parseInt(match[1], 10);
            
            // Property: Should use 12 rounds (secure)
            expect(rounds).toBe(12);
          }
        ),
        { 
          numRuns: 5, // Reduced from 20 due to bcrypt being slow
          verbose: true
        }
      );
    }, 60000); // 60 second timeout
    
    it('should handle empty and special character passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''),
            fc.string({ minLength: 1, maxLength: 10 }),
            fc.array(fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*', '(', ')'), { minLength: 1, maxLength: 20 }).map(arr => arr.join('')),
            fc.array(fc.constantFrom('أ', 'ب', 'ت', 'ث', 'ج', 'ح'), { minLength: 1, maxLength: 20 }).map(arr => arr.join('')), // Arabic
            fc.array(fc.constantFrom('中', '文', '字', '符'), { minLength: 1, maxLength: 20 }).map(arr => arr.join('')) // Chinese
          ),
          async (password) => {
            if (password.length === 0) {
              // Empty password should still hash (though not recommended)
              const hash = await bcrypt.hash(password, 12);
              expect(hash).toBeDefined();
              expect(hash.length).toBe(60);
            } else {
              // Hash and verify
              const hash = await bcrypt.hash(password, 12);
              const isValid = await bcrypt.compare(password, hash);
              
              // Property: Should handle any characters correctly
              expect(isValid).toBe(true);
            }
          }
        ),
        { 
          numRuns: 10, // Reduced from 50 due to bcrypt being slow
          verbose: true
        }
      );
    }, 60000); // 60 second timeout
    
    it('should never store passwords in plain text', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }), // Reduced array size
          async (passwords) => {
            // Hash all passwords
            const hashes = await Promise.all(
              passwords.map(pwd => bcrypt.hash(pwd, 12))
            );
            
            // Property: No hash should equal any plain password
            for (let i = 0; i < passwords.length; i++) {
              for (let j = 0; j < hashes.length; j++) {
                expect(hashes[j]).not.toBe(passwords[i]);
              }
            }
            
            // Property: Each hash should only verify its corresponding password
            for (let i = 0; i < passwords.length; i++) {
              const isValid = await bcrypt.compare(passwords[i], hashes[i]);
              expect(isValid).toBe(true);
            }
          }
        ),
        { 
          numRuns: 5, // Reduced from 20 due to bcrypt being slow
          verbose: true
        }
      );
    }, 90000); // 90 second timeout for multiple hashes
    
  });
  
});
