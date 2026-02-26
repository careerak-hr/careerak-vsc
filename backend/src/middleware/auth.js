const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Requirement 11.5: Return 401 for unauthenticated requests
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'يجب تسجيل الدخول للوصول إلى هذه الميزة',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // التحقق من المفتاح السري - التأكد من وجوده في ملف .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ error: 'خطأ في إعدادات السيرفر' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, secret);

    // Check if account is disabled (skip for admin)
    if (decoded.role !== 'Admin') {
      const user = await User.findById(decoded.id).select('accountDisabled');
      if (user && user.accountDisabled) {
        return res.status(403).json({ 
          error: 'تم تعطيل حسابك. يرجى التواصل مع الدعم الفني.',
          accountDisabled: true,
          code: 'ACCOUNT_DISABLED'
        });
      }
    }

    // إضافة بيانات المستخدم للطلب
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.name, error.message);
    
    // Requirement 11.9: Handle session expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
        code: 'SESSION_EXPIRED',
        expiredAt: error.expiredAt
      });
    }
    
    // Handle malformed JWT tokens
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'جلسة غير صالحة، يرجى إعادة تسجيل الدخول',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Handle other JWT errors
    return res.status(401).json({ 
      error: 'جلسة غير صالحة، يرجى إعادة تسجيل الدخول',
      code: 'AUTHENTICATION_FAILED'
    });
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    // Requirement 11.6: Return 403 for non-admin users
    if (!req.user) {
      console.warn('Authorization check failed: No user in request');
      return res.status(401).json({ 
        error: 'يجب تسجيل الدخول للوصول إلى هذه الميزة',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.warn(`Unauthorized access attempt by user: ${req.user?.id} with role: ${req.user?.role}. Required roles: ${roles.join(', ')}`);
      return res.status(403).json({ 
        error: 'ليس لديك الصلاحية للقيام بهذا الإجراء',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

// Alias for auth middleware (used in some routes)
const protect = auth;

// Alias for checkRole middleware (used in some routes)
const authorize = checkRole;

// Admin-specific middleware (combines auth + admin role check)
// Requirement 11.5, 11.6: Verify JWT token and admin role on all admin routes
const requireAdmin = [
  auth,
  checkRole('Admin', 'HR')
];

module.exports = { auth, checkRole, protect, authorize, requireAdmin };
