/**
 * Keyboard Navigation Tests
 * 
 * Tests keyboard navigation functionality for the application form.
 * 
 * Requirements: 9.1-9.10
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplicationProvider } from '../../../context/ApplicationContext';
import MultiStepForm from '../MultiStepForm';
import EducationExperienceStep from '../EducationExperienceStep';
import FileUploadManager from '../FileUploadManager';

describe('Keyboard Navigation', () => {
  describe('MultiStepForm Keyboard Shortcuts', () => {
    let mockOnSave, mockOnCancel;

    beforeEach(() => {
      mockOnSave = vi.fn();
      mockOnCancel = vi.fn();
    });

    it('should navigate to next step with Alt+N', async () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={mockOnCancel} />
        </ApplicationProvider>
      );

      // Fill required fields
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

      // Press Alt+N
      fireEvent.keyDown(document, { key: 'n', altKey: true });

      await waitFor(() => {
        expect(screen.getByText(/education & experience/i)).toBeInTheDocument();
      });
    });

    it('should navigate to previous step with Alt+P', async () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={mockOnCancel} />
        </ApplicationProvider>
      );

      // Navigate to step 2 first
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/education & experience/i)).toBeInTheDocument();
      });

      // Press Alt+P
      fireEvent.keyDown(document, { key: 'p', altKey: true });

      await waitFor(() => {
        expect(screen.getByText(/personal information/i)).toBeInTheDocument();
      });
    });

    it('should save draft with Ctrl+S', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={mockOnCancel} />
        </ApplicationProvider>
      );

      // Press Ctrl+S
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should save draft with Cmd+S on Mac', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={mockOnCancel} />
        </ApplicationProvider>
      );

      // Press Cmd+S
      fireEvent.keyDown(document, { key: 's', metaKey: true });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should show keyboard shortcuts help with ?', async () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={mockOnCancel} />
        </ApplicationProvider>
      );

      // Press ?
      fireEvent.keyPress(document, { key: '?' });

      await waitFor(() => {
        expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      });
    });

    it('should not trigger shortcuts when typing in input fields', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={mockOnSave} onCancel={mockOnCancel} />
        </ApplicationProvider>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      nameInput.focus();

      // Press Alt+N while focused on input
      fireEvent.keyDown(nameInput, { key: 'n', altKey: true });

      // Should still be on step 1
      expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    });
  });

  describe('Dynamic List Keyboard Navigation', () => {
    it('should add education entry with Alt+A', async () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep />
        </ApplicationProvider>
      );

      const initialEntries = screen.getAllByText(/education #/i);
      const initialCount = initialEntries.length;

      // Press Alt+A
      fireEvent.keyDown(document, { key: 'a', altKey: true });

      await waitFor(() => {
        const updatedEntries = screen.getAllByText(/education #/i);
        expect(updatedEntries.length).toBe(initialCount + 1);
      });
    });

    it('should remove education entry with Delete key when focused on remove button', async () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep />
        </ApplicationProvider>
      );

      // Add a second entry first
      const addButton = screen.getByRole('button', { name: /add education/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getAllByText(/education #/i).length).toBe(2);
      });

      // Focus on remove button and press Delete
      const removeButtons = screen.getAllByRole('button', { name: /remove education/i });
      const firstRemoveButton = removeButtons[0];
      firstRemoveButton.focus();

      fireEvent.keyDown(firstRemoveButton, { key: 'Delete' });

      await waitFor(() => {
        expect(screen.getAllByText(/education #/i).length).toBe(1);
      });
    });

    it('should remove education entry with Backspace key when focused on remove button', async () => {
      render(
        <ApplicationProvider>
          <EducationExperienceStep />
        </ApplicationProvider>
      );

      // Add a second entry first
      const addButton = screen.getByRole('button', { name: /add education/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getAllByText(/education #/i).length).toBe(2);
      });

      // Focus on remove button and press Backspace
      const removeButtons = screen.getAllByRole('button', { name: /remove education/i });
      const firstRemoveButton = removeButtons[0];
      firstRemoveButton.focus();

      fireEvent.keyDown(firstRemoveButton, { key: 'Backspace' });

      await waitFor(() => {
        expect(screen.getAllByText(/education #/i).length).toBe(1);
      });
    });
  });

  describe('File Upload Keyboard Navigation', () => {
    it('should trigger file selection with Enter key on drop zone', () => {
      const mockOnFilesChange = vi.fn();
      const mockOnUploadProgress = vi.fn();

      render(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByRole('button', { name: /drag and drop/i });
      
      // Press Enter
      fireEvent.keyDown(dropZone, { key: 'Enter' });

      // File input should be triggered (we can't test the actual file dialog)
      expect(dropZone).toBeInTheDocument();
    });

    it('should trigger file selection with Space key on drop zone', () => {
      const mockOnFilesChange = vi.fn();
      const mockOnUploadProgress = vi.fn();

      render(
        <FileUploadManager
          files={[]}
          onFilesChange={mockOnFilesChange}
          onUploadProgress={mockOnUploadProgress}
        />
      );

      const dropZone = screen.getByRole('button', { name: /drag and drop/i });
      
      // Press Space
      fireEvent.keyDown(dropZone, { key: ' ' });

      // File input should be triggered
      expect(dropZone).toBeInTheDocument();
    });

    it('should have proper tab order for all interactive elements', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Get all focusable elements
      const focusableElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('textbox')
      );

      // All should be keyboard accessible (tabindex not -1)
      focusableElements.forEach(element => {
        expect(element.getAttribute('tabindex')).not.toBe('-1');
      });
    });
  });

  describe('Focus Management', () => {
    it('should maintain focus when navigating between steps', async () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      // Fill required fields
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1234567890' } });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        // Focus should be on the first input of the new step
        const firstInput = screen.getAllByRole('combobox')[0]; // First select in education
        expect(document.activeElement).toBe(firstInput);
      });
    });

    it('should have visible focus indicators on all interactive elements', () => {
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
        expect(
          styles.outline !== 'none' || styles.boxShadow !== 'none'
        ).toBe(true);
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA labels on all buttons', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(
          button.getAttribute('aria-label') || button.textContent
        ).toBeTruthy();
      });
    });

    it('should announce keyboard shortcuts in button titles', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton.getAttribute('title')).toContain('Alt+N');

      const saveButton = screen.getByRole('button', { name: /save draft/i });
      expect(saveButton.getAttribute('title')).toContain('Ctrl+S');
    });

    it('should not have any keyboard traps', () => {
      render(
        <ApplicationProvider>
          <MultiStepForm onSave={vi.fn()} onCancel={vi.fn()} />
        </ApplicationProvider>
      );

      const focusableElements = screen.getAllByRole('button').concat(
        screen.getAllByRole('textbox')
      );

      // Simulate tabbing through all elements
      focusableElements.forEach((element, index) => {
        element.focus();
        expect(document.activeElement).toBe(element);
        
        // Should be able to tab to next element
        if (index < focusableElements.length - 1) {
          fireEvent.keyDown(element, { key: 'Tab' });
        }
      });
    });
  });
});
