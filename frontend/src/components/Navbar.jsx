import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { language, logout, audioEnabled, setAudioEnabled } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const t = {
    ar: {
      settings: "لوحة التحكم",
      music: "الموسيقى",
      voice: "الصوتيات",
      logout: "تسجيل الخروج",
      deleteAccount: "حذف الحساب نهائياً",
      notifications: "تنبيهات الهاتف",
      changePass: "تغيير كلمة المرور",
      exit: "خروج من التطبيق"
    }
  }[language || 'ar'];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[5000] bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-100 shadow-sm" dir="rtl">
        <div className="flex items-center gap-3">
           <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-full border-2 border-[#1A365D]" />
           <span className="font-black text-[#1A365D] italic text-xl">Careerak</span>
        </div>

        <button 
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-2xl bg-[#1A365D]/5 flex items-center justify-center text-2xl hover:bg-[#1A365D]/10 transition-all"
        >
          ⚙️
        </button>
      </nav>

      {/* لوحة التحكم الجانبية / المودال */}
      {showSettings && (
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex justify-end" onClick={() => setShowSettings(false)}>
          <div className="w-80 h-full bg-white shadow-2xl p-8 flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-[#1A365D]">{t.settings}</h3>
              <button onClick={() => setShowSettings(false)} className="text-2xl">✕</button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto">
              {/* خيارات التحكم */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-sm text-[#1A365D]">{t.music}</span>
                <input type="checkbox" checked={audioEnabled} onChange={() => setAudioEnabled(!audioEnabled)} className="w-6 h-6" />
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                <span className="font-bold text-sm text-[#1A365D]">{t.voice}</span>
                <input type="checkbox" defaultChecked className="w-6 h-6" />
              </div>

              <button className="w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-gray-100 transition-all">
                <span className="font-bold text-sm text-[#1A365D]">{t.notifications}</span>
                <span>🔔</span>
              </button>

              <button className="w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-gray-100 transition-all">
                <span className="font-bold text-sm text-[#1A365D]">{t.changePass}</span>
                <span>🔑</span>
              </button>

              <hr className="border-gray-100" />

              <button onClick={logout} className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm text-right flex justify-between items-center">
                <span>{t.logout}</span>
                <span>🚪</span>
              </button>

              <button className="w-full p-4 bg-red-600 text-white rounded-2xl font-black text-sm text-right flex justify-between items-center shadow-lg shadow-red-200">
                <span>{t.deleteAccount}</span>
                <span>⚠️</span>
              </button>
            </div>

            <div className="mt-auto">
               <button className="w-full py-5 bg-[#1A365D] text-white rounded-2xl font-black text-sm">
                  {t.exit}
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
