const winston = require('winston');
const path = require('path');

// تكوين مستويات السجل المخصصة
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// تنسيق السجل
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${
      info.stack ? '\n' + info.stack : ''
    }${
      info.metadata && Object.keys(info.metadata).length > 0 
        ? '\n' + JSON.stringify(info.metadata, null, 2) 
        : ''
    }`
  ),
);

// إعداد النقل (Transports)
const transports = [
  // Console للتطوير
  new winston.transports.Console({
    format: format,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  }),
];

// في الإنتاج، إضافة ملفات السجل
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // سجل الأخطاء
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // سجل شامل
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// إنشاء Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports,
  exitOnError: false,
});

// دوال مساعدة للسجل الأمني
logger.security = {
  // تسجيل محاولات الدخول
  loginAttempt: (email, success, ip, userAgent) => {
    logger.info(`Login attempt: ${success ? 'SUCCESS' : 'FAILED'}`, {
      email,
      ip,
      userAgent,
      success,
      type: 'LOGIN_ATTEMPT'
    });
  },

  // تسجيل إنشاء الحسابات
  registration: (email, ip, userAgent) => {
    logger.info('User registration', {
      email,
      ip,
      userAgent,
      type: 'REGISTRATION'
    });
  },

  // تسجيل تحديث الملف الشخصي
  profileUpdate: (userId, fields, ip) => {
    logger.info('Profile updated', {
      userId,
      fields: Object.keys(fields),
      ip,
      type: 'PROFILE_UPDATE'
    });
  },

  // تسجيل الأنشطة المشبوهة
  suspiciousActivity: (activity, details, ip, userAgent) => {
    logger.warn(`Suspicious activity: ${activity}`, {
      details,
      ip,
      userAgent,
      type: 'SUSPICIOUS_ACTIVITY'
    });
  },

  // تسجيل انتهاكات الأمان
  securityViolation: (violation, details, ip, userAgent) => {
    logger.error(`Security violation: ${violation}`, {
      details,
      ip,
      userAgent,
      type: 'SECURITY_VIOLATION'
    });
  }
};

// دوال مساعدة للأداء
logger.performance = {
  // تسجيل أوقات الاستجابة
  responseTime: (method, url, duration, statusCode) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger[level](`${method} ${url} - ${duration}ms - ${statusCode}`, {
      method,
      url,
      duration,
      statusCode,
      type: 'PERFORMANCE'
    });
  },

  // تسجيل استخدام الذاكرة
  memoryUsage: () => {
    const usage = process.memoryUsage();
    logger.info('Memory usage', {
      rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
      type: 'MEMORY_USAGE'
    });
  }
};

// إنشاء مجلد السجلات إذا لم يكن موجوداً
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

module.exports = logger;