import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import onboardingCompaniesTranslations from '../data/onboardingCompaniesTranslations.json';
import './06_OnboardingCompanies.css';

export default function OnboardingCompanies() {
  const navigate = useNavigate();
  const { language, updateUser, startBgMusic } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => { 
    setIsVisible(true); 
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
  }, [startBgMusic]);

  const t = onboardingCompaniesTranslations[language || 'ar'];

  const [formData, setFormData] = useState({
    bio: '',
    website: '',
    address: '',
    location: '',
    employeeCount: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAgreed) return;
    setLoading(true);
    try {
      const res = await userService.updateProfile(formData);
      updateUser(res.data.user);
      navigate('/interface-companies');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`onboarding-companies-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir="rtl">
      <div className={`onboarding-companies-card ${isVisible ? 'translate-y-0' : 'translate-y-10'}`}>
        <div className="onboarding-companies-header">
          <h2 className="onboarding-companies-title">{t.title}</h2>
          <p className="onboarding-companies-subtitle">{t.sub}</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-companies-form">
          <div className="onboarding-companies-input-group">
            <label className="onboarding-companies-label">{t.bio}</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder={t.placeholderBio}
              className="onboarding-companies-input onboarding-companies-textarea"
              required
            />
          </div>

          <div className="onboarding-companies-grid">
            <div className="onboarding-companies-input-group">
              <label className="onboarding-companies-label">{t.website}</label>
              <input
                type="url"
                value={formData.website}
                onChange={e => setFormData({...formData, website: e.target.value})}
                placeholder={t.placeholderWeb}
                className="onboarding-companies-input"
              />
            </div>
            <div className="onboarding-companies-input-group">
              <label className="onboarding-companies-label">{t.employees}</label>
              <input
                type="text"
                value={formData.employeeCount}
                onChange={e => setFormData({...formData, employeeCount: e.target.value})}
                placeholder={t.placeholderEmp}
                className="onboarding-companies-input"
              />
            </div>
          </div>

          <div className="onboarding-companies-input-group">
            <label className="onboarding-companies-label">{t.address}</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder={t.placeholderAddr}
              className="onboarding-companies-input"
              required
            />
          </div>

          <div className="onboarding-companies-input-group">
            <label className="onboarding-companies-label">{t.location}</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder={t.placeholderLoc}
              className="onboarding-companies-input"
            />
          </div>

          <div className="onboarding-companies-agreement-container">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={e => setIsAgreed(e.target.checked)}
              className="onboarding-companies-checkbox"
              required
            />
            <p className="onboarding-companies-agreement-text">{t.declaration}</p>
          </div>

          <button
            type="submit"
            disabled={loading || !isAgreed}
            className={`onboarding-companies-submit-btn ${isAgreed ? 'onboarding-companies-submit-btn-active' : 'onboarding-companies-submit-btn-inactive'}`}
          >
            {loading ? <div className="onboarding-companies-loading-spinner"></div> : t.finish}
          </button>
        </form>
      </div>
    </div>
  );
}