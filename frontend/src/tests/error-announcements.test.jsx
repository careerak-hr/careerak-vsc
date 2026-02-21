import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormErrorAnnouncer from '../components/Accessibility/FormErrorAnnouncer';
import AriaLiveRegion from '../components/Accessibility/AriaLiveRegion';

/**
 * Error Announcements Test Suite
 * 
 * Tests FR-A11Y-10: When forms have errors, the system shall announce errors 
 * to screen readers with aria-live regions.
 * 
 * Validates:
 * - Error messages are announced with aria-live
 * - Correct politeness level (assertive for errors)
 * - Multi-language support
 * - Multiple errors handling
 * - Error clearing
 */

describe('Error Announcements with aria-live', () => {
  describe('AriaLiveRegion Component', () => {
    it('should render with aria-live="polite" by default', () => {
      const { container } = render(
        <AriaLiveRegion message="Test message" />
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toBe('Test message');
    });

    it('should render with aria-live="assertive" for critical messages', () => {
      const { container } = render(
        <AriaLiveRegion message="Critical error" politeness="assertive" />
      );
      
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.getAttribute('role')).toBe('alert');
    });

    it('should have role="alert" for assertive messages', () => {
      const { container } = render(
        <AriaLiveRegion message="Error message" politeness="assertive" />
      );
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeTruthy();
      expect(alert.getAttribute('aria-live')).toBe('assertive');
    });

    it('should have role="status" for polite messages', () => {
      const { container } = render(
        <AriaLiveRegion message="Status update" politeness="polite" />
      );
      
      const status = container.querySelector('[role="status"]');
      expect(status).toBeTruthy();
      expect(status.getAttribute('aria-live')).toBe('polite');
    });

    it('should be visually hidden but accessible to screen readers', () => {
      const { container } = render(
        <AriaLiveRegion message="Hidden message" />
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion.className).toContain('sr-only');
      expect(liveRegion.style.position).toBe('absolute');
      expect(liveRegion.style.left).toBe('-10000px');
    });

    it('should update message when prop changes', async () => {
      const { container, rerender } = render(
        <AriaLiveRegion message="First message" />
      );
      
      let liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion.textContent).toBe('First message');
      
      rerender(<AriaLiveRegion message="Second message" />);
      
      await waitFor(() => {
        liveRegion = container.querySelector('[aria-live]');
        expect(liveRegion.textContent).toBe('Second message');
      });
    });

    it('should not render when message is empty', () => {
      const { container } = render(
        <AriaLiveRegion message="" />
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeFalsy();
    });

    it('should have aria-atomic="true" by default', () => {
      const { container } = render(
        <AriaLiveRegion message="Test" />
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion.getAttribute('aria-atomic')).toBe('true');
    });
  });

  describe('FormErrorAnnouncer Component', () => {
    it('should announce single error in Arabic', () => {
      const errors = { email: 'البريد الإلكتروني غير صالح' };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="ar" />
      );
      
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toContain('خطأ في النموذج');
      expect(liveRegion.textContent).toContain('البريد الإلكتروني غير صالح');
    });

    it('should announce single error in English', () => {
      const errors = { email: 'Invalid email address' };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="en" />
      );
      
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toContain('Form error');
      expect(liveRegion.textContent).toContain('Invalid email address');
    });

    it('should announce single error in French', () => {
      const errors = { email: 'Adresse e-mail invalide' };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="fr" />
      );
      
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toContain('Erreur de formulaire');
      expect(liveRegion.textContent).toContain('Adresse e-mail invalide');
    });

    it('should announce multiple errors with count', () => {
      const errors = {
        email: 'Invalid email',
        password: 'Password too short',
        phone: 'Invalid phone number'
      };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="en" />
      );
      
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion.textContent).toContain('3 errors');
    });

    it('should not render when no errors', () => {
      const { container } = render(
        <FormErrorAnnouncer errors={{}} language="en" />
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeFalsy();
    });

    it('should update when errors change', async () => {
      const { container, rerender } = render(
        <FormErrorAnnouncer errors={{ email: 'Invalid email' }} language="en" />
      );
      
      let liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion.textContent).toContain('Invalid email');
      
      rerender(
        <FormErrorAnnouncer errors={{ password: 'Password required' }} language="en" />
      );
      
      await waitFor(() => {
        liveRegion = container.querySelector('[aria-live]');
        expect(liveRegion.textContent).toContain('Password required');
      });
    });

    it('should clear announcement when errors are cleared', async () => {
      const { container, rerender } = render(
        <FormErrorAnnouncer errors={{ email: 'Invalid email' }} language="en" />
      );
      
      let liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      
      rerender(<FormErrorAnnouncer errors={{}} language="en" />);
      
      await waitFor(() => {
        liveRegion = container.querySelector('[aria-live]');
        expect(liveRegion).toBeFalsy();
      });
    });

    it('should have role="alert" for error announcements', () => {
      const errors = { email: 'Invalid email' };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="en" />
      );
      
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeTruthy();
      expect(alert.getAttribute('aria-live')).toBe('assertive');
    });

    it('should ignore empty error values', () => {
      const errors = {
        email: 'Invalid email',
        password: '', // Empty error
        phone: null, // Null error
        name: undefined // Undefined error
      };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="en" />
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion.textContent).toContain('Invalid email');
      expect(liveRegion.textContent).not.toContain('password');
      expect(liveRegion.textContent).not.toContain('phone');
      expect(liveRegion.textContent).not.toContain('name');
    });

    it('should default to Arabic when language is not provided', () => {
      const errors = { email: 'خطأ' };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} />
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion.textContent).toContain('خطأ في النموذج');
    });
  });

  describe('Integration with Forms', () => {
    it('should work with form validation errors', async () => {
      const MockForm = () => {
        const [errors, setErrors] = React.useState({});
        
        const handleSubmit = (e) => {
          e.preventDefault();
          setErrors({
            email: 'Email is required',
            password: 'Password must be at least 8 characters'
          });
        };
        
        return (
          <form onSubmit={handleSubmit}>
            <FormErrorAnnouncer errors={errors} language="en" />
            <button type="submit">Submit</button>
          </form>
        );
      };
      
      const { container, getByRole } = render(<MockForm />);
      const submitButton = getByRole('button');
      
      // Initially no errors
      let liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeFalsy();
      
      // Submit form to trigger errors
      submitButton.click();
      
      // Wait for errors to be announced
      await waitFor(() => {
        liveRegion = container.querySelector('[aria-live="assertive"]');
        expect(liveRegion).toBeTruthy();
      });
      
      expect(liveRegion.textContent).toContain('2 errors');
    });
  });

  describe('Accessibility Requirements', () => {
    it('should meet FR-A11Y-10: announce errors with aria-live', () => {
      const errors = { field: 'Error message' };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="en" />
      );
      
      // Verify aria-live region exists
      const liveRegion = container.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      
      // Verify assertive politeness for errors
      expect(liveRegion.getAttribute('aria-live')).toBe('assertive');
      
      // Verify role="alert" for errors
      expect(liveRegion.getAttribute('role')).toBe('alert');
      
      // Verify error message is present
      expect(liveRegion.textContent).toContain('Error message');
    });

    it('should be compatible with screen readers', () => {
      const errors = { email: 'Invalid email' };
      const { container } = render(
        <FormErrorAnnouncer errors={errors} language="en" />
      );
      
      const liveRegion = container.querySelector('[aria-live]');
      
      // Should be in the DOM (accessible to screen readers)
      expect(liveRegion).toBeTruthy();
      
      // Should have proper ARIA attributes
      expect(liveRegion.hasAttribute('aria-live')).toBe(true);
      expect(liveRegion.hasAttribute('role')).toBe(true);
      expect(liveRegion.hasAttribute('aria-atomic')).toBe(true);
      
      // Should contain readable text
      expect(liveRegion.textContent.length).toBeGreaterThan(0);
    });
  });
});
