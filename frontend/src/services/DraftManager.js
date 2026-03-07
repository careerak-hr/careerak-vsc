/**
 * DraftManager
 * 
 * Manages draft applications with backend API integration
 * and local storage fallback.
 * 
 * Requirements: 2.3, 2.4, 11.1, 11.2
 */

const STORAGE_KEY_PREFIX = 'careerak_draft_';

class DraftManager {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl || process.env.REACT_APP_API_URL || process.env.VITE_API_URL || '';
  }

  /**
   * Get authentication token from storage
   * 
   * @private
   * @returns {string|null}
   */
  getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  /**
   * Save draft to backend
   * 
   * @param {string|undefined} draftId - Draft ID (undefined for new drafts)
   * @param {string} jobPostingId - Job posting ID
   * @param {number} step - Current step number
   * @param {object} formData - Form data
   * @param {Array} files - Uploaded files
   * @returns {Promise<string>} Draft ID
   */
  async saveDraft(draftId, jobPostingId, step, formData, files) {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const payload = {
      jobPostingId,
      step,
      formData,
      files
    };

    const url = `${this.apiBaseUrl}/api/applications/drafts`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Save failed' }));
      throw new Error(error.message || 'Failed to save draft');
    }

    const data = await response.json();
    return data.draftId;
  }

  /**
   * Load draft from backend
   * 
   * @param {string} jobPostingId - Job posting ID
   * @returns {Promise<object|null>} Draft data or null if not found
   */
  async loadDraft(jobPostingId) {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const url = `${this.apiBaseUrl}/api/applications/drafts/${jobPostingId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 404) {
      return null; // No draft found
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Load failed' }));
      throw new Error(error.message || 'Failed to load draft');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Delete draft from backend
   * 
   * @param {string} draftId - Draft ID
   * @returns {Promise<void>}
   */
  async deleteDraft(draftId) {
    const token = this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const url = `${this.apiBaseUrl}/api/applications/drafts/${draftId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Delete failed' }));
      throw new Error(error.message || 'Failed to delete draft');
    }
  }

  /**
   * Save draft to local storage
   * 
   * @param {string} jobPostingId - Job posting ID
   * @param {object} draft - Draft data
   */
  saveToLocalStorage(jobPostingId, draft) {
    try {
      const key = this.getStorageKey(jobPostingId);
      const data = JSON.stringify(draft);
      localStorage.setItem(key, data);
      console.log('[DraftManager] Saved to local storage:', key);
    } catch (error) {
      console.error('[DraftManager] Failed to save to local storage:', error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.cleanupOldDrafts();
        // Try again after cleanup
        try {
          const key = this.getStorageKey(jobPostingId);
          const data = JSON.stringify(draft);
          localStorage.setItem(key, data);
        } catch (retryError) {
          console.error('[DraftManager] Failed to save after cleanup:', retryError);
          throw new Error('Local storage quota exceeded');
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Load draft from local storage
   * 
   * @param {string} jobPostingId - Job posting ID
   * @returns {object|null} Draft data or null if not found
   */
  loadFromLocalStorage(jobPostingId) {
    try {
      const key = this.getStorageKey(jobPostingId);
      const data = localStorage.getItem(key);
      
      if (!data) {
        return null;
      }

      const draft = JSON.parse(data);
      console.log('[DraftManager] Loaded from local storage:', key);
      return draft;
    } catch (error) {
      console.error('[DraftManager] Failed to load from local storage:', error);
      return null;
    }
  }

  /**
   * Clear draft from local storage
   * 
   * @param {string} jobPostingId - Job posting ID
   */
  clearLocalStorage(jobPostingId) {
    try {
      const key = this.getStorageKey(jobPostingId);
      localStorage.removeItem(key);
      console.log('[DraftManager] Cleared local storage:', key);
    } catch (error) {
      console.error('[DraftManager] Failed to clear local storage:', error);
    }
  }

  /**
   * Get storage key for job posting
   * 
   * @private
   * @param {string} jobPostingId - Job posting ID
   * @returns {string}
   */
  getStorageKey(jobPostingId) {
    return `${STORAGE_KEY_PREFIX}${jobPostingId}`;
  }

  /**
   * Cleanup old drafts from local storage
   * 
   * @private
   */
  cleanupOldDrafts() {
    try {
      const keys = [];
      
      // Find all draft keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          keys.push(key);
        }
      }

      // Sort by last saved timestamp (oldest first)
      const drafts = keys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          return {
            key,
            lastSaved: new Date(data.lastSaved).getTime()
          };
        } catch {
          return { key, lastSaved: 0 };
        }
      }).sort((a, b) => a.lastSaved - b.lastSaved);

      // Remove oldest 25% of drafts
      const toRemove = Math.ceil(drafts.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        localStorage.removeItem(drafts[i].key);
        console.log('[DraftManager] Removed old draft:', drafts[i].key);
      }
    } catch (error) {
      console.error('[DraftManager] Failed to cleanup old drafts:', error);
    }
  }

  /**
   * Get all draft keys from local storage
   * 
   * @returns {Array<string>}
   */
  getAllLocalDraftKeys() {
    const keys = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.error('[DraftManager] Failed to get draft keys:', error);
    }

    return keys;
  }
}

export default DraftManager;
