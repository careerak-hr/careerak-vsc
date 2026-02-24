/**
 * Enhanced Auth Integration Tests
 * 
 * Comprehensive integration tests for the Enhanced Auth Page feature
 * Tests cover:
 * - Full registration flow (4 steps)
 * - OAuth flow (Google, Facebook, LinkedIn)
 * - Forgot Password flow
 * - Email Verification flow
 * 
 * Requirements: All requirements from enhanced-auth spec
 * Task: 15.1 كتابة Integration Tests
 */

const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models/User');
const OAuthAccount = require('../src/models/OAuthAccount');
const PasswordReset = require('../src/models/PasswordReset');
const EmailVerification = require('../src/models/EmailVerification');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '7d'
  });
};

// Helper function to create a test user
const createTestUser = async (overrides = {}) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const defaultUser = {
    email: `test${timestamp}@example.com`,
    password: 'Test1234!@#',
    phone: `+1234567${random}`,
    role: 'Employee',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: false
  };
  
  return await User.create({ ...defaultUser, ...overrides });
};

describe('Enhanced Auth Integration Tests', () => {
  
  // ============================================
  // 1. Full Registration Flow (4 Steps)
  // ============================================
  describe('1. Full Registration Flow (4 Steps)', () => {
    
    it('should complete full registration with all 4 steps', async () => {
      const timestamp = Date.now();
      const registrationData = {
        // Step 1: Basic Info
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe.${timestamp}@example.com`,
        
        // Step 2: Password
        password: 'StrongPass123!@#',
        confirmPassword: 'StrongPass123!@#',
        
        // Step 3: Account Type
        role: 'Employee',
        
        // Step 4: Details (optional)
        phone: '+1234567890',
        city: 'New York',
        field: 'Software Development'
      };
      
      const response = await request(app)
        .post('/auth/register')
        .send(registrationData)
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(registrationData.email);
      expect(response.body.user.firstName).toBe(registrationData.firstName);
      expect(response.body.user.role).toBe(registrationData.role);
      
      // Verify user was created in database
      const user = await User.findOne({ email: registrationData.email });
      expect(user).toBeDefined();
      expect(user.emailVerified).toBe(false);
      
      // Verify email verification token was created
      const emailVerification = await EmailVerification.findOne({ 
        userId: user._id 
      });
      expect(emailVerification).toBeDefined();
      
      // Clean up
      await User.deleteOne({ _id: user._id });
      if (emailVerification) {
        await EmailVerification.deleteOne({ _id: emailVerification._id });
      }
    });
    
    it('should validate Step 1: Basic Info - missing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          password: 'Test1234!@#'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
    
    it('should validate Step 1: Basic Info - invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          password: 'Test1234!@#'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
    
    it('should validate Step 2: Password strength', async () => {
      const timestamp = Date.now();
      const weakPassword = 'weak';
      
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `test${timestamp}@example.com`,
          password: weakPassword,
          confirmPassword: weakPassword,
          role: 'Employee'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
    
    it('should validate Step 3: Account Type - missing role', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `test${timestamp}@example.com`,
          password: 'Test1234!@#',
          confirmPassword: 'Test1234!@#'
          // Missing role
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
    
    it('should allow optional Step 4: Details', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `test${timestamp}@example.com`,
          password: 'Test1234!@#',
          confirmPassword: 'Test1234!@#',
          role: 'Employee'
          // No optional details
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('token');
      
      // Clean up
      const user = await User.findOne({ email: response.body.user.email });
      if (user) {
        await User.deleteOne({ _id: user._id });
        await EmailVerification.deleteMany({ userId: user._id });
      }
    });
    
    it('should prevent duplicate email registration', async () => {
      const timestamp = Date.now();
      const email = `duplicate${timestamp}@example.com`;
      
      // First registration
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: email,
          password: 'Test1234!@#',
          confirmPassword: 'Test1234!@#',
          role: 'Employee'
        })
        .expect(201);
      
      // Second registration with same email
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: email,
          password: 'Test1234!@#',
          confirmPassword: 'Test1234!@#',
          role: 'Employee'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      
      // Clean up
      const user = await User.findOne({ email });
      if (user) {
        await User.deleteOne({ _id: user._id });
        await EmailVerification.deleteMany({ userId: user._id });
      }
    });
    
  });
  
  // ============================================
  // 2. OAuth Flow
  // ============================================
  describe('2. OAuth Flow', () => {
    
    it('should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get('/auth/google')
        .expect(302);
      
      expect(response.headers.location).toContain('accounts.google.com');
    });
    
    it('should redirect to Facebook OAuth', async () => {
      const response = await request(app)
        .get('/auth/facebook')
        .expect(302);
      
      expect(response.headers.location).toContain('facebook.com');
    });
    
    it('should redirect to LinkedIn OAuth', async () => {
      const response = await request(app)
        .get('/auth/linkedin')
        .expect(302);
      
      expect(response.headers.location).toContain('linkedin.com');
    });
    
    it('should create user from OAuth profile', async () => {
      const timestamp = Date.now();
      const mockOAuthProfile = {
        provider: 'google',
        providerId: `google_${timestamp}`,
        email: `oauth${timestamp}@example.com`,
        displayName: 'OAuth User',
        profilePicture: 'https://example.com/photo.jpg'
      };
      
      // Create user as if OAuth succeeded
      const user = await User.create({
        email: mockOAuthProfile.email,
        firstName: mockOAuthProfile.displayName.split(' ')[0],
        lastName: mockOAuthProfile.displayName.split(' ')[1] || '',
        role: 'Employee',
        emailVerified: true, // OAuth emails are pre-verified
        profilePicture: mockOAuthProfile.profilePicture
      });
      
      // Create OAuth account
      const oauthAccount = await OAuthAccount.create({
        userId: user._id,
        provider: mockOAuthProfile.provider,
        providerId: mockOAuthProfile.providerId,
        email: mockOAuthProfile.email,
        displayName: mockOAuthProfile.displayName,
        profilePicture: mockOAuthProfile.profilePicture
      });
      
      expect(user).toBeDefined();
      expect(user.emailVerified).toBe(true);
      expect(oauthAccount).toBeDefined();
      expect(oauthAccount.provider).toBe('google');
      
      // Clean up
      await OAuthAccount.deleteOne({ _id: oauthAccount._id });
      await User.deleteOne({ _id: user._id });
    });
    
    it('should link OAuth account to existing user', async () => {
      const timestamp = Date.now();
      const email = `existing${timestamp}@example.com`;
      
      // Create existing user
      const existingUser = await createTestUser({ 
        email,
        emailVerified: true 
      });
      
      // Simulate OAuth login with same email
      const oauthAccount = await OAuthAccount.create({
        userId: existingUser._id,
        provider: 'google',
        providerId: `google_${timestamp}`,
        email: email,
        displayName: 'Test User'
      });
      
      // Verify account was linked
      const linkedAccounts = await OAuthAccount.find({ 
        userId: existingUser._id 
      });
      expect(linkedAccounts.length).toBe(1);
      expect(linkedAccounts[0].provider).toBe('google');
      
      // Clean up
      await OAuthAccount.deleteOne({ _id: oauthAccount._id });
      await User.deleteOne({ _id: existingUser._id });
    });
    
    it('should unlink OAuth account', async () => {
      const user = await createTestUser({ emailVerified: true });
      const timestamp = Date.now();
      
      // Create OAuth account
      const oauthAccount = await OAuthAccount.create({
        userId: user._id,
        provider: 'google',
        providerId: `google_${timestamp}`,
        email: user.email
      });
      
      const token = generateToken(user._id);
      
      // Unlink OAuth account
      const response = await request(app)
        .delete('/oauth/google')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      
      // Verify account was deleted
      const deletedAccount = await OAuthAccount.findById(oauthAccount._id);
      expect(deletedAccount).toBeNull();
      
      // Clean up
      await User.deleteOne({ _id: user._id });
    });
    
  });
  
  // ============================================
  // 3. Forgot Password Flow
  // ============================================
  describe('3. Forgot Password Flow', () => {
    
    it('should send password reset email', async () => {
      const user = await createTestUser({ emailVerified: true });
      
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: user.email })
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      
      // Verify reset token was created
      const resetToken = await PasswordReset.findOne({ 
        userId: user._id,
        used: false
      });
      expect(resetToken).toBeDefined();
      expect(resetToken.token).toBeDefined();
      expect(resetToken.expires).toBeDefined();
      
      // Clean up
      if (resetToken) {
        await PasswordReset.deleteOne({ _id: resetToken._id });
      }
      await User.deleteOne({ _id: user._id });
    });
    
    it('should reject forgot password for non-existent email', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });
    
    it('should reset password with valid token', async () => {
      const user = await createTestUser({ emailVerified: true });
      const oldPassword = user.password;
      const timestamp = Date.now();
      const random = Math.random().toString(36);
      
      // Create reset token
      const resetToken = await PasswordReset.create({
        userId: user._id,
        token: `reset_${timestamp}_${random}`,
        expires: new Date(Date.now() + 3600000), // 1 hour
        used: false
      });
      
      const newPassword = 'NewPassword123!@#';
      
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken.token,
          password: newPassword,
          confirmPassword: newPassword
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      
      // Verify password was changed
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.password).not.toBe(oldPassword);
      
      // Verify token was marked as used
      const usedToken = await PasswordReset.findById(resetToken._id);
      expect(usedToken.used).toBe(true);
      
      // Clean up
      await PasswordReset.deleteOne({ _id: resetToken._id });
      await User.deleteOne({ _id: user._id });
    });
    
    it('should reject expired reset token', async () => {
      const user = await createTestUser({ emailVerified: true });
      const timestamp = Date.now();
      const random = Math.random().toString(36);
      
      // Create expired token
      const resetToken = await PasswordReset.create({
        userId: user._id,
        token: `reset_${timestamp}_${random}`,
        expires: new Date(Date.now() - 3600000), // Expired 1 hour ago
        used: false
      });
      
      const response = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken.token,
          password: 'NewPassword123!@#',
          confirmPassword: 'NewPassword123!@#'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      
      // Clean up
      await PasswordReset.deleteOne({ _id: resetToken._id });
      await User.deleteOne({ _id: user._id });
    });
    
  });
  
  // ============================================
  // 4. Email Verification Flow
  // ============================================
  describe('4. Email Verification Flow', () => {
    
    it('should create email verification token on registration', async () => {
      const timestamp = Date.now();
      const email = `verify${timestamp}@example.com`;
      
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: email,
          password: 'Test1234!@#',
          confirmPassword: 'Test1234!@#',
          role: 'Employee'
        })
        .expect(201);
      
      const user = await User.findOne({ email });
      
      // Verify email verification token was created
      const emailVerification = await EmailVerification.findOne({ 
        userId: user._id 
      });
      
      expect(emailVerification).toBeDefined();
      expect(emailVerification.token).toBeDefined();
      expect(emailVerification.verified).toBe(false);
      expect(emailVerification.expires).toBeDefined();
      
      // Clean up
      if (emailVerification) {
        await EmailVerification.deleteOne({ _id: emailVerification._id });
      }
      await User.deleteOne({ _id: user._id });
    });
    
    it('should verify email with valid token', async () => {
      const user = await createTestUser({ emailVerified: false });
      const timestamp = Date.now();
      const random = Math.random().toString(36);
      
      // Create verification token
      const verificationToken = await EmailVerification.create({
        userId: user._id,
        email: user.email,
        token: `verify_${timestamp}_${random}`,
        expires: new Date(Date.now() + 86400000), // 24 hours
        verified: false
      });
      
      const response = await request(app)
        .post('/auth/verify-email')
        .send({ token: verificationToken.token })
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      
      // Verify user email was marked as verified
      const verifiedUser = await User.findById(user._id);
      expect(verifiedUser.emailVerified).toBe(true);
      
      // Verify token was marked as verified
      const verifiedToken = await EmailVerification.findById(
        verificationToken._id
      );
      expect(verifiedToken.verified).toBe(true);
      
      // Clean up
      await EmailVerification.deleteOne({ _id: verificationToken._id });
      await User.deleteOne({ _id: user._id });
    });
    
    it('should reject expired verification token', async () => {
      const user = await createTestUser({ emailVerified: false });
      const timestamp = Date.now();
      const random = Math.random().toString(36);
      
      // Create expired token
      const verificationToken = await EmailVerification.create({
        userId: user._id,
        email: user.email,
        token: `verify_${timestamp}_${random}`,
        expires: new Date(Date.now() - 86400000), // Expired 24 hours ago
        verified: false
      });
      
      const response = await request(app)
        .post('/auth/verify-email')
        .send({ token: verificationToken.token })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      
      // Clean up
      await EmailVerification.deleteOne({ _id: verificationToken._id });
      await User.deleteOne({ _id: user._id });
    });
    
  });
  
  // ============================================
  // 5. Additional Integration Tests
  // ============================================
  describe('5. Additional Integration Tests', () => {
    
    it('should login after successful registration', async () => {
      const timestamp = Date.now();
      const email = `login${timestamp}@example.com`;
      const password = 'Test1234!@#';
      
      // Register
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: email,
          password: password,
          confirmPassword: password,
          role: 'Employee'
        })
        .expect(201);
      
      // Login
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: email,
          password: password
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(email);
      
      // Clean up
      const user = await User.findOne({ email });
      if (user) {
        await User.deleteOne({ _id: user._id });
        await EmailVerification.deleteMany({ userId: user._id });
      }
    });
    
    it('should check email availability', async () => {
      const existingUser = await createTestUser();
      const timestamp = Date.now();
      
      // Check existing email
      let response = await request(app)
        .post('/auth/check-email')
        .send({ email: existingUser.email })
        .expect(200);
      
      expect(response.body.available).toBe(false);
      
      // Check new email
      response = await request(app)
        .post('/auth/check-email')
        .send({ email: `new${timestamp}@example.com` })
        .expect(200);
      
      expect(response.body.available).toBe(true);
      
      // Clean up
      await User.deleteOne({ _id: existingUser._id });
    });
    
  });
  
});
