/**
 * OAuth State Parameter Utilities
 * Implements CSRF protection for OAuth flows
 * 
 * Security: Prevents CSRF attacks by validating state parameter
 * Reference: https://tools.ietf.org/html/rfc6749#section-10.12
 */

const crypto = require('crypto');

// In-memory store for state tokens (use Redis in production for scalability)
const stateStore = new Map();

// State token expiry time (5 minutes)
const STATE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Generate a secure random state token
 * @param {string} userId - Optional user ID for linking state to user
 * @returns {string} - Base64-encoded state token
 */
function generateState(userId = null) {
  const state = crypto.randomBytes(32).toString('base64url');
  
  // Store state with metadata
  stateStore.set(state, {
    userId,
    createdAt: Date.now(),
    used: false
  });
  
  // Auto-cleanup expired states
  setTimeout(() => {
    stateStore.delete(state);
  }, STATE_EXPIRY_MS);
  
  return state;
}

/**
 * Verify state token
 * @param {string} state - State token to verify
 * @returns {Object|null} - State metadata if valid, null otherwise
 */
function verifyState(state) {
  if (!state || typeof state !== 'string') {
    return null;
  }
  
  const stateData = stateStore.get(state);
  
  if (!stateData) {
    console.warn('⚠️  OAuth State: Token not found or expired');
    return null;
  }
  
  // Check if already used (replay attack prevention)
  if (stateData.used) {
    console.warn('⚠️  OAuth State: Token already used (replay attack?)');
    stateStore.delete(state);
    return null;
  }
  
  // Check expiry
  const age = Date.now() - stateData.createdAt;
  if (age > STATE_EXPIRY_MS) {
    console.warn('⚠️  OAuth State: Token expired');
    stateStore.delete(state);
    return null;
  }
  
  // Mark as used
  stateData.used = true;
  stateStore.set(state, stateData);
  
  // Delete after verification
  setTimeout(() => {
    stateStore.delete(state);
  }, 1000);
  
  return stateData;
}

/**
 * Clean up expired states (call periodically)
 */
function cleanupExpiredStates() {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > STATE_EXPIRY_MS) {
      stateStore.delete(state);
    }
  }
}

// Cleanup every 10 minutes
setInterval(cleanupExpiredStates, 10 * 60 * 1000);

module.exports = {
  generateState,
  verifyState,
  cleanupExpiredStates
};
