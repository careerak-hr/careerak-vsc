import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isOnboardingComplete } from '../utils/onboardingUtils';
import { SuspenseWrapper, GlobalLoader } from './GlobalLoaders';

// Lazy load LanguagePage
const LanguagePage = React.lazy(() => import('../pages/00_LanguagePage'));

/**
 * Smart Home Route Component - Handles initial routing logic correctly.
 */
function SmartHomeRoute() {
  const [isComplete, setIsComplete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const complete = await isOnboardingComplete();
        setIsComplete(complete);
      } catch (error) {
        console.error('Failed to check onboarding status, defaulting to false:', error);
        setIsComplete(false); // On error, assume onboarding is not complete
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // While checking the status, show a global loader
  if (loading) {
    return <GlobalLoader />;
  }

  // If onboarding is complete, redirect to the entry page for the animation.
  if (isComplete) {
    console.log("✅ Onboarding is complete, redirecting to /entry.");
    return <Navigate to="/entry" replace />;
  }
  
  // If onboarding is NOT complete, show the language page.
  console.log("🆕 Onboarding not complete, showing LanguagePage.");
  return (
    <SuspenseWrapper>
      <LanguagePage />
    </SuspenseWrapper>
  );
}

export default SmartHomeRoute;
