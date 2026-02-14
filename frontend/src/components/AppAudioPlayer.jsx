
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

  // تهيئة النظام الصوتي - فوراً بدون انتظار تفاعل
  useEffect(() => {
    const initializeAudio = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;
      
      console.log('🎵 AppAudioPlayer: Initializing audio system immediately...');
      
      try {
        await audioManager.initialize();
        setIsInitialized(true);
        console.log('🎵 AppAudioPlayer: Audio system initialized successfully');
        
        // تحديث الصفحة الحالية بعد التهيئة مباشرة
        if (location.pathname) {
          console.log('🎵 AppAudioPlayer: Updating initial page:', location.pathname);
          await audioManager.updatePage(location.pathname);
        }
      } catch (error) {
        console.error('🎵 AppAudioPlayer: Failed to initialize:', error);
      }
    };

    // تهيئة فورية
    initializeAudio();
  }, [location.pathname]);

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
