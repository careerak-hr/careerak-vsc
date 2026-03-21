/**
 * Redis Configuration
 * إعدادات Redis للتخزين المؤقت
 * 
 * يستخدم لتخزين التوصيات مؤقتاً وتحسين الأداء
 */

const redis = require('redis');
const { promisify } = require('util');

// إعدادات Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// إنشاء عميل Redis
let redisClient = null;
let isConnected = false;

/**
 * إنشاء اتصال Redis
 */
const createRedisClient = () => {
  if (redisClient && isConnected) {
    return redisClient;
  }

  try {
    redisClient = redis.createClient(redisConfig);

    // معالجة الأحداث
    redisClient.on('connect', () => {
      console.log('✅ Redis: Connected successfully');
      isConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis: Ready to accept commands');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
      isConnected = false;
    });

    redisClient.on('end', () => {
      console.log('⚠️  Redis: Connection closed');
      isConnected = false;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis: Reconnecting...');
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Redis: Failed to create client:', error.message);
    return null;
  }
};

/**
 * الحصول على عميل Redis
 */
const getRedisClient = () => {
  if (!redisClient || !isConnected) {
    return createRedisClient();
  }
  return redisClient;
};

/**
 * إغلاق اتصال Redis
 */
const closeRedisConnection = () => {
  if (redisClient && isConnected) {
    redisClient.quit();
    redisClient = null;
    isConnected = false;
    console.log('✅ Redis: Connection closed gracefully');
  }
};

/**
 * التحقق من اتصال Redis
 */
const isRedisConnected = () => {
  return isConnected;
};

/**
 * Promisified Redis methods
 */
const getAsync = (key) => {
  const client = getRedisClient();
  if (!client || !isConnected) return Promise.resolve(null);
  return promisify(client.get).bind(client)(key);
};

const setAsync = (key, value, expireSeconds) => {
  const client = getRedisClient();
  if (!client || !isConnected) return Promise.resolve(null);
  
  if (expireSeconds) {
    return promisify(client.setex).bind(client)(key, expireSeconds, value);
  }
  return promisify(client.set).bind(client)(key, value);
};

const delAsync = (key) => {
  const client = getRedisClient();
  if (!client || !isConnected) return Promise.resolve(null);
  return promisify(client.del).bind(client)(key);
};

const existsAsync = (key) => {
  const client = getRedisClient();
  if (!client || !isConnected) return Promise.resolve(false);
  return promisify(client.exists).bind(client)(key);
};

const expireAsync = (key, seconds) => {
  const client = getRedisClient();
  if (!client || !isConnected) return Promise.resolve(null);
  return promisify(client.expire).bind(client)(key, seconds);
};

const ttlAsync = (key) => {
  const client = getRedisClient();
  if (!client || !isConnected) return Promise.resolve(-1);
  return promisify(client.ttl).bind(client)(key);
};

const keysAsync = (pattern) => {
  const client = getRedisClient();
  if (!client || !isConnected) return Promise.resolve([]);
  return promisify(client.keys).bind(client)(pattern);
};

/**
 * Cache Helper Functions
 */

/**
 * حفظ بيانات في الكاش
 */
const cacheSet = async (key, data, ttl = 3600) => {
  try {
    const value = JSON.stringify(data);
    await setAsync(key, value, ttl);
    return true;
  } catch (error) {
    console.error('Redis cacheSet error:', error.message);
    return false;
  }
};

/**
 * جلب بيانات من الكاش
 */
const cacheGet = async (key) => {
  try {
    const value = await getAsync(key);
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    console.error('Redis cacheGet error:', error.message);
    return null;
  }
};

/**
 * حذف بيانات من الكاش
 */
const cacheDel = async (key) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    console.error('Redis cacheDel error:', error.message);
    return false;
  }
};

/**
 * حذف بيانات متعددة بنمط معين
 */
const cacheDelPattern = async (pattern) => {
  try {
    const keys = await keysAsync(pattern);
    if (keys.length === 0) return 0;
    
    const client = getRedisClient();
    if (!client || !isConnected) return 0;
    
    const delPromises = keys.map(key => delAsync(key));
    await Promise.all(delPromises);
    
    return keys.length;
  } catch (error) {
    console.error('Redis cacheDelPattern error:', error.message);
    return 0;
  }
};

/**
 * التحقق من وجود مفتاح في الكاش
 */
const cacheExists = async (key) => {
  try {
    const exists = await existsAsync(key);
    return exists === 1;
  } catch (error) {
    console.error('Redis cacheExists error:', error.message);
    return false;
  }
};

/**
 * الحصول على وقت انتهاء الصلاحية
 */
const cacheTTL = async (key) => {
  try {
    return await ttlAsync(key);
  } catch (error) {
    console.error('Redis cacheTTL error:', error.message);
    return -1;
  }
};

/**
 * تحديث وقت انتهاء الصلاحية
 */
const cacheExpire = async (key, seconds) => {
  try {
    await expireAsync(key, seconds);
    return true;
  } catch (error) {
    console.error('Redis cacheExpire error:', error.message);
    return false;
  }
};

/**
 * Cache Keys Generator
 */
const CacheKeys = {
  // توصيات المستخدم
  userRecommendations: (userId, itemType) => `recommendations:${userId}:${itemType}`,
  
  // تحليل الملف الشخصي
  profileAnalysis: (userId) => `profile:analysis:${userId}`,
  
  // تفاعلات المستخدم
  userInteractions: (userId) => `interactions:${userId}`,
  
  // نموذج ML
  mlModel: (modelType) => `ml:model:${modelType}`,
  
  // ميزات المستخدم
  userFeatures: (userId) => `features:user:${userId}`,
  
  // ميزات الوظيفة
  jobFeatures: (jobId) => `features:job:${jobId}`,
  
  // ميزات الدورة
  courseFeatures: (courseId) => `features:course:${courseId}`,
  
  // إحصاءات
  stats: (type) => `stats:${type}`,
  
  // نمط لحذف جميع توصيات مستخدم
  userRecommendationsPattern: (userId) => `recommendations:${userId}:*`,
  
  // نمط لحذف جميع الميزات
  allFeaturesPattern: () => `features:*`,

  // === Referral & Rewards Cache Keys ===

  // كود الإحالة للمستخدم
  referralCode: (userId) => `referral:code:${userId}`,

  // رصيد نقاط المستخدم
  pointsBalance: (userId) => `points:balance:${userId}`,

  // خيارات الاستبدال (مشتركة لجميع المستخدمين)
  redemptionOptions: () => `redemption:options`,

  // لوحة المتصدرين حسب الفترة
  leaderboard: (period) => `leaderboard:${period}`,

  // ترتيب مستخدم في لوحة المتصدرين
  userRank: (userId, period) => `leaderboard:rank:${userId}:${period}`,

  // إحصائيات الإحالة للمستخدم
  referralStats: (userId) => `referral:stats:${userId}`,

  // نمط لحذف جميع بيانات الإحالة لمستخدم
  referralPattern: (userId) => `referral:*:${userId}`,

  // نمط لحذف جميع بيانات النقاط لمستخدم
  pointsPattern: (userId) => `points:*:${userId}`
};

module.exports = {
  createRedisClient,
  getRedisClient,
  closeRedisConnection,
  isRedisConnected,
  
  // Raw Redis methods
  getAsync,
  setAsync,
  delAsync,
  existsAsync,
  expireAsync,
  ttlAsync,
  keysAsync,
  
  // Cache helper methods
  cacheSet,
  cacheGet,
  cacheDel,
  cacheDelPattern,
  cacheExists,
  cacheTTL,
  cacheExpire,
  
  // Cache keys
  CacheKeys
};
