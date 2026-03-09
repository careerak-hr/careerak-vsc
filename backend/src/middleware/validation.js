const Joi = require('joi');

/**
 * Input Validation & Sanitization Middleware
 * Implements validation schemas and sanitization for user inputs
 */

/**
 * Sanitize a string to prevent XSS attacks
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove HTML tags and dangerous characters
  return input
    // Remove script tags with content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove all HTML tags (including self-closing)
    .replace(/<[^>]*>/g, '')
    // Remove standalone < and > characters
    .replace(/[<>]/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Sanitize an object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validation schemas for settings endpoints
 */
const validationSchemas = {
  // Profile update
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    language: Joi.string().valid('ar', 'en', 'fr'),
    timezone: Joi.string().max(50)
  }).min(1),
  
  // Email change
  emailChange: Joi.object({
    newEmail: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  // Email verification
  emailVerify: Joi.object({
    oldEmailOTP: Joi.string().length(6).pattern(/^\d+$/).required(),
    newEmailOTP: Joi.string().length(6).pattern(/^\d+$/).required(),
    password: Joi.string().required()
  }),
  
  // Phone change
  phoneChange: Joi.object({
    newPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),
  
  // Password change
  passwordChange: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      })
  }),
  
  // Privacy settings
  privacySettings: Joi.object({
    profileVisibility: Joi.string().valid('everyone', 'registered', 'none'),
    showEmail: Joi.boolean(),
    showPhone: Joi.boolean(),
    messagePermissions: Joi.string().valid('everyone', 'contacts', 'none'),
    showOnlineStatus: Joi.boolean(),
    allowSearchEngineIndexing: Joi.boolean()
  }).min(1),
  
  // Notification preferences
  notificationPreferences: Joi.object({
    jobNotifications: Joi.object({
      enabled: Joi.boolean(),
      inApp: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean()
    }),
    courseNotifications: Joi.object({
      enabled: Joi.boolean(),
      inApp: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean()
    }),
    chatNotifications: Joi.object({
      enabled: Joi.boolean(),
      inApp: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean()
    }),
    reviewNotifications: Joi.object({
      enabled: Joi.boolean(),
      inApp: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean()
    }),
    systemNotifications: Joi.object({
      enabled: Joi.boolean(),
      inApp: Joi.boolean(),
      email: Joi.boolean(),
      push: Joi.boolean()
    }),
    quietHours: Joi.object({
      enabled: Joi.boolean(),
      start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
      end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    }),
    frequency: Joi.string().valid('immediate', 'daily', 'weekly')
  }).min(1),
  
  // 2FA verification
  twoFactorVerify: Joi.object({
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),
  
  // 2FA disable
  twoFactorDisable: Joi.object({
    password: Joi.string().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),
  
  // Data export request
  dataExport: Joi.object({
    dataTypes: Joi.array()
      .items(Joi.string().valid('profile', 'activity', 'messages', 'applications', 'courses'))
      .min(1)
      .required(),
    format: Joi.string().valid('json', 'csv', 'pdf').required()
  }),
  
  // Account deletion
  accountDeletion: Joi.object({
    type: Joi.string().valid('immediate', 'scheduled').required(),
    password: Joi.string().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/)
  })
};

/**
 * Create validation middleware
 * @param {string} schemaName - Name of validation schema
 * @returns {Function} Express middleware
 */
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_SCHEMA_NOT_FOUND',
          message: 'Validation schema not found'
        }
      });
    }
    
    // Sanitize input first
    req.body = sanitizeObject(req.body);
    
    // Validate
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors
        }
      });
    }
    
    // Replace body with validated and sanitized value
    req.body = value;
    next();
  };
};

/**
 * Sanitization middleware (can be used standalone)
 */
const sanitize = (req, res, next) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};

module.exports = {
  validate,
  sanitize,
  sanitizeString,
  sanitizeObject,
  validationSchemas
};
