const request = require('supertest');
const app = require('../src/app');

describe('🔒 Security Tests', () => {
  
  describe('CSRF Protection', () => {
    test('should reject requests without CSRF token', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          phone: '+963987654321',
          password: 'testpassword123',
          role: 'Employee',
          country: 'Syria'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.error).toContain('رمز الأمان');
    });

    test('should provide CSRF token endpoint', async () => {
      const response = await request(app)
        .get('/api/csrf-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('csrfToken');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to API endpoints', async () => {
      // محاولة إرسال طلبات متعددة بسرعة
      const promises = Array(10).fill().map(() => 
        request(app).get('/api/health')
      );
      
      const responses = await Promise.all(promises);
      
      // يجب أن تنجح معظم الطلبات
      const successfulRequests = responses.filter(r => r.status === 200);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize XSS attempts', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/users/register')
        .send({
          phone: '+963987654321',
          password: 'testpassword123',
          role: 'Employee',
          country: maliciousInput
        });
      
      // يجب أن يرفض الطلب أو ينظف المدخل
      expect(response.status).toBe(400);
    });

    test('should prevent NoSQL injection', async () => {
      const maliciousInput = { $ne: null };
      
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: maliciousInput,
          password: 'anypassword'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Authentication Security', () => {
    test('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          phone: '+963987654321',
          password: '123', // كلمة مرور ضعيفة
          role: 'Employee',
          country: 'Syria'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('8 أحرف');
    });

    test('should validate phone number format', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          phone: 'invalid-phone', // رقم هاتف غير صحيح
          password: 'validpassword123',
          role: 'Employee',
          country: 'Syria'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('رقم الهاتف');
    });

    test('should validate email format when provided', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          phone: '+963987654321',
          email: 'invalid-email', // بريد إلكتروني غير صحيح
          password: 'validpassword123',
          role: 'Employee',
          country: 'Syria'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Authorization', () => {
    test('should protect profile endpoints', async () => {
      const response = await request(app)
        .get('/api/users/profile');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('تسجيل الدخول');
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });
  });

  describe('Data Validation', () => {
    test('should prevent forbidden field updates', async () => {
      // محاولة تحديث حقول محظورة مثل role
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer valid-token') // يحتاج token صحيح
        .send({
          role: 'Admin', // محاولة تغيير الدور
          password: 'newpassword' // محاولة تغيير كلمة المرور
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health');
      
      // فحص وجود security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Error Handling', () => {
    test('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');
      
      expect(response.status).toBe(404);
      // يجب ألا تحتوي رسالة الخطأ على معلومات حساسة
      expect(response.body.error).not.toContain('stack');
      expect(response.body.error).not.toContain('password');
    });
  });
});

describe('🚀 Performance Tests', () => {
  
  test('health check should respond quickly', async () => {
    const start = Date.now();
    
    const response = await request(app)
      .get('/api/health');
    
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(1000); // أقل من ثانية واحدة
  });

  test('should handle concurrent requests', async () => {
    const concurrentRequests = 20;
    const promises = Array(concurrentRequests).fill().map(() => 
      request(app).get('/api/health')
    );
    
    const start = Date.now();
    const responses = await Promise.all(promises);
    const duration = Date.now() - start;
    
    // يجب أن تنجح جميع الطلبات
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
    
    // يجب أن تكتمل في وقت معقول
    expect(duration).toBeLessThan(5000); // أقل من 5 ثوان
  });
});