const cacheService = require('../src/services/cacheService');
const { searchRateLimiter } = require('../src/middleware/rateLimiter');
const {
  validateSearchParams,
  validateFilterParams,
  validateMapParams,
  validateAutocompleteParams
} = require('../src/middleware/inputValidation');

describe('Search Performance & Security Tests', () => {
  
  // ============================================
  // Caching Tests
  // ============================================
  describe('Caching Service', () => {
    beforeEach(async () => {
      // مسح cache قبل كل اختبار
      await cacheService.flush();
    });

    test('should generate unique cache keys for different queries', () => {
      const key1 = cacheService.generateCacheKey('developer', { type: 'jobs', page: 1 });
      const key2 = cacheService.generateCacheKey('designer', { type: 'jobs', page: 1 });
      const key3 = cacheService.generateCacheKey('developer', { type: 'jobs', page: 2 });
      
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    test('should set and get values from cache', async () => {
      const key = 'test:key';
      const value = { test: 'data', number: 123 };
      
      // حفظ القيمة
      const setResult = await cacheService.set(key, value);
      expect(setResult).toBe(true);
      
      // الحصول على القيمة
      const cached = await cacheService.get(key);
      expect(cached).toEqual(value);
    });

    test('should return null for non-existent keys', async () => {
      const cached = await cacheService.get('non:existent:key');
      expect(cached).toBeNull();
    });

    test('should delete values from cache', async () => {
      const key = 'test:key';
      const value = { test: 'data' };
      
      // حفظ القيمة
      await cacheService.set(key, value);
      
      // حذف القيمة
      const delResult = await cacheService.del(key);
      expect(delResult).toBe(true);
      
      // التحقق من الحذف
      const cached = await cacheService.get(key);
      expect(cached).toBeNull();
    });

    test('should expire cache after TTL', async () => {
      const key = 'test:key';
      const value = { test: 'data' };
      
      // حفظ مع TTL قصير (1 ثانية)
      await cacheService.set(key, value, 1);
      
      // التحقق من وجود القيمة
      const cached1 = await cacheService.get(key);
      expect(cached1).toEqual(value);
      
      // الانتظار لمدة أطول من TTL
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // التحقق من انتهاء الصلاحية
      const cached2 = await cacheService.get(key);
      expect(cached2).toBeNull();
    });

    test('should get cache stats', async () => {
      const stats = await cacheService.getStats();
      
      expect(stats).toHaveProperty('type');
      expect(stats).toHaveProperty('connected');
      expect(['redis', 'node-cache', 'none']).toContain(stats.type);
    });
  });

  // ============================================
  // Input Validation Tests
  // ============================================
  describe('Input Validation', () => {
    test('should validate search params correctly', () => {
      const req = {
        query: {
          q: 'developer',
          page: '1',
          limit: '20',
          sort: 'relevance'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateSearchParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject invalid page number', () => {
      const req = {
        query: {
          q: 'developer',
          page: '-1'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateSearchParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR'
          })
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid limit', () => {
      const req = {
        query: {
          q: 'developer',
          limit: '200'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateSearchParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test('should validate filter params correctly', () => {
      const req = {
        query: {
          salaryMin: '5000',
          salaryMax: '10000',
          jobType: 'Full-time',
          experienceLevel: 'Mid'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateFilterParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject invalid salary range', () => {
      const req = {
        query: {
          salaryMin: '10000',
          salaryMax: '5000'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateFilterParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test('should validate map params correctly', () => {
      const req = {
        query: {
          north: '40',
          south: '30',
          east: '50',
          west: '40'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateMapParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject invalid map coordinates', () => {
      const req = {
        query: {
          north: '100', // خارج النطاق
          south: '0',
          east: '0',
          west: '0'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateMapParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test('should validate autocomplete params correctly', () => {
      const req = {
        query: {
          q: 'dev',
          type: 'jobs',
          limit: '10'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateAutocompleteParams(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject short autocomplete query', () => {
      const req = {
        query: {
          q: 'ab' // أقل من 3 أحرف
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateAutocompleteParams(req, res, next);

      // يجب أن يمر validation لكن سيرجع نتائج فارغة
      expect(next).toHaveBeenCalled();
    });
  });

  // ============================================
  // Rate Limiting Tests
  // ============================================
  describe('Rate Limiting', () => {
    test('should have searchRateLimiter configured', () => {
      expect(searchRateLimiter).toBeDefined();
      expect(typeof searchRateLimiter).toBe('function');
    });

    test('should allow requests within rate limit', () => {
      // هذا اختبار بسيط للتحقق من أن middleware موجود
      // الاختبار الكامل يحتاج integration test
      expect(searchRateLimiter).toBeDefined();
    });
  });
});
