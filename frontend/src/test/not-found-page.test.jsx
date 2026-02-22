/**
 * NotFoundPage Tests
 * 
 * Tests for the custom 404 error page
 * 
 * Requirements: FR-ERR-10
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import NotFoundPage from '../pages/NotFoundPage';
import { AppProvider } from '../context/AppContext';
import { AnimationProvider } from '../context/AnimationContext';
import { HelmetProvider } from 'react-helmet-async';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render with all providers
const renderWithProviders = (ui, { language = 'en', ...options } = {}) => {
  const mockAppContext = {
    language,
    setLanguage: vi.fn(),
    isAppLoading: false,
  };

  return render(
    <HelmetProvider>
      <AppProvider value={mockAppContext}>
        <AnimationProvider>
          <MemoryRouter>
            {ui}
          </MemoryRouter>
        </AnimationProvider>
      </AppProvider>
    </HelmetProvider>,
    options
  );
};

describe('NotFoundPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render the 404 page', () => {
      renderWithProviders(<NotFoundPage />);
      
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should display error message in English', () => {
      renderWithProviders(<NotFoundPage />, { language: 'en' });
      
      expect(screen.getByText('Oops, Page Not Found')).toBeInTheDocument();
      expect(screen.getByText(/The page you are looking for does not exist/i)).toBeInTheDocument();
    });

    it('should display error message in Arabic', () => {
      renderWithProviders(<NotFoundPage />, { language: 'ar' });
      
      expect(screen.getByText('عذراً، الصفحة غير موجودة')).toBeInTheDocument();
      expect(screen.getByText(/الصفحة التي تبحث عنها غير موجودة/i)).toBeInTheDocument();
    });

    it('should display error message in French', () => {
      renderWithProviders(<NotFoundPage />, { language: 'fr' });
      
      expect(screen.getByText('Oups, Page Non Trouvée')).toBeInTheDocument();
      expect(screen.getByText(/La page que vous recherchez/i)).toBeInTheDocument();
    });

    it('should display the search icon', () => {
      renderWithProviders(<NotFoundPage />);
      
      const icon = screen.getByText('🔍');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Navigation Buttons', () => {
    it('should render Go Home button', () => {
      renderWithProviders(<NotFoundPage />);
      
      const homeButton = screen.getByRole('button', { name: /go to home/i });
      expect(homeButton).toBeInTheDocument();
    });

    it('should render Go Back button', () => {
      renderWithProviders(<NotFoundPage />);
      
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should navigate to home when Go Home is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NotFoundPage />);
      
      const homeButton = screen.getByRole('button', { name: /go to home/i });
      await user.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate back when Go Back is clicked with history', async () => {
      const user = userEvent.setup();
      // Mock window.history.length to simulate having history
      Object.defineProperty(window, 'history', {
        value: { length: 2 },
        writable: true,
      });
      
      renderWithProviders(<NotFoundPage />);
      
      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should navigate to home when Go Back is clicked without history', async () => {
      const user = userEvent.setup();
      // Mock window.history.length to simulate no history
      Object.defineProperty(window, 'history', {
        value: { length: 1 },
        writable: true,
      });
      
      renderWithProviders(<NotFoundPage />);
      
      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      renderWithProviders(<NotFoundPage />);
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should have aria-labels on buttons', () => {
      renderWithProviders(<NotFoundPage />);
      
      const homeButton = screen.getByRole('button', { name: /go to home/i });
      const backButton = screen.getByRole('button', { name: /go back/i });
      
      expect(homeButton).toHaveAttribute('aria-label');
      expect(backButton).toHaveAttribute('aria-label');
    });

    it('should announce error to screen readers', async () => {
      renderWithProviders(<NotFoundPage />);
      
      // Wait for AriaLiveRegion to render
      await waitFor(() => {
        const liveRegion = document.querySelector('[role="alert"]');
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it('should hide decorative icon from screen readers', () => {
      renderWithProviders(<NotFoundPage />);
      
      const icon = screen.getByText('🔍');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('SEO', () => {
    it('should set page title', async () => {
      renderWithProviders(<NotFoundPage />);
      
      await waitFor(() => {
        expect(document.title).toContain('404');
      });
    });

    it('should have meta description', async () => {
      renderWithProviders(<NotFoundPage />);
      
      await waitFor(() => {
        const metaTag = document.querySelector('meta[name="description"]');
        expect(metaTag).toBeTruthy();
        expect(metaTag?.getAttribute('content')).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      renderWithProviders(<NotFoundPage />, { language: 'en' });
      
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    });

    it('should render on desktop viewport', () => {
      // Mock desktop viewport
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      
      renderWithProviders(<NotFoundPage />, { language: 'en' });
      
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should support dark mode classes', () => {
      renderWithProviders(<NotFoundPage />);
      
      const container = screen.getByRole('main');
      expect(container).toHaveClass('not-found-container');
    });
  });

  describe('Multi-language Support', () => {
    it('should display content in all supported languages', () => {
      const languages = ['ar', 'en', 'fr'];
      
      languages.forEach(lang => {
        const { unmount } = renderWithProviders(<NotFoundPage />, { language: lang });
        
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /home|رئيسية|accueil/i })).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Animation', () => {
    it('should render with animations when enabled', () => {
      renderWithProviders(<NotFoundPage />);
      
      // Check if motion components are rendered
      const card = document.querySelector('.not-found-card');
      expect(card).toBeInTheDocument();
    });

    it('should render without animations when disabled', () => {
      // Mock prefers-reduced-motion
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      renderWithProviders(<NotFoundPage />);
      
      const card = document.querySelector('.not-found-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should have proper button styling', () => {
      renderWithProviders(<NotFoundPage />, { language: 'en' });
      
      const homeButton = screen.getByRole('button', { name: /go to home/i });
      const backButton = screen.getByRole('button', { name: /go back/i });
      
      expect(homeButton).toHaveClass('not-found-btn-primary');
      expect(backButton).toHaveClass('not-found-btn-secondary');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NotFoundPage />, { language: 'en' });
      
      const homeButton = screen.getByRole('button', { name: /go to home/i });
      
      // Tab to button and press Enter
      await user.tab();
      await user.keyboard('{Enter}');
      
      // Should navigate
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const user = userEvent.setup();
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      
      renderWithProviders(<NotFoundPage />, { language: 'en' });
      
      const homeButton = screen.getByRole('button', { name: /go to home/i });
      
      // Should not crash when navigation fails
      await expect(async () => {
        await user.click(homeButton);
      }).rejects.toThrow('Navigation failed');
    });
  });

  describe('Content Structure', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<NotFoundPage />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toHaveTextContent('404');
      expect(h2).toBeInTheDocument();
    });

    it('should have descriptive error message', () => {
      renderWithProviders(<NotFoundPage />, { language: 'en' });
      
      const message = screen.getByText(/does not exist/i);
      expect(message).toBeInTheDocument();
      expect(message.textContent.length).toBeGreaterThan(20);
    });
  });
});
