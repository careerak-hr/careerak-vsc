const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const emailChangeService = require('../src/services/emailChangeService');
const EmailChangeRequest = require('../src/models/EmailChangeRequest');
const { User } = require('../src/models/User');
const ActiveSession = require('../src/models/ActiveSession');
const bcrypt = require('bcryptjs');

let mongoServer;

// Mock logger to avoid console noise during tests
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Mock notification service
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue({ _id: 'notification123' })
}));

// Increase timeout for MongoDB Memory Server
jest.setTimeout(60000);

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'emailChangeServiceTest'
      }
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('Failed to start MongoDB Memory Server:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

describe('EmailChangeService', () => {
  
  // Helper function to create a test user
  const createTestUser = async (email = 'test@example.com', password = 'Password123!') => {
    const user = await User.create({
      email,
      password,
      role: 'Employee',
      phone: '+201234567890',
      country: 'Egypt',
      firstName: 'Test',
      lastName: 'User'
    });
    return user;
  };
  
  // Helper function to create a test session
  const createTestSession = async (userId, token = 'test-token-hash') => {
    const session = await ActiveSession.create({
      userId,
      token,
      device: {
        type: 'desktop',
        os: 'Windows 10',
        browser: 'Chrome',
        fingerprint: 'test-fingerprint'
      },
      location: {
        ipAddress: '192.168.1.1',
        country: 'Egypt',
        city: 'Cairo'
      },
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    return session;
  };
  
  describe('initiateEmailChange', () => {
    
    test('should successfully initiate email change with valid data', async () => {
      const user = await createTestUser();
      const newEmail = 'newemail@example.com';
      
      const result = await emailChangeService.initiateEmailChange(user._id.toString(), newEmail);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('بنجاح');
      expect(result.requestId).toBeDefined();
      
      // Verify request was created in database
      const request = await EmailChangeRequest.findById(result.requestId);
      expect(request).toBeDefined();
      expect(request.userId.toString()).toBe(user._id.toString());
      expect(request.oldEmail).toBe(user.email);
      expect(request.newEmail).toBe(newEmail);
      expect(request.status).toBe('pending');
    });
    
    test('should reject if new email is already registered (Requirement 3.1)', async () => {
      const user1 = await createTestUser('user1@example.com');
      const user2 = await createTestUser('user2@example.com');
      
      // Try to change user1's email to user2's email
      const result = await emailChangeService.initiateEmailChange(
        user1._id.toString(),
        'user2@example.com'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('مستخدم بالفعل');
    });
    
    test('should reject if new email is same as current email', async () => {
      const user = await createTestUser('test@example.com');
      
      const result = await emailChangeService.initiateEmailChange(
        user._id.toString(),
        'test@example.com'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('مطابق');
    });
    
    test('should reject invalid email format', async () => {
      const user = await createTestUser();
      
      const result = await emailChangeService.initiateEmailChange(
        user._id.toString(),
        'invalid-email'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('تنسيق');
    });
    
    test('should reject if user does not exist', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      
      const result = await emailChangeService.initiateEmailChange(
        fakeUserId,
        'newemail@example.com'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('غير موجود');
    });
    
    test('should reject if userId or newEmail is missing', async () => {
      const result1 = await emailChangeService.initiateEmailChange(null, 'test@example.com');
      expect(result1.success).toBe(false);
      
      const user = await createTestUser();
      const result2 = await emailChangeService.initiateEmailChange(user._id.toString(), null);
      expect(result2.success).toBe(false);
    });
    
    test('should normalize email to lowercase', async () => {
      const user = await createTestUser();
      const newEmail = 'NewEmail@EXAMPLE.COM';
      
      const result = await emailChangeService.initiateEmailChange(user._id.toString(), newEmail);
      
      expect(result.success).toBe(true);
      
      const request = await EmailChangeRequest.findById(result.requestId);
      expect(request.newEmail).toBe('newemail@example.com');
    });
    
    test('should delete any existing pending requests before creating new one', async () => {
      const user = await createTestUser();
      
      // Create first request
      const result1 = await emailChangeService.initiateEmailChange(
        user._id.toString(),
        'email1@example.com'
      );
      expect(result1.success).toBe(true);
      
      // Create second request
      const result2 = await emailChangeService.initiateEmailChange(
        user._id.toString(),
        'email2@example.com'
      );
      expect(result2.success).toBe(true);
      
      // Should only have one pending request
      const requests = await EmailChangeRequest.find({ userId: user._id, status: 'pending' });
      expect(requests.length).toBe(1);
      expect(requests[0].newEmail).toBe('email2@example.com');
    });
  });
  
  describe('sendOTPToOldEmail', () => {
    
    test('should successfully send OTP to old email (Requirement 3.2)', async () => {
      const user = await createTestUser();
      
      // Initiate email change
      const initResult = await emailChangeService.initiateEmailChange(
        user._id.toString(),
        'newemail@example.com'
      );
      expect(initResult.success).toBe(true);
      
      // Send OTP to old email
      const result = await emailChangeService.sendOTPToOldEmail(user._id.toString());
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('القديم');
      
      // In test environment, OTP should be returned
      if (process.env.NODE_ENV === 'test') {
        expect(result.otp).toBeDefined();
        expect(result.otp).toHaveLength(6);
      }
    });
    
    test('should reject if no pending request exists', async () => {
      const user = await createTestUser();
      
      const result = await emailChangeService.sendOTPToOldEmail(user._id.toString());
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('معلق');
    });
    
    test('should reject if request is expired', async () => {
      const user = await createTestUser();
      
      // Create expired request
      const request = await EmailChangeRequest.create({
        userId: user._id,
        oldEmail: user.email,
        newEmail: 'newemail@example.com',
        oldEmailOTP: await bcrypt.hash('123456', 10),
        newEmailOTP: await bcrypt.hash('654321', 10),
        status: 'pending',
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      });
      
      const result = await emailChangeService.sendOTPToOldEmail(user._id.toString());
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('انتهت');
    });
  });
  
  describe('verifyOldEmail', () => {
    
    test('should successfully verify old email with correct OTP', async () => {
      const user = await createTestUser();
      
      // Initiate and send OTP
      await emailChangeService.initiateEmailChange(user._id.toString(), 'newemail@example.com');
      const otpResult = await emailChangeService.sendOTPToOldEmail(user._id.toString());
      const otp = otpResult.otp;
      
      // Verify OTP
      const result = await emailChangeService.verifyOldEmail(user._id.toString(), otp);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('بنجاح');
      
      // Check that oldEmailVerified is true
      const request = await EmailChangeRequest.findOne({ userId: user._id, status: 'pending' });
      expect(request.oldEmailVerified).toBe(true);
    });
    
    test('should reject incorrect OTP', async () => {
      const user = await createTestUser();
      
      await emailChangeService.initiateEmailChange(user._id.toString(), 'newemail@example.com');
      await emailChangeService.sendOTPToOldEmail(user._id.toString());
      
      const result = await emailChangeService.verifyOldEmail(user._id.toString(), '000000');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('غير صحيح');
    });
    
    test('should reject if no pending request exists', async () => {
      const user = await createTestUser();
      
      const result = await emailChangeService.verifyOldEmail(user._id.toString(), '123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('معلق');
    });
    
    test('should reject if request is expired', async () => {
      const user = await createTestUser();
      
      // Create expired request
      await EmailChangeRequest.create({
        userId: user._id,
        oldEmail: user.email,
        newEmail: 'newemail@example.com',
        oldEmailOTP: await bcrypt.hash('123456', 10),
        newEmailOTP: await bcrypt.hash('654321', 10),
        status: 'pending',
        expiresAt: new Date(Date.now() - 1000)
      });
      
      const result = await emailChangeService.verifyOldEmail(user._id.toString(), '123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('انتهت');
    });
  });
  
  describe('sendOTPToNewEmail', () => {
    
    test('should successfully send OTP to new email after old email verified (Requirement 3.3)', async () => {
      const user = await createTestUser();
      
      // Complete old email verification
      await emailChangeService.initiateEmailChange(user._id.toString(), 'newemail@example.com');
      const oldOtpResult = await emailChangeService.sendOTPToOldEmail(user._id.toString());
      await emailChangeService.verifyOldEmail(user._id.toString(), oldOtpResult.otp);
      
      // Send OTP to new email
      const result = await emailChangeService.sendOTPToNewEmail(user._id.toString());
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('الجديد');
      
      if (process.env.NODE_ENV === 'test') {
        expect(result.otp).toBeDefined();
        expect(result.otp).toHaveLength(6);
      }
    });
    
    test('should reject if old email not verified yet (Requirement 3.3)', async () => {
      const user = await createTestUser();
      
      await emailChangeService.initiateEmailChange(user._id.toString(), 'newemail@example.com');
      
      const result = await emailChangeService.sendOTPToNewEmail(user._id.toString());
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('القديم أولاً');
    });
    
    test('should reject if no pending request exists', async () => {
      const user = await createTestUser();
      
      const result = await emailChangeService.sendOTPToNewEmail(user._id.toString());
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('معلق');
    });
  });
  
  describe('verifyNewEmail', () => {
    
    test('should successfully verify new email with correct OTP', async () => {
      const user = await createTestUser();
      
      // Complete full verification flow
      await emailChangeService.initiateEmailChange(user._id.toString(), 'newemail@example.com');
      const oldOtp = (await emailChangeService.sendOTPToOldEmail(user._id.toString())).otp;
      await emailChangeService.verifyOldEmail(user._id.toString(), oldOtp);
      const newOtp = (await emailChangeService.sendOTPToNewEmail(user._id.toString())).otp;
      
      // Verify new email
      const result = await emailChangeService.verifyNewEmail(user._id.toString(), newOtp);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('بنجاح');
      
      // Check that newEmailVerified is true
      const request = await EmailChangeRequest.findOne({ userId: user._id, status: 'pending' });
      expect(request.newEmailVerified).toBe(true);
    });
    
    test('should reject incorrect OTP', async () => {
      const user = await createTestUser();
      
      await emailChangeService.initiateEmailChange(user._id.toString(), 'newemail@example.com');
      const oldOtp = (await emailChangeService.sendOTPToOldEmail(user._id.toString())).otp;
      await emailChangeService.verifyOldEmail(user._id.toString(), oldOtp);
      await emailChangeService.sendOTPToNewEmail(user._id.toString());
      
      const result = await emailChangeService.verifyNewEmail(user._id.toString(), '000000');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('غير صحيح');
    });
    
    test('should reject if old email not verified', async () => {
      const user = await createTestUser();
      
      await emailChangeService.initiateEmailChange(user._id.toString(), 'newemail@example.com');
      
      const result = await emailChangeService.verifyNewEmail(user._id.toString(), '123456');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('القديم أولاً');
    });
  });
  
  describe('verifyAndUpdate', () => {
    
    test('should successfully update email after full verification (Requirements 3.4, 3.5)', async () => {
      const user = await createTestUser('old@example.com', 'Password123!');
      const newEmail = 'new@example.com';
      
      // Complete full verification flow
      await emailChangeService.initiateEmailChange(user._id.toString(), newEmail);
      const oldOtp = (await emailChangeService.sendOTPToOldEmail(user._id.toString())).otp;
      await emailChangeService.verifyOldEmail(user._id.toString(), oldOtp);
      const newOtp = (await emailChangeService.sendOTPToNewEmail(user._id.toString())).otp;
      await emailChangeService.verifyNewEmail(user._id.toString(), newOtp);
      
      // Verify and update
      const result = await emailChangeService.verifyAndUpdate(
        user._id.toString(),
        'Password123!'
      );
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('بنجاح');
      expect(result.newEmail).toBe(newEmail);
      
      // Verify email was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.emailVerified).toBe(true);
      
      // Verify request was marked as completed
      const request = await EmailChangeRequest.findOne({ userId: user._id });
      expect(request.status).toBe('completed');
      expect(request.completedAt).toBeDefined();
    });
    
    test('should invalidate all other sessions (Requirement 3.5)', async () => {
      const user = await createTestUser('old@example.com', 'Password123!');
      
      // Create multiple sessions
      const session1 = await createTestSession(user._id, 'token1');
      const session2 = await createTestSession(user._id, 'token2');
      const session3 = await createTestSession(user._id, 'token3');
      
      // Complete verification flow
      await emailChangeService.initiateEmailChange(user._id.toString(), 'new@example.com');
      const oldOtp = (await emailChangeService.sendOTPToOldEmail(user._id.toString())).otp;
      await emailChangeService.verifyOldEmail(user._id.toString(), oldOtp);
      const newOtp = (await emailChangeService.sendOTPToNewEmail(user._id.toString())).otp;
      await emailChangeService.verifyNewEmail(user._id.toString(), newOtp);
      
      // Update with current session
      const result = await emailChangeService.verifyAndUpdate(
        user._id.toString(),
        'Password123!',
        session1._id.toString()
      );
      
      expect(result.success).toBe(true);
      expect(result.sessionsInvalidated).toBe(2); // session2 and session3
      
      // Verify sessions were deleted
      const remainingSessions = await ActiveSession.find({ userId: user._id });
      expect(remainingSessions.length).toBe(1);
      expect(remainingSessions[0]._id.toString()).toBe(session1._id.toString());
    });
    
    test('should reject incorrect password (Requirement 3.4)', async () => {
      const user = await createTestUser('old@example.com', 'Password123!');
      
      // Complete verification flow
      await emailChangeService.initiateEmailChange(user._id.toString(), 'new@example.com');
      const oldOtp = (await emailChangeService.sendOTPToOldEmail(user._id.toString())).otp;
      await emailChangeService.verifyOldEmail(user._id.toString(), oldOtp);
      const newOtp = (await emailChangeService.sendOTPToNewEmail(user._id.toString())).otp;
      await emailChangeService.verifyNewEmail(user._id.toString(), newOtp);
      
      // Try with wrong password
      const result = await emailChangeService.verifyAndUpdate(
        user._id.toString(),
        'WrongPassword123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('غير صحيحة');
      
      // Verify email was NOT updated
      const user2 = await User.findById(user._id);
      expect(user2.email).toBe('old@example.com');
    });
    
    test('should reject if both emails not verified (Requirement 3.4)', async () => {
      const user = await createTestUser('old@example.com', 'Password123!');
      
      // Only verify old email
      await emailChangeService.initiateEmailChange(user._id.toString(), 'new@example.com');
      const oldOtp = (await emailChangeService.sendOTPToOldEmail(user._id.toString())).otp;
      await emailChangeService.verifyOldEmail(user._id.toString(), oldOtp);
      
      // Try to update without verifying new email
      const result = await emailChangeService.verifyAndUpdate(
        user._id.toString(),
        'Password123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('كلا البريدين');
    });
    
    test('should reject if no pending request exists', async () => {
      const user = await createTestUser('old@example.com', 'Password123!');
      
      const result = await emailChangeService.verifyAndUpdate(
        user._id.toString(),
        'Password123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('معلق');
    });
    
    test('should reject if request is expired', async () => {
      const user = await createTestUser('old@example.com', 'Password123!');
      
      // Create expired but verified request
      await EmailChangeRequest.create({
        userId: user._id,
        oldEmail: user.email,
        newEmail: 'new@example.com',
        oldEmailOTP: await bcrypt.hash('123456', 10),
        newEmailOTP: await bcrypt.hash('654321', 10),
        oldEmailVerified: true,
        newEmailVerified: true,
        status: 'pending',
        expiresAt: new Date(Date.now() - 1000)
      });
      
      const result = await emailChangeService.verifyAndUpdate(
        user._id.toString(),
        'Password123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('انتهت');
    });
  });
  
  describe('getRequestStatus', () => {
    
    test('should return request status if exists', async () => {
      const user = await createTestUser();
      
      await emailChangeService.initiateEmailChange(user._id.toString(), 'new@example.com');
      
      const status = await emailChangeService.getRequestStatus(user._id.toString());
      
      expect(status).toBeDefined();
      expect(status.oldEmail).toBe(user.email);
      expect(status.newEmail).toBe('new@example.com');
      expect(status.oldEmailVerified).toBe(false);
      expect(status.newEmailVerified).toBe(false);
      expect(status.status).toBe('pending');
      expect(status.isExpired).toBe(false);
    });
    
    test('should return null if no pending request', async () => {
      const user = await createTestUser();
      
      const status = await emailChangeService.getRequestStatus(user._id.toString());
      
      expect(status).toBeNull();
    });
  });
  
  describe('cancelRequest', () => {
    
    test('should successfully cancel pending request', async () => {
      const user = await createTestUser();
      
      await emailChangeService.initiateEmailChange(user._id.toString(), 'new@example.com');
      
      const result = await emailChangeService.cancelRequest(user._id.toString());
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('إلغاء');
      
      // Verify request was deleted
      const request = await EmailChangeRequest.findOne({ userId: user._id, status: 'pending' });
      expect(request).toBeNull();
    });
    
    test('should return error if no pending request', async () => {
      const user = await createTestUser();
      
      const result = await emailChangeService.cancelRequest(user._id.toString());
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('معلق');
    });
  });
  
  describe('OTP expiration', () => {
    
    test('OTP should expire after 15 minutes', async () => {
      const user = await createTestUser();
      
      // Create request with custom expiration
      const request = await EmailChangeRequest.create({
        userId: user._id,
        oldEmail: user.email,
        newEmail: 'new@example.com',
        oldEmailOTP: await bcrypt.hash('123456', 10),
        newEmailOTP: await bcrypt.hash('654321', 10),
        status: 'pending',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
      
      // Should not be expired yet
      expect(request.isExpired()).toBe(false);
      
      // Manually set expiration to past
      request.expiresAt = new Date(Date.now() - 1000);
      await request.save();
      
      // Should be expired now
      expect(request.isExpired()).toBe(true);
    });
  });
});
