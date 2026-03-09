const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../src/models/User');
const ActiveSession = require('../src/models/ActiveSession');
const PasswordChangeService = require('../src/services/passwordChangeService');

/**
 * Unit Tests: Password Change Service
 * 
 * Tests specific scenarios and edge cases for password change functionality
 * 
 * Validates: Requirements 5.1, 5.2, 5.3
 */

describe('PasswordChangeService - Unit Tests', () => {
  let mongoServer;
  let passwordChangeService;

  beforeAll(async () => {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    passwordChangeService = new PasswordChangeService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await ActiveSession.deleteMany({});
  });

  describe('verifyCurrentPassword', () => {
    test('should return valid=true for correct password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'TestPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      const result = await passwordChangeService.verifyCurrentPassword(
        user._id.toString(),
        'TestPass123!'
      );

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    test('should return valid=false for incorrect password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'TestPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      const result = await passwordChangeService.verifyCurrentPassword(
        user._id.toString(),
        'WrongPassword123!'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('كلمة المرور الحالية غير صحيحة');
    });

    test('should return valid=false for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();

      const result = await passwordChangeService.verifyCurrentPassword(
        fakeUserId,
        'TestPass123!'
      );

      expect(result.valid).toBe(false);
      expect(result.message).toBe('المستخدم غير موجود');
    });

    test('should return valid=false for missing inputs', async () => {
      const result1 = await passwordChangeService.verifyCurrentPassword(null, 'password');
      expect(result1.valid).toBe(false);
      expect(result1.message).toContain('مطلوبان');

      const result2 = await passwordChangeService.verifyCurrentPassword('userId', null);
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('مطلوبان');
    });
  });

  describe('validateNewPassword', () => {
    /**
     * Requirement 5.2: Reject weak passwords
     */
    test('should reject password shorter than 8 characters', async () => {
      const result = await passwordChangeService.validateNewPassword('Test1!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 أحرف على الأقل');
      expect(result.strength.score).toBeLessThan(5);
    });

    test('should reject password without uppercase letter', async () => {
      const result = await passwordChangeService.validateNewPassword('testpass123!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('حرف كبير');
      expect(result.strength.score).toBeLessThan(5);
    });

    test('should reject password without lowercase letter', async () => {
      const result = await passwordChangeService.validateNewPassword('TESTPASS123!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('حرف صغير');
      expect(result.strength.score).toBeLessThan(5);
    });

    test('should reject password without number', async () => {
      const result = await passwordChangeService.validateNewPassword('TestPassword!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('رقم');
      expect(result.strength.score).toBeLessThan(5);
    });

    test('should reject password without special character', async () => {
      const result = await passwordChangeService.validateNewPassword('TestPass123');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('رمز خاص');
      expect(result.strength.score).toBeLessThan(5);
    });

    test('should accept strong password with all requirements', async () => {
      const result = await passwordChangeService.validateNewPassword('TestPass123!');

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
      expect(result.strength.score).toBe(4);
      expect(result.strength.label).toBe('strong');
    });

    test('should return correct strength labels', async () => {
      // Strong (4/4 + special char)
      const strong = await passwordChangeService.validateNewPassword('TestPass123!');
      expect(strong.strength.label).toBe('strong');

      // Good (4/4) - missing special char
      const good = await passwordChangeService.validateNewPassword('TestPass123');
      expect(good.strength.label).toBe('good');

      // Fair (3/4) - missing special char and number
      const fair = await passwordChangeService.validateNewPassword('TestPassword');
      expect(fair.strength.label).toBe('fair');

      // Weak (2/4) - missing special char, number, and uppercase
      const weak = await passwordChangeService.validateNewPassword('testpassword');
      expect(weak.strength.label).toBe('weak');
    });

    test('should reject empty password', async () => {
      const result = await passwordChangeService.validateNewPassword('');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('كلمة المرور الجديدة مطلوبة');
    });

    test('should reject null password', async () => {
      const result = await passwordChangeService.validateNewPassword(null);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('كلمة المرور الجديدة مطلوبة');
    });
  });

  describe('changePassword', () => {
    /**
     * Requirement 5.3: Successful password change
     */
    test('should successfully change password with valid inputs', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'OldPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      const result = await passwordChangeService.changePassword(
        user._id.toString(),
        'OldPass123!',
        'NewPass456!'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('تم تغيير كلمة المرور بنجاح');

      // Verify password was actually changed
      const updatedUser = await User.findById(user._id).select('+password');
      const isNewPasswordCorrect = await updatedUser.comparePassword('NewPass456!');
      expect(isNewPasswordCorrect).toBe(true);

      // Verify old password no longer works
      const isOldPasswordCorrect = await updatedUser.comparePassword('OldPass123!');
      expect(isOldPasswordCorrect).toBe(false);
    });

    /**
     * Requirement 5.1: Reject incorrect current password
     */
    test('should reject change with incorrect current password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'OldPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      const result = await passwordChangeService.changePassword(
        user._id.toString(),
        'WrongPass123!',
        'NewPass456!'
      );

      expect(result.success).toBe(false);
      expect(result.message).toBe('كلمة المرور الحالية غير صحيحة');

      // Verify password was NOT changed
      const updatedUser = await User.findById(user._id).select('+password');
      const isOldPasswordStillCorrect = await updatedUser.comparePassword('OldPass123!');
      expect(isOldPasswordStillCorrect).toBe(true);
    });

    /**
     * Requirement 5.2: Reject weak new password
     */
    test('should reject change with weak new password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'OldPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      const result = await passwordChangeService.changePassword(
        user._id.toString(),
        'OldPass123!',
        'weak' // Too short, no uppercase, no number, no special char
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('8 أحرف');

      // Verify password was NOT changed
      const updatedUser = await User.findById(user._id).select('+password');
      const isOldPasswordStillCorrect = await updatedUser.comparePassword('OldPass123!');
      expect(isOldPasswordStillCorrect).toBe(true);
    });

    test('should reject change when new password is same as current', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'OldPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      const result = await passwordChangeService.changePassword(
        user._id.toString(),
        'OldPass123!',
        'OldPass123!' // Same as current
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('مختلفة');
    });

    test('should update password strength in user model', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'OldPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      await passwordChangeService.changePassword(
        user._id.toString(),
        'OldPass123!',
        'NewPass456!'
      );

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.passwordStrength.score).toBe(4);
      expect(updatedUser.passwordStrength.label).toBe('strong');
    });

    /**
     * Requirement 5.4: Invalidate other sessions
     */
    test('should invalidate other sessions after successful password change', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'OldPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      // Create 3 sessions
      const session1 = await ActiveSession.create({
        userId: user._id,
        token: 'token1',
        device: { type: 'desktop', os: 'Windows', browser: 'Chrome', fingerprint: 'fp1' },
        location: { ipAddress: '192.168.1.1' },
        loginTime: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      await ActiveSession.create({
        userId: user._id,
        token: 'token2',
        device: { type: 'mobile', os: 'iOS', browser: 'Safari', fingerprint: 'fp2' },
        location: { ipAddress: '192.168.1.2' },
        loginTime: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      await ActiveSession.create({
        userId: user._id,
        token: 'token3',
        device: { type: 'tablet', os: 'Android', browser: 'Chrome', fingerprint: 'fp3' },
        location: { ipAddress: '192.168.1.3' },
        loginTime: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Change password, keeping session1 active
      const result = await passwordChangeService.changePassword(
        user._id.toString(),
        'OldPass123!',
        'NewPass456!',
        session1._id.toString()
      );

      expect(result.success).toBe(true);
      expect(result.sessionsInvalidated).toBe(2);

      // Verify only session1 remains
      const remainingSessions = await ActiveSession.find({ userId: user._id });
      expect(remainingSessions.length).toBe(1);
      expect(remainingSessions[0]._id.toString()).toBe(session1._id.toString());
    });
  });

  describe('invalidateOtherSessions', () => {
    test('should invalidate all sessions except specified one', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'TestPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      // Create 5 sessions
      const sessions = [];
      for (let i = 0; i < 5; i++) {
        const session = await ActiveSession.create({
          userId: user._id,
          token: `token${i}`,
          device: { type: 'desktop', os: 'Windows', browser: 'Chrome', fingerprint: `fp${i}` },
          location: { ipAddress: `192.168.1.${i}` },
          loginTime: new Date(),
          lastActivity: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        sessions.push(session);
      }

      // Invalidate all except session 2
      const count = await passwordChangeService.invalidateOtherSessions(
        user._id.toString(),
        sessions[2]._id.toString()
      );

      expect(count).toBe(4);

      // Verify only session 2 remains
      const remainingSessions = await ActiveSession.find({ userId: user._id });
      expect(remainingSessions.length).toBe(1);
      expect(remainingSessions[0]._id.toString()).toBe(sessions[2]._id.toString());
    });

    test('should invalidate all sessions when no session specified', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'TestPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      // Create 3 sessions
      for (let i = 0; i < 3; i++) {
        await ActiveSession.create({
          userId: user._id,
          token: `token${i}`,
          device: { type: 'desktop', os: 'Windows', browser: 'Chrome', fingerprint: `fp${i}` },
          location: { ipAddress: `192.168.1.${i}` },
          loginTime: new Date(),
          lastActivity: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }

      // Invalidate all sessions
      const count = await passwordChangeService.invalidateOtherSessions(
        user._id.toString(),
        null
      );

      expect(count).toBe(3);

      // Verify no sessions remain
      const remainingSessions = await ActiveSession.find({ userId: user._id });
      expect(remainingSessions.length).toBe(0);
    });

    test('should return 0 when user has no sessions', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'TestPass123!',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: 'Test',
        lastName: 'User'
      });

      const count = await passwordChangeService.invalidateOtherSessions(
        user._id.toString(),
        null
      );

      expect(count).toBe(0);
    });
  });
});
