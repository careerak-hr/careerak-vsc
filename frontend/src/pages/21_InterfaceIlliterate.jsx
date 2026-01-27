import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function InterfaceIlliterate() {
  const navigate = useNavigate();
  const { language, user, startBgMusic } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { 
    setIsVisible(true); 
    
    // تشغيل الموسيقى الخلفية
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
  }, [startBgMusic]);

  const t = {
    ar: {
      welcome: `مرحباً، ${user?.firstName || 'المستخدم'}!`,
      sub: "استكشف فرص العمل البسيطة والمناسبة لك",
      browseJobs: "تصفح الوظائف البسيطة",
      voiceJobs: "الاستماع للوظائف",
      myProfile: "ملفي الشخصي",
      settings: "الإعدادات",
      applyHistory: "تاريخ التقديمات",
      jobsDesc: "اكتشف الفرص الوظيفية البسيطة المناسبة لك",
      voiceDesc: "استمع للوظائف المتاحة بصوت عالي",
      profileDesc: "إدارة ملفك الشخصي والبيانات",
      settingsDesc: "تخصيص إعدادات التطبيق",
      historyDesc: "تتبع طلباتك الوظيفية"
    },
    en: {
      welcome: `Welcome, ${user?.firstName || 'User'}!`,
      sub: "Explore simple job opportunities suitable for you",
      browseJobs: "Browse Simple Jobs",
      voiceJobs: "Listen to Jobs",
      myProfile: "My Profile",
      settings: "Settings",
      applyHistory: "Application History",
      jobsDesc: "Discover simple job opportunities suitable for you",
      voiceDesc: "Listen to available jobs with voice",
      profileDesc: "Manage your personal profile and data",
      settingsDesc: "Customize app settings",
      historyDesc: "Track your job applications"
    },
    fr: {
      welcome: `Bienvenue, ${user?.firstName || 'Utilisateur'} !`,
      sub: "Explorez les opportunités d'emploi simples adaptées à vous",
      browseJobs: "Parcourir les emplois simples",
      voiceJobs: "Écouter les emplois",
      myProfile: "Mon profil",
      settings: "Paramètres",
      applyHistory: "Historique des candidatures",
      jobsDesc: "Découvrez les opportunités d'emploi simples adaptées à vous",
      voiceDesc: "Écoutez les emplois disponibles avec la voix",
      profileDesc: "Gérez votre profil personnel et vos données",
      settingsDesc: "Personnalisez les paramètres de l'application",
      historyDesc: "Suivez vos candidatures d'emploi"
    }
  }[language || 'ar'];

  const cardCls = "bg-[#E3DAD1] rounded-[3rem] shadow-xl border border-[#304B60]/10 p-8 text-center hover:scale-[1.02] transition-all cursor-pointer";

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

          <div className={cardCls} onClick={() => navigate('/voice-jobs')}>
            <div className="text-6xl mb-4 opacity-20">🔊</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.voiceJobs}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.voiceDesc}</p>
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