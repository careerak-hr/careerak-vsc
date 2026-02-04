import React, { createContext, useContext, useEffect, useState } from "react";
import CryptoJS from 'crypto-js';

const AuthContext = createContext(null);
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'careerak_secure_key_2024';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [language, setLanguage] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect to load initial localStorage from storage
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const lang = localStorage.getItem('lang');
        const audio = localStorage.getItem("audio_enabled");
        const encryptedToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem('user');
        const audioConsent = localStorage.getItem('audioConsent');

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

  const login = async (userData, rawToken) => {
    const encryptedToken = CryptoJS.AES.encrypt(rawToken, SECRET_KEY).toString();
    localStorage.setItem('auth_token', encryptedToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(rawToken);

    console.log("✅ User logged in successfully");
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);

    console.log("✅ User logged out successfully");
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
        setAudio
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
