const crypto = require('crypto');

/**
 * Middleware لإضافة Cache-Control headers للـ GET endpoints
 */
const setCacheControl = (maxAge = 300) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      // Cache-Control header
      res.set('Cache-Control', `public, max-age=${maxAge}`);
    }
    next();
  };
};

/**
 * Middleware لإضافة ETag headers
 */
const setETag = (req, res, next) => {
  if (req.method === 'GET') {
    // حفظ الدالة الأصلية
    const originalSend = res.send;
    
    // استبدال دالة send
    res.send = function(data) {
      // حساب ETag من البيانات
      const etag = generateETag(data);
      res.set('ETag', etag);
      
      // التحقق من If-None-Match header
      const clientETag = req.get('If-None-Match');
      if (clientETag === etag) {
        // البيانات لم تتغير، إرجاع 304
        res.status(304);
        return originalSend.call(this, '');
      }
      
      // إرسال البيانات
      return originalSend.call(this, data);
    };
  }
  
  next();
};

/**
 * توليد ETag من البيانات
 */
const generateETag = (data) => {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return `"${crypto.createHash('md5').update(content).digest('hex')}"`;
};

/**
 * Middleware لإضافة Vary header
 */
const setVaryHeader = (headers = ['Accept-Encoding', 'Accept-Language']) => {
  return (req, res, next) => {
    res.set('Vary', headers.join(', '));
    next();
  };
};

/**
 * Middleware شامل للـ caching
 * يجمع Cache-Control, ETag, و Vary
 */
const cacheMiddleware = (options = {}) => {
  const {
    maxAge = 300, // 5 دقائق افتراضياً
    varyHeaders = ['Accept-Encoding', 'Accept-Language'],
    enableETag = true
  } = options;
  
  return (req, res, next) => {
    if (req.method === 'GET') {
      // Cache-Control
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      
      // Vary
      res.set('Vary', varyHeaders.join(', '));
      
      // ETag
      if (enableETag) {
        const originalSend = res.send;
        res.send = function(data) {
          const etag = generateETag(data);
          res.set('ETag', etag);
          
          const clientETag = req.get('If-None-Match');
          if (clientETag === etag) {
            res.status(304);
            return originalSend.call(this, '');
          }
          
          return originalSend.call(this, data);
        };
      }
    }
    
    next();
  };
};

/**
 * إعدادات cache مسبقة للاستخدامات المختلفة
 */
const cachePresets = {
  // بيانات ثابتة (24 ساعة)
  static: cacheMiddleware({ maxAge: 86400 }),
  
  // بيانات متوسطة التغيير (1 ساعة)
  medium: cacheMiddleware({ maxAge: 3600 }),
  
  // بيانات سريعة التغيير (5 دقائق)
  short: cacheMiddleware({ maxAge: 300 }),
  
  // بدون cache
  noCache: (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  }
};

/**
 * Middleware خاص بالدورات
 */
const courseCacheMiddleware = {
  // قائمة الدورات (5 دقائق)
  list: cacheMiddleware({ maxAge: 300 }),
  
  // تفاصيل الدورة (15 دقيقة)
  details: cacheMiddleware({ maxAge: 900 }),
  
  // محتوى الدرس (1 ساعة)
  lesson: cacheMiddleware({ maxAge: 3600 }),
  
  // المراجعات (10 دقائق)
  reviews: cacheMiddleware({ maxAge: 600 }),
  
  // التقدم (بدون cache - بيانات شخصية)
  progress: cachePresets.noCache,
  
  // التسجيل (بدون cache)
  enrollment: cachePresets.noCache
};

module.exports = {
  setCacheControl,
  setETag,
  setVaryHeader,
  cacheMiddleware,
  cachePresets,
  courseCacheMiddleware,
  generateETag
};
