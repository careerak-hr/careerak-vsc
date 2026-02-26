/**
 * Cache Headers Middleware
 * 
 * Sets appropriate Cache-Control and ETag headers for API responses.
 * Implements Requirements 11.2
 */

const crypto = require('crypto');

/**
 * Generate ETag from response body
 * @param {string|Object} body - Response body
 * @returns {string} ETag hash
 */
const generateETag = (body) => {
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  return crypto.createHash('md5').update(content).digest('hex');
};

/**
 * Cache headers middleware for statistics endpoints
 * Sets Cache-Control: public, max-age=30 for statistics data
 * 
 * @param {Object} options - Middleware options
 * @param {number} options.maxAge - Max age in seconds (default: 30)
 * @param {boolean} options.public - Whether cache is public (default: true)
 * @param {boolean} options.etag - Whether to generate ETag (default: true)
 * @returns {Function} Express middleware
 */
const cacheHeaders = (options = {}) => {
  const {
    maxAge = 30,
    public: isPublic = true,
    etag: useETag = true
  } = options;

  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to add cache headers
    res.json = function(body) {
      // Set Cache-Control header
      const cacheControl = isPublic ? 'public' : 'private';
      res.set('Cache-Control', `${cacheControl}, max-age=${maxAge}`);

      // Generate and set ETag if enabled
      if (useETag && body) {
        const etag = generateETag(body);
        res.set('ETag', `"${etag}"`);

        // Check if client has matching ETag
        const clientETag = req.get('If-None-Match');
        if (clientETag === `"${etag}"`) {
          // Client has fresh data, return 304 Not Modified
          return res.status(304).end();
        }
      }

      // Set Vary header to indicate response varies by Authorization
      res.set('Vary', 'Authorization');

      // Call original json method
      return originalJson(body);
    };

    next();
  };
};

/**
 * No-cache headers middleware for sensitive or frequently changing data
 * Sets Cache-Control: no-cache, no-store, must-revalidate
 * 
 * @returns {Function} Express middleware
 */
const noCacheHeaders = () => {
  return (req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  };
};

/**
 * Short-lived cache headers for frequently updated data
 * Sets Cache-Control: public, max-age=10
 * 
 * @returns {Function} Express middleware
 */
const shortCacheHeaders = () => {
  return cacheHeaders({ maxAge: 10, public: true, etag: true });
};

/**
 * Medium-lived cache headers for moderately stable data
 * Sets Cache-Control: public, max-age=60
 * 
 * @returns {Function} Express middleware
 */
const mediumCacheHeaders = () => {
  return cacheHeaders({ maxAge: 60, public: true, etag: true });
};

/**
 * Long-lived cache headers for stable data
 * Sets Cache-Control: public, max-age=300
 * 
 * @returns {Function} Express middleware
 */
const longCacheHeaders = () => {
  return cacheHeaders({ maxAge: 300, public: true, etag: true });
};

/**
 * Private cache headers for user-specific data
 * Sets Cache-Control: private, max-age=30
 * 
 * @returns {Function} Express middleware
 */
const privateCacheHeaders = () => {
  return cacheHeaders({ maxAge: 30, public: false, etag: true });
};

module.exports = {
  cacheHeaders,
  noCacheHeaders,
  shortCacheHeaders,
  mediumCacheHeaders,
  longCacheHeaders,
  privateCacheHeaders,
  generateETag
};
