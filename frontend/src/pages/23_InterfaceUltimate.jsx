import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function InterfaceUltimate() {
  const navigate = useNavigate();
  const { language, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      welcome: `مرحباً، ${user?.firstName || 'المستخدم'}!`,
      sub: "استكشف جميع الفرص المتقدمة والميزات الكاملة للتطبيق",
      browseJobs: "تصفح الوظائف المتقدمة",
      browseCourses: "تصفح الدورات المتقدمة",
      aiMatcher: "مطابق AI",
      networking: "الشبكة المهنية",
      myProfile: "ملفي الشخصي",
      settings: "الإعدادات",
      applyHistory: "تاريخ التقديمات",
      jobsDesc: "اكتشف الفرص الوظيفية المتقدمة المناسبة لخبراتك",
      coursesDesc: "طور مهاراتك مع أفضل الدورات المتقدمة",
      aiDesc: "احصل على توصيات وظيفية مخصصة بالذكاء الاصطناعي",
      networkDesc: "تواصل مع المهنيين والشركات",
      profileDesc: "إدارة ملفك الشخصي المتقدم والبيانات",
      settingsDesc: "تخصيص إعدادات التطبيق المتقدمة",
      historyDesc: "تتبع طلباتك الوظيفية المتقدمة"
    },
    en: {
      welcome: `Welcome, ${user?.firstName || 'User'}!`,
      sub: "Explore all advanced opportunities and full app features",
      browseJobs: "Browse Advanced Jobs",
      browseCourses: "Browse Advanced Courses",
      aiMatcher: "AI Matcher",
      networking: "Professional Network",
      myProfile: "My Profile",
      settings: "Settings",
      applyHistory: "Application History",
      jobsDesc: "Discover advanced job opportunities suitable for your experience",
      coursesDesc: "Develop your skills with the best advanced courses",
      aiDesc: "Get personalized job recommendations with AI",
      networkDesc: "Connect with professionals and companies",
      profileDesc: "Manage your advanced personal profile and data",
      settingsDesc: "Customize advanced app settings",
      historyDesc: "Track your advanced job applications"
    },
    fr: {
      welcome: `Bienvenue, ${user?.firstName || 'Utilisateur'} !`,
      sub: "Explorez toutes les opportunités avancées et les fonctionnalités complètes de l'application",
      browseJobs: "Parcourir les emplois avancés",
      browseCourses: "Parcourir les cours avancés",
      aiMatcher: "Correspondance IA",
      networking: "Réseau professionnel",
      myProfile: "Mon profil",
      settings: "Paramètres",
      applyHistory: "Historique des candidatures",
      jobsDesc: "Découvrez les opportunités d'emploi avancées adaptées à votre expérience",
      coursesDesc: "Développez vos compétences avec les meilleurs cours avancés",
      aiDesc: "Obtenez des recommandations d'emploi personnalisées avec l'IA",
      networkDesc: "Connectez-vous avec les professionnels et les entreprises",
      profileDesc: "Gérez votre profil personnel avancé et vos données",
      settingsDesc: "Personnalisez les paramètres avancés de l'application",
      historyDesc: "Suivez vos candidatures d'emploi avancées"
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

          <div className={cardCls} onClick={() => navigate('/courses')}>
            <div className="text-6xl mb-4 opacity-20">🎓</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.browseCourses}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.coursesDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/ai-matcher')}>
            <div className="text-6xl mb-4 opacity-20">🤖</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.aiMatcher}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.aiDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/networking')}>
            <div className="text-6xl mb-4 opacity-20">🤝</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.networking}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.networkDesc}</p>
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