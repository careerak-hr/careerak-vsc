import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function InterfaceIndividuals() {
  const navigate = useNavigate();
  const { language, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      welcome: `مرحباً، ${user?.firstName || 'المستخدم'}!`,
      sub: "استكشف فرص العمل والدورات التدريبية المثالية لك",
      browseJobs: "تصفح الوظائف",
      browseCourses: "تصفح الدورات",
      myProfile: "ملفي الشخصي",
      settings: "الإعدادات",
      applyHistory: "تاريخ التقديمات",
      jobsDesc: "اكتشف الفرص الوظيفية المناسبة لمهاراتك",
      coursesDesc: "طور مهاراتك مع أفضل الدورات التدريبية",
      profileDesc: "إدارة ملفك الشخصي والبيانات",
      settingsDesc: "تخصيص إعدادات التطبيق",
      historyDesc: "تتبع طلباتك الوظيفية"
    },
    en: {
      welcome: `Welcome, ${user?.firstName || 'User'}!`,
      sub: "Explore the perfect job opportunities and training courses for you",
      browseJobs: "Browse Jobs",
      browseCourses: "Browse Courses",
      myProfile: "My Profile",
      settings: "Settings",
      applyHistory: "Application History",
      jobsDesc: "Discover job opportunities suitable for your skills",
      coursesDesc: "Develop your skills with the best training courses",
      profileDesc: "Manage your personal profile and data",
      settingsDesc: "Customize app settings",
      historyDesc: "Track your job applications"
    },
    fr: {
      welcome: `Bienvenue, ${user?.firstName || 'Utilisateur'} !`,
      sub: "Explorez les opportunités d'emploi et les cours de formation parfaits pour vous",
      browseJobs: "Parcourir les emplois",
      browseCourses: "Parcourir les cours",
      myProfile: "Mon profil",
      settings: "Paramètres",
      applyHistory: "Historique des candidatures",
      jobsDesc: "Découvrez les opportunités d'emploi adaptées à vos compétences",
      coursesDesc: "Développez vos compétences avec les meilleurs cours de formation",
      profileDesc: "Gérez votre profil personnel et vos données",
      settingsDesc: "Personnalisez les paramètres de l'application",
      historyDesc: "Suivez vos candidatures d'emploi"
    }
  }[language || 'ar'];

  const cardCls = "bg-[#E3DAD1] rounded-[3rem] shadow-xl border border-[#304B60]/10 p-8 text-center hover:scale-[1.02] transition-all cursor-pointer";
  const btnCls = "w-full py-6 bg-[#304B60] text-[#D48161] rounded-[2.5rem] font-black shadow-2xl active:scale-95 transition-all text-xl";

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-24 pb-32">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-[#304B60] mb-4 italic">{t.welcome}</h2>
          <p className="text-[#304B60]/40 font-bold text-lg">{t.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className={cardCls} onClick={() => navigate('/job-postings')}>
            <div className="text-6xl mb-4 opacity-20">💼</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.browseJobs}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.jobsDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/courses')}>
            <div className="text-6xl mb-4 opacity-20">🎓</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.browseCourses}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.coursesDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/profile')}>
            <div className="text-6xl mb-4 opacity-20">👤</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.myProfile}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.profileDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/settings')}>
            <div className="text-6xl mb-4 opacity-20">⚙️</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.settings}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.settingsDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/apply-history')}>
            <div className="text-6xl mb-4 opacity-20">📋</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.applyHistory}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.historyDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}