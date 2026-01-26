
import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSettings } from '../context/AppSettingsContext';
import { App } from '@capacitor/app';

const AppAudioPlayer = () => {
  const { musicEnabled, audioEnabled } = useAppSettings();
  const location = useLocation();
  const musicAudioRef = useRef(null);
  const introAudioRef = useRef(null);

  const [introPlayed, setIntroPlayed] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // تهيئة الصوت عند التفاعل الأول مع المستخدم
  const initAudio = useCallback(async () => {
    if (audioInitialized) return;

    try {
      // إنشاء عناصر الصوت
      if (!musicAudioRef.current) {
        musicAudioRef.current = new Audio();
        musicAudioRef.current.src = `${process.env.PUBLIC_URL}/Music.mp3`;
        musicAudioRef.current.loop = true;
        musicAudioRef.current.volume = 0.3;
        musicAudioRef.current.preload = 'auto';
      }

      if (!introAudioRef.current) {
        introAudioRef.current = new Audio();
        introAudioRef.current.src = `${process.env.PUBLIC_URL}/intro.mp3`;
        introAudioRef.current.volume = 0.7;
        introAudioRef.current.preload = 'auto';
      }

      // إضافة event listeners
      musicAudioRef.current.addEventListener('error', (e) => {
        console.error('Music audio error:', e);
      });

      introAudioRef.current.addEventListener('error', (e) => {
        console.error('Intro audio error:', e);
      });

      introAudioRef.current.addEventListener('ended', () => {
        console.log('Intro audio ended');
      });

      setAudioInitialized(true);
      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [audioInitialized]);

  // تشغيل الصوت عند التفاعل الأول
  const handleUserInteraction = useCallback(async () => {
    if (!audioInitialized) {
      await initAudio();
    }
  }, [audioInitialized, initAudio]);

  // إضافة event listeners للتفاعل الأول
  useEffect(() => {
    const handleInteraction = () => {
      handleUserInteraction();
      // إزالة listeners بعد التفاعل الأول
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [handleUserInteraction]);

  // تشغيل المقدمة
  const playIntro = useCallback(async () => {
    if (audioEnabled && !introPlayed && introAudioRef.current) {
      try {
        console.log('Playing intro audio...');
        // إيقاف الموسيقى أولاً إذا كانت تعمل
        if (musicAudioRef.current && !musicAudioRef.current.paused) {
          musicAudioRef.current.pause();
          musicAudioRef.current.currentTime = 0;
        }

        await introAudioRef.current.play();
        setIntroPlayed(true);
      } catch (error) {
        console.error('Failed to play intro:', error);
      }
    }
  }, [audioEnabled, introPlayed]);

  // إدارة الموسيقى
  const manageMusic = useCallback(async (shouldPlay) => {
    if (!musicAudioRef.current) return;

    try {
      if (shouldPlay && musicEnabled) {
        console.log('Playing background music...');
        // التأكد من إيقاف المقدمة أولاً
        if (introAudioRef.current && !introAudioRef.current.paused) {
          introAudioRef.current.pause();
          introAudioRef.current.currentTime = 0;
        }

        await musicAudioRef.current.play();
      } else {
        console.log('Stopping background music...');
        musicAudioRef.current.pause();
        musicAudioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.error('Failed to manage music:', error);
    }
  }, [musicEnabled]);

  // مراقبة حالة التطبيق
  useEffect(() => {
    const handleAppStateChange = ({ isActive }) => {
      if (!musicAudioRef.current) return;

      if (!isActive) {
        console.log('App going to background, pausing music');
        musicAudioRef.current.pause();
      } else {
        console.log('App coming to foreground');
        // استئناف الموسيقى إذا كانت الصفحة مناسبة
        if (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth')) {
          manageMusic(true);
        }
      }
    };

    App.addListener('appStateChange', handleAppStateChange);

    return () => {
      App.removeAllListeners('appStateChange');
    };
  }, [location.pathname, manageMusic]);

  // التحكم في الموسيقى حسب الصفحة
  useEffect(() => {
    if (location.pathname === '/entry') {
      playIntro();
      manageMusic(false);
    } else if (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth')) {
      manageMusic(true);
    } else {
      manageMusic(false);
    }
  }, [location.pathname, playIntro, manageMusic]);

  // التحكم في الموسيقى عند تغيير الإعدادات
  useEffect(() => {
    if (!musicEnabled && musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
    } else if (musicEnabled && (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth'))) {
      manageMusic(true);
    }
  }, [musicEnabled, location.pathname, manageMusic]);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
      if (introAudioRef.current) {
        introAudioRef.current.pause();
        introAudioRef.current = null;
      }
    };
  }, []);

  // لا نحتاج لعرض أي شيء، الصوت يُدار برمجياً
  return null;
};

export default AppAudioPlayer;
