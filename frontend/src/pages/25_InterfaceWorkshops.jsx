import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function InterfaceWorkshops() {
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
      welcome: `مرحباً، ${user?.companyName || 'الورشة'}!`,
      sub: "إدارة ورشتك والبحث عن الحرفيين والمهنيين المناسبين",
      browseJobs: "تصفح الوظائف",
      postJob: "نشر وظيفة",
      manageWorkers: "إدارة العمال",
      myProfile: "ملف الورشة",
      settings: "الإعدادات",
      applications: "الطلبات المستلمة",
      jobsDesc: "اكتشف الحرفيين والمهنيين المناسبين لورشك",
      postDesc: "أعلن عن وظائف شاغرة في ورشتك",
      workersDesc: "إدارة عمال الورشة والمشاريع",
      profileDesc: "إدارة ملف ورشتك وبياناتها",
      settingsDesc: "تخصيص إعدادات التطبيق",
      appsDesc: "مراجعة طلبات التوظيف المستلمة"
    },
    en: {
      welcome: `Welcome, ${user?.companyName || 'Workshop'}!`,
      sub: "Manage your workshop and find suitable craftsmen and professionals",
      browseJobs: "Browse Jobs",
      postJob: "Post Job",
      manageWorkers: "Manage Workers",
      myProfile: "Workshop Profile",
      settings: "Settings",
      applications: "Received Applications",
      jobsDesc: "Discover suitable craftsmen and professionals for your workshop",
      postDesc: "Advertise vacant positions in your workshop",
      workersDesc: "Manage workshop workers and projects",
      profileDesc: "Manage your workshop profile and data",
      settingsDesc: "Customize app settings",
      appsDesc: "Review received job applications"
    },
    fr: {
      welcome: `Bienvenue, ${user?.companyName || 'Atelier'} !`,
      sub: "Gérez votre atelier et trouvez des artisans et professionnels appropriés",
      browseJobs: "Parcourir les emplois",
      postJob: "Publier un emploi",
      manageWorkers: "Gérer les travailleurs",
      myProfile: "Profil de l'atelier",
      settings: "Paramètres",
      applications: "Candidatures reçues",
      jobsDesc: "Découvrez les artisans et professionnels appropriés pour votre atelier",
      postDesc: "Annoncez les postes vacants dans votre atelier",
      workersDesc: "Gérez les travailleurs de l'atelier et les projets",
      profileDesc: "Gérez le profil de votre atelier et ses données",
      settingsDesc: "Personnalisez les paramètres de l'application",
      appsDesc: "Examinez les candidatures d'emploi reçues"
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
            <div className="text-6xl mb-4 opacity-20">🔧</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.browseJobs}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.jobsDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/post-job')}>
            <div className="text-6xl mb-4 opacity-20">📝</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.postJob}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.postDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/manage-workers')}>
            <div className="text-6xl mb-4 opacity-20">👷</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.manageWorkers}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.workersDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/profile')}>
            <div className="text-6xl mb-4 opacity-20">🏭</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.myProfile}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.profileDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/settings')}>
            <div className="text-6xl mb-4 opacity-20">⚙️</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.settings}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.settingsDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/applications')}>
            <div className="text-6xl mb-4 opacity-20">📋</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.applications}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.appsDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}