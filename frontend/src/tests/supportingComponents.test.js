import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AutoSaveIndicator from '../components/AutoSaveIndicator/AutoSaveIndicator';
import ProgressIndicator from '../components/ProgressIndicator/ProgressIndicator';

/**
 * Unit Tests for Supporting Components
 * 
 * Tests AutoSaveIndicator and ProgressIndicator components
 * Requirements: 2.5, 7.2, 9.2, 9.3, 9.6
 */

describe('AutoSaveIndicator Component', () => {
  describe('Save Status Display', () => {
    it('should display "Saving..." when isSaving is true', () => {
      render(<AutoSaveIndicator isSaving={true} />);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('should display "Saved" when lastSaved is provided', () => {
      const lastSaved = new Date();
      render(<AutoSaveIndicator lastSaved={lastSaved} />);
      
      expect(screen.getByText('Saved')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should display "Save failed" when error is provided', () => {
      render(<AutoSaveIndicator error="Network error" />);
      
      expect(screen.getByText('Save failed')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should display "Not saved" when no status is provided', () => {
      render(<AutoSaveIndicator />);
      
      expect(screen.getByText('Not saved')).toBeInTheDocument();
      expect(screen.getByText('○')).toBeInTheDocument();
    });
  });

  describe('Last Saved Timestamp', () => {
    it('should display "Just now" for recent saves', () => {
      const lastSaved = new Date();
      render(<AutoSaveIndicator lastSaved={lastSaved} />);
      
      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('should display seconds ago for saves within a minute', () => {
      const lastSaved = new Date(Date.now() - 30000); // 30 seconds ago
      render(<AutoSaveIndicator lastSaved={lastSaved} />);
      
      expect(screen.getByText(/30 seconds ago/)).toBeInTheDocument();
    });

    it('should display minutes ago for saves within an hour', () => {
      const lastSaved = new Date(Date.now() - 300000); // 5 minutes ago
      render(<AutoSaveIndicator lastSaved={lastSaved} />);
      
      expect(screen.getByText(/5 minutes ago/)).toBeInTheDocument();
    });

    it('should not display timestamp when error is present', () => {
      const lastSaved = new Date();
      render(<AutoSaveIndicator lastSaved={lastSaved} error="Network error" />);
      
      expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when provided', () => {
      const errorMessage = 'Failed to save: Network timeout';
      render(<AutoSaveIndicator error={errorMessage} />);
      
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent(errorMessage);
    });

    it('should not display error message when no error', () => {
      render(<AutoSaveIndicator lastSaved={new Date()} />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Manual Save Button', () => {
    it('should display manual save button when onManualSave is provided', () => {
      const onManualSave = vi.fn();
      render(<AutoSaveIndicator onManualSave={onManualSave} />);
      
      expect(screen.getByRole('button', { name: /save manually/i })).toBeInTheDocument();
    });

    it('should call onManualSave when button is clicked', () => {
      const onManualSave = vi.fn();
      render(<AutoSaveIndicator onManualSave={onManualSave} />);
      
      const button = screen.getByRole('button', { name: /save manually/i });
      fireEvent.click(button);
      
      expect(onManualSave).toHaveBeenCalledTimes(1);
    });

    it('should disable button when isSaving is true', () => {
      const onManualSave = vi.fn();
      render(<AutoSaveIndicator isSaving={true} onManualSave={onManualSave} />);
      
      const button = screen.getByRole('button', { name: /save manually/i });
      expect(button).toBeDisabled();
    });

    it('should not display button when onManualSave is not provided', () => {
      render(<AutoSaveIndicator />);
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const onManualSave = vi.fn();
      render(<AutoSaveIndicator onManualSave={onManualSave} />);
      
      expect(screen.getByRole('button', { name: /save manually/i })).toBeInTheDocument();
    });

    it('should use role="alert" for error messages', () => {
      render(<AutoSaveIndicator error="Network error" />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('ProgressIndicator Component', () => {
  const defaultSteps = [
    { id: 1, label: 'Personal Info' },
    { id: 2, label: 'Education & Experience' },
    { id: 3, label: 'Skills & Languages' },
    { id: 4, label: 'Documents & Questions' },
    { id: 5, label: 'Review & Submit' }
  ];

  describe('Step Display', () => {
    it('should display all steps', () => {
      render(<ProgressIndicator currentStep={1} totalSteps={5} steps={defaultSteps} />);
      
      defaultSteps.forEach(step => {
        expect(screen.getByText(step.label)).toBeInTheDocument();
      });
    });

    it('should display current step number', () => {
      render(<ProgressIndicator currentStep={3} totalSteps={5} />);
      
      expect(screen.getByText('Step 3 of 5')).toBeInTheDocument();
    });

    it('should use default steps when not provided', () => {
      render(<ProgressIndicator currentStep={1} totalSteps={5} />);
      
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
    });
  });

  describe('Step Status', () => {
    it('should mark completed steps with checkmark', () => {
      render(<ProgressIndicator currentStep={3} totalSteps={5} steps={defaultSteps} />);
      
      // Steps 1 and 2 should be completed
      const step1 = screen.getByLabelText(/Step 1.*completed/);
      const step2 = screen.getByLabelText(/Step 2.*completed/);
      
      expect(step1).toBeInTheDocument();
      expect(step2).toBeInTheDocument();
    });

    it('should mark current step appropriately', () => {
      render(<ProgressIndicator currentStep={3} totalSteps={5} steps={defaultSteps} />);
      
      const currentStep = screen.getByLabelText(/Step 3.*current/);
      expect(currentStep).toBeInTheDocument();
      expect(currentStep).toHaveAttribute('aria-current', 'step');
    });

    it('should show step numbers for remaining steps', () => {
      render(<ProgressIndicator currentStep={2} totalSteps={5} steps={defaultSteps} />);
      
      // Steps 3, 4, 5 should show numbers
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should show 0% progress on first step', () => {
      render(<ProgressIndicator currentStep={1} totalSteps={5} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemin', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '5');
    });

    it('should show 100% progress on last step', () => {
      render(<ProgressIndicator currentStep={5} totalSteps={5} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
    });
  });

  describe('Clickable Navigation', () => {
    it('should make completed steps clickable when onStepClick is provided', () => {
      const onStepClick = vi.fn();
      render(
        <ProgressIndicator 
          currentStep={3} 
          totalSteps={5} 
          steps={defaultSteps}
          onStepClick={onStepClick}
        />
      );
      
      const step1 = screen.getByLabelText(/Step 1.*completed/);
      expect(step1).toHaveAttribute('role', 'button');
      expect(step1).toHaveAttribute('tabIndex', '0');
    });

    it('should call onStepClick when completed step is clicked', () => {
      const onStepClick = vi.fn();
      render(
        <ProgressIndicator 
          currentStep={3} 
          totalSteps={5} 
          steps={defaultSteps}
          onStepClick={onStepClick}
        />
      );
      
      const step1 = screen.getByLabelText(/Step 1.*completed/);
      fireEvent.click(step1);
      
      expect(onStepClick).toHaveBeenCalledWith(1);
    });

    it('should not make current or remaining steps clickable', () => {
      const onStepClick = vi.fn();
      render(
        <ProgressIndicator 
          currentStep={3} 
          totalSteps={5} 
          steps={defaultSteps}
          onStepClick={onStepClick}
        />
      );
      
      const step3 = screen.getByLabelText(/Step 3.*current/);
      const step4 = screen.getByLabelText(/Step 4/);
      
      expect(step3).toHaveAttribute('tabIndex', '-1');
      expect(step4).toHaveAttribute('tabIndex', '-1');
    });

    it('should handle keyboard navigation (Enter key)', () => {
      const onStepClick = vi.fn();
      render(
        <ProgressIndicator 
          currentStep={3} 
          totalSteps={5} 
          steps={defaultSteps}
          onStepClick={onStepClick}
        />
      );
      
      const step1 = screen.getByLabelText(/Step 1.*completed/);
      fireEvent.keyPress(step1, { key: 'Enter', code: 'Enter' });
      
      expect(onStepClick).toHaveBeenCalledWith(1);
    });

    it('should handle keyboard navigation (Space key)', () => {
      const onStepClick = vi.fn();
      render(
        <ProgressIndicator 
          currentStep={3} 
          totalSteps={5} 
          steps={defaultSteps}
          onStepClick={onStepClick}
        />
      );
      
      const step2 = screen.getByLabelText(/Step 2.*completed/);
      fireEvent.keyPress(step2, { key: ' ', code: 'Space' });
      
      expect(onStepClick).toHaveBeenCalledWith(2);
    });
  });

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      render(<ProgressIndicator currentStep={1} totalSteps={5} />);
      
      expect(screen.getByRole('navigation', { name: /form progress/i })).toBeInTheDocument();
    });

    it('should have proper ARIA labels for all steps', () => {
      render(<ProgressIndicator currentStep={2} totalSteps={5} steps={defaultSteps} />);
      
      expect(screen.getByLabelText(/Step 1.*completed/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Step 2.*current/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Step 3/)).toBeInTheDocument();
    });

    it('should announce step changes with aria-live', () => {
      render(<ProgressIndicator currentStep={3} totalSteps={5} />);
      
      const stepCounter = screen.getByText('Step 3 of 5');
      expect(stepCounter).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Responsive Design', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ProgressIndicator currentStep={1} totalSteps={5} className="custom-class" />
      );
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
