import React from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';

export const Navbar = ({ lang, user }) => {
  const navigate = useNavigate();
  const isArabic = lang === 'ar';

  // 🛰️ كامل: التوجيه الذكي عند الضغط على اللوجو حسب نوع المستخدم
  const handleLogoClick = () => {
    if (!user) return;
    
    // إذا كان من ذوي الهمم أو مستواه التعليمي "أمي" -> الواجهة المبسطة
    if (user.isSpecialNeeds || user.education === 'أمي') {
      navigate('/dashboard'); 
      return;
    }

    switch (user.role) {
      case 'Admin': navigate('/dashboard'); break;
      case 'HR': navigate('/dashboard'); break;
      case 'Employee': navigate('/dashboard'); break;
      default: navigate('/dashboard');
    }
  };

  const handleExitApp = () => { CapApp.exitApp(); };

  return (
    <nav className="p-4 sm:p-6" style={{ backgroundColor: '#E3DAD0' }} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        
        {/* اللوجو الذكي: لا يظهر إلا بعد الدخول (تم التحكم به من App.jsx) */}
        <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer active:scale-95 transition-all group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#1A365D]/20 rounded-full blur-md group-hover:blur-xl transition-all"></div>
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="relative h-14 w-14 rounded-full border-2 border-white shadow-2xl object-cover" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-[#1A365D] tracking-tighter leading-none">CAREERAK</h1>
            <span className="text-[8px] font-bold text-[#1A365D]/40 uppercase tracking-[0.3em]">
              {user?.role === 'Admin' ? 'Tower' : (user?.role === 'HR' ? 'HR Portal' : 'Career Portal')}
            </span>
          </div>
        </div>
        
        {/* زر الخروج الاحترافي */}
        <button 
          onClick={handleExitApp}
          className="flex items-center gap-2 px-6 py-3 bg-white text-[#1A365D] rounded-2xl font-black text-xs shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:shadow-xl active:scale-90 transition-all border border-[#1A365D]/5"
        >
          <span>{isArabic ? 'خروج نهائي' : 'Exit App'}</span>
          <span className="text-lg">🚪</span>
        </button>

      </div>
    </nav>
  );
};
