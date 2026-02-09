import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import CryptoJS from 'crypto-js';

// --- Centralized App Context ---
const AppContext = createContext();

const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'careerak_secure_key_2024';

export const AppProvider = ({ children }) => {
  // --- State from AuthContext ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthLoading, setAuthLoading] = useState(true);

  // --- State from AppSettingsContext ---
  const [language, setLanguage] = useState('ar');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSettingsLoading, setSettingsLoading] = useState(true);

  // --- Effect to load App Settings ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('⚡ Fast settings load - using defaults');
        // استخدام القيم الافتراضية مباشرة
        setLanguage('ar');
        setAudioEnabled(false);
        setMusicEnabled(false);
        setNotificationsEnabled(false);
      } catch (error) {
        console.warn('Failed to load settings, using defaults.', error);
        setLanguage('ar');
        setAudioEnabled(false);
        setMusicEnabled(false);
        setNotificationsEnabled(false);
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
    const encryptedToken = CryptoJS.AES.encrypt(rawToken, SECRET_KEY).toString();
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
    // Combined Loading State
    isAppLoading: isAuthLoading || isSettingsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- Custom Hook to use the AppContext ---
export const useApp = () => useContext(AppContext);
