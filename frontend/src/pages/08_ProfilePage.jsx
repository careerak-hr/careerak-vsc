import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function ProfilePage() {
  const { user, language, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      personalInfo: "المعلومات الشخصية",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      bio: "نبذة عني",
      skills: "المهارات",
      logout: "تسجيل الخروج",
      experience: "الخبرات العملية",
      education: "المؤهلات العلمية"
    },
    en: {
      personalInfo: "Personal Information",
      email: "Email Address",
      phone: "Phone Number",
      bio: "About Me",
      skills: "Skills",
      logout: "Logout",
      experience: "Work Experience",
      education: "Education"
    }
  }[language || 'ar'];

  return (
    <div className={`min-h-screen bg-[#E3DAD0] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar lang={language} user={user} />

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-white">
          {/* Header/Cover Area */}
          <div className="h-40 bg-[#1A365D] relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-white">
                <img src={user?.profileImage || "/logo.jpg"} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="pt-20 pb-12 px-8 md:px-16 text-center">
            <h2 className="text-3xl font-black text-[#1A365D] mb-2">{user?.firstName} {user?.lastName}</h2>
            <p className="text-[#1A365D]/40 font-bold uppercase tracking-widest text-sm mb-8">{user?.role}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{t.email}</p>
                <p className="text-[#1A365D] font-black">{user?.email}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{t.phone}</p>
                <p className="text-[#1A365D] font-black">{user?.phone || '---'}</p>
              </div>
            </div>

            {user?.bio && (
              <div className="mt-8 p-8 bg-gray-50 rounded-[3rem] text-right border border-gray-100">
                <h3 className="text-lg font-black text-[#1A365D] mb-4 border-r-4 border-[#1A365D] pr-4">{t.bio}</h3>
                <p className="text-[#1A365D]/70 font-bold leading-relaxed">{user.bio}</p>
              </div>
            )}

            {user?.skills && (
              <div className="mt-8 text-right">
                <h3 className="text-lg font-black text-[#1A365D] mb-4 border-r-4 border-[#1A365D] pr-4">{t.skills}</h3>
                <div className="flex flex-wrap gap-3 mt-4">
                  {user.skills.split(',').map((skill, i) => (
                    <span key={i} className="px-6 py-3 bg-[#1A365D]/5 text-[#1A365D] rounded-2xl font-black text-xs border border-[#1A365D]/10">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="mt-12 px-10 py-5 bg-red-50 text-red-600 rounded-[2rem] font-black text-sm hover:bg-red-100 transition-all active:scale-95 border border-red-100"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
