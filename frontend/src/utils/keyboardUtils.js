/**
 * Keyboard Accessibility Utilities
 * Provides helper functions for keyboard navigation and interaction
 */

/**
 * Handles Enter and Space key presses for custom button elements
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Function} callback - The function to call when Enter or Space is pressed
 * @param {boolean} preventDefault - Whether to prevent default behavior (default: true)
 */
export const handleButtonKeyDown = (event, callback, preventDefault = true) => {
  if (event.key === 'Enter' || event.key === ' ') {
    if (preventDefault) {
      event.preventDefault();
    }
    callback(event);
  }
};

/**
 * Returns props object for making a div behave like a button
 * @param {Function} onClick - The click handler function
 * @param {string} ariaLabel - Accessible label for the button
 * @param {Object} additionalProps - Additional props to merge
 * @returns {Object} Props object with role, tabIndex, onClick, onKeyDown, and aria-label
 */
export const getButtonProps = (onClick, ariaLabel, additionalProps = {}) => {
  return {
    role: 'button',
    tabIndex: 0,
    onClick,
    onKeyDown: (e) => handleButtonKeyDown(e, onClick),
    'aria-label': ariaLabel,
    ...additionalProps
  };
};

/**
 * Handles arrow key navigation between focusable elements
 * @param {KeyboardEvent} event - The keyboard event
 * @param {Array<HTMLElement>} elements - Array of focusable elements
 * @param {number} currentIndex - Current focused element index
 * @param {boolean} horizontal - Whether navigation is horizontal (default: false for vertical)
 */
export const handleArrowKeyNavigation = (event, elements, currentIndex, horizontal = false) => {
  const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
  const prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
  
  if (event.key === nextKey) {
    event.preventDefault();
    const nextIndex = (currentIndex + 1) % elements.length;
    elements[nextIndex]?.focus();
  } else if (event.key === prevKey) {
    event.preventDefault();
    const prevIndex = (currentIndex - 1 + elements.length) % elements.length;
    elements[prevIndex]?.focus();
  }
};

/**
 * Traps focus within a container (useful for modals)
 * @param {KeyboardEvent} event - The keyboard event
 * @param {HTMLElement} container - The container element
 */
export const trapFocus = (event, container) => {
  if (event.key !== 'Tab') return;

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
};
