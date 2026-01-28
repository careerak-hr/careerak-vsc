import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { navigationMiddleware, getDefaultRouteForUser } from '../middleware/routeMiddleware';

/**
 * Hook للتنقل مع التحقق من الصلاحيات
 * Navigation Hook with Permission Checks
 */
export const useNavigationGuard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /**
   * التنقل مع التحقق من الصلاحيات
   * Navigate with Permission Check
   */
  const guardedNavigate = (targetRoute, options = {}) => {
    const { allowed, redirectTo, reason } = navigationMiddleware(user, targetRoute);
    
    if (!allowed) {
      console.warn(`Navigation blocked to ${targetRoute}. Reason: ${reason}. Redirecting to: ${redirectTo}`);
      navigate(redirectTo, { replace: true, ...options });
      return false;
    }
    
    navigate(targetRoute, options);
    return true;
  };

  /**
   * التنقل للصفحة الافتراضية حسب دور المستخدم
   * Navigate to Default Route Based on User Role
   */
  const navigateToDefault = (options = {}) => {
    const defaultRoute = getDefaultRouteForUser(user);
    navigate(defaultRoute, { replace: true, ...options });
  };

  /**
   * التنقل مع حفظ المسار الحالي للعودة
   * Navigate with State Preservation
   */
  const navigateWithReturn = (targetRoute, options = {}) => {
    const currentPath = window.location.pathname;
    return guardedNavigate(targetRoute, {
      state: { from: currentPath },
      ...options
    });
  };

  return {
    guardedNavigate,
    navigateToDefault,
    navigateWithReturn,
    // إعادة تصدير navigate العادي للحالات الخاصة
    navigate
  };
};

export default useNavigationGuard;