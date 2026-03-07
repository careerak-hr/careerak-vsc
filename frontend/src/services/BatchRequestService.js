/**
 * Batch Request Service
 * Batches multiple API requests into a single call
 */
class BatchRequestService {
  constructor() {
    this.queue = [];
    this.batchTimeout = null;
    this.batchDelay = 50; // 50ms delay before sending batch
    this.maxBatchSize = 10;
  }

  /**
   * Add request to batch queue
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @returns {Promise} Request promise
   */
  add(endpoint, data) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        endpoint,
        data,
        resolve,
        reject
      });

      // If batch is full, send immediately
      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else {
        // Otherwise, schedule batch send
        this.scheduleBatch();
      }
    });
  }

  /**
   * Schedule batch send
   * @private
   */
  scheduleBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  /**
   * Send batched requests
   * @private
   */
  async flush() {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.maxBatchSize);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          requests: batch.map(({ endpoint, data }) => ({
            endpoint,
            data
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Batch request failed');
      }

      const results = await response.json();

      // Resolve individual promises
      batch.forEach((request, index) => {
        const result = results[index];
        if (result.success) {
          request.resolve(result.data);
        } else {
          request.reject(new Error(result.error));
        }
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach(request => {
        request.reject(error);
      });
    }

    // If there are more items in queue, schedule next batch
    if (this.queue.length > 0) {
      this.scheduleBatch();
    }
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

export default new BatchRequestService();
