/**
 * API Cache Usage Examples
 * 
 * This file demonstrates how to use the stale-while-revalidate caching
 * for API responses in the Careerak application.
 */

import api, { getCached, postCached } from '../services/api';
import { staleWhileRevalidate, createCachedAPI, invalidateCache } from './apiCache';

// ============================================================================
// Example 1: Basic Cached GET Request
// ============================================================================

/**
 * Fetch job postings with caching
 * - First call: fetches from server and caches
 * - Subsequent calls within 5 minutes: returns cached data instantly
 * - After 5 minutes: returns stale data instantly, fetches fresh data in background
 */
export async function getJobPostings() {
  return getCached('/job-postings', {
    maxAge: 5 * 60 * 1000 // 5 minutes
  });
}

// ============================================================================
// Example 2: Cached Request with Parameters
// ============================================================================

/**
 * Fetch user profile with caching
 * Different user IDs will have separate cache entries
 */
export async function getUserProfile(userId) {
  return getCached(`/users/${userId}`, {
    maxAge: 10 * 60 * 1000 // 10 minutes
  });
}

// ============================================================================
// Example 3: Force Refresh
// ============================================================================

/**
 * Fetch notifications with option to force refresh
 */
export async function getNotifications(forceRefresh = false) {
  return getCached('/notifications', {
    maxAge: 2 * 60 * 1000, // 2 minutes
    forceRefresh
  });
}

// Usage:
// const notifications = await getNotifications(); // Uses cache
// const freshNotifications = await getNotifications(true); // Forces refresh

// ============================================================================
// Example 4: Custom Cache Configuration
// ============================================================================

/**
 * Fetch courses with custom cache duration
 */
export async function getCourses(filters = {}) {
  return getCached('/courses', {
    params: filters,
    maxAge: 15 * 60 * 1000 // 15 minutes - courses don't change often
  });
}

// ============================================================================
// Example 5: Using staleWhileRevalidate Directly
// ============================================================================

/**
 * Fetch job applications with full control
 */
export async function getJobApplications(userId) {
  const fetchFn = async () => {
    const response = await api.get(`/job-applications`, {
      params: { userId }
    });
    return response.data;
  };

  return staleWhileRevalidate(fetchFn, {
    maxAge: 3 * 60 * 1000, // 3 minutes
    cacheKey: { method: 'GET', url: '/job-applications', params: { userId } }
  });
}

// ============================================================================
// Example 6: Creating Cached API Functions
// ============================================================================

/**
 * Create a cached version of an API function
 */
const fetchCompanyDetails = async (companyId) => {
  const response = await api.get(`/companies/${companyId}`);
  return response.data;
};

// Wrap with caching
export const getCachedCompanyDetails = createCachedAPI(fetchCompanyDetails, {
  maxAge: 20 * 60 * 1000, // 20 minutes
  method: 'GET',
  url: '/companies'
});

// Usage:
// const company = await getCachedCompanyDetails('company123');

// ============================================================================
// Example 7: Cache Invalidation
// ============================================================================

/**
 * Invalidate cache when data changes
 */
export async function updateUserProfile(userId, data) {
  // Update the profile
  const response = await api.put(`/users/${userId}`, data);
  
  // Invalidate the cache for this user
  invalidateCache(`GET:/users/${userId}`);
  
  return response.data;
}

/**
 * Invalidate all job postings cache
 */
export function invalidateJobPostingsCache() {
  invalidateCache(/^GET:\/job-postings/);
}

// ============================================================================
// Example 8: Conditional Caching
// ============================================================================

/**
 * Fetch data with conditional caching based on user preferences
 */
export async function getRecommendations(useCache = true) {
  if (!useCache) {
    // Direct API call without caching
    const response = await api.get('/recommendations');
    return response.data;
  }
  
  // Use cache
  return getCached('/recommendations', {
    maxAge: 5 * 60 * 1000
  });
}

// ============================================================================
// Example 9: POST Request Caching (Use with Caution)
// ============================================================================

/**
 * Search jobs with POST (idempotent search query)
 * Only cache if the search is idempotent and doesn't modify data
 */
export async function searchJobs(searchQuery) {
  return postCached('/jobs/search', searchQuery, {
    maxAge: 5 * 60 * 1000 // 5 minutes
  });
}

// ============================================================================
// Example 10: React Hook Integration
// ============================================================================

/**
 * Custom React hook for cached data fetching
 */
import { useState, useEffect } from 'react';

export function useCachedData(fetchFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error };
}

// Usage in component:
// const { data: jobs, loading, error } = useCachedData(() => getJobPostings());

// ============================================================================
// Example 11: Cache Statistics and Debugging
// ============================================================================

import { getCacheStats, clearCache } from './apiCache';

/**
 * Get cache statistics for debugging
 */
export function logCacheStats() {
  const stats = getCacheStats();
  console.log('Cache Statistics:', {
    totalEntries: stats.size,
    validEntries: stats.entries.filter(e => e.isValid).length,
    staleEntries: stats.entries.filter(e => e.isStale).length
  });
  
  // Log individual entries
  stats.entries.forEach(entry => {
    console.log(`${entry.key}: age=${Math.round(entry.age / 1000)}s, valid=${entry.isValid}, stale=${entry.isStale}`);
  });
}

/**
 * Clear all cache (useful for logout or debugging)
 */
export function clearAllCache() {
  clearCache();
  console.log('All cache cleared');
}

// ============================================================================
// Best Practices
// ============================================================================

/**
 * BEST PRACTICES FOR USING API CACHE:
 * 
 * 1. Cache Duration Guidelines:
 *    - Frequently changing data (notifications): 1-2 minutes
 *    - Moderately changing data (job postings): 5-10 minutes
 *    - Rarely changing data (courses, company info): 15-30 minutes
 *    - Static data (categories, tags): 1 hour or more
 * 
 * 2. When to Use Caching:
 *    ✅ GET requests for read-only data
 *    ✅ Data that doesn't change frequently
 *    ✅ Data that's expensive to fetch
 *    ✅ Data that's accessed multiple times
 * 
 * 3. When NOT to Use Caching:
 *    ❌ POST/PUT/DELETE requests (except idempotent searches)
 *    ❌ Real-time data (chat messages, live updates)
 *    ❌ User-specific sensitive data
 *    ❌ Data that must always be fresh
 * 
 * 4. Cache Invalidation:
 *    - Always invalidate cache after mutations (create, update, delete)
 *    - Use specific keys for targeted invalidation
 *    - Use patterns (RegExp) for bulk invalidation
 * 
 * 5. Error Handling:
 *    - Stale data is served even if revalidation fails
 *    - Always handle errors in your components
 *    - Consider showing "data may be outdated" indicator
 * 
 * 6. Memory Management:
 *    - Cache automatically cleans up old entries
 *    - Clear cache on logout
 *    - Monitor cache size in development
 * 
 * 7. Testing:
 *    - Test with forceRefresh option
 *    - Test cache invalidation
 *    - Test stale data scenarios
 */

export default {
  getJobPostings,
  getUserProfile,
  getNotifications,
  getCourses,
  getJobApplications,
  getCachedCompanyDetails,
  updateUserProfile,
  invalidateJobPostingsCache,
  getRecommendations,
  searchJobs,
  useCachedData,
  logCacheStats,
  clearAllCache
};
