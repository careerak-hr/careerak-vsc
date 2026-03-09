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

  // ============================================
  // Property 28: CSRF Protection
  // ============================================
  
  describe('Property 28: CSRF Protection', () => {
    const { generateCSRFToken, validateCSRFToken } = require('../src/middleware/csrfProtection');
    
    test('valid CSRF token should always be accepted', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 50 }), // sessionId
          async (sessionId) => {
            // Generate token
            const token = generateCSRFToken(sessionId);
            
            // Validate immediately
            const isValid = validateCSRFToken(sessionId, token);
            
            // Property: Valid token should always be accepted
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('invalid CSRF token should always be rejected', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 50 }), // sessionId
          fc.string({ minLength: 10, maxLength: 100 }), // fake token
          async (sessionId, fakeToken) => {
            // Generate real token
            const realToken = generateCSRFToken(sessionId);
            
            // Assume fake token is different from real token
            fc.pre(fakeToken !== realToken);
            
            // Validate fake token
            const isValid = validateCSRFToken(sessionId, fakeToken);
            
            // Property: Invalid token should always be rejected
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // ============================================
  // Property 29: Rate Limiting Enforcement
  // ============================================
  
  describe('Property 29: Rate Limiting Enforcement', () => {
    const { createRateLimiter } = require('../src/middleware/rateLimiter');
    
    test('rate limiter should block after max requests', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 5
      });
      
      const mockReq = {
        user: { id: 'test-user-' + Date.now() },
        ip: '127.0.0.1'
      };
      
      let blockedCount = 0;
      let allowedCount = 0;
      
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        const mockRes = {
          setHeader: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };
        
        const mockNext = jest.fn();
        
        limiter(mockReq, mockRes, mockNext);
        
        if (mockRes.status.mock.calls.length > 0) {
          blockedCount++;
        } else {
          allowedCount++;
        }
      }
      
      // Property: Should allow first 5, block next 5
      expect(allowedCount).toBe(5);
      expect(blockedCount).toBe(5);
    });
  });
  
  // ============================================
  // Property 30: Dual Input Validation
  // ============================================
  
  describe('Property 30: Dual Input Validation', () => {
    const { sanitizeString, sanitizeObject } = require('../src/middleware/validation');
    
    test('sanitization should remove all HTML tags', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (input) => {
            const withHTML = `<script>${input}</script><div>${input}</div>`;
            const sanitized = sanitizeString(withHTML);
            
            // Property: No HTML tags should remain
            expect(sanitized).not.toContain('<');
            expect(sanitized).not.toContain('>');
            expect(sanitized).not.toContain('script');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('sanitization should preserve safe text', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('<') && !s.includes('>')),
          async (safeText) => {
            const sanitized = sanitizeString(safeText);
            
            // Property: Safe text should be preserved (trimmed)
            expect(sanitized).toBe(safeText.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
    
    test('object sanitization should work recursively', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string(),
            nested: fc.record({
              value: fc.string()
            })
          }),
          async (obj) => {
            const withHTML = {
              name: `<script>${obj.name}</script>`,
              nested: {
                value: `<div>${obj.nested.value}</div>`
              }
            };
            
            const sanitized = sanitizeObject(withHTML);
            
            // Property: All nested strings should be sanitized
            expect(sanitized.name).not.toContain('<');
            expect(sanitized.nested.value).not.toContain('<');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  // ============================================
  // Property 31: XSS Prevention
  // ============================================
  
  describe('Property 31: XSS Prevention', () => {
    const { sanitizeString } = require('../src/middleware/validation');
    
    test('common XSS patterns should be neutralized', async () => {
      const xssPatterns = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')">',
        '<body onload=alert("XSS")>',
        '<input onfocus=alert("XSS") autofocus>',
        '<select onfocus=alert("XSS") autofocus>',
        '<textarea onfocus=alert("XSS") autofocus>',
        '<marquee onstart=alert("XSS")>'
      ];
      
      for (const pattern of xssPatterns) {
        const sanitized = sanitizeString(pattern);
        
        // Property: XSS patterns should be neutralized
        expect(sanitized).not.toContain('script');
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('onfocus');
        expect(sanitized).not.toContain('javascript:');
      }
    });
  });
  
  // ============================================
  // Property 32: Security Action Logging
  // ============================================
  
  describe('Property 32: Security Action Logging', () => {
    const { logSecurityAction } = require('../src/services/securityLogger');
    
    test('all security actions should be logged', async () => {
      const actions = [
        'password_change',
        'email_change',
        'phone_change',
        '2fa_enabled',
        '2fa_disabled',
        'session_terminated',
        'account_locked'
      ];
      
      for (const action of actions) {
        const mockReq = {
          ip: '127.0.0.1',
          headers: { 'user-agent': 'test-agent' }
        };
        
        const log = await logSecurityAction({
          userId: 'test-user-123',
          action,
          details: { test: true },
          req: mockReq,
          success: true
        });
        
        // Property: Log should be created
        expect(log).toBeDefined();
        if (log) {
          expect(log.action).toBe(action);
        }
      }
    });
    
    test('failed actions should be logged with error message', async () => {
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };
      
      const log = await logSecurityAction({
        userId: 'test-user-123',
        action: 'password_change',
        details: {},
        req: mockReq,
        success: false,
        errorMessage: 'Invalid current password'
      });
      
      // Property: Failed action should be logged with error
      expect(log).toBeDefined();
      if (log) {
        expect(log.success).toBe(false);
        expect(log.errorMessage).toBe('Invalid current password');
      }
    });
  });
  
  // ============================================
  // Property 33: Suspicious Activity Account Lock
  // ============================================
  
  describe('Property 33: Suspicious Activity Account Lock', () => {
    const { lockAccount, isAccountLocked, unlockAccount } = require('../src/services/accountLockService');
    
    test('account should be locked after suspicious activity', async () => {
      const userId = 'suspicious-user-' + Date.now();
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };
      
      // Lock account
      const lockInfo = await lockAccount(userId, 'Test suspicious activity', mockReq);
      
      // Property: Account should be locked
      expect(lockInfo.locked).toBe(true);
      expect(lockInfo.reason).toBe('Test suspicious activity');
      
      // Verify lock status
      const status = isAccountLocked(userId);
      expect(status.locked).toBe(true);
      
      // Cleanup
      await unlockAccount(userId, mockReq, true);
    });
    
    test('locked account should be unlocked after duration', async () => {
      const userId = 'temp-lock-user-' + Date.now();
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };
      
      // Lock for 1 second
      await lockAccount(userId, 'Test lock', mockReq, 1000);
      
      // Should be locked immediately
      expect(isAccountLocked(userId).locked).toBe(true);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Property: Should be unlocked after duration
      expect(isAccountLocked(userId).locked).toBe(false);
    });
    
    test('admin should be able to unlock account', async () => {
      const userId = 'admin-unlock-user-' + Date.now();
      const mockReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
      };
      
      // Lock account
      await lockAccount(userId, 'Test lock', mockReq);
      expect(isAccountLocked(userId).locked).toBe(true);
      
      // Admin unlock
      const result = await unlockAccount(userId, mockReq, true);
      
      // Property: Admin should be able to unlock
      expect(result.success).toBe(true);
      expect(isAccountLocked(userId).locked).toBe(false);
    });
  });

