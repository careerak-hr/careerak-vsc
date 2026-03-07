const redis = require('redis');
const NodeCache = require('node-cache');

/**
 * خدمة التخزين المؤقت (Caching)
 * تدعم Redis (للإنتاج) و NodeCache (للتطوير)
 */
class CacheService {
  constructor() {
    this.redisClient = null;
    this.nodeCache = null;
    this.isRedisAvailable = false;
    this.ttl = 5 * 60; // 5 دقائق (بالثواني)
    
    this.init();
  }

  /**
   * تهيئة خدمة التخزين المؤقت
   */
  async init() {
    try {
      // محاولة الاتصال بـ Redis
      if (process.env.REDIS_URL) {
        this.redisClient = redis.createClient({
          url: process.env.REDIS_URL,
          socket: {
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                console.error('Redis: Max reconnection attempts reached');
                return new Error('Redis connection failed');
              }
              return Math.min(retries * 100, 3000);
            }
          }
        });

        this.redisClient.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isRedisAvailable = false;
        });

        this.redisClient.on('connect', () => {
          console.log('✅ Redis connected successfully');
          this.isRedisAvailable = true;
        });

        this.redisClient.on('ready', () => {
          console.log('✅ Redis ready to use');
          this.isRedisAvailable = true;
        });

        await this.redisClient.connect();
      } else {
        console.log('⚠️  Redis URL not found, using NodeCache instead');
        this.initNodeCache();
      }
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      console.log('⚠️  Falling back to NodeCache');
      this.initNodeCache();
    }
  }

  /**
   * تهيئة NodeCache كبديل
   */
  initNodeCache() {
    this.nodeCache = new NodeCache({
      stdTTL: this.ttl,
      checkperiod: 120, // فحص العناصر المنتهية كل دقيقتين
      useClones: false // لتحسين الأداء
    });
    this.isRedisAvailable = false;
    console.log('✅ NodeCache initialized');
  }

  /**
   * توليد مفتاح cache من معاملات البحث
   * @param {string} query - نص البحث
   * @param {Object} options - خيارات البحث
   * @returns {string} - مفتاح cache
   */
  generateCacheKey(query, options = {}) {
    const {
      type = 'jobs',
      page = 1,
      limit = 20,
      sort = 'relevance',
      filters = {}
    } = options;

    // ترتيب الفلاتر alphabetically لضمان نفس المفتاح
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((acc, key) => {
        acc[key] = filters[key];
        return acc;
      }, {});

    // بناء المفتاح
    const keyParts = [
      'search',
      type,
      query.toLowerCase().trim(),
      `page:${page}`,
      `limit:${limit}`,
      `sort:${sort}`,
      JSON.stringify(sortedFilters)
    ];

    return keyParts.join(':');
  }

  /**
   * الحصول على قيمة من cache
   * @param {string} key - مفتاح cache
   * @returns {Promise<any|null>} - القيمة أو null
   */
  async get(key) {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else if (this.nodeCache) {
        return this.nodeCache.get(key) || null;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * حفظ قيمة في cache
   * @param {string} key - مفتاح cache
   * @param {any} value - القيمة
   * @param {number} ttl - مدة الصلاحية (بالثواني، اختياري)
   * @returns {Promise<boolean>} - نجح أم لا
   */
  async set(key, value, ttl = null) {
    try {
      const expiryTime = ttl || this.ttl;

      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.setEx(key, expiryTime, JSON.stringify(value));
        return true;
      } else if (this.nodeCache) {
        return this.nodeCache.set(key, value, expiryTime);
      }
      return false;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * حذف قيمة من cache
   * @param {string} key - مفتاح cache
   * @returns {Promise<boolean>} - نجح أم لا
   */
  async del(key) {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.del(key);
        return true;
      } else if (this.nodeCache) {
        return this.nodeCache.del(key) > 0;
      }
      return false;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * حذف جميع المفاتيح التي تبدأ بـ pattern
   * @param {string} pattern - النمط (مثل: 'search:jobs:*')
   * @returns {Promise<number>} - عدد المفاتيح المحذوفة
   */
  async delPattern(pattern) {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
          return keys.length;
        }
        return 0;
      } else if (this.nodeCache) {
        const keys = this.nodeCache.keys();
        const matchingKeys = keys.filter(key => {
          const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
          return regex.test(key);
        });
        this.nodeCache.del(matchingKeys);
        return matchingKeys.length;
      }
      return 0;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * مسح جميع cache
   * @returns {Promise<boolean>} - نجح أم لا
   */
  async flush() {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.flushAll();
        return true;
      } else if (this.nodeCache) {
        this.nodeCache.flushAll();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * الحصول على إحصائيات cache
   * @returns {Promise<Object>} - الإحصائيات
   */
  async getStats() {
    try {
      if (this.isRedisAvailable && this.redisClient) {
        const info = await this.redisClient.info('stats');
        return {
          type: 'redis',
          connected: this.isRedisAvailable,
          info
        };
      } else if (this.nodeCache) {
        return {
          type: 'node-cache',
          connected: true,
          stats: this.nodeCache.getStats()
        };
      }
      return {
        type: 'none',
        connected: false
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        type: 'error',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * إغلاق الاتصال
   */
  async close() {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      if (this.nodeCache) {
        this.nodeCache.close();
      }
    } catch (error) {
      console.error('Cache close error:', error);
    }
  }
}

// تصدير instance واحد (Singleton)
module.exports = new CacheService();
