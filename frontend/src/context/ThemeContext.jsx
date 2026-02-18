import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeContext - Manages dark mode state and system preference detection
 * 
 * Features:
 * - isDark: Boolean state for current theme
 * - toggleTheme: Function to switch between light/dark/system
 * - systemPreference: Detected system dark mode preference
 * - Persists preference in localStorage ('careerak-theme')
 * - Detects system preference using matchMedia
 * 
 * Storage values: 'light' | 'dark' | 'system'
 */

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  // System preference detection
  const [systemPreference, setSystemPreference] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Initialize theme from localStorage or system preference
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('careerak-theme');
      return stored || 'system';
    }
    return 'system';
  });

  // Calculate isDark based on themeMode and systemPreference
  const [isDark, setIsDark] = useState(() => {
    if (themeMode === 'system') {
      return systemPreference;
    }
    return themeMode === 'dark';
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemPreference(e.matches);
      
      // If user is using system preference, update isDark
      if (themeMode === 'system') {
        setIsDark(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeMode]);

  // Update isDark when themeMode changes
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemPreference);
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemPreference]);

  // Apply dark class to document element
  useEffect(() => {
    if (typeof window !== 'undefined' && document.documentElement) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  /**
   * Toggle theme between light, dark, and system
   * Cycles: light → dark → system → light
   */
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      let newMode;
      
      if (prevMode === 'light') {
        newMode = 'dark';
      } else if (prevMode === 'dark') {
        newMode = 'system';
      } else {
        newMode = 'light';
      }

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('careerak-theme', newMode);
      }

      return newMode;
    });
  };

  /**
   * Set theme to a specific mode
   * @param {string} mode - 'light' | 'dark' | 'system'
   */
  const setTheme = (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) {
      console.warn(`Invalid theme mode: ${mode}. Using 'system' instead.`);
      mode = 'system';
    }

    setThemeMode(mode);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('careerak-theme', mode);
    }
  };

  const value = {
    isDark,
    themeMode,
    systemPreference,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * @returns {Object} { isDark, themeMode, systemPreference, toggleTheme, setTheme }
 * @throws {Error} If used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

export default ThemeContext;
