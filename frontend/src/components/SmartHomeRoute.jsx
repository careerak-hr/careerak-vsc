import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isOnboardingComplete } from '../utils/onboardingUtils';
import { SuspenseWrapper, GlobalLoader } from './GlobalLoaders';

// Lazy load LanguagePage
const LanguagePage = React.lazy(() => import('../pages/00_LanguagePage'));

/**
 * Smart Home Route Component - Handles initial routing logic correctly with a timeout.
 */
function SmartHomeRoute() {
  const [isComplete, setIsComplete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('🔍 Checking onboarding status...');
        
        // Race against a timeout to prevent getting stuck
        const complete = await Promise.race([
          isOnboardingComplete(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
        ]);
        
        console.log('📊 Onboarding complete status:', complete);
        setIsComplete(complete);
      } catch (error) {
        console.error('⚠️ Onboarding check failed or timed out, defaulting to false:', error);
        setIsComplete(false); // On any error or timeout, assume onboarding is not complete
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  if (loading) {
    return <GlobalLoader />;
  }

  if (isComplete) {
    console.log("✅ Onboarding is complete, redirecting to /entry.");
    return <Navigate to="/entry" replace />;
  }
  
  console.log("🆕 Onboarding not complete, showing LanguagePage.");
  return (
    <SuspenseWrapper>
      <LanguagePage />
    </SuspenseWrapper>
  );
}

export default SmartHomeRoute;
