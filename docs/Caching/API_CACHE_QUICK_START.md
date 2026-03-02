# API Cache Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Basic Usage

```javascript
import { getCached } from '../services/api';

// Simple cached GET request
const jobs = await getCached('/job-postings', {
  maxAge: 5 * 60 * 1000 // 5 minutes
});
```

---

## 📋 Common Patterns

### 1. Fetch with Caching

```javascript
import { getCached } from '../services/api';

async function getJobPostings() {
  return getCached('/job-postings', {
    maxAge: 5 * 60 * 1000
  });
}
```

### 2. Force Refresh

```javascript
const fresh = await getCached('/notifications', {
  maxAge: 2 * 60 * 1000,
  forceRefresh: true
});
```

### 3. Invalidate After Update

```javascript
import api from '../services/api';
import { invalidateCache } from '../utils/apiCache';

async function updateJob(jobId, data) {
  await api.put(`/jobs/${jobId}`, data);
  invalidateCache(`GET:/jobs/${jobId}`);
}
```

### 4. React Hook

```javascript
import { useCachedData } from '../utils/apiCacheExamples';

function JobsPage() {
  const { data, loading, error } = useCachedData(() => getJobPostings());
  
  if (loading) return <div>Loading...</div>;
  return <div>{/* render jobs */}</div>;
}
```

---

## ⏱️ Cache Duration Guide

| Data Type | Duration | Code |
|-----------|----------|------|
| Notifications | 1-2 min | `1 * 60 * 1000` |
| Job Postings | 5-10 min | `5 * 60 * 1000` |
| User Profiles | 10-15 min | `10 * 60 * 1000` |
| Courses | 15-30 min | `15 * 60 * 1000` |
| Static Data | 1 hour+ | `60 * 60 * 1000` |

---

## 🔧 Essential Functions

```javascript
import { 
  getCached,           // Cached GET request
  staleWhileRevalidate, // Manual caching
  invalidateCache,     // Clear specific cache
  clearCache,          // Clear all cache
  getCacheStats        // Debug info
} from '../services/api' or '../utils/apiCache';
```

---

## ✅ Best Practices

**DO:**
- ✅ Use for GET requests
- ✅ Cache frequently accessed data
- ✅ Invalidate after mutations
- ✅ Choose appropriate maxAge

**DON'T:**
- ❌ Cache real-time data
- ❌ Cache sensitive data
- ❌ Forget to invalidate
- ❌ Use for POST/PUT/DELETE

---

## 🐛 Quick Debug

```javascript
import { getCacheStats, clearCache } from '../utils/apiCache';

// View cache
console.log(getCacheStats());

// Clear cache
clearCache();
```

---

## 📚 Full Documentation

See `docs/API_CACHE_GUIDE.md` for complete documentation.

---

**Status**: ✅ Production Ready  
**Date**: 2026-02-19
