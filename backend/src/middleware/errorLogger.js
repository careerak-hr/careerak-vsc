const logger = require('../utils/logger');

/**
 * Middleware لتسجيل الأخطاء مع السياق الكامل
 */
const errorLogger = (err, req, res, next) => {
  // جمع معلومات السياق
  const context = {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?._id,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  };

  // تسجيل الخطأ مع السياق
  logger.error(`${err.name}: ${err.message}`, {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500
    },
    context,
    type: 'API_ERROR'
  });

  // تمرير الخطأ للـ middleware التالي
  next(err);
};

/**
 * دالة مساعدة لتسجيل أخطاء محددة
 */
const logError = (error, context = {}) => {
  logger.error(`${error.name}: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    type: 'APPLICATION_ERROR'
  });
};

/**
 * دالة مساعدة لتسجيل أخطاء قاعدة البيانات
 */
const logDatabaseError = (error, operation, model, query = {}) => {
  logger.error(`Database Error: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    database: {
      operation,
      model,
      query
    },
    type: 'DATABASE_ERROR'
  });
};

/**
 * دالة مساعدة لتسجيل أخطاء التحقق
 */
const logValidationError = (error, data, source) => {
  logger.warn(`Validation Error: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message,
      errors: error.errors
    },
    validation: {
      data,
      source
    },
    type: 'VALIDATION_ERROR'
  });
};

/**
 * دالة مساعدة لتسجيل أخطاء المصادقة
 */
const logAuthError = (error, userId, action) => {
  logger.warn(`Authentication Error: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message
    },
    auth: {
      userId,
      action
    },
    type: 'AUTH_ERROR'
  });
};

/**
 * دالة مساعدة لتسجيل أخطاء الصلاحيات
 */
const logAuthorizationError = (userId, resource, action) => {
  logger.warn('Authorization Error: Access Denied', {
    auth: {
      userId,
      resource,
      action
    },
    type: 'AUTHORIZATION_ERROR'
  });
};

/**
 * دالة مساعدة لتسجيل أخطاء الخدمات الخارجية
 */
const logExternalServiceError = (error, service, operation, data = {}) => {
  logger.error(`External Service Error: ${service}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    },
    service: {
      name: service,
      operation,
      data
    },
    type: 'EXTERNAL_SERVICE_ERROR'
  });
};

module.exports = {
  errorLogger,
  logError,
  logDatabaseError,
  logValidationError,
  logAuthError,
  logAuthorizationError,
  logExternalServiceError
};
