import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import interfaceShopsTranslations from '../data/interfaceShopsTranslations.json';
import './24_InterfaceShops.css';

export default function InterfaceShops() {
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

  const t = interfaceShopsTranslations[language || 'ar'];

  return (
    <div className={`interface-shops-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="interface-shops-main">
        <div className="interface-shops-header">
          <h2 className="interface-shops-title">{t.welcome.replace('{companyName}', user?.companyName || 'الشركة')}</h2>
          <p className="interface-shops-subtitle">{t.sub}</p>
        </div>

        <div className="interface-shops-grid">
          <div className="interface-shops-card" onClick={() => navigate('/job-postings')}>
            <div className="interface-shops-card-icon">💼</div>
            <h3 className="interface-shops-card-title">{t.browseJobs}</h3>
            <p className="interface-shops-card-description">{t.jobsDesc}</p>
          </div>

          <div className="interface-shops-card" onClick={() => navigate('/post-job')}>
            <div className="interface-shops-card-icon">📝</div>
            <h3 className="interface-shops-card-title">{t.postJob}</h3>
            <p className="interface-shops-card-description">{t.postDesc}</p>
          </div>

          <div className="interface-shops-card" onClick={() => navigate('/manage-staff')}>
            <div className="interface-shops-card-icon">👥</div>
            <h3 className="interface-shops-card-title">{t.manageStaff}</h3>
            <p className="interface-shops-card-description">{t.staffDesc}</p>
          </div>

          <div className="interface-shops-card" onClick={() => navigate('/profile')}>
            <div className="interface-shops-card-icon">🏢</div>
            <h3 className="interface-shops-card-title">{t.myProfile}</h3>
            <p className="interface-shops-card-description">{t.profileDesc}</p>
          </div>

          <div className="interface-shops-card" onClick={() => navigate('/settings')}>
            <div className="interface-shops-card-icon">⚙️</div>
            <h3 className="interface-shops-card-title">{t.settings}</h3>
            <p className="interface-shops-card-description">{t.settingsDesc}</p>
          </div>

          <div className="interface-shops-card" onClick={() => navigate('/applications')}>
            <div className="interface-shops-card-icon">📋</div>
            <h3 className="interface-shops-card-title">{t.applications}</h3>
            <p className="interface-shops-card-description">{t.appsDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}