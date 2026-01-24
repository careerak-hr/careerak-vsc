import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [selectedPath, setSelectedPath] = useState('');

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
    { name: "تصفح الدورات (Courses)", path: "/courses" },
    { name: "إضافة دورة (Post Course)", path: "/post-course" },
    { name: "سياسة الخصوصية (Policy)", path: "/policy" },
    { name: "الإعدادات (Settings)", path: "/settings" },
  ];

  const handleQuickNav = () => { if (selectedPath) navigate(selectedPath); };

  const cardCls = "w-full max-w-lg bg-[#304B60]/5 p-8 rounded-[3rem] shadow-xl border border-[#D48161]/10 mb-8";

  return (
    <div className="min-h-screen bg-[#E3DAD1] p-6 flex flex-col items-center select-none font-sans" dir="rtl">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8 bg-[#304B60]/5 p-4 rounded-3xl border border-[#D48161]/10 shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full border-2 border-[#304B60]" />
          <div>
            <h2 className="text-[#304B60] font-black text-lg italic">Careerak Admin</h2>
            <p className="text-[10px] text-[#304B60]/60 font-bold uppercase tracking-wider">Master Control</p>
          </div>
        </div>
        <button onClick={logout} className="p-3 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">خروج</button>
      </div>

      {/* Welcome Card */}
      <div className="w-full max-w-lg bg-[#304B60] text-[#E3DAD1] p-8 rounded-[3rem] shadow-2xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2">مرحباً، {user?.firstName || 'المدير'}!</h3>
          <p className="text-[#E3DAD1]/60 font-bold text-sm">لديك كامل الصلاحيات لإدارة نظام كاريرك.</p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#D48161]/10 rounded-full blur-3xl"></div>
      </div>

      {/* 🚀 مختبر التنقل الشامل */}
      <div className={cardCls}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🚀</span>
          <h4 className="text-[#304B60] font-black text-xl">مختبر التنقل الشامل</h4>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] text-[#304B60]/40 font-bold px-2">جميع صفحات النظام متاحة الآن للتنقل الفوري:</p>

          <div className="relative">
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full p-5 bg-[#E3DAD1] text-[#304B60] rounded-2xl border-2 border-[#D48161]/20 focus:border-[#D48161] outline-none font-black text-sm appearance-none cursor-pointer shadow-sm"
            >
              <option value="" disabled>-- اختر الصفحة --</option>
              {appRoutes.map((route, idx) => (
                <option key={idx} value={route.path}>{route.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleQuickNav}
            disabled={!selectedPath}
            className="w-full py-5 bg-[#304B60] text-[#D48161] rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-30"
          >
            انتقال فوري
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-4">
        <div className="bg-[#304B60]/5 p-6 rounded-[2rem] text-center shadow-sm border border-[#D48161]/10">
          <p className="text-[#304B60]/40 font-black text-[10px] mb-1 uppercase">إجمالي المستخدمين</p>
          <span className="text-[#304B60] font-black text-2xl">--</span>
        </div>
        <div className="bg-[#304B60]/5 p-6 rounded-[2rem] text-center shadow-sm border border-[#D48161]/10">
          <p className="text-[#304B60]/40 font-black text-[10px] mb-1 uppercase">الوظائف النشطة</p>
          <span className="text-[#304B60] font-black text-2xl">--</span>
        </div>
      </div>
    </div>
  );
}
