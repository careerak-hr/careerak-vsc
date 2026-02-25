import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardContainer from '../DashboardContainer';
import { AppContext } from '../../../context/AppContext';

// Mock pusherClient
vi.mock('../../../utils/pusherClient', () => ({
  default: {
    init: vi.fn().mockResolvedValue(true),
    subscribe: vi.fn().mockReturnValue({
      bind: vi.fn()
    }),
    unsubscribe: vi.fn()
  }
}));

// Mock fetch
global.fetch = vi.fn();

const mockAppContext = {
  language: 'en',
  isRTL: false
};

const renderWithContext = (component, contextValue = mockAppContext) => {
  return render(
    <AppContext.Provider value={contextValue}>
      {component}
    </AppContext.Provider>
  );
};

describe('DashboardContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  describe('Theme Switching', () => {
    test('should toggle theme from light to dark', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widgets: [],
          theme: 'light',
          sidebarCollapsed: false
        })
      });

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Find and click theme toggle button
      const themeToggle = screen.getByLabelText(/switch to dark mode/i);
      expect(themeToggle).toBeInTheDocument();

      // Mock save theme API call
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      fireEvent.click(themeToggle);

      // Check if theme attribute is set
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    test('should toggle theme from dark to light', async () => {
      // Mock successful API responses with dark theme
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widgets: [],
          theme: 'dark',
          sidebarCollapsed: false
        })
      });

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Wait for dark theme to be applied
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });

      // Find and click theme toggle button
      const themeToggle = screen.getByLabelText(/switch to light mode/i);
      
      // Mock save theme API call
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      fireEvent.click(themeToggle);

      // Check if theme attribute is set to light
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });
    });
  });

  describe('Edit Mode Toggle', () => {
    test('should toggle edit mode on and off', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widgets: [],
          theme: 'light',
          sidebarCollapsed: false
        })
      });

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Find edit mode toggle button
      const editToggle = screen.getByLabelText(/enter edit mode/i);
      expect(editToggle).toBeInTheDocument();

      // Click to enter edit mode
      fireEvent.click(editToggle);

      // Check if edit mode is active
      await waitFor(() => {
        const container = document.querySelector('.dashboard-container');
        expect(container.getAttribute('data-edit-mode')).toBe('true');
      });

      // Click again to exit edit mode
      const saveButton = screen.getByLabelText(/exit edit mode/i);
      fireEvent.click(saveButton);

      // Check if edit mode is inactive
      await waitFor(() => {
        const container = document.querySelector('.dashboard-container');
        expect(container.getAttribute('data-edit-mode')).toBe('false');
      });
    });

    test('should show reset button only in edit mode', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widgets: [],
          theme: 'light',
          sidebarCollapsed: false
        })
      });

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Reset button should not be visible initially
      expect(screen.queryByLabelText(/reset layout/i)).not.toBeInTheDocument();

      // Enter edit mode
      const editToggle = screen.getByLabelText(/enter edit mode/i);
      fireEvent.click(editToggle);

      // Reset button should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/reset layout/i)).toBeInTheDocument();
      });
    });
  });

  describe('RTL Layout for Arabic', () => {
    test('should apply RTL direction when language is Arabic', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widgets: [],
          theme: 'light',
          sidebarCollapsed: false
        })
      });

      const arabicContext = {
        language: 'ar',
        isRTL: true
      };

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>,
        arabicContext
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check if RTL direction is applied
      expect(document.documentElement.getAttribute('dir')).toBe('rtl');

      // Check if container has RTL class
      const container = document.querySelector('.dashboard-container');
      expect(container).toHaveClass('rtl');
    });

    test('should apply LTR direction when language is English', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widgets: [],
          theme: 'light',
          sidebarCollapsed: false
        })
      });

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check if LTR direction is applied
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');

      // Check if container has LTR class
      const container = document.querySelector('.dashboard-container');
      expect(container).toHaveClass('ltr');
    });

    test('should display Arabic text when language is Arabic', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widgets: [],
          theme: 'light',
          sidebarCollapsed: false
        })
      });

      const arabicContext = {
        language: 'ar',
        isRTL: true
      };

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>,
        arabicContext
      );

      await waitFor(() => {
        expect(screen.queryByText(/جاري التحميل/i)).not.toBeInTheDocument();
      });

      // Check if Arabic title is displayed
      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    test('should show loading state initially', () => {
      // Mock pending API response
      global.fetch.mockImplementation(() => new Promise(() => {}));

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>
      );

      // Check if loading state is displayed
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('should show error state when API fails', async () => {
      // Mock failed API response
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      renderWithContext(
        <DashboardContainer adminId="test-admin" role="admin">
          <div>Test Content</div>
        </DashboardContainer>
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
      });

      // Check if retry button is present
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });
});
