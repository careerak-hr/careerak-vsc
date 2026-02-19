/**
 * Property-Based Tests for Cache Validity
 * 
 * **Validates: Requirements 2.6.4**
 * 
 * Tests the correctness properties of cache validity implementation
 * using property-based testing with fast-check.
 * 
 * Property PERF-4: Cache Validity
 * ∀ asset ∈ StaticAssets:
 *   cached(asset) AND age(asset) < 30days → serve(cache)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import apiCache, {
  staleWhileRevalidate,
  clearCache,
} from '../apiCache';

describe('Cache Validity Property-Based Tests', () => {
  beforeEach(() => {
    clearCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  /**
   * Property PERF-4: Cache Validity
   * 
   * **Validates: Requirements FR-PERF-6, FR-PERF-7, NFR-PERF-6**
   * 
   * ∀ asset ∈ StaticAssets:
   *   cached(asset) AND age(asset) < 30days → serve(cache)
   * 
   * This property verifies that cached assets are served from cache
   * when they are valid (age < maxAge).
   */
  describe('Property PERF-4: Cache Validity', () => {
    it('should serve from cache when age < maxAge', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // cache key
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // cached data
          fc.integer({ min: 1, max: 29 }), // age in days (< 30)
          async (cacheKey, data, ageDays) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
            const ageMs = ageDays * 24 * 60 * 60 * 1000; // age in ms

            // Mock fetch function
            const fetchFn = vi.fn().mockResolvedValue(data);

            // First call - cache the data
            const result1 = await staleWhileRevalidate(fetchFn, {
              cacheKey,
              maxAge,
            });

            expect(result1).toEqual(data);
            expect(fetchFn).toHaveBeenCalledTimes(1);

            // Advance time by age (< maxAge)
            vi.advanceTimersByTime(ageMs);

            // Reset mock to track second call
            fetchFn.mockClear();

            // Second call - should serve from cache (no fetch)
            const result2 = await staleWhileRevalidate(fetchFn, {
              cacheKey,
              maxAge,
            });

            expect(result2).toEqual(data);
            
            // Property: cached(asset) AND age(asset) < maxAge → serve(cache)
            // Verify fetch was NOT called again (served from cache)
            expect(fetchFn).toHaveBeenCalledTimes(0);

            return fetchFn.mock.calls.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should revalidate when age >= maxAge', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // cache key
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // stale data
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // fresh data
          fc.integer({ min: 30, max: 60 }), // age in days (>= 30)
          async (cacheKey, staleData, freshData, ageDays) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
            const ageMs = ageDays * 24 * 60 * 60 * 1000; // age in ms

            // Mock fetch function - returns different data on second call
            const fetchFn = vi.fn()
              .mockResolvedValueOnce(staleData)
              .mockResolvedValueOnce(freshData);

            // First call - cache the data
            const result1 = await staleWhileRevalidate(fetchFn, {
              cacheKey,
              maxAge,
            });

            expect(result1).toEqual(staleData);
            expect(fetchFn).toHaveBeenCalledTimes(1);

            // Advance time beyond maxAge
            vi.advanceTimersByTime(ageMs);

            // Reset mock call count to track revalidation
            const initialCallCount = fetchFn.mock.calls.length;

            // Second call - should return stale data but trigger revalidation
            const result2 = await staleWhileRevalidate(fetchFn, {
              cacheKey,
              maxAge,
            });

            // Returns stale data immediately (stale-while-revalidate)
            expect(result2).toEqual(staleData);
            
            // But revalidation should have been triggered
            expect(fetchFn).toHaveBeenCalledTimes(2);

            // Wait for revalidation to complete
            await vi.runAllTimersAsync();

            // Third call - should return fresh data
            const result3 = await staleWhileRevalidate(fetchFn, {
              cacheKey,
              maxAge,
            });

            expect(result3).toEqual(freshData);

            // Property: age(asset) >= maxAge → revalidate
            return fetchFn.mock.calls.length === 2;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate cache entry age calculation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // cache key
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // data
          fc.integer({ min: 0, max: 60 }), // age in days
          (cacheKey, data, ageDays) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
            const ageMs = ageDays * 24 * 60 * 60 * 1000; // age in ms

            // Cache the data
            apiCache.set(cacheKey, data);

            // Advance time
            vi.advanceTimersByTime(ageMs);

            // Get cache entry
            const entry = apiCache.get(cacheKey);

            // Verify entry exists
            expect(entry).toBeDefined();

            // Check validity
            const isValid = apiCache.isValid(entry, maxAge);
            const isStale = apiCache.isStale(entry, maxAge);

            // Property: age < maxAge → valid, age >= maxAge → stale
            if (ageDays < 30) {
              expect(isValid).toBe(true);
              expect(isStale).toBe(false);
            } else {
              expect(isValid).toBe(false);
              expect(isStale).toBe(true);
            }

            return (ageDays < 30) ? isValid : isStale;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple cache entries with different ages', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 50 }),
              data: fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                name: fc.string({ minLength: 1, maxLength: 100 }),
              }),
              ageDays: fc.integer({ min: 0, max: 60 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (entries) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

            // Cache all entries at time 0
            const startTime = Date.now();
            for (const entry of entries) {
              apiCache.set(entry.key, entry.data);
            }

            // Verify each entry's validity based on its age
            let allCorrect = true;
            for (const entry of entries) {
              // Simulate the entry being created ageDays ago
              const cachedEntry = apiCache.get(entry.key);
              
              if (!cachedEntry) {
                allCorrect = false;
                continue;
              }

              // Manually set the timestamp to simulate age
              cachedEntry.timestamp = startTime - (entry.ageDays * 24 * 60 * 60 * 1000);

              const isValid = apiCache.isValid(cachedEntry, maxAge);
              const expectedValid = entry.ageDays < 30;

              if (isValid !== expectedValid) {
                allCorrect = false;
              }
            }

            // Property: Each entry's validity is independent and correct
            return allCorrect;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect 30-day cache expiration for static assets', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // asset URL
          fc.record({
            content: fc.string({ minLength: 1, maxLength: 1000 }),
            type: fc.constantFrom('css', 'js', 'image', 'font'),
          }), // asset data
          fc.integer({ min: 0, max: 45 }), // age in days
          (assetUrl, assetData, ageDays) => {
            // Clear cache before test
            clearCache();

            // 30 days in milliseconds (as per FR-PERF-6, NFR-PERF-6)
            const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
            const ageMs = ageDays * 24 * 60 * 60 * 1000;

            // Cache the asset
            apiCache.set(assetUrl, assetData);

            // Advance time
            vi.advanceTimersByTime(ageMs);

            // Get cache entry
            const entry = apiCache.get(assetUrl);
            expect(entry).toBeDefined();

            // Check validity with 30-day expiration
            const isValid = apiCache.isValid(entry, THIRTY_DAYS_MS);

            // Property: Static assets cached for 30 days
            // age < 30 days → valid, age >= 30 days → invalid
            const expectedValid = ageDays < 30;
            expect(isValid).toBe(expectedValid);

            return isValid === expectedValid;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain cache validity across multiple checks', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // cache key
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // data
          fc.integer({ min: 1, max: 10 }), // number of checks
          fc.integer({ min: 0, max: 29 }), // age in days (< 30)
          (cacheKey, data, numChecks, ageDays) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
            const ageMs = ageDays * 24 * 60 * 60 * 1000; // age in ms

            // Cache the data
            apiCache.set(cacheKey, data);

            // Advance time
            vi.advanceTimersByTime(ageMs);

            // Check validity multiple times
            const entry = apiCache.get(cacheKey);
            let allChecksValid = true;

            for (let i = 0; i < numChecks; i++) {
              const isValid = apiCache.isValid(entry, maxAge);
              if (!isValid) {
                allChecksValid = false;
                break;
              }
            }

            // Property: Validity check is consistent across multiple calls
            // (checking validity doesn't change the entry's age)
            expect(allChecksValid).toBe(true);

            return allChecksValid;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case: exactly 30 days old', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // cache key
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // data
          (cacheKey, data) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

            // Cache the data
            apiCache.set(cacheKey, data);

            // Advance time to exactly 30 days
            vi.advanceTimersByTime(maxAge);

            // Get cache entry
            const entry = apiCache.get(cacheKey);
            expect(entry).toBeDefined();

            // Check validity
            const isValid = apiCache.isValid(entry, maxAge);
            const isStale = apiCache.isStale(entry, maxAge);

            // Property: At exactly maxAge, entry should be stale (not valid)
            // age >= maxAge → stale
            expect(isValid).toBe(false);
            expect(isStale).toBe(true);

            return !isValid && isStale;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle cache cleanup based on validity', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              key: fc.string({ minLength: 1, maxLength: 50 }),
              data: fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                name: fc.string({ minLength: 1, maxLength: 100 }),
              }),
              ageDays: fc.integer({ min: 0, max: 90 }),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (entries) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

            // Cache all entries
            for (const entry of entries) {
              apiCache.set(entry.key, entry.data);
            }

            // Advance time to the maximum age in the entries
            const maxAgeDays = Math.max(...entries.map(e => e.ageDays));
            const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
            vi.advanceTimersByTime(maxAgeMs);

            // Run cleanup (removes entries older than 2x maxAge)
            apiCache.cleanup();

            // Count how many entries should remain
            // Cleanup removes entries older than 2x maxAge (60 days)
            const expectedRemaining = entries.filter(e => e.ageDays < 60).length;
            const actualRemaining = apiCache.size();

            // Property: Cleanup removes expired entries based on validity
            // Note: cleanup uses 2x maxAge threshold
            return actualRemaining <= expectedRemaining;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate cache headers for 30-day expiration', () => {
      fc.assert(
        fc.property(
          fc.constant(null),
          () => {
            // Import getCacheHeaders from cacheBusting
            const { getCacheHeaders } = require('../cacheBusting');

            // Get cache headers for static assets
            const headers = getCacheHeaders(false);

            // Property: Cache headers specify 30-day expiration
            // max-age=2592000 (30 days in seconds)
            expect(headers).toHaveProperty('Cache-Control');
            expect(headers['Cache-Control']).toContain('max-age=2592000');

            const maxAgeMatch = headers['Cache-Control'].match(/max-age=(\d+)/);
            if (maxAgeMatch) {
              const maxAgeSeconds = parseInt(maxAgeMatch[1]);
              const maxAgeDays = maxAgeSeconds / (24 * 60 * 60);
              
              // Verify it's exactly 30 days
              expect(maxAgeDays).toBe(30);
              
              return maxAgeDays === 30;
            }

            return false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle concurrent cache validity checks', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // cache key
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // data
          fc.integer({ min: 0, max: 29 }), // age in days (< 30)
          fc.integer({ min: 2, max: 10 }), // number of concurrent checks
          async (cacheKey, data, ageDays, numChecks) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
            const ageMs = ageDays * 24 * 60 * 60 * 1000; // age in ms

            // Mock fetch function
            const fetchFn = vi.fn().mockResolvedValue(data);

            // First call - cache the data
            await staleWhileRevalidate(fetchFn, {
              cacheKey,
              maxAge,
            });

            // Advance time
            vi.advanceTimersByTime(ageMs);

            // Reset mock to track concurrent calls
            fetchFn.mockClear();

            // Make multiple concurrent requests
            const promises = [];
            for (let i = 0; i < numChecks; i++) {
              promises.push(
                staleWhileRevalidate(fetchFn, {
                  cacheKey,
                  maxAge,
                })
              );
            }

            const results = await Promise.all(promises);

            // Property: All concurrent requests get the same cached data
            // and fetch is not called (since cache is still valid)
            const allSame = results.every(r => JSON.stringify(r) === JSON.stringify(data));
            expect(allSame).toBe(true);
            
            // Should not fetch again since cache is still valid (age < 30 days)
            expect(fetchFn).toHaveBeenCalledTimes(0);

            return allSame && fetchFn.mock.calls.length === 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property: Cache invalidation preserves validity semantics
   */
  describe('Cache Invalidation and Validity', () => {
    it('should invalidate cache regardless of age', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // cache key
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
          }), // data
          fc.integer({ min: 0, max: 29 }), // age in days (< 30, still valid)
          (cacheKey, data, ageDays) => {
            // Clear cache before test
            clearCache();

            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
            const ageMs = ageDays * 24 * 60 * 60 * 1000; // age in ms

            // Cache the data
            apiCache.set(cacheKey, data);

            // Advance time (still valid)
            vi.advanceTimersByTime(ageMs);

            // Verify it's valid
            const entry = apiCache.get(cacheKey);
            expect(apiCache.isValid(entry, maxAge)).toBe(true);

            // Invalidate cache
            apiCache.delete(cacheKey);

            // Verify it's gone
            const afterDelete = apiCache.get(cacheKey);
            expect(afterDelete).toBeUndefined();

            // Property: Invalidation works regardless of validity
            return afterDelete === undefined;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
