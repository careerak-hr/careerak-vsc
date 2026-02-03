import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import interfaceUltimateTranslations from '../data/interfaceUltimateTranslations.json';
import './23_InterfaceUltimate.css';

export default function InterfaceUltimate() {
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

  const t = interfaceUltimateTranslations[language || 'ar'];

  return (
    <div className={`interface-ultimate-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="interface-ultimate-main">
        <div className="interface-ultimate-header">
          <h2 className="interface-ultimate-title">{t.welcome.replace('{firstName}', user?.firstName || 'المستخدم')}</h2>
          <p className="interface-ultimate-subtitle">{t.sub}</p>
        </div>

        <div className="interface-ultimate-grid">
          <div className="interface-ultimate-card" onClick={() => navigate('/job-postings')}>
            <div className="interface-ultimate-card-icon">💼</div>
            <h3 className="interface-ultimate-card-title">{t.browseJobs}</h3>
            <p className="interface-ultimate-card-description">{t.jobsDesc}</p>
          </div>

          <div className="interface-ultimate-card" onClick={() => navigate('/courses')}>
            <div className="interface-ultimate-card-icon">🎓</div>
            <h3 className="interface-ultimate-card-title">{t.browseCourses}</h3>
            <p className="interface-ultimate-card-description">{t.coursesDesc}</p>
          </div>

          <div className="interface-ultimate-card" onClick={() => navigate('/ai-matcher')}>
            <div className="interface-ultimate-card-icon">🤖</div>
            <h3 className="interface-ultimate-card-title">{t.aiMatcher}</h3>
            <p className="interface-ultimate-card-description">{t.aiDesc}</p>
          </div>

          <div className="interface-ultimate-card" onClick={() => navigate('/networking')}>
            <div className="interface-ultimate-card-icon">🤝</div>
            <h3 className="interface-ultimate-card-title">{t.networking}</h3>
            <p className="interface-ultimate-card-description">{t.networkDesc}</p>
          </div>

          <div className="interface-ultimate-card" onClick={() => navigate('/profile')}>
            <div className="interface-ultimate-card-icon">👤</div>
            <h3 className="interface-ultimate-card-title">{t.myProfile}</h3>
            <p className="interface-ultimate-card-description">{t.profileDesc}</p>
          </div>

          <div className="interface-ultimate-card" onClick={() => navigate('/settings')}>
            <div className="interface-ultimate-card-icon">⚙️</div>
            <h3 className="interface-ultimate-card-title">{t.settings}</h3>
            <p className="interface-ultimate-card-description">{t.settingsDesc}</p>
          </div>

          <div className="interface-ultimate-card" onClick={() => navigate('/apply-history')}>
            <div className="interface-ultimate-card-icon">📋</div>
            <h3 className="interface-ultimate-card-title">{t.applyHistory}</h3>
            <p className="interface-ultimate-card-description">{t.historyDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}