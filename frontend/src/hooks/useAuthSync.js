import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Custom hook to sync theme with backend when authentication state changes
 * 
 * Usage:
 * - Call this hook in your App component or after login/logout
 * - It will automatically sync theme preferences with the backend
 * 
 * @example
 * import { useAuthSync } from './hooks/useAuthSync';
 * 
 * function App() {
 *   useAuthSync();
 *   return <YourApp />;
 * }
 */
export const useAuthSync = () => {
  const { setIsAuthenticated, themeMode } = useTheme();

  useEffect(() => {
    // Check authentication status on mount and when storage changes
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (e.g., login/logout in another tab)
    window.addEventListener('storage', checkAuth);

    // Listen for custom auth events
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, [setIsAuthenticated]);

  // Sync theme with backend when authentication changes
  useEffect(() => {
    const syncThemeOnAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const backendTheme = data.preferences?.theme;
          
          // If backend has a theme preference different from current, update it
          if (backendTheme && backendTheme !== themeMode) {
            localStorage.setItem('careerak-theme', backendTheme);
            // Trigger a custom event to update theme
            window.dispatchEvent(new CustomEvent('theme-sync', { detail: { theme: backendTheme } }));
          }
        }
      } catch (error) {
        console.error('Failed to sync theme on auth:', error);
      }
    };

    syncThemeOnAuth();
  }, [themeMode]);
};

/**
 * Helper function to trigger auth change event
 * Call this after login or logout to sync theme
 * 
 * @example
 * import { triggerAuthChange } from './hooks/useAuthSync';
 * 
 * // After successful login
 * localStorage.setItem('token', token);
 * triggerAuthChange();
 * 
 * // After logout
 * localStorage.removeItem('token');
 * triggerAuthChange();
 */
export const triggerAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

export default useAuthSync;
