import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function SettingsPage() {
  const { language, changeLanguage, logout } = useAuth();
  const { audioEnabled, saveAudio, musicEnabled, saveMusic } = useAppSettings();
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      title: 'الإعدادات العامة',
      lang: 'لغة التطبيق',
      audio: 'المؤثرات الصوتية',
      music: 'الموسيقى الخلفية',
      save: 'حفظ التغييرات',
      account: 'إعدادات الحساب',
      dangerZone: 'منطقة الخطر',
      deleteAccount: 'حذف الحساب نهائياً',
      logout: 'تسجيل الخروج من كافة الأجهزة'
    }
  }[language || 'ar'];

  const sectionCls = "p-8 bg-[#304B60]/5 rounded-[2.5rem] border border-[#D48161]/10 flex flex-col md:flex-row justify-between items-center gap-6";

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-24 pb-32">
        <div className="bg-[#E3DAD1] rounded-[4rem] shadow-2xl p-10 md:p-16 border-2 border-[#304B60]/5">
          <h2 className={`text-3xl font-black text-[#304B60] mb-12 border-[#D48161] ${isRTL ? 'border-r-8 pr-4' : 'border-l-8 pl-4'}`}>
            {t.title}
          </h2>

          <div className="space-y-10">
            {/* Language Setting */}
            <section className={sectionCls}>
              <div className="text-center md:text-right">
                <h3 className="text-[#304B60] font-black text-lg">{t.lang}</h3>
                <p className="text-xs text-[#304B60]/40 font-bold mt-1">اختر اللغة التي تفضل استخدامها في الواجهات</p>
              </div>
              <div className="flex gap-2">
                {['ar', 'en', 'fr'].map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${language === l ? 'bg-[#304B60] text-[#D48161] shadow-lg' : 'bg-[#E3DAD1] text-[#304B60] border border-[#D48161]/20'}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            {/* Audio Setting */}
            <section className={sectionCls}>
              <div className="text-center md:text-right">
                <h3 className="text-[#304B60] font-black text-lg">{t.audio}</h3>
                <p className="text-xs text-[#304B60]/40 font-bold mt-1">التحكم في تشغيل المؤثرات الصوتية</p>
              </div>
              <button
                onClick={() => saveAudio(!audioEnabled)}
                className={`w-24 h-12 rounded-full relative transition-all duration-300 ${audioEnabled ? 'bg-[#304B60]' : 'bg-[#304B60]/10'}`}
              >
                <div className={`absolute top-1 w-10 h-10 bg-[#D48161] rounded-full shadow-md transition-all duration-300 ${isRTL ? (audioEnabled ? 'right-1' : 'right-13') : (audioEnabled ? 'left-13' : 'left-1')}`} ></div>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${audioEnabled ? 'text-[#D48161]' : 'text-[#304B60]/40'}`}>
                   {audioEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </section>

            {/* Music Setting */}
            <section className={sectionCls}>
              <div className="text-center md:text-right">
                <h3 className="text-[#304B60] font-black text-lg">{t.music}</h3>
                <p className="text-xs text-[#304B60]/40 font-bold mt-1">التحكم في تشغيل الموسيقى الخلفية</p>
              </div>
              <button
                onClick={() => saveMusic(!musicEnabled)}
                className={`w-24 h-12 rounded-full relative transition-all duration-300 ${musicEnabled ? 'bg-[#304B60]' : 'bg-[#304B60]/10'}`}
              >
                <div className={`absolute top-1 w-10 h-10 bg-[#D48161] rounded-full shadow-md transition-all duration-300 ${isRTL ? (musicEnabled ? 'right-1' : 'right-13') : (musicEnabled ? 'left-13' : 'left-1')}`} ></div>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${musicEnabled ? 'text-[#D48161]' : 'text-[#304B60]/40'}`}>
                   {musicEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </section>

            {/* Danger Zone */}
            <section className="pt-10 border-t border-[#304B60]/10">
               <h3 className="text-red-600 font-black text-sm uppercase tracking-widest mb-6 px-4">{t.dangerZone}</h3>
               <div className="space-y-4">
                  <button
                    onClick={logout}
                    className="w-full p-6 bg-[#304B60]/5 rounded-[2rem] text-[#304B60] font-black text-sm flex justify-between items-center hover:bg-[#304B60]/10 transition-all border border-[#D48161]/10"
                  >
                    <span>{t.logout}</span>
                    <span>🚪</span>
                  </button>
                  <button
                    className="w-full p-6 bg-red-600 text-white rounded-[2rem] font-black text-sm flex justify-between items-center shadow-lg shadow-red-200"
                  >
                    <span>{t.deleteAccount}</span>
                    <span>⚠️</span>
                  </button>
               </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
