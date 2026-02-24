import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackThemeChange, initDarkModeTracking } from '../utils/darkModeTracking';

/**
 * ThemeContext - Manages dark mode state and system preference detection
 * 
 * Features:
 * - isDark: Boolean state for current theme
 * - toggleTheme: Function to switch between light/dark/system
 * - systemPreference: Detected system dark mode preference
 * - Persists preference in localStorage ('careerak-theme')
 * - Syncs with backend API for authenticated users
 * - Detects system preference using matchMedia
 * - Tracks dark mode adoption metrics
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

  // Track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  });

  // Initialize dark mode tracking on mount
  useEffect(() => {
    initDarkModeTracking();
  }, []);

  // Sync theme with backend on mount if authenticated
  useEffect(() => {
    const syncThemeWithBackend = async () => {
      if (!isAuthenticated) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const backendTheme = data.preferences?.theme;
          
          // If backend has a theme preference, use it
          if (backendTheme && ['light', 'dark', 'system'].includes(backendTheme)) {
            const localTheme = localStorage.getItem('careerak-theme');
            
            // Only update if different from local storage
            if (localTheme !== backendTheme) {
              setThemeMode(backendTheme);
              localStorage.setItem('careerak-theme', backendTheme);
            }
          }
        }
      } catch (error) {
        console.error('Failed to sync theme with backend:', error);
      }
    };

    syncThemeWithBackend();
  }, [isAuthenticated]);

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
   * Sync theme preference with backend API
   * @param {string} mode - 'light' | 'dark' | 'system'
   */
  const syncWithBackend = async (mode) => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ theme: mode })
      });
    } catch (error) {
      console.error('Failed to sync theme with backend:', error);
    }
  };

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

      // Track theme change
      const newIsDark = newMode === 'system' ? systemPreference : newMode === 'dark';
      trackThemeChange(prevMode, newMode, newIsDark);

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('careerak-theme', newMode);
      }

      // Sync with backend if authenticated
      syncWithBackend(newMode);

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

    const prevMode = themeMode;
    setThemeMode(mode);

    // Track theme change
    const newIsDark = mode === 'system' ? systemPreference : mode === 'dark';
    trackThemeChange(prevMode, mode, newIsDark);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('careerak-theme', mode);
    }

    // Sync with backend if authenticated
    syncWithBackend(mode);
  };

  const value = {
    isDark,
    themeMode,
    systemPreference,
    toggleTheme,
    setTheme,
    isAuthenticated,
    setIsAuthenticated,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * @returns {Object} { isDark, themeMode, systemPreference, toggleTheme, setTheme, isAuthenticated, setIsAuthenticated }
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
