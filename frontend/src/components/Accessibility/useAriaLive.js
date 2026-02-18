import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useAriaLive Hook
 * 
 * A custom hook for managing ARIA live region announcements.
 * Provides a simple API for announcing messages to screen readers.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.clearDelay - Delay in ms before clearing message (default: 5000)
 * @param {string} options.politeness - Default politeness level (default: 'polite')
 * @returns {Object} Hook API
 * 
 * @example
 * const { announce, message, politeness } = useAriaLive();
 * 
 * // Announce a polite message
 * announce('Form submitted successfully');
 * 
 * // Announce an assertive message
 * announce('Error: Invalid input', 'assertive');
 */
const useAriaLive = (options = {}) => {
  const {
    clearDelay = 5000,
    politeness: defaultPoliteness = 'polite'
  } = options;

  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState(defaultPoliteness);
  const timeoutRef = useRef(null);

  /**
   * Announce a message to screen readers
   * @param {string} newMessage - The message to announce
   * @param {string} level - Politeness level ('polite' or 'assertive')
   */
  const announce = useCallback((newMessage, level = defaultPoliteness) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the new message and politeness level
    setMessage(newMessage);
    setPoliteness(level);

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useAriaLive ${level}]:`, newMessage);
    }

    // Clear message after delay
    if (clearDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, clearDelay);
    }
  }, [clearDelay, defaultPoliteness]);

  /**
   * Clear the current message immediately
   */
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage('');
  }, []);

  /**
   * Announce a success message (polite)
   */
  const announceSuccess = useCallback((successMessage) => {
    announce(successMessage, 'polite');
  }, [announce]);

  /**
   * Announce an error message (assertive)
   */
  const announceError = useCallback((errorMessage) => {
    announce(errorMessage, 'assertive');
  }, [announce]);

  /**
   * Announce a loading state (polite)
   */
  const announceLoading = useCallback((loadingMessage = 'Loading...') => {
    announce(loadingMessage, 'polite');
  }, [announce]);

  /**
   * Announce that loading is complete (polite)
   */
  const announceLoadingComplete = useCallback((completeMessage = 'Loading complete') => {
    announce(completeMessage, 'polite');
  }, [announce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    message,
    politeness,
    announce,
    clear,
    announceSuccess,
    announceError,
    announceLoading,
    announceLoadingComplete
  };
};

export default useAriaLive;
