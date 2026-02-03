import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import interfaceCompaniesTranslations from '../data/interfaceCompaniesTranslations.json';
import './20_InterfaceCompanies.css';

export default function InterfaceCompanies() {
  const navigate = useNavigate();
  const { language, user, startBgMusic } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { 
    setIsVisible(true); 
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
  }, [startBgMusic]);

  const t = interfaceCompaniesTranslations[language || 'ar'];

  return (
    <div className={`interface-companies-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="interface-companies-main">
        <div className="interface-companies-header">
          <h2 className="interface-companies-title">{t.welcome.replace('{firstName}', user?.firstName || 'الشركة')}</h2>
          <p className="interface-companies-subtitle">{t.sub}</p>
        </div>

        <div className="interface-companies-grid">
          <div className="interface-companies-card" onClick={() => navigate('/post-job')}>
            <div className="interface-companies-card-icon">📝</div>
            <h3 className="interface-companies-card-title">{t.postJob}</h3>
            <p className="interface-companies-card-description">{t.jobDesc}</p>
          </div>

          <div className="interface-companies-card" onClick={() => navigate('/post-course')}>
            <div className="interface-companies-card-icon">🎓</div>
            <h3 className="interface-companies-card-title">{t.postCourse}</h3>
            <p className="interface-companies-card-description">{t.courseDesc}</p>
          </div>

          <div className="interface-companies-card" onClick={() => navigate('/manage-jobs')}>
            <div className="interface-companies-card-icon">💼</div>
            <h3 className="interface-companies-card-title">{t.manageJobs}</h3>
            <p className="interface-companies-card-description">{t.manageJobsDesc}</p>
          </div>

          <div className="interface-companies-card" onClick={() => navigate('/manage-courses')}>
            <div className="interface-companies-card-icon">📚</div>
            <h3 className="interface-companies-card-title">{t.manageCourses}</h3>
            <p className="interface-companies-card-description">{t.manageCoursesDesc}</p>
          </div>

          <div className="interface-companies-card" onClick={() => navigate('/profile')}>
            <div className="interface-companies-card-icon">🏢</div>
            <h3 className="interface-companies-card-title">{t.companyProfile}</h3>
            <p className="interface-companies-card-description">{t.profileDesc}</p>
          </div>

          <div className="interface-companies-card" onClick={() => navigate('/analytics')}>
            <div className="interface-companies-card-icon">📊</div>
            <h3 className="interface-companies-card-title">{t.analytics}</h3>
            <p className="interface-companies-card-description">{t.analyticsDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}