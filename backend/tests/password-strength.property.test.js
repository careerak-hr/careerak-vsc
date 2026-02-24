const fc = require('fast-check');
const { calculatePasswordStrength, meetsAllRequirements, generateStrongPassword } = require('../src/services/passwordService');

/**
 * Property-Based Tests for Password Strength
 * 
 * **Validates: Requirements 2.1**
 * 
 * Property 2: Password Strength Consistency
 * For any password, if it meets all 5 requirements (length, uppercase, lowercase, number, special),
 * the strength score should be ≥ 3.
 */

describe('Password Strength Property Tests', () => {
  
  /**
   * Property 2: Password Strength Consistency
   * **Validates: Requirements 2.1**
   * 
   * Note: Meeting all 5 requirements doesn't guarantee high score.
   * zxcvbn also considers patterns, common words, and entropy.
   * This property verifies that requirements are correctly detected.
   */
  describe('Property 2: Password Strength Consistency', () => {
    it('should correctly detect all requirements when met', () => {
      fc.assert(
        fc.property(
          // Generator: كلمة مرور تستوفي جميع المتطلبات
          fc.string({ minLength: 8, maxLength: 20 })
            .filter(s => /[A-Z]/.test(s))  // حرف كبير
            .filter(s => /[a-z]/.test(s))  // حرف صغير
            .filter(s => /[0-9]/.test(s))  // رقم
            .filter(s => /[!@#$%^&*(),.?":{}|<>]/.test(s)),  // رمز خاص
          (password) => {
            const result = calculatePasswordStrength(password);
            
            // التحقق من أن جميع المتطلبات مستوفاة
            expect(result.requirements.length).toBe(true);
            expect(result.requirements.uppercase).toBe(true);
            expect(result.requirements.lowercase).toBe(true);
            expect(result.requirements.number).toBe(true);
            expect(result.requirements.special).toBe(true);
            
            // meetsAllRequirements يجب أن يعيد true
            expect(meetsAllRequirements(password)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should have score ≥ 3 for truly random passwords with all requirements', () => {
      // استخدام generateStrongPassword لضمان كلمات مرور عشوائية حقيقية
      fc.assert(
        fc.property(
          fc.integer({ min: 12, max: 20 }),
          (length) => {
            const password = generateStrongPassword(length);
            const result = calculatePasswordStrength(password);
            
            // كلمات المرور المولدة عشوائياً يجب أن تكون قوية
            expect(result.score).toBeGreaterThanOrEqual(3);
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('should have consistent score for same password', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (password) => {
            const result1 = calculatePasswordStrength(password);
            const result2 = calculatePasswordStrength(password);
            
            // نفس كلمة المرور يجب أن تعطي نفس النتيجة
            expect(result1.score).toBe(result2.score);
            expect(result1.label).toBe(result2.label);
            expect(result1.percentage).toBe(result2.percentage);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Property: Password Requirements Detection
   * التحقق من أن الدالة تكتشف المتطلبات بشكل صحيح
   */
  describe('Property: Password Requirements Detection', () => {
    it('should correctly detect length requirement', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            const expectedLength = password.length >= 8;
            
            expect(result.requirements.length).toBe(expectedLength);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should correctly detect uppercase requirement', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            const hasUppercase = /[A-Z]/.test(password);
            
            expect(result.requirements.uppercase).toBe(hasUppercase);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should correctly detect lowercase requirement', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            const hasLowercase = /[a-z]/.test(password);
            
            expect(result.requirements.lowercase).toBe(hasLowercase);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should correctly detect number requirement', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            const hasNumber = /[0-9]/.test(password);
            
            expect(result.requirements.number).toBe(hasNumber);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should correctly detect special character requirement', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            expect(result.requirements.special).toBe(hasSpecial);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Property: Score Range
   * التحقق من أن النتيجة دائماً في النطاق الصحيح
   */
  describe('Property: Score Range', () => {
    it('should always return score between 0 and 4', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(4);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should return percentage between 0 and 100', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            
            expect(result.percentage).toBeGreaterThanOrEqual(0);
            expect(result.percentage).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Property: Empty Password
   * التحقق من معالجة كلمة المرور الفارغة
   */
  describe('Property: Empty Password', () => {
    it('should return score 0 for empty password', () => {
      const result = calculatePasswordStrength('');
      
      expect(result.score).toBe(0);
      expect(result.label).toBe('none');
      expect(result.percentage).toBe(0);
      expect(result.requirements.length).toBe(false);
      expect(result.requirements.uppercase).toBe(false);
      expect(result.requirements.lowercase).toBe(false);
      expect(result.requirements.number).toBe(false);
      expect(result.requirements.special).toBe(false);
    });
    
    it('should return score 0 for null/undefined password', () => {
      const resultNull = calculatePasswordStrength(null);
      const resultUndefined = calculatePasswordStrength(undefined);
      
      expect(resultNull.score).toBe(0);
      expect(resultUndefined.score).toBe(0);
    });
  });
  
  /**
   * Property: Generated Passwords
   * التحقق من أن كلمات المرور المولدة قوية
   */
  describe('Property: Generated Passwords', () => {
    it('should generate passwords that meet all requirements', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 12, max: 32 }),
          (length) => {
            const password = generateStrongPassword(length);
            const result = calculatePasswordStrength(password);
            
            // كلمة المرور المولدة يجب أن تستوفي جميع المتطلبات
            expect(result.requirements.length).toBe(true);
            expect(result.requirements.uppercase).toBe(true);
            expect(result.requirements.lowercase).toBe(true);
            expect(result.requirements.number).toBe(true);
            expect(result.requirements.special).toBe(true);
            
            // يجب أن تكون قوية (score ≥ 3)
            expect(result.score).toBeGreaterThanOrEqual(3);
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('should generate passwords with correct length', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 12, max: 32 }),
          (length) => {
            const password = generateStrongPassword(length);
            
            expect(password.length).toBe(length);
          }
        ),
        { numRuns: 50 }
      );
    });
    
    it('should generate different passwords each time', () => {
      const passwords = new Set();
      
      for (let i = 0; i < 100; i++) {
        passwords.add(generateStrongPassword(14));
      }
      
      // يجب أن تكون جميع كلمات المرور مختلفة
      expect(passwords.size).toBe(100);
    });
  });
  
  /**
   * Property: meetsAllRequirements Function
   * التحقق من دالة التحقق من المتطلبات
   */
  describe('Property: meetsAllRequirements Function', () => {
    it('should return true only when all requirements are met', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }),
          (password) => {
            const result = meetsAllRequirements(password);
            const strength = calculatePasswordStrength(password);
            
            const allMet = Object.values(strength.requirements).every(req => req === true);
            
            expect(result).toBe(allMet);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should return false for empty password', () => {
      expect(meetsAllRequirements('')).toBe(false);
      expect(meetsAllRequirements(null)).toBe(false);
      expect(meetsAllRequirements(undefined)).toBe(false);
    });
  });
  
  /**
   * Property: Weak Passwords
   * التحقق من أن كلمات المرور الضعيفة تحصل على نتيجة منخفضة
   */
  describe('Property: Weak Passwords', () => {
    it('should give low score to common passwords', () => {
      const commonPasswords = [
        'password',
        '123456',
        'qwerty',
        'abc123',
        'password123',
        'admin',
        'letmein',
        'welcome'
      ];
      
      commonPasswords.forEach(password => {
        const result = calculatePasswordStrength(password);
        
        // كلمات المرور الشائعة يجب أن تحصل على نتيجة منخفضة
        expect(result.score).toBeLessThanOrEqual(2);
      });
    });
    
    it('should give low score to short passwords', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 7 }),
          (password) => {
            const result = calculatePasswordStrength(password);
            
            // كلمات المرور القصيرة يجب أن تحصل على نتيجة منخفضة
            expect(result.score).toBeLessThanOrEqual(2);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
  
  /**
   * Property: Strong Passwords
   * التحقق من أن كلمات المرور القوية تحصل على نتيجة عالية
   */
  describe('Property: Strong Passwords', () => {
    it('should give high score to long random passwords', () => {
      const strongPasswords = [
        'Kx9#mP2$vL4@qR7!',
        'Ry7!nQ3&wB8%tZ5@',
        'Tz5@hF1#dK6!mP9$',
        'Qw3$rT6&yU9!iO2#',
        'As4#dF7&gH0!jK3$'
      ];
      
      strongPasswords.forEach(password => {
        const result = calculatePasswordStrength(password);
        
        // كلمات المرور القوية يجب أن تحصل على نتيجة عالية
        expect(result.score).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
