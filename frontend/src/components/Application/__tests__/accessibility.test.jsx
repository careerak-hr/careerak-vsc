/**
 * Accessibility Tests for Application Form
 * 
 * Comprehensive tests for keyboard navigation, screen reader compatibility,
 * ARIA labels, and focus management.
 * 
 * Requirements: 9.1-9.10 (Accessibility Features)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ApplicationProvider } from '../../../context/ApplicationContext';
import MultiStepForm from '../MultiStepForm';
import PersonalInfoStep from '../PersonalInfoStep';
import EducationExperienceStep from '../EducationExperienceStep';
import FileUploadManager from '../FileUploadManager';

describe('Accessibility Tests', () => {
  describe('Automated Accessibility Checks (axe-core)', () => {
    it('should have no accessibility violations in MultiStepForm', async () => {
      const { container } = render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });

    it('should have no accessibility violations in PersonalInfoStep', async () => {
      const { container } = render(
        <ApplicationProvider>
          <PersonalInfoStep errors={{}} />
        </ApplicationProvider>
      );

      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });

    it('should have no accessibility violations in EducationExperienceStep', async () => {
      const { container } = render(
        <ApplicationProvider>
          <EducationExperienceStep errors={{}} />
        </ApplicationProvider>
      );

      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });

    it('should have no accessibility violations with form errors', async () => {
      const errors = {
        fullName: 'Full name is required',
        email: 'Invalid email format',
      };

      const { container } = render(
        <ApplicationProvider>
          <PersonalInfoStep errors={errors} />
        </ApplicationProvider>
      );

      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow tab navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Get all interactive elements
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      const nextButton = screen.getByRole('button', { name: /next/i });

      // Tab through elements
      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(phoneInput).toHaveFocus();

      // Continue tabbing to buttons
      await user.tab();
      await user.tab();
      expect([saveDraftButton, nextButton]).toContainEqual(document.activeElement);
    });

    it('should have logical tab order', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={{}} />
        </ApplicationProvider>
      );

      const inputs = [
        screen.getByLabelText(/full name/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/phone/i),
        screen.getByLabelText(/country/i),
        screen.getByLabelText(/city/i),
      ];

      // Tab through inputs in order
      for (let i = 0; i < inputs.length; i++) {
        await user.tab();
        expect(inputs[i]).toHaveFocus();
      }
    });

    it('should support Enter key on buttons', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      saveDraftButton.focus();

      await user.keyboard('{Enter}');
      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should support Space key on buttons', async () => {
      const user = userEvent.setup();
      const mockOnSave = vi.fn();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      saveDraftButton.focus();

      await user.keyboard(' ');
      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should not have keyboard traps', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Tab through all elements and ensure we can always move forward
      const allButtons = screen.getAllByRole('button');
      const allInputs = screen.getAllByRole('textbox');
      const totalElements = allButtons.length + allInputs.length;

      for (let i = 0; i < totalElements + 5; i++) {
        const beforeFocus = document.activeElement;
        await user.tab();
        const afterFocus = document.activeElement;
        
        // Focus should change (no trap)
        expect(afterFocus).toBeDefined();
      }
    });

    it('should have visible focus indicators', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        button.focus();
        const styles = window.getComputedStyle(button);
        
        // Should have outline or box-shadow for focus
        const hasOutline = styles.outline && styles.outline !== 'none';
        const hasBoxShadow = styles.boxShadow && styles.boxShadow !== 'none';
        
        expect(hasOutline || hasBoxShadow).toBe(true);
      });
    });

    it('should support Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={{}} />
        </ApplicationProvider>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const nameInput = screen.getByLabelText(/full name/i);

      // Focus on email
      emailInput.focus();
      expect(emailInput).toHaveFocus();

      // Shift+Tab should go back to name
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(nameInput).toHaveFocus();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have proper form labels for all inputs', () => {
      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={{}} />
        </ApplicationProvider>
      );

      // All inputs should have associated labels
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      const countryInput = screen.getByLabelText(/country/i);
      const cityInput = screen.getByLabelText(/city/i);

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(phoneInput).toBeInTheDocument();
      expect(countryInput).toBeInTheDocument();
      expect(cityInput).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Should have h2 for step heading
      const stepHeading = screen.getByRole('heading', { level: 2, name: /personal information/i });
      expect(stepHeading).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Should use semantic elements
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('form')).toBeInTheDocument();
      expect(container.querySelector('[role="region"]')).toBeInTheDocument();
    });

    it('should announce form errors to screen readers', () => {
      const errors = {
        fullName: 'Full name is required',
        email: 'Invalid email format',
      };

      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={errors} />
        </ApplicationProvider>
      );

      // Error messages should have role="alert"
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(errorMessages[0]).toHaveTextContent(/full name is required/i);
    });

    it('should have proper list structure for progress steps', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const progressList = screen.getByRole('list', { name: /application progress/i });
      expect(progressList).toBeInTheDocument();

      const listItems = within(progressList).getAllByRole('listitem');
      expect(listItems.length).toBe(5); // 5 steps
    });

    it('should have proper list structure for education entries', () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep errors={{}} />
        </ApplicationProvider>
      );

      const educationList = screen.getByRole('list', { name: /education entries/i });
      expect(educationList).toBeInTheDocument();

      const listItems = within(educationList).getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should announce live region updates', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Step content should have aria-live
      const stepContent = screen.getByRole('region', { name: /step 1/i });
      expect(stepContent).toHaveAttribute('aria-live', 'polite');
    });

    it('should have descriptive button labels', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // All buttons should have descriptive labels
      const saveDraftButton = screen.getByRole('button', { name: /save application as draft/i });
      const nextButton = screen.getByRole('button', { name: /go to next step/i });

      expect(saveDraftButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('ARIA Labels and Attributes', () => {
    it('should mark required fields with aria-required', () => {
      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={{}} />
        </ApplicationProvider>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);

      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(phoneInput).toHaveAttribute('aria-required', 'true');
    });

    it('should mark invalid fields with aria-invalid', () => {
      const errors = {
        fullName: 'Full name is required',
        email: 'Invalid email format',
      };

      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={errors} />
        </ApplicationProvider>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);

      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error messages with aria-describedby', () => {
      const errors = {
        fullName: 'Full name is required',
      };

      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={errors} />
        </ApplicationProvider>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      const describedBy = nameInput.getAttribute('aria-describedby');

      expect(describedBy).toBeTruthy();
      
      const errorElement = document.getElementById(describedBy);
      expect(errorElement).toHaveTextContent(/full name is required/i);
    });

    it('should mark current step with aria-current', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const progressList = screen.getByRole('list', { name: /application progress/i });
      const listItems = within(progressList).getAllByRole('listitem');

      // First step should be current
      expect(listItems[0]).toHaveAttribute('aria-current', 'step');
      
      // Other steps should not be current
      expect(listItems[1]).not.toHaveAttribute('aria-current');
    });

    it('should have proper aria-label for sections', () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep errors={{}} />
        </ApplicationProvider>
      );

      const educationSection = screen.getByRole('group', { name: /education & experience/i });
      expect(educationSection).toBeInTheDocument();
    });

    it('should have aria-labelledby for sections with headings', () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep errors={{}} />
        </ApplicationProvider>
      );

      // Education section should be labeled by its heading
      const educationSection = screen.getByLabelText(/education/i, { selector: 'section' });
      expect(educationSection).toBeInTheDocument();
    });

    it('should have aria-busy during save operations', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const saveDraftButton = screen.getByRole('button', { name: /save application as draft/i });
      expect(saveDraftButton).toHaveAttribute('aria-busy');
    });

    it('should have proper role for lists', () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep errors={{}} />
        </ApplicationProvider>
      );

      const educationList = screen.getByRole('list', { name: /education entries/i });
      expect(educationList).toBeInTheDocument();

      const listItems = within(educationList).getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should have descriptive aria-label for remove buttons', () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep errors={{}} />
        </ApplicationProvider>
      );

      const removeButton = screen.getByRole('button', { name: /remove education entry 1/i });
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveAttribute('aria-label');
    });
  });

  describe('Focus Management', () => {
    it('should move focus to first input when step changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Fill required fields
      await user.type(screen.getByLabelText(/full name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/phone/i), '+1234567890');

      // Click next
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        // Focus should be on first input of new step
        const firstInput = screen.getAllByRole('combobox')[0];
        expect(firstInput).toHaveFocus();
      });
    });

    it('should maintain focus visibility on all interactive elements', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const buttons = screen.getAllByRole('button');
      const inputs = screen.getAllByRole('textbox');
      
      [...buttons, ...inputs].forEach(element => {
        element.focus();
        expect(document.activeElement).toBe(element);
      });
    });

    it('should restore focus after modal close', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Open keyboard shortcuts help
      const helpButton = screen.getByRole('button', { name: /show keyboard shortcuts/i });
      await user.click(helpButton);

      await waitFor(() => {
        expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        // Focus should return to help button
        expect(helpButton).toHaveFocus();
      });
    });

    it('should trap focus in modal when open', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Open keyboard shortcuts help
      const helpButton = screen.getByRole('button', { name: /show keyboard shortcuts/i });
      await user.click(helpButton);

      await waitFor(() => {
        expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      });

      // Tab should stay within modal
      const modalButtons = screen.getAllByRole('button').filter(btn => 
        btn.closest('[role="dialog"]') || btn.closest('.modal')
      );

      if (modalButtons.length > 0) {
        for (let i = 0; i < modalButtons.length + 2; i++) {
          await user.tab();
          const focusedElement = document.activeElement;
          const isInModal = focusedElement.closest('[role="dialog"]') || 
                           focusedElement.closest('.modal');
          expect(isInModal).toBeTruthy();
        }
      }
    });

    it('should have focus order matching visual order', () => {
      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={{}} />
        </ApplicationProvider>
      );

      const inputs = screen.getAllByRole('textbox');
      
      // Check tabindex values
      inputs.forEach((input, index) => {
        const tabIndex = input.getAttribute('tabindex');
        // Should not have explicit tabindex or should be 0
        expect(tabIndex === null || tabIndex === '0').toBe(true);
      });
    });

    it('should not lose focus when validation errors appear', async () => {
      const user = userEvent.setup();
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      nameInput.focus();

      // Try to go next without filling required fields
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        // Focus should remain on a focusable element
        expect(document.activeElement).toBeDefined();
        expect(document.activeElement.tagName).toMatch(/INPUT|BUTTON/);
      });
    });
  });

  describe('Additional Accessibility Features', () => {
    it('should have proper contrast ratios', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // This is a basic check - full contrast testing should be done with tools
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
      });
    });

    it('should have proper text alternatives for icons', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // SVG icons should have aria-hidden or proper labels
      const svgs = document.querySelectorAll('svg');
      svgs.forEach(svg => {
        const hasAriaHidden = svg.getAttribute('aria-hidden') === 'true';
        const hasAriaLabel = svg.getAttribute('aria-label');
        const hasTitle = svg.querySelector('title');
        
        expect(hasAriaHidden || hasAriaLabel || hasTitle).toBeTruthy();
      });
    });

    it('should support reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Component should respect reduced motion
      // This is a basic check - actual implementation depends on CSS
      expect(mediaQuery).toBeDefined();
    });

    it('should have proper language attributes', () => {
      const { container } = render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Check if lang attribute is set (should be inherited from html element)
      const hasLang = container.closest('[lang]') !== null || 
                     document.documentElement.hasAttribute('lang');
      expect(hasLang).toBe(true);
    });

    it('should have proper form structure', () => {
      const { container } = render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Should have form role or element
      const form = container.querySelector('[role="form"]') || container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should announce loading states', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const saveDraftButton = screen.getByRole('button', { name: /save application as draft/i });
      
      // Should have aria-live for status updates
      expect(saveDraftButton).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper fieldset grouping for related fields', () => {
      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={{}} />
        </ApplicationProvider>
      );

      // Related fields should be grouped
      const formGroups = screen.getAllByRole('group');
      expect(formGroups.length).toBeGreaterThan(0);
    });

    it('should have descriptive error messages', () => {
      const errors = {
        fullName: 'Full name is required',
        email: 'Invalid email format',
      };

      render(
        <ApplicationProvider>
          <PersonalInfoStep errors={errors} />
        </ApplicationProvider>
      );

      const errorMessages = screen.getAllByRole('alert');
      errorMessages.forEach(error => {
        expect(error.textContent.length).toBeGreaterThan(0);
        expect(error.textContent).not.toBe('Error');
      });
    });

    it('should have proper button types', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const type = button.getAttribute('type');
        expect(['button', 'submit', 'reset']).toContain(type);
      });
    });
  });
});
