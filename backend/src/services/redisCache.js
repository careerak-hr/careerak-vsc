/**
 * Redis Caching Service
 * 
 * Production-grade caching service using Redis for distributed caching.
 * Falls back to node-cache if Redis is unavailable.
 * 
 * Requirements: 11.2
 */

const NodeCache = require('node-cache');

// Redis client (will be initialized if available)
let redisClient = null;
let isRedisAvailable = false;

// Fallback to node-cache
const fallbackCache = new NodeCache({
  stdTTL: 30,
  checkperiod: 35,
  useClones: false
});

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0
};

/**
 * Initialize Redis client
 * @returns {Promise<boolean>} True if Redis is available
 */
const initializeRedis = async () => {
  try {
    // Only initialize if Redis URL is provided
    if (!process.env.REDIS_URL) {
      console.log('[Redis] REDIS_URL not configured, using node-cache fallback');
      return false;
    }

    // Dynamically import redis (ESM module)
    const redis = await import('redis');
    
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('[Redis] Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
      cacheStats.errors++;
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
      isRedisAvailable = true;
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Ready to accept commands');
      isRedisAvailable = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting...');
    });

    await redisClient.connect();
    isRedisAvailable = true;
    console.log('[Redis] Initialization complete');
    return true;
  } catch (error) {
    console.error('[Redis] Initialization failed:', error.message);
    console.log('[Redis] Falling back to node-cache');
    isRedisAvailable = false;
    return false;
  }
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
const get = async (key) => {
  try {
    if (isRedisAvailable && redisClient) {
      const value = await redisClient.get(key);
      if (value !== null) {
        cacheStats.hits++;
        console.log(`[Cache HIT] ${key} (Redis)`);
        return JSON.parse(value);
      }
    } else {
      const value = fallbackCache.get(key);
      if (value !== undefined) {
        cacheStats.hits++;
        console.log(`[Cache HIT] ${key} (node-cache)`);
        return value;
      }
    }
    
    cacheStats.misses++;
    console.log(`[Cache MISS] ${key}`);
    return null;
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error.message);
    cacheStats.errors++;
    
    // Try fallback cache
    const value = fallbackCache.get(key);
    if (value !== undefined) {
      cacheStats.hits++;
      return value;
    }
    
    return null;
  }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 30)
 * @returns {Promise<boolean>} True if successful
 */
const set = async (key, value, ttl = 30) => {
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      console.log(`[Cache SET] ${key} (Redis, TTL: ${ttl}s)`);
      return true;
    } else {
      fallbackCache.set(key, value, ttl);
      console.log(`[Cache SET] ${key} (node-cache, TTL: ${ttl}s)`);
      return true;
    }
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error.message);
    cacheStats.errors++;
    
    // Try fallback cache
    try {
      fallbackCache.set(key, value, ttl);
      return true;
    } catch (fallbackError) {
      console.error(`[Cache] Fallback also failed:`, fallbackError.message);
      return false;
    }
  }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if successful
 */
const del = async (key) => {
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.del(key);
      console.log(`[Cache DEL] ${key} (Redis)`);
      return true;
    } else {
      const deleted = fallbackCache.del(key);
      if (deleted > 0) {
        console.log(`[Cache DEL] ${key} (node-cache)`);
      }
      return deleted > 0;
    }
  } catch (error) {
    console.error(`[Cache] Error deleting key ${key}:`, error.message);
    cacheStats.errors++;
    
    // Try fallback cache
    try {
      const deleted = fallbackCache.del(key);
      return deleted > 0;
    } catch (fallbackError) {
      return false;
    }
  }
};

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., "user_stats_*")
 * @returns {Promise<number>} Number of keys deleted
 */
const delPattern = async (pattern) => {
  try {
    if (isRedisAvailable && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`[Cache DEL PATTERN] ${pattern} (${keys.length} keys, Redis)`);
        return keys.length;
      }
      return 0;
    } else {
      // node-cache doesn't support pattern matching, so we get all keys and filter
      const allKeys = fallbackCache.keys();
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      const matchingKeys = allKeys.filter(key => regex.test(key));
      
      if (matchingKeys.length > 0) {
        fallbackCache.del(matchingKeys);
        console.log(`[Cache DEL PATTERN] ${pattern} (${matchingKeys.length} keys, node-cache)`);
        return matchingKeys.length;
      }
      return 0;
    }
  } catch (error) {
    console.error(`[Cache] Error deleting pattern ${pattern}:`, error.message);
    cacheStats.errors++;
    return 0;
  }
};

/**
 * Clear all cache entries
 * @returns {Promise<boolean>} True if successful
 */
const flushAll = async () => {
  try {
    if (isRedisAvailable && redisClient) {
      await redisClient.flushAll();
      console.log('[Cache] All entries cleared (Redis)');
      return true;
    } else {
      fallbackCache.flushAll();
      console.log('[Cache] All entries cleared (node-cache)');
      return true;
    }
  } catch (error) {
    console.error('[Cache] Error flushing cache:', error.message);
    cacheStats.errors++;
    
    // Try fallback cache
    try {
      fallbackCache.flushAll();
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getStats = () => {
  const hitRate = cacheStats.hits + cacheStats.misses > 0
    ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(2) + '%'
    : '0%';
  
  return {
    ...cacheStats,
    hitRate,
    backend: isRedisAvailable ? 'Redis' : 'node-cache',
    isRedisAvailable
  };
};

/**
 * Get cached data or fetch from database
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds (default: 30)
 * @returns {Promise<any>} Cached or fresh data
 */
const getOrFetch = async (key, fetchFunction, ttl = 30) => {
  // Try to get from cache
  const cachedData = await get(key);
  
  if (cachedData !== null) {
    return cachedData;
  }
  
  // Cache miss - fetch from database
  const data = await fetchFunction();
  
  // Store in cache
  await set(key, data, ttl);
  
  return data;
};

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
const close = async () => {
  if (redisClient && isRedisAvailable) {
    try {
      await redisClient.quit();
      console.log('[Redis] Connection closed');
    } catch (error) {
      console.error('[Redis] Error closing connection:', error.message);
    }
  }
};

// Initialize Redis on module load (async)
initializeRedis().catch(err => {
  console.error('[Redis] Failed to initialize:', err.message);
});

module.exports = {
  get,
  set,
  del,
  delPattern,
  flushAll,
  getStats,
  getOrFetch,
  close,
  initializeRedis
};
