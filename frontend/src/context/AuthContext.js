
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { App } from "@capacitor/app";
import CryptoJS from 'crypto-js';

const AuthContext = createContext();
const SECRET_KEY = 'careerak_secure_key_2024';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [language, setLanguage] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(null);
  const [canStartMusic, setCanStartMusic] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  // Effect to load initial localStorage from storage
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const lang = localStorage.getItem('lang');
        const audio = localStorage.getItem("audio_enabled");
        const encryptedToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem('user');
        const audioConsent = localStorage.getItem('audioConsent');
        // eslint-disable-next-line no-unused-vars
        const musicEnabled = localStorage.getItem('musicEnabled');

        // تحديد اللغة
        if (lang) {
          setLanguage(lang);
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
          
          // تطبيق الخط المناسب حسب اللغة
          const fontFamily = lang === 'ar' ? "'Amiri', 'Cairo', serif" :
                            lang === 'en' ? "'Cormorant Garamond', serif" :
                            "'EB Garamond', serif";
          
          document.body.style.fontFamily = fontFamily;
        } else {
          // Default to 'ar' if no language is set
          setLanguage('ar');
          document.documentElement.lang = 'ar';
          document.documentElement.dir = 'rtl';
          document.body.style.fontFamily = "'Amiri', 'Cairo', serif";
        }

        // تحديد إعدادات الصوت
        if (audioConsent !== null) {
          setAudioEnabled(audioConsent === 'true');
        } else if (audio !== null) {
          setAudioEnabled(audio === 'true');
        } else {
          // Default to true if no audio setting is found
          setAudioEnabled(true);
        }

        // استرجاع التوكن المشفر
        if (encryptedToken) {
          try {
            const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
            const originalToken = bytes.toString(CryptoJS.enc.Utf8);
            if (originalToken) setToken(originalToken);
          } catch (e) {
            console.error("Token decryption failed", e);
          }
        }

        // استرجاع بيانات المستخدم
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }

      } catch (error) {
        console.error("Error loading prefs", error);
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, []);

  // Effect to manage music playback state (pause/resume) and app backgrounding
  useEffect(() => {
    const handleAppState = (state) => {
      if (!audioRef.current) return;
      if (state.isActive && audioEnabled && canStartMusic) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    };

    const listener = App.addListener('appStateChange', handleAppState);

    // This part handles pausing/resuming when user toggles the setting
    if (audioRef.current) {
        if (audioEnabled && canStartMusic) {
            audioRef.current.play().catch(e => console.log("Audio resume failed", e));
        } else {
            audioRef.current.pause();
        }
    }

    return () => {
      listener.then(l => l.remove());
    };
  }, [audioEnabled, canStartMusic]);

  const login = async (userData, rawToken) => {
    const encryptedToken = CryptoJS.AES.encrypt(rawToken, SECRET_KEY).toString();
    localStorage.setItem('auth_token', encryptedToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(rawToken);

    // --- Music Start Logic ---
    if (audioEnabled) {
      // إيقاف أي موسيقى موجودة أولاً
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      console.log("Creating and playing background music for the first time.");
      audioRef.current = new Audio('/Music.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.error("Background music play failed on login:", e));
    }
    // --- End Music Logic ---

    setCanStartMusic(true); // Signal that music is now managed
  };

  const logout = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setCanStartMusic(false); // Signal that music should stop
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateLanguage = async (lang) => {
    localStorage.setItem("lang", lang);
    setLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    
    // تطبيق الخط المناسب حسب اللغة
    const fontFamily = lang === 'ar' ? "'Amiri', 'Cairo', serif" :
                      lang === 'en' ? "'Cormorant Garamond', serif" :
                      "'EB Garamond', serif";
    
    document.body.style.fontFamily = fontFamily;
  };

  const setAudio = async (enabled) => {
    localStorage.setItem("audio_enabled", enabled ? "true" : "false");
    setAudioEnabled(enabled);
  };

  // Deprecated - can be removed later
  const startBgMusic = () => {
    setCanStartMusic(true);
    // تشغيل الموسيقى فوراً إذا كانت متاحة
    if (audioEnabled && !audioRef.current) {
      console.log("Starting background music manually");
      audioRef.current = new Audio('/Music.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.error("Manual background music play failed:", e));
    } else if (audioEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Resume background music failed:", e));
    }
  };
  
  const stopBgMusic = () => {
    setCanStartMusic(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
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
        startBgMusic,
        stopBgMusic
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
