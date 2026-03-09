/**
 * Rate Limiting Middleware
 * Implements rate limiting for sensitive operations
 */

// Store for rate limit tracking (in production, use Redis)
const rateLimitStore = new Map();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start cleanup interval
setInterval(() => {
  cleanupExpiredEntries();
}, CLEANUP_INTERVAL);

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message
 * @param {Function} options.keyGenerator - Function to generate rate limit key
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 10, // 10 requests default
    message = 'تم تجاوز الحد المسموح. يرجى المحاولة بعد دقيقة.',
    keyGenerator = (req) => req.user?.id || req.ip
  } = options;
  
  return (req, res, next) => {
    const key = keyGenerator(req);
    
    if (!key) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    const now = Date.now();
    const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
    
    // Reset if window expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }
    
    // Increment count
    record.count++;
    rateLimitStore.set(key, record);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    
    // Check if limit exceeded
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter
        }
      });
    }
    
    next();
  };
};

/**
 * Rate limiter for sensitive operations (10 requests/minute)
 */
const sensitiveOperationsLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'تم تجاوز الحد المسموح للعمليات الحساسة. يرجى المحاولة بعد دقيقة.'
});

/**
 * Rate limiter for authentication operations (5 requests/minute)
 */
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. يرجى المحاولة بعد دقيقة.'
});

/**
 * Rate limiter for password change (3 requests/hour)
 */
const passwordChangeLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'تم تجاوز الحد المسموح لتغيير كلمة المرور. يرجى المحاولة بعد ساعة.'
});

/**
 * Rate limiter for email/phone change (3 requests/hour)
 */
const contactChangeLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'تم تجاوز الحد المسموح لتغيير معلومات الاتصال. يرجى المحاولة بعد ساعة.'
});

/**
 * Rate limiter for 2FA operations (5 requests/15 minutes)
 */
const twoFactorLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'تم تجاوز الحد المسموح لعمليات المصادقة الثنائية. يرجى المحاولة بعد 15 دقيقة.'
});

/**
 * Rate limiter for data export (1 request/day)
 */
const dataExportLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1,
  message: 'يمكنك طلب تصدير البيانات مرة واحدة فقط في اليوم.'
});

/**
 * Clean up expired entries from rate limit store
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

/**
 * Get rate limit info for a key
 * @param {string} key - Rate limit key
 * @returns {Object} Rate limit info
 */
const getRateLimitInfo = (key) => {
  const record = rateLimitStore.get(key);
  if (!record) {
    return null;
  }
  
  return {
    count: record.count,
    resetTime: record.resetTime,
    remaining: Math.max(0, 10 - record.count)
  };
};

/**
 * Reset rate limit for a key
 * @param {string} key - Rate limit key
 */
const resetRateLimit = (key) => {
  rateLimitStore.delete(key);
};

module.exports = {
  createRateLimiter,
  sensitiveOperationsLimiter,
  authLimiter,
  passwordChangeLimiter,
  contactChangeLimiter,
  twoFactorLimiter,
  dataExportLimiter,
  getRateLimitInfo,
  resetRateLimit
};
