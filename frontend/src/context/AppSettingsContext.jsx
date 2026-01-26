import React, { createContext, useContext, useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";

const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState("ar");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Set a timeout to ensure loading doesn't take too long
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Settings load timeout')), 3000);
        });

        const settingsPromise = Promise.all([
          Preferences.get({ key: "lang" }),
          Preferences.get({ key: "audio_enabled" }),
          Preferences.get({ key: "musicEnabled" })
        ]);

        const [lang, audio, music] = await Promise.race([settingsPromise, timeoutPromise]);

        setLanguage(lang.value || "ar");
        setAudioEnabled(audio.value === "true");
        setMusicEnabled(music.value === "true");
      } catch (error) {
        console.warn("Preferences not available or timeout, using defaults", error);
        // Use defaults and mark as loaded
        setLanguage("ar");
        setAudioEnabled(false);
        setMusicEnabled(false);
      }
      setLoaded(true);
    };
    loadSettings();
  }, []);

  const saveLanguage = async (lang) => {
    setLanguage(lang);
    await Preferences.set({ key: "lang", value: lang });
  };

  const saveAudio = async (value) => {
    setAudioEnabled(value);
    await Preferences.set({ key: "audio_enabled", value: String(value) });
  };

  const saveMusic = async (value) => {
    setMusicEnabled(value);
    await Preferences.set({ key: "musicEnabled", value: String(value) });
  };

  return (
    <AppSettingsContext.Provider
      value={{
        language,
        audioEnabled,
        musicEnabled,
        saveLanguage,
        saveAudio,
        saveMusic,
        loaded
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppSettingsContext);
