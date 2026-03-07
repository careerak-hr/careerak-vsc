/**
 * SyncService
 * 
 * Handles synchronization between local storage and backend,
 * conflict resolution, and retry queue for failed saves.
 * 
 * Requirements: 2.6, 11.3, 11.4, 11.6
 */

class SyncService {
  constructor(draftManager) {
    this.draftManager = draftManager;
    this.retryQueue = [];
    this.isSyncing = false;
    this.connectionListeners = [];
    this.isOnline = navigator.onLine;
    
    // Setup connection monitoring
    this.setupConnectionMonitoring();
  }

  /**
   * Setup connection monitoring
   */
  setupConnectionMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[SyncService] Connection restored');
      
      // Notify listeners
      this.connectionListeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('[SyncService] Listener error:', error);
        }
      });
      
      // Auto-sync when connection is restored
      this.syncToBackend();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[SyncService] Connection lost');
    });
  }

  /**
   * Register callback for connection restoration
   * 
   * @param {Function} callback - Callback function
   */
  onConnectionRestored(callback) {
    if (typeof callback === 'function') {
      this.connectionListeners.push(callback);
    }
  }

  /**
   * Add draft to retry queue
   * 
   * @param {object} draft - Draft data
   */
  addToRetryQueue(draft) {
    // Check if draft already in queue
    const existingIndex = this.retryQueue.findIndex(
      item => item.jobPostingId === draft.jobPostingId
    );

    if (existingIndex >= 0) {
      // Update existing entry with newer version
      this.retryQueue[existingIndex] = draft;
      console.log('[SyncService] Updated draft in retry queue:', draft.jobPostingId);
    } else {
      // Add new entry
      this.retryQueue.push(draft);
      console.log('[SyncService] Added draft to retry queue:', draft.jobPostingId);
    }
  }

  /**
   * Sync all local storage drafts to backend
   * 
   * @returns {Promise<object>} Sync results
   */
  async syncToBackend() {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!this.isOnline) {
      console.log('[SyncService] Device is offline, cannot sync');
      return { success: false, message: 'Device is offline' };
    }

    this.isSyncing = true;

    const results = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    };

    try {
      // Get all local draft keys
      const draftKeys = this.draftManager.getAllLocalDraftKeys();
      
      console.log('[SyncService] Starting sync for', draftKeys.length, 'drafts');

      for (const key of draftKeys) {
        try {
          // Extract job posting ID from key
          const jobPostingId = key.replace('careerak_draft_', '');
          
          // Load local draft
          const localDraft = this.draftManager.loadFromLocalStorage(jobPostingId);
          
          if (!localDraft) {
            console.warn('[SyncService] Could not load draft:', key);
            continue;
          }

          // Check for conflicts with backend
          const resolvedDraft = await this.resolveConflicts(jobPostingId, localDraft);
          
          // Sync to backend
          await this.draftManager.saveDraft(
            resolvedDraft.draftId,
            resolvedDraft.jobPostingId,
            resolvedDraft.step,
            resolvedDraft.formData,
            resolvedDraft.files
          );

          // Clear local storage after successful sync
          this.draftManager.clearLocalStorage(jobPostingId);
          
          results.synced++;
          console.log('[SyncService] Synced draft:', jobPostingId);
        } catch (error) {
          results.failed++;
          results.errors.push({
            key,
            error: error.message
          });
          console.error('[SyncService] Failed to sync draft:', key, error);
        }
      }

      // Process retry queue
      await this.processRetryQueue(results);

      console.log('[SyncService] Sync complete:', results);
      return results;
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
      results.success = false;
      results.errors.push({ error: error.message });
      return results;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process retry queue
   * 
   * @private
   * @param {object} results - Results object to update
   */
  async processRetryQueue(results) {
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const draft of queue) {
      try {
        await this.draftManager.saveDraft(
          draft.draftId,
          draft.jobPostingId,
          draft.step,
          draft.formData,
          draft.files
        );

        // Clear local storage after successful sync
        this.draftManager.clearLocalStorage(draft.jobPostingId);
        
        results.synced++;
        console.log('[SyncService] Synced queued draft:', draft.jobPostingId);
      } catch (error) {
        // Re-add to queue if still failing
        this.retryQueue.push(draft);
        results.failed++;
        results.errors.push({
          jobPostingId: draft.jobPostingId,
          error: error.message
        });
        console.error('[SyncService] Failed to sync queued draft:', draft.jobPostingId, error);
      }
    }
  }

  /**
   * Resolve conflicts between local and backend drafts
   * Uses timestamp-based resolution (most recent wins)
   * 
   * @param {string} jobPostingId - Job posting ID
   * @param {object} localDraft - Local draft data
   * @returns {Promise<object>} Resolved draft
   */
  async resolveConflicts(jobPostingId, localDraft) {
    try {
      // Try to load backend draft
      const backendDraft = await this.draftManager.loadDraft(jobPostingId);

      if (!backendDraft) {
        // No backend draft exists, use local
        console.log('[SyncService] No backend draft, using local');
        return localDraft;
      }

      // Compare timestamps
      const localTimestamp = new Date(localDraft.lastSaved).getTime();
      const backendTimestamp = new Date(backendDraft.lastSaved).getTime();

      if (localTimestamp > backendTimestamp) {
        // Local is newer
        console.log('[SyncService] Local draft is newer, using local');
        return {
          ...localDraft,
          draftId: backendDraft.draftId // Preserve backend draft ID
        };
      } else if (backendTimestamp > localTimestamp) {
        // Backend is newer
        console.log('[SyncService] Backend draft is newer, using backend');
        return backendDraft;
      } else {
        // Same timestamp, use version number as tiebreaker
        const localVersion = localDraft.version || 0;
        const backendVersion = backendDraft.version || 0;

        if (localVersion > backendVersion) {
          console.log('[SyncService] Local version is newer, using local');
          return {
            ...localDraft,
            draftId: backendDraft.draftId
          };
        } else {
          console.log('[SyncService] Backend version is newer or equal, using backend');
          return backendDraft;
        }
      }
    } catch (error) {
      // If backend check fails, use local draft
      console.warn('[SyncService] Could not check backend, using local:', error);
      return localDraft;
    }
  }

  /**
   * Check if sync is in progress
   * 
   * @returns {boolean}
   */
  isSyncInProgress() {
    return this.isSyncing;
  }

  /**
   * Get retry queue size
   * 
   * @returns {number}
   */
  getRetryQueueSize() {
    return this.retryQueue.length;
  }

  /**
   * Clear retry queue
   */
  clearRetryQueue() {
    this.retryQueue = [];
    console.log('[SyncService] Retry queue cleared');
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
    this.connectionListeners = [];
    // Note: We don't remove network listeners as they're shared
  }
}

export default SyncService;
