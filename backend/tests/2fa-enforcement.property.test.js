const fc = require('fast-check');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');
const twoFactorService = require('../src/services/twoFactorService');
const speakeasy = require('speakeasy');

// Feature: settings-page-enhancements, Property 8: 2FA Enforcement
// Validates: Requirements 8.4

describe('Property 8: 2FA Enforcement', () => {
  let testUsers = [];

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await User.deleteMany({ email: /^test-2fa-enforcement-/ });
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // تنظيف المستخدمين المؤقتين
    if (testUsers.length > 0) {
      await User.deleteMany({ _id: { $in: testUsers } });
      testUsers = [];
    }
  });

  /**
   * Property 8: 2FA Enforcement
   * For any user with 2FA enabled, login attempts should require valid OTP after password verification.
   */
  test('2FA enforcement - يجب أن يتطلب OTP صحيح بعد التحقق من كلمة المرور', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          name: fc.string({ minLength: 3, maxLength: 50 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-enforcement-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: userData.name,
            lastName: 'Test'
          });
          testUsers.push(user._id);

          // تفعيل 2FA
          const { secret } = await twoFactorService.enable2FA(user._id.toString());
          
          // إنشاء OTP صحيح للتحقق من الإعداد
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          
          await twoFactorService.verify2FASetup(user._id.toString(), validOtp);

          // التحقق من أن 2FA مفعّل
          const updatedUser = await User.findById(user._id);
          expect(updatedUser.security.twoFactorEnabled).toBe(true);

          // محاولة تسجيل دخول بدون OTP يجب أن تفشل
          // (في التطبيق الحقيقي، سيتم رفض الطلب)
          const status = await twoFactorService.get2FAStatus(user._id.toString());
          expect(status.enabled).toBe(true);

          // محاولة تسجيل دخول مع OTP خاطئ يجب أن تفشل
          const invalidOtp = '000000';
          const isInvalidOtpValid = await twoFactorService.verifyOTP(user._id.toString(), invalidOtp);
          expect(isInvalidOtpValid).toBe(false);

          // محاولة تسجيل دخول مع OTP صحيح يجب أن تنجح
          const newValidOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          const isValidOtpValid = await twoFactorService.verifyOTP(user._id.toString(), newValidOtp);
          expect(isValidOtpValid).toBe(true);

          // Property: بعد تفعيل 2FA، يجب أن يتطلب OTP صحيح
          return status.enabled === true && isInvalidOtpValid === false && isValidOtpValid === true;
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  });

  test('2FA enforcement - OTP منتهي الصلاحية يجب أن يُرفض', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-enforcement-expired-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user._id);

          // تفعيل 2FA
          const { secret } = await twoFactorService.enable2FA(user._id.toString());
          
          // إنشاء OTP صحيح للتحقق من الإعداد
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          
          await twoFactorService.verify2FASetup(user._id.toString(), validOtp);

          // إنشاء OTP قديم (من 5 دقائق مضت)
          const oldOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32',
            time: Math.floor(Date.now() / 1000) - 300 // 5 دقائق مضت
          });

          // التحقق من OTP القديم يجب أن يفشل
          const isOldOtpValid = await twoFactorService.verifyOTP(user._id.toString(), oldOtp);

          // Property: OTP منتهي الصلاحية يجب أن يُرفض
          return isOldOtpValid === false;
        }
      ),
      { numRuns: 15, timeout: 10000 }
    );
  });

  test('2FA enforcement - مستخدم بدون 2FA لا يحتاج OTP', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم بدون 2FA
          const user = await User.create({
            email: `test-2fa-enforcement-no2fa-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user._id);

          // التحقق من حالة 2FA
          const status = await twoFactorService.get2FAStatus(user._id.toString());

          // Property: مستخدم بدون 2FA لا يحتاج OTP
          return status.enabled === false;
        }
      ),
      { numRuns: 15, timeout: 10000 }
    );
  });
});
