import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../context/AppSettingsContext";
import "./00_LanguagePage.css";
import LanguageConfirmModal from "../components/modals/LanguageConfirmModal";
import AudioSettingsModal from "../components/modals/AudioSettingsModal";
import NotificationSettingsModal from "../components/modals/NotificationSettingsModal";
import languagePageTranslations from "../data/languagePage.json";

export default function LanguagePage() {
  const { saveLanguage, saveAudio, saveMusic } = useAppSettings();
  const navigate = useNavigate();

  const [selectedLang, setSelectedLang] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        console.log("⏳ Checking if first time setup...");

        // التحقق من إتمام الإعداد الأولي
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        console.log("📦 Onboarding status:", onboardingComplete);

        if (onboardingComplete === 'true') {
          // المستخدم أكمل الإعداد من قبل، انتقل للصفحة الرئيسية
          console.log("✅ User already completed onboarding, redirecting to entry");
          navigate('/entry', { replace: true });
        } else {
          // أول مرة، اعرض صفحة اختيار اللغة
          console.log("🆕 First time user, showing language selection");
          setLoading(false);
        }

      } catch (err) {
        console.warn("⚠️ Error checking onboarding status:", err);
        setLoading(false);
      }
    };

    checkFirstTime();
  }, [navigate]);

  const handleLangPick = (lang) => {
    console.log("🌍 Language selected:", lang);
    setSelectedLang(lang);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmLanguage = () => {
    console.log("✅ Language confirmed:", selectedLang);
    setIsConfirmModalOpen(false);
    setIsAudioModalOpen(true);
  };

  const handleCancelLanguage = () => {
    console.log("❌ Language selection cancelled");
    setIsConfirmModalOpen(false);
    setSelectedLang(null);
  };

  const handleAudioConfirm = (audioConsent) => {
    console.log("🔊 Audio consent:", audioConsent);
    setIsAudioModalOpen(false);
    setIsNotificationModalOpen(true);
  };

  const handleNotificationConfirm = (notificationConsent) => {
    console.log("🔔 Notification consent:", notificationConsent);
    finalize(true, notificationConsent); // نمرر audioConsent كـ true لأن المستخدم وصل لهذه المرحلة
  };

  const finalize = async (audioConsent, notificationConsent) => {
    console.log("🎯 Finalizing setup with lang:", selectedLang, "audio:", audioConsent, "notifications:", notificationConsent);
    setIsNotificationModalOpen(false);
    
    try {
      // حفظ اللغة المختارة
      if (saveLanguage) {
        await saveLanguage(selectedLang);
        console.log("✅ Language saved:", selectedLang);
      }
      
      // حفظ إعدادات الصوت والموسيقى
      if (saveAudio && saveMusic) {
        await saveAudio(audioConsent);
        await saveMusic(audioConsent);
        console.log("✅ Audio settings saved:", audioConsent);
      }
      
      // حفظ إعدادات إضافية في localStorage للتوافق
      localStorage.setItem('lang', selectedLang);
      localStorage.setItem('audioConsent', audioConsent ? 'true' : 'false');
      localStorage.setItem('audio_enabled', audioConsent ? 'true' : 'false');
      localStorage.setItem('musicEnabled', audioConsent ? 'true' : 'false');
      localStorage.setItem('notificationsEnabled', notificationConsent ? 'true' : 'false');
      
      // تحديد أن الإعداد الأولي اكتمل
      localStorage.setItem('onboardingComplete', 'true');
      console.log("✅ Onboarding marked as complete");
      
      // طلب إذن الإشعارات من النظام إذا وافق المستخدم
      if (notificationConsent && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log("📱 System notification permission:", permission);
        } catch (error) {
          console.warn("⚠️ Failed to request notification permission:", error);
        }
      }
      
      // الانتقال لصفحة الدخول
      console.log("🚀 Navigating to entry page");
      navigate("/entry", { replace: true });
      
    } catch (err) {
      console.error("❌ Error saving settings:", err);
      // حتى لو فشل الحفظ، انتقل للصفحة التالية
      localStorage.setItem('onboardingComplete', 'true');
      navigate("/entry", { replace: true });
    }
  };

  const t = languagePageTranslations[selectedLang] || languagePageTranslations.ar;

  const langBtnCls = "py-4 bg-[#E3DAD1] text-[#304B60] rounded-2xl font-black shadow-lg border-4 border-[#304B60] hover:scale-105 transition-all text-xl";

  if (loading) {
    return(
      <div className="min-h-screen bg-[#E3DAD1] flex items-center justify-center text-[#304B60] font-bold">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60] mx-auto mb-4"></div>
        <p>جاري التحميل...</p>
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

      {/* Modal تأكيد اللغة */}
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

      {/* Modal إعدادات الصوت */}
      {isAudioModalOpen && (
        <AudioSettingsModal
          isOpen={isAudioModalOpen}
          onClose={() => setIsAudioModalOpen(false)}
          onConfirm={handleAudioConfirm}
          language={selectedLang}
          t={t}
        />
      )}

      {/* Modal إعدادات الإشعارات */}
      {isNotificationModalOpen && (
        <NotificationSettingsModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          onConfirm={handleNotificationConfirm}
          language={selectedLang}
          t={t}
        />
      )}
    </div>
  );
}
