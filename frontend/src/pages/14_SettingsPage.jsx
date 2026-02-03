import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import settingsTranslations from '../data/settingsTranslations.json';
import './14_SettingsPage.css';

export default function SettingsPage() {
  const { language, setLanguage, logout, startBgMusic } = useAuth();
  const { audioEnabled, saveAudio, musicEnabled, saveMusic, notificationsEnabled, saveNotifications } = useAppSettings();
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = language === 'ar';

  useEffect(() => { 
    setIsVisible(true); 
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
  }, [startBgMusic]);

  const handleLanguageChange = async (newLang) => {
    try {
      await setLanguage(newLang);
      localStorage.setItem('lang', newLang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const handleAudioToggle = async () => {
    try {
      const newValue = !audioEnabled;
      await saveAudio(newValue);
      localStorage.setItem('audio_enabled', newValue ? 'true' : 'false');
      localStorage.setItem('audioConsent', newValue ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to change audio setting:', error);
    }
  };

  const handleMusicToggle = async () => {
    try {
      const newValue = !musicEnabled;
      await saveMusic(newValue);
      localStorage.setItem('musicEnabled', newValue ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to change music setting:', error);
    }
  };

  const handleNotificationToggle = async () => {
    try {
      const newValue = !notificationsEnabled;
      await saveNotifications(newValue);
      localStorage.setItem('notificationsEnabled', newValue ? 'true' : 'false');
      
      if (newValue && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          console.log("📱 System notification permission:", permission);
        } catch (error) {
          console.warn("⚠️ Failed to request notification permission:", error);
        }
      }
    } catch (error) {
      console.error('Failed to change notification setting:', error);
    }
  };

  const t = settingsTranslations[language || 'ar'];

  return (
    <div className={`settings-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="settings-page-main">
        <div className="settings-card">
          <h2 className={`settings-title ${isRTL ? 'border-r-8 pr-4' : 'border-l-8 pl-4'}`}>
            {t.title}
          </h2>

          <div className="settings-content">
            <section className="settings-section">
              <div className="settings-section-text-content">
                <h3 className="settings-section-title">{t.lang}</h3>
                <p className="settings-section-description">{t.langDesc}</p>
              </div>
              <div className="settings-lang-buttons">
                {['ar', 'en', 'fr'].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLanguageChange(l)}
                    className={`settings-lang-btn ${language === l ? 'settings-lang-btn-active' : 'settings-lang-btn-inactive'}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            <section className="settings-section">
              <div className="settings-section-text-content">
                <h3 className="settings-section-title">{t.audio}</h3>
                <p className="settings-section-description">{t.audioDesc}</p>
              </div>
              <button
                onClick={handleAudioToggle}
                className={`settings-toggle-btn ${audioEnabled ? 'bg-[#304B60]' : 'bg-[#304B60]/10'}`}
              >
                <div className={`settings-toggle-knob ${isRTL ? (audioEnabled ? 'right-1' : 'right-13') : (audioEnabled ? 'left-13' : 'left-1')}`} ></div>
                <span className={`settings-toggle-text ${audioEnabled ? 'text-[#D48161]' : 'text-[#304B60]/40'}`}>
                   {audioEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </section>

            <section className="settings-section">
              <div className="settings-section-text-content">
                <h3 className="settings-section-title">{t.music}</h3>
                <p className="settings-section-description">{t.musicDesc}</p>
              </div>
              <button
                onClick={handleMusicToggle}
                className={`settings-toggle-btn ${musicEnabled ? 'bg-[#304B60]' : 'bg-[#304B60]/10'}`}
              >
                <div className={`settings-toggle-knob ${isRTL ? (musicEnabled ? 'right-1' : 'right-13') : (musicEnabled ? 'left-13' : 'left-1')}`} ></div>
                <span className={`settings-toggle-text ${musicEnabled ? 'text-[#D48161]' : 'text-[#304B60]/40'}`}>
                   {musicEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </section>

            <section className="settings-section">
              <div className="settings-section-text-content">
                <h3 className="settings-section-title">{t.notifications}</h3>
                <p className="settings-section-description">{t.notificationsDesc}</p>
              </div>
              <button
                onClick={handleNotificationToggle}
                className={`settings-toggle-btn ${notificationsEnabled ? 'bg-[#304B60]' : 'bg-[#304B60]/10'}`}
              >
                <div className={`settings-toggle-knob ${isRTL ? (notificationsEnabled ? 'right-1' : 'right-13') : (notificationsEnabled ? 'left-13' : 'left-1')}`} ></div>
                <span className={`settings-toggle-text ${notificationsEnabled ? 'text-[#D48161]' : 'text-[#304B60]/40'}`}>
                   {notificationsEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
            </section>

            <section className="settings-danger-zone">
               <h3 className="settings-danger-zone-title">{t.dangerZone}</h3>
               <div className="settings-danger-zone-buttons">
                  <button
                    onClick={logout}
                    className="settings-logout-btn"
                  >
                    <span>{t.logout}</span>
                    <span>🚪</span>
                  </button>
                  <button
                    className="settings-delete-btn"
                  >
                    <span>{t.deleteAccount}</span>
                    <span>⚠️</span>
                  </button>
               </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}