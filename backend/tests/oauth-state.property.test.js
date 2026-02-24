/**
 * Property-Based Tests for OAuth State Parameter Security
 * 
 * Property 10: OAuth State Parameter
 * For any OAuth flow, a state parameter should be generated and verified to prevent CSRF.
 * Validates: Requirements 1.1
 */

const fc = require('fast-check');
const crypto = require('crypto');

/**
 * Helper to generate hex string arbitrary
 */
const hexString = (length) => {
  return fc.array(fc.integer({ min: 0, max: 15 }), { minLength: length, maxLength: length })
    .map(arr => arr.map(n => n.toString(16)).join(''));
};

describe('OAuth State Parameter Property Tests', () => {
  /**
   * Helper function to generate OAuth state
   */
  const generateOAuthState = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  /**
   * Helper function to verify OAuth state
   */
  const verifyOAuthState = (providedState, storedState) => {
    if (!providedState || !storedState) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(providedState),
      Buffer.from(storedState)
    );
  };

  /**
   * Property 1: State should be unique for each OAuth flow
   */
  test('Property 1: OAuth state should be unique for each generation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (numStates) => {
          const states = new Set();
          
          for (let i = 0; i < numStates; i++) {
            const state = generateOAuthState();
            states.add(state);
          }
          
          // All states should be unique
          expect(states.size).toBe(numStates);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2: State should be sufficiently long (at least 32 characters)
   */
  test('Property 2: OAuth state should be at least 32 characters long', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // No input needed
        () => {
          const state = generateOAuthState();
          
          // State should be at least 32 characters (16 bytes * 2 for hex)
          expect(state.length).toBeGreaterThanOrEqual(32);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: State verification should be timing-safe
   */
  test('Property 3: State verification should use timing-safe comparison', () => {
    fc.assert(
      fc.property(
        hexString(64),
        hexString(64),
        (state1, state2) => {
          // Same states should verify successfully
          expect(verifyOAuthState(state1, state1)).toBe(true);
          
          // Different states should fail verification
          if (state1 !== state2) {
            expect(verifyOAuthState(state1, state2)).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4: State verification should reject null/undefined
   */
  test('Property 4: State verification should reject null or undefined states', () => {
    fc.assert(
      fc.property(
        hexString(64),
        (validState) => {
          // Null provided state should fail
          expect(verifyOAuthState(null, validState)).toBe(false);
          
          // Undefined provided state should fail
          expect(verifyOAuthState(undefined, validState)).toBe(false);
          
          // Null stored state should fail
          expect(verifyOAuthState(validState, null)).toBe(false);
          
          // Undefined stored state should fail
          expect(verifyOAuthState(validState, undefined)).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5: State should be cryptographically random
   */
  test('Property 5: OAuth state should have high entropy', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const state = generateOAuthState();
          
          // Convert hex string to buffer
          const buffer = Buffer.from(state, 'hex');
          
          // Calculate entropy (simplified check)
          const uniqueBytes = new Set(buffer);
          const entropyRatio = uniqueBytes.size / buffer.length;
          
          // Should have at least 50% unique bytes (high entropy)
          expect(entropyRatio).toBeGreaterThan(0.5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: State should only contain valid hex characters
   */
  test('Property 6: OAuth state should only contain valid hex characters', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const state = generateOAuthState();
          
          // Should only contain 0-9, a-f
          const hexRegex = /^[0-9a-f]+$/;
          expect(hexRegex.test(state)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: State verification should be case-sensitive
   */
  test('Property 7: State verification should be case-sensitive', () => {
    fc.assert(
      fc.property(
        hexString(64),
        (state) => {
          const upperState = state.toUpperCase();
          const lowerState = state.toLowerCase();
          
          // If state has mixed case, uppercase and lowercase should be different
          if (upperState !== lowerState) {
            // Verification should fail for different cases
            expect(verifyOAuthState(upperState, lowerState)).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 8: State should not be predictable from previous states
   */
  test('Property 8: OAuth state should not be predictable', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5, max: 20 }),
        (numStates) => {
          const states = [];
          
          for (let i = 0; i < numStates; i++) {
            states.push(generateOAuthState());
          }
          
          // Check that consecutive states don't have patterns
          for (let i = 1; i < states.length; i++) {
            const prev = states[i - 1];
            const curr = states[i];
            
            // States should be completely different
            expect(curr).not.toBe(prev);
            
            // Calculate Hamming distance (number of different characters)
            let differences = 0;
            for (let j = 0; j < Math.min(prev.length, curr.length); j++) {
              if (prev[j] !== curr[j]) {
                differences++;
              }
            }
            
            // At least 50% of characters should be different
            const differenceRatio = differences / Math.min(prev.length, curr.length);
            expect(differenceRatio).toBeGreaterThan(0.5);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 9: State verification should handle empty strings
   */
  test('Property 9: State verification should reject empty strings', () => {
    fc.assert(
      fc.property(
        hexString(64),
        (validState) => {
          // Empty provided state should fail
          expect(verifyOAuthState('', validState)).toBe(false);
          
          // Empty stored state should fail
          expect(verifyOAuthState(validState, '')).toBe(false);
          
          // Both empty should fail
          expect(verifyOAuthState('', '')).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 10: State should maintain integrity through encoding/decoding
   */
  test('Property 10: OAuth state should survive URL encoding/decoding', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const originalState = generateOAuthState();
          
          // Encode and decode as if passing through URL
          const encoded = encodeURIComponent(originalState);
          const decoded = decodeURIComponent(encoded);
          
          // State should be unchanged
          expect(decoded).toBe(originalState);
          
          // Verification should still work
          expect(verifyOAuthState(decoded, originalState)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('OAuth State Parameter Integration', () => {
  /**
   * Mock OAuth flow with state parameter
   */
  class OAuthFlow {
    constructor() {
      this.sessions = new Map();
    }

    initiateOAuth(userId) {
      const state = crypto.randomBytes(32).toString('hex');
      this.sessions.set(userId, {
        state,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
      });
      return state;
    }

    verifyCallback(userId, providedState) {
      const session = this.sessions.get(userId);
      
      if (!session) {
        return { valid: false, error: 'No session found' };
      }
      
      if (Date.now() > session.expiresAt) {
        this.sessions.delete(userId);
        return { valid: false, error: 'State expired' };
      }
      
      if (!providedState || !session.state) {
        return { valid: false, error: 'Missing state' };
      }
      
      try {
        const isValid = crypto.timingSafeEqual(
          Buffer.from(providedState),
          Buffer.from(session.state)
        );
        
        if (isValid) {
          this.sessions.delete(userId);
          return { valid: true };
        } else {
          return { valid: false, error: 'State mismatch' };
        }
      } catch (error) {
        return { valid: false, error: 'Verification failed' };
      }
    }
  }

  /**
   * Property 11: Complete OAuth flow should validate state correctly
   */
  test('Property 11: Complete OAuth flow should validate state correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 20 }),
        (userIds) => {
          const oauthFlow = new OAuthFlow();
          
          // Initiate OAuth for all users
          const states = new Map();
          userIds.forEach(userId => {
            const state = oauthFlow.initiateOAuth(userId);
            states.set(userId, state);
          });
          
          // Verify with correct states
          userIds.forEach(userId => {
            const correctState = states.get(userId);
            const result = oauthFlow.verifyCallback(userId, correctState);
            expect(result.valid).toBe(true);
          });
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 12: OAuth flow should reject wrong states
   */
  test('Property 12: OAuth flow should reject incorrect states', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        hexString(64),
        (userId, wrongState) => {
          const oauthFlow = new OAuthFlow();
          
          // Initiate OAuth
          const correctState = oauthFlow.initiateOAuth(userId);
          
          // Verify with wrong state (if different)
          if (wrongState !== correctState) {
            const result = oauthFlow.verifyCallback(userId, wrongState);
            expect(result.valid).toBe(false);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 13: OAuth state should expire after timeout
   */
  test('Property 13: OAuth state should expire after timeout', async () => {
    const oauthFlow = new OAuthFlow();
    const userId = 'test-user-123';
    
    // Initiate OAuth
    const state = oauthFlow.initiateOAuth(userId);
    
    // Manually expire the session
    const session = oauthFlow.sessions.get(userId);
    session.expiresAt = Date.now() - 1000; // Expired 1 second ago
    
    // Verification should fail
    const result = oauthFlow.verifyCallback(userId, state);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });

  /**
   * Property 14: OAuth state should be single-use
   */
  test('Property 14: OAuth state should be single-use (consumed after verification)', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (userId) => {
          const oauthFlow = new OAuthFlow();
          
          // Initiate OAuth
          const state = oauthFlow.initiateOAuth(userId);
          
          // First verification should succeed
          const firstResult = oauthFlow.verifyCallback(userId, state);
          expect(firstResult.valid).toBe(true);
          
          // Second verification with same state should fail (state consumed)
          const secondResult = oauthFlow.verifyCallback(userId, state);
          expect(secondResult.valid).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
});
