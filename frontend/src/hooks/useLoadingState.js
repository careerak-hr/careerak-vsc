import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 * @returns {object} Loading state and handlers
 */
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((err) => {
    setError(err);
    setIsLoading(false);
  }, []);

  const resetLoading = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  /**
   * Wrap an async function with loading state management
   */
  const withLoading = useCallback(async (asyncFn) => {
    startLoading();
    try {
      const result = await asyncFn();
      stopLoading();
      return result;
    } catch (err) {
      setLoadingError(err);
      throw err;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    resetLoading,
    withLoading
  };
};

export default useLoadingState;
