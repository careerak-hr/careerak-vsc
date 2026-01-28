/**
 * Route Middleware للتحقق من الصلاحيات والحالات
 * Route Middleware for Permission and State Checks
 */

/**
 * التحقق من صلاحيات المستخدم
 * Check User Permissions
 */
export const checkUserPermissions = (user, requiredRoles = []) => {
  if (!user) return false;
  
  if (requiredRoles.length === 0) return true;
  
  return requiredRoles.includes(user.role);
};

/**
 * التحقق من حالة الإعداد الأولي
 * Check Onboarding Status
 */
export const checkOnboardingStatus = (user) => {
  if (!user) return { completed: false, redirectTo: '/login' };
  
  if (!user.bio) {
    const redirectMap = {
      'Admin': '/admin-dashboard',
      'HR': '/onboarding-companies',
      'Individual': '/onboarding-individuals'
    };
    
    return { 
      completed: false, 
      redirectTo: redirectMap[user.role] || '/onboarding-individuals' 
    };
  }
  
  return { completed: true, redirectTo: null };
};

/**
 * تحديد المسار المناسب حسب دور المستخدم
 * Determine Appropriate Route Based on User Role
 */
export const getDefaultRouteForUser = (user) => {
  if (!user) return '/login';
  
  const { completed, redirectTo } = checkOnboardingStatus(user);
  
  if (!completed) return redirectTo;
  
  const defaultRoutes = {
    'Admin': '/admin-dashboard',
    'HR': '/profile',
    'Individual': '/profile'
  };
  
  return defaultRoutes[user.role] || '/profile';
};

/**
 * التحقق من إمكانية الوصول للمسار
 * Check Route Access Permission
 */
export const canAccessRoute = (user, routePath) => {
  if (!user) return false;
  
  // مسارات الأدمن فقط
  const adminOnlyRoutes = [
    '/admin-dashboard',
    '/admin-sub-dashboard'
  ];
  
  // مسارات HR والأدمن
  const hrRoutes = [
    '/post-job',
    '/post-course'
  ];
  
  // مسارات الإعداد الأولي
  const onboardingRoutes = [
    '/onboarding-individuals',
    '/onboarding-companies',
    '/onboarding-illiterate',
    '/onboarding-visual',
    '/onboarding-ultimate'
  ];
  
  // التحقق من مسارات الأدمن
  if (adminOnlyRoutes.some(route => routePath.startsWith(route))) {
    return user.role === 'Admin';
  }
  
  // التحقق من مسارات HR
  if (hrRoutes.some(route => routePath.startsWith(route))) {
    return user.role === 'HR' || user.role === 'Admin';
  }
  
  // التحقق من مسارات الإعداد الأولي
  if (onboardingRoutes.some(route => routePath.startsWith(route))) {
    return !user.bio; // يمكن الوصول فقط إذا لم يكمل الإعداد
  }
  
  return true; // باقي المسارات متاحة للجميع
};

/**
 * middleware للتحقق من الصلاحيات قبل التنقل
 * Navigation Permission Middleware
 */
export const navigationMiddleware = (user, targetRoute) => {
  const canAccess = canAccessRoute(user, targetRoute);
  
  if (!canAccess) {
    const defaultRoute = getDefaultRouteForUser(user);
    return {
      allowed: false,
      redirectTo: defaultRoute,
      reason: 'insufficient_permissions'
    };
  }
  
  return {
    allowed: true,
    redirectTo: null,
    reason: null
  };
};

export default {
  checkUserPermissions,
  checkOnboardingStatus,
  getDefaultRouteForUser,
  canAccessRoute,
  navigationMiddleware
};