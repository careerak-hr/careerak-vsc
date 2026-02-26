# Caching Strategies - Quick Start Guide

**5-Minute Setup Guide**

## Backend Setup

### 1. Install Redis (Optional)

**Option A: Local Redis**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download
```

**Option B: Cloud Redis**
- Use Redis Cloud, AWS ElastiCache, or Azure Cache for Redis
- Get connection URL

### 2. Configure Environment

```bash
# backend/.env
REDIS_URL=redis://localhost:6379

# If not provided, system uses node-cache fallback
```

### 3. Install Dependencies

```bash
cd backend
npm install redis
```

### 4. Verify Installation

```bash
# Start backend
npm start

# Check logs for:
# [Redis] Connected successfully
# OR
# [Redis] REDIS_URL not configured, using node-cache fallback
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Wrap App with QueryProvider

```jsx
// src/index.jsx or src/main.jsx
import QueryProvider from './providers/QueryProvider';

root.render(
  <QueryProvider>
    <App />
  </QueryProvider>
);
```

### 3. Use Statistics Hooks

```jsx
// In your component
import { useOverviewStatistics } from '../hooks/useStatistics';

function Dashboard() {
  const { data, isLoading, error } = useOverviewStatistics();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Active Users: {data.activeUsers}</h1>
      <h2>Jobs Today: {data.jobsToday}</h2>
    </div>
  );
}
```

## Usage Examples

### Fetch Statistics with Time Range

```jsx
import { useUserStatistics } from '../hooks/useStatistics';

function UserChart() {
  const [timeRange, setTimeRange] = useState('daily');
  const { data } = useUserStatistics(timeRange);
  
  return (
    <div>
      <select onChange={(e) => setTimeRange(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <Chart data={data} />
    </div>
  );
}
```

### Invalidate Cache After Mutation

```jsx
import { useMutation } from '@tanstack/react-query';
import { queryClient, queryKeys } from '../config/reactQuery';

function CreateJobButton() {
  const { mutate } = useMutation({
    mutationFn: createJobPosting,
    onSuccess: () => {
      // Invalidate statistics to refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.statistics.all 
      });
    }
  });
  
  return <button onClick={() => mutate(jobData)}>Create Job</button>;
}
```

### Prefetch Data

```jsx
import { usePrefetchStatistics } from '../hooks/useStatistics';

function LoginPage() {
  const prefetch = usePrefetchStatistics();
  
  const handleLogin = async () => {
    await login();
    // Prefetch dashboard data before navigation
    await prefetch();
    navigate('/dashboard');
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
```

## Monitoring

### Backend Cache Stats

```javascript
// In any controller or service
const statisticsService = require('./services/statisticsService');

const stats = statisticsService.getCacheStats();
console.log(stats);
// {
//   hits: 1250,
//   misses: 50,
//   hitRate: '96.15%',
//   backend: 'Redis'
// }
```

### Frontend DevTools

In development mode:
1. Look for React Query icon in bottom-right corner
2. Click to open DevTools
3. View all queries, cache contents, and refetch status

## Testing

### Test Backend Cache

```bash
cd backend
npm test -- redisCache.test.js
```

### Test Frontend Hooks

```bash
cd frontend
npm test -- useStatistics.test.js
```

## Troubleshooting

### Redis Not Connecting

**Check**:
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

**If fails**:
- System automatically falls back to node-cache
- Check REDIS_URL in .env
- Verify Redis server is running

### Cache Not Working

**Check**:
1. React Query DevTools shows queries
2. Network tab shows Cache-Control headers
3. Backend logs show cache hits/misses

**Common issues**:
- QueryProvider not wrapping app
- Cache headers middleware not applied
- Query keys not consistent

### Stale Data

**Solution**:
```javascript
// Force refetch
queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });

// Or in component
const { refetch } = useOverviewStatistics();
refetch();
```

## Configuration

### Adjust Cache Duration

**Backend** (30s default):
```javascript
// backend/src/services/statisticsService.js
const getCachedOrFetch = async (cacheKey, fetchFunction, ttl = 30) => {
  // Change ttl to adjust duration
};
```

**Frontend** (30s default):
```javascript
// frontend/src/config/reactQuery.js
const defaultQueryOptions = {
  queries: {
    staleTime: 30 * 1000, // Change this
  }
};
```

## Next Steps

1. ✅ Read full documentation: `docs/CACHING_STRATEGIES.md`
2. ✅ Monitor cache hit rates
3. ✅ Adjust TTL based on your needs
4. ✅ Add cache invalidation to mutations
5. ✅ Test with production data

## Quick Reference

### Backend

```javascript
// Get cache stats
statisticsService.getCacheStats()

// Invalidate all statistics
await statisticsService.invalidateAllStatistics()

// Invalidate specific key
await statisticsService.invalidateCache('user_stats_*')
```

### Frontend

```javascript
// Use statistics
const { data, isLoading } = useOverviewStatistics()

// Invalidate cache
queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all })

// Clear all cache
queryClient.clear()

// Prefetch
const prefetch = usePrefetchStatistics()
await prefetch()
```

---

**Setup Time**: ~5 minutes  
**Full Documentation**: `docs/CACHING_STRATEGIES.md`  
**Requirements**: 11.2
