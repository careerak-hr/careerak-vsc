import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-[5000] bg-white/90 backdrop-blur-lg border-t border-gray-100 px-2 pb-6 pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" dir="rtl">
      <div className="max-w-lg mx-auto flex justify-between items-center relative">
        
        {/* الملف الشخصي */}
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 w-16 transition-all ${isActive('/profile') ? 'text-[#1A365D]' : 'text-gray-300'}`}
        >
          <span className={`text-2xl transition-transform ${isActive('/profile') ? 'scale-110' : ''}`}>👤</span>
          <span className="text-[9px] font-black uppercase">بروفايلي</span>
        </button>

        {/* الواجهة الرئيسية */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center gap-1 w-16 transition-all ${isActive('/dashboard') ? 'text-[#1A365D]' : 'text-gray-300'}`}
        >
          <span className={`text-2xl transition-transform ${isActive('/dashboard') ? 'scale-110' : ''}`}>🏠</span>
          <span className="text-[9px] font-black uppercase">الرئيسية</span>
        </button>

        {/* زر البحث المركزي (+) */}
        <div className="relative -top-8">
            <button
              onClick={() => navigate('/search-jobs')}
              className="w-16 h-16 bg-[#1A365D] rounded-full flex items-center justify-center shadow-2xl shadow-[#1A365D]/40 border-4 border-white active:scale-90 transition-all"
            >
              <span className="text-3xl text-white font-light">+</span>
            </button>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#1A365D] w-max uppercase">بحث وظيفة</span>
        </div>

        {/* الإشعارات */}
        <button
          onClick={() => navigate('/notifications')}
          className={`flex flex-col items-center gap-1 w-16 transition-all ${isActive('/notifications') ? 'text-[#1A365D]' : 'text-gray-300'}`}
        >
          <div className="relative">
            <span className={`text-2xl transition-transform ${isActive('/notifications') ? 'scale-110' : ''}`}>🔔</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] text-white flex items-center justify-center font-bold">3</div>
          </div>
          <span className="text-[9px] font-black uppercase">تنبيهات</span>
        </button>

        {/* حالة الطلبات */}
        <button
          onClick={() => navigate('/applications-status')}
          className={`flex flex-col items-center gap-1 w-16 transition-all ${isActive('/applications-status') ? 'text-[#1A365D]' : 'text-gray-300'}`}
        >
          <span className={`text-2xl transition-transform ${isActive('/applications-status') ? 'scale-110' : ''}`}>⌛</span>
          <span className="text-[9px] font-black uppercase">طلباتي</span>
        </button>

      </div>
    </footer>
  );
};
