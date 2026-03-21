import React, { createContext, useContext, useEffect } from 'react';

/**
 * ThemeContext - Light mode only (dark mode disabled)
 * isDark is always false, toggleTheme and setTheme are no-ops.
 */

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  // Force light mode: remove 'dark' class and clear any stored preference
  useEffect(() => {
    if (typeof window !== 'undefined' && document.documentElement) {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('careerak-theme');
    }
  }, []);

  const value = {
    isDark: false,
    themeMode: 'light',
    systemPreference: false,
    toggleTheme: () => {},
    setTheme: () => {},
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
    setIsAuthenticated: () => {},
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
