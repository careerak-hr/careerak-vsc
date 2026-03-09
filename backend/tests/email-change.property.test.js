/**
 * Property-Based Tests for Email Change Service
 * Feature: settings-page-enhancements
 * Property 3: Unique Identifier Enforcement
 * Property 4: Email Change Verification Flow
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 4.1
 * 
 * Property 3: For any email or phone number that is already registered,
 * attempting to change to that identifier should be rejected with a "already in use" error.
 * 
 * Property 4: For any valid email change request, the system should require
 * verification of both old and new emails plus password confirmation before updating.
 */

const fc = require('fast-check');
const emailChangeService = require('../src/services/emailChangeService');
const EmailChangeRequest = require('../src/models/EmailChangeRequest');
const { User } = require('../src/models/User');
const ActiveSession = require('../src/models/ActiveSession');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

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

// Increase timeout for property-based tests
jest.setTimeout(120000);

// Arbitraries (مولدات البيانات العشوائية)

/**
 * مولد لعناوين بريد إلكتروني صالحة
 */
const validEmailArbitrary = () => fc.emailAddress();

/**
 * مولد لكلمات مرور صالحة
 */
const validPasswordArbitrary = () => fc.string({ minLength: 8, maxLength: 20 })
  .map(s => `Pass${s}123!`);

/**
 * مولد لأرقام هواتف صالحة
 */
const validPhoneArbitrary = () => fc.integer({ min: 1000000000, max: 9999999999 })
  .map(n => `+201${n.toString().slice(0, 9)}`);

/**
 * مولد لبيانات مستخدم كاملة
 */
const userDataArbitrary = () => fc.record({
  email: validEmailArbitrary(),
  password: validPasswordArbitrary(),
  phone: validPhoneArbitrary(),
  firstName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2),
  lastName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2),
  country: fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE', 'Jordan', 'Lebanon')
});

// Helper Functions

/**
 * إنشاء مستخدم اختبار
 */
async function createTestUser(userData) {
  const user = new User({
    email: userData.email,
    password: userData.password,
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    country: userData.country,
    role: 'Employee',
    userType: 'Employee'
  });
  await user.save();
  return user;
}

/**
 * إنشاء جلسة اختبار
 */
async function createTestSession(userId, token = 'test-token-hash') {
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
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
  return session;
}

/**
 * تنظيف البيانات بعد الاختبار
 */
async function cleanup(userIds = []) {
  if (userIds.length > 0) {
    await EmailChangeRequest.deleteMany({ userId: { $in: userIds } });
    await ActiveSession.deleteMany({ userId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  }
}

/**
 * إكمال تدفق التحقق الكامل
 */
async function completeVerificationFlow(userId) {
  // Send OTP to old email
  const oldOtpResult = await emailChangeService.sendOTPToOldEmail(userId.toString());
  if (!oldOtpResult.success) {
    throw new Error('Failed to send OTP to old email');
  }
  
  // Verify old email
  const verifyOldResult = await emailChangeService.verifyOldEmail(userId.toString(), oldOtpResult.otp);
  if (!verifyOldResult.success) {
    throw new Error('Failed to verify old email');
  }
  
  // Send OTP to new email
  const newOtpResult = await emailChangeService.sendOTPToNewEmail(userId.toString());
  if (!newOtpResult.success) {
    throw new Error('Failed to send OTP to new email');
  }
  
  // Verify new email
  const verifyNewResult = await emailChangeService.verifyNewEmail(userId.toString(), newOtpResult.otp);
  if (!verifyNewResult.success) {
    throw new Error('Failed to verify new email');
  }
  
  return true;
}

// Tests

describe('Settings Page Enhancements - Property 3: Unique Identifier Enforcement', () => {
  
  beforeAll(async () => {
    await connectDB();
  });
  
  afterAll(async () => {
    // Don't close connection here as it will be used by other test suites
  });
  
  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });
  
  /**
   * Property Test: محاولة تغيير البريد إلى بريد مستخدم آخر يجب أن ترفض دائماً
   * Validates: Requirement 3.1
   */
  it('should always reject email change to an already registered email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(userDataArbitrary(), userDataArbitrary()).filter(
          ([user1, user2]) => user1.email !== user2.email && user1.phone !== user2.phone
        ),
        async ([userData1, userData2]) => {
          const userIds = [];
          
          try {
            // 1. إنشاء مستخدمين مختلفين
            const user1 = await createTestUser(userData1);
            const user2 = await createTestUser(userData2);
            userIds.push(user1._id, user2._id);
            
            // 2. محاولة تغيير بريد user1 إلى بريد user2
            const result = await emailChangeService.initiateEmailChange(
              user1._id.toString(),
              user2.email
            );
            
            // 3. يجب أن يرفض الطلب
            expect(result.success).toBe(false);
            expect(result.message).toMatch(/مستخدم بالفعل|already.*use|already.*registered/i);
            
            // 4. التحقق من عدم إنشاء طلب في قاعدة البيانات
            const request = await EmailChangeRequest.findOne({
              userId: user1._id,
              newEmail: user2.email,
              status: 'pending'
            });
            expect(request).toBeNull();
            
            // 5. التحقق من عدم تغيير البريد الأصلي
            const unchangedUser = await User.findById(user1._id);
            expect(unchangedUser.email).toBe(userData1.email);
            
            // 6. التنظيف
            await cleanup(userIds);
            
            return true;
          } catch (error) {
            await cleanup(userIds);
            throw error;
          }
        }
      ),
      { 
        numRuns: 20,
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Property Test: محاولة تغيير البريد إلى نفس البريد الحالي يجب أن ترفض دائماً
   * Validates: Requirement 3.1
   */
  it('should always reject email change to the same current email', async () => {
    await fc.assert(
      fc.asyncProperty(
        userDataArbitrary(),
        async (userData) => {
          const userIds = [];
          
          try {
            // 1. إنشاء مستخدم
            const user = await createTestUser(userData);
            userIds.push(user._id);
            
            // 2. محاولة تغيير البريد إلى نفس البريد الحالي
            const result = await emailChangeService.initiateEmailChange(
              user._id.toString(),
              user.email
            );
            
            // 3. يجب أن يرفض الطلب
            expect(result.success).toBe(false);
            expect(result.message).toMatch(/مطابق|same|current/i);
            
            // 4. التحقق من عدم إنشاء طلب
            const request = await EmailChangeRequest.findOne({
              userId: user._id,
              status: 'pending'
            });
            expect(request).toBeNull();
            
            // 5. التنظيف
            await cleanup(userIds);
            
            return true;
          } catch (error) {
            await cleanup(userIds);
            throw error;
          }
        }
      ),
      { 
        numRuns: 20,
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Property Test: تغيير البريد إلى بريد فريد يجب أن ينجح دائماً
   * Validates: Requirement 3.1
   */
  it('should always succeed when changing to a unique email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(userDataArbitrary(), validEmailArbitrary()),
        async ([userData, newEmail]) => {
          const userIds = [];
          
          try {
            // 1. إنشاء مستخدم
            const user = await createTestUser(userData);
            userIds.push(user._id);
            
            // 2. التأكد من أن البريد الجديد مختلف عن الحالي
            if (newEmail.toLowerCase() === user.email.toLowerCase()) {
              // تخطي هذه الحالة
              await cleanup(userIds);
              return true;
            }
            
            // 3. التأكد من أن البريد الجديد غير مسجل
            const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
            if (existingUser) {
              // تخطي هذه الحالة
              await cleanup(userIds);
              return true;
            }
            
            // 4. محاولة تغيير البريد
            const result = await emailChangeService.initiateEmailChange(
              user._id.toString(),
              newEmail
            );
            
            // 5. يجب أن ينجح الطلب
            expect(result.success).toBe(true);
            expect(result.requestId).toBeDefined();
            
            // 6. التحقق من إنشاء طلب في قاعدة البيانات
            const request = await EmailChangeRequest.findById(result.requestId);
            expect(request).toBeDefined();
            expect(request.userId.toString()).toBe(user._id.toString());
            expect(request.oldEmail).toBe(user.email);
            expect(request.newEmail).toBe(newEmail.toLowerCase());
            expect(request.status).toBe('pending');
            
            // 7. التنظيف
            await cleanup(userIds);
            
            return true;
          } catch (error) {
            await cleanup(userIds);
            throw error;
          }
        }
      ),
      { 
        numRuns: 20,
        timeout: 30000
      }
    );
  }, 120000);
});

describe('Settings Page Enhancements - Property 4: Email Change Verification Flow', () => {
  
  beforeAll(async () => {
    // Ensure connection is established
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  });
  
  afterAll(async () => {
    // Don't close connection here as it might be used by other tests
  });
  
  beforeEach(async () => {
    // Clear all collections before each test
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany();
      }
    }
  });
  
  /**
   * Property Test: التحقق من البريد القديم يجب أن يكون مطلوباً قبل البريد الجديد
   * Validates: Requirements 3.2, 3.3
   */
  it('should always require old email verification before new email verification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(userDataArbitrary(), validEmailArbitrary()),
        async ([userData, newEmail]) => {
          const userIds = [];
          
          try {
            // 1. إنشاء مستخدم
            const user = await createTestUser(userData);
            userIds.push(user._id);
            
            // 2. التأكد من أن البريد الجديد مختلف وفريد
            if (newEmail.toLowerCase() === user.email.toLowerCase()) {
              await cleanup(userIds);
              return true;
            }
            
            const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
            if (existingUser) {
              await cleanup(userIds);
              return true;
            }
            
            // 3. بدء طلب تغيير البريد
            const initResult = await emailChangeService.initiateEmailChange(
              user._id.toString(),
              newEmail
            );
            expect(initResult.success).toBe(true);
            
            // 4. محاولة إرسال OTP للبريد الجديد بدون التحقق من القديم
            const sendNewOtpResult = await emailChangeService.sendOTPToNewEmail(user._id.toString());
            
            // 5. يجب أن يرفض الطلب
            expect(sendNewOtpResult.success).toBe(false);
            expect(sendNewOtpResult.message).toMatch(/القديم أولاً|old.*first|verify.*old/i);
            
            // 6. التحقق من أن حالة الطلب لم تتغير
            const request = await EmailChangeRequest.findById(initResult.requestId);
            expect(request.oldEmailVerified).toBe(false);
            expect(request.newEmailVerified).toBe(false);
            
            // 7. التنظيف
            await cleanup(userIds);
            
            return true;
          } catch (error) {
            await cleanup(userIds);
            throw error;
          }
        }
      ),
      { 
        numRuns: 20,
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Property Test: التحقق من كلمة المرور يجب أن يكون مطلوباً قبل التحديث النهائي
   * Validates: Requirements 3.4, 3.5
   */
  it('should always require password confirmation before final update', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(userDataArbitrary(), validEmailArbitrary(), validPasswordArbitrary()),
        async ([userData, newEmail, wrongPassword]) => {
          const userIds = [];
          
          try {
            // 1. إنشاء مستخدم
            const user = await createTestUser(userData);
            userIds.push(user._id);
            
            // 2. التأكد من أن البريد الجديد مختلف وفريد
            if (newEmail.toLowerCase() === user.email.toLowerCase()) {
              await cleanup(userIds);
              return true;
            }
            
            const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
            if (existingUser) {
              await cleanup(userIds);
              return true;
            }
            
            // 3. التأكد من أن كلمة المرور الخاطئة مختلفة عن الصحيحة
            if (wrongPassword === userData.password) {
              await cleanup(userIds);
              return true;
            }
            
            // 4. بدء طلب تغيير البريد
            const initResult = await emailChangeService.initiateEmailChange(
              user._id.toString(),
              newEmail
            );
            expect(initResult.success).toBe(true);
            
            // 5. إكمال تدفق التحقق
            await completeVerificationFlow(user._id);
            
            // 6. محاولة التحديث بكلمة مرور خاطئة
            const updateResult = await emailChangeService.verifyAndUpdate(
              user._id.toString(),
              wrongPassword
            );
            
            // 7. يجب أن يرفض الطلب
            expect(updateResult.success).toBe(false);
            expect(updateResult.message).toMatch(/غير صحيحة|incorrect|wrong|invalid.*password/i);
            
            // 8. التحقق من عدم تغيير البريد
            const unchangedUser = await User.findById(user._id);
            expect(unchangedUser.email).toBe(userData.email);
            
            // 9. التحقق من أن الطلب لا يزال معلقاً
            const request = await EmailChangeRequest.findById(initResult.requestId);
            expect(request.status).toBe('pending');
            
            // 10. التنظيف
            await cleanup(userIds);
            
            return true;
          } catch (error) {
            await cleanup(userIds);
            throw error;
          }
        }
      ),
      { 
        numRuns: 15,
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Property Test: التدفق الكامل يجب أن ينجح مع جميع التحققات الصحيحة
   * Validates: Requirements 3.2, 3.3, 3.4, 3.5
   */
  it('should always succeed with complete verification flow and correct password', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(userDataArbitrary(), validEmailArbitrary()),
        async ([userData, newEmail]) => {
          const userIds = [];
          
          try {
            // 1. إنشاء مستخدم
            const user = await createTestUser(userData);
            userIds.push(user._id);
            
            // 2. التأكد من أن البريد الجديد مختلف وفريد
            if (newEmail.toLowerCase() === user.email.toLowerCase()) {
              await cleanup(userIds);
              return true;
            }
            
            const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
            if (existingUser) {
              await cleanup(userIds);
              return true;
            }
            
            // 3. بدء طلب تغيير البريد
            const initResult = await emailChangeService.initiateEmailChange(
              user._id.toString(),
              newEmail
            );
            expect(initResult.success).toBe(true);
            
            // 4. إكمال تدفق التحقق
            await completeVerificationFlow(user._id);
            
            // 5. التحديث بكلمة المرور الصحيحة
            const updateResult = await emailChangeService.verifyAndUpdate(
              user._id.toString(),
              userData.password
            );
            
            // 6. يجب أن ينجح التحديث
            expect(updateResult.success).toBe(true);
            expect(updateResult.newEmail).toBe(newEmail.toLowerCase());
            
            // 7. التحقق من تحديث البريد في قاعدة البيانات
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.email).toBe(newEmail.toLowerCase());
            expect(updatedUser.emailVerified).toBe(true);
            
            // 8. التحقق من تحديث حالة الطلب
            const request = await EmailChangeRequest.findById(initResult.requestId);
            expect(request.status).toBe('completed');
            expect(request.completedAt).toBeDefined();
            
            // 9. التنظيف
            await cleanup(userIds);
            
            return true;
          } catch (error) {
            await cleanup(userIds);
            throw error;
          }
        }
      ),
      { 
        numRuns: 15,
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Property Test: إنهاء الجلسات الأخرى يجب أن يحدث دائماً عند تغيير البريد
   * Validates: Requirement 3.5
   */
  it('should always invalidate other sessions when email is changed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          userDataArbitrary(),
          validEmailArbitrary(),
          fc.integer({ min: 2, max: 5 }) // عدد الجلسات
        ),
        async ([userData, newEmail, sessionCount]) => {
          const userIds = [];
          
          try {
            // 1. إنشاء مستخدم
            const user = await createTestUser(userData);
            userIds.push(user._id);
            
            // 2. التأكد من أن البريد الجديد مختلف وفريد
            if (newEmail.toLowerCase() === user.email.toLowerCase()) {
              await cleanup(userIds);
              return true;
            }
            
            const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
            if (existingUser) {
              await cleanup(userIds);
              return true;
            }
            
            // 3. إنشاء عدة جلسات
            const sessions = [];
            for (let i = 0; i < sessionCount; i++) {
              const session = await createTestSession(user._id, `token-${i}`);
              sessions.push(session);
            }
            
            // 4. بدء طلب تغيير البريد
            const initResult = await emailChangeService.initiateEmailChange(
              user._id.toString(),
              newEmail
            );
            expect(initResult.success).toBe(true);
            
            // 5. إكمال تدفق التحقق
            await completeVerificationFlow(user._id);
            
            // 6. التحديث مع الاحتفاظ بالجلسة الأولى
            const updateResult = await emailChangeService.verifyAndUpdate(
              user._id.toString(),
              userData.password,
              sessions[0]._id.toString()
            );
            
            // 7. يجب أن ينجح التحديث
            expect(updateResult.success).toBe(true);
            expect(updateResult.sessionsInvalidated).toBe(sessionCount - 1);
            
            // 8. التحقق من بقاء جلسة واحدة فقط
            const remainingSessions = await ActiveSession.find({ userId: user._id });
            expect(remainingSessions.length).toBe(1);
            expect(remainingSessions[0]._id.toString()).toBe(sessions[0]._id.toString());
            
            // 9. التنظيف
            await cleanup(userIds);
            
            return true;
          } catch (error) {
            await cleanup(userIds);
            throw error;
          }
        }
      ),
      { 
        numRuns: 10,
        timeout: 30000
      }
    );
  }, 120000);
  
  /**
   * Unit Test: التحقق من التدفق الكامل خطوة بخطوة
   */
  it('should complete full email change flow step by step', async () => {
    const userIds = [];
    
    try {
      // 1. إنشاء مستخدم
      const userData = {
        email: 'olduser@example.com',
        password: 'OldPass123!',
        phone: '+201234567890',
        firstName: 'Old',
        lastName: 'User',
        country: 'Egypt'
      };
      const user = await createTestUser(userData);
      userIds.push(user._id);
      
      const newEmail = 'newuser@example.com';
      
      // 2. بدء طلب تغيير البريد
      const initResult = await emailChangeService.initiateEmailChange(
        user._id.toString(),
        newEmail
      );
      expect(initResult.success).toBe(true);
      expect(initResult.requestId).toBeDefined();
      
      // 3. إرسال OTP للبريد القديم
      const oldOtpResult = await emailChangeService.sendOTPToOldEmail(user._id.toString());
      expect(oldOtpResult.success).toBe(true);
      expect(oldOtpResult.otp).toBeDefined();
      
      // 4. التحقق من البريد القديم
      const verifyOldResult = await emailChangeService.verifyOldEmail(
        user._id.toString(),
        oldOtpResult.otp
      );
      expect(verifyOldResult.success).toBe(true);
      
      // 5. إرسال OTP للبريد الجديد
      const newOtpResult = await emailChangeService.sendOTPToNewEmail(user._id.toString());
      expect(newOtpResult.success).toBe(true);
      expect(newOtpResult.otp).toBeDefined();
      
      // 6. التحقق من البريد الجديد
      const verifyNewResult = await emailChangeService.verifyNewEmail(
        user._id.toString(),
        newOtpResult.otp
      );
      expect(verifyNewResult.success).toBe(true);
      
      // 7. التحديث النهائي
      const updateResult = await emailChangeService.verifyAndUpdate(
        user._id.toString(),
        userData.password
      );
      expect(updateResult.success).toBe(true);
      expect(updateResult.newEmail).toBe(newEmail);
      
      // 8. التحقق من التحديث في قاعدة البيانات
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.emailVerified).toBe(true);
      
      // 9. التحقق من حالة الطلب
      const request = await EmailChangeRequest.findById(initResult.requestId);
      expect(request.status).toBe('completed');
      expect(request.oldEmailVerified).toBe(true);
      expect(request.newEmailVerified).toBe(true);
      expect(request.completedAt).toBeDefined();
      
      // 10. التنظيف
      await cleanup(userIds);
    } catch (error) {
      await cleanup(userIds);
      throw error;
    }
  });
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
