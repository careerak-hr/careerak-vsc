
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
        const lang = await localStorage.getItem('lang');
        const { value: audio } = await localStorage.getitem({ key: "audio_enabled" });
        const { value: encryptedToken } = await localStorage.getitem({ key: "auth_token" });
        const savedUser = localStorage.getItem('user');
        const { value: audioConsent } = await localStorage.getitem({ key: 'audioConsent' });
        setAudioEnabled(audioConsent === 'true');

        if (lang) {
          setLanguage(lang);
          document.documentElement.lang = lang;
          document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        } else {
            // Default to 'ar' if no language is set
            setLanguage('ar');
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
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
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }

        // Default to true if audio setting is not found
        setAudioEnabled(audio === null ? true : audio === "true");

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
    await localStorage.setItem('auth_token', encryptedToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(rawToken);

    // --- Music Start Logic ---
    if (audioEnabled) {
      if (!audioRef.current) {
        console.log("Creating and playing background music for the first time.");
        audioRef.current = new Audio('/Music.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;
      }
      audioRef.current.play().catch(e => console.error("Background music play failed on login:", e));
    }
    // --- End Music Logic ---

    setCanStartMusic(true); // Signal that music is now managed
  };

  const logout = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    await localStorage.removeItem('auth_token');
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
    await localStorage.setitem({ key: "lang", value: lang });
    setLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const setAudio = async (enabled) => {
    await localStorage.setitem({
      key: "audio_enabled",
      value: enabled ? "true" : "false",
    });
    setAudioEnabled(enabled);
  };

  // Deprecated - can be removed later
  const startBgMusic = () => setCanStartMusic(true);
  const stopBgMusic = () => setCanStartMusic(false);


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
