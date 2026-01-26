import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function InterfaceShops() {
  const navigate = useNavigate();
  const { language, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  const t = {
    ar: {
      welcome: `مرحباً، ${user?.companyName || 'الشركة'}!`,
      sub: "إدارة محلك التجاري والبحث عن الموظفين المناسبين",
      browseJobs: "تصفح الوظائف",
      postJob: "نشر وظيفة",
      manageStaff: "إدارة الموظفين",
      myProfile: "ملف الشركة",
      settings: "الإعدادات",
      applications: "الطلبات المستلمة",
      jobsDesc: "اكتشف المرشحين المناسبين لمتجرك",
      postDesc: "أعلن عن وظائف شاغرة في متجرك",
      staffDesc: "إدارة موظفي المتجر والمهام",
      profileDesc: "إدارة ملف شركتك وبياناتها",
      settingsDesc: "تخصيص إعدادات التطبيق",
      appsDesc: "مراجعة طلبات التوظيف المستلمة"
    },
    en: {
      welcome: `Welcome, ${user?.companyName || 'Company'}!`,
      sub: "Manage your shop and find suitable employees",
      browseJobs: "Browse Jobs",
      postJob: "Post Job",
      manageStaff: "Manage Staff",
      myProfile: "Company Profile",
      settings: "Settings",
      applications: "Received Applications",
      jobsDesc: "Discover suitable candidates for your shop",
      postDesc: "Advertise vacant positions in your shop",
      staffDesc: "Manage shop staff and tasks",
      profileDesc: "Manage your company profile and data",
      settingsDesc: "Customize app settings",
      appsDesc: "Review received job applications"
    },
    fr: {
      welcome: `Bienvenue, ${user?.companyName || 'Entreprise'} !`,
      sub: "Gérez votre boutique et trouvez des employés appropriés",
      browseJobs: "Parcourir les emplois",
      postJob: "Publier un emploi",
      manageStaff: "Gérer le personnel",
      myProfile: "Profil de l'entreprise",
      settings: "Paramètres",
      applications: "Candidatures reçues",
      jobsDesc: "Découvrez les candidats appropriés pour votre boutique",
      postDesc: "Annoncez les postes vacants dans votre boutique",
      staffDesc: "Gérez le personnel de la boutique et les tâches",
      profileDesc: "Gérez le profil de votre entreprise et ses données",
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
            <div className="text-6xl mb-4 opacity-20">💼</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.browseJobs}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.jobsDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/post-job')}>
            <div className="text-6xl mb-4 opacity-20">📝</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.postJob}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.postDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/manage-staff')}>
            <div className="text-6xl mb-4 opacity-20">👥</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.manageStaff}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.staffDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/profile')}>
            <div className="text-6xl mb-4 opacity-20">🏢</div>
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