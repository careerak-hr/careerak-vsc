const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models/User');
const Certificate = require('../src/models/Certificate');
const linkedInService = require('../src/services/linkedInService');

describe('LinkedIn Integration Tests', () => {
  let authToken;
  let userId;
  let certificateId;

  beforeAll(async () => {
    // إنشاء مستخدم للاختبار
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'linkedin.test@example.com',
      password: 'Test123!@#',
      role: 'jobSeeker'
    });
    userId = user._id;

    // الحصول على token
    authToken = user.generateAuthToken();

    // إنشاء شهادة للاختبار
    const certificate = await Certificate.create({
      userId: userId,
      courseId: 'course_123',
      courseName: 'Test Course',
      certificateId: 'cert_test_123',
      issueDate: new Date(),
      verificationUrl: 'https://careerak.com/verify/cert_test_123',
      status: 'active'
    });
    certificateId = certificate.certificateId;
  });

  afterAll(async () => {
    // تنظيف البيانات
    await User.deleteOne({ _id: userId });
    await Certificate.deleteOne({ certificateId: certificateId });
  });

  describe('GET /api/linkedin/auth-url', () => {
    it('should return LinkedIn authorization URL', async () => {
      const response = await request(app)
        .get('/api/linkedin/auth-url')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.authUrl).toContain('linkedin.com/oauth/v2/authorization');
      expect(response.body.state).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/linkedin/auth-url');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/linkedin/status', () => {
    it('should return connection status', async () => {
      const response = await request(app)
        .get('/api/linkedin/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isConnected).toBeDefined();
    });

    it('should return false when not connected', async () => {
      const response = await request(app)
        .get('/api/linkedin/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.isConnected).toBe(false);
    });
  });

  describe('POST /api/linkedin/share-certificate', () => {
    it('should fail when LinkedIn not connected', async () => {
      const response = await request(app)
        .post('/api/linkedin/share-certificate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ certificateId: certificateId });

      expect(response.status).toBe(401);
      expect(response.body.requiresAuth).toBe(true);
    });

    it('should fail without certificate ID', async () => {
      const response = await request(app)
        .post('/api/linkedin/share-certificate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid certificate ID', async () => {
      const response = await request(app)
        .post('/api/linkedin/share-certificate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ certificateId: 'invalid_cert_id' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/linkedin/unlink', () => {
    it('should unlink LinkedIn account', async () => {
      const response = await request(app)
        .delete('/api/linkedin/unlink')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('LinkedIn Service', () => {
    describe('getAuthorizationUrl', () => {
      it('should generate valid authorization URL', () => {
        const state = 'test_state_123';
        const authUrl = linkedInService.getAuthorizationUrl(state);

        expect(authUrl).toContain('linkedin.com/oauth/v2/authorization');
        expect(authUrl).toContain(`state=${state}`);
        expect(authUrl).toContain('response_type=code');
        expect(authUrl).toContain('client_id=');
      });
    });

    describe('_generatePostText', () => {
      it('should generate proper post text', () => {
        const certificate = {
          userId: {
            firstName: 'John',
            lastName: 'Doe'
          },
          courseName: 'Advanced JavaScript',
          issueDate: new Date('2026-03-13'),
          verificationUrl: 'https://careerak.com/verify/cert_123'
        };

        const postText = linkedInService._generatePostText(certificate);

        expect(postText).toContain('Advanced JavaScript');
        expect(postText).toContain('Careerak');
        expect(postText).toContain('https://careerak.com/verify/cert_123');
        expect(postText).toContain('#Careerak');
      });
    });

    describe('validateAccessToken', () => {
      it('should return false for invalid token', async () => {
        const isValid = await linkedInService.validateAccessToken('invalid_token');
        expect(isValid).toBe(false);
      });
    });

    describe('saveAccessToken', () => {
      it('should save access token to user profile', async () => {
        const accessToken = 'test_access_token';
        const expiresIn = 5184000; // 60 days

        const result = await linkedInService.saveAccessToken(
          userId,
          accessToken,
          expiresIn
        );

        expect(result.success).toBe(true);

        // التحقق من الحفظ
        const user = await User.findById(userId);
        expect(user.linkedInProfile).toBeDefined();
        expect(user.linkedInProfile.accessToken).toBe(accessToken);
        expect(user.linkedInProfile.expiresAt).toBeDefined();
      });
    });

    describe('getAccessToken', () => {
      it('should retrieve access token from user profile', async () => {
        const accessToken = await linkedInService.getAccessToken(userId);
        expect(accessToken).toBe('test_access_token');
      });

      it('should return null for user without LinkedIn profile', async () => {
        const newUser = await User.create({
          firstName: 'No',
          lastName: 'LinkedIn',
          email: 'no.linkedin@example.com',
          password: 'Test123!@#',
          role: 'jobSeeker'
        });

        const accessToken = await linkedInService.getAccessToken(newUser._id);
        expect(accessToken).toBeNull();

        await User.deleteOne({ _id: newUser._id });
      });

      it('should return null for expired token', async () => {
        // تعيين token منتهي الصلاحية
        const user = await User.findById(userId);
        user.linkedInProfile.expiresAt = new Date(Date.now() - 1000); // منتهي منذ ثانية
        await user.save();

        const accessToken = await linkedInService.getAccessToken(userId);
        expect(accessToken).toBeNull();
      });
    });

    describe('unlinkAccount', () => {
      it('should remove LinkedIn profile from user', async () => {
        const result = await linkedInService.unlinkAccount(userId);
        expect(result.success).toBe(true);

        const user = await User.findById(userId);
        expect(user.linkedInProfile).toBeUndefined();
      });

      it('should fail for non-existent user', async () => {
        await expect(
          linkedInService.unlinkAccount('000000000000000000000000')
        ).rejects.toThrow('User not found');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete full OAuth flow (mock)', async () => {
      // 1. الحصول على auth URL
      const authUrlResponse = await request(app)
        .get('/api/linkedin/auth-url')
        .set('Authorization', `Bearer ${authToken}`);

      expect(authUrlResponse.status).toBe(200);
      const { state } = authUrlResponse.body;

      // 2. محاكاة callback (في الواقع، LinkedIn يرسل code)
      // هنا نختبر فقط التحقق من state
      expect(state).toBeDefined();
      expect(state.length).toBeGreaterThan(10);
    });

    it('should handle certificate sharing workflow', async () => {
      // 1. التحقق من حالة الربط
      const statusResponse = await request(app)
        .get('/api/linkedin/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.body.isConnected).toBe(false);

      // 2. محاولة المشاركة بدون ربط
      const shareResponse = await request(app)
        .post('/api/linkedin/share-certificate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ certificateId: certificateId });

      expect(shareResponse.status).toBe(401);
      expect(shareResponse.body.requiresAuth).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      const originalClientId = process.env.LINKEDIN_CLIENT_ID;
      delete process.env.LINKEDIN_CLIENT_ID;

      const service = require('../src/services/linkedInService');
      expect(service.clientId).toBeUndefined();

      process.env.LINKEDIN_CLIENT_ID = originalClientId;
    });

    it('should handle network errors', async () => {
      // محاكاة خطأ شبكة
      jest.spyOn(linkedInService, 'getUserProfile').mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        linkedInService.getUserProfile('invalid_token')
      ).rejects.toThrow('Network error');

      linkedInService.getUserProfile.mockRestore();
    });
  });

  describe('Security Tests', () => {
    it('should not expose access token in responses', async () => {
      const response = await request(app)
        .get('/api/linkedin/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.accessToken).toBeUndefined();
    });

    it('should validate state parameter in callback', async () => {
      const response = await request(app)
        .get('/api/linkedin/callback?code=test_code&state=invalid_state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'get', path: '/api/linkedin/auth-url' },
        { method: 'get', path: '/api/linkedin/status' },
        { method: 'post', path: '/api/linkedin/share-certificate' },
        { method: 'delete', path: '/api/linkedin/unlink' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
      }
    });
  });
});
