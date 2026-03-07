const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter للبحث
 * حد 30 طلب بحث في الدقيقة لكل مستخدم
 */
const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 30, // 30 طلب كحد أقصى
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'لقد تجاوزت الحد الأقصى لطلبات البحث (30 طلب في الدقيقة). يرجى المحاولة لاحقاً.'
    }
  },
  standardHeaders: true, // إرجاع معلومات rate limit في headers
  legacyHeaders: false, // تعطيل X-RateLimit-* headers القديمة
  // استخدام IP + User ID للتعريف
  keyGenerator: (req, res) => {
    // إذا كان المستخدم مسجل دخول، نستخدم user ID
    if (req.user && req.user._id) {
      return `user_${req.user._id}`;
    }
    // وإلا نستخدم IP (مع دعم IPv6)
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // تخطي الطلبات الناجحة فقط (لا نحسب الأخطاء)
  skipSuccessfulRequests: false,
  // تخطي الطلبات الفاشلة
  skipFailedRequests: true,
  // handler مخصص للأخطاء
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'لقد تجاوزت الحد الأقصى لطلبات البحث (30 طلب في الدقيقة). يرجى المحاولة لاحقاً.',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) // وقت إعادة المحاولة بالثواني
      }
    });
  }
});

/**
 * Rate Limiter للـ Autocomplete
 * حد 60 طلب في الدقيقة (أكثر من البحث لأنه يُستدعى مع كل حرف)
 */
const autocompleteRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 60, // 60 طلب كحد أقصى
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'لقد تجاوزت الحد الأقصى لطلبات الاقتراحات. يرجى المحاولة لاحقاً.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    if (req.user && req.user._id) {
      return `user_${req.user._id}`;
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'لقد تجاوزت الحد الأقصى لطلبات الاقتراحات. يرجى المحاولة لاحقاً.',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
      }
    });
  }
});

/**
 * Rate Limiter عام للـ API
 * حد 100 طلب في الدقيقة لكل IP
 */
const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 100, // 100 طلب كحد أقصى
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'لقد تجاوزت الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

module.exports = {
  searchRateLimiter,
  autocompleteRateLimiter,
  generalRateLimiter
};
