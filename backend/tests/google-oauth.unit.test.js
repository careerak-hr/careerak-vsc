/**
 * Unit Tests for Google OAuth Integration
 * 
 * Tests:
 * - OAuth flow completion
 * - New user creation
 * - Existing user linking
 * - Error handling
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const OAuthAccount = require('../src/models/OAuthAccount');
const { User } = require('../src/models/User');
const oauthController = require('../src/controllers/oauthController');

// MongoDB Memory Server for testing
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Setup Express app for testing
  app = express();
  app.use(express.json());
  
  // Mock routes
  app.get('/auth/success', oauthController.oauthSuccess);
  app.get('/auth/failure', oauthController.oauthFailure);
  app.get('/auth/oauth/accounts', (req, res, next) => {
    // Mock auth middleware
    req.user = { id: req.headers['x-user-id'] };
    next();
  }, oauthController.getOAuthAccounts);
  app.delete('/auth/oauth/:provider', (req, res, next) => {
    // Mock auth middleware
    req.user = { id: req.headers['x-user-id'] };
    next();
  }, oauthController.unlinkOAuthAccount);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await OAuthAccount.deleteMany({});
  await mongoose.connection.collection('users').deleteMany({});
});

describe('Google OAuth Unit Tests', () => {
  describe('OAuth Success Flow', () => {
    test('should generate JWT token and redirect on successful OAuth', async () => {
      // Create a test user
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      // Mock request with user
      const mockReq = {
        user: {
          _id: userId,
          email: 'test@example.com',
          role: 'Employee',
          toObject: () => ({
            _id: userId,
            email: 'test@example.com',
            role: 'Employee'
          })
        }
      };
      
      const mockRes = {
        redirect: jest.fn()
      };
      
      await oauthController.oauthSuccess(mockReq, mockRes);
      
      // Should redirect to frontend with token
      expect(mockRes.redirect).toHaveBeenCalled();
      const redirectUrl = mockRes.redirect.mock.calls[0][0];
      expect(redirectUrl).toContain('/auth/callback?token=');
      expect(redirectUrl).toContain('&user=');
      
      // Extract and verify token
      const tokenMatch = redirectUrl.match(/token=([^&]+)/);
      expect(tokenMatch).toBeTruthy();
      const token = tokenMatch[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerak_secret_key_2024');
      expect(decoded.id).toBeDefined();
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('Employee');
    });

    test('should redirect to failure page if no user in request', async () => {
      const mockReq = {
        user: null
      };
      
      const mockRes = {
        redirect: jest.fn()
      };
      
      await oauthController.oauthSuccess(mockReq, mockRes);
      
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/failure?error=authentication_failed')
      );
    });

    test('should sanitize user data (remove sensitive fields)', async () => {
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true,
        otp: { code: '123456', expiresAt: new Date() },
        twoFactorSecret: 'secret123',
        emailVerificationToken: 'token123'
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      const mockReq = {
        user: {
          _id: userId,
          email: 'test@example.com',
          role: 'Employee',
          password: 'hashedpassword123',
          otp: { code: '123456' },
          twoFactorSecret: 'secret123',
          emailVerificationToken: 'token123',
          toObject: () => ({
            _id: userId,
            email: 'test@example.com',
            role: 'Employee',
            password: 'hashedpassword123',
            otp: { code: '123456' },
            twoFactorSecret: 'secret123',
            emailVerificationToken: 'token123'
          })
        }
      };
      
      const mockRes = {
        redirect: jest.fn()
      };
      
      await oauthController.oauthSuccess(mockReq, mockRes);
      
      const redirectUrl = mockRes.redirect.mock.calls[0][0];
      const userMatch = redirectUrl.match(/user=([^&]+)/);
      const userJson = decodeURIComponent(userMatch[1]);
      const user = JSON.parse(userJson);
      
      // Sensitive fields should be removed
      expect(user.password).toBeUndefined();
      expect(user.otp).toBeUndefined();
      expect(user.twoFactorSecret).toBeUndefined();
      expect(user.emailVerificationToken).toBeUndefined();
      expect(user.__v).toBeUndefined();
    });
  });

  describe('OAuth Failure Flow', () => {
    test('should redirect to frontend error page with error message', () => {
      const mockReq = {
        query: { error: 'access_denied' }
      };
      
      const mockRes = {
        redirect: jest.fn()
      };
      
      oauthController.oauthFailure(mockReq, mockRes);
      
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/error?error=access_denied')
      );
    });

    test('should use default error if none provided', () => {
      const mockReq = {
        query: {}
      };
      
      const mockRes = {
        redirect: jest.fn()
      };
      
      oauthController.oauthFailure(mockReq, mockRes);
      
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/error?error=unknown_error')
      );
    });
  });

  describe('Get OAuth Accounts', () => {
    test('should return user OAuth accounts', async () => {
      // Create user
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      // Create OAuth accounts
      await OAuthAccount.create({
        userId: userId,
        provider: 'google',
        providerId: 'google123',
        email: 'test@gmail.com',
        displayName: 'Test User',
        accessToken: 'encrypted_token',
        refreshToken: 'encrypted_refresh'
      });
      
      await OAuthAccount.create({
        userId: userId,
        provider: 'facebook',
        providerId: 'facebook456',
        email: 'test@facebook.com',
        displayName: 'Test User'
      });
      
      const mockReq = {
        user: { id: userId.toString() }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await oauthController.getOAuthAccounts(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        accounts: expect.arrayContaining([
          expect.objectContaining({
            provider: 'google',
            providerId: 'google123'
          }),
          expect.objectContaining({
            provider: 'facebook',
            providerId: 'facebook456'
          })
        ])
      });
      
      // Tokens should not be included
      const response = mockRes.json.mock.calls[0][0];
      response.accounts.forEach(account => {
        expect(account.accessToken).toBeUndefined();
        expect(account.refreshToken).toBeUndefined();
      });
    });

    test('should return empty array if no OAuth accounts', async () => {
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      const mockReq = {
        user: { id: userId.toString() }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await oauthController.getOAuthAccounts(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        accounts: []
      });
    });
  });

  describe('Unlink OAuth Account', () => {
    test('should unlink OAuth account successfully', async () => {
      // Create user with password and OAuth account
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true,
        oauthAccounts: [{
          provider: 'google',
          providerId: 'google123',
          email: 'test@gmail.com',
          connectedAt: new Date()
        }]
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      // Create OAuth account
      await OAuthAccount.create({
        userId: userId,
        provider: 'google',
        providerId: 'google123',
        email: 'test@gmail.com'
      });
      
      const mockReq = {
        user: { id: userId.toString() },
        params: { provider: 'google' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await oauthController.unlinkOAuthAccount(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('google')
      });
      
      // Verify OAuth account was deleted
      const oauthAccount = await OAuthAccount.findOne({ userId, provider: 'google' });
      expect(oauthAccount).toBeNull();
    });

    test('should reject invalid provider', async () => {
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      const mockReq = {
        user: { id: userId.toString() },
        params: { provider: 'invalid_provider' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await oauthController.unlinkOAuthAccount(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String)
      });
    });

    test('should prevent unlinking if it is the only login method', async () => {
      // Create user with OAuth only (no password)
      const userDoc = {
        email: 'test@example.com',
        password: null,
        role: 'Employee',
        phone: '+google_123456',  // OAuth-generated phone
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true,
        oauthAccounts: [{
          provider: 'google',
          providerId: 'google123',
          email: 'test@gmail.com',
          connectedAt: new Date()
        }]
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      await OAuthAccount.create({
        userId: userId,
        provider: 'google',
        providerId: 'google123',
        email: 'test@gmail.com'
      });
      
      const mockReq = {
        user: { id: userId.toString() },
        params: { provider: 'google' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await oauthController.unlinkOAuthAccount(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('طريقة دخول أخرى')
      });
      
      // OAuth account should still exist
      const oauthAccount = await OAuthAccount.findOne({ userId, provider: 'google' });
      expect(oauthAccount).toBeTruthy();
    });

    test('should return 404 if user not found', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      
      const mockReq = {
        user: { id: fakeUserId.toString() },
        params: { provider: 'google' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await oauthController.unlinkOAuthAccount(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('غير موجود')
      });
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT with correct payload', async () => {
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      const mockReq = {
        user: {
          _id: userId,
          email: 'test@example.com',
          role: 'Employee',
          toObject: () => ({
            _id: userId,
            email: 'test@example.com',
            role: 'Employee'
          })
        }
      };
      
      const mockRes = {
        redirect: jest.fn()
      };
      
      await oauthController.oauthSuccess(mockReq, mockRes);
      
      const redirectUrl = mockRes.redirect.mock.calls[0][0];
      const tokenMatch = redirectUrl.match(/token=([^&]+)/);
      const token = tokenMatch[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerak_secret_key_2024');
      
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', 'test@example.com');
      expect(decoded).toHaveProperty('role', 'Employee');
      expect(decoded).toHaveProperty('exp'); // Expiration
      expect(decoded).toHaveProperty('iat'); // Issued at
    });

    test('should set token expiration to 30 days', async () => {
      const userDoc = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        userType: 'Individual',
        privacyAccepted: true
      };
      
      const result = await mongoose.connection.collection('users').insertOne(userDoc);
      const userId = result.insertedId;
      
      const mockReq = {
        user: {
          _id: userId,
          email: 'test@example.com',
          role: 'Employee',
          toObject: () => ({
            _id: userId,
            email: 'test@example.com',
            role: 'Employee'
          })
        }
      };
      
      const mockRes = {
        redirect: jest.fn()
      };
      
      await oauthController.oauthSuccess(mockReq, mockRes);
      
      const redirectUrl = mockRes.redirect.mock.calls[0][0];
      const tokenMatch = redirectUrl.match(/token=([^&]+)/);
      const token = tokenMatch[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careerak_secret_key_2024');
      
      const expirationTime = decoded.exp - decoded.iat;
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      
      expect(expirationTime).toBe(thirtyDaysInSeconds);
    });
  });
});
