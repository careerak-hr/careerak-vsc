import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  queueRequest as queueOfflineRequest, 
  processQueue, 
  getQueue, 
  getQueueSize,
  clearQueue as clearOfflineQueue,
  onRetry
} from '../utils/offlineRequestQueue';
import api from '../services/api';

/**
 * Offline Detection Context
 * 
 * Provides offline/online status and related functionality throughout the app
 * 
 * Requirements:
 * - FR-PWA-9: Queue failed API requests when offline and retry when online
 * - NFR-REL-2: Maintain offline functionality for previously visited pages
 * - NFR-REL-3: Queue failed API requests when offline and retry when online
 */

const OfflineContext = createContext(null);

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [retryResults, setRetryResults] = useState(null);

  // Update queue size
  const updateQueueSize = useCallback(() => {
    const size = getQueueSize();
    setQueueSize(size);
  }, []);

  // Handler for when connection is restored
  const handleOnline = useCallback(async () => {
    console.log('[OfflineContext] Connection restored - now online');
    setIsOnline(true);
    
    // Mark that we were offline (for showing reconnection messages)
    if (!isOnline) {
      setWasOffline(true);
      
      // Clear the flag after 5 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 5000);

      // Process queued requests
      const currentQueueSize = getQueueSize();
      if (currentQueueSize > 0) {
        console.log(`[OfflineContext] Processing ${currentQueueSize} queued requests`);
        setIsProcessingQueue(true);
        
        try {
          const results = await processQueue(api);
          setRetryResults(results);
          console.log('[OfflineContext] Queue processing results:', results);
          
          // Clear results after 10 seconds
          setTimeout(() => {
            setRetryResults(null);
          }, 10000);
        } catch (error) {
          console.error('[OfflineContext] Error processing queue:', error);
        } finally {
          setIsProcessingQueue(false);
          updateQueueSize();
        }
      }
    }
  }, [isOnline, updateQueueSize]);

  // Handler for when connection is lost
  const handleOffline = useCallback(() => {
    console.log('[OfflineContext] Connection lost - now offline');
    setIsOnline(false);
  }, []);

  // Add request to offline queue
  const queueRequest = useCallback((request) => {
    console.log('[OfflineContext] Queueing request for retry when online:', request);
    const queued = queueOfflineRequest(request);
    if (queued) {
      updateQueueSize();
    }
    return queued;
  }, [updateQueueSize]);

  // Clear offline queue
  const clearQueue = useCallback(() => {
    console.log('[OfflineContext] Clearing offline queue');
    clearOfflineQueue();
    updateQueueSize();
  }, [updateQueueSize]);

  // Get queued requests
  const getQueuedRequests = useCallback(() => {
    return getQueue();
  }, []);

  // Manually trigger queue processing
  const retryQueue = useCallback(async () => {
    if (isProcessingQueue) {
      console.log('[OfflineContext] Already processing queue');
      return;
    }

    if (!isOnline) {
      console.log('[OfflineContext] Cannot retry queue while offline');
      return;
    }

    const currentQueueSize = getQueueSize();
    if (currentQueueSize === 0) {
      console.log('[OfflineContext] Queue is empty');
      return;
    }

    console.log(`[OfflineContext] Manually retrying ${currentQueueSize} queued requests`);
    setIsProcessingQueue(true);
    
    try {
      const results = await processQueue(api);
      setRetryResults(results);
      console.log('[OfflineContext] Queue processing results:', results);
      
      // Clear results after 10 seconds
      setTimeout(() => {
        setRetryResults(null);
      }, 10000);
      
      return results;
    } catch (error) {
      console.error('[OfflineContext] Error processing queue:', error);
      throw error;
    } finally {
      setIsProcessingQueue(false);
      updateQueueSize();
    }
  }, [isOnline, isProcessingQueue, updateQueueSize]);

  useEffect(() => {
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize queue size
    updateQueueSize();

    // Subscribe to retry events
    const unsubscribe = onRetry((event, data) => {
      console.log('[OfflineContext] Retry event:', event, data);
      if (event === 'complete') {
        updateQueueSize();
      }
    });

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, [handleOnline, handleOffline, updateQueueSize]);

  const value = {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    queueSize,
    isProcessingQueue,
    retryResults,
    queueRequest,
    clearQueue,
    getQueuedRequests,
    retryQueue
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

// Custom hook to use offline context
export const useOfflineContext = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
};

export default OfflineContext;
