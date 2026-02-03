import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import interfaceWorkshopsTranslations from '../data/interfaceWorkshopsTranslations.json';
import './25_InterfaceWorkshops.css';

export default function InterfaceWorkshops() {
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

  const t = interfaceWorkshopsTranslations[language || 'ar'];

  return (
    <div className={`interface-workshops-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="interface-workshops-main">
        <div className="interface-workshops-header">
          <h2 className="interface-workshops-title">{t.welcome.replace('{companyName}', user?.companyName || 'الورشة')}</h2>
          <p className="interface-workshops-subtitle">{t.sub}</p>
        </div>

        <div className="interface-workshops-grid">
          <div className="interface-workshops-card" onClick={() => navigate('/job-postings')}>
            <div className="interface-workshops-card-icon">🔧</div>
            <h3 className="interface-workshops-card-title">{t.browseJobs}</h3>
            <p className="interface-workshops-card-description">{t.jobsDesc}</p>
          </div>

          <div className="interface-workshops-card" onClick={() => navigate('/post-job')}>
            <div className="interface-workshops-card-icon">📝</div>
            <h3 className="interface-workshops-card-title">{t.postJob}</h3>
            <p className="interface-workshops-card-description">{t.postDesc}</p>
          </div>

          <div className="interface-workshops-card" onClick={() => navigate('/manage-workers')}>
            <div className="interface-workshops-card-icon">👷</div>
            <h3 className="interface-workshops-card-title">{t.manageWorkers}</h3>
            <p className="interface-workshops-card-description">{t.workersDesc}</p>
          </div>

          <div className="interface-workshops-card" onClick={() => navigate('/profile')}>
            <div className="interface-workshops-card-icon">🏭</div>
            <h3 className="interface-workshops-card-title">{t.myProfile}</h3>
            <p className="interface-workshops-card-description">{t.profileDesc}</p>
          </div>

          <div className="interface-workshops-card" onClick={() => navigate('/settings')}>
            <div className="interface-workshops-card-icon">⚙️</div>
            <h3 className="interface-workshops-card-title">{t.settings}</h3>
            <p className="interface-workshops-card-description">{t.settingsDesc}</p>
          </div>

          <div className="interface-workshops-card" onClick={() => navigate('/applications')}>
            <div className="interface-workshops-card-icon">📋</div>
            <h3 className="interface-workshops-card-title">{t.applications}</h3>
            <p className="interface-workshops-card-description">{t.appsDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}