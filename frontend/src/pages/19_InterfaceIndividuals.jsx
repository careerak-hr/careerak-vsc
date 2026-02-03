import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import interfaceIndividualsTranslations from '../data/interfaceIndividualsTranslations.json';
import './19_InterfaceIndividuals.css';

export default function InterfaceIndividuals() {
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

  const t = interfaceIndividualsTranslations[language || 'ar'];

  return (
    <div className={`interface-individuals-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="interface-individuals-main">
        <div className="interface-individuals-header">
          <h2 className="interface-individuals-title">{t.welcome.replace('{firstName}', user?.firstName || 'المستخدم')}</h2>
          <p className="interface-individuals-subtitle">{t.sub}</p>
        </div>

        <div className="interface-individuals-grid">
          <div className="interface-individuals-card" onClick={() => navigate('/job-postings')}>
            <div className="interface-individuals-card-icon">💼</div>
            <h3 className="interface-individuals-card-title">{t.browseJobs}</h3>
            <p className="interface-individuals-card-description">{t.jobsDesc}</p>
          </div>

          <div className="interface-individuals-card" onClick={() => navigate('/courses')}>
            <div className="interface-individuals-card-icon">🎓</div>
            <h3 className="interface-individuals-card-title">{t.browseCourses}</h3>
            <p className="interface-individuals-card-description">{t.coursesDesc}</p>
          </div>

          <div className="interface-individuals-card" onClick={() => navigate('/profile')}>
            <div className="interface-individuals-card-icon">👤</div>
            <h3 className="interface-individuals-card-title">{t.myProfile}</h3>
            <p className="interface-individuals-card-description">{t.profileDesc}</p>
          </div>

          <div className="interface-individuals-card" onClick={() => navigate('/settings')}>
            <div className="interface-individuals-card-icon">⚙️</div>
            <h3 className="interface-individuals-card-title">{t.settings}</h3>
            <p className="interface-individuals-card-description">{t.settingsDesc}</p>
          </div>

          <div className="interface-individuals-card" onClick={() => navigate('/apply-history')}>
            <div className="interface-individuals-card-icon">📋</div>
            <h3 className="interface-individuals-card-title">{t.applyHistory}</h3>
            <p className="interface-individuals-card-description">{t.historyDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}