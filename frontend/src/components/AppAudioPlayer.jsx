
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSettings } from '../context/AppSettingsContext';
import { App } from '@capacitor/app';

const AppAudioPlayer = () => {
  const { musicEnabled, audioEnabled } = useAppSettings();
  const location = useLocation();
  const musicRef = useRef(null);
  const introRef = useRef(null);

  const [introPlayed, setIntroPlayed] = useState(false);

  useEffect(() => {
    const playIntro = () => {
      if (audioEnabled && !introPlayed && introRef.current) {
        introRef.current.play().catch(error => console.error("Intro audio playback failed:", error));
        setIntroPlayed(true);
      }
    };

    const manageMusic = (shouldPlay) => {
      if (musicRef.current) {
        if (shouldPlay && musicEnabled) {
          musicRef.current.volume = 0.3; // صوت هادئ
          musicRef.current.play().catch(error => console.error("Music audio playback failed:", error));
        } else {
          musicRef.current.pause();
        }
      }
    };

    if (location.pathname === '/entry') {
      playIntro();
      manageMusic(false); // إيقاف الموسيقى في صفحة الدخول الأولية
    } else if (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth')) {
      manageMusic(true);
    } else {
        // يمكنك إضافة منطق الصفحات الأخرى هنا إذا لزم الأمر
    }

    // إيقاف الموسيقى عند الخروج من التطبيق
    const handleAppStateChange = ({ isActive }) => {
        if (!isActive) {
            manageMusic(false);
        } else {
            // استئناف الموسيقى عند العودة للتطبيق إذا كانت الصفحة مناسبة
            if (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth')) {
                manageMusic(true);
            }
        }
    };

    App.addListener('appStateChange', handleAppStateChange);

    return () => {
      App.removeAllListeners('appStateChange');
    };

  }, [location.pathname, musicEnabled, audioEnabled, introPlayed]);

  // التأكد من إيقاف/تشغيل الموسيقى عند تغيير الإعدادات
  useEffect(() => {
    if (musicRef.current) {
      if (!musicEnabled) {
        musicRef.current.pause();
      } else {
        if (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth')) {
            musicRef.current.volume = 0.3;
            musicRef.current.play().catch(error => console.error("Music audio playback failed:", error));
        }
      }
    }
  }, [musicEnabled, location.pathname]);


  return (
    <>
      <audio ref={introRef} src={`${process.env.PUBLIC_URL}/intro.mp3`} />
      <audio ref={musicRef} src={`${process.env.PUBLIC_URL}/Music.mp3`} loop />
    </>
  );
};

export default AppAudioPlayer;
