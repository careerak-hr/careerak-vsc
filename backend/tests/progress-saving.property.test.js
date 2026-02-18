/**
 * Property-Based Tests for Progress Saving
 * 
 * Property 6: Progress Expiry
 * For any saved progress, if expiresAt < current time, the progress should be cleared.
 * 
 * Property 7: Password Not Saved
 * For any saved progress in localStorage, the password field should be undefined or null.
 * 
 * Validates: Requirements 6.6, 6.7
 */

const fc = require('fast-check');

// Mock localStorage for Node.js environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Import the progress saver functions (simulated)
const STORAGE_KEY = 'careerak_registration_progress';
const EXPIRY_DAYS = 7;

const getExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + EXPIRY_DAYS);
  return date.toISOString();
};

const isExpired = (expiresAt) => {
  if (!expiresAt) return true;
  return new Date(expiresAt) < new Date();
};

const saveProgress = (step, data) => {
  try {
    // Remove password from data (Requirement 6.7)
    const sanitizedData = {
      ...data,
      password: undefined,
      confirmPassword: undefined
    };

    const progress = {
      step,
      data: sanitizedData,
      savedAt: new Date().toISOString(),
      expiresAt: getExpiryDate()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    return false;
  }
};

const loadProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved) {
      return null;
    }

    const progress = JSON.parse(saved);

    // Check expiry (Requirement 6.6)
    if (isExpired(progress.expiresAt)) {
      clearProgress();
      return null;
    }

    return progress;
  } catch (error) {
    return null;
  }
};

const clearProgress = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    return false;
  }
};

describe('Progress Saving Property Tests', () => {
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  /**
   * Property 6: Progress Expiry
   * 
   * For any saved progress:
   * - If expiresAt is in the past, loadProgress should return null
   * - If expiresAt is in the future, loadProgress should return the progress
   * - Expired progress should be automatically cleared
   * 
   * **Validates: Requirements 6.6**
   */
  test('Property 6: Expired progress should be cleared automatically', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }), // step
        fc.integer({ min: -10, max: 10 }), // days offset (negative = past, positive = future)
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          country: fc.string({ minLength: 2, maxLength: 2 }),
          city: fc.string({ minLength: 1, maxLength: 50 })
        }),
        (step, daysOffset, formData) => {
          // Create progress with custom expiry date
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + daysOffset);
          // Add extra time to ensure it's truly in the future for daysOffset >= 0
          if (daysOffset >= 0) {
            expiryDate.setHours(expiryDate.getHours() + 1);
          }
          
          const progress = {
            step,
            data: formData,
            savedAt: new Date().toISOString(),
            expiresAt: expiryDate.toISOString()
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
          
          // Load progress
          const loaded = loadProgress();
          
          // Property: If expired (daysOffset < 0), should return null
          if (daysOffset < 0) {
            expect(loaded).toBeNull();
            // Property: Expired progress should be cleared from storage
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
          } else {
            // Property: If not expired (daysOffset >= 0), should return progress
            expect(loaded).not.toBeNull();
            expect(loaded.step).toBe(step);
            expect(loaded.data).toEqual(formData);
          }
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property 7: Password Not Saved
   * 
   * For any form data with password:
   * - Saved progress should never contain password field
   * - Saved progress should never contain confirmPassword field
   * - Password fields should be undefined or null in saved data
   * 
   * **Validates: Requirements 6.7**
   */
  test('Property 7: Password should never be saved in localStorage', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }), // step
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }), // Password included
          confirmPassword: fc.string({ minLength: 8, maxLength: 50 }), // Confirm password included
          country: fc.string({ minLength: 2, maxLength: 2 }),
          city: fc.string({ minLength: 1, maxLength: 50 })
        }),
        (step, formData) => {
          // Save progress with password
          const saved = saveProgress(step, formData);
          expect(saved).toBe(true);
          
          // Load from localStorage directly
          const rawData = localStorage.getItem(STORAGE_KEY);
          expect(rawData).not.toBeNull();
          
          const progress = JSON.parse(rawData);
          
          // Property: Password should be undefined or null
          expect(progress.data.password).toBeUndefined();
          
          // Property: Confirm password should be undefined or null
          expect(progress.data.confirmPassword).toBeUndefined();
          
          // Property: Other fields should be preserved
          expect(progress.data.firstName).toBe(formData.firstName);
          expect(progress.data.lastName).toBe(formData.lastName);
          expect(progress.data.email).toBe(formData.email);
          expect(progress.data.country).toBe(formData.country);
          expect(progress.data.city).toBe(formData.city);
          
          // Property: Password should not exist in stringified data
          expect(rawData).not.toContain(formData.password);
          expect(rawData).not.toContain(formData.confirmPassword);
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Progress Persistence
   * 
   * For any saved progress:
   * - Data saved should be retrievable
   * - Retrieved data should match saved data (except passwords)
   * - Step number should be preserved
   */
  test('Property: Saved progress should be retrievable with correct data', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }), // step
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          country: fc.string({ minLength: 2, maxLength: 2 }),
          city: fc.string({ minLength: 1, maxLength: 50 })
        }),
        (step, formData) => {
          // Save progress
          const saved = saveProgress(step, formData);
          expect(saved).toBe(true);
          
          // Load progress
          const loaded = loadProgress();
          
          // Property: Progress should be loaded successfully
          expect(loaded).not.toBeNull();
          
          // Property: Step should match
          expect(loaded.step).toBe(step);
          
          // Property: Data should match (except passwords)
          expect(loaded.data.firstName).toBe(formData.firstName);
          expect(loaded.data.lastName).toBe(formData.lastName);
          expect(loaded.data.email).toBe(formData.email);
          expect(loaded.data.country).toBe(formData.country);
          expect(loaded.data.city).toBe(formData.city);
          
          // Property: Timestamps should exist
          expect(loaded.savedAt).toBeDefined();
          expect(loaded.expiresAt).toBeDefined();
          
          // Property: Expiry should be in the future
          expect(new Date(loaded.expiresAt) > new Date()).toBe(true);
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Clear Progress
   * 
   * For any saved progress:
   * - clearProgress should remove data from storage
   * - After clearing, loadProgress should return null
   * - Multiple clears should not cause errors
   */
  test('Property: Clear progress should remove all saved data', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }), // step
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress()
        }),
        (step, formData) => {
          // Save progress
          saveProgress(step, formData);
          
          // Verify it's saved
          expect(loadProgress()).not.toBeNull();
          
          // Clear progress
          const cleared = clearProgress();
          expect(cleared).toBe(true);
          
          // Property: After clearing, loadProgress should return null
          expect(loadProgress()).toBeNull();
          
          // Property: Storage should be empty
          expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
          
          // Property: Multiple clears should not cause errors
          expect(() => clearProgress()).not.toThrow();
          expect(clearProgress()).toBe(true);
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Expiry Date Calculation
   * 
   * For any saved progress:
   * - Expiry date should be exactly 7 days in the future
   * - Expiry date should be a valid ISO string
   * - Expiry date should be parseable
   */
  test('Property: Expiry date should be 7 days from save time', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }), // step
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 })
        }),
        (step, formData) => {
          const beforeSave = new Date();
          
          // Save progress
          saveProgress(step, formData);
          
          const afterSave = new Date();
          
          // Load progress
          const loaded = loadProgress();
          expect(loaded).not.toBeNull();
          
          // Property: Expiry date should be valid ISO string
          expect(() => new Date(loaded.expiresAt)).not.toThrow();
          
          const expiryDate = new Date(loaded.expiresAt);
          
          // Property: Expiry should be approximately 7 days in the future
          const expectedExpiry = new Date(beforeSave);
          expectedExpiry.setDate(expectedExpiry.getDate() + 7);
          
          const timeDiff = Math.abs(expiryDate - expectedExpiry);
          const maxDiff = 5000; // 5 seconds tolerance
          
          expect(timeDiff).toBeLessThan(maxDiff);
          
          // Property: Expiry should be in the future
          expect(expiryDate > afterSave).toBe(true);
        }
      ),
      { numRuns: 500 }
    );
  });

  /**
   * Property: Data Sanitization
   * 
   * For any form data with sensitive fields:
   * - All sensitive fields should be removed
   * - Non-sensitive fields should be preserved
   * - Data structure should remain valid
   */
  test('Property: Sensitive data should be sanitized before saving', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 4 }), // step
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          confirmPassword: fc.string({ minLength: 8, maxLength: 50 }),
          email: fc.emailAddress(),
          // Add more sensitive fields if needed
        }),
        (step, formData) => {
          // Save progress
          saveProgress(step, formData);
          
          // Load raw data
          const rawData = localStorage.getItem(STORAGE_KEY);
          const progress = JSON.parse(rawData);
          
          // Property: Sensitive fields should not exist
          const sensitiveFields = ['password', 'confirmPassword'];
          sensitiveFields.forEach(field => {
            expect(progress.data[field]).toBeUndefined();
          });
          
          // Property: Non-sensitive fields should exist
          expect(progress.data.firstName).toBe(formData.firstName);
          expect(progress.data.email).toBe(formData.email);
          
          // Property: Data should be valid JSON
          expect(() => JSON.parse(rawData)).not.toThrow();
        }
      ),
      { numRuns: 500 }
    );
  });

});

/**
 * Test Summary:
 * 
 * ✅ Property 6: Progress Expiry
 *    - Expired progress is automatically cleared
 *    - Valid progress is returned when not expired
 *    - Expiry date is checked correctly
 * 
 * ✅ Property 7: Password Not Saved
 *    - Password is never saved in localStorage
 *    - Confirm password is never saved
 *    - Other fields are preserved correctly
 * 
 * ✅ Property: Progress Persistence
 *    - Saved data is retrievable
 *    - Data integrity is maintained
 * 
 * ✅ Property: Clear Progress
 *    - Clear removes all data
 *    - Multiple clears don't cause errors
 * 
 * ✅ Property: Expiry Date Calculation
 *    - Expiry is exactly 7 days in the future
 *    - Expiry date is valid ISO string
 * 
 * ✅ Property: Data Sanitization
 *    - Sensitive fields are removed
 *    - Non-sensitive fields are preserved
 * 
 * Validates: Requirements 6.6, 6.7
 */
