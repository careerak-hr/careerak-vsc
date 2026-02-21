
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext"; // Corrected import
import { markOnboardingComplete, isOnboardingComplete } from "../utils/onboardingUtils";
import "./00_LanguagePage.css";

import LanguageConfirmModal from "../components/modals/LanguageConfirmModal";
import AudioSettingsModal from "../components/modals/AudioSettingsModal";
import NotificationSettingsModal from "../components/modals/NotificationSettingsModal";
import languagePageTranslations from "../data/languagePage.json";
import { SEOHead } from "../components/SEO";
import { useSEO } from "../hooks";

export default function LanguagePage() {
  const { saveLanguage, language } = useApp(); // Corrected hook
  const navigate = useNavigate();
  const seo = useSEO('language', {});

  const [selectedLang, setSelectedLang] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);

  // Language options for keyboard navigation
  const languages = ['ar', 'en', 'fr'];

  // Keyboard navigation for language selection
  const handleLanguageKeyDown = (e, currentLang) => {
    const currentIndex = languages.indexOf(currentLang);
    let newIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % languages.length;
      document.getElementById(`lang-btn-${languages[newIndex]}`)?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = currentIndex === 0 ? languages.length - 1 : currentIndex - 1;
      document.getElementById(`lang-btn-${languages[newIndex]}`)?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      document.getElementById(`lang-btn-${languages[0]}`)?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      document.getElementById(`lang-btn-${languages[languages.length - 1]}`)?.focus();
    }
  };
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
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
    setIsNotificationModalOpen(true);
  };

  const handleNotificationConfirm = async (consent) => {
    await finalize(audioConsent, consent);
  };

  const finalize = async (audioConsent, notificationConsent) => {
    setIsNotificationModalOpen(false);
    await markOnboardingComplete(selectedLang, audioConsent, notificationConsent);
    await saveLanguage(selectedLang);
    navigate("/entry", { replace: true });
  };

  // Get translations based on selected language, fallback to Arabic
  const getTranslations = (lang) => {
    return languagePageTranslations[lang] || languagePageTranslations.ar;
  };

  const t = getTranslations(selectedLang);

  if (loading) {
    return <div className="lang-page-loading-container">Loading...</div>;
  }

  return (
    <>
      <SEOHead {...seo} />
      <main id="main-content" tabIndex="-1" className="lang-page-container dark:bg-primary transition-colors duration-300">
      <div className="lang-page-content dark:text-primary transition-colors duration-300">
        <div className="lang-page-logo-container">
          {/* ✅ الشفافية خلف اللوجو مباشرة */}
          <div className="lang-page-glow-effect">
            <div className="lang-page-glow-dot"></div>
          </div>
          <div className="lang-page-logo">
            <img src="/logo.jpg" alt="Careerak logo - Professional HR and career development platform" className="lang-page-logo-img" />
          </div>
        </div>

        <h1 className="lang-page-title dark:text-primary transition-colors duration-300">
          Choose Language / Choisir la langue / اختر اللغة
        </h1>

        <div className="lang-page-buttons-container" role="listbox" aria-label="Language selection">
          <button 
            id="lang-btn-ar"
            onClick={() => handleLangPick("ar")} 
            onKeyDown={(e) => handleLanguageKeyDown(e, "ar")}
            className="lang-page-btn dark:bg-accent dark:text-inverse transition-all duration-300"
            role="option"
            aria-selected={selectedLang === "ar"}
          >
            العربية
          </button>
          <button 
            id="lang-btn-en"
            onClick={() => handleLangPick("en")} 
            onKeyDown={(e) => handleLanguageKeyDown(e, "en")}
            className="lang-page-btn dark:bg-accent dark:text-inverse transition-all duration-300"
            role="option"
            aria-selected={selectedLang === "en"}
          >
            English
          </button>
          <button 
            id="lang-btn-fr"
            onClick={() => handleLangPick("fr")} 
            onKeyDown={(e) => handleLanguageKeyDown(e, "fr")}
            className="lang-page-btn dark:bg-accent dark:text-inverse transition-all duration-300"
            role="option"
            aria-selected={selectedLang === "fr"}
          >
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
          onClose={() => handleAudioConfirm(false)}
          onConfirm={handleAudioConfirm}
          language={selectedLang}
          t={t}
        />
      )}

      {isNotificationModalOpen && (
        <NotificationSettingsModal
          isOpen={isNotificationModalOpen}
          onClose={() => handleNotificationConfirm(false)}
          onConfirm={handleNotificationConfirm}
          language={selectedLang}
          t={t}
        />
      )}
    </main>
    </>
  );
}
