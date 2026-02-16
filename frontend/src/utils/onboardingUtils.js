/**
 * Onboarding Utilities
 */
import { Preferences } from "@capacitor/preferences";

const ONBOARDING_VERSION_KEY = 'onboardingVersion';
const CURRENT_ONBOARDING_VERSION = '3'; // Increment this version to force reset for all users

/**
 * Check if user has completed onboarding and if the data is up-to-date.
 */
export const isOnboardingComplete = async () => {
  const { value: onboardingComplete } = await Preferences.get({ key: "onboardingComplete" });
  const { value: hasLanguage } = await Preferences.get({ key: "lang" });
  const { value: storedVersion } = await Preferences.get({ key: ONBOARDING_VERSION_KEY });

  console.log('🔍 Onboarding check:', {
    onboardingComplete,
    hasLanguage,
    storedVersion,
    expectedVersion: CURRENT_ONBOARDING_VERSION
  });

  const isComplete = onboardingComplete === 'true' && !!hasLanguage;
  const isUpToDate = storedVersion === CURRENT_ONBOARDING_VERSION;

  // If onboarding was complete but the version is outdated, reset.
  if (isComplete && !isUpToDate) {
    console.log(`🔄 Stale onboarding version (found: ${storedVersion}, expected: ${CURRENT_ONBOARDING_VERSION}). Resetting.`);
    await resetOnboarding();
    return false;
  }

  const result = isComplete && isUpToDate;
  console.log('📊 Final onboarding status:', result);
  return result;
};

/**
 * Mark onboarding as complete
 */
export const markOnboardingComplete = async (
  language,
  audioConsent,
  notificationConsent
) => {
  try {
    await Preferences.set({ key: "lang", value: language });
    await Preferences.set({ key: "audio_enabled", value: audioConsent ? "true" : "false" });
    await Preferences.set({ key: "musicEnabled", value: audioConsent ? "true" : "false" });
    await Preferences.set({ key: "notificationsEnabled", value: notificationConsent ? "true" : "false" });
    await Preferences.set({ key: "onboardingComplete", value: "true" });
    // Set the current version
    await Preferences.set({ key: ONBOARDING_VERSION_KEY, value: CURRENT_ONBOARDING_VERSION });

    console.log("✅ Onboarding marked as complete with version:", CURRENT_ONBOARDING_VERSION);
    return true;
  } catch (error) {
    console.error("❌ Failed to mark onboarding as complete:", error);
    return false;
  }
};

/**
 * Reset onboarding status
 */
export const resetOnboarding = async () => {
  try {
    // Remove all keys related to onboarding
    await Preferences.remove({ key: "onboardingComplete" });
    await Preferences.remove({ key: "lang" });
    await Preferences.remove({ key: "audio_enabled" });
    await Preferences.remove({ key: "musicEnabled" });
    await Preferences.remove({ key: "notificationsEnabled" });
    await Preferences.remove({ key: ONBOARDING_VERSION_KEY }); // Also remove the version key

    console.log("🔄 Onboarding status reset");
    return true;
  } catch (error) {
    console.error("❌ Failed to reset onboarding:", error);
    return false;
  }
};

/**
 * Get saved user settings
 */
export const getSavedSettings = async () => {
    const { value: language } = await Preferences.get({ key: "lang" });
    const { value: audioEnabled } = await Preferences.get({ key: "audio_enabled" });
    const { value: musicEnabled } = await Preferences.get({ key: "musicEnabled" });
    const { value: notificationsEnabled } = await Preferences.get({ key: "notificationsEnabled" });
    const { value: onboardingComplete } = await Preferences.get({ key: "onboardingComplete" });

    return {
      language: language,
      audioEnabled: audioEnabled === "true",
      musicEnabled: musicEnabled === "true",
      notificationsEnabled: notificationsEnabled === "true",
      onboardingComplete: onboardingComplete === "true",
    };
  };
