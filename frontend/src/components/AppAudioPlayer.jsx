
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSettings } from '../context/AppSettingsContext';
import { App } from '@capacitor/app';

const AppAudioPlayer = () => {
  const { musicEnabled, audioEnabled } = useAppSettings();
  const location = useLocation();
  const musicRef = useRef(null);
  const introRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicBufferRef = useRef(null);
  const introBufferRef = useRef(null);
  const musicSourceRef = useRef(null);

  const [introPlayed, setIntroPlayed] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // تهيئة Web Audio API
  const initAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setAudioInitialized(true);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      setAudioSupported(false);
    }
  }, []);

  // تحميل ملف صوتي باستخدام fetch
  const loadAudioBuffer = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return await audioContextRef.current.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(`Failed to load audio from ${url}:`, error);
      return null;
    }
  };

  // تحميل الملفات الصوتية
  const loadAudioFiles = useCallback(async () => {
    if (!audioSupported || !audioInitialized) return;

    try {
      const [musicBuffer, introBuffer] = await Promise.all([
        loadAudioBuffer(`${process.env.PUBLIC_URL}/Music.mp3`),
        loadAudioBuffer(`${process.env.PUBLIC_URL}/intro.mp3`)
      ]);

      musicBufferRef.current = musicBuffer;
      introBufferRef.current = introBuffer;

      console.log('Audio files loaded successfully');
    } catch (error) {
      console.error('Failed to load audio files:', error);
    }
  }, [audioSupported, audioInitialized]);

  // تشغيل صوت باستخدام Web Audio API
  const playAudioBuffer = (buffer, loop = false) => {
    if (!buffer || !audioContextRef.current) return null;

    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.loop = loop;
      source.connect(audioContextRef.current.destination);

      if (loop) {
        // إنشاء gain node للتحكم في الصوت
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 0.3; // صوت هادئ للموسيقى
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
      }

      source.start();
      return source;
    } catch (error) {
      console.error('Failed to play audio buffer:', error);
      return null;
    }
  };

  // إيقاف الموسيقى
  const stopMusic = () => {
    if (musicSourceRef.current) {
      try {
        musicSourceRef.current.stop();
      } catch (error) {
        // Source might already be stopped
      }
      musicSourceRef.current = null;
    }
  };

  // تشغيل المقدمة
  const playIntro = useCallback(() => {
    if (audioEnabled && !introPlayed && introBufferRef.current) {
      console.log('Playing intro audio...');
      playAudioBuffer(introBufferRef.current);
      setIntroPlayed(true);
    }
  }, [audioEnabled, introPlayed]);

  // إدارة الموسيقى
  const manageMusic = useCallback((shouldPlay) => {
    if (shouldPlay && musicEnabled && musicBufferRef.current) {
      console.log('Playing background music...');
      stopMusic(); // إيقاف أي موسيقى سابقة
      musicSourceRef.current = playAudioBuffer(musicBufferRef.current, true);
    } else {
      console.log('Stopping background music...');
      stopMusic();
    }
  }, [musicEnabled]);

  // تهيئة الصوت عند التفاعل الأول مع المستخدم
  const handleUserInteraction = useCallback(async () => {
    if (!audioInitialized) {
      await initAudioContext();
      await loadAudioFiles();
    }
  }, [audioInitialized, initAudioContext, loadAudioFiles]);

  useEffect(() => {
    // إضافة event listeners للتفاعل الأول
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

  useEffect(() => {
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
  }, [location.pathname, manageMusic]);

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

  // التأكد من إيقاف/تشغيل الموسيقى عند تغيير الإعدادات
  useEffect(() => {
    if (!musicEnabled) {
      stopMusic();
    } else {
      if (location.pathname.startsWith('/login') || location.pathname.startsWith('/auth')) {
        manageMusic(true);
      }
    }
  }, [musicEnabled, location.pathname, manageMusic]);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return () => {
      stopMusic();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Fallback للمتصفحات التي لا تدعم Web Audio API
  if (!audioSupported) {
    return (
      <>
        <audio
          ref={introRef}
          src={`${process.env.PUBLIC_URL}/intro.mp3`}
          preload="auto"
        />
        <audio
          ref={musicRef}
          src={`${process.env.PUBLIC_URL}/Music.mp3`}
          loop
          preload="auto"
        />
      </>
    );
  }

  return null; // لا نحتاج لعرض أي شيء، الصوت يُدار برمجياً
};

export default AppAudioPlayer;
