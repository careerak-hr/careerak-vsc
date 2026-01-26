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
        const lang = await Preferences.get({ key: "lang" });
        const audio = await Preferences.get({ key: "audio_enabled" });
        const music = await Preferences.get({ key: "musicEnabled" });

        setLanguage(lang.value || "ar");
        setAudioEnabled(audio.value === "true");
        setMusicEnabled(music.value === "true");
      } catch (error) {
        console.warn("Preferences not available, using defaults", error);
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
