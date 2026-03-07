/**
 * AutoSaveService
 * 
 * Handles automatic saving of draft applications with debouncing,
 * network failure detection, and local storage fallback.
 * 
 * Requirements: 2.1, 2.6, 11.2
 */

class AutoSaveService {
  constructor(draftManager, syncService) {
    this.draftManager = draftManager;
    this.syncService = syncService;
    this.saveTimeout = null;
    this.SAVE_DELAY = 3000; // 3 seconds
    this.isOnline = navigator.onLine;
    this.saveInProgress = false;
    
    // Monitor network status
    this.setupNetworkMonitoring();
  }

  /**
   * Setup network status monitoring
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[AutoSave] Network connection restored');
      // Trigger sync when connection is restored
      this.syncService.syncToBackend();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[AutoSave] Network connection lost');
    });
  }

  /**
   * Schedule a debounced save operation
   * 
   * @param {string|undefined} draftId - Draft ID (undefined for new drafts)
   * @param {string} jobPostingId - Job posting ID
   * @param {number} step - Current step number
   * @param {object} formData - Form data to save
   * @param {Array} files - Uploaded files
   * @param {Function} onSaveComplete - Callback on successful save
   * @param {Function} onSaveError - Callback on save error
   */
  scheduleSave(
    draftId,
    jobPostingId,
    step,
    formData,
    files,
    onSaveComplete,
    onSaveError
  ) {
    // Cancel any pending save
    this.cancelScheduledSave();

    // Schedule new save after delay
    this.saveTimeout = setTimeout(async () => {
      try {
        await this.executeSave(
          draftId,
          jobPostingId,
          step,
          formData,
          files,
          onSaveComplete,
          onSaveError
        );
      } catch (error) {
        console.error('[AutoSave] Scheduled save failed:', error);
        if (onSaveError) {
          onSaveError(error);
        }
      }
    }, this.SAVE_DELAY);

    console.log('[AutoSave] Save scheduled in', this.SAVE_DELAY, 'ms');
  }

  /**
   * Execute save operation immediately (force save)
   * 
   * @param {string|undefined} draftId - Draft ID
   * @param {string} jobPostingId - Job posting ID
   * @param {number} step - Current step number
   * @param {object} formData - Form data to save
   * @param {Array} files - Uploaded files
   * @returns {Promise<string>} Draft ID
   */
  async forceSave(draftId, jobPostingId, step, formData, files) {
    console.log('[AutoSave] Force save initiated');
    
    // Cancel any pending scheduled save
    this.cancelScheduledSave();

    return await this.executeSave(
      draftId,
      jobPostingId,
      step,
      formData,
      files,
      null,
      null
    );
  }

  /**
   * Execute the actual save operation
   * 
   * @private
   */
  async executeSave(
    draftId,
    jobPostingId,
    step,
    formData,
    files,
    onSaveComplete,
    onSaveError
  ) {
    if (this.saveInProgress) {
      console.log('[AutoSave] Save already in progress, skipping');
      return;
    }

    this.saveInProgress = true;

    try {
      let savedDraftId;

      if (this.isOnline) {
        // Try to save to backend
        try {
          savedDraftId = await this.draftManager.saveDraft(
            draftId,
            jobPostingId,
            step,
            formData,
            files
          );
          
          console.log('[AutoSave] Saved to backend successfully:', savedDraftId);
          
          // Clear local storage backup after successful backend save
          this.draftManager.clearLocalStorage(jobPostingId);
          
          if (onSaveComplete) {
            onSaveComplete(savedDraftId);
          }
          
          return savedDraftId;
        } catch (backendError) {
          console.error('[AutoSave] Backend save failed:', backendError);
          
          // Network failure detected - fallback to local storage
          this.handleNetworkFailure(
            jobPostingId,
            step,
            formData,
            files,
            draftId
          );
          
          if (onSaveError) {
            onSaveError(backendError);
          }
          
          throw backendError;
        }
      } else {
        // Offline - save to local storage
        console.log('[AutoSave] Offline - saving to local storage');
        this.handleNetworkFailure(
          jobPostingId,
          step,
          formData,
          files,
          draftId
        );
        
        if (onSaveComplete) {
          onSaveComplete(draftId || 'local');
        }
        
        return draftId || 'local';
      }
    } finally {
      this.saveInProgress = false;
    }
  }

  /**
   * Handle network failure by saving to local storage
   * 
   * @private
   */
  handleNetworkFailure(jobPostingId, step, formData, files, draftId) {
    console.log('[AutoSave] Saving to local storage as fallback');
    
    const draft = {
      draftId,
      jobPostingId,
      step,
      formData,
      files,
      lastSaved: new Date().toISOString(),
      version: Date.now() // For conflict resolution
    };

    this.draftManager.saveToLocalStorage(jobPostingId, draft);
    
    // Add to sync queue
    this.syncService.addToRetryQueue(draft);
  }

  /**
   * Cancel any scheduled save operation
   */
  cancelScheduledSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
      console.log('[AutoSave] Scheduled save cancelled');
    }
  }

  /**
   * Check if a save is currently in progress
   * 
   * @returns {boolean}
   */
  isSaving() {
    return this.saveInProgress;
  }

  /**
   * Check if device is online
   * 
   * @returns {boolean}
   */
  isDeviceOnline() {
    return this.isOnline;
  }

  /**
   * Cleanup - remove event listeners
   */
  destroy() {
    this.cancelScheduledSave();
    // Note: We don't remove network listeners as they're shared
  }
}

export default AutoSaveService;
