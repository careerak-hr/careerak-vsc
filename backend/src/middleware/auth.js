const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول للوصول إلى هذه الميزة' });
    }

    const token = authHeader.split(' ')[1];
    
    // التحقق من المفتاح السري - التأكد من وجوده في ملف .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ error: 'خطأ في إعدادات السيرفر' });
    }

    const decoded = jwt.verify(token, secret);

    // Check if account is disabled (skip for admin)
    if (decoded.role !== 'Admin') {
      const user = await User.findById(decoded.id).select('accountDisabled');
      if (user && user.accountDisabled) {
        return res.status(403).json({ 
          error: 'تم تعطيل حسابك. يرجى التواصل مع الدعم الفني.',
          accountDisabled: true
        });
      }
    }

    // إضافة بيانات المستخدم للطلب
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.name);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' });
    }
    res.status(401).json({ error: 'جلسة غير صالحة، يرجى إعادة تسجيل الدخول' });
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.warn(`Unauthorized access attempt by user: ${req.user?.id} with role: ${req.user?.role}`);
      return res.status(403).json({ error: 'ليس لديك الصلاحية للقيام بهذا الإجراء' });
    }
    next();
  };
};

// Alias for auth middleware (used in some routes)
const protect = auth;

// Alias for checkRole middleware (used in some routes)
const authorize = checkRole;

module.exports = { auth, checkRole, protect, authorize };
