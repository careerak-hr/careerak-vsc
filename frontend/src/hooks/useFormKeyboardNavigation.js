/**
 * useFormKeyboardNavigation Hook
 * 
 * Provides keyboard navigation functionality for multi-step forms.
 * 
 * Features:
 * - Keyboard shortcuts for common actions
 * - Focus management
 * - Trap focus in modals
 * - Handle Enter/Escape keys
 * 
 * Requirements: 9.1-9.10
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook for form keyboard navigation
 * @param {Object} options - Configuration options
 * @param {Function} options.onNext - Callback for next action
 * @param {Function} options.onPrevious - Callback for previous action
 * @param {Function} options.onSave - Callback for save action
 * @param {Function} options.onSubmit - Callback for submit action
 * @param {Function} options.onCancel - Callback for cancel action
 * @param {boolean} options.isLastStep - Whether this is the last step
 * @param {boolean} options.isFirstStep - Whether this is the first step
 * @param {boolean} options.disabled - Whether keyboard shortcuts are disabled
 */
export function useFormKeyboardNavigation({
  onNext,
  onPrevious,
  onSave,
  onSubmit,
  onCancel,
  isLastStep = false,
  isFirstStep = false,
  disabled = false
} = {}) {
  
  const handleKeyDown = useCallback((event) => {
    if (disabled) return;

    // Don't trigger shortcuts if user is typing in an input/textarea
    const target = event.target;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.tagName === 'SELECT' ||
                        target.isContentEditable;

    // Ctrl/Cmd + Enter: Next step or Submit
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (isLastStep && onSubmit) {
        onSubmit();
      } else if (onNext) {
        onNext();
      }
      return;
    }

    // Alt + N: Next step
    if (event.altKey && event.key.toLowerCase() === 'n' && !isInputField) {
      event.preventDefault();
      if (onNext) {
        onNext();
      }
      return;
    }

    // Alt + P: Previous step
    if (event.altKey && event.key.toLowerCase() === 'p' && !isInputField && !isFirstStep) {
      event.preventDefault();
      if (onPrevious) {
        onPrevious();
      }
      return;
    }

    // Ctrl/Cmd + S: Save draft
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (onSave) {
        onSave();
      }
      return;
    }

    // Escape: Cancel
    if (event.key === 'Escape' && !isInputField) {
      if (onCancel) {
        onCancel();
      }
      return;
    }
  }, [disabled, onNext, onPrevious, onSave, onSubmit, onCancel, isLastStep, isFirstStep]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    handleKeyDown
  };
}

/**
 * Hook for focus trapping in modals
 * @param {React.RefObject} containerRef - Reference to the modal container
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal should close
 */
export function useFocusTrap(containerRef, isOpen, onClose) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Store the element that had focus before opening
    previousFocusRef.current = document.activeElement;

    // Get all focusable elements
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

      return Array.from(containerRef.current.querySelectorAll(focusableSelectors));
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') {
        // Handle Escape key
        if (event.key === 'Escape' && onClose) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      }
      // Tab
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to previous element
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, containerRef, onClose]);
}

/**
 * Hook for managing focus on dynamic lists (education, experience, skills)
 * @param {Array} items - Array of items
 * @param {Function} onAdd - Callback when adding item
 * @param {Function} onRemove - Callback when removing item
 */
export function useListKeyboardNavigation(items, onAdd, onRemove) {
  const handleKeyDown = useCallback((event, index) => {
    // Alt + A: Add new entry
    if (event.altKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      if (onAdd) {
        onAdd();
      }
      return;
    }

    // Delete or Backspace: Remove entry (when focused on remove button)
    if ((event.key === 'Delete' || event.key === 'Backspace') && 
        event.target.classList.contains('remove-button')) {
      event.preventDefault();
      if (onRemove && index !== undefined) {
        onRemove(index);
      }
      return;
    }
  }, [onAdd, onRemove]);

  return {
    handleKeyDown
  };
}

/**
 * Hook for file upload keyboard navigation
 * @param {Function} onUpload - Callback when upload is triggered
 * @param {Function} onRemove - Callback when file is removed
 */
export function useFileUploadKeyboardNavigation(onUpload, onRemove) {
  const handleKeyDown = useCallback((event, fileId) => {
    // Enter or Space on drop zone: Trigger file selection
    if ((event.key === 'Enter' || event.key === ' ') && 
        event.target.classList.contains('drag-drop-zone')) {
      event.preventDefault();
      if (onUpload) {
        onUpload();
      }
      return;
    }

    // Delete or Backspace on file item: Remove file
    if ((event.key === 'Delete' || event.key === 'Backspace') && 
        event.target.classList.contains('remove-button')) {
      event.preventDefault();
      if (onRemove && fileId) {
        onRemove(fileId);
      }
      return;
    }
  }, [onUpload, onRemove]);

  return {
    handleKeyDown
  };
}

export default useFormKeyboardNavigation;
