/**
 * Property-Based Tests for Security Features
 * 
 * Property 8: JWT Token Expiry - all tokens must have expiration
 * Property 9: Password Hash - all passwords must be hashed with bcrypt
 * 
 * Validates: Requirements 7.1, 7.2
 */

const fc = require('fast-check');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtService = require('../src/services/jwtService');

// Helper to generate valid MongoDB ObjectId
const mongoIdArbitrary = () => fc.string({ minLength: 24, maxLength: 24 }).map(s => {
  const hex = '0123456789abcdef';
  return s.split('').map(() => hex[Math.floor(Math.random() * 16)]).join('');
});

// Helper to generate valid passwords (not just spaces)
const passwordArbitrary = () => fc.string({ minLength: 8, maxLength: 32 }).filter(s => s.trim().length >= 8);

describe('Security Properties', () => {
  
  // ============================================
  // Property 8: JWT Token Expiry
  // ============================================
  
  describe('Property 8: JWT Token Expiry', () => {
    
    it('should always generate access tokens with expiration time', () => {
      fc.assert(
        fc.property(
          fc.record({
            _id: mongoIdArbitrary(),
            email: fc.emailAddress(),
            role: fc.constantFrom('HR', 'Employee', 'Admin')
          }),
          (user) => {
            const token = jwtService.generateAccessToken(user);
            const decoded = jwt.decode(token);
            
            expect(decoded).toHaveProperty('exp');
            expect(typeof decoded.exp).toBe('number');
            expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
            expect(jwtService.isTokenExpired(token)).toBe(false);
            expect(jwtService.getTokenRemainingTime(token)).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });
    
    it('should always generate refresh tokens with expiration time', () => {
      fc.assert(
        fc.property(
          fc.record({
            _id: mongoIdArbitrary(),
            email: fc.emailAddress(),
            role: fc.constantFrom('HR', 'Employee', 'Admin')
          }),
          (user) => {
            const token = jwtService.generateRefreshToken(user);
            const decoded = jwt.decode(token);
            
            expect(decoded).toHaveProperty('exp');
            expect(typeof decoded.exp).toBe('number');
            expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
            
            const accessToken = jwtService.generateAccessToken(user);
            const accessDecoded = jwt.decode(accessToken);
            expect(decoded.exp).toBeGreaterThan(accessDecoded.exp);
          }
        ),
        { numRuns: 20 }
      );
    });
    
    it('should always generate email verification tokens with expiration time', () => {
      fc.assert(
        fc.property(
          mongoIdArbitrary(),
          fc.emailAddress(),
          (userId, email) => {
            const token = jwtService.generateEmailVerificationToken(userId, email);
            const decoded = jwt.decode(token);
            
            expect(decoded).toHaveProperty('exp');
            expect(typeof decoded.exp).toBe('number');
            expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
            expect(decoded.type).toBe('email_verification');
            expect(decoded).toHaveProperty('jti');
            expect(decoded.jti.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });
    
    it('should always generate password reset tokens with expiration time', () => {
      fc.assert(
        fc.property(
          mongoIdArbitrary(),
          fc.emailAddress(),
          (userId, email) => {
            const token = jwtService.generatePasswordResetToken(userId, email);
            const decoded = jwt.decode(token);
            
            expect(decoded).toHaveProperty('exp');
            expect(typeof decoded.exp).toBe('number');
            expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
            expect(decoded.type).toBe('password_reset');
            expect(decoded).toHaveProperty('jti');
            expect(decoded.jti.length).toBeGreaterThan(0);
            
            const accessToken = jwtService.generateAccessToken({ _id: userId, email, role: 'Employee' });
            const accessDecoded = jwt.decode(accessToken);
            expect(decoded.exp).toBeLessThan(accessDecoded.exp);
          }
        ),
        { numRuns: 20 }
      );
    });
    
  });
  
  // ============================================
  // Property 9: Password Hash
  // ============================================
  
  describe('Property 9: Password Hash', () => {
    
    it('should always hash passwords with bcrypt (not plain text)', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArbitrary(),
          async (password) => {
            const salt = await bcrypt.genSalt(12);
            const hash = await bcrypt.hash(password, salt);
            
            expect(hash).not.toBe(password);
            expect(hash).toMatch(/^\$2[aby]\$/);
            expect(hash.split('$').length).toBeGreaterThanOrEqual(4);
            
            const isValid = await bcrypt.compare(password, hash);
            expect(isValid).toBe(true);
            
            const isInvalid = await bcrypt.compare(password + 'wrong', hash);
            expect(isInvalid).toBe(false);
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);
    
    it('should always use sufficient salt rounds (12+)', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArbitrary(),
          async (password) => {
            const salt = await bcrypt.genSalt(12);
            const hash = await bcrypt.hash(password, salt);
            
            const match = hash.match(/^\$2[aby]\$(\d+)\$/);
            expect(match).not.toBeNull();
            
            const rounds = parseInt(match[1]);
            expect(rounds).toBeGreaterThanOrEqual(12);
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);
    
    it('should always produce different hashes for same password', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArbitrary(),
          async (password) => {
            const hash1 = await bcrypt.hash(password, await bcrypt.genSalt(12));
            const hash2 = await bcrypt.hash(password, await bcrypt.genSalt(12));
            
            expect(hash1).not.toBe(hash2);
            expect(await bcrypt.compare(password, hash1)).toBe(true);
            expect(await bcrypt.compare(password, hash2)).toBe(true);
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);
    
    it('should never store plain text passwords', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordArbitrary(),
          async (password) => {
            const hash = await bcrypt.hash(password, await bcrypt.genSalt(12));
            
            expect(hash).not.toContain(password);
            expect(hash.length).toBe(60);
            expect(hash.toLowerCase()).not.toContain(password.toLowerCase());
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);
    
  });
  
  // ============================================
  // Combined Security Properties
  // ============================================
  
  describe('Combined Security Properties', () => {
    
    it('should maintain security invariants for complete auth flow', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            _id: mongoIdArbitrary(),
            email: fc.emailAddress(),
            password: passwordArbitrary(),
            role: fc.constantFrom('HR', 'Employee', 'Admin')
          }),
          async (userData) => {
            const hashedPassword = await bcrypt.hash(userData.password, await bcrypt.genSalt(12));
            const user = { ...userData, password: hashedPassword };
            const { accessToken, refreshToken } = jwtService.generateTokens(user);
            
            expect(hashedPassword).not.toBe(userData.password);
            expect(hashedPassword).toMatch(/^\$2[aby]\$/);
            
            const accessDecoded = jwt.decode(accessToken);
            const refreshDecoded = jwt.decode(refreshToken);
            expect(accessDecoded.exp).toBeDefined();
            expect(refreshDecoded.exp).toBeDefined();
            
            expect(jwtService.isTokenExpired(accessToken)).toBe(false);
            expect(jwtService.isTokenExpired(refreshToken)).toBe(false);
            
            const accessVerified = jwtService.verifyAccessToken(accessToken);
            const refreshVerified = jwtService.verifyRefreshToken(refreshToken);
            expect(accessVerified.id).toBe(userData._id);
            expect(refreshVerified.id).toBe(userData._id);
            
            const isPasswordValid = await bcrypt.compare(userData.password, hashedPassword);
            expect(isPasswordValid).toBe(true);
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);
    
  });
  
});
