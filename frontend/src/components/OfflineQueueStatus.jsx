import React from 'react';
import { useOfflineContext } from '../context/OfflineContext';
import './OfflineQueueStatus.css';

/**
 * OfflineQueueStatus Component
 * 
 * Displays the status of queued offline requests
 * Shows queue size, processing status, and retry results
 * 
 * Requirements:
 * - FR-PWA-9: Queue failed API requests when offline and retry when online
 * - NFR-REL-3: Queue failed API requests when offline and retry when online
 */
const OfflineQueueStatus = () => {
  const {
    isOnline,
    queueSize,
    isProcessingQueue,
    retryResults,
    retryQueue,
    clearQueue
  } = useOfflineContext();

  // Don't show if queue is empty and not processing
  if (queueSize === 0 && !isProcessingQueue && !retryResults) {
    return null;
  }

  return (
    <div className="offline-queue-status">
      {/* Queue Size Indicator */}
      {queueSize > 0 && !isProcessingQueue && (
        <div className="queue-indicator">
          <div className="queue-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M10 6V10L13 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="queue-info">
            <span className="queue-count">{queueSize}</span>
            <span className="queue-label">
              {queueSize === 1 ? 'request queued' : 'requests queued'}
            </span>
          </div>
          <div className="queue-actions">
            {isOnline && (
              <button
                className="retry-button"
                onClick={retryQueue}
                title="Retry queued requests"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C10.3869 2 12.4686 3.33566 13.4 5.25"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 2V5.5H9.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Retry
              </button>
            )}
            <button
              className="clear-button"
              onClick={clearQueue}
              title="Clear queue"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessingQueue && (
        <div className="processing-indicator">
          <div className="spinner"></div>
          <span>Retrying queued requests...</span>
        </div>
      )}

      {/* Retry Results */}
      {retryResults && (
        <div className="retry-results">
          <div className="results-summary">
            {retryResults.success > 0 && (
              <div className="result-item success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 4L6 11L3 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{retryResults.success} succeeded</span>
              </div>
            )}
            {retryResults.failed > 0 && (
              <div className="result-item failed">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{retryResults.failed} failed</span>
              </div>
            )}
            {retryResults.retry > 0 && (
              <div className="result-item retry">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>{retryResults.retry} will retry</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineQueueStatus;
