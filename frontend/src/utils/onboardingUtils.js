/**
 * أدوات مساعدة لإدارة الإعداد الأولي
 * Onboarding Utilities
 */
import { Preferences } from "@capacitor/preferences";

/**
 * فحص ما إذا كان المستخدم أكمل الإعداد الأولي
 * Check if user has completed onboarding
 */
export const isOnboardingComplete = async () => {
  const { value: onboardingComplete } = await Preferences.get({
    key: "onboardingComplete",
  });
  const { value: hasLanguage } = await Preferences.get({ key: "lang" });

  console.log("🔍 Checking onboarding status:", {
    onboardingComplete,
    hasLanguage,
    isComplete: onboardingComplete === "true" && !!hasLanguage,
  });

  return onboardingComplete === "true" && !!hasLanguage;
};

/**
 * تحديد أن الإعداد الأولي اكتمل
 * Mark onboarding as complete
 */
export const markOnboardingComplete = async (
  language,
  audioConsent,
  notificationConsent
) => {
  try {
    // حفظ الإعدادات الأساسية
    await Preferences.set({ key: "lang", value: language });
    await Preferences.set({
      key: "audioConsent",
      value: audioConsent ? "true" : "false",
    });
    await Preferences.set({
      key: "audio_enabled",
      value: audioConsent ? "true" : "false",
    });
    await Preferences.set({
      key: "musicEnabled",
      value: audioConsent ? "true" : "false",
    });
    await Preferences.set({
      key: "notificationsEnabled",
      value: notificationConsent ? "true" : "false",
    });

    // تحديد أن الإعداد الأولي اكتمل
    await Preferences.set({ key: "onboardingComplete", value: "true" });

    console.log("✅ Onboarding marked as complete with settings:", {
      language,
      audioConsent,
      notificationConsent,
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
export const resetOnboarding = async () => {
  try {
    await Preferences.remove({ key: "onboardingComplete" });
    await Preferences.remove({ key: "lang" });
    await Preferences.remove({ key: "audioConsent" });
    await Preferences.remove({ key: "audio_enabled" });
    await Preferences.remove({ key: "musicEnabled" });
    await Preferences.remove({ key: "notificationsEnabled" });

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
export const getSavedSettings = async () => {
  const { value: language } = await Preferences.get({ key: "lang" });
  const { value: audioConsent } = await Preferences.get({ key: "audioConsent" });
  const { value: audioEnabled } = await Preferences.get({
    key: "audio_enabled",
  });
  const { value: musicEnabled } = await Preferences.get({ key: "musicEnabled" });
  const { value: notificationsEnabled } = await Preferences.get({
    key: "notificationsEnabled",
  });
  const { value: onboardingComplete } = await Preferences.get({
    key: "onboardingComplete",
  });

  return {
    language: language,
    audioConsent: audioConsent === "true",
    audioEnabled: audioEnabled === "true",
    musicEnabled: musicEnabled === "true",
    notificationsEnabled: notificationsEnabled === "true",
    onboardingComplete: onboardingComplete === "true",
  };
};
