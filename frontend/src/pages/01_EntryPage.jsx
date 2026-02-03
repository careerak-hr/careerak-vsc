/**
 * 🔒 LOCKED FILE — DO NOT MODIFY
 * This file is production-stable.
 * Any change must be approved by Alaa.
 * Last locked by: Eng. Alaa
 * Date: 2026-01-22
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoverBestServer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { App } from '@capacitor/app';
import '../styles/imageLoader.css';

const entryTranslations = {
  ar: { slogan: "مستقبل الموارد البشرية" },
  en: { slogan: "The Future of HR" },
  fr: { slogan: "L'avenir des RH" }
};

export default function EntryPage() {
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();
  const { audioEnabled, language } = useAuth();
  const t = entryTranslations[language] || entryTranslations.ar;

  const audioRef = useRef(null);
  const isMounted = useRef(true);
  const timersRef = useRef([]);
  const listenersRef = useRef([]);

  // تنظيف شامل للموارد
  const cleanupResources = () => {
    // تنظيف الصوت
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.load();
      } catch (e) {
        console.log('Audio cleanup error:', e);
      }
      audioRef.current = null;
    }

    // تنظيف المؤقتات
    timersRef.current.forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    timersRef.current = [];

    // تنظيف المستمعين
    listenersRef.current.forEach(listener => {
      if (listener && typeof listener.then === 'function') {
        listener.then(l => l.remove()).catch(() => {});
      }
    });
    listenersRef.current = [];

    isMounted.current = false;
  };

  useEffect(() => {
    isMounted.current = true;
    
    const initServer = async () => {
      try {
        await discoverBestServer();
      } catch (error) {
        console.log("Server initializing...");
      }
    };
    initServer();

    const SYSTEM_DELAY = 1000;
    
    // إنشاء المؤقتات مع التنظيف الآمن
    const timer1 = setTimeout(() => {
      if (isMounted.current) {
        setPhase(1);
      }
    }, SYSTEM_DELAY);

    const timer2 = setTimeout(() => {
      if (isMounted.current) {
        setPhase(2);
      }
    }, SYSTEM_DELAY + 1500);

    const timer3 = setTimeout(() => {
      if (isMounted.current) {
        setPhase(3);
      }
    }, SYSTEM_DELAY + 7000);

    const timer4 = setTimeout(() => {
      if (isMounted.current) {
        cleanupResources();
        // استخدام requestAnimationFrame لضمان التنقل السلس
        requestAnimationFrame(() => {
          navigate('/login', { replace: true });
        });
      }
    }, SYSTEM_DELAY + 9000);

    // حفظ المؤقتات للتنظيف
    timersRef.current = [timer1, timer2, timer3, timer4];

    const handleAppState = (state) => {
      if (audioRef.current) {
        try {
          if (state.isActive && audioEnabled) {
            audioRef.current.play().catch(() => {});
          } else {
            audioRef.current.pause();
          }
        } catch (e) {
          console.log('App state audio error:', e);
        }
      }
    };

    const appStateListener = App.addListener('appStateChange', handleAppState);
    listenersRef.current.push(appStateListener);

    // إضافة مستمع للخروج من التطبيق
    const backButtonListener = App.addListener('backButton', () => {
      cleanupResources();
      App.exitApp();
    });
    listenersRef.current.push(backButtonListener);

    return cleanupResources;
  }, [navigate, audioEnabled]);

  // Separate useEffect for audio to handle audioEnabled changes
  useEffect(() => {
    if (audioEnabled && phase === 1 && !audioRef.current && isMounted.current) {
      try {
        console.log("Playing intro.mp3");
        audioRef.current = new Audio('./intro.mp3');
        audioRef.current.volume = 0.6;
        audioRef.current.preload = 'auto';
        
        // إضافة مستمعي أحداث للصوت
        audioRef.current.addEventListener('ended', () => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        });

        audioRef.current.addEventListener('error', (e) => {
          console.log("Audio error:", e);
          audioRef.current = null;
        });

        audioRef.current.play().catch((e) => {
          console.log("Intro audio play failed:", e);
          audioRef.current = null;
        });
      } catch (e) {
        console.log("Audio initialization error:", e);
        audioRef.current = null;
      }
    }
  }, [audioEnabled, phase]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-[#E3DAD1] select-none">
      <div className={`absolute inset-0 bg-gradient-to-b from-[#304B60]/10 to-transparent transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>

      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div className="relative flex items-center justify-center">
          <div className={`absolute w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] bg-[#304B60] opacity-[0.03] rounded-full transition-transform duration-[7000ms] ease-out ${phase >= 2 ? 'scale-150' : 'scale-0'}`}></div>

          <div className={`relative transition-all duration-1000 ease-out transform ${
            phase === 0 ? 'scale-75 opacity-0' :
            phase === 1 ? 'scale-110 opacity-100' :
            phase === 2 ? 'scale-100 opacity-100' :
            'scale-90 opacity-0'
          }`}>
            <div className="relative p-2 md:p-4">
              <div className="absolute inset-0 border-2 border-[#D48161]/20 rounded-full animate-spin-slow"></div>
              <div className="logo-container relative h-64 w-64 md:h-96 md:w-96 border-[4px] border-[#304B60] shadow-2xl">
                <img 
                  src="./logo.jpg" 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="logo-fallback" style={{display: 'none'}}>
                  🏢
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-6 md:mt-12 text-center transition-all duration-1000 delay-300 transform ${phase >= 1 && phase < 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-black text-[#304B60] tracking-tight mb-4 italic" style={{ fontFamily: 'serif' }}>Careerak</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1.5px] w-10 md:w-16 bg-[#D48161]/30"></div>
            <p className="text-[#304B60]/80 font-black text-[13px] md:text-lg uppercase tracking-[0.2em]">{t.slogan}</p>
            <div className="h-[1.5px] w-10 md:w-16 bg-[#D48161]/30"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 md:bottom-20 w-48 md:w-64 h-[2px] bg-[#304B60]/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#D48161] transition-all ease-linear"
          style={{
            width: phase >= 1 ? '100%' : '0%',
            transitionDuration: phase >= 1 ? '8500ms' : '0ms'
          }}
        ></div>
      </div>
    </div>
  );
}
