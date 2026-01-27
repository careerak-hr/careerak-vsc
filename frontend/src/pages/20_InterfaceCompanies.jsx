import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export default function InterfaceCompanies() {
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
      welcome: `مرحباً، ${user?.firstName || 'الشركة'}!`,
      sub: "إدارة موارد بشرية الشركة ونشر الفرص الوظيفية والدورات",
      postJob: "نشر وظيفة جديدة",
      postCourse: "نشر دورة تدريبية",
      manageJobs: "إدارة الوظائف المنشورة",
      manageCourses: "إدارة الدورات المنشورة",
      companyProfile: "ملف الشركة",
      analytics: "الإحصائيات والتقارير",
      jobDesc: "أضف فرصة وظيفية جديدة لجذب الكفاءات",
      courseDesc: "انشر دورات تدريبية لتطوير الموظفين",
      manageJobsDesc: "عرض وتعديل الوظائف المنشورة",
      manageCoursesDesc: "إدارة الدورات التدريبية المتاحة",
      profileDesc: "تحديث بيانات الشركة والمعلومات",
      analyticsDesc: "متابعة الإحصائيات والأداء"
    },
    en: {
      welcome: `Welcome, ${user?.firstName || 'Company'}!`,
      sub: "Manage company HR resources and post job opportunities and courses",
      postJob: "Post New Job",
      postCourse: "Post Training Course",
      manageJobs: "Manage Posted Jobs",
      manageCourses: "Manage Posted Courses",
      companyProfile: "Company Profile",
      analytics: "Analytics & Reports",
      jobDesc: "Add a new job opportunity to attract talents",
      courseDesc: "Publish training courses to develop employees",
      manageJobsDesc: "View and edit posted jobs",
      manageCoursesDesc: "Manage available training courses",
      profileDesc: "Update company data and information",
      analyticsDesc: "Track statistics and performance"
    },
    fr: {
      welcome: `Bienvenue, ${user?.firstName || 'Entreprise'} !`,
      sub: "Gérez les ressources humaines de l'entreprise et publiez des opportunités d'emploi et des cours",
      postJob: "Publier un nouvel emploi",
      postCourse: "Publier un cours de formation",
      manageJobs: "Gérer les emplois publiés",
      manageCourses: "Gérer les cours publiés",
      companyProfile: "Profil de l'entreprise",
      analytics: "Analyses et rapports",
      jobDesc: "Ajoutez une nouvelle opportunité d'emploi pour attirer les talents",
      courseDesc: "Publiez des cours de formation pour développer les employés",
      manageJobsDesc: "Voir et modifier les emplois publiés",
      manageCoursesDesc: "Gérer les cours de formation disponibles",
      profileDesc: "Mettre à jour les données et informations de l'entreprise",
      analyticsDesc: "Suivre les statistiques et les performances"
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
          <div className={cardCls} onClick={() => navigate('/post-job')}>
            <div className="text-6xl mb-4 opacity-20">📝</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.postJob}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.jobDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/post-course')}>
            <div className="text-6xl mb-4 opacity-20">🎓</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.postCourse}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.courseDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/manage-jobs')}>
            <div className="text-6xl mb-4 opacity-20">💼</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.manageJobs}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.manageJobsDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/manage-courses')}>
            <div className="text-6xl mb-4 opacity-20">📚</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.manageCourses}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.manageCoursesDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/profile')}>
            <div className="text-6xl mb-4 opacity-20">🏢</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.companyProfile}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.profileDesc}</p>
          </div>

          <div className={cardCls} onClick={() => navigate('/analytics')}>
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.analytics}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.analyticsDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}