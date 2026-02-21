/**
 * Axe-core Automated Accessibility Testing
 * Task: 5.6.6 Run axe-core automated testing
 * Requirements: FR-A11Y-1 through FR-A11Y-12, NFR-A11Y-1 through NFR-A11Y-5
 * 
 * This test suite runs automated accessibility checks using axe-core
 * to validate WCAG 2.1 Level AA compliance across all major pages.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';

// Custom matcher for axe violations
expect.extend({
  toHaveNoViolations(results) {
    const { violations } = results;
    const pass = violations.length === 0;

    if (pass) {
      return {
        message: () => 'Expected to have accessibility violations, but none were found',
        pass: true,
      };
    }

    const violationMessages = violations.map((violation) => {
      const nodes = violation.nodes.map((node) => node.html).join('\n');
      return `${violation.id}: ${violation.description}\n${violation.help}\n${nodes}`;
    }).join('\n\n');

    return {
      message: () => `Expected no accessibility violations but found:\n\n${violationMessages}`,
      pass: false,
    };
  },
});

// Import pages to test
import LanguagePage from '../pages/00_LanguagePage';
import LoginPage from '../pages/02_LoginPage';
import AuthPage from '../pages/03_AuthPage';
import ProfilePage from '../pages/07_ProfilePage';
import JobPostingsPage from '../pages/09_JobPostingsPage';
import CoursesPage from '../pages/11_CoursesPage';
import SettingsPage from '../pages/14_SettingsPage';
import PolicyPage from '../pages/13_PolicyPage';

// Mock context providers
const mockAppContext = {
  language: 'en',
  setLanguage: () => {},
  fontFamily: 'Cormorant Garamond, serif',
  isRTL: false,
  user: {
    _id: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    role: 'job_seeker',
    profilePicture: 'https://via.placeholder.com/150',
    name: 'Test User',
  },
  setUser: () => {},
  logout: () => {},
};

// Mock useApp hook
vi.mock('../context/AppContext', () => ({
  useApp: () => mockAppContext,
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Helper function to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Axe-core Automated Accessibility Testing', () => {
  beforeEach(() => {
    // Clear any previous violations
    vi.clearAllMocks();
  });

  describe('Core Pages Accessibility', () => {
    it('LanguagePage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<LanguagePage />);
      const results = await axe(container, {
        rules: {
          // Configure rules for WCAG 2.1 Level AA
          'color-contrast': { enabled: true },
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'button-name': { enabled: true },
          'image-alt': { enabled: true },
          'label': { enabled: true },
          'link-name': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('LoginPage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<LoginPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('AuthPage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<AuthPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ProfilePage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<ProfilePage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('JobPostingsPage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<JobPostingsPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('CoursesPage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<CoursesPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('SettingsPage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<SettingsPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('PolicyPage should have no accessibility violations', async () => {
      const { container } = renderWithRouter(<PolicyPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA Compliance', () => {
    it('should validate color contrast ratios (4.5:1 for normal text)', async () => {
      const { container } = renderWithRouter(<LanguagePage />);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate ARIA attributes are used correctly', async () => {
      const { container } = renderWithRouter(<ProfilePage />);
      const results = await axe(container, {
        rules: {
          'aria-allowed-attr': { enabled: true },
          'aria-required-attr': { enabled: true },
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate all images have alt text', async () => {
      const { container } = renderWithRouter(<ProfilePage />);
      const results = await axe(container, {
        rules: {
          'image-alt': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate all form inputs have labels', async () => {
      const { container } = renderWithRouter(<LoginPage />);
      const results = await axe(container, {
        rules: {
          'label': { enabled: true },
          'label-title-only': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate all buttons have accessible names', async () => {
      const { container } = renderWithRouter(<JobPostingsPage />);
      const results = await axe(container, {
        rules: {
          'button-name': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate all links have accessible names', async () => {
      const { container } = renderWithRouter(<CoursesPage />);
      const results = await axe(container, {
        rules: {
          'link-name': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate proper heading hierarchy', async () => {
      const { container } = renderWithRouter(<ProfilePage />);
      const results = await axe(container, {
        rules: {
          'heading-order': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate landmark regions are present', async () => {
      const { container } = renderWithRouter(<JobPostingsPage />);
      const results = await axe(container, {
        rules: {
          'landmark-one-main': { enabled: true },
          'region': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation Accessibility', () => {
    it('should validate all interactive elements are keyboard accessible', async () => {
      const { container } = renderWithRouter(<SettingsPage />);
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true },
          'tabindex': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Accessibility', () => {
    it('should validate semantic HTML structure', async () => {
      const { container } = renderWithRouter(<ProfilePage />);
      const results = await axe(container, {
        rules: {
          'list': { enabled: true },
          'listitem': { enabled: true },
          'definition-list': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should validate live regions are properly configured', async () => {
      const { container } = renderWithRouter(<JobPostingsPage />);
      const results = await axe(container, {
        rules: {
          'aria-live-region-atomic': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dark Mode Accessibility', () => {
    it('should maintain accessibility in dark mode', async () => {
      // Add dark class to simulate dark mode
      document.documentElement.classList.add('dark');
      
      const { container } = renderWithRouter(<ProfilePage />);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      
      // Clean up
      document.documentElement.classList.remove('dark');
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Comprehensive Accessibility Audit', () => {
    it('should pass comprehensive accessibility audit on all pages', async () => {
      const pages = [
        <LanguagePage />,
        <LoginPage />,
        <AuthPage />,
        <ProfilePage />,
        <JobPostingsPage />,
        <CoursesPage />,
        <SettingsPage />,
        <PolicyPage />,
      ];

      for (const page of pages) {
        const { container } = renderWithRouter(page);
        const results = await axe(container, {
          // Run all WCAG 2.1 Level AA rules
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
          },
        });
        expect(results).toHaveNoViolations();
      }
    });
  });
});
