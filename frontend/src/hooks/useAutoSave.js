import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for auto-saving data after a period of inactivity
 * 
 * @param {Function} saveFunction - Function to call when saving (should return a Promise)
 * @param {number} delay - Delay in milliseconds before auto-save (default: 2000ms)
 * @returns {Object} - { isSaving, lastSaved, error, triggerSave }
 */
const useAutoSave = (saveFunction, delay = 2000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const saveFunctionRef = useRef(saveFunction);

  // Update saveFunction ref when it changes
  useEffect(() => {
    saveFunctionRef.current = saveFunction;
  }, [saveFunction]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Trigger auto-save after delay
   */
  const triggerSave = useCallback((data) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        setError(null);

        // Call save function
        await saveFunctionRef.current(data);

        // Update last saved timestamp
        setLastSaved(new Date());
        setIsSaving(false);
      } catch (err) {
        console.error('Auto-save error:', err);
        setError(err.message || 'فشل الحفظ التلقائي');
        setIsSaving(false);
      }
    }, delay);
  }, [delay]);

  /**
   * Cancel pending auto-save
   */
  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Force immediate save (bypass delay)
   */
  const forceSave = useCallback(async (data) => {
    // Cancel pending auto-save
    cancelAutoSave();

    try {
      setIsSaving(true);
      setError(null);

      // Call save function immediately
      await saveFunctionRef.current(data);

      // Update last saved timestamp
      setLastSaved(new Date());
      setIsSaving(false);
    } catch (err) {
      console.error('Force save error:', err);
      setError(err.message || 'فشل الحفظ');
      setIsSaving(false);
      throw err;
    }
  }, [cancelAutoSave]);

  return {
    isSaving,
    lastSaved,
    error,
    triggerSave,
    cancelAutoSave,
    forceSave
  };
};

export default useAutoSave;
