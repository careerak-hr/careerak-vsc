import { debounce, batch, cache } from '../utils/performanceOptimization';

/**
 * Optimized Draft Service
 * Implements caching, batching, and debouncing for draft operations
 */
class OptimizedDraftService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.saveQueue = [];
    
    // Debounced save function - waits 3 seconds after last change
    this.debouncedSave = debounce(this.executeSave.bind(this), 3000);
    
    // Batched save function - groups multiple saves
    this.batchedSave = batch(this.executeBatchSave.bind(this), 1000);
  }

  /**
   * Save draft with debouncing
   * @param {string} jobPostingId - Job posting ID
   * @param {object} draftData - Draft data
   * @returns {Promise} Save promise
   */
  async saveDraft(jobPostingId, draftData) {
    // Add to queue
    this.saveQueue.push({ jobPostingId, draftData, timestamp: Date.now() });
    
    // Trigger debounced save
    return this.debouncedSave();
  }

  /**
   * Execute the actual save operation
   * @private
   */
  async executeSave() {
    if (this.saveQueue.length === 0) return;
    
    // Get the latest draft from queue
    const latestDraft = this.saveQueue[this.saveQueue.length - 1];
    this.saveQueue = [];
    
    try {
      const response = await fetch(`${this.apiUrl}/api/applications/drafts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(latestDraft.draftData)
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const result = await response.json();
      
      // Cache the result
      cache.set(`draft_${latestDraft.jobPostingId}`, result, 300000); // 5 minutes
      
      return result;
    } catch (error) {
      console.error('Error saving draft:', error);
      // Save to localStorage as fallback
      this.saveToLocalStorage(latestDraft.jobPostingId, latestDraft.draftData);
      throw error;
    }
  }

  /**
   * Execute batched save operations
   * @private
   * @param {Array} calls - Array of save calls
   */
  async executeBatchSave(calls) {
    // Group by jobPostingId and take the latest for each
    const grouped = calls.reduce((acc, [jobPostingId, draftData]) => {
      acc[jobPostingId] = draftData;
      return acc;
    }, {});

    // Save each draft
    const promises = Object.entries(grouped).map(([jobPostingId, draftData]) =>
      this.executeSave()
    );

    return Promise.all(promises);
  }

  /**
   * Load draft with caching
   * @param {string} jobPostingId - Job posting ID
   * @returns {Promise} Draft data
   */
  async loadDraft(jobPostingId) {
    // Check cache first
    const cached = cache.get(`draft_${jobPostingId}`);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/api/applications/drafts/${jobPostingId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to load draft');
      }

      const draft = await response.json();
      
      // Cache the result
      cache.set(`draft_${jobPostingId}`, draft, 300000); // 5 minutes
      
      return draft;
    } catch (error) {
      console.error('Error loading draft:', error);
      // Try localStorage fallback
      return this.loadFromLocalStorage(jobPostingId);
    }
  }

  /**
   * Force immediate save (bypasses debouncing)
   * @param {string} jobPostingId - Job posting ID
   * @param {object} draftData - Draft data
   * @returns {Promise} Save promise
   */
  async forceSave(jobPostingId, draftData) {
    this.saveQueue = [{ jobPostingId, draftData, timestamp: Date.now() }];
    return this.executeSave();
  }

  /**
   * Save to localStorage as fallback
   * @private
   */
  saveToLocalStorage(jobPostingId, draftData) {
    try {
      const key = `careerak_draft_${jobPostingId}`;
      localStorage.setItem(key, JSON.stringify({
        ...draftData,
        savedAt: new Date().toISOString(),
        source: 'localStorage'
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Load from localStorage
   * @private
   */
  loadFromLocalStorage(jobPostingId) {
    try {
      const key = `careerak_draft_${jobPostingId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear cache for a specific draft
   * @param {string} jobPostingId - Job posting ID
   */
  clearCache(jobPostingId) {
    cache.delete(`draft_${jobPostingId}`);
  }

  /**
   * Clear all caches
   */
  clearAllCaches() {
    cache.clear();
  }
}

export default new OptimizedDraftService();
