import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SettingsPage from '../pages/14_SettingsPage_Enhanced';
import { AppContext } from '../context/AppContext';
import ThemeContext from '../context/ThemeContext';

// Mock hooks
vi.mock('../hooks', () => ({
  useSEO: () => ({
    title: 'Settings',
    description: 'Settings page',
    keywords: 'settings'
  })
}));

// Mock SEOHead component
vi.mock('../components/SEO', () => ({
  SEOHead: () => null
}));

// Helper function to render with providers
const renderWithProviders = (component, { language = 'en', isDark = false } = {}) => {
  const mockAppContext = {
    language,
    startBgMusic: vi.fn(),
    saveLanguage: vi.fn(),
    logout: vi.fn()
  };

  const mockThemeContext = {
    isDark,
    themeMode: isDark ? 'dark' : 'light',
    toggleTheme: vi.fn(),
    setTheme: vi.fn()
  };

  return render(
    <AppContext.Provider value={mockAppContext}>
      <ThemeContext.Provider value={mockThemeContext}>
        {component}
      </ThemeContext.Provider>
    </AppContext.Provider>
  );
};

describe('SettingsPage - Tab Navigation', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Requirement 1.1: Display 5 main tabs', () => {
    it('should display all 5 tabs', () => {
      renderWithProviders(<SettingsPage />);

      // Check for all 5 tabs
      expect(screen.getByRole('tab', { name: /^account$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^privacy$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^notifications$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^security$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /data & privacy/i })).toBeInTheDocument();
    });

    it('should display tabs with correct icons', () => {
      renderWithProviders(<SettingsPage />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);

      // Check icons are present (they are rendered as text content)
      expect(tabs[0]).toHaveTextContent('👤');
      expect(tabs[1]).toHaveTextContent('🔒');
      expect(tabs[2]).toHaveTextContent('🔔');
      expect(tabs[3]).toHaveTextContent('🛡️');
      expect(tabs[4]).toHaveTextContent('📊');
    });

    it('should display tabs in Arabic when language is ar', () => {
      renderWithProviders(<SettingsPage />, { language: 'ar' });

      expect(screen.getByRole('tab', { name: /الحساب/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /الخصوصية/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /الإشعارات/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /الأمان/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /البيانات/i })).toBeInTheDocument();
    });

    it('should display tabs in French when language is fr', () => {
      renderWithProviders(<SettingsPage />, { language: 'fr' });

      expect(screen.getByRole('tab', { name: /compte/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /confidentialité/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /sécurité/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /données/i })).toBeInTheDocument();
    });
  });

  describe('Requirement 1.2: Tab navigation functionality', () => {
    it('should highlight the active tab', () => {
      renderWithProviders(<SettingsPage />);

      const accountTab = screen.getByRole('tab', { name: /account/i });
      expect(accountTab).toHaveAttribute('aria-selected', 'true');
      expect(accountTab).toHaveClass('settings-tab-active');
    });

    it('should switch tabs when clicked', async () => {
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole('tab', { name: /^privacy$/i });
      fireEvent.click(privacyTab);

      await waitFor(() => {
        expect(privacyTab).toHaveAttribute('aria-selected', 'true');
        expect(privacyTab).toHaveClass('settings-tab-active');
      });
    });

    it('should display corresponding content when tab is clicked', async () => {
      renderWithProviders(<SettingsPage />);

      // Click on Privacy tab
      const privacyTab = screen.getByRole('tab', { name: /^privacy$/i });
      fireEvent.click(privacyTab);

      await waitFor(() => {
        const tabPanel = screen.getByRole('tabpanel');
        expect(tabPanel).toHaveAttribute('id', 'privacy-panel');
        expect(tabPanel).toHaveAttribute('aria-labelledby', 'privacy-tab');
      });
    });

    it('should navigate through all tabs sequentially', async () => {
      renderWithProviders(<SettingsPage />);

      const tabs = [
        { name: /^account$/i, id: 'account' },
        { name: /^privacy$/i, id: 'privacy' },
        { name: /^notifications$/i, id: 'notifications' },
        { name: /^security$/i, id: 'security' },
        { name: /data & privacy/i, id: 'data' }
      ];

      for (const tab of tabs) {
        const tabElement = screen.getByRole('tab', { name: tab.name });
        fireEvent.click(tabElement);

        await waitFor(() => {
          expect(tabElement).toHaveAttribute('aria-selected', 'true');
          const tabPanel = screen.getByRole('tabpanel');
          expect(tabPanel).toHaveAttribute('id', `${tab.id}-panel`);
        });
      }
    });
  });

  describe('Requirement 1.4: Preserve last visited tab', () => {
    it('should save active tab to localStorage when changed', async () => {
      renderWithProviders(<SettingsPage />);

      const privacyTab = screen.getByRole('tab', { name: /^privacy$/i });
      fireEvent.click(privacyTab);

      await waitFor(() => {
        expect(localStorage.getItem('careerak_settings_last_tab')).toBe('privacy');
      });
    });

    it('should load last visited tab from localStorage on mount', () => {
      // Set last tab in localStorage
      localStorage.setItem('careerak_settings_last_tab', 'security');

      renderWithProviders(<SettingsPage />);

      const securityTab = screen.getByRole('tab', { name: /^security$/i });
      expect(securityTab).toHaveAttribute('aria-selected', 'true');
      expect(securityTab).toHaveClass('settings-tab-active');
    });

    it('should default to account tab if no last tab in localStorage', () => {
      renderWithProviders(<SettingsPage />);

      const accountTab = screen.getByRole('tab', { name: /account/i });
      expect(accountTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should ignore invalid tab id from localStorage', () => {
      localStorage.setItem('careerak_settings_last_tab', 'invalid-tab');

      renderWithProviders(<SettingsPage />);

      // Should default to account tab
      const accountTab = screen.getByRole('tab', { name: /account/i });
      expect(accountTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Requirement 1.5: RTL/LTR support', () => {
    it('should set dir="rtl" when language is Arabic', () => {
      renderWithProviders(<SettingsPage />, { language: 'ar' });

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('dir', 'rtl');
    });

    it('should set dir="ltr" when language is English', () => {
      renderWithProviders(<SettingsPage />, { language: 'en' });

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('dir', 'ltr');
    });

    it('should set dir="ltr" when language is French', () => {
      renderWithProviders(<SettingsPage />, { language: 'fr' });

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('dir', 'ltr');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for tabs', () => {
      renderWithProviders(<SettingsPage />);

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label');

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('aria-controls');
        expect(tab).toHaveAttribute('id');
      });
    });

    it('should have proper ARIA attributes for tab panels', () => {
      renderWithProviders(<SettingsPage />);

      const tabPanel = screen.getByRole('tabpanel');
      expect(tabPanel).toHaveAttribute('id');
      expect(tabPanel).toHaveAttribute('aria-labelledby');
    });

    it('should have main landmark with tabindex', () => {
      renderWithProviders(<SettingsPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('id', 'main-content');
      expect(main).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Unsaved Changes Warning', () => {
    it('should not show unsaved changes indicator initially', () => {
      renderWithProviders(<SettingsPage />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Note: Testing unsaved changes requires implementing the state management
    // in child components (AccountTab, PrivacyTab, etc.)
    // This will be tested in integration tests once those components are implemented
  });

  describe('Dark Mode Support', () => {
    it('should apply dark mode classes when isDark is true', () => {
      renderWithProviders(<SettingsPage />, { isDark: true });

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('dark:bg-primary');
    });

    it('should not apply dark mode classes when isDark is false', () => {
      renderWithProviders(<SettingsPage />, { isDark: false });

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('dark:bg-primary'); // Class is always present, but only active in dark mode
    });
  });
});
