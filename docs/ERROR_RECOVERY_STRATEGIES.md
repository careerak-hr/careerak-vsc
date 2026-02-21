# Error Recovery Strategies - Complete Guide

## Overview

The Error Recovery Strategies system provides advanced, intelligent error recovery mechanisms that go beyond simple retry logic. It implements multiple recovery strategies, circuit breaker patterns, state restoration, and graceful degradation to achieve a 95%+ error recovery success rate without full page reloads.

**Requirements Fulfilled:**
- FR-ERR-8: Reset error boundary and re-render component on retry
- NFR-REL-1: Recover from component errors without full page reload in 95% of cases

**Date Added:** 2026-02-21  
**Status:** ✅ Complete and Active

---

## Architecture

### Components

1. **ErrorRecoveryManager** - Core recovery orchestration
2. **RecoveryHistory** - Tracks recovery success rates
3. **CircuitBreaker** - Prevents repeated failures
4. **useErrorRecovery Hook** - React integration
5. **Integration with existing systems:**
   - RouteErrorBoundary
   - ComponentErrorBoundary
   - NetworkError component
   - Offline Request Queue

---

## Recovery Strategies

### 1. RETRY
Simple retry without delay.

**When Used:**
- First attempt at recovery
- Quick, transient errors
- Component errors with no state issues

**Example:**
```javascript
const result = await recoverFromError(error, {
  componentName: 'JobCard',
  retryFn: () => fetchJobData(jobId)
});
```

### 2. RETRY_WITH_BACKOFF
Retry with exponential backoff delays.

**When Used:**
- Network errors (timeout, server errors)
- Rate limiting errors
- Retryable errors after first attempt fails

**Backoff Schedule:**
- Attempt 1: 1 second delay
- Attempt 2: 2 seconds delay
- Attempt 3: 4 seconds delay

**Example:**
```javascript
const result = await recoverFromError(error, {
  componentName: 'JobPostingsPage',
  retryFn: () => api.get('/jobs'),
  retryCount: 1 // Triggers backoff strategy
});
```

### 3. FALLBACK_UI
Display fallback UI component.

**When Used:**
- Recovery attempts exhausted
- Circuit breaker is open
- Non-critical component failures

**Example:**
```javascript
const result = await recoverFromError(error, {
  componentName: 'ProfileImage',
  fallbackUI: <DefaultAvatar />
});
```

### 4. GRACEFUL_DEGRADATION
Reduce functionality but keep app working.

**When Used:**
- Critical errors that can't be recovered
- No fallback UI available
- Last resort before page reload

**Example:**
```javascript
// Returns minimal working state
{
  degraded: true,
  message: 'Some features are temporarily unavailable',
  error: error.message
}
```

### 5. STATE_RESTORATION
Restore previous working state.

**When Used:**
- Second retry attempt
- Component has saved state
- State-related errors

**Example:**
```javascript
// Save state before operations
saveComponentState('JobForm', formData);

// Later, if error occurs
const result = await recoverFromError(error, {
  componentName: 'JobForm',
  retryFn: (restoredState) => submitForm(restoredState)
});
```

### 6. CACHE_FALLBACK
Use cached data as fallback.

**When Used:**
- Network errors with cached data available
- API failures with recent cache
- Offline scenarios

**Example:**
```javascript
// Cache data on success
cacheDataForFallback('jobs-list', jobsData, 300000); // 5 min TTL

// Use cache on error
const result = await recoverFromError(error, {
  componentName: 'JobPostingsPage',
  cacheKey: 'jobs-list',
  hasCache: true
});
```

### 7. OFFLINE_QUEUE
Queue request for later retry when online.

**When Used:**
- Browser is offline
- Network connection lost
- POST/PUT/PATCH/DELETE requests

**Example:**
```javascript
const result = await recoverFromError(error, {
  componentName: 'JobApplicationForm',
  request: {
    method: 'POST',
    url: '/api/applications',
    data: applicationData
  }
});
// Request queued, will retry when online
```

### 8. CIRCUIT_BREAKER
Stop trying temporarily after repeated failures.

**When Used:**
- 5+ consecutive failures
- Prevents cascading failures
- Automatic after threshold reached

**States:**
- **CLOSED**: Normal operation
- **OPEN**: Stop trying (1 minute timeout)
- **HALF_OPEN**: Testing if recovered

**Example:**
```javascript
// Automatic - no manual intervention needed
// After 5 failures, circuit opens for 1 minute
// After 1 minute, allows 2 test attempts
// If tests succeed, circuit closes
```

### 9. RELOAD_COMPONENT
Force component re-mount.

**When Used:**
- Third retry attempt
- Component state corruption
- Before resorting to page reload

**Example:**
```javascript
const result = await recoverFromError(error, {
  componentName: 'JobPostingsPage',
  retryCount: 2, // Triggers component reload
  retryFn: () => fetchJobs()
});
```

### 10. RELOAD_PAGE
Full page reload (last resort).

**When Used:**
- All other strategies failed
- Critical application error
- Manual trigger only

**Example:**
```javascript
// Rarely used - last resort
window.location.reload();
```

---

## React Hook Usage

### Basic Usage

```jsx
import { useErrorRecovery } from '../hooks/useErrorRecovery';

const JobPostingsPage = () => {
  const [jobs, setJobs] = useState([]);
  const {
    executeWithRecovery,
    isRecovering,
    recoveryAttempts,
    canRecover
  } = useErrorRecovery('JobPostingsPage');

  const fetchJobs = async () => {
    const data = await executeWithRecovery(
      async () => {
        const response = await api.get('/jobs');
        return response.data;
      },
      {
        fallbackData: [], // Return empty array if all recovery fails
        cacheKey: 'jobs-list',
        onSuccess: (data) => setJobs(data),
        onFailure: (error) => console.error('Failed to fetch jobs:', error)
      }
    );
  };

  return (
    <div>
      {isRecovering && <LoadingSpinner />}
      {!canRecover && <ErrorMessage>Too many failures, please refresh</ErrorMessage>}
      <JobList jobs={jobs} />
    </div>
  );
};
```

### With State Management

```jsx
import { useRecoveryState } from '../hooks/useErrorRecovery';

const JobForm = () => {
  const [formData, setFormData, recovery] = useRecoveryState('JobForm', {
    title: '',
    description: '',
    location: ''
  });

  const handleSubmit = async () => {
    await recovery.executeWithRecovery(
      async () => {
        const response = await api.post('/jobs', formData);
        return response.data;
      },
      {
        request: {
          method: 'POST',
          url: '/jobs',
          data: formData
        },
        onSuccess: (job) => {
          console.log('Job created:', job);
          navigate(`/jobs/${job._id}`);
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### With Callbacks

```jsx
import { useRecoveryCallback } from '../hooks/useErrorRecovery';

const JobCard = ({ jobId }) => {
  const handleApply = useRecoveryCallback(
    'JobCard',
    async () => {
      const response = await api.post(`/jobs/${jobId}/apply`);
      return response.data;
    },
    [jobId],
    {
      request: {
        method: 'POST',
        url: `/jobs/${jobId}/apply`
      },
      onSuccess: () => {
        toast.success('Application submitted!');
      },
      onFailure: (error) => {
        toast.error('Failed to submit application');
      }
    }
  );

  return (
    <button onClick={handleApply}>
      Apply Now
    </button>
  );
};
```

---

## Integration with Error Boundaries

### RouteErrorBoundary Integration

```jsx
import { recoverFromError } from '../utils/errorRecoveryStrategies';

class RouteErrorBoundary extends React.Component {
  handleRetry = async () => {
    const result = await recoverFromError(this.state.error, {
      componentName: 'RouteErrorBoundary',
      retryFn: () => {
        this.setState({
          hasError: false,
          error: null
        });
        window.location.reload();
      },
      retryCount: this.state.retryCount || 0
    });

    if (result.success) {
      console.log('Recovery successful');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorUI
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
```

### ComponentErrorBoundary Integration

```jsx
import { recoverFromError, saveComponentState } from '../utils/errorRecoveryStrategies';

class ComponentErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Save state before error
    if (this.props.componentState) {
      saveComponentState(this.props.componentName, this.props.componentState);
    }

    // Attempt automatic recovery
    this.attemptRecovery(error);
  }

  attemptRecovery = async (error) => {
    const result = await recoverFromError(error, {
      componentName: this.props.componentName,
      retryFn: () => {
        this.setState({ hasError: false, error: null });
      },
      retryCount: this.state.retryCount || 0,
      fallbackUI: this.props.fallback
    });

    if (!result.success) {
      // Show error UI
      this.setState({ hasError: true, error });
    }
  };
}
```

---

## Circuit Breaker Pattern

### How It Works

1. **CLOSED State** (Normal)
   - All requests allowed
   - Failures are counted
   - After 5 failures → OPEN

2. **OPEN State** (Failing)
   - All requests blocked
   - Returns fallback immediately
   - After 1 minute → HALF_OPEN

3. **HALF_OPEN State** (Testing)
   - Limited requests allowed (2)
   - If 2 successes → CLOSED
   - If any failure → OPEN

### Configuration

```javascript
// Default configuration
{
  failureThreshold: 5,      // Failures before opening
  successThreshold: 2,      // Successes to close
  timeout: 60000           // 1 minute in OPEN state
}
```

### Manual Control

```javascript
import { canAttemptRecovery, resetRecoveryState } from '../utils/errorRecoveryStrategies';

// Check if recovery is allowed
if (canAttemptRecovery('JobPostingsPage')) {
  // Attempt recovery
}

// Reset circuit breaker
resetRecoveryState('JobPostingsPage');
```

---

## Recovery Statistics

### Get Statistics

```javascript
import { getRecoveryStatistics } from '../utils/errorRecoveryStrategies';

// For specific component
const stats = getRecoveryStatistics('JobPostingsPage');
console.log(stats);
// {
//   component: 'JobPostingsPage',
//   history: {
//     attempts: 10,
//     successes: 9,
//     failures: 1,
//     lastAttempt: 1708531200000,
//     lastSuccess: 1708531200000,
//     lastFailure: 1708527600000
//   },
//   successRate: 0.9,
//   circuitBreaker: 'CLOSED'
// }

// For all components
const allStats = getRecoveryStatistics();
console.log(allStats);
// {
//   components: {
//     'JobPostingsPage': { ... },
//     'ProfilePage': { ... }
//   },
//   overall: {
//     totalAttempts: 50,
//     totalSuccesses: 47,
//     totalFailures: 3,
//     successRate: 0.94
//   }
// }
```

### Using in Components

```jsx
const RecoveryDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const allStats = getRecoveryStatistics();
    setStats(allStats);
  }, []);

  return (
    <div>
      <h2>Recovery Statistics</h2>
      <p>Overall Success Rate: {(stats?.overall.successRate * 100).toFixed(1)}%</p>
      <ul>
        {Object.entries(stats?.components || {}).map(([name, data]) => (
          <li key={name}>
            {name}: {(data.successRate * 100).toFixed(1)}% 
            ({data.successes}/{data.attempts})
            - Circuit: {data.circuitBreaker}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## Best Practices

### 1. Always Provide Fallback Data

```javascript
// ✅ Good
const data = await executeWithRecovery(fetchData, {
  fallbackData: []
});

// ❌ Bad
const data = await executeWithRecovery(fetchData);
// Throws error if all recovery fails
```

### 2. Cache Important Data

```javascript
// ✅ Good
const data = await executeWithRecovery(fetchData, {
  cacheKey: 'important-data',
  fallbackData: []
});

// Automatically uses cache on network errors
```

### 3. Save State Before Risky Operations

```javascript
// ✅ Good
saveComponentState('JobForm', formData);
await submitForm(formData);

// If error occurs, state can be restored
```

### 4. Use Appropriate Component Names

```javascript
// ✅ Good - Specific and descriptive
useErrorRecovery('JobPostingsPage');
useErrorRecovery('ProfileImageUpload');

// ❌ Bad - Too generic
useErrorRecovery('Component');
useErrorRecovery('Page');
```

### 5. Handle Success and Failure

```javascript
// ✅ Good
await executeWithRecovery(fetchData, {
  onSuccess: (data) => {
    setData(data);
    toast.success('Data loaded');
  },
  onFailure: (error) => {
    console.error(error);
    toast.error('Failed to load data');
  }
});
```

### 6. Queue Mutations When Offline

```javascript
// ✅ Good - Mutations are queued
await executeWithRecovery(submitForm, {
  request: {
    method: 'POST',
    url: '/api/jobs',
    data: formData
  }
});

// Automatically queued if offline
```

### 7. Monitor Recovery Statistics

```javascript
// ✅ Good - Track success rates
useEffect(() => {
  const stats = getRecoveryStatistics('JobPostingsPage');
  if (stats.successRate < 0.8) {
    console.warn('Low recovery success rate:', stats);
    // Alert monitoring system
  }
}, []);
```

---

## Testing

### Unit Tests

```javascript
import { recoverFromError, RecoveryStrategy } from '../utils/errorRecoveryStrategies';

describe('Error Recovery', () => {
  it('should retry on first attempt', async () => {
    const error = new Error('Test error');
    const retryFn = jest.fn().mockResolvedValue('success');

    const result = await recoverFromError(error, {
      componentName: 'TestComponent',
      retryFn,
      retryCount: 0
    });

    expect(result.success).toBe(true);
    expect(result.strategy).toBe(RecoveryStrategy.RETRY);
  });

  it('should use cache fallback on network error', async () => {
    const error = { networkError: true, type: 'NETWORK_ERROR' };
    
    cacheDataForFallback('test-key', 'cached-data');

    const result = await recoverFromError(error, {
      componentName: 'TestComponent',
      cacheKey: 'test-key',
      hasCache: true
    });

    expect(result.success).toBe(true);
    expect(result.strategy).toBe(RecoveryStrategy.CACHE_FALLBACK);
    expect(result.data).toBe('cached-data');
  });
});
```

### Integration Tests

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { useErrorRecovery } from '../hooks/useErrorRecovery';

const TestComponent = () => {
  const { executeWithRecovery } = useErrorRecovery('TestComponent');
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const result = await executeWithRecovery(
      async () => {
        const response = await api.get('/data');
        return response.data;
      },
      {
        fallbackData: 'fallback',
        onSuccess: setData
      }
    );
  };

  return <div>{data}</div>;
};

test('recovers from error and displays data', async () => {
  // Mock API to fail once then succeed
  let callCount = 0;
  api.get = jest.fn(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.reject(new Error('Network error'));
    }
    return Promise.resolve({ data: 'success' });
  });

  render(<TestComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('success')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Circuit Breaker Stuck Open

**Problem:** Circuit breaker won't close after errors resolved.

**Solution:**
```javascript
import { resetRecoveryState } from '../utils/errorRecoveryStrategies';

// Reset circuit breaker
resetRecoveryState('ComponentName');
```

### Recovery Not Working

**Problem:** Errors not being recovered.

**Checklist:**
1. Is component name provided?
2. Is retryFn provided?
3. Is circuit breaker open? (check with `canAttemptRecovery`)
4. Are max retries exceeded?
5. Check console for recovery logs

### State Not Restoring

**Problem:** State restoration strategy not working.

**Solution:**
```javascript
// Ensure state is saved before operations
saveComponentState('ComponentName', state);

// Check if state exists
const stats = getRecoveryStatistics('ComponentName');
console.log('Has saved state:', stats.history !== null);
```

### Cache Not Being Used

**Problem:** Cache fallback not working.

**Solution:**
```javascript
// Ensure data is cached
cacheDataForFallback('cache-key', data, 300000); // 5 min TTL

// Ensure hasCache flag is set
await executeWithRecovery(fn, {
  cacheKey: 'cache-key',
  hasCache: true // Must be true!
});
```

---

## Performance Considerations

### Memory Usage

- Recovery history is stored in memory
- Circuit breakers are lightweight
- State cache is limited per component
- Data cache has TTL (auto-cleanup)

### Optimization Tips

1. **Clear old recovery data:**
```javascript
// Clear specific component
resetRecoveryState('OldComponent');

// Clear all
resetRecoveryState();
```

2. **Set appropriate cache TTL:**
```javascript
// Short TTL for frequently changing data
cacheDataForFallback('jobs', data, 60000); // 1 minute

// Long TTL for static data
cacheDataForFallback('categories', data, 3600000); // 1 hour
```

3. **Limit retry attempts:**
```javascript
useErrorRecovery('Component', {
  maxRetries: 2 // Reduce from default 3
});
```

---

## Future Enhancements

### Planned Features

1. **Predictive Recovery**
   - ML-based strategy selection
   - Learn from recovery patterns
   - Optimize strategy per component

2. **Distributed Circuit Breaker**
   - Share circuit state across tabs
   - Coordinate recovery attempts
   - Prevent duplicate retries

3. **Advanced Monitoring**
   - Real-time recovery dashboard
   - Alert on low success rates
   - Integration with error tracking services

4. **Recovery Replay**
   - Record recovery attempts
   - Replay for debugging
   - Export recovery logs

---

## Related Documentation

- [Error Boundaries](./ERROR_BOUNDARIES.md)
- [Network Error Handler](./NETWORK_ERROR_HANDLER.md)
- [Offline Request Queue](./OFFLINE_REQUEST_QUEUE.md)
- [Error Tracking](./ERROR_TRACKING.md)

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review console logs for recovery attempts
- Check recovery statistics for patterns
- Contact: careerak.hr@gmail.com

---

**Last Updated:** 2026-02-21  
**Version:** 1.0.0  
**Status:** Production Ready ✅
