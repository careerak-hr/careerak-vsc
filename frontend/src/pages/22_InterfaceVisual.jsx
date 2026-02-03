import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import interfaceVisualTranslations from '../data/interfaceVisualTranslations.json';
import './22_InterfaceVisual.css';

export default function InterfaceVisual() {
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

  const t = interfaceVisualTranslations[language || 'ar'];

  return (
    <div className={`interface-visual-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="interface-visual-main">
        <div className="interface-visual-header">
          <h2 className="interface-visual-title">{t.welcome.replace('{firstName}', user?.firstName || 'المستخدم')}</h2>
          <p className="interface-visual-subtitle">{t.sub}</p>
        </div>

        <div className="interface-visual-grid">
          <div className="interface-visual-card" onClick={() => navigate('/job-postings')}>
            <div className="interface-visual-card-icon">💼</div>
            <h3 className="interface-visual-card-title">{t.browseJobs}</h3>
            <p className="interface-visual-card-description">{t.jobsDesc}</p>
          </div>

          <div className="interface-visual-card" onClick={() => navigate('/courses')}>
            <div className="interface-visual-card-icon">🎓</div>
            <h3 className="interface-visual-card-title">{t.browseCourses}</h3>
            <p className="interface-visual-card-description">{t.coursesDesc}</p>
          </div>

          <div className="interface-visual-card" onClick={() => navigate('/voice-guide')}>
            <div className="interface-visual-card-icon">🔊</div>
            <h3 className="interface-visual-card-title">{t.voiceGuide}</h3>
            <p className="interface-visual-card-description">{t.voiceDesc}</p>
          </div>

          <div className="interface-visual-card" onClick={() => navigate('/profile')}>
            <div className="interface-visual-card-icon">👤</div>
            <h3 className="interface-visual-card-title">{t.myProfile}</h3>
            <p className="interface-visual-card-description">{t.profileDesc}</p>
          </div>

          <div className="interface-visual-card" onClick={() => navigate('/settings')}>
            <div className="interface-visual-card-icon">⚙️</div>
            <h3 className="interface-visual-card-title">{t.settings}</h3>
            <p className="interface-visual-card-description">{t.settingsDesc}</p>
          </div>

          <div className="interface-visual-card" onClick={() => navigate('/apply-history')}>
            <div className="interface-visual-card-icon">📋</div>
            <h3 className="interface-visual-card-title">{t.applyHistory}</h3>
            <p className="interface-visual-card-description">{t.historyDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}