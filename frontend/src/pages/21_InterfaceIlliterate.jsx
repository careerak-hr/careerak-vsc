import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import interfaceIlliterateTranslations from '../data/interfaceIlliterateTranslations.json';
import './21_InterfaceIlliterate.css';

export default function InterfaceIlliterate() {
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

  const t = interfaceIlliterateTranslations[language || 'ar'];

  return (
    <div className={`interface-illiterate-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="interface-illiterate-main">
        <div className="interface-illiterate-header">
          <h2 className="interface-illiterate-title">{t.welcome.replace('{firstName}', user?.firstName || 'المستخدم')}</h2>
          <p className="interface-illiterate-subtitle">{t.sub}</p>
        </div>

        <div className="interface-illiterate-grid">
          <div className="interface-illiterate-card" onClick={() => navigate('/job-postings')}>
            <div className="interface-illiterate-card-icon">💼</div>
            <h3 className="interface-illiterate-card-title">{t.browseJobs}</h3>
            <p className="interface-illiterate-card-description">{t.jobsDesc}</p>
          </div>

          <div className="interface-illiterate-card" onClick={() => navigate('/voice-jobs')}>
            <div className="interface-illiterate-card-icon">🔊</div>
            <h3 className="interface-illiterate-card-title">{t.voiceJobs}</h3>
            <p className="interface-illiterate-card-description">{t.voiceDesc}</p>
          </div>

          <div className="interface-illiterate-card" onClick={() => navigate('/profile')}>
            <div className="interface-illiterate-card-icon">👤</div>
            <h3 className="interface-illiterate-card-title">{t.myProfile}</h3>
            <p className="interface-illiterate-card-description">{t.profileDesc}</p>
          </div>

          <div className="interface-illiterate-card" onClick={() => navigate('/settings')}>
            <div className="interface-illiterate-card-icon">⚙️</div>
            <h3 className="interface-illiterate-card-title">{t.settings}</h3>
            <p className="interface-illiterate-card-description">{t.settingsDesc}</p>
          </div>

          <div className="interface-illiterate-card" onClick={() => navigate('/apply-history')}>
            <div className="interface-illiterate-card-icon">📋</div>
            <h3 className="interface-illiterate-card-title">{t.applyHistory}</h3>
            <p className="interface-illiterate-card-description">{t.historyDesc}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}