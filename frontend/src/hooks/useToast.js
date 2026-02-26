import { useState, useCallback } from 'react';

/**
 * useToast Hook
 * 
 * Manages toast notifications state and provides methods to show/hide toasts
 * 
 * Returns:
 * - toast: Current toast object { message, type, id } or null
 * - showToast: Function to show a toast (message, type, duration)
 * - hideToast: Function to hide the current toast
 * 
 * Usage:
 * const { toast, showToast, hideToast } = useToast();
 * 
 * showToast('User deleted successfully', 'success');
 * showToast('Failed to save changes', 'error', 5000);
 */
const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToast({ message, type, id, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
};

export default useToast;
