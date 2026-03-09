const fc = require('fast-check');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');
const twoFactorService = require('../src/services/twoFactorService');
const speakeasy = require('speakeasy');

// Feature: settings-page-enhancements, Property 9 & 11: 2FA Backup Codes
// Validates: Requirements 8.3, 8.6

describe('Property 9 & 11: 2FA Backup Codes Generation and Acceptance', () => {
  let testUsers = [];

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await User.deleteMany({ email: /^test-2fa-backup-/ });
    await mongoose.connection.close();
  });

  afterEach(async () => {
    if (testUsers.length > 0) {
      await User.deleteMany({ _id: { $in: testUsers } });
      testUsers = [];
    }
  });

  /**
   * Property 9: 2FA Backup Codes Generation
   * For any 2FA activation, the system should generate exactly 10 unique backup codes.
   */
  test('Property 9: يجب إنشاء 10 أكواد احتياطية فريدة عند تفعيل 2FA', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-backup-gen-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user._id);

          // تفعيل 2FA
          const { backupCodes } = await twoFactorService.enable2FA(user._id.toString());

          // التحقق من عدد الأكواد
          const hasExactly10Codes = backupCodes.length === 10;

          // التحقق من أن جميع الأكواد فريدة
          const uniqueCodes = new Set(backupCodes);
          const allCodesUnique = uniqueCodes.size === 10;

          // التحقق من أن جميع الأكواد بالتنسيق الصحيح (8 أحرف hex)
          const allCodesValid = backupCodes.every(code => 
            /^[0-9A-F]{8}$/.test(code)
          );

          // Property: يجب إنشاء 10 أكواد فريدة بالتنسيق الصحيح
          return hasExactly10Codes && allCodesUnique && allCodesValid;
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  });

  /**
   * Property 11: Backup Code Acceptance
   * For any valid unused backup code, the system should accept it as alternative to OTP and mark it as used.
   */
  test('Property 11: يجب قبول كود احتياطي صحيح غير مستخدم', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-backup-accept-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user._id);

          // تفعيل 2FA
          const { secret, backupCodes } = await twoFactorService.enable2FA(user._id.toString());
          
          // التحقق من الإعداد
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), validOtp);

          // الحصول على عدد الأكواد قبل الاستخدام
          const statusBefore = await twoFactorService.get2FAStatus(user._id.toString());
          const codesCountBefore = statusBefore.backupCodesCount;

          // استخدام كود احتياطي
          const backupCode = backupCodes[0];
          const isAccepted = await twoFactorService.useBackupCode(user._id.toString(), backupCode);

          // الحصول على عدد الأكواد بعد الاستخدام
          const statusAfter = await twoFactorService.get2FAStatus(user._id.toString());
          const codesCountAfter = statusAfter.backupCodesCount;

          // محاولة استخدام نفس الكود مرة أخرى يجب أن تفشل
          let secondUseRejected = false;
          try {
            await twoFactorService.useBackupCode(user._id.toString(), backupCode);
          } catch (error) {
            secondUseRejected = true;
          }

          // Property: يجب قبول الكود الصحيح، تقليل العدد، ورفض إعادة الاستخدام
          return isAccepted === true && 
                 codesCountAfter === codesCountBefore - 1 && 
                 secondUseRejected === true;
        }
      ),
      { numRuns: 20, timeout: 10000 }
    );
  });

  test('Property 11: يجب رفض كود احتياطي خاطئ', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          invalidCode: fc.hexaString({ minLength: 8, maxLength: 8 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-backup-invalid-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user._id);

          // تفعيل 2FA
          const { secret, backupCodes } = await twoFactorService.enable2FA(user._id.toString());
          
          // التحقق من الإعداد
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), validOtp);

          // محاولة استخدام كود خاطئ (ليس من الأكواد المولدة)
          let invalidCodeRejected = false;
          try {
            // التأكد من أن الكود الخاطئ ليس من الأكواد الصحيحة
            let invalidCode = userData.invalidCode.toUpperCase();
            while (backupCodes.includes(invalidCode)) {
              invalidCode = (parseInt(invalidCode, 16) + 1).toString(16).toUpperCase().padStart(8, '0');
            }
            await twoFactorService.useBackupCode(user._id.toString(), invalidCode);
          } catch (error) {
            invalidCodeRejected = true;
          }

          // Property: يجب رفض كود خاطئ
          return invalidCodeRejected === true;
        }
      ),
      { numRuns: 15, timeout: 10000 }
    );
  });

  test('Property 9: إعادة إنشاء الأكواد يجب أن ينتج 10 أكواد جديدة', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 })
        }),
        async (userData) => {
          // إنشاء مستخدم
          const user = await User.create({
            email: `test-2fa-backup-regen-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user._id);

          // تفعيل 2FA
          const { secret, backupCodes: oldCodes } = await twoFactorService.enable2FA(user._id.toString());
          
          // التحقق من الإعداد
          const validOtp = speakeasy.totp({
            secret: secret,
            encoding: 'base32'
          });
          await twoFactorService.verify2FASetup(user._id.toString(), validOtp);

          // إعادة إنشاء الأكواد
          const newCodes = await twoFactorService.regenerateBackupCodes(
            user._id.toString(), 
            userData.password
          );

          // التحقق من عدد الأكواد الجديدة
          const hasExactly10NewCodes = newCodes.length === 10;

          // التحقق من أن الأكواد الجديدة مختلفة عن القديمة
          const codesAreDifferent = !oldCodes.some(oldCode => newCodes.includes(oldCode));

          // التحقق من أن جميع الأكواد الجديدة فريدة
          const uniqueNewCodes = new Set(newCodes);
          const allNewCodesUnique = uniqueNewCodes.size === 10;

          // Property: إعادة الإنشاء يجب أن تنتج 10 أكواد جديدة فريدة مختلفة
          return hasExactly10NewCodes && codesAreDifferent && allNewCodesUnique;
        }
      ),
      { numRuns: 15, timeout: 10000 }
    );
  });
});
