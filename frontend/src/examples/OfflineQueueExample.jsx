import React, { useState } from 'react';
import { useOfflineContext } from '../context/OfflineContext';
import api from '../services/api';
import { RequestPriority } from '../utils/offlineRequestQueue';

/**
 * OfflineQueueExample Component
 * 
 * Demonstrates how to use the offline request queue functionality
 * 
 * Features:
 * - Automatic queuing of failed requests when offline
 * - Manual queuing of requests
 * - Viewing queued requests
 * - Manual retry of queue
 * - Clearing queue
 * 
 * Requirements:
 * - FR-PWA-9: Queue failed API requests when offline and retry when online
 * - NFR-REL-3: Queue failed API requests when offline and retry when online
 */
const OfflineQueueExample = () => {
  const {
    isOnline,
    isOffline,
    queueSize,
    isProcessingQueue,
    retryResults,
    queueRequest,
    getQueuedRequests,
    retryQueue,
    clearQueue
  } = useOfflineContext();

  const [testResult, setTestResult] = useState(null);
  const [queuedRequests, setQueuedRequests] = useState([]);

  /**
   * Example 1: Automatic Queuing
   * When you make an API call and it fails due to network error,
   * it will be automatically queued
   */
  const testAutomaticQueuing = async () => {
    setTestResult('Testing automatic queuing...');
    
    try {
      // This will fail if offline and be automatically queued
      await api.post('/test/endpoint', {
        message: 'This is a test request',
        timestamp: Date.now()
      });
      
      setTestResult('✅ Request succeeded (you are online)');
    } catch (error) {
      if (isOffline) {
        setTestResult('✅ Request failed and was automatically queued');
      } else {
        setTestResult(`❌ Request failed: ${error.message}`);
      }
    }
  };

  /**
   * Example 2: Manual Queuing
   * You can manually queue a request with custom priority
   */
  const testManualQueuing = () => {
    const request = {
      method: 'POST',
      url: '/api/manual-test',
      data: {
        message: 'Manually queued request',
        timestamp: Date.now()
      },
      priority: RequestPriority.HIGH
    };

    const queued = queueRequest(request);
    
    if (queued) {
      setTestResult('✅ Request manually queued with HIGH priority');
    } else {
      setTestResult('❌ Failed to queue request (method not queueable)');
    }
  };

  /**
   * Example 3: View Queued Requests
   */
  const viewQueuedRequests = () => {
    const requests = getQueuedRequests();
    setQueuedRequests(requests);
    setTestResult(`📋 Viewing ${requests.length} queued requests`);
  };

  /**
   * Example 4: Manual Retry
   */
  const testManualRetry = async () => {
    if (!isOnline) {
      setTestResult('❌ Cannot retry while offline');
      return;
    }

    if (queueSize === 0) {
      setTestResult('ℹ️ Queue is empty, nothing to retry');
      return;
    }

    setTestResult('🔄 Retrying queued requests...');
    
    try {
      const results = await retryQueue();
      setTestResult(
        `✅ Retry complete: ${results.success} succeeded, ${results.failed} failed, ${results.retry} will retry`
      );
    } catch (error) {
      setTestResult(`❌ Retry failed: ${error.message}`);
    }
  };

  /**
   * Example 5: Clear Queue
   */
  const testClearQueue = () => {
    clearQueue();
    setQueuedRequests([]);
    setTestResult('🗑️ Queue cleared');
  };

  /**
   * Example 6: Priority-based Queuing
   */
  const testPriorityQueuing = () => {
    // Queue multiple requests with different priorities
    const requests = [
      {
        method: 'POST',
        url: '/api/low-priority',
        data: { priority: 'low' },
        priority: RequestPriority.LOW
      },
      {
        method: 'POST',
        url: '/api/urgent',
        data: { priority: 'urgent' },
        priority: RequestPriority.URGENT
      },
      {
        method: 'POST',
        url: '/api/medium',
        data: { priority: 'medium' },
        priority: RequestPriority.MEDIUM
      },
      {
        method: 'POST',
        url: '/api/high',
        data: { priority: 'high' },
        priority: RequestPriority.HIGH
      }
    ];

    requests.forEach(req => queueRequest(req));
    
    setTestResult('✅ Queued 4 requests with different priorities (URGENT will be retried first)');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Offline Request Queue Examples</h1>

      {/* Status Display */}
      <div style={styles.statusCard}>
        <h2 style={styles.subtitle}>Current Status</h2>
        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Connection:</span>
            <span style={{
              ...styles.statusValue,
              color: isOnline ? '#4ade80' : '#f87171'
            }}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Queue Size:</span>
            <span style={styles.statusValue}>{queueSize}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Processing:</span>
            <span style={styles.statusValue}>
              {isProcessingQueue ? '⏳ Yes' : '✅ No'}
            </span>
          </div>
        </div>
        {retryResults && (
          <div style={styles.resultsBox}>
            <strong>Last Retry Results:</strong>
            <div>✅ Success: {retryResults.success}</div>
            <div>❌ Failed: {retryResults.failed}</div>
            <div>🔄 Retry: {retryResults.retry}</div>
          </div>
        )}
      </div>

      {/* Test Buttons */}
      <div style={styles.testSection}>
        <h2 style={styles.subtitle}>Test Examples</h2>
        <div style={styles.buttonGrid}>
          <button style={styles.button} onClick={testAutomaticQueuing}>
            1. Test Automatic Queuing
          </button>
          <button style={styles.button} onClick={testManualQueuing}>
            2. Test Manual Queuing
          </button>
          <button style={styles.button} onClick={viewQueuedRequests}>
            3. View Queued Requests
          </button>
          <button style={styles.button} onClick={testManualRetry} disabled={!isOnline}>
            4. Manual Retry
          </button>
          <button style={styles.button} onClick={testClearQueue}>
            5. Clear Queue
          </button>
          <button style={styles.button} onClick={testPriorityQueuing}>
            6. Test Priority Queuing
          </button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>Test Result:</h3>
          <p style={styles.resultText}>{testResult}</p>
        </div>
      )}

      {/* Queued Requests Display */}
      {queuedRequests.length > 0 && (
        <div style={styles.queueCard}>
          <h3 style={styles.subtitle}>Queued Requests ({queuedRequests.length})</h3>
          <div style={styles.requestList}>
            {queuedRequests.map((req, index) => (
              <div key={req.id} style={styles.requestItem}>
                <div style={styles.requestHeader}>
                  <span style={styles.requestMethod}>{req.method}</span>
                  <span style={styles.requestUrl}>{req.url}</span>
                  <span style={styles.requestPriority}>
                    Priority: {
                      req.priority === RequestPriority.URGENT ? '🔴 URGENT' :
                      req.priority === RequestPriority.HIGH ? '🟠 HIGH' :
                      req.priority === RequestPriority.MEDIUM ? '🟡 MEDIUM' :
                      '🟢 LOW'
                    }
                  </span>
                </div>
                <div style={styles.requestMeta}>
                  <span>Retry Count: {req.retryCount}/{req.maxRetries}</span>
                  <span>Queued: {new Date(req.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div style={styles.instructionsCard}>
        <h2 style={styles.subtitle}>How to Use</h2>
        <ol style={styles.instructionsList}>
          <li>
            <strong>Automatic Queuing:</strong> All POST, PUT, PATCH, DELETE requests
            that fail due to network errors are automatically queued.
          </li>
          <li>
            <strong>Manual Queuing:</strong> Use <code>queueRequest()</code> to manually
            queue a request with custom priority.
          </li>
          <li>
            <strong>Automatic Retry:</strong> When connection is restored, queued requests
            are automatically retried in priority order.
          </li>
          <li>
            <strong>Manual Retry:</strong> Use <code>retryQueue()</code> to manually
            trigger retry of all queued requests.
          </li>
          <li>
            <strong>Priority Levels:</strong> URGENT (4) → HIGH (3) → MEDIUM (2) → LOW (1)
          </li>
          <li>
            <strong>Persistence:</strong> Queue is saved to localStorage and survives
            page reloads.
          </li>
          <li>
            <strong>Expiration:</strong> Requests older than 24 hours are automatically
            removed from queue.
          </li>
        </ol>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Cormorant Garamond, serif'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#304B60',
    marginBottom: '20px'
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#304B60',
    marginBottom: '15px'
  },
  statusCard: {
    background: '#E3DAD1',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '2px solid #D48161'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLabel: {
    fontWeight: '600',
    color: '#304B60'
  },
  statusValue: {
    fontWeight: 'bold',
    fontSize: '18px'
  },
  resultsBox: {
    background: 'rgba(48, 75, 96, 0.1)',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  testSection: {
    marginBottom: '20px'
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },
  button: {
    padding: '12px 20px',
    background: '#304B60',
    color: '#E3DAD1',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  resultCard: {
    background: '#E3DAD1',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '2px solid #D48161'
  },
  resultTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#304B60',
    marginBottom: '10px'
  },
  resultText: {
    fontSize: '16px',
    color: '#304B60',
    margin: 0
  },
  queueCard: {
    background: '#E3DAD1',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '2px solid #D48161'
  },
  requestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  requestItem: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid rgba(48, 75, 96, 0.2)'
  },
  requestHeader: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  requestMethod: {
    padding: '4px 8px',
    background: '#304B60',
    color: '#E3DAD1',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  requestUrl: {
    flex: 1,
    fontSize: '14px',
    color: '#304B60',
    fontFamily: 'monospace'
  },
  requestPriority: {
    fontSize: '12px',
    fontWeight: '600'
  },
  requestMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: 'rgba(48, 75, 96, 0.7)'
  },
  instructionsCard: {
    background: '#E3DAD1',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #D48161'
  },
  instructionsList: {
    paddingLeft: '20px',
    lineHeight: '1.8'
  }
};

export default OfflineQueueExample;
