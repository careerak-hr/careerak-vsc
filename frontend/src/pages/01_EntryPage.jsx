
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoverBestServer } from '../services/api';
import { useApp } from '../context/AppContext';
import { App } from '@capacitor/app';
import entryTranslations from '../data/entryTranslations.json';
import './01_EntryPage.css';

export default function EntryPage() {
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();

  const { isAuthenticated, language, audioEnabled } = useApp();

  const t = entryTranslations[language] || entryTranslations.ar;

  const audioRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    discoverBestServer().catch(error => console.log("Server initializing..."));

    const SYSTEM_DELAY = 1000;
    const timers = [
      setTimeout(() => {
        if (isMounted.current) setPhase(1);
      }, SYSTEM_DELAY),
      setTimeout(() => { if (isMounted.current) setPhase(2); }, SYSTEM_DELAY + 1500),
      setTimeout(() => { if (isMounted.current) setPhase(3); }, SYSTEM_DELAY + 7000),
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (isMounted.current) {
          navigate('/login', { replace: true });
        }
      }, SYSTEM_DELAY + 9000)
    ];

    const handleAppState = (state) => {
      if (audioRef.current) {
        if (state.isActive && audioEnabled) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    };
    const listener = App.addListener('appStateChange', handleAppState);

    return () => {
      isMounted.current = false;
      timers.forEach(clearTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      listener.then(l => l.remove());
    };
  }, [navigate, audioEnabled, isAuthenticated]);

  useEffect(() => {
    if (audioEnabled && phase === 1 && !audioRef.current) {
      console.log("Playing intro.mp3");
      audioRef.current = new Audio('/intro.mp3');
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch((e) => console.log("Intro audio play failed:", e));
    }
  }, [audioEnabled, phase]);

  const getPhaseClass = () => {
    switch (phase) {
      case 0: return 'scale-75 opacity-0';
      case 1: return 'scale-110 opacity-100';
      case 2: return 'scale-100 opacity-100';
      default: return 'scale-90 opacity-0';
    }
  };

  return (
    <div className="entry-page-container">
      <div className={`entry-page-gradient ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="entry-page-main-content">
        <div className="entry-page-logo-wrapper">
          <div className={`entry-page-glowing-circle ${phase >= 2 ? 'scale-150' : 'scale-0'}`}></div>

          <div className={`entry-page-logo-animation-wrapper ${getPhaseClass()}`}>
            <div className="entry-page-logo-inner-wrapper">
              <div className="entry-page-spinning-border"></div>
              <img src="/logo.jpg" alt="Logo" className="entry-page-logo" />
            </div>
          </div>
        </div>

        <div className={`entry-page-text-container ${phase >= 1 && phase < 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="entry-page-title" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <div className="entry-page-slogan-container">
            <div className="entry-page-slogan-line"></div>
            <p className="entry-page-slogan-text">{t.slogan}</p>
            <div className="entry-page-slogan-line"></div>
          </div>
        </div>
      </div>

      <div className="entry-page-progress-bar-container">
        <div
          className="entry-page-progress-bar"
          style={{
            width: phase >= 1 ? '100%' : '0%',
            transitionDuration: phase >= 1 ? '8500ms' : '0ms'
          }}
        ></div>
      </div>
    </div>
  );
}
