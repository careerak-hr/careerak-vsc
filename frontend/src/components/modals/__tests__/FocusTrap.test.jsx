import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFocusTrap } from '../../Accessibility/FocusTrap';

// Test modal component
const TestModal = ({ isOpen, onClose }) => {
  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div data-testid="modal-backdrop" onClick={onClose}>
      <div ref={modalRef} data-testid="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Test Modal</h2>
        <button data-testid="button-1">Button 1</button>
        <button data-testid="button-2">Button 2</button>
        <button data-testid="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// Test wrapper component
const TestWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerElement, setTriggerElement] = useState(null);

  const handleOpen = (e) => {
    setTriggerElement(e.target);
    setIsOpen(true);
  };

  return (
    <div>
      <button data-testid="trigger-button" onClick={handleOpen}>
        Open Modal
      </button>
      <TestModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

describe('FocusTrap', () => {
  describe('Focus Management', () => {
    test('should focus first focusable element when modal opens', async () => {
      render(<TestWrapper />);
      
      const triggerButton = screen.getByTestId('trigger-button');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        const button1 = screen.getByTestId('button-1');
        expect(button1).toHaveFocus();
      });
    });

    test('should restore focus to trigger element when modal closes', async () => {
      render(<TestWrapper />);
      
      const triggerButton = screen.getByTestId('trigger-button');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId('close-button');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(triggerButton).toHaveFocus();
      });
    });
  });

  describe('Tab Navigation', () => {
    test('should trap Tab key within modal', async () => {
      render(<TestWrapper />);
      
      const triggerButton = screen.getByTestId('trigger-button');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('button-1')).toHaveFocus();
      });

      // Tab to button 2
      fireEvent.keyDown(document, { key: 'Tab' });
      await waitFor(() => {
        expect(screen.getByTestId('button-2')).toHaveFocus();
      });

      // Tab to close button
      fireEvent.keyDown(document, { key: 'Tab' });
      await waitFor(() => {
        expect(screen.getByTestId('close-button')).toHaveFocus();
      });

      // Tab from last element should cycle to first
      fireEvent.keyDown(document, { key: 'Tab' });
      await waitFor(() => {
        expect(screen.getByTestId('button-1')).toHaveFocus();
      });
    });

    test('should trap Shift+Tab key within modal', async () => {
      render(<TestWrapper />);
      
      const triggerButton = screen.getByTestId('trigger-button');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('button-1')).toHaveFocus();
      });

      // Shift+Tab from first element should cycle to last
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      await waitFor(() => {
        expect(screen.getByTestId('close-button')).toHaveFocus();
      });

      // Shift+Tab to button 2
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      await waitFor(() => {
        expect(screen.getByTestId('button-2')).toHaveFocus();
      });
    });
  });

  describe('Escape Key', () => {
    test('should close modal when Escape is pressed', async () => {
      render(<TestWrapper />);
      
      const triggerButton = screen.getByTestId('trigger-button');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
      });
    });

    test('should restore focus after Escape closes modal', async () => {
      render(<TestWrapper />);
      
      const triggerButton = screen.getByTestId('trigger-button');
      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(screen.getByTestId('modal-content')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(triggerButton).toHaveFocus();
      });
    });
  });

  describe('Multiple Modals', () => {
    test('should handle multiple modals correctly', async () => {
      const MultiModalWrapper = () => {
        const [modal1Open, setModal1Open] = useState(false);
        const [modal2Open, setModal2Open] = useState(false);

        return (
          <div>
            <button data-testid="open-modal-1" onClick={() => setModal1Open(true)}>
              Open Modal 1
            </button>
            <TestModal isOpen={modal1Open} onClose={() => setModal1Open(false)} />
            
            <button data-testid="open-modal-2" onClick={() => setModal2Open(true)}>
              Open Modal 2
            </button>
            <TestModal isOpen={modal2Open} onClose={() => setModal2Open(false)} />
          </div>
        );
      };

      render(<MultiModalWrapper />);
      
      // Open first modal
      fireEvent.click(screen.getByTestId('open-modal-1'));
      await waitFor(() => {
        expect(screen.getAllByTestId('modal-content')[0]).toBeInTheDocument();
      });

      // Close first modal
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should not trap focus when modal is closed', () => {
      render(<TestWrapper />);
      
      const triggerButton = screen.getByTestId('trigger-button');
      
      // Tab should work normally when modal is closed
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // Modal should not be in the document
      expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
    });

    test('should handle disabled elements correctly', async () => {
      const ModalWithDisabled = ({ isOpen, onClose }) => {
        const modalRef = useFocusTrap(isOpen, onClose);

        if (!isOpen) return null;

        return (
          <div data-testid="modal-backdrop">
            <div ref={modalRef} data-testid="modal-content">
              <button data-testid="enabled-button">Enabled</button>
              <button data-testid="disabled-button" disabled>Disabled</button>
              <button data-testid="close-button" onClick={onClose}>Close</button>
            </div>
          </div>
        );
      };

      const Wrapper = () => {
        const [isOpen, setIsOpen] = useState(false);
        return (
          <div>
            <button data-testid="trigger" onClick={() => setIsOpen(true)}>Open</button>
            <ModalWithDisabled isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        );
      };

      render(<Wrapper />);
      
      fireEvent.click(screen.getByTestId('trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('enabled-button')).toHaveFocus();
      });

      // Tab should skip disabled button
      fireEvent.keyDown(document, { key: 'Tab' });
      await waitFor(() => {
        expect(screen.getByTestId('close-button')).toHaveFocus();
      });
    });
  });
});
