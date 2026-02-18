import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useFocusTrap } from '../../Accessibility/FocusTrap';

/**
 * Integration Test: Escape Key Handler with useFocusTrap
 * 
 * Validates: Requirements FR-A11Y-5
 * "When the user presses Escape, the system shall close open modals or dropdowns"
 * 
 * Tests the core useFocusTrap hook functionality
 */

// Simple test component
const TestModal = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div data-testid="modal-backdrop">
      <div ref={modalRef} data-testid="modal-content">
        <h2>Test Modal</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

describe('Escape Key Integration Tests', () => {
  it('should call onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(<TestModal isOpen={true} onClose={onClose} />);

    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Verify onClose was called
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal is not open', () => {
    const onClose = jest.fn();
    render(<TestModal isOpen={false} onClose={onClose} />);

    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Verify onClose was NOT called
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not call onClose when other keys are pressed', () => {
    const onClose = jest.fn();
    render(<TestModal isOpen={true} onClose={onClose} />);

    // Press other keys
    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space', code: 'Space' });
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });

    // Verify onClose was NOT called
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should trap focus within modal', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<TestModal isOpen={true} onClose={onClose} />);

    const modalContent = getByTestId('modal-content');
    const button = modalContent.querySelector('button');

    // Focus should be on the button (first focusable element)
    expect(document.activeElement).toBe(button);
  });

  it('should restore focus after modal closes', () => {
    // Create a button outside the modal
    const externalButton = document.createElement('button');
    externalButton.textContent = 'External Button';
    document.body.appendChild(externalButton);
    externalButton.focus();

    const onClose = jest.fn();
    const { unmount } = render(<TestModal isOpen={true} onClose={onClose} />);

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Unmount modal (simulating close)
    unmount();

    // Focus should be restored to external button
    expect(document.activeElement).toBe(externalButton);

    // Cleanup
    document.body.removeChild(externalButton);
  });

  it('should handle multiple modals correctly', () => {
    const onClose1 = jest.fn();
    const onClose2 = jest.fn();

    const { rerender } = render(
      <>
        <TestModal isOpen={true} onClose={onClose1} />
        <TestModal isOpen={false} onClose={onClose2} />
      </>
    );

    // Press Escape - should only close the open modal
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(onClose1).toHaveBeenCalledTimes(1);
    expect(onClose2).not.toHaveBeenCalled();
  });

  it('should work with preventDefault', () => {
    const onClose = jest.fn();
    render(<TestModal isOpen={true} onClose={onClose} />);

    // Create a custom event with preventDefault
    const event = new KeyboardEvent('keydown', { 
      key: 'Escape', 
      code: 'Escape',
      bubbles: true,
      cancelable: true
    });

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    document.dispatchEvent(event);

    // Verify preventDefault was called
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Escape Key - Accessibility Compliance', () => {
  it('should meet WCAG 2.1 Success Criterion 2.1.2 (No Keyboard Trap)', () => {
    const onClose = jest.fn();
    const { unmount } = render(<TestModal isOpen={true} onClose={onClose} />);

    // User should be able to escape the modal with Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(onClose).toHaveBeenCalled();

    // Cleanup
    unmount();
  });

  it('should meet WCAG 2.1 Success Criterion 2.4.3 (Focus Order)', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<TestModal isOpen={true} onClose={onClose} />);

    const modalContent = getByTestId('modal-content');
    const button = modalContent.querySelector('button');

    // Focus should be on first focusable element
    expect(document.activeElement).toBe(button);

    // Tab should cycle through focusable elements
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });

    // Focus should still be within modal
    expect(modalContent.contains(document.activeElement)).toBe(true);
  });
});
