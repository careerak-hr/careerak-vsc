import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function SettingsPage() {
  const { language, setAudio, audioEnabled, changeLanguage, user, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      title: 'الإعدادات العامة',
      lang: 'لغة التطبيق',
      audio: 'الموسيقى والصوتيات',
      save: 'حفظ التغييرات',
      account: 'إعدادات الحساب',
      dangerZone: 'منطقة الخطر',
      deleteAccount: 'حذف الحساب نهائياً',
      logout: 'تسجيل الخروج من كافة الأجهزة'
    },
    en: {
      title: 'General Settings',
      lang: 'App Language',
      audio: 'Music & Audio',
      save: 'Save Changes',
      account: 'Account Settings',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Delete Account Permanently',
      logout: 'Logout from all devices'
    }
  }[language || 'ar'];

  return (
    <div className={`min-h-screen bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar lang={language} user={user} />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-[4rem] shadow-2xl p-10 md:p-16 border border-white">
          <h2 className={`text-3xl font-black text-[#1A365D] mb-12 border-[#1A365D] ${isRTL ? 'border-r-8 pr-4' : 'border-l-8 pl-4'}`}>
            {t.title}
          </h2>

          <div className="space-y-10">
            {/* Language Setting */}
            <section className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-right">
                <h3 className="text-[#1A365D] font-black text-lg">{t.lang}</h3>
                <p className="text-xs text-gray-400 font-bold mt-1">اختر اللغة التي تفضل استخدامها في الواجهات</p>
              </div>
              <div className="flex gap-2">
                {['ar', 'en', 'fr'].map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${language === l ? 'bg-[#1A365D] text-white shadow-lg' : 'bg-white text-[#1A365D] border border-gray-200'}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            {/* Audio Setting */}
            <section className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-right">
                <h3 className="text-[#1A365D] font-black text-lg">{t.audio}</h3>
                <p className="text-xs text-gray-400 font-bold mt-1">التحكم في تشغيل الموسيقى الخلفية والمؤثرات</p>
              </div>
              <button
                onClick={() => setAudio(!audioEnabled)}
                className={`w-24 h-12 rounded-full relative transition-all duration-300 ${audioEnabled ? 'bg-[#1A365D]' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-10 h-10 bg-white rounded-full shadow-md transition-all duration-300 ${audioEnabled ? (isRTL ? 'right-1' : 'left-13') : (isRTL ? 'right-13' : 'left-1')}`} style={{ left: !isRTL && audioEnabled ? 'auto' : '', right: !isRTL && audioEnabled ? '4px' : '', left: isRTL && !audioEnabled ? 'auto' : '', right: isRTL && !audioEnabled ? '4px' : '' }}></div>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${audioEnabled ? 'text-white' : 'text-gray-400'}`}>
                   {audioEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </section>

            {/* Danger Zone */}
            <section className="pt-10 border-t border-gray-100">
               <h3 className="text-red-600 font-black text-sm uppercase tracking-widest mb-6 px-4">{t.dangerZone}</h3>
               <div className="space-y-4">
                  <button
                    onClick={logout}
                    className="w-full p-6 border-2 border-gray-100 rounded-[2rem] text-[#1A365D] font-black text-sm flex justify-between items-center hover:bg-gray-50 transition-all"
                  >
                    <span>{t.logout}</span>
                    <span>🚪</span>
                  </button>
                  <button
                    className="w-full p-6 border-2 border-red-50 rounded-[2rem] text-red-600 font-black text-sm flex justify-between items-center hover:bg-red-50 transition-all"
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
