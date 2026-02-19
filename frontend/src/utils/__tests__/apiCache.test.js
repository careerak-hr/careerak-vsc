/**
 * API Cache Tests
 * 
 * Tests for the stale-while-revalidate caching implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import apiCache, {
  staleWhileRevalidate,
  createCachedAPI,
  invalidateCache,
  clearCache,
  getCacheStats
} from '../apiCache';

describe('APICache', () => {
  beforeEach(() => {
    clearCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  describe('Basic Cache Operations', () => {
    it('should cache and retrieve data', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };
      
      apiCache.set(key, data);
      const cached = apiCache.get(key);
      
      expect(cached).toBeDefined();
      expect(cached.data).toEqual(data);
    });

    it('should generate consistent cache keys', () => {
      const config1 = { method: 'GET', url: '/api/test', params: { id: 1 } };
      const config2 = { method: 'GET', url: '/api/test', params: { id: 1 } };
      
      const key1 = apiCache.generateKey(config1);
      const key2 = apiCache.generateKey(config2);
      
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different configs', () => {
      const config1 = { method: 'GET', url: '/api/test', params: { id: 1 } };
      const config2 = { method: 'GET', url: '/api/test', params: { id: 2 } };
      
      const key1 = apiCache.generateKey(config1);
      const key2 = apiCache.generateKey(config2);
      
      expect(key1).not.toBe(key2);
    });

    it('should delete cached data', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };
      
      apiCache.set(key, data);
      expect(apiCache.get(key)).toBeDefined();
      
      apiCache.delete(key);
      expect(apiCache.get(key)).toBeUndefined();
    });

    it('should clear all cache', () => {
      apiCache.set('key1', { data: 1 });
      apiCache.set('key2', { data: 2 });
      
      expect(apiCache.size()).toBe(2);
      
      clearCache();
      expect(apiCache.size()).toBe(0);
    });
  });

  describe('Cache Validity', () => {
    it('should identify valid cache entries', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      apiCache.set(key, data);
      const entry = apiCache.get(key);
      
      expect(apiCache.isValid(entry, maxAge)).toBe(true);
    });

    it('should identify stale cache entries', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      apiCache.set(key, data);
      
      // Advance time by 6 minutes
      vi.advanceTimersByTime(6 * 60 * 1000);
      
      const entry = apiCache.get(key);
      expect(apiCache.isStale(entry, maxAge)).toBe(true);
    });

    it('should identify invalid cache entries', () => {
      const maxAge = 5 * 60 * 1000;
      
      expect(apiCache.isValid(null, maxAge)).toBe(false);
      expect(apiCache.isValid(undefined, maxAge)).toBe(false);
    });
  });

  describe('Stale-While-Revalidate', () => {
    it('should fetch and cache data on first call', async () => {
      const mockData = { id: 1, name: 'Test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      
      const result = await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key'
      });
      
      expect(result).toEqual(mockData);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should return cached data on subsequent calls within maxAge', async () => {
      const mockData = { id: 1, name: 'Test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const maxAge = 5 * 60 * 1000;
      
      // First call
      await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        maxAge
      });
      
      // Second call within maxAge
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutes
      const result = await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        maxAge
      });
      
      expect(result).toEqual(mockData);
      expect(fetchFn).toHaveBeenCalledTimes(1); // Should not fetch again
    });

    it('should return stale data and revalidate in background', async () => {
      const staleData = { id: 1, name: 'Stale' };
      const freshData = { id: 1, name: 'Fresh' };
      const fetchFn = vi.fn()
        .mockResolvedValueOnce(staleData)
        .mockResolvedValueOnce(freshData);
      const maxAge = 5 * 60 * 1000;
      
      // First call - cache stale data
      await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        maxAge
      });
      
      // Advance time beyond maxAge
      vi.advanceTimersByTime(6 * 60 * 1000);
      
      // Second call - should return stale data immediately
      const result = await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        maxAge
      });
      
      expect(result).toEqual(staleData); // Returns stale data
      expect(fetchFn).toHaveBeenCalledTimes(2); // Revalidation started
      
      // Wait for revalidation to complete
      await vi.runAllTimersAsync();
      
      // Third call - should return fresh data
      const freshResult = await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        maxAge
      });
      
      expect(freshResult).toEqual(freshData);
    });

    it('should force refresh when forceRefresh is true', async () => {
      const oldData = { id: 1, name: 'Old' };
      const newData = { id: 1, name: 'New' };
      const fetchFn = vi.fn()
        .mockResolvedValueOnce(oldData)
        .mockResolvedValueOnce(newData);
      
      // First call
      await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key'
      });
      
      // Second call with forceRefresh
      const result = await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        forceRefresh: true
      });
      
      expect(result).toEqual(newData);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch errors gracefully', async () => {
      const error = new Error('Network error');
      const fetchFn = vi.fn().mockRejectedValue(error);
      
      await expect(
        staleWhileRevalidate(fetchFn, {
          cacheKey: 'test-key'
        })
      ).rejects.toThrow('Network error');
    });

    it('should keep stale data on revalidation error', async () => {
      const staleData = { id: 1, name: 'Stale' };
      const fetchFn = vi.fn()
        .mockResolvedValueOnce(staleData)
        .mockRejectedValueOnce(new Error('Network error'));
      const maxAge = 5 * 60 * 1000;
      
      // First call - cache data
      await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        maxAge
      });
      
      // Advance time beyond maxAge
      vi.advanceTimersByTime(6 * 60 * 1000);
      
      // Second call - should return stale data even though revalidation fails
      const result = await staleWhileRevalidate(fetchFn, {
        cacheKey: 'test-key',
        maxAge
      });
      
      expect(result).toEqual(staleData);
    });
  });

  describe('createCachedAPI', () => {
    it('should create a cached version of an API function', async () => {
      const mockData = { id: 1, name: 'Test' };
      const apiFn = vi.fn().mockResolvedValue(mockData);
      
      const cachedFn = createCachedAPI(apiFn, {
        maxAge: 5 * 60 * 1000
      });
      
      const result = await cachedFn({ id: 1 });
      
      expect(result).toEqual(mockData);
      expect(apiFn).toHaveBeenCalledWith({ id: 1 });
    });

    it('should cache results of created API function', async () => {
      const mockData = { id: 1, name: 'Test' };
      const apiFn = vi.fn().mockResolvedValue(mockData);
      
      const cachedFn = createCachedAPI(apiFn, {
        maxAge: 5 * 60 * 1000
      });
      
      // First call
      await cachedFn({ id: 1 });
      
      // Second call
      await cachedFn({ id: 1 });
      
      expect(apiFn).toHaveBeenCalledTimes(1); // Should use cache
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache by exact key', () => {
      apiCache.set('key1', { data: 1 });
      apiCache.set('key2', { data: 2 });
      
      invalidateCache('key1');
      
      expect(apiCache.get('key1')).toBeUndefined();
      expect(apiCache.get('key2')).toBeDefined();
    });

    it('should invalidate cache by pattern', () => {
      apiCache.set('GET:/api/users/1', { data: 1 });
      apiCache.set('GET:/api/users/2', { data: 2 });
      apiCache.set('GET:/api/posts/1', { data: 3 });
      
      invalidateCache(/^GET:\/api\/users/);
      
      expect(apiCache.get('GET:/api/users/1')).toBeUndefined();
      expect(apiCache.get('GET:/api/users/2')).toBeUndefined();
      expect(apiCache.get('GET:/api/posts/1')).toBeDefined();
    });
  });

  describe('Cache Statistics', () => {
    it('should return cache statistics', () => {
      apiCache.set('key1', { data: 1 });
      apiCache.set('key2', { data: 2 });
      
      const stats = getCacheStats();
      
      expect(stats.size).toBe(2);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('age');
      expect(stats.entries[0]).toHaveProperty('isValid');
      expect(stats.entries[0]).toHaveProperty('isStale');
    });
  });

  describe('Cache Cleanup', () => {
    it('should cleanup expired entries', () => {
      const maxAge = 5 * 60 * 1000;
      
      apiCache.set('key1', { data: 1 });
      apiCache.set('key2', { data: 2 });
      
      // Advance time beyond 2x maxAge
      vi.advanceTimersByTime(maxAge * 2 + 1000);
      
      apiCache.cleanup();
      
      expect(apiCache.size()).toBe(0);
    });

    it('should keep recent entries during cleanup', () => {
      apiCache.set('key1', { data: 1 });
      
      // Advance time by 1 minute
      vi.advanceTimersByTime(1 * 60 * 1000);
      
      apiCache.cleanup();
      
      expect(apiCache.size()).toBe(1);
    });
  });
});
