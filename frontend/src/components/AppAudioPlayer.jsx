
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { App } from '@capacitor/app';
import audioManager from '../services/audioManager';

const AppAudioPlayer = () => {
  const { musicEnabled, audioEnabled } = useApp();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const initAttempted = useRef(false);

  // تهيئة النظام الصوتي عند التفاعل الأول أو بعد تأخير قصير
  useEffect(() => {
    let initTimeout;
    
    const initializeAudio = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;
      
      console.log('🎵 AppAudioPlayer: Initializing audio system...');
      await audioManager.initialize();
      setIsInitialized(true);
      console.log('🎵 AppAudioPlayer: Audio system initialized');
    };

    const handleUserInteraction = async () => {
      await initializeAudio();
      
      // إزالة مستمعي الأحداث بعد التفاعل الأول
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      
      if (initTimeout) clearTimeout(initTimeout);
    };

    // محاولة التهيئة عند التفاعل
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    // تهيئة تلقائية بعد 2 ثانية إذا لم يحدث تفاعل
    initTimeout = setTimeout(async () => {
      if (!initAttempted.current) {
        console.log('🎵 AppAudioPlayer: Auto-initializing after timeout');
        await initializeAudio();
      }
    }, 2000);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, []);

  // مراقبة تغيير الصفحة
  useEffect(() => {
    if (isInitialized) {
      console.log('🎵 AppAudioPlayer: Page changed to', location.pathname);
      audioManager.updatePage(location.pathname);
    }
  }, [location.pathname, isInitialized]);

  // مراقبة تغيير إعدادات الصوت
  useEffect(() => {
    if (isInitialized) {
      console.log('🎵 AppAudioPlayer: Settings changed', { audioEnabled, musicEnabled });
      audioManager.updateAudioSettings(audioEnabled, musicEnabled);
    }
  }, [audioEnabled, musicEnabled, isInitialized]);

  // مراقبة حالة التطبيق (خلفية/مقدمة) - Capacitor
  useEffect(() => {
    let listener;
    
    const setupListener = async () => {
      try {
        listener = await App.addListener('appStateChange', ({ isActive }) => {
          console.log('🎵 AppAudioPlayer: App state changed', isActive);
          audioManager.handleAppStateChange(isActive);
        });
      } catch (error) {
        console.log('🎵 AppAudioPlayer: Running in web browser, app state listener not available');
      }
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, []);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return () => {
      console.log('🎵 AppAudioPlayer: Cleaning up');
      audioManager.cleanup();
    };
  }, []);

  // لا نحتاج لعرض أي شيء، الصوت يُدار برمجياً
  return null;
};

export default AppAudioPlayer;
