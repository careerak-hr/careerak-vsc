
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Preferences } from "@capacitor/preferences";
import { App } from "@capacitor/app";
import CryptoJS from 'crypto-js';

const AuthContext = createContext();
const SECRET_KEY = 'careerak_secure_key_2024';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [language, setLanguage] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(null);
  const [canStartMusic, setCanStartMusic] = useState(false); // مفتاح بدء موسيقى الخلفية
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const { value: lang } = await Preferences.get({ key: "lang" });
        const { value: audio } = await Preferences.get({ key: "audio_enabled" });
        const { value: encryptedToken } = await Preferences.get({ key: "auth_token" });
        const savedUser = localStorage.getItem('user');

        if (lang) {
          setLanguage(lang);
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        }

        if (encryptedToken) {
          try {
            const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
            const originalToken = bytes.toString(CryptoJS.enc.Utf8);
            if (originalToken) setToken(originalToken);
          } catch (e) {
            console.error("Token decryption failed", e);
          }
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        setAudioEnabled(audio === "true");
      } catch (error) {
        console.error("Error loading prefs", error);
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, []);

  // إدارة الموسيقى العالمية (Music.mp3)
  useEffect(() => {
    console.log("AuthContext music useEffect, audioEnabled:", audioEnabled, "canStartMusic:", canStartMusic, "loading:", loading);
    // الموسيقى تعمل فقط إذا كان الصوت مفعلاً وتم إعطاء الإشارة بالبدء (من صفحة تسجيل الدخول)
    if (audioEnabled && canStartMusic && !loading) {
      console.log("Playing Music.mp3");
      if (!audioRef.current) {
        audioRef.current = new Audio('/Music.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;
      }
      audioRef.current.play().catch(e => console.log("Background music play failed:", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    // مراقبة حالة التطبيق (Home, Lock, Background) لإيقاف الموسيقى فوراً
    const handleAppState = (state) => {
      if (!audioRef.current || !audioEnabled || !canStartMusic) return;
      if (state.isActive) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    };

    const listener = App.addListener('appStateChange', handleAppState);
    
    return () => {
      listener.then(l => l.remove());
    };
  }, [audioEnabled, canStartMusic, loading]);

  const login = async (userData, rawToken) => {
    const encryptedToken = CryptoJS.AES.encrypt(rawToken, SECRET_KEY).toString();
    await Preferences.set({ key: 'auth_token', value: encryptedToken });
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(rawToken);
    setCanStartMusic(true); // تفعيل الموسيقى عند تسجيل الدخول
  };

  const startBgMusic = () => {
    console.log("startBgMusic called");
    setCanStartMusic(true);
  };

  const stopBgMusic = () => {
    setCanStartMusic(false);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await Preferences.remove({ key: 'auth_token' });
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setCanStartMusic(false);
  };

  const updateLanguage = async (lang) => {
    await Preferences.set({ key: "lang", value: lang });
    setLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const setAudio = async (enabled) => {
    await Preferences.set({
      key: "audio_enabled",
      value: enabled ? "true" : "false",
    });
    setAudioEnabled(enabled);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        language,
        audioEnabled,
        loading,
        login,
        updateUser,
        logout,
        setLanguage: updateLanguage,
        setAudio,
        startBgMusic, // دالة لبدء موسيقى الخلفية
        stopBgMusic  // دالة لإيقاف موسيقى الخلفية
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
