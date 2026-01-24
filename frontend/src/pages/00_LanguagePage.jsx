import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppSettings } from "../context/AppSettingsContext";
import "./00_LanguagePage.css";

const translations = {
  ar: {
    confirmLang: "هل أنت متأكد من اللغة التي تم اختيارها؟ مع العلم أن التطبيق سيعمل بشكل كامل باللغة التي تم اختيارها، ويمكنكم تغيير اللغة في اي وقت شئتم من لوحة التحكم",
    audioTitle: "هل توافق على تشغيل الموسيقى والصوتيات في التطبيق؟ مع العلم أنكم بإمكانكم التحكم في الصوتيات والموسيقى من لوحة التحكم متى شئتم",
    yes: "نعم",
    no: "لا",
    ok: "تأكيد",
    title: "اختر اللغة"
  },
  en: {
    confirmLang: "Are you sure about the selected language? The app will work entirely in this language, and you can change it anytime from the dashboard.",
    audioTitle: "Do you agree to play music and audio in the app? You can control audio and music from the dashboard whenever you want.",
    yes: "Yes",
    no: "No",
    ok: "Confirm",
    title: "Choose Language"
  },
  fr: {
    confirmLang: "Êtes-vous sûr de la langue sélectionnée ? L'application fonctionnera entièrement dans cette langue et vous pourrez la modifier à tout moment depuis le tableau de bord.",
    audioTitle: "Acceptez-vous de jouer de la musique et de l'audio dans l'application ? Vous pouvez contrôler l'audio et la musique depuis le tableau de bord quand vous le souhaitez.",
    yes: "Oui",
    no: "Non",
    ok: "Confirmer",
    title: "Choisir la langue"
  }
};

export default function LanguagePage() {
  const { changeLanguage, setAudio } = useAuth();
  const { saveLanguage, saveAudio } = useAppSettings();
  const navigate = useNavigate();

  const [selectedLang, setSelectedLang] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showAudioPopup, setShowAudioPopup] = useState(false);

  // نبراس: تم إزالة طلب الأذونات الجماعي من هنا لاتباع المعايير الاحترافية (طلب الإذن عند الحاجة فقط)
  // وعد: هذا يحسن تجربة المستخدم ويضمن توافق النظام مع سياسات الأندرويد والـ iOS الحديثة

  const handleLangPick = (lang) => {
    setSelectedLang(lang);
    setShowConfirmPopup(true);
  };

  const finalize = async (audioConsent) => {
    await saveLanguage(selectedLang);
    await saveAudio(audioConsent);
    if (changeLanguage) await changeLanguage(selectedLang);
    if (setAudio) await setAudio(audioConsent);
    navigate("/entry", { replace: true });
  };

  const t = translations[selectedLang] || translations.ar;

  // أزرار اللغات: أرضية بيج، كتابة كحلية، إطار كحلي
  const langBtnCls = "py-4 bg-[#E3DAD1] text-[#304B60] rounded-2xl font-black shadow-lg border-4 border-[#304B60] hover:scale-105 transition-all text-xl";

  return (
    <div className="min-h-screen bg-[#E3DAD1] flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* تأثير الشفافية الكحلية المتوسع */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-2 h-2 bg-[#304B60] rounded-full animate-expand-glow opacity-5"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 p-1 rounded-full border-4 border-[#304B60] shadow-2xl">
          <img src="/logo.jpg" alt="Logo" className="w-28 h-28 rounded-full object-cover" />
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

      {/* Popups */}
      {(showConfirmPopup || showAudioPopup) && (
        <div className="fixed inset-0 bg-[#304B60]/40 backdrop-blur-sm flex items-center justify-center p-6 z-[1000]">
          <div className="bg-[#E3DAD1] p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm border-4 border-[#304B60] animate-in fade-in zoom-in duration-300">
            <p className="text-[#304B60] font-bold text-lg mb-6 leading-relaxed" dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}>
              {showConfirmPopup ? t.confirmLang : t.audioTitle}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (showConfirmPopup) {
                    setShowConfirmPopup(false);
                    setShowAudioPopup(true);
                  } else {
                    finalize(true);
                  }
                }}
                className="flex-1 bg-[#304B60] text-[#D48161] py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-transform"
              >
                {showConfirmPopup ? t.ok : t.yes}
              </button>
              <button
                onClick={() => {
                  if (showConfirmPopup) {
                    setShowConfirmPopup(false);
                    setSelectedLang(null);
                  } else {
                    finalize(false);
                  }
                }}
                className="flex-1 border-4 border-[#304B60] text-[#304B60] py-4 rounded-2xl font-black text-lg active:scale-95 transition-transform"
              >
                {showConfirmPopup ? t.no : t.no}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
