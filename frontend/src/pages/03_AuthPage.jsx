import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import authTranslations from '../data/authTranslations.json';
import './03_AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = authTranslations[language] || authTranslations.ar;
  const isRTL = language === 'ar';

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSelection = (path) => {
    navigate(path);
  };

  return (
    <div className={`auth-page-container ${isVisible ? 'visible' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="auth-page-content">
        <div className="auth-page-header">
          <button onClick={() => navigate(-1)} className="auth-back-button">
            {isRTL ? '→' : '←'}
          </button>
          <h1 className="auth-page-title">{t.createAccountTitle}</h1>
        </div>

        <p className="auth-page-subtitle">{t.createAccountSubtitle}</p>

        <div className="auth-options-grid">
          <div className="auth-option-card" onClick={() => handleSelection('/onboarding-individuals')}>
            <h2 className="auth-option-title">{t.individualTitle}</h2>
            <p className="auth-option-description">{t.individualDescription}</p>
          </div>
          <div className="auth-option-card" onClick={() => handleSelection('/onboarding-companies')}>
            <h2 className="auth-option-title">{t.companyTitle}</h2>
            <p className="auth-option-description">{t.companyDescription}</p>
          </div>
           <div className="auth-option-card" onClick={() => handleSelection('/onboarding-illiterate')}>
            <h2 className="auth-option-title">{t.illiterateTitle}</h2>
            <p className="auth-option-description">{t.illiterateDescription}</p>
          </div>
          <div className="auth-option-card" onClick={() => handleSelection('/onboarding-visual')}>
            <h2 className="auth-option-title">{t.visualTitle}</h2>
            <p className="auth-option-description">{t.visualDescription}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
