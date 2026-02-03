import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../context/AppSettingsContext";
import "./00_LanguagePage.css";
import LanguageConfirmModal from "../components/modals/LanguageConfirmModal";
import AudioSettingsModal from "../components/modals/AudioSettingsModal";
import languagePageTranslations from "../data/languagePage.json";

export default function LanguagePage() {
  const { saveLanguage, saveAudio, saveMusic } = useAppSettings();
  const navigate = useNavigate();

  const [selectedLang, setSelectedLang] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const { value } = await localStorage.getItem({ key: 'onboardingComplete' });
        if (value === 'true') {
          navigate('/entry', { replace: true });
        } else {
          setLoading(false);
        }
      } catch (err) {
        const value = localStorage.getItem("onboardingComplete");
        if (value === 'true') {
          navigate('/entry', { replace: true });
        } else {
          setLoading(false);
        }
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
    finalize(consent);
  };

  const finalize = async (audioConsent) => {
    setIsAudioModalOpen(false);
    try {
      if (saveLanguage && saveAudio && saveMusic) {
        await saveLanguage(selectedLang);
        await saveAudio(audioConsent);
        await saveMusic(audioConsent);
      }
      await localStorage.setItem('onboardingComplete', 'true');
    } catch (err) {
      localStorage.setItem("onboardingComplete", 'true');
    }
    navigate("/entry", { replace: true });
  };

  const t = languagePageTranslations[selectedLang] || languagePageTranslations.ar;

  if (loading) {
    return (
      <div className="lang-page-loading-container">
        Loading...
      </div>
    );
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
          onClose={() => setIsAudioModalOpen(false)}
          onConfirm={handleAudioConfirm}
          language={selectedLang}
          t={t}
        />
      )}
    </div>
  );
}