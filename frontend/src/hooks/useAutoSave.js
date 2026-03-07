import { useEffect, useRef, useCallback } from 'react';
import { useApplicationForm } from '../context/ApplicationContext';

/**
 * Custom hook for auto-saving application draft
 * Implements debounced save with 3 second delay
 * 
 * Requirements: 2.1, 2.6, 11.2
 */
export function useAutoSave(saveDraftFn, options = {}) {
  const {
    delay = 3000, // 3 seconds default
    enabled = true,
  } = options;

  const {
    formData,
    currentStep,
    draftId,
    setSaving,
    setDraftId,
    setLastSaved,
  } = useApplicationForm();

  const saveTimeoutRef = useRef(null);
  const previousDataRef = useRef(null);

  // Check if data has changed
  const hasDataChanged = useCallback(() => {
    if (!previousDataRef.current) return true;
    return JSON.stringify(formData) !== JSON.stringify(previousDataRef.current);
  }, [formData]);

  // Cancel scheduled save
  const cancelScheduledSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, []);

  // Force immediate save
  const forceSave = useCallback(async () => {
    if (!enabled || !saveDraftFn) return;

    cancelScheduledSave();

    try {
      setSaving(true);
      
      const result = await saveDraftFn({
        draftId,
        currentStep,
        formData,
      });

      if (result && result.draftId) {
        setDraftId(result.draftId);
        setLastSaved(new Date());
        previousDataRef.current = JSON.parse(JSON.stringify(formData));
      }

      return result;
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [
    enabled,
    saveDraftFn,
    draftId,
    currentStep,
    formData,
    setSaving,
    setDraftId,
    setLastSaved,
    cancelScheduledSave,
  ]);

  // Schedule auto-save
  const scheduleSave = useCallback(() => {
    if (!enabled || !saveDraftFn || !hasDataChanged()) return;

    cancelScheduledSave();

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await forceSave();
      } catch (error) {
        // Error already logged in forceSave
        // Could trigger local storage fallback here
      }
    }, delay);
  }, [enabled, saveDraftFn, hasDataChanged, cancelScheduledSave, forceSave, delay]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    scheduleSave();

    return () => {
      cancelScheduledSave();
    };
  }, [formData, currentStep, enabled, scheduleSave, cancelScheduledSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelScheduledSave();
    };
  }, [cancelScheduledSave]);

  return {
    forceSave,
    cancelScheduledSave,
    isScheduled: !!saveTimeoutRef.current,
  };
}

export default useAutoSave;
