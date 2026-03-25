
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoverBestServer } from '../services/api';
import { useApp } from '../context/AppContext';
import { App } from '@capacitor/app';
import entryTranslations from '../data/entryTranslations.json';
import './01_EntryPage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

export default function EntryPage() {
  const navigate = useNavigate();

  const { isAuthenticated, language, audioEnabled } = useApp();
  const seo = useSEO('entry', {});

  const t = entryTranslations[language] || entryTranslations.ar;

  const audioRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    discoverBestServer().catch(error => console.log("Server initializing..."));

    const timer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (isMounted.current) {
        navigate('/login', { replace: true });
      }
    }, 10000);

    const handleAppState = (state) => {
      if (audioRef.current) {
        if (state.isActive && audioEnabled) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    };
    
    let listener;
    const setupListener = async () => {
      try {
        listener = await App.addListener('appStateChange', handleAppState);
      } catch (error) {
        console.log('App state listener not available');
      }
    };
    setupListener();

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [navigate, audioEnabled, isAuthenticated]);

  useEffect(() => {
    if (audioEnabled) {
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      audioRef.current = new Audio(`${base}/intro.mp3`);
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch((e) => console.log("Intro audio play failed:", e));
    }
  }, [audioEnabled]);

  return (
    <>
      <SEOHead {...seo} />
      <main id="main-content" tabIndex="-1" className="entry-page-container">
      <div className="entry-page-gradient"></div>

      <div className="entry-page-main-content">
        <div className="entry-page-logo-wrapper">
          <div className="entry-page-glowing-circle"></div>

          <div className="entry-page-logo-animation-wrapper">
            <div className="entry-page-logo-inner-wrapper">
              <div className="entry-page-spinning-border"></div>
              <img src="/logo.jpg" alt="Careerak logo - Your gateway to career opportunities" className="entry-page-logo" />
            </div>
          </div>
        </div>

        <div className="entry-page-text-container">
          <h1 className="entry-page-title" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <div className="entry-page-slogan-container">
            <div className="entry-page-slogan-line"></div>
            <p className="entry-page-slogan-text">{t.slogan}</p>
            <div className="entry-page-slogan-line"></div>
          </div>
        </div>
      </div>

      <div className="entry-page-progress-bar-container">
        <div className="entry-page-progress-bar"></div>
      </div>
    </main>
    </>
  );
}
