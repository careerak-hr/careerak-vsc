/**
 * أدوات مساعدة لإدارة الإعداد الأولي
 * Onboarding Utilities
 */

/**
 * فحص ما إذا كان المستخدم أكمل الإعداد الأولي
 * Check if user has completed onboarding
 */
export const isOnboardingComplete = () => {
  const onboardingComplete = localStorage.getItem('onboardingComplete');
  const hasLanguage = localStorage.getItem('lang');
  
  console.log("🔍 Checking onboarding status:", {
    onboardingComplete,
    hasLanguage,
    isComplete: onboardingComplete === 'true' && hasLanguage
  });
  
  return onboardingComplete === 'true' && hasLanguage;
};

/**
 * تحديد أن الإعداد الأولي اكتمل
 * Mark onboarding as complete
 */
export const markOnboardingComplete = (language, audioConsent, notificationConsent) => {
  try {
    // حفظ الإعدادات الأساسية
    localStorage.setItem('lang', language);
    localStorage.setItem('audioConsent', audioConsent ? 'true' : 'false');
    localStorage.setItem('audio_enabled', audioConsent ? 'true' : 'false');
    localStorage.setItem('musicEnabled', audioConsent ? 'true' : 'false');
    localStorage.setItem('notificationsEnabled', notificationConsent ? 'true' : 'false');
    
    // تحديد أن الإعداد الأولي اكتمل
    localStorage.setItem('onboardingComplete', 'true');
    
    console.log("✅ Onboarding marked as complete with settings:", {
      language,
      audioConsent,
      notificationConsent
    });
    
    return true;
  } catch (error) {
    console.error("❌ Failed to mark onboarding as complete:", error);
    return false;
  }
};

/**
 * إعادة تعيين حالة الإعداد الأولي
 * Reset onboarding status
 */
export const resetOnboarding = () => {
  try {
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('lang');
    localStorage.removeItem('audioConsent');
    localStorage.removeItem('audio_enabled');
    localStorage.removeItem('musicEnabled');
    localStorage.removeItem('notificationsEnabled');
    
    console.log("🔄 Onboarding status reset");
    return true;
  } catch (error) {
    console.error("❌ Failed to reset onboarding:", error);
    return false;
  }
};

/**
 * الحصول على إعدادات المستخدم المحفوظة
 * Get saved user settings
 */
export const getSavedSettings = () => {
  return {
    language: localStorage.getItem('lang'),
    audioConsent: localStorage.getItem('audioConsent') === 'true',
    audioEnabled: localStorage.getItem('audio_enabled') === 'true',
    musicEnabled: localStorage.getItem('musicEnabled') === 'true',
    notificationsEnabled: localStorage.getItem('notificationsEnabled') === 'true',
    onboardingComplete: localStorage.getItem('onboardingComplete') === 'true'
  };
};