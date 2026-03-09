const fc = require('fast-check');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');
const twoFactorService = require('../src/services/twoFactorService');
const speakeasy = require('speakeasy');

// Feature: settings-page-enhancements, Property 10: 2FA Disable Protection
// Validates: Requirements 8.5

describe('Property 10: 2FA Disable Protection', () => {
  let testUsers = [];

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await User.deleteMany({ email: /^test-2fa-disable-/ });
    await mongoose.connection.close();
  });

  afterEach(async () => {
    if (testUsers.length > 0) {
      await User.deleteMany({ _id: { $in: testUsers } });
      testUsers = [];
    }
  });

  /**
   * Property 10: 2FA Disable Protection
   * For any 2FA disable request, the system should require both current password and valid OTP.
   */
  test('Property 10: تعطيل 2FA يتطلب كلمة المرور و OTP صحيحين', async () => {
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
            email: `test-2fa-disable-both-${Date.now()}-${Math.random()}@example.com`,
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
          
          // التحقق من الإعداد
          const setupOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), setupOtp);

          // التحقق من أن 2FA مفعّل
          let statusBefore = await twoFactorService.get2FAStatus(user._id.toString());
          expect(statusBefore.enabled).toBe(true);

          // إنشاء OTP صحيح للتعطيل
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });

          // تعطيل 2FA بكلمة المرور و OTP صحيحين
          const disableSuccess = await twoFactorService.disable2FA(
            user._id.toString(),
            validOtp,
            userData.password
          );

          // التحقق من أن 2FA تم تعطيله
          const statusAfter = await twoFactorService.get2FAStatus(user._id.toString());

          // Property: يجب أن ينجح التعطيل مع كلمة المرور و OTP صحيحين
          return disableSuccess === true && statusAfter.enabled === false;
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  });

  test('Property 10: تعطيل 2FA يفشل مع كلمة مرور خاطئة حتى مع OTP صحيح', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          wrongPassword: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // التأكد من أن كلمة المرور الخاطئة مختلفة
          if (userData.password === userData.wrongPassword) {
            userData.wrongPassword = userData.wrongPassword + 'X';
          }

          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-disable-wrongpass-${Date.now()}-${Math.random()}@example.com`,
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
          
          // التحقق من الإعداد
          const setupOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), setupOtp);

          // إنشاء OTP صحيح
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });

          // محاولة تعطيل 2FA بكلمة مرور خاطئة و OTP صحيح
          let disableFailed = false;
          try {
            await twoFactorService.disable2FA(
              user._id.toString(),
              validOtp,
              userData.wrongPassword
            );
          } catch (error) {
            disableFailed = error.message === 'كلمة المرور غير صحيحة';
          }

          // التحقق من أن 2FA لا يزال مفعلاً
          const statusAfter = await twoFactorService.get2FAStatus(user._id.toString());

          // Property: يجب أن يفشل التعطيل مع كلمة مرور خاطئة
          return disableFailed === true && statusAfter.enabled === true;
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  });

  test('Property 10: تعطيل 2FA يفشل مع OTP خاطئ حتى مع كلمة مرور صحيحة', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-disable-wrongotp-${Date.now()}-${Math.random()}@example.com`,
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
          
          // التحقق من الإعداد
          const setupOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), setupOtp);

          // إنشاء OTP خاطئ
          const invalidOtp = '000000';

          // محاولة تعطيل 2FA بكلمة مرور صحيحة و OTP خاطئ
          let disableFailed = false;
          try {
            await twoFactorService.disable2FA(
              user._id.toString(),
              invalidOtp,
              userData.password
            );
          } catch (error) {
            disableFailed = error.message === 'رمز OTP غير صحيح';
          }

          // التحقق من أن 2FA لا يزال مفعلاً
          const statusAfter = await twoFactorService.get2FAStatus(user._id.toString());

          // Property: يجب أن يفشل التعطيل مع OTP خاطئ
          return disableFailed === true && statusAfter.enabled === true;
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  });

  test('Property 10: تعطيل 2FA يفشل مع كلمة مرور و OTP خاطئين', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          wrongPassword: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // التأكد من أن كلمة المرور الخاطئة مختلفة
          if (userData.password === userData.wrongPassword) {
            userData.wrongPassword = userData.wrongPassword + 'X';
          }

          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-disable-both-wrong-${Date.now()}-${Math.random()}@example.com`,
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
          
          // التحقق من الإعداد
          const setupOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), setupOtp);

          // إنشاء OTP خاطئ
          const invalidOtp = '000000';

          // محاولة تعطيل 2FA بكلمة مرور خاطئة و OTP خاطئ
          let disableFailed = false;
          try {
            await twoFactorService.disable2FA(
              user._id.toString(),
              invalidOtp,
              userData.wrongPassword
            );
          } catch (error) {
            // يجب أن يفشل بسبب كلمة المرور أولاً (يتم التحقق منها أولاً)
            disableFailed = error.message === 'كلمة المرور غير صحيحة';
          }

          // التحقق من أن 2FA لا يزال مفعلاً
          const statusAfter = await twoFactorService.get2FAStatus(user._id.toString());

          // Property: يجب أن يفشل التعطيل مع كلمة مرور و OTP خاطئين
          return disableFailed === true && statusAfter.enabled === true;
        }
      ),
      { numRuns: 15, timeout: 10000 }
    );
  });

  test('Property 10: لا يمكن تعطيل 2FA إذا لم يكن مفعلاً', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم بدون 2FA
          const user = await User.create({
            email: `test-2fa-disable-notactive-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user._id);

          // محاولة تعطيل 2FA غير المفعل
          let disableFailed = false;
          try {
            await twoFactorService.disable2FA(
              user._id.toString(),
              '123456',
              userData.password
            );
          } catch (error) {
            disableFailed = error.message === 'المصادقة الثنائية غير مفعلة';
          }

          // Property: يجب أن يفشل تعطيل 2FA غير المفعل
          return disableFailed === true;
        }
      ),
      { numRuns: 15, timeout: 10000 }
    );
  });

  test('Property 10: تعطيل 2FA يحذف جميع البيانات المتعلقة', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-disable-cleanup-${Date.now()}-${Math.random()}@example.com`,
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
          
          // التحقق من الإعداد
          const setupOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), setupOtp);

          // التحقق من وجود البيانات قبل التعطيل
          const userBefore = await User.findById(user._id);
          const hasSecretBefore = !!userBefore.security?.twoFactorSecret;
          const hasBackupCodesBefore = !!userBefore.security?.backupCodes;

          // إنشاء OTP صحيح للتعطيل
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });

          // تعطيل 2FA
          await twoFactorService.disable2FA(
            user._id.toString(),
            validOtp,
            userData.password
          );

          // التحقق من حذف البيانات بعد التعطيل
          const userAfter = await User.findById(user._id);
          const hasSecretAfter = !!userAfter.security?.twoFactorSecret;
          const hasBackupCodesAfter = !!userAfter.security?.backupCodes;
          const isEnabledAfter = userAfter.security?.twoFactorEnabled;

          // Property: يجب حذف جميع البيانات المتعلقة بـ 2FA بعد التعطيل
          return hasSecretBefore === true && 
                 hasBackupCodesBefore === true &&
                 hasSecretAfter === false && 
                 hasBackupCodesAfter === false &&
                 isEnabledAfter === false;
        }
      ),
      { numRuns: 15, timeout: 10000 }
    );
  });
});
