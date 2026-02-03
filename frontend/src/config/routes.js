/**
 * تكوين المسارات والصلاحيات
 * Routes Configuration and Permissions
 */

export const ROUTE_PERMISSIONS = {
  // مسارات عامة - لا تحتاج تسجيل دخول
  PUBLIC: [
    '/',
    '/language',
    '/entry',
    '/login',
    '/auth',
    '/otp-verify',
    '/test-input'
  ],
  
  // مسارات محمية - تحتاج تسجيل دخول
  PROTECTED: [
    '/profile',
    '/job-postings',
    '/courses',
    '/apply/:jobId',
    '/policy',
    '/settings'
  ],
  
  // مسارات الإعداد الأولي
  ONBOARDING: [
    '/onboarding-individuals',
    '/onboarding-companies',
    '/onboarding-illiterate',
    '/onboarding-visual',
    '/onboarding-ultimate'
  ],
  
  // مسارات الواجهات
  INTERFACES: [
    '/interface-individuals',
    '/interface-companies',
    '/interface-illiterate',
    '/interface-visual',
    '/interface-ultimate',
    '/interface-shops',
    '/interface-workshops'
  ],
  
  // مسارات HR فقط
  HR_ONLY: [
    '/post-job',
    '/post-course'
  ],
  
  // مسارات الأدمن فقط
  ADMIN_ONLY: [
    '/admin-dashboard',
    '/admin-sub-dashboard'
  ]
};

export const USER_ROLES = {
  ADMIN: 'Admin',
  HR: 'HR',
  INDIVIDUAL: 'Individual'
};

export const DEFAULT_ROUTES = {
  [USER_ROLES.ADMIN]: '/admin-dashboard',
  [USER_ROLES.HR]: '/profile',
  [USER_ROLES.INDIVIDUAL]: '/profile',
  GUEST: '/login',
  ONBOARDING_INCOMPLETE: {
    [USER_ROLES.ADMIN]: '/admin-dashboard',
    [USER_ROLES.HR]: '/onboarding-companies',
    [USER_ROLES.INDIVIDUAL]: '/onboarding-individuals'
  }
};

/**
 * الحصول على المسار الافتراضي للمستخدم
 * Get Default Route for User
 */
export const getDefaultRoute = (user) => {
  if (!user) return DEFAULT_ROUTES.GUEST;
  
  // التحقق من حالة الإعداد الأولي
  if (!user.bio) {
    return DEFAULT_ROUTES.ONBOARDING_INCOMPLETE[user.role] || DEFAULT_ROUTES.ONBOARDING_INCOMPLETE[USER_ROLES.INDIVIDUAL];
  }
  
  return DEFAULT_ROUTES[user.role] || DEFAULT_ROUTES[USER_ROLES.INDIVIDUAL];
};

/**
 * التحقق من صلاحية الوصول للمسار
 * Check Route Access Permission
 */
export const canAccessRoute = (user, routePath) => {
  // المسارات العامة متاحة للجميع
  if (ROUTE_PERMISSIONS.PUBLIC.some(route => routePath === route || routePath.startsWith(route))) {
    return true;
  }
  
  // المسارات المحمية تحتاج تسجيل دخول
  if (!user) return false;
  
  // مسارات الأدمن
  if (ROUTE_PERMISSIONS.ADMIN_ONLY.some(route => routePath.startsWith(route))) {
    return user.role === USER_ROLES.ADMIN;
  }
  
  // مسارات HR
  if (ROUTE_PERMISSIONS.HR_ONLY.some(route => routePath.startsWith(route))) {
    return user.role === USER_ROLES.HR || user.role === USER_ROLES.ADMIN;
  }
  
  // مسارات الإعداد الأولي
  if (ROUTE_PERMISSIONS.ONBOARDING.some(route => routePath.startsWith(route))) {
    return !user.bio; // متاح فقط للمستخدمين الذين لم يكملوا الإعداد
  }
  
  // باقي المسارات متاحة للمستخدمين المسجلين
  return true;
};

export default {
  ROUTE_PERMISSIONS,
  USER_ROLES,
  DEFAULT_ROUTES,
  getDefaultRoute,
  canAccessRoute
};