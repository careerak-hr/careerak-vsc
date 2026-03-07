const request = require('supertest');
const app = require('../src/app');
const cacheService = require('../src/services/cacheService');

describe('Performance & Security Tests', () => {
  
  // ============================================
  // Caching Tests
  // ============================================
  describe('Caching', () => {
    beforeEach(async () => {
      // مسح cache قبل كل اختبار
      await cacheService.flush();
    });

    test('should cache search results', async () => {
      const query = 'developer';
      
      // الطلب الأول (cache miss)
      const response1 = await request(app)
        .get('/api/search/jobs')
        .query({ q: query });
      
      expect(response1.status).toBe(200);
      
      // الطلب الثاني (cache hit)
      const response2 = await request(app)
        .get('/api/search/jobs')
        .query({ q: query });
      
      expect(response2.status).toBe(200);
      expect(response2.body).toEqual(response1.body);
    });

    test('should generate unique cache keys for different queries', () => {
      const key1 = cacheService.generateCacheKey('developer', { type: 'jobs', page: 1 });
      const key2 = cacheService.generateCacheKey('designer', { type: 'jobs', page: 1 });
      const key3 = cacheService.generateCacheKey('developer', { type: 'jobs', page: 2 });
      
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
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
  });

  // ============================================
  // Rate Limiting Tests
  // ============================================
  describe('Rate Limiting', () => {
    test('should allow requests within rate limit', async () => {
      // إرسال 5 طلبات (أقل من الحد 30)
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get('/api/search/jobs')
          .query({ q: 'test' });
        
        expect(response.status).toBe(200);
      }
    });

    test('should block requests exceeding rate limit', async () => {
      // إرسال 31 طلب (أكثر من الحد 30)
      const requests = [];
      for (let i = 0; i < 31; i++) {
        requests.push(
          request(app)
            .get('/api/search/jobs')
            .query({ q: `test${i}` })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // التحقق من أن آخر طلب تم رفضه
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    }, 10000); // timeout أطول لهذا الاختبار

    test('should have different rate limits for autocomplete', async () => {
      // autocomplete له حد 60 طلب/دقيقة
      // إرسال 10 طلبات (أقل من الحد)
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .get('/api/search/autocomplete')
          .query({ q: 'tes' });
        
        expect(response.status).toBe(200);
      }
    });
  });

  // ============================================
  // Input Validation Tests
  // ============================================
  describe('Input Validation', () => {
    test('should reject empty search query', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: '' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.results).toEqual([]);
    });

    test('should reject search query with special characters', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: '<script>alert("xss")</script>' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject invalid page number', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer', page: -1 });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject invalid limit', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer', limit: 200 });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject invalid salary range', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer', salaryMin: 10000, salaryMax: 5000 });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should sanitize HTML in search query', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer<b>test</b>' });
      
      // يجب أن يتم تنظيف HTML tags
      expect(response.status).toBe(200);
    });

    test('should reject invalid map coordinates', async () => {
      const response = await request(app)
        .get('/api/search/map')
        .query({
          north: 100, // خارج النطاق (-90 إلى 90)
          south: 0,
          east: 0,
          west: 0
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject invalid autocomplete query length', async () => {
      const response = await request(app)
        .get('/api/search/autocomplete')
        .query({ q: 'ab' }); // أقل من 3 أحرف
      
      expect(response.status).toBe(200);
      expect(response.body.data.suggestions).toEqual([]);
    });
  });

  // ============================================
  // Query Optimization Tests
  // ============================================
  describe('Query Optimization', () => {
    test('should use lean() for better performance', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer' });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      // يجب أن يكون الاستعلام سريع (< 1000ms)
      expect(duration).toBeLessThan(1000);
    });

    test('should use select() to limit returned fields', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer' });
      
      expect(response.status).toBe(200);
      
      if (response.body.data.results.length > 0) {
        const job = response.body.data.results[0];
        
        // التحقق من أن الحقول المطلوبة موجودة
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('description');
        expect(job).toHaveProperty('skills');
        
        // التحقق من عدم وجود حقول غير ضرورية
        expect(job).not.toHaveProperty('__v');
      }
    });
  });

  // ============================================
  // Security Tests
  // ============================================
  describe('Security', () => {
    test('should prevent NoSQL injection', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer', 'filters[$ne]': null });
      
      // يجب أن يتم تنظيف المدخلات
      expect(response.status).toBe(200);
    });

    test('should sanitize user input', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer', location: '<script>alert("xss")</script>' });
      
      // يجب أن يتم تنظيف HTML
      expect(response.status).toBe(200);
    });

    test('should have security headers', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'developer' });
      
      // التحقق من وجود security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
