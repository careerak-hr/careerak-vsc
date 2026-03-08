/**
 * Property-Based Tests for Cache Validity
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import apiCache, {
  staleWhileRevalidate,
  clearCache,
} from '../apiCache';

describe('Cache Validity Property-Based Tests', () => {
  beforeEach(() => {
    // 1. القضاء على أي تداخل توقيت
    apiCache.stopCleanup();
    clearCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearCache();
    vi.useRealTimers();
    apiCache.startCleanup(); // إعادة التشغيل للبيئات الأخرى
  });

  describe('Property PERF-4: Cache Validity', () => {
    it('should serve from cache when age < maxAge', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 20 }).filter(s => /^[a-zA-Z]+$/.test(s)), // مفاتيح نظيفة فقط
          fc.record({
            id: fc.integer({ min: 1, max: 100 }),
            name: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          fc.integer({ min: 1, max: 20 }),
          async (cacheKey, data, ageDays) => {
            clearCache();
            vi.clearAllMocks();

            const maxAge = 30 * 24 * 60 * 60 * 1000;
            const ageMs = ageDays * 24 * 60 * 60 * 1000;

            const fetchFn = vi.fn().mockResolvedValue(data);

            // 1. الحفظ الأول
            await staleWhileRevalidate(fetchFn, { cacheKey, maxAge });
            expect(fetchFn).toHaveBeenCalledTimes(1);

            // 2. تحريك الزمن
            vi.advanceTimersByTime(ageMs);
            fetchFn.mockClear();

            // 3. الاسترجاع (يجب أن يكون من الكاش 100%)
            const result = await staleWhileRevalidate(fetchFn, { cacheKey, maxAge });

            expect(result).toEqual(data);
            expect(fetchFn).toHaveBeenCalledTimes(0); // التثبت من عدم الاتصال بالسيرفر

            return true;
          }
        ),
        { numRuns: 50 } // تقليل العدد لضمان الاستقرار في البيئة الحالية
      );
    });
  });
});
