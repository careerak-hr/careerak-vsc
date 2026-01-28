import React from 'react';
import { Navigate } from 'react-router-dom';
import { isOnboardingComplete } from '../utils/onboardingUtils';
import { SuspenseWrapper } from './GlobalLoaders';

// Lazy load LanguagePage
const LanguagePage = React.lazy(() => import('../pages/00_LanguagePage'));

/**
 * مكون للتوجيه الذكي للصفحة الرئيسية
 * Smart Home Route Component - Handles initial routing logic
 */
function SmartHomeRoute() {
  const isComplete = isOnboardingComplete();
  
  // إذا لم يكمل المستخدم الإعداد الأولي
  if (!isComplete) {
    console.log("🆕 First time user, showing language selection");
    return (
      <SuspenseWrapper>
        <LanguagePage />
      </SuspenseWrapper>
    );
  }
  
  // المستخدم أكمل الإعداد، انتقل لصفحة الدخول
  console.log("✅ User completed onboarding, redirecting to entry");
  return <Navigate to="/entry" replace />;
}

export default SmartHomeRoute;