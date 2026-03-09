import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
// OPTIMIZATION: Removed CryptoJS import - now lazy loaded via encryption utility
// This removes 66 KB from the main bundle and improves TTI
import { encrypt } from '../utils/encryption';

// --- Centralized App Context ---
const AppContext = createContext();

// Export AppContext for testing purposes
export { AppContext };

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'careerak_secure_key_2024';

export const AppProvider = ({ children }) => {
  // --- State from AuthContext ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setAuthLoading] = useState(true);

  // --- State from AppSettingsContext ---
  const [language, setLanguage] = useState('ar');
  const [audioEnabled, setAudioEnabled] = useState(true); // ✅ تفعيل الصوت افتراضياً
  const [musicEnabled, setMusicEnabled] = useState(true); // ✅ تفعيل الموسيقى افتراضياً
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSettingsLoading, setSettingsLoading] = useState(true);

  // --- Effect to load App Settings ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('📱 Loading app settings from Preferences...');
        
        // تحميل الإعدادات من Preferences
        const [langResult, audioResult, musicResult, notifResult] = await Promise.all([
          Preferences.get({ key: 'lang' }),
          Preferences.get({ key: 'audio_enabled' }),
          Preferences.get({ key: 'musicEnabled' }),
          Preferences.get({ key: 'notificationsEnabled' })
        ]);

        // ✅ القيم الافتراضية عند أول تثبيت
        const loadedLang = langResult.value || 'ar';
        const loadedAudio = audioResult.value !== null ? audioResult.value === 'true' : true; // ✅ true افتراضياً
        const loadedMusic = musicResult.value !== null ? musicResult.value === 'true' : true; // ✅ true افتراضياً
        const loadedNotif = notifResult.value === 'true';

        setLanguage(loadedLang);
        setAudioEnabled(loadedAudio);
        setMusicEnabled(loadedMusic);
        setNotificationsEnabled(loadedNotif);

        // ✅ حفظ القيم الافتراضية عند أول تشغيل
        if (audioResult.value === null) {
          await Preferences.set({ key: 'audio_enabled', value: 'true' });
        }
        if (musicResult.value === null) {
          await Preferences.set({ key: 'musicEnabled', value: 'true' });
        }

        // مزامنة مع localStorage للتوافق مع audioManager
        localStorage.setItem('audio_enabled', loadedAudio ? 'true' : 'false');
        localStorage.setItem('musicEnabled', loadedMusic ? 'true' : 'false');
        localStorage.setItem('audioConsent', loadedAudio ? 'true' : 'false');

        console.log('✅ Settings loaded:', { 
          language: loadedLang, 
          audio: loadedAudio, 
          music: loadedMusic, 
          notifications: loadedNotif 
        });
      } catch (error) {
        console.warn('Failed to load settings, using defaults.', error);
        // ✅ القيم الافتراضية في حالة الخطأ
        setLanguage('ar');
        setAudioEnabled(true);
        setMusicEnabled(true);
        setNotificationsEnabled(false);
        
        // حفظ القيم الافتراضية
        localStorage.setItem('audio_enabled', 'true');
        localStorage.setItem('musicEnabled', 'true');
        localStorage.setItem('audioConsent', 'true');
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, []);

  // --- Effect to load Auth Data ---
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        console.log('⚡ Fast auth load - skipping');
        // تخطي تحميل Auth مؤقتاً
      } catch (error) {
        console.error('Failed to load auth data', error);
      } finally {
        setAuthLoading(false);
      }
    };
    loadAuthData();
  }, []);

  // --- Auth Methods ---
  const login = async (userData, rawToken) => {
    // OPTIMIZATION: encrypt() lazy loads CryptoJS only when needed
    const encryptedToken = await encrypt(rawToken, SECRET_KEY);
    await Promise.all([
      Preferences.set({ key: 'auth_token', value: encryptedToken }),
      Preferences.set({ key: 'user', value: JSON.stringify(userData) }),
    ]);
    setUser(userData);
    setToken(rawToken);
  };

  const logout = async () => {
    await Promise.all([
      Preferences.remove({ key: 'auth_token' }),
      Preferences.remove({ key: 'user' }),
    ]);
    setUser(null);
    setToken(null);
  };

  // --- Settings Methods ---
  const saveLanguage = async (lang) => {
    setLanguage(lang);
    await Preferences.set({ key: 'lang', value: lang });
  };

  const updateAudioSettings = async (audio, music) => {
    setAudioEnabled(audio);
    setMusicEnabled(music);
    
    // حفظ في Preferences
    await Promise.all([
      Preferences.set({ key: 'audio_enabled', value: audio ? 'true' : 'false' }),
      Preferences.set({ key: 'musicEnabled', value: music ? 'true' : 'false' })
    ]);

    // مزامنة مع localStorage
    localStorage.setItem('audio_enabled', audio ? 'true' : 'false');
    localStorage.setItem('musicEnabled', music ? 'true' : 'false');
    localStorage.setItem('audioConsent', audio ? 'true' : 'false');

    console.log('✅ Audio settings updated:', { audio, music });
  };

  const updateNotificationSettings = async (enabled) => {
    setNotificationsEnabled(enabled);
    await Preferences.set({ key: 'notificationsEnabled', value: enabled ? 'true' : 'false' });
    console.log('✅ Notification settings updated:', enabled);
  };

  // --- Combined Value ---
  const value = {
    // Auth
    user,
    token,
    isAuthenticated: !!user,
    isAuthLoading,
    login,
    logout,
    // Settings
    language,
    audioEnabled,
    musicEnabled,
    notificationsEnabled,
    isSettingsLoading,
    saveLanguage,
    updateAudioSettings,
    updateNotificationSettings,
    // Audio Control (for backward compatibility)
    startBgMusic: () => {
      // دالة فارغة للتوافق مع الصفحات القديمة
      // audioManager يدير الموسيقى تلقائياً
      console.log('startBgMusic called - audioManager handles this automatically');
    },
    // Combined Loading State
    isAppLoading: isAuthLoading || isSettingsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hook to use the AppContext ---
export const useApp = () => useContext(AppContext);
