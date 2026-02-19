/**
 * Offline Request Queue Utility
 * 
 * Queues failed API requests when offline and retries them when connection is restored
 * 
 * Requirements:
 * - FR-PWA-9: Queue failed API requests when offline and retry when online
 * - NFR-REL-3: Queue failed API requests when offline and retry when online
 * 
 * Features:
 * - Automatic queuing of failed requests when offline
 * - Automatic retry when connection is restored
 * - Request deduplication
 * - Exponential backoff for retries
 * - Request prioritization
 * - Persistent storage (localStorage)
 * - Request expiration (24 hours)
 */

const QUEUE_STORAGE_KEY = 'careerak_offline_queue';
const MAX_QUEUE_SIZE = 50;
const MAX_REQUEST_AGE = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Request priority levels
 */
export const RequestPriority = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4
};

/**
 * Request types that should be queued
 */
const QUEUEABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * OfflineRequestQueue class
 * Manages queuing and retrying of failed API requests
 */
class OfflineRequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.retryCallbacks = new Map();
    this.loadQueue();
  }

  /**
   * Load queue from localStorage
   */
  loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        // Remove expired requests
        this.queue = this.queue.filter(req => 
          Date.now() - req.timestamp < MAX_REQUEST_AGE
        );
        this.saveQueue();
        console.log(`[OfflineQueue] Loaded ${this.queue.length} requests from storage`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Error loading queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Error saving queue:', error);
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId(request) {
    const { method, url, data } = request;
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}_${url}_${dataStr}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Check if request should be queued
   */
  shouldQueueRequest(request) {
    const { method } = request;
    return QUEUEABLE_METHODS.includes(method?.toUpperCase());
  }

  /**
   * Add request to queue
   * 
   * @param {Object} request - Request configuration
   * @param {string} request.method - HTTP method
   * @param {string} request.url - Request URL
   * @param {Object} request.data - Request body data
   * @param {Object} request.headers - Request headers
   * @param {number} request.priority - Request priority (1-4)
   * @returns {boolean} True if request was queued
   */
  enqueue(request) {
    // Check if request should be queued
    if (!this.shouldQueueRequest(request)) {
      console.log('[OfflineQueue] Request method not queueable:', request.method);
      return false;
    }

    // Check queue size limit
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      console.warn('[OfflineQueue] Queue is full, removing oldest request');
      this.queue.shift();
    }

    // Generate request ID for deduplication
    const requestId = this.generateRequestId(request);

    // Check if request already exists in queue
    const existingIndex = this.queue.findIndex(req => req.id === requestId);
    if (existingIndex !== -1) {
      console.log('[OfflineQueue] Request already in queue, updating:', requestId);
      this.queue[existingIndex] = {
        ...this.queue[existingIndex],
        ...request,
        timestamp: Date.now(),
        retryCount: 0
      };
    } else {
      // Add new request to queue
      const queuedRequest = {
        id: requestId,
        method: request.method,
        url: request.url,
        data: request.data,
        headers: request.headers || {},
        priority: request.priority || RequestPriority.MEDIUM,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: MAX_RETRY_ATTEMPTS
      };

      this.queue.push(queuedRequest);
      console.log('[OfflineQueue] Request queued:', requestId);
    }

    // Sort queue by priority (highest first)
    this.queue.sort((a, b) => b.priority - a.priority);

    // Save to localStorage
    this.saveQueue();

    return true;
  }

  /**
   * Remove request from queue
   */
  dequeue(requestId) {
    const index = this.queue.findIndex(req => req.id === requestId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.saveQueue();
      console.log('[OfflineQueue] Request removed from queue:', requestId);
      return true;
    }
    return false;
  }

  /**
   * Get all queued requests
   */
  getQueue() {
    return [...this.queue];
  }

  /**
   * Get queue size
   */
  getQueueSize() {
    return this.queue.length;
  }

  /**
   * Clear entire queue
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
    console.log('[OfflineQueue] Queue cleared');
  }

  /**
   * Register callback for retry events
   */
  onRetry(callback) {
    const id = Date.now() + Math.random();
    this.retryCallbacks.set(id, callback);
    return () => this.retryCallbacks.delete(id);
  }

  /**
   * Notify retry callbacks
   */
  notifyRetryCallbacks(event, data) {
    this.retryCallbacks.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('[OfflineQueue] Error in retry callback:', error);
      }
    });
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(retryCount) {
    return INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
  }

  /**
   * Retry a single request
   */
  async retryRequest(request, api) {
    const { id, method, url, data, headers, retryCount, maxRetries } = request;

    console.log(`[OfflineQueue] Retrying request (${retryCount + 1}/${maxRetries}):`, id);

    try {
      // Make API call
      const response = await api({
        method,
        url,
        data,
        headers
      });

      // Success - remove from queue
      this.dequeue(id);
      this.notifyRetryCallbacks('success', { request, response });
      console.log('[OfflineQueue] Request succeeded:', id);
      
      return { success: true, response };
    } catch (error) {
      console.error('[OfflineQueue] Request failed:', id, error.message);

      // Check if we should retry
      if (retryCount < maxRetries - 1) {
        // Update retry count
        const index = this.queue.findIndex(req => req.id === id);
        if (index !== -1) {
          this.queue[index].retryCount++;
          this.saveQueue();
        }

        this.notifyRetryCallbacks('retry', { request, error, retryCount: retryCount + 1 });
        
        return { success: false, retry: true, error };
      } else {
        // Max retries reached - remove from queue
        this.dequeue(id);
        this.notifyRetryCallbacks('failed', { request, error });
        console.error('[OfflineQueue] Max retries reached, removing request:', id);
        
        return { success: false, retry: false, error };
      }
    }
  }

  /**
   * Process entire queue
   * Retries all queued requests when connection is restored
   */
  async processQueue(api) {
    if (this.isProcessing) {
      console.log('[OfflineQueue] Already processing queue');
      return;
    }

    if (this.queue.length === 0) {
      console.log('[OfflineQueue] Queue is empty');
      return;
    }

    this.isProcessing = true;
    console.log(`[OfflineQueue] Processing ${this.queue.length} queued requests`);

    this.notifyRetryCallbacks('start', { queueSize: this.queue.length });

    const results = {
      success: 0,
      failed: 0,
      retry: 0
    };

    // Process requests sequentially with delays
    for (let i = 0; i < this.queue.length; i++) {
      const request = this.queue[i];
      
      // Calculate delay based on retry count
      const delay = this.calculateRetryDelay(request.retryCount);
      if (delay > 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const result = await this.retryRequest(request, api);
      
      if (result.success) {
        results.success++;
      } else if (result.retry) {
        results.retry++;
      } else {
        results.failed++;
      }
    }

    this.isProcessing = false;
    console.log('[OfflineQueue] Queue processing complete:', results);
    
    this.notifyRetryCallbacks('complete', results);

    return results;
  }
}

// Create singleton instance
const offlineQueue = new OfflineRequestQueue();

/**
 * Queue a failed request for retry when online
 * 
 * @param {Object} request - Request configuration
 * @returns {boolean} True if request was queued
 */
export const queueRequest = (request) => {
  return offlineQueue.enqueue(request);
};

/**
 * Process all queued requests
 * 
 * @param {Function} api - Axios instance or API function
 * @returns {Promise<Object>} Results of processing
 */
export const processQueue = (api) => {
  return offlineQueue.processQueue(api);
};

/**
 * Get current queue
 * 
 * @returns {Array} Array of queued requests
 */
export const getQueue = () => {
  return offlineQueue.getQueue();
};

/**
 * Get queue size
 * 
 * @returns {number} Number of queued requests
 */
export const getQueueSize = () => {
  return offlineQueue.getQueueSize();
};

/**
 * Clear queue
 */
export const clearQueue = () => {
  offlineQueue.clearQueue();
};

/**
 * Register callback for retry events
 * 
 * @param {Function} callback - Callback function (event, data) => void
 * @returns {Function} Unsubscribe function
 */
export const onRetry = (callback) => {
  return offlineQueue.onRetry(callback);
};

export default offlineQueue;
