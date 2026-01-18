import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [selectedPath, setSelectedPath] = useState('');

  // القائمة الكاملة والنهائية لجميع صفحات التطبيق (المصدر: App.jsx)
  const appRoutes = [
    { name: "اختيار اللغة (Language)", path: "/language" },
    { name: "صفحة البداية (Entry)", path: "/entry" },
    { name: "تسجيل الدخول (Login)", path: "/login" },
    { name: "إنشاء حساب جديد (Auth)", path: "/auth" },
    { name: "تحقق الرمز (OTP Verify)", path: "/otp-verify" },
    { name: "ترحيب الأفراد (Onboarding Individuals)", path: "/onboarding-individuals" },
    { name: "ترحيب الشركات (Onboarding Companies)", path: "/onboarding-companies" },
    { name: "الأميين (Onboarding Illiterate)", path: "/onboarding-illiterate" },
    { name: "ذوي الهمم - بصري (Onboarding Visual)", path: "/onboarding-visual" },
    { name: "الحالات القصوى (Onboarding Ultimate)", path: "/onboarding-ultimate" },
    { name: "الملف الشخصي (Profile)", path: "/profile" },
    { name: "تصفح الوظائف (Job Postings)", path: "/job-postings" },
    { name: "إضافة وظيفة (Post Job)", path: "/post-job" },
    { name: "تقديم طلب - تجريبي (Apply Test)", path: "/apply/test_id" },
    { name: "تصفح الدورات (Courses)", path: "/courses" },
    { name: "إضافة دورة (Post Course)", path: "/post-course" },
    { name: "سياسة الخصوصية (Policy)", path: "/policy" },
    { name: "الإعدادات (Settings)", path: "/settings" },
  ];

  const handleQuickNav = () => {
    if (selectedPath) navigate(selectedPath);
  };

  return (
    <div className="min-h-screen bg-[#E3DAD0] p-6 flex flex-col items-center select-none font-sans">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8 bg-white/40 p-4 rounded-3xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-[#1A365D]" />
          <div>
            <h2 className="text-[#1A365D] font-black text-lg italic">Careerak Admin</h2>
            <p className="text-[10px] text-[#1A365D]/60 font-bold uppercase tracking-wider">Master Control</p>
          </div>
        </div>
        <button onClick={logout} className="p-3 bg-red-100 text-red-600 rounded-2xl font-black text-xs hover:bg-red-200 transition-colors">خروج</button>
      </div>

      {/* Welcome Card */}
      <div className="w-full max-w-lg bg-[#1A365D] text-white p-8 rounded-[3rem] shadow-2xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2 text-right">مرحباً، {user?.firstName || 'المدير'}!</h3>
          <p className="text-white/60 font-bold text-sm text-right">لديك كامل الصلاحيات لإدارة نظام كاريرك.</p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* 🚀 مختبر التنقل الشامل */}
      <div className="w-full max-w-lg bg-white/80 p-8 rounded-[3rem] shadow-xl border-2 border-white mb-8">
        <div className="flex items-center justify-end gap-3 mb-6">
          <h4 className="text-[#1A365D] font-black text-xl text-right">مختبر التنقل الشامل</h4>
          <span className="text-2xl">🚀</span>
        </div>

        <div className="space-y-4 text-right">
          <p className="text-[11px] text-[#1A365D]/40 font-bold px-2">جميع صفحات النظام متاحة الآن للتنقل الفوري:</p>

          <div className="relative">
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full p-5 bg-[#E3DAD0]/50 text-[#1A365D] rounded-2xl border-2 border-transparent focus:border-[#1A365D]/20 outline-none font-black text-sm appearance-none cursor-pointer text-right dir-rtl"
              style={{ color: !selectedPath ? '#A1A1A1' : '#1A365D' }}
            >
              <option value="" disabled>-- اختر الصفحة --</option>
              {appRoutes.map((route, idx) => (
                <option key={idx} value={route.path} style={{color: '#1A365D'}}>{route.name}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#1A365D]/30">
               ▼
            </div>
          </div>

          <button
            onClick={handleQuickNav}
            disabled={!selectedPath}
            className="w-full py-5 bg-[#1A365D] text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
          >
            انتقال فوري
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-4">
        <div className="bg-white/60 p-6 rounded-[2rem] text-center shadow-sm border border-white">
          <p className="text-[#1A365D]/40 font-black text-[10px] mb-1 uppercase">إجمالي المستخدمين</p>
          <span className="text-[#1A365D] font-black text-2xl">--</span>
        </div>
        <div className="bg-white/60 p-6 rounded-[2rem] text-center shadow-sm border border-white">
          <p className="text-[#1A365D]/40 font-black text-[10px] mb-1 uppercase">الوظائف النشطة</p>
          <span className="text-[#1A365D] font-black text-2xl">--</span>
        </div>
      </div>

    </div>
  );
}
