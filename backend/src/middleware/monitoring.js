const logger = require('../utils/logger');

// 📊 Middleware لمراقبة الأداء
const performanceMonitoring = (req, res, next) => {
  const startTime = Date.now();
  
  // تسجيل بداية الطلب
  logger.http(`${req.method} ${req.url} - Started`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url
  });

  // تسجيل نهاية الطلب
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.performance.responseTime(req.method, req.url, duration, res.statusCode);
    
    // تحذير للطلبات البطيئة
    if (duration > 2000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        statusCode: res.statusCode,
        ip: req.ip
      });
    }
  });

  next();
};

// 🔒 Middleware لمراقبة الأمان
const securityMonitoring = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\.\//g, // Path traversal
    /<script/gi, // XSS attempts
    /union.*select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /eval\(/gi, // Code injection
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  // فحص الأنماط المشبوهة
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(requestData)) {
      logger.security.suspiciousActivity(
        'Malicious pattern detected',
        { pattern: pattern.toString(), data: requestData },
        req.ip,
        req.get('User-Agent')
      );
    }
  });

  // مراقبة محاولات الوصول للمسارات الحساسة
  const sensitivePaths = ['/admin', '/config', '/env', '/.env'];
  if (sensitivePaths.some(path => req.url.includes(path))) {
    logger.security.suspiciousActivity(
      'Access to sensitive path',
      { path: req.url },
      req.ip,
      req.get('User-Agent')
    );
  }

  next();
};

// 📈 Middleware لجمع الإحصائيات
let requestStats = {
  total: 0,
  byMethod: {},
  byStatus: {},
  errors: 0,
  lastReset: Date.now()
};

const statisticsCollection = (req, res, next) => {
  requestStats.total++;
  requestStats.byMethod[req.method] = (requestStats.byMethod[req.method] || 0) + 1;

  res.on('finish', () => {
    const statusCategory = Math.floor(res.statusCode / 100) * 100;
    requestStats.byStatus[statusCategory] = (requestStats.byStatus[statusCategory] || 0) + 1;
    
    if (res.statusCode >= 400) {
      requestStats.errors++;
    }
  });

  next();
};

// دالة للحصول على الإحصائيات
const getStats = () => {
  const uptime = Date.now() - requestStats.lastReset;
  return {
    ...requestStats,
    uptime: Math.round(uptime / 1000), // بالثواني
    requestsPerSecond: Math.round(requestStats.total / (uptime / 1000)),
    errorRate: Math.round((requestStats.errors / requestStats.total) * 100) || 0
  };
};

// إعادة تعيين الإحصائيات
const resetStats = () => {
  requestStats = {
    total: 0,
    byMethod: {},
    byStatus: {},
    errors: 0,
    lastReset: Date.now()
  };
};

// 🚨 Middleware للكشف عن الهجمات
const attackDetection = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  // تتبع الطلبات لكل IP
  if (!global.ipRequests) {
    global.ipRequests = new Map();
  }

  const ipData = global.ipRequests.get(ip) || { count: 0, firstRequest: now, violations: 0 };
  
  // إعادة تعيين العداد كل دقيقة
  if (now - ipData.firstRequest > 60000) {
    ipData.count = 0;
    ipData.firstRequest = now;
  }

  ipData.count++;
  global.ipRequests.set(ip, ipData);

  // كشف الهجمات المحتملة
  if (ipData.count > 60) { // أكثر من 60 طلب في الدقيقة
    ipData.violations++;
    logger.security.suspiciousActivity(
      'Potential DDoS attack',
      { requestCount: ipData.count, violations: ipData.violations },
      ip,
      req.get('User-Agent')
    );

    // حظر مؤقت للـ IP المشبوه
    if (ipData.violations > 3) {
      logger.security.securityViolation(
        'IP blocked due to excessive requests',
        { requestCount: ipData.count, violations: ipData.violations },
        ip,
        req.get('User-Agent')
      );
      
      return res.status(429).json({ 
        error: 'تم حظر عنوان IP الخاص بك مؤقتاً بسبب النشاط المشبوه' 
      });
    }
  }

  next();
};

module.exports = {
  performanceMonitoring,
  securityMonitoring,
  statisticsCollection,
  attackDetection,
  getStats,
  resetStats
};