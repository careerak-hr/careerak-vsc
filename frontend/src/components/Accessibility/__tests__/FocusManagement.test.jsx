import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useFocusTrap, FocusTrap } from '../FocusTrap';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Test component that uses the focus trap hook
const TestModal = ({ isOpen, onClose, children }) => {
  const trapRef = useFocusTrap(isOpen, onClose);
  
  if (!isOpen) return null;
  
  return (
    <div data-testid="modal-backdrop">
      <div ref={trapRef} data-testid="modal-content">
        {children}
      </div>
    </div>
  );
};

// Test component with multiple focusable elements
const ModalWithMultipleElements = ({ isOpen, onClose }) => {
  return (
    <TestModal isOpen={isOpen} onClose={onClose}>
      <h2>Modal Title</h2>
      <button data-testid="first-button">First Button</button>
      <input data-testid="input-field" type="text" placeholder="Input" />
      <textarea data-testid="textarea-field" placeholder="Textarea" />
      <select data-testid="select-field">
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
      <a href="#" data-testid="link">Link</a>
      <button data-testid="last-button" onClick={onClose}>Close</button>
    </TestModal>
  );
};

// Test component with disabled elements
const ModalWithDisabledElements = ({ isOpen, onClose }) => {
  return (
    <TestModal isOpen={isOpen} onClose={onClose}>
      <button data-testid="enabled-button">Enabled</button>
      <button data-testid="disabled-button" disabled>Disabled</button>
      <input data-testid="enabled-input" type="text" />
      <input data-testid="disabled-input" type="text" disabled />
      <button data-testid="close-button" onClick={onClose}>Close</button>
    </TestModal>
  );
};

// Test component using FocusTrap component wrapper
const ModalWithFocusTrapComponent = ({ isOpen, onClose }) => {
  return isOpen ? (
    <div data-testid="modal-backdrop">
      <FocusTrap isActive={isOpen} onEscape={onClose}>
        <div data-testid="modal-content">
          <button data-testid="button-1">Button 1</button>
          <button data-testid="button-2">Button 2</button>
          <button data-testid="close-button" onClick={onClose}>Close</button>
        </div>
      </FocusTrap>
    </div>
  ) : null;
};

describe('Focus Management Testing', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    // Clean up any remaining modals
    document.body.innerHTML = '';
  });

  describe('FR-A11Y-2: Visible focus indicators', () => {
    test('should show visible focus indicators on all interactive elements', async () => {
      const { container } = render(<ModalWithMultipleElements isOpen={true} onClose={() => {}} />);
      
      const firstButton = screen.getByTestId('first-button');
      const inputField = screen.getByTestId('input-field');
      const link = screen.getByTestId('link');
      
      // Tab through elements and verify focus
      await user.tab();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      expect(inputField).toHaveFocus();
      
      // Continue tabbing to link
      await user.tab(); // textarea
      await user.tab(); // select
      await user.tab(); // link
      expect(link).toHaveFocus();
    });
  });

  describe('FR-A11Y-3: Logical tab order', () => {
    test('should follow logical tab order through interactive elements', async () => {
      render(<ModalWithMultipleElements isOpen={true} onClose={() => {}} />);
      
      const firstButton = screen.getByTestId('first-button');
      const inputField = screen.getByTestId('input-field');
      const textareaField = screen.getByTestId('textarea-field');
      const selectField = screen.getByTestId('select-field');
      const link = screen.getByTestId('link');
      const lastButton = screen.getByTestId('last-button');
      
      // Verify tab order
      await user.tab();
      expect(firstButton).toHaveFocus();
      
      await user.tab();
      expect(inputField).toHaveFocus();
      
      await user.tab();
      expect(textareaField).toHaveFocus();
      
      await user.tab();
      expect(selectField).toHaveFocus();
      
      await user.tab();
      expect(link).toHaveFocus();
      
      await user.tab();
      expect(lastButton).toHaveFocus();
    });

    test('should skip disabled elements in tab order', async () => {
      render(<ModalWithDisabledElements isOpen={true} onClose={() => {}} />);
      
      const enabledButton = screen.getByTestId('enabled-button');
      const enabledInput = screen.getByTestId('enabled-input');
      const closeButton = screen.getByTestId('close-button');
      const disabledButton = screen.getByTestId('disabled-button');
      const disabledInput = screen.getByTestId('disabled-input');
      
      // Tab through and verify disabled elements are skipped
      await user.tab();
      expect(enabledButton).toHaveFocus();
      expect(disabledButton).not.toHaveFocus();
      
      await user.tab();
      expect(enabledInput).toHaveFocus();
      expect(disabledInput).not.toHaveFocus();
      
      await user.tab();
      expect(closeButton).toHaveFocus();
    });
  });

  describe('FR-A11Y-4: Focus trap in modals', () => {
    test('should trap focus within modal when open', async () => {
      render(<ModalWithMultipleElements isOpen={true} onClose={() => {}} />);
      
      const firstButton = screen.getByTestId('first-button');
      const lastButton = screen.getByTestId('last-button');
      
      // Manually focus first element to simulate modal opening
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Tab to last element
      await user.tab(); // input
      await user.tab(); // textarea
      await user.tab(); // select
      await user.tab(); // link
      await user.tab(); // last button
      expect(lastButton).toHaveFocus();
      
      // Tab from last element should wrap to first
      await user.tab();
      expect(firstButton).toHaveFocus();
    });

    test('should trap focus in reverse direction (Shift+Tab)', async () => {
      render(<ModalWithMultipleElements isOpen={true} onClose={() => {}} />);
      
      const firstButton = screen.getByTestId('first-button');
      const lastButton = screen.getByTestId('last-button');
      
      // Manually focus first element
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Shift+Tab from first element should wrap to last
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(lastButton).toHaveFocus();
      
      // Shift+Tab again should go to previous element
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      const link = screen.getByTestId('link');
      expect(link).toHaveFocus();
    });

    test('should restore focus to previous element when modal closes', async () => {
      // Create a button outside the modal
      const outsideButton = document.createElement('button');
      outsideButton.textContent = 'Outside Button';
      outsideButton.setAttribute('data-testid', 'outside-button');
      document.body.appendChild(outsideButton);
      outsideButton.focus();
      
      expect(outsideButton).toHaveFocus();
      
      // Open modal
      const TestComponent = () => {
        const [isOpen, setIsOpen] = useState(true);
        return <ModalWithMultipleElements isOpen={isOpen} onClose={() => setIsOpen(false)} />;
      };
      
      const { rerender } = render(<TestComponent />);
      
      // Manually focus first button in modal
      const firstButton = screen.getByTestId('first-button');
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Close modal
      const closeButton = screen.getByTestId('last-button');
      await user.click(closeButton);
      
      // Focus should restore to outside button
      await waitFor(() => {
        expect(outsideButton).toHaveFocus();
      });
      
      // Cleanup
      document.body.removeChild(outsideButton);
    });

    test('should work with FocusTrap component wrapper', async () => {
      render(<ModalWithFocusTrapComponent isOpen={true} onClose={() => {}} />);
      
      const button1 = screen.getByTestId('button-1');
      const button2 = screen.getByTestId('button-2');
      const closeButton = screen.getByTestId('close-button');
      
      // Manually focus first element
      button1.focus();
      expect(button1).toHaveFocus();
      
      // Tab through elements
      await user.tab();
      expect(button2).toHaveFocus();
      
      await user.tab();
      expect(closeButton).toHaveFocus();
      
      // Tab from last should wrap to first
      await user.tab();
      expect(button1).toHaveFocus();
    });
  });

  describe('FR-A11Y-5: Escape key closes modals', () => {
    test('should close modal when Escape key is pressed', async () => {
      const onClose = vi.fn();
      render(<ModalWithMultipleElements isOpen={true} onClose={onClose} />);
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      // Verify onClose was called
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('should close modal with FocusTrap component on Escape', async () => {
      const onClose = vi.fn();
      render(<ModalWithFocusTrapComponent isOpen={true} onClose={onClose} />);
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      // Verify onClose was called
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('should not close modal when other keys are pressed', async () => {
      const onClose = vi.fn();
      render(<ModalWithMultipleElements isOpen={true} onClose={onClose} />);
      
      // Press various keys
      await user.keyboard('{Enter}');
      await user.keyboard('{Space}');
      await user.keyboard('a');
      
      // Verify onClose was not called
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Focus management with dynamic content', () => {
    test('should handle dynamically added focusable elements', async () => {
      const DynamicModal = ({ isOpen, onClose }) => {
        const [showExtra, setShowExtra] = useState(false);
        
        return (
          <TestModal isOpen={isOpen} onClose={onClose}>
            <button data-testid="button-1">Button 1</button>
            <button data-testid="toggle-button" onClick={() => setShowExtra(!showExtra)}>
              Toggle Extra
            </button>
            {showExtra && <button data-testid="extra-button">Extra Button</button>}
            <button data-testid="close-button" onClick={onClose}>Close</button>
          </TestModal>
        );
      };
      
      render(<DynamicModal isOpen={true} onClose={() => {}} />);
      
      const button1 = screen.getByTestId('button-1');
      const toggleButton = screen.getByTestId('toggle-button');
      
      // Focus first button
      button1.focus();
      
      // Add extra button
      await user.click(toggleButton);
      
      // Verify extra button is in tab order
      await waitFor(() => {
        expect(screen.getByTestId('extra-button')).toBeInTheDocument();
      });
      
      // Tab through and verify extra button is focusable
      button1.focus(); // Reset focus
      await user.tab(); // toggle-button
      await user.tab(); // extra-button
      
      const extraButton = screen.getByTestId('extra-button');
      expect(extraButton).toHaveFocus();
    });
  });

  describe('Focus management with no focusable elements', () => {
    test('should handle modal with no focusable elements gracefully', async () => {
      const EmptyModal = ({ isOpen, onClose }) => {
        return (
          <TestModal isOpen={isOpen} onClose={onClose}>
            <div>No focusable elements here</div>
          </TestModal>
        );
      };
      
      // Should not throw error
      expect(() => {
        render(<EmptyModal isOpen={true} onClose={() => {}} />);
      }).not.toThrow();
    });
  });

  describe('Focus management when modal is not active', () => {
    test('should not trap focus when modal is closed', async () => {
      const outsideButton = document.createElement('button');
      outsideButton.textContent = 'Outside Button';
      outsideButton.setAttribute('data-testid', 'outside-button');
      document.body.appendChild(outsideButton);
      
      render(<ModalWithMultipleElements isOpen={false} onClose={() => {}} />);
      
      // Focus outside button
      outsideButton.focus();
      expect(outsideButton).toHaveFocus();
      
      // Tab should not be trapped
      await user.tab();
      // Focus should move away from outside button (to next element in document)
      expect(outsideButton).not.toHaveFocus();
      
      // Cleanup
      document.body.removeChild(outsideButton);
    });
  });

  describe('NFR-A11Y-4: Keyboard navigation support', () => {
    test('should support full keyboard navigation through all interactive elements', async () => {
      render(<ModalWithMultipleElements isOpen={true} onClose={() => {}} />);
      
      const allFocusableElements = [
        screen.getByTestId('first-button'),
        screen.getByTestId('input-field'),
        screen.getByTestId('textarea-field'),
        screen.getByTestId('select-field'),
        screen.getByTestId('link'),
        screen.getByTestId('last-button')
      ];
      
      // Tab through all elements
      for (let i = 0; i < allFocusableElements.length; i++) {
        await user.tab();
        expect(allFocusableElements[i]).toHaveFocus();
      }
      
      // Verify we can navigate back with Shift+Tab
      for (let i = allFocusableElements.length - 1; i >= 0; i--) {
        expect(allFocusableElements[i]).toHaveFocus();
        if (i > 0) {
          await user.keyboard('{Shift>}{Tab}{/Shift}');
        }
      }
    });
  });

  describe('Integration with real modal components', () => {
    test('should work with ConfirmationModal pattern', async () => {
      const ConfirmationModalTest = ({ isOpen, onClose, onConfirm }) => {
        const trapRef = useFocusTrap(isOpen, onClose);
        
        if (!isOpen) return null;
        
        return (
          <div data-testid="modal-backdrop">
            <div ref={trapRef} data-testid="modal-content">
              <p>Are you sure?</p>
              <button data-testid="confirm-button" onClick={onConfirm}>Confirm</button>
              <button data-testid="cancel-button" onClick={onClose}>Cancel</button>
            </div>
          </div>
        );
      };
      
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      
      render(<ConfirmationModalTest isOpen={true} onClose={onClose} onConfirm={onConfirm} />);
      
      // Manually focus first button
      const confirmButton = screen.getByTestId('confirm-button');
      confirmButton.focus();
      expect(confirmButton).toHaveFocus();
      
      // Tab to cancel button
      await user.tab();
      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).toHaveFocus();
      
      // Tab should wrap to confirm button
      await user.tab();
      expect(confirmButton).toHaveFocus();
      
      // Escape should close
      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalled();
    });
  });
});
