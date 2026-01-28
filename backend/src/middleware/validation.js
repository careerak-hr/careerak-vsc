const Joi = require('joi');

// 🔍 Schema للتحقق من بيانات التسجيل
const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
    .messages({
      'string.pattern.base': 'رقم الهاتف غير صحيح',
      'any.required': 'رقم الهاتف مطلوب'
    }),
  password: Joi.string().min(8).required()
    .messages({
      'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      'any.required': 'كلمة المرور مطلوبة'
    }),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('HR', 'Employee', 'Admin').required(),
  country: Joi.string().required(),
  city: Joi.string().optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  birthDate: Joi.date().optional(),
  privacyAccepted: Joi.boolean().default(true)
});

// 🔍 Schema للتحقق من بيانات تحديث الملف الشخصي
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  city: Joi.string().max(100).optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  birthDate: Joi.date().optional(),
  profileImage: Joi.string().uri().optional(),
  // منع تعديل الحقول الحساسة
  password: Joi.forbidden(),
  role: Joi.forbidden(),
  phone: Joi.forbidden(),
  isVerified: Joi.forbidden(),
  _id: Joi.forbidden()
});

// 🔍 Schema لتسجيل الدخول
const loginSchema = Joi.object({
  email: Joi.string().required()
    .messages({
      'any.required': 'البريد الإلكتروني أو رقم الهاتف مطلوب'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'كلمة المرور مطلوبة'
    })
});

// 🛡️ Middleware للتحقق من البيانات
const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message 
    });
  }
  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message 
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message 
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateUpdateProfile,
  validateLogin
};