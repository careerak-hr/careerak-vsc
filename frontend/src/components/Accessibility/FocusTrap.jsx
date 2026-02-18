import { useEffect, useRef } from 'react';

/**
 * FocusTrap Hook
 * 
 * Traps focus within a container element (e.g., modal, dropdown)
 * Meets WCAG 2.1 Success Criterion 2.4.3 (Focus Order)
 * 
 * Usage:
 * const trapRef = useFocusTrap(isOpen);
 * <div ref={trapRef}>...</div>
 * 
 * @param {boolean} isActive - Whether the focus trap is active
 * @param {function} onEscape - Optional callback when Escape is pressed
 * @returns {React.RefObject} - Ref to attach to the container element
 */
export const useFocusTrap = (isActive, onEscape = null) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the element that had focus before the trap activated
    previousFocusRef.current = document.activeElement;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');

      return Array.from(
        containerRef.current.querySelectorAll(focusableSelectors)
      ).filter(el => {
        // Filter out hidden elements
        return el.offsetParent !== null;
      });
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key to trap focus
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> focus last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: restore focus to previous element
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, onEscape]);

  return containerRef;
};

/**
 * FocusTrap Component
 * 
 * Component wrapper for focus trap functionality
 * 
 * Usage:
 * <FocusTrap isActive={isOpen} onEscape={handleClose}>
 *   <div>Modal content</div>
 * </FocusTrap>
 */
export const FocusTrap = ({ children, isActive, onEscape }) => {
  const trapRef = useFocusTrap(isActive, onEscape);

  return (
    <div ref={trapRef}>
      {children}
    </div>
  );
};

export default FocusTrap;
