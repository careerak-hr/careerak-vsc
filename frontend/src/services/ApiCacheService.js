import { cache } from '../utils/performanceOptimization';

/**
 * API Cache Service
 * Implements intelligent caching for API requests
 */
class ApiCacheService {
  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * Generate cache key from request parameters
   * @private
   */
  generateKey(url, options = {}) {
    const method = options.method || 'GET';
    const body = options.body || '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Fetch with caching
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @param {number} ttl - Cache TTL in milliseconds
   * @returns {Promise} Response promise
   */
  async fetch(url, options = {}, ttl = 300000) {
    const key = this.generateKey(url, options);
    
    // Check cache first (only for GET requests)
    if (options.method === 'GET' || !options.method) {
      const cached = cache.get(key);
      if (cached) {
        return Promise.resolve(cached);
      }
    }

    // Check if request is already pending (request deduplication)
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Make the request
    const requestPromise = fetch(url, options)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache successful GET requests
        if (options.method === 'GET' || !options.method) {
          cache.set(key, data, ttl);
        }
        
        return data;
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(key);
      });

    // Store pending request
    this.pendingRequests.set(key, requestPromise);
    
    return requestPromise;
  }

  /**
   * Invalidate cache for a specific URL pattern
   * @param {string} pattern - URL pattern to invalidate
   */
  invalidate(pattern) {
    // Clear all cache entries matching the pattern
    // This is a simple implementation - could be enhanced with regex
    cache.clear();
  }

  /**
   * Clear all caches
   */
  clearAll() {
    cache.clear();
    this.pendingRequests.clear();
  }
}

export default new ApiCacheService();
