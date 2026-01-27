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
  const [audio, setAudio] = useState(null);

  const [selectedLang, setSelectedLang] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

      useEffect(() => {
        const checkOnboarding = async () => {
          try {
            console.log("⏳ Checking onboarding...");

            const { value } = await localStorage.getitem({ key: 'onboardingComplete' });
            console.log("📦 localStorage value:", value);

            if (value === 'true') {
              navigate('/entry', { replace: true });
            } else {
              setLoading(false);
            }

          } catch (err) {
            console.warn("⚠️ localStorage failed, fallback", err);

            const value = localStorage.getItem("onboardingComplete");
            console.log("📦 localStorage value:", value);

            if (value === 'true') {
              navigate('/entry', { replace: true });
            } else {
              setLoading(false);
            }
          }
        };
         const checkAudioConsent = async () => {
          const { value } = await localStorage.getitem({ key: 'audioConsent' });
          if (value === 'true') {
            setAudio(true); // من useAuth()
          } else {
            setAudio(false);
          }
        };
        checkAudioConsent();
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
    console.log("Finalizing with lang:", selectedLang, "audio:", audioConsent);
    setIsAudioModalOpen(false);
    try {
      if (saveLanguage && saveAudio && saveMusic) {
          await saveLanguage(selectedLang);
          await saveAudio(audioConsent);
          await saveMusic(audioConsent);
      }
      await localStorage.setItem('onboardingComplete', 'true');
    } catch (err) {
      console.warn("localStorage failed, using localStorage", err);
      localStorage.setItem("onboardingComplete", 'true');
    }
    console.log("Navigating to /entry");
    navigate("/entry", { replace: true });
  };

  const t = languagePageTranslations[selectedLang] || languagePageTranslations.ar;

  const langBtnCls = "py-4 bg-[#E3DAD1] text-[#304B60] rounded-2xl font-black shadow-lg border-4 border-[#304B60] hover:scale-105 transition-all text-xl";

  if (loading) {
    return(
      <div className="min-h-screen bg-[#E3DAD1] flex items-center justify-center text-[#304B60] font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3DAD1] flex flex-col items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-2 h-2 bg-[#304B60] rounded-full animate-expand-glow opacity-5"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8">
          <div className="w-40 h-40 rounded-full border-4 border-[#304B60] shadow-2xl overflow-hidden pointer-events-none bg-[#E3DAD1]">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <h1 className="text-[#304B60] font-black text-2xl text-center mb-10 drop-shadow-sm">
          Choose Language / Choisir la langue / اختر اللغة
        </h1>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button onClick={() => handleLangPick("ar")} className={langBtnCls}>
            العربية
          </button>
          <button onClick={() => handleLangPick("en")} className={langBtnCls}>
            English
          </button>
          <button onClick={() => handleLangPick("fr")} className={langBtnCls}>
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
