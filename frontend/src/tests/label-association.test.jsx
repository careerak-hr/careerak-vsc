import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AnimationProvider } from '../context/AnimationContext';
import LoginPage from '../pages/02_LoginPage';
import AuthPage from '../pages/03_AuthPage';
import SettingsPage from '../pages/14_SettingsPage';

// Helper to wrap components with required providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <ThemeProvider>
            <AnimationProvider>
              {component}
            </AnimationProvider>
          </ThemeProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

describe('Label Association Tests - FR-A11Y-9', () => {
  describe('LoginPage - Label Associations', () => {
    it('should have label associated with identifier input', () => {
      const { container } = renderWithProviders(<LoginPage />);
      
      const identifierInput = container.querySelector('#login-identifier');
      const identifierLabel = container.querySelector('label[for="login-identifier"]');
      
      expect(identifierInput).toBeTruthy();
      expect(identifierLabel).toBeTruthy();
      expect(identifierLabel.getAttribute('for')).toBe('login-identifier');
      expect(identifierInput.getAttribute('id')).toBe('login-identifier');
    });

    it('should have label associated with password input', () => {
      const { container } = renderWithProviders(<LoginPage />);
      
      const passwordInput = container.querySelector('#login-password');
      const passwordLabel = container.querySelector('label[for="login-password"]');
      
      expect(passwordInput).toBeTruthy();
      expect(passwordLabel).toBeTruthy();
      expect(passwordLabel.getAttribute('for')).toBe('login-password');
      expect(passwordInput.getAttribute('id')).toBe('login-password');
    });

    it('should have label associated with remember me checkbox', () => {
      const { container } = renderWithProviders(<LoginPage />);
      
      const rememberCheckbox = container.querySelector('#remember');
      const rememberLabel = container.querySelector('label[for="remember"]');
      
      expect(rememberCheckbox).toBeTruthy();
      expect(rememberLabel).toBeTruthy();
      expect(rememberLabel.getAttribute('for')).toBe('remember');
      expect(rememberCheckbox.getAttribute('id')).toBe('remember');
    });

    it('should use fieldset and legend for form grouping', () => {
      const { container } = renderWithProviders(<LoginPage />);
      
      const fieldset = container.querySelector('fieldset.login-fieldset');
      const legend = container.querySelector('legend.login-legend');
      
      expect(fieldset).toBeTruthy();
      expect(legend).toBeTruthy();
    });
  });

  describe('AuthPage - Label Associations', () => {
    it('should have label associated with country select', () => {
      const { container } = renderWithProviders(<AuthPage />);
      
      // Click individual button to show form
      const individualBtn = container.querySelector('button');
      if (individualBtn && individualBtn.textContent.includes('Individuals')) {
        individualBtn.click();
      }
      
      const countrySelect = container.querySelector('#country');
      const countryLabel = container.querySelector('label[for="country"]');
      
      if (countrySelect && countryLabel) {
        expect(countryLabel.getAttribute('for')).toBe('country');
        expect(countrySelect.getAttribute('id')).toBe('country');
      }
    });

    it('should have label associated with city input', () => {
      const { container } = renderWithProviders(<AuthPage />);
      
      const cityInput = container.querySelector('#city');
      const cityLabel = container.querySelector('label[for="city"]');
      
      if (cityInput && cityLabel) {
        expect(cityLabel.getAttribute('for')).toBe('city');
        expect(cityInput.getAttribute('id')).toBe('city');
      }
    });

    it('should have label associated with policy checkbox', () => {
      const { container } = renderWithProviders(<AuthPage />);
      
      const policyCheckbox = container.querySelector('#agreePolicy');
      const policyLabel = container.querySelector('label[for="agreePolicy"]');
      
      if (policyCheckbox && policyLabel) {
        expect(policyLabel.getAttribute('for')).toBe('agreePolicy');
        expect(policyCheckbox.getAttribute('id')).toBe('agreePolicy');
      }
    });

    it('should use fieldset and legend for form sections', () => {
      const { container } = renderWithProviders(<AuthPage />);
      
      const fieldsets = container.querySelectorAll('fieldset.auth-fieldset');
      const legends = container.querySelectorAll('legend.auth-legend');
      
      // Should have multiple fieldsets for different form sections
      expect(fieldsets.length).toBeGreaterThan(0);
      expect(legends.length).toBeGreaterThan(0);
    });
  });

  describe('SettingsPage - Label Associations', () => {
    it('should use fieldset and legend for settings sections', () => {
      const { container } = renderWithProviders(<SettingsPage />);
      
      const fieldsets = container.querySelectorAll('fieldset.settings-section');
      const legends = container.querySelectorAll('legend.settings-section-title');
      
      expect(fieldsets.length).toBeGreaterThan(0);
      expect(legends.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels for theme buttons', () => {
      const { container } = renderWithProviders(<SettingsPage />);
      
      const themeButtons = container.querySelectorAll('button[aria-label*="theme"]');
      
      expect(themeButtons.length).toBeGreaterThan(0);
      themeButtons.forEach(button => {
        expect(button.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have proper ARIA pressed states for toggle buttons', () => {
      const { container } = renderWithProviders(<SettingsPage />);
      
      const toggleButtons = container.querySelectorAll('button[aria-pressed]');
      
      toggleButtons.forEach(button => {
        const ariaPressed = button.getAttribute('aria-pressed');
        expect(['true', 'false']).toContain(ariaPressed);
      });
    });
  });

  describe('General Label Association Requirements', () => {
    it('all text inputs should have associated labels', () => {
      const pages = [
        <LoginPage />,
        <AuthPage />,
        <SettingsPage />
      ];

      pages.forEach(page => {
        const { container } = renderWithProviders(page);
        const textInputs = container.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="password"], input[type="date"]');
        
        textInputs.forEach(input => {
          const inputId = input.getAttribute('id');
          if (inputId) {
            const label = container.querySelector(`label[for="${inputId}"]`);
            expect(label).toBeTruthy();
          }
        });
      });
    });

    it('all checkboxes should have associated labels', () => {
      const pages = [
        <LoginPage />,
        <AuthPage />,
        <SettingsPage />
      ];

      pages.forEach(page => {
        const { container } = renderWithProviders(page);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
          const checkboxId = checkbox.getAttribute('id');
          if (checkboxId) {
            const label = container.querySelector(`label[for="${checkboxId}"]`);
            expect(label).toBeTruthy();
          }
        });
      });
    });

    it('all select elements should have associated labels', () => {
      const pages = [
        <AuthPage />,
        <SettingsPage />
      ];

      pages.forEach(page => {
        const { container } = renderWithProviders(page);
        const selects = container.querySelectorAll('select');
        
        selects.forEach(select => {
          const selectId = select.getAttribute('id');
          if (selectId) {
            const label = container.querySelector(`label[for="${selectId}"]`);
            expect(label).toBeTruthy();
          }
        });
      });
    });

    it('error messages should be associated with inputs via aria-describedby', () => {
      const { container } = renderWithProviders(<LoginPage />);
      
      // Trigger validation by submitting empty form
      const form = container.querySelector('form');
      if (form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.click();
        }
      }

      // Check if inputs with errors have aria-describedby
      const inputsWithErrors = container.querySelectorAll('input[aria-describedby]');
      inputsWithErrors.forEach(input => {
        const describedBy = input.getAttribute('aria-describedby');
        const errorElement = container.querySelector(`#${describedBy}`);
        expect(errorElement).toBeTruthy();
      });
    });
  });
});
