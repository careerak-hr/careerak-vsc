/**
 * React Query Configuration
 * 
 * Configures React Query for client-side caching and data fetching.
 * Implements Requirements 11.2
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query options for React Query
 */
const defaultQueryOptions = {
  queries: {
    // Stale time: Data is considered fresh for 30 seconds
    staleTime: 30 * 1000, // 30 seconds
    
    // Cache time: Data stays in cache for 5 minutes after becoming unused
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    
    // Retry failed requests 2 times with exponential backoff
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus for real-time data
    refetchOnWindowFocus: true,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
    
    // Network mode: online only (don't use cache when offline)
    networkMode: 'online'
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
    
    // Network mode: online only
    networkMode: 'online'
  }
};

/**
 * Create and configure QueryClient instance
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions
});

/**
 * Query keys for different data types
 * Centralized query keys for consistency and easy invalidation
 */
export const queryKeys = {
  // Statistics queries
  statistics: {
    all: ['statistics'],
    overview: () => [...queryKeys.statistics.all, 'overview'],
    users: (timeRange = 'daily') => [...queryKeys.statistics.all, 'users', timeRange],
    jobs: (timeRange = 'daily') => [...queryKeys.statistics.all, 'jobs', timeRange],
    courses: (timeRange = 'daily') => [...queryKeys.statistics.all, 'courses', timeRange],
    reviews: (timeRange = 'daily') => [...queryKeys.statistics.all, 'reviews', timeRange]
  },
  
  // Activity log queries
  activityLog: {
    all: ['activityLog'],
    list: (filters) => [...queryKeys.activityLog.all, 'list', filters],
    detail: (id) => [...queryKeys.activityLog.all, 'detail', id]
  },
  
  // Notification queries
  notifications: {
    all: ['notifications'],
    list: (filters) => [...queryKeys.notifications.all, 'list', filters],
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'],
    preferences: () => [...queryKeys.notifications.all, 'preferences']
  },
  
  // Dashboard layout queries
  dashboardLayout: {
    all: ['dashboardLayout'],
    current: () => [...queryKeys.dashboardLayout.all, 'current']
  },
  
  // Reports queries
  reports: {
    all: ['reports'],
    users: (dateRange) => [...queryKeys.reports.all, 'users', dateRange],
    jobs: (dateRange) => [...queryKeys.reports.all, 'jobs', dateRange],
    courses: (dateRange) => [...queryKeys.reports.all, 'courses', dateRange],
    reviews: (dateRange) => [...queryKeys.reports.all, 'reviews', dateRange]
  },
  
  // User management queries
  users: {
    all: ['users'],
    list: (filters) => [...queryKeys.users.all, 'list', filters],
    detail: (id) => [...queryKeys.users.all, 'detail', id],
    activity: (id) => [...queryKeys.users.all, 'activity', id]
  },
  
  // Content management queries
  content: {
    all: ['content'],
    pendingJobs: () => [...queryKeys.content.all, 'pendingJobs'],
    pendingCourses: () => [...queryKeys.content.all, 'pendingCourses'],
    flagged: () => [...queryKeys.content.all, 'flagged']
  }
};

/**
 * Invalidate all statistics queries
 * Call this after data changes that affect statistics
 */
export const invalidateStatistics = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
};

/**
 * Invalidate specific statistics query
 * @param {string} type - Type of statistics (overview, users, jobs, courses, reviews)
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 */
export const invalidateStatisticsType = (type, timeRange) => {
  if (type === 'overview') {
    queryClient.invalidateQueries({ queryKey: queryKeys.statistics.overview() });
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.statistics[type](timeRange) });
  }
};

/**
 * Prefetch statistics data
 * Call this to preload data before user navigates to dashboard
 */
export const prefetchStatistics = async () => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.statistics.overview(),
      staleTime: 30 * 1000
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.statistics.users('daily'),
      staleTime: 30 * 1000
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.statistics.jobs('daily'),
      staleTime: 30 * 1000
    })
  ]);
};

/**
 * Clear all cached data
 * Call this on logout or when needed
 */
export const clearAllCache = () => {
  queryClient.clear();
};

export default queryClient;
