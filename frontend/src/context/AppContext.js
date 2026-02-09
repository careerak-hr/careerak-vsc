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
        // إضافة timeout للتأكد من عدم التعليق
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => {
            console.warn('⚠️ Settings loading timeout - using defaults');
            resolve([
              { value: 'ar' },
              { value: 'false' },
              { value: 'false' },
              { value: 'false' }
            ]);
          }, 3000)
        );

        const settingsPromise = Promise.all([
          Preferences.get({ key: 'lang' }),
          Preferences.get({ key: 'audio_enabled' }),
          Preferences.get({ key: 'musicEnabled' }),
          Preferences.get({ key: 'notificationsEnabled' }),
        ]);

        const [
          { value: lang },
          { value: audio },
          { value: music },
          { value: notifications },
        ] = await Promise.race([settingsPromise, timeoutPromise]);

        setLanguage(lang || 'ar');
        setAudioEnabled(audio === 'true');
        setMusicEnabled(music === 'true');
        setNotificationsEnabled(notifications === 'true');

      } catch (error) {
        console.warn('Failed to load settings from Preferences, using defaults.', error);
        // استخدام القيم الافتراضية
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
        // إضافة timeout للتأكد من عدم التعليق
        const timeoutPromise = new Promise((resolve) => 
          setTimeout(() => {
            console.warn('⚠️ Auth data loading timeout - continuing without auth');
            resolve([{ value: null }, { value: null }]);
          }, 3000)
        );

        const authPromise = Promise.all([
          Preferences.get({ key: 'auth_token' }),
          Preferences.get({ key: 'user' }),
        ]);

        const [{ value: encryptedToken }, { value: savedUser }] = await Promise.race([
          authPromise,
          timeoutPromise
        ]);

        if (encryptedToken) {
          const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
          const originalToken = bytes.toString(CryptoJS.enc.Utf8);
          if (originalToken) setToken(originalToken);
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
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
