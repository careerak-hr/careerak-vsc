const { calculatePasswordStrength, meetsAllRequirements } = require('../services/passwordService');

/**
 * Middleware للتحقق من قوة كلمة المرور
 * يتحقق من أن كلمة المرور تستوفي جميع المتطلبات وقوتها مقبولة
 */
const validatePasswordStrength = (req, res, next) => {
  const { password } = req.body;

  // التحقق من وجود كلمة المرور
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'كلمة المرور مطلوبة',
      messageEn: 'Password is required'
    });
  }

  // التحقق من استيفاء جميع المتطلبات
  if (!meetsAllRequirements(password)) {
    return res.status(400).json({
      success: false,
      message: 'كلمة المرور لا تستوفي جميع المتطلبات',
      messageEn: 'Password does not meet all requirements',
      requirements: {
        length: 'يجب أن تحتوي على 8 أحرف على الأقل',
        uppercase: 'يجب أن تحتوي على حرف كبير واحد على الأقل',
        lowercase: 'يجب أن تحتوي على حرف صغير واحد على الأقل',
        number: 'يجب أن تحتوي على رقم واحد على الأقل',
        special: 'يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)'
      }
    });
  }

  // حساب قوة كلمة المرور
  const strength = calculatePasswordStrength(password);

  // التحقق من أن القوة مقبولة (score >= 2 = fair أو أعلى)
  if (strength.score < 2) {
    return res.status(400).json({
      success: false,
      message: 'كلمة المرور ضعيفة جداً. يرجى استخدام كلمة مرور أقوى',
      messageEn: 'Password is too weak. Please use a stronger password',
      strength: {
        score: strength.score,
        label: strength.label,
        labelAr: strength.labelAr,
        feedback: strength.feedbackAr
      }
    });
  }

  // حفظ معلومات القوة في req لاستخدامها لاحقاً
  req.passwordStrength = {
    score: strength.score,
    label: strength.label
  };

  next();
};

/**
 * Middleware للتحقق من تطابق كلمة المرور مع التأكيد
 */
const validatePasswordMatch = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
      messageEn: 'Password and confirm password do not match'
    });
  }

  next();
};

module.exports = {
  validatePasswordStrength,
  validatePasswordMatch
};
