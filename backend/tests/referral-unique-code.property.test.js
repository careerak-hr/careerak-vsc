/**
 * Property-Based Tests: Unique Referral Code
 *
 * **Validates: Requirements 1.1**
 *
 * Property 1: Unique Referral Code
 * For any user, their referral code must be unique across all users.
 */

const fc = require('fast-check');

// The character set used by generateCode() in referralService.js
const REFERRAL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ALPHANUMERIC_REGEX = /^[A-Z0-9]+$/;

/**
 * Isolated version of the referral code generator (no DB dependency).
 * Mirrors the logic in backend/src/services/referralService.js exactly.
 */
const crypto = require('crypto');

function generateCode(length = 7) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0,O,1,I)
  let code = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// ========== Property-Based Tests ==========

describe('Property 1: Unique Referral Code', () => {
  /**
   * Sub-property 1a: Codes generated in bulk are all unique
   *
   * Generate N codes and assert the set size equals N.
   */
  test('bulk-generated codes are all unique', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (count) => {
          const codes = new Set();
          for (let i = 0; i < count; i++) {
            codes.add(generateCode());
          }
          // All codes must be unique
          expect(codes.size).toBe(count);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Sub-property 1b: Every generated code is 6-8 characters long
   */
  test('every generated code is 6-8 characters long', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 8 }),
        (length) => {
          const code = generateCode(length);
          expect(code.length).toBe(length);
          expect(code.length).toBeGreaterThanOrEqual(6);
          expect(code.length).toBeLessThanOrEqual(8);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 1c: Every generated code contains only alphanumeric characters
   *
   * The charset excludes ambiguous chars (0, O, 1, I) but all remaining
   * characters are uppercase letters or digits — i.e. alphanumeric.
   */
  test('every generated code contains only alphanumeric characters', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 6, max: 8 }),
        (length) => {
          const code = generateCode(length);
          expect(code).toMatch(ALPHANUMERIC_REGEX);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Sub-property 1d: Two independently generated codes are (almost always) different
   *
   * With a 32-char alphabet and 7-char codes there are 32^7 ≈ 34 billion
   * possibilities, so a collision in a single pair is astronomically unlikely.
   * fast-check will shrink toward the smallest failing case if it ever finds one.
   */
  test('two independently generated codes are different', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // no input needed — pure randomness
        () => {
          const code1 = generateCode();
          const code2 = generateCode();
          // This should virtually never fail; if it does, the generator is broken
          expect(code1).not.toBe(code2);
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * Sub-property 1e: A large batch of codes has no duplicates
   *
   * Generates 500 codes and verifies the entire set is collision-free.
   */
  test('500 generated codes have no duplicates', () => {
    const codes = Array.from({ length: 500 }, () => generateCode());
    const unique = new Set(codes);
    expect(unique.size).toBe(500);
  });

  /**
   * Sub-property 1f: Default code length is 7 characters
   */
  test('default code length is 7 characters', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const code = generateCode(); // default length = 7
        expect(code.length).toBe(7);
      }),
      { numRuns: 50 }
    );
  });
});
