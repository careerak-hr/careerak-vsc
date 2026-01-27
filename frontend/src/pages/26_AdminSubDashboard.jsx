import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminSubDashboard() {
  const navigate = useNavigate();
  const { user, language, token, startBgMusic } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // تشغيل الموسيقى الخلفية
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    loadPermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startBgMusic]);

  const loadPermissions = async () => {
    try {
      const res = await api.get('/api/admin/sub-admin-permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(res.data);
    } catch (err) {
      console.error('Failed to load permissions', err);
    }
  };

  const t = {
    ar: {
      welcome: `مرحباً، ${user?.firstName || 'المدير'}!`,
      sub: "لوحة تحكم محدودة المسؤوليات",
      manageUsers: "إدارة المستخدمين",
      manageJobs: "إدارة الوظائف",
      manageCourses: "إدارة الدورات",
      viewReports: "عرض التقارير",
      settings: "الإعدادات",
      usersDesc: "إدارة حسابات المستخدمين",
      jobsDesc: "إدارة الوظائف المنشورة",
      coursesDesc: "إدارة الدورات التدريبية",
      reportsDesc: "عرض الإحصائيات والتقارير",
      settingsDesc: "إعدادات النظام"
    },
    en: {
      welcome: `Welcome, ${user?.firstName || 'Admin'}!`,
      sub: "Limited Responsibility Control Panel",
      manageUsers: "Manage Users",
      manageJobs: "Manage Jobs",
      manageCourses: "Manage Courses",
      viewReports: "View Reports",
      settings: "Settings",
      usersDesc: "Manage user accounts",
      jobsDesc: "Manage posted jobs",
      coursesDesc: "Manage training courses",
      reportsDesc: "View statistics and reports",
      settingsDesc: "System settings"
    },
    fr: {
      welcome: `Bienvenue, ${user?.firstName || 'Admin'} !`,
      sub: "Panneau de contrôle à responsabilité limitée",
      manageUsers: "Gérer les utilisateurs",
      manageJobs: "Gérer les emplois",
      manageCourses: "Gérer les cours",
      viewReports: "Voir les rapports",
      settings: "Paramètres",
      usersDesc: "Gérer les comptes utilisateurs",
      jobsDesc: "Gérer les emplois publiés",
      coursesDesc: "Gérer les cours de formation",
      reportsDesc: "Voir les statistiques et rapports",
      settingsDesc: "Paramètres système"
    }
  }[language || 'ar'];

  const cardCls = "bg-[#E3DAD1] rounded-[3rem] shadow-xl border border-[#304B60]/10 p-8 text-center hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className={`min-h-screen bg-[#E3DAD1] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-[#304B60] mb-4 italic">{t.welcome}</h2>
          <p className="text-[#304B60]/40 font-bold text-lg">{t.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {permissions.manageUsers && (
            <div className={cardCls} onClick={() => navigate('/admin-users')}>
              <div className="text-6xl mb-4 opacity-20">👥</div>
              <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.manageUsers}</h3>
              <p className="text-[#304B60]/60 font-bold">{t.usersDesc}</p>
            </div>
          )}

          {permissions.manageJobs && (
            <div className={cardCls} onClick={() => navigate('/admin-jobs')}>
              <div className="text-6xl mb-4 opacity-20">💼</div>
              <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.manageJobs}</h3>
              <p className="text-[#304B60]/60 font-bold">{t.jobsDesc}</p>
            </div>
          )}

          {permissions.manageCourses && (
            <div className={cardCls} onClick={() => navigate('/admin-courses')}>
              <div className="text-6xl mb-4 opacity-20">🎓</div>
              <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.manageCourses}</h3>
              <p className="text-[#304B60]/60 font-bold">{t.coursesDesc}</p>
            </div>
          )}

          {permissions.viewReports && (
            <div className={cardCls} onClick={() => navigate('/admin-reports')}>
              <div className="text-6xl mb-4 opacity-20">📊</div>
              <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.viewReports}</h3>
              <p className="text-[#304B60]/60 font-bold">{t.reportsDesc}</p>
            </div>
          )}

          <div className={cardCls} onClick={() => navigate('/settings')}>
            <div className="text-6xl mb-4 opacity-20">⚙️</div>
            <h3 className="text-2xl font-black text-[#304B60] mb-4">{t.settings}</h3>
            <p className="text-[#304B60]/60 font-bold">{t.settingsDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}