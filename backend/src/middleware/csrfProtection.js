const crypto = require('crypto');

/**
 * CSRF Protection Middleware
 * Implements token-based CSRF protection for state-changing requests
 */

// Store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map();

// Token expiration time (15 minutes)
const TOKEN_EXPIRATION = 15 * 60 * 1000;

/**
 * Generate a CSRF token for a user session
 * @param {string} sessionId - User session ID
 * @returns {string} CSRF token
 */
const generateCSRFToken = (sessionId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_EXPIRATION;
  
  csrfTokens.set(sessionId, {
    token,
    expiresAt
  });
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return token;
};

/**
 * Validate a CSRF token
 * @param {string} sessionId - User session ID
 * @param {string} token - CSRF token to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateCSRFToken = (sessionId, token) => {
  const storedToken = csrfTokens.get(sessionId);
  
  if (!storedToken) {
    return false;
  }
  
  // Check if token expired
  if (Date.now() > storedToken.expiresAt) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(storedToken.token)
    );
  } catch (error) {
    // Buffers must have same length for timingSafeEqual
    return false;
  }
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = () => {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId);
    }
  }
};

/**
 * Middleware to generate and attach CSRF token to response
 */
const attachCSRFToken = (req, res, next) => {
  const sessionId = req.user?.id || req.sessionID;
  
  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  const token = generateCSRFToken(sessionId);
  
  // Attach token to response header
  res.setHeader('X-CSRF-Token', token);
  
  // Also attach to response locals for template rendering
  res.locals.csrfToken = token;
  
  next();
};

/**
 * Middleware to verify CSRF token on state-changing requests
 */
const verifyCSRFToken = (req, res, next) => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const sessionId = req.user?.id || req.sessionID;
  
  if (!sessionId) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token is required'
      }
    });
  }
  
  if (!validateCSRFToken(sessionId, token)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'Invalid or expired CSRF token'
      }
    });
  }
  
  next();
};

/**
 * Clear CSRF token for a session
 * @param {string} sessionId - User session ID
 */
const clearCSRFToken = (sessionId) => {
  csrfTokens.delete(sessionId);
};

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
  attachCSRFToken,
  verifyCSRFToken,
  clearCSRFToken
};
