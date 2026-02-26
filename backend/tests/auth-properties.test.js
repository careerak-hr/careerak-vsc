/**
 * Property-Based Tests for Authentication and Authorization
 * 
 * Feature: admin-dashboard-enhancements
 * Property 35: Authentication and Authorization
 * Property 36: Session Expiration Handling
 * 
 * Validates: Requirements 11.5, 11.6, 11.9
 * 
 * These tests use fast-check to verify authentication properties across
 * a wide range of inputs and scenarios.
 */

const fc = require('fast-check');
const jwt = require('jsonwebtoken');
const { auth, checkRole } = require('../src/middleware/auth');
const { User } = require('../src/models/User');

// Mock User model
jest.mock('../src/models/User');

describe('Property-Based Tests: Authentication and Authorization', () => {
  let req, res, next;

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
    process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 35: Authentication and Authorization
   * 
   * For any admin endpoint request:
   * - If unauthenticated, return 401
   * - If non-admin user, return 403
   * - If admin user, allow access
   */
  describe('Property 35: Authentication and Authorization', () => {
    test('unauthenticated requests always return 401', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            undefined,
            null,
            '',
            'InvalidToken',
            'Bearer',
            'Bearer ',
            'NotBearer token123'
          ),
          async (authHeader) => {
            req.headers.authorization = authHeader;

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: expect.any(String),
                code: 'AUTHENTICATION_REQUIRED'
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('malformed JWT tokens always return 401', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          async (invalidToken) => {
            req.headers.authorization = `Bearer ${invalidToken}`;

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: expect.any(String),
                code: expect.stringMatching(/INVALID_TOKEN|AUTHENTICATION_FAILED/)
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('valid tokens with non-admin roles are rejected by checkRole', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 24, maxLength: 24 }),
            role: fc.constantFrom('User', 'Company', 'Freelancer', 'JobSeeker'),
            email: fc.emailAddress()
          }),
          async (userData) => {
            // Create valid token
            const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });
            req.headers.authorization = `Bearer ${token}`;

            // Mock User.findById to return non-disabled user
            User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({
              _id: userData.id,
              accountDisabled: false }) });

            // First pass auth middleware
            await auth(req, res, next);
            expect(next).toHaveBeenCalled();

            // Reset mocks
            next.mockClear();
            res.status.mockClear();
            res.json.mockClear();

            // Then check role
            const roleMiddleware = checkRole('Admin', 'HR');
            roleMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: expect.any(String),
                code: 'INSUFFICIENT_PERMISSIONS'
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('valid tokens with admin roles are accepted', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 24, maxLength: 24 }),
            role: fc.constantFrom('Admin', 'HR'),
            email: fc.emailAddress()
          }),
          async (userData) => {
            // Create valid token
            const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });
            req.headers.authorization = `Bearer ${token}`;

            // Mock User.findById (not called for Admin)
            User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({
              _id: userData.id,
              accountDisabled: false }) });

            // Pass auth middleware
            await auth(req, res, next);
            expect(next).toHaveBeenCalled();

            // Reset mocks
            next.mockClear();

            // Check role
            const roleMiddleware = checkRole('Admin', 'HR');
            roleMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('disabled accounts are rejected (except Admin)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 24, maxLength: 24 }),
            role: fc.constantFrom('User', 'Company', 'Freelancer'),
            email: fc.emailAddress()
          }),
          async (userData) => {
            // Create valid token
            const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' });
            req.headers.authorization = `Bearer ${token}`;

            // Mock User.findById to return disabled user
            User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({
              _id: userData.id,
              accountDisabled: true }) });

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: expect.any(String),
                accountDisabled: true,
                code: 'ACCOUNT_DISABLED'
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 36: Session Expiration Handling
   * 
   * For any expired JWT token:
   * - Return 401 with SESSION_EXPIRED code
   * - Include expiration timestamp
   */
  describe('Property 36: Session Expiration Handling', () => {
    test('expired tokens always return 401 with SESSION_EXPIRED', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 24, maxLength: 24 }),
            role: fc.constantFrom('Admin', 'User', 'Company'),
            email: fc.emailAddress()
          }),
          fc.integer({ min: 1, max: 3600 }), // seconds in the past
          async (userData, secondsAgo) => {
            // Create expired token
            const token = jwt.sign(
              userData,
              process.env.JWT_SECRET,
              { expiresIn: `-${secondsAgo}s` }
            );
            req.headers.authorization = `Bearer ${token}`;

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: expect.any(String),
                code: 'SESSION_EXPIRED',
                expiredAt: expect.any(Date)
              })
            );
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('tokens expiring in the future are accepted', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 24, maxLength: 24 }),
            role: fc.constantFrom('Admin', 'HR'),
            email: fc.emailAddress()
          }),
          fc.integer({ min: 60, max: 86400 }), // 1 minute to 24 hours
          async (userData, expiresIn) => {
            // Create valid token
            const token = jwt.sign(
              userData,
              process.env.JWT_SECRET,
              { expiresIn: `${expiresIn}s` }
            );
            req.headers.authorization = `Bearer ${token}`;

            await auth(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
            expect(req.user).toEqual(
              expect.objectContaining({
                id: userData.id,
                role: userData.role,
                email: userData.email
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    test('tokens with various expiration times are handled correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 24, maxLength: 24 }),
            role: fc.constantFrom('Admin', 'HR'),
            email: fc.emailAddress()
          }),
          fc.integer({ min: -3600, max: 3600 }), // -1 hour to +1 hour
          async (userData, expiresIn) => {
            // Create token
            const token = jwt.sign(
              userData,
              process.env.JWT_SECRET,
              { expiresIn: `${Math.abs(expiresIn)}s` }
            );

            // If negative, we need to wait for it to expire (simulate by creating already expired)
            const actualToken = expiresIn < 0
              ? jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: `${expiresIn}s` })
              : token;

            req.headers.authorization = `Bearer ${actualToken}`;

            await auth(req, res, next);

            if (expiresIn < 0) {
              // Should be rejected
              expect(res.status).toHaveBeenCalledWith(401);
              expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                  code: 'SESSION_EXPIRED'
                })
              );
            } else {
              // Should be accepted
              expect(next).toHaveBeenCalled();
              expect(req.user).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Combined Property: Authentication Flow
   * 
   * Tests the complete authentication flow with various scenarios
   */
  describe('Combined Property: Complete Authentication Flow', () => {
    test('authentication flow handles all scenarios correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            hasAuth: fc.boolean(),
            isValidToken: fc.boolean(),
            isExpired: fc.boolean(),
            role: fc.constantFrom('Admin', 'HR', 'User', 'Company'),
            isDisabled: fc.boolean(),
            id: fc.string({ minLength: 24, maxLength: 24 }),
            email: fc.emailAddress()
          }),
          async (scenario) => {
            // Setup request based on scenario
            if (!scenario.hasAuth) {
              req.headers.authorization = undefined;
            } else if (!scenario.isValidToken) {
              req.headers.authorization = 'Bearer invalid-token-123';
            } else {
              const expiresIn = scenario.isExpired ? '-1h' : '1h';
              const token = jwt.sign(
                { id: scenario.id, role: scenario.role, email: scenario.email },
                process.env.JWT_SECRET,
                { expiresIn }
              );
              req.headers.authorization = `Bearer ${token}`;
            }

            // Mock User.findById
            if (scenario.role !== 'Admin') {
              User.findById = jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue({
                _id: scenario.id,
                accountDisabled: scenario.isDisabled
              });
            }

            // Execute auth middleware
            await auth(req, res, next);

            // Verify behavior based on scenario
            if (!scenario.hasAuth || !scenario.isValidToken) {
              expect(res.status).toHaveBeenCalledWith(401);
              expect(next).not.toHaveBeenCalled();
            } else if (scenario.isExpired) {
              expect(res.status).toHaveBeenCalledWith(401);
              expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'SESSION_EXPIRED' })
              );
              expect(next).not.toHaveBeenCalled();
            } else if (scenario.isDisabled && scenario.role !== 'Admin') {
              expect(res.status).toHaveBeenCalledWith(403);
              expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'ACCOUNT_DISABLED' })
              );
              expect(next).not.toHaveBeenCalled();
            } else {
              expect(next).toHaveBeenCalled();
              expect(req.user).toBeDefined();
            }
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});


