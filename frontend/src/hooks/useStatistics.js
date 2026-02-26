/**
 * Statistics Hooks
 * 
 * Custom React Query hooks for fetching statistics data.
 * Implements Requirements 11.2
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryKeys, queryClient } from '../config/reactQuery';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authorization headers
 * @returns {Object} Headers with authorization token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

/**
 * Fetch overview statistics
 * @returns {Promise<Object>} Overview statistics data
 */
const fetchOverviewStatistics = async () => {
  const response = await axios.get(
    `${API_URL}/admin/statistics/overview`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Fetch user statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @returns {Promise<Object>} User statistics data
 */
const fetchUserStatistics = async (timeRange = 'daily') => {
  const response = await axios.get(
    `${API_URL}/admin/statistics/users?timeRange=${timeRange}`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Fetch job statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @returns {Promise<Object>} Job statistics data
 */
const fetchJobStatistics = async (timeRange = 'daily') => {
  const response = await axios.get(
    `${API_URL}/admin/statistics/jobs?timeRange=${timeRange}`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Fetch course statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @returns {Promise<Object>} Course statistics data
 */
const fetchCourseStatistics = async (timeRange = 'daily') => {
  const response = await axios.get(
    `${API_URL}/admin/statistics/courses?timeRange=${timeRange}`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Fetch review statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @returns {Promise<Object>} Review statistics data
 */
const fetchReviewStatistics = async (timeRange = 'daily') => {
  const response = await axios.get(
    `${API_URL}/admin/statistics/reviews?timeRange=${timeRange}`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Hook: Use overview statistics
 * @param {Object} options - React Query options
 * @returns {Object} Query result with data, isLoading, error, etc.
 */
export const useOverviewStatistics = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.statistics.overview(),
    queryFn: fetchOverviewStatistics,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    ...options
  });
};

/**
 * Hook: Use user statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with data, isLoading, error, etc.
 */
export const useUserStatistics = (timeRange = 'daily', options = {}) => {
  return useQuery({
    queryKey: queryKeys.statistics.users(timeRange),
    queryFn: () => fetchUserStatistics(timeRange),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...options
  });
};

/**
 * Hook: Use job statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with data, isLoading, error, etc.
 */
export const useJobStatistics = (timeRange = 'daily', options = {}) => {
  return useQuery({
    queryKey: queryKeys.statistics.jobs(timeRange),
    queryFn: () => fetchJobStatistics(timeRange),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...options
  });
};

/**
 * Hook: Use course statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with data, isLoading, error, etc.
 */
export const useCourseStatistics = (timeRange = 'daily', options = {}) => {
  return useQuery({
    queryKey: queryKeys.statistics.courses(timeRange),
    queryFn: () => fetchCourseStatistics(timeRange),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...options
  });
};

/**
 * Hook: Use review statistics
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with data, isLoading, error, etc.
 */
export const useReviewStatistics = (timeRange = 'daily', options = {}) => {
  return useQuery({
    queryKey: queryKeys.statistics.reviews(timeRange),
    queryFn: () => fetchReviewStatistics(timeRange),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    ...options
  });
};

/**
 * Hook: Invalidate statistics cache
 * Use this mutation to manually invalidate statistics cache
 * @returns {Object} Mutation result
 */
export const useInvalidateStatistics = () => {
  return useMutation({
    mutationFn: async () => {
      // This is a client-side only operation
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
      return { success: true };
    }
  });
};

/**
 * Hook: Prefetch statistics
 * Use this to preload statistics data before user navigates to dashboard
 * @returns {Function} Prefetch function
 */
export const usePrefetchStatistics = () => {
  return async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.statistics.overview(),
        queryFn: fetchOverviewStatistics,
        staleTime: 30 * 1000
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.statistics.users('daily'),
        queryFn: () => fetchUserStatistics('daily'),
        staleTime: 30 * 1000
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.statistics.jobs('daily'),
        queryFn: () => fetchJobStatistics('daily'),
        staleTime: 30 * 1000
      })
    ]);
  };
};
