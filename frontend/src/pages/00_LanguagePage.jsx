
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../context/AppSettingsContext";
import { markOnboardingComplete, isOnboardingComplete } from "../utils/onboardingUtils";
import "./00_LanguagePage.css";

import LanguageConfirmModal from "../components/modals/LanguageConfirmModal";
import AudioSettingsModal from "../components/modals/AudioSettingsModal";
import NotificationSettingsModal from "../components/modals/NotificationSettingsModal"; // Import the new modal
import languagePageTranslations from "../data/languagePage.json";

export default function LanguagePage() {
  const { saveLanguage } = useAppSettings();
  const navigate = useNavigate();

  const [selectedLang, setSelectedLang] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false); // New state for notification modal
  const [loading, setLoading] = useState(true);
  const [audioConsent, setAudioConsent] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (await isOnboardingComplete()) {
        navigate("/entry", { replace: true });
      } else {
        setLoading(false);
      }
    };
    checkOnboarding();
  }, [navigate]);

  const handleLangPick = (lang) => {
    setSelectedLang(lang);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmLanguage = () => {
    setIsConfirmModalOpen(false);
    setIsAudioModalOpen(true);
  };

  const handleCancelLanguage = () => {
    setIsConfirmModalOpen(false);
    setSelectedLang(null);
  };

  const handleAudioConfirm = (consent) => {
    setAudioConsent(consent);
    setIsAudioModalOpen(false);
    setIsNotificationModalOpen(true); // Open notification modal next
  };

  const handleNotificationConfirm = async (consent) => {
    await finalize(audioConsent, consent);
  };

  const finalize = async (audioConsent, notificationConsent) => {
    setIsNotificationModalOpen(false);

    // Use the utility to mark onboarding as complete
    await markOnboardingComplete(selectedLang, audioConsent, notificationConsent);
    await saveLanguage(selectedLang);

    // Navigate to the entry page after finalization
    navigate("/entry", { replace: true });
  };

  const t = languagePageTranslations[selectedLang] || languagePageTranslations.ar;

  if (loading) {
    return <div className="lang-page-loading-container">Loading...</div>;
  }

  return (
    <div className="lang-page-container">
      <div className="lang-page-glow-effect">
        <div className="lang-page-glow-dot"></div>
      </div>

      <div className="lang-page-content">
        <div className="lang-page-logo-container">
          <div className="lang-page-logo">
            <img src="/logo.jpg" alt="Logo" className="lang-page-logo-img" />
          </div>
        </div>

        <h1 className="lang-page-title">
          Choose Language / Choisir la langue / اختر اللغة
        </h1>

        <div className="lang-page-buttons-container">
          <button onClick={() => handleLangPick("ar")} className="lang-page-btn">
            العربية
          </button>
          <button onClick={() => handleLangPick("en")} className="lang-page-btn">
            English
          </button>
          <button onClick={() => handleLangPick("fr")} className="lang-page-btn">
            Français
          </button>
        </div>
      </div>

      {isConfirmModalOpen && (
        <LanguageConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmLanguage}
          onCancel={handleCancelLanguage}
          language={selectedLang}
          t={t}
        />
      )}

      {isAudioModalOpen && (
        <AudioSettingsModal
          isOpen={isAudioModalOpen}
          onClose={() => handleAudioConfirm(false)} // Assume no consent if closed
          onConfirm={handleAudioConfirm}
          language={selectedLang}
          t={t}
        />
      )}

      {isNotificationModalOpen && (
        <NotificationSettingsModal
          isOpen={isNotificationModalOpen}
          onClose={() => handleNotificationConfirm(false)} // Assume no consent if closed
          onConfirm={handleNotificationConfirm}
          language={selectedLang}
          t={t}
        />
      )}
    </div>
  );
}
