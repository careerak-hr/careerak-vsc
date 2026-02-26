/**
 * Unit Tests for Authentication and Authorization Middleware
 * 
 * Feature: admin-dashboard-enhancements
 * Requirements: 11.5, 11.6, 11.9
 * 
 * Tests specific scenarios and edge cases for authentication:
 * - Expired JWT tokens
 * - Malformed JWT tokens
 * - Missing authorization headers
 * - Valid tokens with wrong roles
 */

const jwt = require('jsonwebtoken');
const { auth, checkRole, requireAdmin } = require('../src/middleware/auth');
const { User } = require('../src/models/User');

// Mock User model
jest.mock('../src/models/User');

describe('Unit Tests: Authentication Middleware', () => {
  let req, res, next;
  const JWT_SECRET = 'test-secret-key-for-testing';

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    process.env.JWT_SECRET = JWT_SECRET;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auth middleware', () => {
    /**
     * Test: Expired JWT token
     * Requirement 11.9: Detect expired sessions
     */
    test('should return 401 with SESSION_EXPIRED for expired JWT token', async () => {
      const expiredToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin', email: 'admin@test.com' },
        JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      req.headers.authorization = `Bearer ${expiredToken}`;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('انتهت صلاحية الجلسة'),
          code: 'SESSION_EXPIRED',
          expiredAt: expect.any(Date)
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * Test: Malformed JWT token
     * Requirement 11.5: Return 401 for unauthenticated requests
     */
    test('should return 401 with INVALID_TOKEN for malformed JWT token', async () => {
      req.headers.authorization = 'Bearer this-is-not-a-valid-jwt-token';

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('جلسة غير صالحة'),
          code: 'INVALID_TOKEN'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * Test: Missing authorization header
     * Requirement 11.5: Return 401 for unauthenticated requests
     */
    test('should return 401 with AUTHENTICATION_REQUIRED for missing authorization header', async () => {
      // No authorization header set

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('يجب تسجيل الدخول'),
          code: 'AUTHENTICATION_REQUIRED'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * Test: Authorization header without Bearer prefix
     * Requirement 11.5: Return 401 for unauthenticated requests
     */
    test('should return 401 for authorization header without Bearer prefix', async () => {
      const validToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = validToken; // Missing "Bearer " prefix

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'AUTHENTICATION_REQUIRED'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * Test: Valid token with disabled account (non-admin)
     * Requirement 11.6: Handle account status
     */
    test('should return 403 with ACCOUNT_DISABLED for disabled non-admin account', async () => {
      const validToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'User', email: 'user@test.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${validToken}`;

      // Mock User.findById to return disabled user
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          accountDisabled: true
        })
      });

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('تم تعطيل حسابك'),
          accountDisabled: true,
          code: 'ACCOUNT_DISABLED'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * Test: Valid token with Admin role (should skip disabled check)
     */
    test('should allow Admin users even if account check would fail', async () => {
      const adminToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin', email: 'admin@test.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${adminToken}`;

      // User.findById should not be called for Admin
      User.findById = jest.fn();

      await auth(req, res, next);

      expect(User.findById).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(
        expect.objectContaining({
          id: '507f1f77bcf86cd799439011',
          role: 'Admin',
          email: 'admin@test.com'
        })
      );
    });

    /**
     * Test: Valid token with enabled account
     */
    test('should allow valid token with enabled account', async () => {
      const validToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'User', email: 'user@test.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${validToken}`;

      // Mock User.findById to return enabled user
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          accountDisabled: false
        })
      });

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(
        expect.objectContaining({
          id: '507f1f77bcf86cd799439011',
          role: 'User',
          email: 'user@test.com'
        })
      );
    });

    /**
     * Test: JWT_SECRET not defined
     */
    test('should return 500 if JWT_SECRET is not defined', async () => {
      delete process.env.JWT_SECRET;

      const validToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${validToken}`;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('خطأ في إعدادات السيرفر')
        })
      );
      expect(next).not.toHaveBeenCalled();

      // Restore JWT_SECRET
      process.env.JWT_SECRET = JWT_SECRET;
    });
  });

  describe('checkRole middleware', () => {
    /**
     * Test: Valid token but wrong role
     * Requirement 11.6: Return 403 for non-admin users
     */
    test('should return 403 with INSUFFICIENT_PERMISSIONS for valid token with wrong role', () => {
      req.user = {
        id: '507f1f77bcf86cd799439011',
        role: 'User',
        email: 'user@test.com'
      };

      const roleMiddleware = checkRole('Admin', 'HR');
      roleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('ليس لديك الصلاحية'),
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: ['Admin', 'HR'],
          userRole: 'User'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * Test: Valid token with correct role
     */
    test('should allow access for valid token with correct role', () => {
      req.user = {
        id: '507f1f77bcf86cd799439011',
        role: 'Admin',
        email: 'admin@test.com'
      };

      const roleMiddleware = checkRole('Admin', 'HR');
      roleMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    /**
     * Test: Multiple allowed roles
     */
    test('should allow access if user has any of the allowed roles', () => {
      req.user = {
        id: '507f1f77bcf86cd799439011',
        role: 'HR',
        email: 'hr@test.com'
      };

      const roleMiddleware = checkRole('Admin', 'HR', 'Moderator');
      roleMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    /**
     * Test: No user in request
     */
    test('should return 401 if no user in request', () => {
      // req.user is null

      const roleMiddleware = checkRole('Admin');
      roleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'AUTHENTICATION_REQUIRED'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    /**
     * Test: Case sensitivity of roles
     */
    test('should be case-sensitive for role matching', () => {
      req.user = {
        id: '507f1f77bcf86cd799439011',
        role: 'admin', // lowercase
        email: 'admin@test.com'
      };

      const roleMiddleware = checkRole('Admin'); // uppercase
      roleMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin middleware array', () => {
    /**
     * Test: requireAdmin combines auth and role check
     */
    test('should combine auth and admin role check', async () => {
      const adminToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin', email: 'admin@test.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${adminToken}`;

      // Execute requireAdmin middleware array
      expect(Array.isArray(requireAdmin)).toBe(true);
      expect(requireAdmin).toHaveLength(2);

      // Execute first middleware (auth)
      await requireAdmin[0](req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();

      // Reset next mock
      next.mockClear();

      // Execute second middleware (checkRole)
      requireAdmin[1](req, res, next);
      expect(next).toHaveBeenCalled();
    });

    /**
     * Test: requireAdmin rejects non-admin users
     */
    test('should reject non-admin users', async () => {
      const userToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'User', email: 'user@test.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${userToken}`;

      // Mock User.findById
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          accountDisabled: false
        })
      });

      // Execute first middleware (auth)
      await requireAdmin[0](req, res, next);
      expect(next).toHaveBeenCalled();

      // Reset mocks
      next.mockClear();
      res.status.mockClear();
      res.json.mockClear();

      // Execute second middleware (checkRole)
      requireAdmin[1](req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    /**
     * Test: Token with extra whitespace
     */
    test('should handle token with extra whitespace', async () => {
      const validToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer  ${validToken}  `; // Extra spaces

      await auth(req, res, next);

      // Should fail because split(' ')[1] will include the extra space
      expect(res.status).toHaveBeenCalledWith(401);
    });

    /**
     * Test: Token signed with different secret
     */
    test('should reject token signed with different secret', async () => {
      const invalidToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin' },
        'different-secret',
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${invalidToken}`;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INVALID_TOKEN'
        })
      );
    });

    /**
     * Test: Token about to expire (within 1 second)
     */
    test('should accept token about to expire but not yet expired', async () => {
      const almostExpiredToken = jwt.sign(
        { id: '507f1f77bcf86cd799439011', role: 'Admin' },
        JWT_SECRET,
        { expiresIn: '1s' } // Expires in 1 second
      );

      req.headers.authorization = `Bearer ${almostExpiredToken}`;

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });
  });
});
