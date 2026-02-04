
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext'; // Corrected import
import { App } from '@capacitor/app';
import audioManager from '../services/audioManager';

const AppAudioPlayer = () => {
  const { musicEnabled, audioEnabled } = useApp(); // Corrected hook
  const location = useLocation();

  // تهيئة النظام الصوتي عند التفاعل الأول
  useEffect(() => {
    const handleUserInteraction = async () => {
      await audioManager.initialize();
      
      // إزالة مستمعي الأحداث بعد التفاعل الأول
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // مراقبة تغيير الصفحة
  useEffect(() => {
    audioManager.updatePage(location.pathname);
  }, [location.pathname]);

  // مراقبة تغيير إعدادات الصوت
  useEffect(() => {
    audioManager.updateAudioSettings(audioEnabled, musicEnabled);
  }, [audioEnabled, musicEnabled]);

  // مراقبة حالة التطبيق (خلفية/مقدمة) - Capacitor
  useEffect(() => {
    const handleAppStateChange = ({ isActive }) => {
      audioManager.handleAppStateChange(isActive);
    };

    const listener = App.addListener('appStateChange', handleAppStateChange);

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  // تنظيف عند إلغاء المكون
  useEffect(() => {
    return () => {
      audioManager.cleanup();
    };
  }, []);

  // لا نحتاج لعرض أي شيء، الصوت يُدار برمجياً
  return null;
};

export default AppAudioPlayer;
