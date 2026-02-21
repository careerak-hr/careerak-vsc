import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ComponentErrorBoundary from './ComponentErrorBoundary';
import RouteErrorBoundary from './RouteErrorBoundary';
import errorBoundaryTranslations from '../../data/errorBoundaryTranslations.json';

/**
 * Task 7.5.5: Test error messages in all languages
 * 
 * Requirements:
 * - FR-ERR-2: Display user-friendly error messages in Arabic, English, or French
 * - Task 7.5.1: Add error messages in Arabic
 * - Task 7.5.2: Add error messages in English
 * - Task 7.5.3: Add error messages in French
 * - Task 7.5.4: Use i18n for error messages
 * 
 * This test suite verifies that:
 * 1. All three languages (ar, en, fr) have complete translations
 * 2. Error boundaries display correct messages for each language
 * 3. All required message keys are present in translations
 * 4. Messages are properly formatted and non-empty
 */

// Mock AppContext - will be overridden in specific tests
let mockLanguage = 'en';
let mockUser = null;

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    language: mockLanguage,
    user: mockUser,
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Helper to set mock language
const setMockLanguage = (lang) => {
  mockLanguage = lang;
};

// Helper to set mock user
const setMockUser = (user) => {
  mockUser = user;
};

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error for i18n');
};

describe('ErrorBoundary - Multi-Language Support (Task 7.5.5)', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Translation File Completeness', () => {
    const languages = ['ar', 'en', 'fr'];
    const errorTypes = ['componentError', 'routeError'];

    languages.forEach(lang => {
      describe(`${lang.toUpperCase()} translations`, () => {
        it(`should have translations for ${lang}`, () => {
          expect(errorBoundaryTranslations[lang]).toBeDefined();
        });

        errorTypes.forEach(errorType => {
          it(`should have ${errorType} translations in ${lang}`, () => {
            expect(errorBoundaryTranslations[lang][errorType]).toBeDefined();
          });

          it(`should have all required keys for ${errorType} in ${lang}`, () => {
            const translations = errorBoundaryTranslations[lang][errorType];
            
            // Common required keys
            expect(translations.title).toBeDefined();
            expect(translations.description).toBeDefined();
            expect(translations.retryButton).toBeDefined();
            expect(translations.detailsTitle).toBeDefined();
            expect(translations.errorLabel).toBeDefined();
            expect(translations.timestampLabel).toBeDefined();

            // Type-specific keys
            if (errorType === 'componentError') {
              expect(translations.retryingMessage).toBeDefined();
              expect(translations.componentLabel).toBeDefined();
              expect(translations.retryCountLabel).toBeDefined();
            } else if (errorType === 'routeError') {
              expect(translations.homeButton).toBeDefined();
              expect(translations.stackLabel).toBeDefined();
            }
          });

          it(`should have non-empty messages for ${errorType} in ${lang}`, () => {
            const translations = errorBoundaryTranslations[lang][errorType];
            
            Object.entries(translations).forEach(([key, value]) => {
              expect(value).toBeTruthy();
              expect(value.length).toBeGreaterThan(0);
            });
          });
        });
      });
    });
  });

  describe('ComponentErrorBoundary - Language Support', () => {
    const testLanguages = [
      {
        code: 'ar',
        name: 'Arabic',
        expectedTitle: 'حدث خطأ في هذا المكون',
        expectedDescription: 'عذراً، حدث خطأ أثناء تحميل هذا الجزء من الصفحة.',
        expectedRetryButton: 'إعادة المحاولة',
      },
      {
        code: 'en',
        name: 'English',
        expectedTitle: 'An error occurred in this component',
        expectedDescription: 'Sorry, an error occurred while loading this part of the page.',
        expectedRetryButton: 'Retry',
      },
      {
        code: 'fr',
        name: 'French',
        expectedTitle: "Une erreur s'est produite dans ce composant",
        expectedDescription: "Désolé, une erreur s'est produite lors du chargement de cette partie de la page.",
        expectedRetryButton: 'Réessayer',
      },
    ];

    testLanguages.forEach(({ code, name, expectedTitle, expectedDescription, expectedRetryButton }) => {
      describe(`${name} (${code})`, () => {
        beforeEach(() => {
          // Set mock language for this test
          setMockLanguage(code);
          setMockUser(null);
        });

        it(`should display error title in ${name}`, () => {
          render(
            <ComponentErrorBoundary componentName="TestComponent">
              <ThrowError />
            </ComponentErrorBoundary>
          );

          expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        });

        it(`should display error description in ${name}`, () => {
          render(
            <ComponentErrorBoundary componentName="TestComponent">
              <ThrowError />
            </ComponentErrorBoundary>
          );

          expect(screen.getByText(expectedDescription)).toBeInTheDocument();
        });

        it(`should display retry button in ${name}`, () => {
          render(
            <ComponentErrorBoundary componentName="TestComponent">
              <ThrowError />
            </ComponentErrorBoundary>
          );

          const retryButton = screen.getByRole('button', { name: expectedRetryButton });
          expect(retryButton).toBeInTheDocument();
          expect(retryButton.textContent).toBe(expectedRetryButton);
        });

        it(`should have correct aria-label in ${name}`, () => {
          render(
            <ComponentErrorBoundary componentName="TestComponent">
              <ThrowError />
            </ComponentErrorBoundary>
          );

          const retryButton = screen.getByRole('button', { name: expectedRetryButton });
          expect(retryButton).toHaveAttribute('aria-label', expectedRetryButton);
        });
      });
    });
  });

  describe('RouteErrorBoundary - Language Support', () => {
    const testLanguages = [
      {
        code: 'ar',
        name: 'Arabic',
        expectedTitle: 'عذراً، حدث خطأ غير متوقع',
        expectedDescription: 'نعتذر عن هذا الإزعاج. حدث خطأ أثناء تحميل الصفحة.',
        expectedRetryButton: 'إعادة المحاولة',
        expectedHomeButton: 'العودة للرئيسية',
      },
      {
        code: 'en',
        name: 'English',
        expectedTitle: 'Sorry, an unexpected error occurred',
        expectedDescription: 'We apologize for the inconvenience. An error occurred while loading the page.',
        expectedRetryButton: 'Retry',
        expectedHomeButton: 'Go Home',
      },
      {
        code: 'fr',
        name: 'French',
        expectedTitle: "Désolé, une erreur inattendue s'est produite",
        expectedDescription: "Nous nous excusons pour le désagrément. Une erreur s'est produite lors du chargement de la page.",
        expectedRetryButton: 'Réessayer',
        expectedHomeButton: "Retour à l'accueil",
      },
    ];

    testLanguages.forEach(({ 
      code, 
      name, 
      expectedTitle, 
      expectedDescription, 
      expectedRetryButton,
      expectedHomeButton 
    }) => {
      describe(`${name} (${code})`, () => {
        beforeEach(() => {
          // Set mock language for this test
          setMockLanguage(code);
          setMockUser(null);
        });

        it(`should display error title in ${name}`, () => {
          render(
            <RouteErrorBoundary>
              <ThrowError />
            </RouteErrorBoundary>
          );

          expect(screen.getByText(expectedTitle)).toBeInTheDocument();
        });

        it(`should display error description in ${name}`, () => {
          render(
            <RouteErrorBoundary>
              <ThrowError />
            </RouteErrorBoundary>
          );

          expect(screen.getByText(expectedDescription)).toBeInTheDocument();
        });

        it(`should display retry button in ${name}`, () => {
          render(
            <RouteErrorBoundary>
              <ThrowError />
            </RouteErrorBoundary>
          );

          const retryButton = screen.getByRole('button', { name: expectedRetryButton });
          expect(retryButton).toBeInTheDocument();
          expect(retryButton.textContent).toBe(expectedRetryButton);
        });

        it(`should display home button in ${name}`, () => {
          render(
            <RouteErrorBoundary>
              <ThrowError />
            </RouteErrorBoundary>
          );

          const homeButton = screen.getByRole('button', { name: expectedHomeButton });
          expect(homeButton).toBeInTheDocument();
          expect(homeButton.textContent).toBe(expectedHomeButton);
        });

        it(`should have correct aria-labels in ${name}`, () => {
          render(
            <RouteErrorBoundary>
              <ThrowError />
            </RouteErrorBoundary>
          );

          const retryButton = screen.getByRole('button', { name: expectedRetryButton });
          expect(retryButton).toHaveAttribute('aria-label', expectedRetryButton);

          const homeButton = screen.getByRole('button', { name: expectedHomeButton });
          expect(homeButton).toHaveAttribute('aria-label', expectedHomeButton);
        });
      });
    });
  });

  describe('Language Fallback Behavior', () => {
    it('should fallback to Arabic when invalid language is provided', () => {
      setMockLanguage('invalid');
      setMockUser(null);

      render(
        <ComponentErrorBoundary componentName="TestComponent">
          <ThrowError />
        </ComponentErrorBoundary>
      );

      // Should display Arabic (fallback)
      expect(screen.getByText('حدث خطأ في هذا المكون')).toBeInTheDocument();
    });

    it('should fallback to Arabic when language is undefined', () => {
      setMockLanguage(undefined);
      setMockUser(null);

      render(
        <ComponentErrorBoundary componentName="TestComponent">
          <ThrowError />
        </ComponentErrorBoundary>
      );

      // Should display Arabic (fallback)
      expect(screen.getByText('حدث خطأ في هذا المكون')).toBeInTheDocument();
    });
  });

  describe('Development Mode Details - Multi-Language', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should display details title in Arabic', () => {
      setMockLanguage('ar');
      setMockUser(null);

      render(
        <ComponentErrorBoundary componentName="TestComponent">
          <ThrowError />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('تفاصيل الخطأ (للمطورين)')).toBeInTheDocument();
    });

    it('should display details title in English', () => {
      setMockLanguage('en');
      setMockUser(null);

      render(
        <ComponentErrorBoundary componentName="TestComponent">
          <ThrowError />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Error Details (for developers)')).toBeInTheDocument();
    });

    it('should display details title in French', () => {
      setMockLanguage('fr');
      setMockUser(null);

      render(
        <ComponentErrorBoundary componentName="TestComponent">
          <ThrowError />
        </ComponentErrorBoundary>
      );

      expect(screen.getByText('Détails de l\'erreur (pour les développeurs)')).toBeInTheDocument();
    });
  });

  describe('Translation Quality Checks', () => {
    it('should have consistent message structure across all languages', () => {
      const languages = ['ar', 'en', 'fr'];
      const errorTypes = ['componentError', 'routeError'];

      languages.forEach(lang => {
        errorTypes.forEach(errorType => {
          const translations = errorBoundaryTranslations[lang][errorType];
          
          // Check that all messages are strings
          Object.entries(translations).forEach(([key, value]) => {
            expect(typeof value).toBe('string');
          });

          // Check that messages are not just whitespace
          Object.entries(translations).forEach(([key, value]) => {
            expect(value.trim().length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have similar message lengths across languages (within reason)', () => {
      const errorTypes = ['componentError', 'routeError'];
      const keys = ['title', 'description'];

      errorTypes.forEach(errorType => {
        keys.forEach(key => {
          const arLength = errorBoundaryTranslations.ar[errorType][key].length;
          const enLength = errorBoundaryTranslations.en[errorType][key].length;
          const frLength = errorBoundaryTranslations.fr[errorType][key].length;

          // Messages should be within 3x length of each other (reasonable variance)
          const maxLength = Math.max(arLength, enLength, frLength);
          const minLength = Math.min(arLength, enLength, frLength);
          
          expect(maxLength / minLength).toBeLessThan(3);
        });
      });
    });

    it('should not have placeholder text in any language', () => {
      const languages = ['ar', 'en', 'fr'];
      const errorTypes = ['componentError', 'routeError'];
      const placeholders = ['TODO', 'FIXME', 'XXX', 'placeholder', 'test'];

      languages.forEach(lang => {
        errorTypes.forEach(errorType => {
          const translations = errorBoundaryTranslations[lang][errorType];
          
          Object.entries(translations).forEach(([key, value]) => {
            placeholders.forEach(placeholder => {
              expect(value.toLowerCase()).not.toContain(placeholder.toLowerCase());
            });
          });
        });
      });
    });
  });

  describe('Accessibility - Multi-Language', () => {
    it('should have proper ARIA attributes in all languages', () => {
      const languages = [
        { code: 'ar', retryButton: 'إعادة المحاولة' },
        { code: 'en', retryButton: 'Retry' },
        { code: 'fr', retryButton: 'Réessayer' },
      ];

      languages.forEach(({ code, retryButton }) => {
        setMockLanguage(code);
        setMockUser(null);

        const { container } = render(
          <ComponentErrorBoundary componentName="TestComponent">
            <ThrowError />
          </ComponentErrorBoundary>
        );

        // Check for role="alert"
        const alertElement = container.querySelector('[role="alert"]');
        expect(alertElement).toBeInTheDocument();

        // Check for aria-live
        expect(alertElement).toHaveAttribute('aria-live', 'polite');

        // Check button aria-label
        const button = screen.getByRole('button', { name: retryButton });
        expect(button).toHaveAttribute('aria-label', retryButton);
      });
    });
  });
});
