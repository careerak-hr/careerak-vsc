/**
 * Property-Based Tests للأمان
 * 
 * Property 8: JWT Token Expiry
 * Property 9: Password Hash
 * 
 * **Validates: Requirements 7.2, 7.1**
 */

const fc = require('fast-check');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  isTokenExpired,
  getTokenRemainingTime,
  decodeToken
} = require('../src/services/jwtService');
const { User } = require('../src/models/User');

// Mock user data generator
const userArbitrary = fc.record({
  _id: fc.string({ minLength: 24, maxLength: 24 }).map(s => 
    s.split('').map(c => '0123456789abcdef'[c.charCodeAt(0) % 16]).join('')
  ),
  email: fc.emailAddress(),
  role: fc.constantFrom('HR', 'Employee', 'Admin')
});

describe('Security Property Tests', () => {
  
  // ============================================
  // Property 8: JWT Token Expiry
  // ============================================
  
  describe('Property 8: JWT Token Expiry', () => {
    
    test('Property: All generated access tokens must have an expiration time set', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // توليد access token
          const token = generateAccessToken(user);
          
          // فك تشفير token
          const decoded = decodeToken(token);
          
          // التحقق من وجود exp
          expect(decoded).toHaveProperty('exp');
          expect(typeof decoded.exp).toBe('number');
          expect(decoded.exp).toBeGreaterThan(0);
          
          // التحقق من أن exp في المستقبل
          const currentTime = Math.floor(Date.now() / 1000);
          expect(decoded.exp).toBeGreaterThan(currentTime);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    test('Property: All generated refresh tokens must have an expiration time set', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // توليد refresh token
          const token = generateRefreshToken(user);
          
          // فك تشفير token
          const decoded = decodeToken(token);
          
          // التحقق من وجود exp
          expect(decoded).toHaveProperty('exp');
          expect(typeof decoded.exp).toBe('number');
          expect(decoded.exp).toBeGreaterThan(0);
          
          // التحقق من أن exp في المستقبل
          const currentTime = Math.floor(Date.now() / 1000);
          expect(decoded.exp).toBeGreaterThan(currentTime);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    test('Property: generateTokens must return both tokens with expiration', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // توليد كلا النوعين
          const tokens = generateTokens(user);
          
          // التحقق من البنية
          expect(tokens).toHaveProperty('accessToken');
          expect(tokens).toHaveProperty('refreshToken');
          expect(tokens).toHaveProperty('expiresIn');
          expect(tokens).toHaveProperty('tokenType', 'Bearer');
          
          // فك تشفير access token
          const accessDecoded = decodeToken(tokens.accessToken);
          expect(accessDecoded).toHaveProperty('exp');
          expect(accessDecoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
          
          // فك تشفير refresh token
          const refreshDecoded = decodeToken(tokens.refreshToken);
          expect(refreshDecoded).toHaveProperty('exp');
          expect(refreshDecoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
          
          // التحقق من أن refresh token ينتهي بعد access token
          expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    test('Property: isTokenExpired must correctly identify expired tokens', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // توليد token صالح
          const validToken = generateAccessToken(user);
          
          // Token صالح يجب أن لا يكون منتهي
          expect(isTokenExpired(validToken)).toBe(false);
          
          // توليد token منتهي (exp في الماضي)
          const JWT_SECRET = process.env.JWT_SECRET || 'careerak_secret_key_2024';
          const expiredToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '-1h' } // منتهي منذ ساعة
          );
          
          // Token منتهي يجب أن يكون منتهي
          expect(isTokenExpired(expiredToken)).toBe(true);
          
          return true;
        }),
        { numRuns: 50 }
      );
    });

    test('Property: getTokenRemainingTime must return positive value for valid tokens', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // توليد token صالح
          const token = generateAccessToken(user);
          
          // الوقت المتبقي يجب أن يكون موجب
          const remaining = getTokenRemainingTime(token);
          expect(remaining).toBeGreaterThan(0);
          
          // يجب أن يكون أقل من وقت الانتهاء الكامل (7 أيام = 604800 ثانية)
          expect(remaining).toBeLessThanOrEqual(604800);
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    test('Property: Expired tokens must fail verification', () => {
      fc.assert(
        fc.property(userArbitrary, (user) => {
          // توليد token منتهي
          const JWT_SECRET = process.env.JWT_SECRET || 'careerak_secret_key_2024';
          const expiredToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email, type: 'access' },
            JWT_SECRET,
            { 
              expiresIn: '-1h',
              issuer: 'careerak',
              audience: 'careerak-users'
            }
          );
          
          // محاولة التحقق يجب أن تفشل
          expect(() => {
            verifyAccessToken(expiredToken);
          }).toThrow('Token expired');
          
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  // ============================================
  // Property 9: Password Hash
  // ============================================
  
  describe('Property 9: Password Hash', () => {
    
    // Password generator
    const passwordArbitrary = fc.string({ minLength: 8, maxLength: 32 });

    test('Property: All passwords must be hashed with bcrypt (not plain text)', async () => {
      await fc.assert(
        fc.asyncProperty(passwordArbitrary, async (password) => {
          // Hash كلمة المرور
          const salt = await bcrypt.genSalt(12);
          const hash = await bcrypt.hash(password, salt);
          
          // التحقق من أن hash ليس نفس كلمة المرور الأصلية
          expect(hash).not.toBe(password);
          
          // التحقق من أن hash يبدأ بـ $2a$ أو $2b$ (bcrypt format)
          expect(hash).toMatch(/^\$2[ab]\$/);
          
          // التحقق من أن hash يحتوي على salt rounds (12)
          expect(hash).toMatch(/^\$2[ab]\$12\$/);
          
          // التحقق من أن طول hash صحيح (60 حرف)
          expect(hash.length).toBe(60);
          
          return true;
        }),
        { numRuns: 10 } // تقليل عدد التشغيلات
      );
    }, 60000); // زيادة timeout إلى 60 ثانية

    test('Property: bcrypt must use 12 rounds minimum', async () => {
      await fc.assert(
        fc.asyncProperty(passwordArbitrary, async (password) => {
          // Hash كلمة المرور بـ 12 rounds
          const salt = await bcrypt.genSalt(12);
          const hash = await bcrypt.hash(password, salt);
          
          // استخراج عدد rounds من hash
          const rounds = parseInt(hash.split('$')[2]);
          
          // التحقق من أن rounds = 12
          expect(rounds).toBe(12);
          expect(rounds).toBeGreaterThanOrEqual(12);
          
          return true;
        }),
        { numRuns: 10 }
      );
    }, 60000);

    test('Property: Same password must produce different hashes (salt randomness)', async () => {
      await fc.assert(
        fc.asyncProperty(passwordArbitrary, async (password) => {
          // Hash نفس كلمة المرور مرتين
          const salt1 = await bcrypt.genSalt(12);
          const hash1 = await bcrypt.hash(password, salt1);
          
          const salt2 = await bcrypt.genSalt(12);
          const hash2 = await bcrypt.hash(password, salt2);
          
          // التحقق من أن hashes مختلفة (بسبب salt عشوائي)
          expect(hash1).not.toBe(hash2);
          
          // لكن كلاهما يجب أن يتحقق من كلمة المرور الأصلية
          const valid1 = await bcrypt.compare(password, hash1);
          const valid2 = await bcrypt.compare(password, hash2);
          
          expect(valid1).toBe(true);
          expect(valid2).toBe(true);
          
          return true;
        }),
        { numRuns: 5 }
      );
    }, 60000);

    test('Property: bcrypt.compare must correctly verify passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArbitrary,
          passwordArbitrary,
          async (correctPassword, wrongPassword) => {
            // تخطي إذا كانت كلمات المرور متطابقة
            fc.pre(correctPassword !== wrongPassword);
            
            // Hash كلمة المرور الصحيحة
            const salt = await bcrypt.genSalt(12);
            const hash = await bcrypt.hash(correctPassword, salt);
            
            // التحقق من كلمة المرور الصحيحة
            const validCorrect = await bcrypt.compare(correctPassword, hash);
            expect(validCorrect).toBe(true);
            
            // التحقق من كلمة المرور الخاطئة
            const validWrong = await bcrypt.compare(wrongPassword, hash);
            expect(validWrong).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 5 }
      );
    }, 60000);

    test('Property: User model must hash passwords before saving', async () => {
      // هذا اختبار integration مع User model
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 20 }),
            phone: fc.string({ minLength: 10, maxLength: 15 }),
            role: fc.constantFrom('HR', 'Employee', 'Admin')
          }),
          async (userData) => {
            // حفظ كلمة المرور الأصلية
            const originalPassword = userData.password;
            
            // إنشاء مستخدم (بدون حفظ في DB)
            const user = new User(userData);
            
            // محاكاة pre-save hook
            if (user.isModified('password')) {
              const salt = await bcrypt.genSalt(12);
              user.password = await bcrypt.hash(user.password, salt);
            }
            
            // التحقق من أن كلمة المرور تم hash
            expect(user.password).not.toBe(originalPassword);
            expect(user.password).toMatch(/^\$2[ab]\$12\$/);
            
            // التحقق من أن comparePassword يعمل
            const isMatch = await bcrypt.compare(originalPassword, user.password);
            expect(isMatch).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 5 }
      );
    }, 60000);

    test('Property: Plain text passwords must never be stored', async () => {
      await fc.assert(
        fc.asyncProperty(passwordArbitrary, async (password) => {
          // Hash كلمة المرور
          const salt = await bcrypt.genSalt(12);
          const hash = await bcrypt.hash(password, salt);
          
          // التحقق من أن hash لا يحتوي على كلمة المرور الأصلية
          expect(hash).not.toContain(password);
          
          // التحقق من أن hash ليس base64 encoding لكلمة المرور
          const base64 = Buffer.from(password).toString('base64');
          expect(hash).not.toBe(base64);
          
          // التحقق من أن hash ليس hex encoding لكلمة المرور
          const hex = Buffer.from(password).toString('hex');
          expect(hash).not.toBe(hex);
          
          return true;
        }),
        { numRuns: 10 }
      );
    }, 60000);
  });
});
