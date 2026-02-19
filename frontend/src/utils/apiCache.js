/**
 * API Cache Utility with Stale-While-Revalidate Strategy
 * 
 * This utility implements the stale-while-revalidate caching pattern for API responses.
 * It serves cached data immediately while fetching fresh data in the background.
 * 
 * Features:
 * - Instant response from cache (if available)
 * - Background revalidation
 * - Configurable cache duration
 * - Automatic cache cleanup
 * - Memory-efficient storage
 */

class APICache {
  constructor() {
    this.cache = new Map();
    this.revalidationPromises = new Map();
    this.defaultMaxAge = 5 * 60 * 1000; // 5 minutes default
    this.cleanupInterval = 10 * 60 * 1000; // Cleanup every 10 minutes
    
    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Generate cache key from request config
   */
  generateKey(config) {
    const { method = 'GET', url, params, data } = config;
    const paramsStr = params ? JSON.stringify(params) : '';
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${paramsStr}:${dataStr}`;
  }

  /**
   * Check if cached data is still valid
   */
  isValid(entry, maxAge = this.defaultMaxAge) {
    if (!entry) return false;
    const age = Date.now() - entry.timestamp;
    return age < maxAge;
  }

  /**
   * Check if cached data is stale but usable
   */
  isStale(entry, maxAge = this.defaultMaxAge) {
    if (!entry) return false;
    const age = Date.now() - entry.timestamp;
    return age >= maxAge;
  }

  /**
   * Get cached data
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Set cached data
   */
  set(key, data, config = {}) {
    const entry = {
      data,
      timestamp: Date.now(),
      config
    };
    this.cache.set(key, entry);
    return entry;
  }

  /**
   * Delete cached data
   */
  delete(key) {
    this.cache.delete(key);
    this.revalidationPromises.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.revalidationPromises.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    const maxAge = this.defaultMaxAge * 2; // Keep entries for 2x maxAge
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > maxAge) {
        this.cache.delete(key);
        this.revalidationPromises.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  startCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Stop periodic cleanup
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Get revalidation promise for a key
   */
  getRevalidationPromise(key) {
    return this.revalidationPromises.get(key);
  }

  /**
   * Set revalidation promise for a key
   */
  setRevalidationPromise(key, promise) {
    this.revalidationPromises.set(key, promise);
    
    // Clean up after promise resolves/rejects
    promise.finally(() => {
      this.revalidationPromises.delete(key);
    });
  }
}

// Create singleton instance
const apiCache = new APICache();

/**
 * Stale-While-Revalidate wrapper for API calls
 * 
 * @param {Function} fetchFn - Function that returns a Promise with the API call
 * @param {Object} config - Configuration object
 * @param {number} config.maxAge - Maximum age in milliseconds (default: 5 minutes)
 * @param {boolean} config.forceRefresh - Force refresh ignoring cache
 * @param {Object} config.cacheKey - Custom cache key config
 * @returns {Promise} Promise that resolves with the response
 */
export async function staleWhileRevalidate(fetchFn, config = {}) {
  const {
    maxAge = apiCache.defaultMaxAge,
    forceRefresh = false,
    cacheKey = null
  } = config;

  // Generate cache key
  const key = cacheKey || apiCache.generateKey(config);

  // If force refresh, delete cache and fetch fresh
  if (forceRefresh) {
    apiCache.delete(key);
    const response = await fetchFn();
    apiCache.set(key, response, config);
    return response;
  }

  // Get cached entry
  const cachedEntry = apiCache.get(key);

  // If no cache, fetch fresh
  if (!cachedEntry) {
    const response = await fetchFn();
    apiCache.set(key, response, config);
    return response;
  }

  // If cache is still valid, return it
  if (apiCache.isValid(cachedEntry, maxAge)) {
    return cachedEntry.data;
  }

  // Cache is stale - return stale data and revalidate in background
  if (apiCache.isStale(cachedEntry, maxAge)) {
    // Check if revalidation is already in progress
    let revalidationPromise = apiCache.getRevalidationPromise(key);
    
    if (!revalidationPromise) {
      // Start background revalidation
      revalidationPromise = fetchFn()
        .then(response => {
          apiCache.set(key, response, config);
          return response;
        })
        .catch(error => {
          console.warn('Background revalidation failed:', error);
          // Keep stale data on error
          return cachedEntry.data;
        });
      
      apiCache.setRevalidationPromise(key, revalidationPromise);
    }

    // Return stale data immediately
    return cachedEntry.data;
  }

  // Fallback: fetch fresh
  const response = await fetchFn();
  apiCache.set(key, response, config);
  return response;
}

/**
 * Create a cached version of an API function
 * 
 * @param {Function} apiFn - API function to wrap
 * @param {Object} defaultConfig - Default cache configuration
 * @returns {Function} Cached version of the API function
 */
export function createCachedAPI(apiFn, defaultConfig = {}) {
  return async function(...args) {
    const fetchFn = () => apiFn(...args);
    const config = {
      ...defaultConfig,
      cacheKey: apiCache.generateKey({
        method: defaultConfig.method || 'GET',
        url: defaultConfig.url || apiFn.name,
        params: args[0],
        data: args[1]
      })
    };
    
    return staleWhileRevalidate(fetchFn, config);
  };
}

/**
 * Invalidate cache for specific key or pattern
 * 
 * @param {string|RegExp} pattern - Cache key or pattern to invalidate
 */
export function invalidateCache(pattern) {
  if (typeof pattern === 'string') {
    apiCache.delete(pattern);
  } else if (pattern instanceof RegExp) {
    for (const key of apiCache.cache.keys()) {
      if (pattern.test(key)) {
        apiCache.delete(key);
      }
    }
  }
}

/**
 * Clear all cache
 */
export function clearCache() {
  apiCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: apiCache.size(),
    entries: Array.from(apiCache.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      isValid: apiCache.isValid(entry),
      isStale: apiCache.isStale(entry)
    }))
  };
}

export default apiCache;
