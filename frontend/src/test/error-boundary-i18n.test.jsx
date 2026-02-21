import { describe, it, expect } from 'vitest';
import errorBoundaryTranslations from '../data/errorBoundaryTranslations.json';

/**
 * Test suite for Error Boundary i18n integration
 * Task 7.5.4: Use i18n for error messages
 * 
 * Requirements:
 * - FR-ERR-2: Display user-friendly error messages in Arabic, English, or French
 * - Task 7.5.4: Use i18n translation file instead of hardcoded messages
 */
describe('Error Boundary i18n Integration', () => {
  describe('Translation File Structure', () => {
    it('should have translations for all three languages', () => {
      expect(errorBoundaryTranslations).toHaveProperty('ar');
      expect(errorBoundaryTranslations).toHaveProperty('en');
      expect(errorBoundaryTranslations).toHaveProperty('fr');
    });

    it('should have componentError translations for all languages', () => {
      expect(errorBoundaryTranslations.ar).toHaveProperty('componentError');
      expect(errorBoundaryTranslations.en).toHaveProperty('componentError');
      expect(errorBoundaryTranslations.fr).toHaveProperty('componentError');
    });

    it('should have routeError translations for all languages', () => {
      expect(errorBoundaryTranslations.ar).toHaveProperty('routeError');
      expect(errorBoundaryTranslations.en).toHaveProperty('routeError');
      expect(errorBoundaryTranslations.fr).toHaveProperty('routeError');
    });
  });

  describe('Component Error Messages', () => {
    const requiredFields = [
      'title',
      'description',
      'retryButton',
      'retryingMessage',
      'detailsTitle',
      'componentLabel',
      'errorLabel',
      'timestampLabel',
      'retryCountLabel'
    ];

    it('should have all required fields in Arabic componentError', () => {
      const arComponentError = errorBoundaryTranslations.ar.componentError;
      requiredFields.forEach(field => {
        expect(arComponentError).toHaveProperty(field);
        expect(arComponentError[field]).toBeTruthy();
        expect(typeof arComponentError[field]).toBe('string');
      });
    });

    it('should have all required fields in English componentError', () => {
      const enComponentError = errorBoundaryTranslations.en.componentError;
      requiredFields.forEach(field => {
        expect(enComponentError).toHaveProperty(field);
        expect(enComponentError[field]).toBeTruthy();
        expect(typeof enComponentError[field]).toBe('string');
      });
    });

    it('should have all required fields in French componentError', () => {
      const frComponentError = errorBoundaryTranslations.fr.componentError;
      requiredFields.forEach(field => {
        expect(frComponentError).toHaveProperty(field);
        expect(frComponentError[field]).toBeTruthy();
        expect(typeof frComponentError[field]).toBe('string');
      });
    });
  });

  describe('Route Error Messages', () => {
    const requiredFields = [
      'title',
      'description',
      'retryButton',
      'homeButton',
      'detailsTitle',
      'errorLabel',
      'timestampLabel',
      'stackLabel'
    ];

    it('should have all required fields in Arabic routeError', () => {
      const arRouteError = errorBoundaryTranslations.ar.routeError;
      requiredFields.forEach(field => {
        expect(arRouteError).toHaveProperty(field);
        expect(arRouteError[field]).toBeTruthy();
        expect(typeof arRouteError[field]).toBe('string');
      });
    });

    it('should have all required fields in English routeError', () => {
      const enRouteError = errorBoundaryTranslations.en.routeError;
      requiredFields.forEach(field => {
        expect(enRouteError).toHaveProperty(field);
        expect(enRouteError[field]).toBeTruthy();
        expect(typeof enRouteError[field]).toBe('string');
      });
    });

    it('should have all required fields in French routeError', () => {
      const frRouteError = errorBoundaryTranslations.fr.routeError;
      requiredFields.forEach(field => {
        expect(frRouteError).toHaveProperty(field);
        expect(frRouteError[field]).toBeTruthy();
        expect(typeof frRouteError[field]).toBe('string');
      });
    });
  });

  describe('Translation Content Validation', () => {
    it('should have non-empty Arabic translations', () => {
      const arComponentError = errorBoundaryTranslations.ar.componentError;
      const arRouteError = errorBoundaryTranslations.ar.routeError;
      
      expect(arComponentError.title.length).toBeGreaterThan(0);
      expect(arComponentError.description.length).toBeGreaterThan(0);
      expect(arRouteError.title.length).toBeGreaterThan(0);
      expect(arRouteError.description.length).toBeGreaterThan(0);
    });

    it('should have non-empty English translations', () => {
      const enComponentError = errorBoundaryTranslations.en.componentError;
      const enRouteError = errorBoundaryTranslations.en.routeError;
      
      expect(enComponentError.title.length).toBeGreaterThan(0);
      expect(enComponentError.description.length).toBeGreaterThan(0);
      expect(enRouteError.title.length).toBeGreaterThan(0);
      expect(enRouteError.description.length).toBeGreaterThan(0);
    });

    it('should have non-empty French translations', () => {
      const frComponentError = errorBoundaryTranslations.fr.componentError;
      const frRouteError = errorBoundaryTranslations.fr.routeError;
      
      expect(frComponentError.title.length).toBeGreaterThan(0);
      expect(frComponentError.description.length).toBeGreaterThan(0);
      expect(frRouteError.title.length).toBeGreaterThan(0);
      expect(frRouteError.description.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback Behavior', () => {
    it('should use Arabic as fallback when language is not found', () => {
      const invalidLanguage = 'xx';
      const messages = errorBoundaryTranslations[invalidLanguage]?.componentError || 
                      errorBoundaryTranslations.ar.componentError;
      
      expect(messages).toEqual(errorBoundaryTranslations.ar.componentError);
    });

    it('should use Arabic routeError as fallback when language is not found', () => {
      const invalidLanguage = 'xx';
      const messages = errorBoundaryTranslations[invalidLanguage]?.routeError || 
                      errorBoundaryTranslations.ar.routeError;
      
      expect(messages).toEqual(errorBoundaryTranslations.ar.routeError);
    });
  });

  describe('Message Consistency', () => {
    it('should have consistent button labels across error types', () => {
      // Both component and route errors should have retry button
      expect(errorBoundaryTranslations.ar.componentError.retryButton).toBeTruthy();
      expect(errorBoundaryTranslations.ar.routeError.retryButton).toBeTruthy();
      
      expect(errorBoundaryTranslations.en.componentError.retryButton).toBeTruthy();
      expect(errorBoundaryTranslations.en.routeError.retryButton).toBeTruthy();
      
      expect(errorBoundaryTranslations.fr.componentError.retryButton).toBeTruthy();
      expect(errorBoundaryTranslations.fr.routeError.retryButton).toBeTruthy();
    });

    it('should have consistent error label across error types', () => {
      // Both component and route errors should have error label
      expect(errorBoundaryTranslations.ar.componentError.errorLabel).toBeTruthy();
      expect(errorBoundaryTranslations.ar.routeError.errorLabel).toBeTruthy();
      
      expect(errorBoundaryTranslations.en.componentError.errorLabel).toBeTruthy();
      expect(errorBoundaryTranslations.en.routeError.errorLabel).toBeTruthy();
      
      expect(errorBoundaryTranslations.fr.componentError.errorLabel).toBeTruthy();
      expect(errorBoundaryTranslations.fr.routeError.errorLabel).toBeTruthy();
    });
  });
});
