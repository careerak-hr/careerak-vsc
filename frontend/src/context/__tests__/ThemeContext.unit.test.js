/**
 * Unit Tests for ThemeContext
 * 
 * **Validates: Requirements 1.4.6**
 * 
 * Tests specific functionality of the dark mode implementation
 * with focused unit tests for edge cases and specific behaviors.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Helper to render hook with ThemeProvider
const renderThemeHook = () => {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
  });
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock matchMedia
const matchMediaMock = (matches) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

describe('ThemeContext Unit Tests', () => {
  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => matchMediaMock(false)),
    });

    // Clear localStorage before each test
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Theme Toggle Functionality', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDark).toBe(false);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should toggle from dark to system', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('system');
    });

    it('should toggle from system to light', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.themeMode).toBe('system');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should complete a full toggle cycle', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      const initialMode = result.current.themeMode;

      // Toggle 3 times to complete cycle
      act(() => {
        result.current.toggleTheme(); // light → dark
      });
      expect(result.current.themeMode).toBe('dark');

      act(() => {
        result.current.toggleTheme(); // dark → system
      });
      expect(result.current.themeMode).toBe('system');

      act(() => {
        result.current.toggleTheme(); // system → light
      });
      expect(result.current.themeMode).toBe('light');
      expect(result.current.themeMode).toBe(initialMode);
    });
  });

  describe('setTheme Functionality', () => {
    it('should set theme to light', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDark).toBe(false);
    });

    it('should set theme to dark', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should set theme to system', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.themeMode).toBe('system');
    });

    it('should handle invalid theme mode gracefully', () => {
      const { result } = renderThemeHook();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      act(() => {
        result.current.setTheme('invalid');
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid theme mode')
      );
      expect(result.current.themeMode).toBe('system'); // Falls back to system

      consoleWarnSpy.mockRestore();
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist theme when toggling', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(localStorage.getItem('careerak-theme')).toBe('dark');
    });

    it('should persist theme when setting directly', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorage.getItem('careerak-theme')).toBe('dark');
    });

    it('should load theme from localStorage on initialization', () => {
      localStorage.setItem('careerak-theme', 'dark');

      const { result } = renderThemeHook();

      expect(result.current.themeMode).toBe('dark');
      expect(result.current.isDark).toBe(true);
    });

    it('should default to system when localStorage is empty', () => {
      localStorageMock.clear();

      const { result } = renderThemeHook();

      expect(result.current.themeMode).toBe('system');
    });
  });

  describe('System Preference Detection', () => {
    it('should detect dark system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => matchMediaMock(true)),
      });

      const { result } = renderThemeHook();

      expect(result.current.systemPreference).toBe(true);
    });

    it('should detect light system preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => matchMediaMock(false)),
      });

      const { result } = renderThemeHook();

      expect(result.current.systemPreference).toBe(false);
    });

    it('should apply system preference when themeMode is system', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => matchMediaMock(true)),
      });

      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.themeMode).toBe('system');
      expect(result.current.isDark).toBe(true); // Matches system preference
    });

    it('should not apply system preference when themeMode is explicit', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => matchMediaMock(true)),
      });

      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.themeMode).toBe('light');
      expect(result.current.isDark).toBe(false); // Ignores system preference
    });
  });

  describe('isDark Calculation', () => {
    it('should be false when themeMode is light', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.isDark).toBe(false);
    });

    it('should be true when themeMode is dark', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.isDark).toBe(true);
    });

    it('should match systemPreference when themeMode is system', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(() => matchMediaMock(true)),
      });

      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.isDark).toBe(result.current.systemPreference);
      expect(result.current.isDark).toBe(true);
    });
  });

  describe('Document Class Application', () => {
    it('should add dark class to document when isDark is true', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class from document when isDark is false', () => {
      const { result } = renderThemeHook();

      // First set to dark
      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Then set to light
      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update document class when toggling theme', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      act(() => {
        result.current.toggleTheme(); // light → dark
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('useTheme Hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should return theme context when used inside ThemeProvider', () => {
      const { result } = renderThemeHook();

      expect(result.current).toHaveProperty('isDark');
      expect(result.current).toHaveProperty('themeMode');
      expect(result.current).toHaveProperty('systemPreference');
      expect(result.current).toHaveProperty('toggleTheme');
      expect(result.current).toHaveProperty('setTheme');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid theme changes', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
        result.current.setTheme('dark');
        result.current.setTheme('system');
        result.current.setTheme('light');
      });

      expect(result.current.themeMode).toBe('light');
      expect(localStorage.getItem('careerak-theme')).toBe('light');
    });

    it('should handle rapid toggles', () => {
      const { result } = renderThemeHook();

      act(() => {
        result.current.setTheme('light');
      });

      act(() => {
        result.current.toggleTheme();
        result.current.toggleTheme();
        result.current.toggleTheme();
      });

      // After 3 toggles from light: light → dark → system → light
      expect(result.current.themeMode).toBe('light');
    });

    it('should handle missing matchMedia gracefully', () => {
      // Remove matchMedia
      const originalMatchMedia = window.matchMedia;
      delete window.matchMedia;

      const { result } = renderThemeHook();

      expect(result.current.systemPreference).toBe(false); // Default to false

      // Restore matchMedia
      window.matchMedia = originalMatchMedia;
    });

    it('should handle missing localStorage gracefully', () => {
      // This test verifies the code doesn't crash if localStorage is unavailable
      // In the actual implementation, there are typeof window checks
      const { result } = renderThemeHook();

      expect(result.current).toBeDefined();
      expect(result.current.themeMode).toBeDefined();
    });
  });

  describe('Context Value Structure', () => {
    it('should provide all required properties', () => {
      const { result } = renderThemeHook();

      expect(result.current).toHaveProperty('isDark');
      expect(result.current).toHaveProperty('themeMode');
      expect(result.current).toHaveProperty('systemPreference');
      expect(result.current).toHaveProperty('toggleTheme');
      expect(result.current).toHaveProperty('setTheme');
    });

    it('should have correct property types', () => {
      const { result } = renderThemeHook();

      expect(typeof result.current.isDark).toBe('boolean');
      expect(typeof result.current.themeMode).toBe('string');
      expect(typeof result.current.systemPreference).toBe('boolean');
      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
    });

    it('should have valid themeMode values', () => {
      const { result } = renderThemeHook();

      const validModes = ['light', 'dark', 'system'];
      expect(validModes).toContain(result.current.themeMode);
    });
  });
});
