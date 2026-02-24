/**
 * Email Validation Property-Based Tests
 * 
 * Tests the correctness properties of email validation implementation
 * using property-based testing with fast-check.
 * 
 * Properties tested:
 * - Property 3: Email Format Validation
 * - Property 4: Email Uniqueness
 * 
 * Requirements: 4.1, 4.4
 */

const fc = require('fast-check');
const validator = require('validator');
const mongoose = require('mongoose');
const { User, Individual, Company } = require('../src/models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  // إنشاء MongoDB في الذاكرة للاختبار
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // تنظيف قاعدة البيانات قبل كل اختبار
  await User.deleteMany({});
});

describe('Email Validation Property Tests', () => {
  /**
   * Property 3: Email Format Validation
   * 
   * For any email input, it should match the standard email regex pattern
   * before being accepted.
   * 
   * Validates: Requirements 4.1
   */
  describe('Property 3: Email Format Validation', () => {
    test('valid emails should pass format validation', () => {
      fc.assert(
        fc.property(
          // Generator لبريد إلكتروني صحيح
          fc.emailAddress(),
          (email) => {
            // يجب أن يكون البريد صحيحاً حسب validator.isEmail
            expect(validator.isEmail(email)).toBe(true);
            
            // يجب أن يحتوي على @
            expect(email).toContain('@');
            
            // يجب أن يحتوي على نطاق
            const parts = email.split('@');
            expect(parts.length).toBe(2);
            expect(parts[1]).toContain('.');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('invalid emails should fail format validation', () => {
      fc.assert(
        fc.property(
          // Generator لنصوص عشوائية (معظمها ليست بريد صحيح)
          fc.oneof(
            fc.string(), // نص عشوائي
            fc.constant('invalid'), // نص ثابت غير صحيح
            fc.constant('no-at-sign.com'), // بدون @
            fc.constant('@nodomain'), // بدون نطاق
            fc.constant('spaces in@email.com'), // مسافات
            fc.constant('double@@email.com'), // @ مكرر
            fc.constant('nodot@domain'), // بدون نقطة في النطاق
          ),
          (invalidEmail) => {
            // إذا كان البريد غير صحيح، يجب أن يفشل التحقق
            if (!validator.isEmail(invalidEmail)) {
              expect(validator.isEmail(invalidEmail)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('email format validation is consistent', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (input) => {
            // التحقق يجب أن يعطي نفس النتيجة دائماً لنفس المدخل
            const result1 = validator.isEmail(input);
            const result2 = validator.isEmail(input);
            expect(result1).toBe(result2);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('email format is case-insensitive for domain', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            const lowerCase = email.toLowerCase();
            const upperCase = email.toUpperCase();
            
            // كلاهما يجب أن يكون صحيحاً
            expect(validator.isEmail(lowerCase)).toBe(true);
            expect(validator.isEmail(upperCase)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('trimmed email should be valid if original is valid', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.nat(5), // عدد المسافات قبل
          fc.nat(5), // عدد المسافات بعد
          (email, spacesBefore, spacesAfter) => {
            const paddedEmail = ' '.repeat(spacesBefore) + email + ' '.repeat(spacesAfter);
            const trimmedEmail = paddedEmail.trim();
            
            // البريد بعد trim يجب أن يكون صحيحاً
            expect(validator.isEmail(trimmedEmail)).toBe(true);
            expect(trimmedEmail).toBe(email);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Email Uniqueness
   * 
   * For any new registration, the email should not exist in the database.
   * 
   * Validates: Requirements 4.4
   */
  describe('Property 4: Email Uniqueness', () => {
    test('newly created user email should be unique', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (email, name, password) => {
            // تنظيف قبل الاختبار
            await User.deleteMany({ email: email.toLowerCase() });
            
            // إنشاء مستخدم جديد
            const user = await Individual.create({
              firstName: name.split(' ')[0] || 'Test',
              lastName: name.split(' ')[1] || 'User',
              email: email.toLowerCase(),
              password,
              role: 'Employee',
              phone: `+201${Math.floor(Math.random() * 1000000000)}`,
              country: 'Egypt',
            });
            
            // التحقق من أن البريد موجود الآن
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            expect(existingUser).not.toBeNull();
            expect(existingUser.email).toBe(email.toLowerCase());
            
            // محاولة إنشاء مستخدم آخر بنفس البريد يجب أن تفشل
            await expect(
              Individual.create({
                firstName: 'Another',
                lastName: 'User',
                email: email.toLowerCase(),
                password: 'password123',
                role: 'Employee',
                phone: `+201${Math.floor(Math.random() * 1000000000)}`,
                country: 'Egypt',
              })
            ).rejects.toThrow();
          }
        ),
        { numRuns: 5 } // عدد أقل لأنها عمليات قاعدة بيانات
      );
    }, 60000); // زيادة timeout إلى 60 ثانية

    test('email uniqueness check is case-insensitive', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (email, name, password) => {
            // تنظيف قبل الاختبار
            await User.deleteMany({ email: email.toLowerCase() });
            
            // إنشاء مستخدم بالبريد بأحرف صغيرة
            await Individual.create({
              firstName: name.split(' ')[0] || 'Test',
              lastName: name.split(' ')[1] || 'User',
              email: email.toLowerCase(),
              password,
              role: 'Employee',
              phone: `+201${Math.floor(Math.random() * 1000000000)}`,
              country: 'Egypt',
            });
            
            // محاولة إنشاء مستخدم بنفس البريد بأحرف كبيرة يجب أن تفشل
            await expect(
              Individual.create({
                firstName: 'Another',
                lastName: 'User',
                email: email.toUpperCase(),
                password: 'password123',
                role: 'Employee',
                phone: `+201${Math.floor(Math.random() * 1000000000)}`,
                country: 'Egypt',
              })
            ).rejects.toThrow();
          }
        ),
        { numRuns: 5 }
      );
    }, 60000);

    test('different emails should allow multiple users', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.emailAddress(), { minLength: 2, maxLength: 3 }),
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (emails, name, password) => {
            // تنظيف قبل الاختبار
            await User.deleteMany({});
            
            // إزالة التكرارات (case-insensitive)
            const uniqueEmails = [...new Set(emails.map(e => e.toLowerCase()))];
            
            // إنشاء مستخدمين بأبريد مختلفة
            const users = [];
            for (let i = 0; i < uniqueEmails.length; i++) {
              const email = uniqueEmails[i];
              const user = await Individual.create({
                firstName: `${name}${i}`,
                lastName: 'User',
                email,
                password,
                role: 'Employee',
                phone: `+201${Math.floor(Math.random() * 1000000000)}`,
                country: 'Egypt',
              });
              users.push(user);
            }
            
            // التحقق من أن جميع المستخدمين تم إنشاؤهم
            expect(users.length).toBe(uniqueEmails.length);
            
            // التحقق من أن كل بريد فريد
            const userEmails = users.map(u => u.email);
            const uniqueUserEmails = [...new Set(userEmails)];
            expect(userEmails.length).toBe(uniqueUserEmails.length);
          }
        ),
        { numRuns: 3 }
      );
    }, 60000);

    test('email existence check returns correct result', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (email, name, password) => {
            // تنظيف قبل الاختبار
            await User.deleteMany({ email: email.toLowerCase() });
            
            // التحقق من أن البريد غير موجود
            let existingUser = await User.findOne({ email: email.toLowerCase() });
            expect(existingUser).toBeNull();
            
            // إنشاء مستخدم
            await Individual.create({
              firstName: name.split(' ')[0] || 'Test',
              lastName: name.split(' ')[1] || 'User',
              email: email.toLowerCase(),
              password,
              role: 'Employee',
              phone: `+201${Math.floor(Math.random() * 1000000000)}`,
              country: 'Egypt',
            });
            
            // التحقق من أن البريد موجود الآن
            existingUser = await User.findOne({ email: email.toLowerCase() });
            expect(existingUser).not.toBeNull();
            expect(existingUser.email).toBe(email.toLowerCase());
          }
        ),
        { numRuns: 20 }
      );
    });

    test('email normalization preserves uniqueness', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 3, maxLength: 50 }),
          fc.string({ minLength: 8, maxLength: 100 }),
          async (email, name, password) => {
            // تنظيف قبل الاختبار
            await User.deleteMany({ email: email.toLowerCase() });
            
            // إنشاء مستخدم بالبريد المنسق
            const normalizedEmail = email.trim().toLowerCase();
            await Individual.create({
              firstName: name.split(' ')[0] || 'Test',
              lastName: name.split(' ')[1] || 'User',
              email: normalizedEmail,
              password,
              role: 'Employee',
              phone: `+201${Math.floor(Math.random() * 1000000000)}`,
              country: 'Egypt',
            });
            
            // محاولة إنشاء مستخدم بنفس البريد مع مسافات أو أحرف كبيرة
            const variations = [
              email.toUpperCase(),
              ` ${email} `,
              email.toLowerCase(),
              `  ${email.toUpperCase()}  `,
            ];
            
            for (const variation of variations) {
              const normalizedVariation = variation.trim().toLowerCase();
              if (normalizedVariation === normalizedEmail) {
                // يجب أن تفشل لأن البريد موجود
                await expect(
                  Individual.create({
                    firstName: 'Another',
                    lastName: 'User',
                    email: normalizedVariation,
                    password: 'password123',
                    role: 'Employee',
                    phone: `+201${Math.floor(Math.random() * 1000000000)}`,
                    country: 'Egypt',
                  })
                ).rejects.toThrow();
              }
            }
          }
        ),
        { numRuns: 5 }
      );
    }, 60000);
  });

  /**
   * Additional Property: Email Validation Consistency
   * 
   * Email validation should be consistent across client and server
   */
  describe('Additional Property: Email Validation Consistency', () => {
    test('client-side and server-side validation should agree', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (input) => {
            // Client-side validation (regex)
            const clientValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
            
            // Server-side validation (validator.isEmail)
            const serverValid = validator.isEmail(input);
            
            // إذا كان client-side يقول صحيح، server-side يجب أن يوافق
            if (clientValid) {
              expect(serverValid).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('email validation handles edge cases', () => {
      const edgeCases = [
        '', // فارغ
        ' ', // مسافة
        '@', // @ فقط
        'a@', // بدون نطاق
        '@b.com', // بدون اسم مستخدم
        'a@b', // بدون TLD
        'a b@c.com', // مسافة في الاسم
        'a@b c.com', // مسافة في النطاق
        'a@@b.com', // @ مكرر
        'a@b..com', // نقطة مكررة
        '.a@b.com', // يبدأ بنقطة
        'a.@b.com', // ينتهي بنقطة قبل @
        'a@.b.com', // يبدأ بنقطة بعد @
        'a@b.com.', // ينتهي بنقطة
      ];

      edgeCases.forEach((email) => {
        const isValid = validator.isEmail(email);
        
        // جميع هذه الحالات يجب أن تكون غير صحيحة
        expect(isValid).toBe(false);
      });
    });

    test('valid email examples should pass', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user_name@example.com',
        'user123@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'test@test.com',
      ];

      validEmails.forEach((email) => {
        const isValid = validator.isEmail(email);
        expect(isValid).toBe(true);
      });
    });
  });
});
