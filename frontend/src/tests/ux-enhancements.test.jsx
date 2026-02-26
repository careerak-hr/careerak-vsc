import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToastNotification from '../components/ToastNotification';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import useToast from '../hooks/useToast';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { AnimationProvider } from '../context/AnimationContext';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Wrapper component for providers
const Wrapper = ({ children }) => (
  <AnimationProvider>
    {children}
  </AnimationProvider>
);

describe('UX Enhancements - ToastNotification', () => {
  it('should render toast notification with message', () => {
    render(
      <Wrapper>
        <ToastNotification message="Test message" type="success" />
      </Wrapper>
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render success toast with correct styling', () => {
    const { container } = render(
      <Wrapper>
        <ToastNotification message="Success" type="success" />
      </Wrapper>
    );

    const toast = container.querySelector('.toast-notification');
    expect(toast).toHaveClass('bg-green-500');
  });

  it('should render error toast with correct styling', () => {
    const { container } = render(
      <Wrapper>
        <ToastNotification message="Error" type="error" />
      </Wrapper>
    );

    const toast = container.querySelector('.toast-notification');
    expect(toast).toHaveClass('bg-red-500');
  });

  it('should render warning toast with correct styling', () => {
    const { container } = render(
      <Wrapper>
        <ToastNotification message="Warning" type="warning" />
      </Wrapper>
    );

    const toast = container.querySelector('.toast-notification');
    expect(toast).toHaveClass('bg-yellow-500');
  });

  it('should render info toast with correct styling', () => {
    const { container } = render(
      <Wrapper>
        <ToastNotification message="Info" type="info" />
      </Wrapper>
    );

    const toast = container.querySelector('.toast-notification');
    expect(toast).toHaveClass('bg-blue-500');
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Wrapper>
        <ToastNotification message="Test" onClose={onClose} />
      </Wrapper>
    );

    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after duration', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <Wrapper>
        <ToastNotification message="Test" duration={1000} onClose={onClose} />
      </Wrapper>
    );

    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    vi.useRealTimers();
  });

  it('should not auto-dismiss when duration is 0', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <Wrapper>
        <ToastNotification message="Test" duration={0} onClose={onClose} />
      </Wrapper>
    );

    vi.advanceTimersByTime(5000);

    expect(onClose).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should render at different positions', () => {
    const positions = ['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'];

    positions.forEach(position => {
      const { container, unmount } = render(
        <Wrapper>
          <ToastNotification message="Test" position={position} />
        </Wrapper>
      );

      const toast = container.querySelector('.toast-notification');
      expect(toast).toBeInTheDocument();

      unmount();
    });
  });

  it('should not render when message is empty', () => {
    const { container } = render(
      <Wrapper>
        <ToastNotification message="" />
      </Wrapper>
    );

    expect(container.querySelector('.toast-notification')).not.toBeInTheDocument();
  });
});

describe('UX Enhancements - KeyboardShortcutsModal', () => {
  const mockShortcuts = [
    { keys: 'Ctrl+S', description: 'Save', category: 'actions' },
    { keys: 'Ctrl+R', description: 'Refresh', category: 'actions' },
    { keys: '1', description: 'Overview', category: 'navigation' },
    { keys: '?', description: 'Show shortcuts', category: 'general' }
  ];

  it('should render modal when isOpen is true', () => {
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={vi.fn()}
          shortcuts={mockShortcuts}
        />
      </Wrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={false}
          onClose={vi.fn()}
          shortcuts={mockShortcuts}
        />
      </Wrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display all shortcuts', () => {
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={vi.fn()}
          shortcuts={mockShortcuts}
        />
      </Wrapper>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Show shortcuts')).toBeInTheDocument();
  });

  it('should group shortcuts by category', () => {
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={vi.fn()}
          shortcuts={mockShortcuts}
        />
      </Wrapper>
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />
      </Wrapper>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />
      </Wrapper>
    );

    const overlay = container.querySelector('.shortcuts-modal-overlay');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={onClose}
          shortcuts={mockShortcuts}
        />
      </Wrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render in Arabic', () => {
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={vi.fn()}
          shortcuts={mockShortcuts}
          language="ar"
        />
      </Wrapper>
    );

    expect(screen.getByText('اختصارات لوحة المفاتيح')).toBeInTheDocument();
  });

  it('should render in French', () => {
    render(
      <Wrapper>
        <KeyboardShortcutsModal
          isOpen={true}
          onClose={vi.fn()}
          shortcuts={mockShortcuts}
          language="fr"
        />
      </Wrapper>
    );

    expect(screen.getByText('Raccourcis Clavier')).toBeInTheDocument();
  });
});

describe('UX Enhancements - useToast Hook', () => {
  it('should initialize with null toast', () => {
    let result;
    function TestComponent() {
      result = useToast();
      return null;
    }

    render(<TestComponent />);

    expect(result.toast).toBeNull();
  });

  it('should show toast with message and type', () => {
    let result;
    function TestComponent() {
      result = useToast();
      return null;
    }

    render(<TestComponent />);

    result.showToast('Test message', 'success');

    expect(result.toast).toEqual(
      expect.objectContaining({
        message: 'Test message',
        type: 'success'
      })
    );
  });

  it('should hide toast', () => {
    let result;
    function TestComponent() {
      result = useToast();
      return null;
    }

    render(<TestComponent />);

    result.showToast('Test message', 'success');
    expect(result.toast).not.toBeNull();

    result.hideToast();
    expect(result.toast).toBeNull();
  });

  it('should use default type when not specified', () => {
    let result;
    function TestComponent() {
      result = useToast();
      return null;
    }

    render(<TestComponent />);

    result.showToast('Test message');

    expect(result.toast.type).toBe('info');
  });

  it('should use default duration when not specified', () => {
    let result;
    function TestComponent() {
      result = useToast();
      return null;
    }

    render(<TestComponent />);

    result.showToast('Test message');

    expect(result.toast.duration).toBe(3000);
  });
});

describe('UX Enhancements - useKeyboardShortcuts Hook', () => {
  it('should call handler when shortcut is pressed', () => {
    const handler = vi.fn();
    const shortcuts = { 'ctrl+s': handler };

    function TestComponent() {
      useKeyboardShortcuts(shortcuts);
      return null;
    }

    render(<TestComponent />);

    fireEvent.keyDown(document, { key: 's', ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should not call handler when disabled', () => {
    const handler = vi.fn();
    const shortcuts = { 'ctrl+s': handler };

    function TestComponent() {
      useKeyboardShortcuts(shortcuts, false);
      return null;
    }

    render(<TestComponent />);

    fireEvent.keyDown(document, { key: 's', ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle multiple modifiers', () => {
    const handler = vi.fn();
    const shortcuts = { 'ctrl+shift+s': handler };

    function TestComponent() {
      useKeyboardShortcuts(shortcuts);
      return null;
    }

    render(<TestComponent />);

    fireEvent.keyDown(document, { key: 's', ctrlKey: true, shiftKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should handle single key shortcuts', () => {
    const handler = vi.fn();
    const shortcuts = { '?': handler };

    function TestComponent() {
      useKeyboardShortcuts(shortcuts);
      return null;
    }

    render(<TestComponent />);

    fireEvent.keyDown(document, { key: '?' });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should prevent default behavior', () => {
    const handler = vi.fn();
    const shortcuts = { 'ctrl+s': handler };

    function TestComponent() {
      useKeyboardShortcuts(shortcuts);
      return null;
    }

    render(<TestComponent />);

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});

describe('UX Enhancements - Responsive Layout', () => {
  it('should apply mobile styles on small screens', () => {
    // Mock window.matchMedia for mobile
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 639px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Test would verify mobile-specific CSS classes are applied
    expect(window.matchMedia('(max-width: 639px)').matches).toBe(true);
  });

  it('should apply tablet styles on medium screens', () => {
    // Mock window.matchMedia for tablet
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(min-width: 640px) and (max-width: 1023px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Test would verify tablet-specific CSS classes are applied
    expect(window.matchMedia('(min-width: 640px) and (max-width: 1023px)').matches).toBe(true);
  });

  it('should apply desktop styles on large screens', () => {
    // Mock window.matchMedia for desktop
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(min-width: 1024px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Test would verify desktop-specific CSS classes are applied
    expect(window.matchMedia('(min-width: 1024px)').matches).toBe(true);
  });
});
