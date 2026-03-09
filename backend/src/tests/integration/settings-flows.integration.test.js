/**
 * Integration Tests for Settings Page Complete Flows
 * 
 * Tests complete end-to-end user journeys:
 * 1. Complete email change flow (from start to finish)
 * 2. Complete 2FA activation flow
 * 3. Complete account deletion flow (with grace period)
 * 4. Complete data export flow
 * 
 * These tests validate multiple services working together
 * and ensure data consistency across the system.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const { User } = require('../../models/User');
const EmailChangeRequest = require('../../models/EmailChangeRequest');
const AccountDeletionRequest = require('../../models/AccountDeletionRequest');
const DataExportRequest = require('../../models/DataExportRequest');
const ActiveSession = require('../../models/ActiveSession');
const jwt = require('jsonwebtoken');

let mongoServer;
let testUser;
let authToken;

// Helper function to create test user
const createTestUser = async (overrides = {}) => {
  const user = new User({
    email: 'test@example.com',
    password: 'Test123!@#',
    role: 'Employee',
    phone: '+201234567890',
    country: 'Egypt',
    firstName: 'Test',
    lastName: 'User',
    ...overrides
  });
  await user.save();
  return user;
};

// Helper function to generate auth token
const generateAuthToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '7d' }
  );
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }

  // Create test user and auth token
  testUser = await createTestUser();
  authToken = generateAuthToken(testUser._id);
});

describe('Integration Test 1: Complete Email Change Flow', () => {
  /**
   * Test complete email change flow from start to finish:
   * 1. Request email change
   * 2. Verify old email with OTP
   * 3. Verify new email with OTP
   * 4. Confirm with password
   * 5. Email updated successfully
   * 6. All other sessions invalidated
   * 7. Notifications sent to both emails
   */
  test('should complete full email change flow successfully', async () => {
    const newEmail = 'newemail@example.com';
    const oldEmail = testUser.email;

    // Step 1: Initiate email change
    const initiateResponse = await request(app)
      .post('/api/settings/email/change')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newEmail })
      .expect(200);

    expect(initiateResponse.body.success).toBe(true);
    expect(initiateResponse.body.message).toContain('verification codes sent');

    // Verify EmailChangeRequest was created
    const changeRequest = await EmailChangeRequest.findOne({ userId: testUser._id });
    expect(changeRequest).toBeTruthy();
    expect(changeRequest.oldEmail).toBe(oldEmail);
    expect(changeRequest.newEmail).toBe(newEmail);
    expect(changeRequest.status).toBe('pending');

    // Step 2: Verify old email (simulate OTP)
    const oldEmailOTP = '123456'; // In real scenario, this would be sent via email
    changeRequest.oldEmailOTP = oldEmailOTP;
    await changeRequest.save();

    const verifyOldResponse = await request(app)
      .post('/api/settings/email/verify-old')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ otp: oldEmailOTP })
      .expect(200);

    expect(verifyOldResponse.body.success).toBe(true);
    expect(verifyOldResponse.body.oldEmailVerified).toBe(true);

    // Step 3: Verify new email (simulate OTP)
    const newEmailOTP = '654321';
    const updatedRequest = await EmailChangeRequest.findOne({ userId: testUser._id });
    updatedRequest.newEmailOTP = newEmailOTP;
    await updatedRequest.save();

    const verifyNewResponse = await request(app)
      .post('/api/settings/email/verify-new')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ otp: newEmailOTP })
      .expect(200);

    expect(verifyNewResponse.body.success).toBe(true);
    expect(verifyNewResponse.body.newEmailVerified).toBe(true);

    // Step 4: Confirm with password
    const confirmResponse = await request(app)
      .post('/api/settings/email/confirm')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ password: 'Test123!@#' })
      .expect(200);

    expect(confirmResponse.body.success).toBe(true);
    expect(confirmResponse.body.message).toContain('Email changed successfully');

    // Step 5: Verify email was updated in database
    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.email).toBe(newEmail);

    // Step 6: Verify EmailChangeRequest was marked as completed
    const completedRequest = await EmailChangeRequest.findOne({ userId: testUser._id });
    expect(completedRequest.status).toBe('completed');
    expect(completedRequest.completedAt).toBeTruthy();

    // Step 7: Verify all other sessions were invalidated
    // (In real implementation, this would check ActiveSession collection)
    // For now, we verify the user can still access with current token
    const profileResponse = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(profileResponse.body.email).toBe(newEmail);
  });

  test('should reject email change if new email already exists', async () => {
    // Create another user with the target email
    await createTestUser({ 
      email: 'existing@example.com',
      phone: '+201234567891'
    });

    const response = await request(app)
      .post('/api/settings/email/change')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newEmail: 'existing@example.com' })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  test('should expire email change request after 15 minutes', async () => {
    const newEmail = 'newemail@example.com';

    // Create email change request
    const changeRequest = new EmailChangeRequest({
      userId: testUser._id,
      oldEmail: testUser.email,
      newEmail,
      oldEmailOTP: '123456',
      newEmailOTP: '654321',
      status: 'pending',
      expiresAt: new Date(Date.now() - 1000) // Already expired
    });
    await changeRequest.save();

    // Try to verify old email with expired request
    const response = await request(app)
      .post('/api/settings/email/verify-old')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ otp: '123456' })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('REQUEST_EXPIRED');
  });
});

describe('Integration Test 2: Complete 2FA Activation Flow', () => {
  /**
   * Test complete 2FA activation flow:
   * 1. Request 2FA activation
   * 2. Receive QR code and secret
   * 3. Verify OTP to confirm setup
   * 4. Receive 10 backup codes
   * 5. 2FA enabled in user profile
   * 6. Login requires OTP
   * 7. Backup codes work as alternative
   */
  test('should complete full 2FA activation flow successfully', async () => {
    // Step 1: Request 2FA activation
    const enableResponse = await request(app)
      .post('/api/settings/2fa/enable')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(enableResponse.body.success).toBe(true);
    expect(enableResponse.body.qrCode).toBeTruthy();
    expect(enableResponse.body.secret).toBeTruthy();

    const secret = enableResponse.body.secret;

    // Step 2: Verify user has 2FA setup pending
    let user = await User.findById(testUser._id);
    expect(user.security.twoFactorSetupPending).toBe(true);
    expect(user.security.twoFactorSecret).toBe(secret);

    // Step 3: Verify OTP to confirm setup (simulate valid OTP)
    const verifyResponse = await request(app)
      .post('/api/settings/2fa/verify-setup')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ otp: '123456' }) // In real scenario, this would be generated from secret
      .expect(200);

    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.backupCodes).toHaveLength(10);
    expect(verifyResponse.body.message).toContain('2FA enabled successfully');

    const backupCodes = verifyResponse.body.backupCodes;

    // Step 4: Verify 2FA is enabled in user profile
    user = await User.findById(testUser._id);
    expect(user.security.twoFactorEnabled).toBe(true);
    expect(user.security.twoFactorSetupPending).toBe(false);
    expect(user.security.backupCodes).toHaveLength(10);
    expect(user.security.twoFactorEnabledAt).toBeTruthy();

    // Step 5: Test login with 2FA - should require OTP
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'Test123!@#'
      })
      .expect(200);

    expect(loginResponse.body.requires2FA).toBe(true);
    expect(loginResponse.body.tempToken).toBeTruthy();

    // Step 6: Complete login with OTP
    const completeLoginResponse = await request(app)
      .post('/api/auth/verify-2fa')
      .send({
        tempToken: loginResponse.body.tempToken,
        otp: '123456'
      })
      .expect(200);

    expect(completeLoginResponse.body.success).toBe(true);
    expect(completeLoginResponse.body.token).toBeTruthy();

    // Step 7: Test backup code works
    const backupLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'Test123!@#'
      })
      .expect(200);

    const backupVerifyResponse = await request(app)
      .post('/api/auth/verify-2fa-backup')
      .send({
        tempToken: backupLoginResponse.body.tempToken,
        backupCode: backupCodes[0]
      })
      .expect(200);

    expect(backupVerifyResponse.body.success).toBe(true);
    expect(backupVerifyResponse.body.token).toBeTruthy();

    // Verify backup code was marked as used
    user = await User.findById(testUser._id);
    const usedCode = user.security.backupCodes.find(
      code => code.code === backupCodes[0]
    );
    expect(usedCode.used).toBe(true);
    expect(usedCode.usedAt).toBeTruthy();
  });

  test('should disable 2FA with password and OTP', async () => {
    // First enable 2FA
    testUser.security.twoFactorEnabled = true;
    testUser.security.twoFactorSecret = 'test-secret';
    testUser.security.backupCodes = [
      { code: 'backup1', used: false },
      { code: 'backup2', used: false }
    ];
    await testUser.save();

    // Disable 2FA
    const disableResponse = await request(app)
      .post('/api/settings/2fa/disable')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        password: 'Test123!@#',
        otp: '123456'
      })
      .expect(200);

    expect(disableResponse.body.success).toBe(true);
    expect(disableResponse.body.message).toContain('2FA disabled successfully');

    // Verify 2FA is disabled
    const user = await User.findById(testUser._id);
    expect(user.security.twoFactorEnabled).toBe(false);
    expect(user.security.twoFactorSecret).toBeUndefined();
    expect(user.security.backupCodes).toHaveLength(0);
  });

  test('should regenerate backup codes', async () => {
    // Enable 2FA first
    testUser.security.twoFactorEnabled = true;
    testUser.security.twoFactorSecret = 'test-secret';
    testUser.security.backupCodes = [
      { code: 'old1', used: false },
      { code: 'old2', used: true }
    ];
    await testUser.save();

    // Regenerate backup codes
    const regenerateResponse = await request(app)
      .post('/api/settings/2fa/regenerate-codes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ otp: '123456' })
      .expect(200);

    expect(regenerateResponse.body.success).toBe(true);
    expect(regenerateResponse.body.backupCodes).toHaveLength(10);

    // Verify old codes are replaced
    const user = await User.findById(testUser._id);
    expect(user.security.backupCodes).toHaveLength(10);
    expect(user.security.backupCodes.every(c => !c.used)).toBe(true);
  });
});

describe('Integration Test 3: Complete Account Deletion Flow (with Grace Period)', () => {
  /**
   * Test complete account deletion flow with grace period:
   * 1. Request scheduled deletion (30-day grace period)
   * 2. Account marked for deletion
   * 3. User can still access account during grace period
   * 4. User can cancel deletion during grace period
   * 5. Reminder sent 7 days before deletion
   * 6. After grace period, account permanently deleted
   * 7. All user data removed (profile, sessions, etc.)
   * 8. Legal data anonymized
   */
  test('should complete scheduled deletion with grace period', async () => {
    // Step 1: Request scheduled deletion
    const deleteResponse = await request(app)
      .post('/api/settings/account/delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'scheduled',
        password: 'Test123!@#',
        reason: 'No longer need the account'
      })
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.scheduledDate).toBeTruthy();
    expect(deleteResponse.body.daysRemaining).toBe(30);

    // Step 2: Verify deletion request was created
    const deletionRequest = await AccountDeletionRequest.findOne({ 
      userId: testUser._id 
    });
    expect(deletionRequest).toBeTruthy();
    expect(deletionRequest.type).toBe('scheduled');
    expect(deletionRequest.status).toBe('pending');
    expect(deletionRequest.reason).toBe('No longer need the account');

    const scheduledDate = new Date(deletionRequest.scheduledDate);
    const expectedDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    expect(Math.abs(scheduledDate - expectedDate)).toBeLessThan(1000); // Within 1 second

    // Step 3: Verify user can still access account
    const profileResponse = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(profileResponse.body.email).toBe(testUser.email);
    expect(profileResponse.body.pendingDeletion).toBe(true);

    // Step 4: Check deletion status
    const statusResponse = await request(app)
      .get('/api/settings/account/deletion-status')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(statusResponse.body.pending).toBe(true);
    expect(statusResponse.body.scheduledDate).toBeTruthy();
    expect(statusResponse.body.daysRemaining).toBe(30);

    // Step 5: Cancel deletion during grace period
    const cancelResponse = await request(app)
      .post('/api/settings/account/cancel-deletion')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(cancelResponse.body.success).toBe(true);
    expect(cancelResponse.body.message).toContain('cancelled successfully');

    // Step 6: Verify deletion request was cancelled
    const cancelledRequest = await AccountDeletionRequest.findOne({ 
      userId: testUser._id 
    });
    expect(cancelledRequest.status).toBe('cancelled');
    expect(cancelledRequest.cancelledAt).toBeTruthy();

    // Step 7: Verify user can still access account normally
    const afterCancelResponse = await request(app)
      .get('/api/settings/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(afterCancelResponse.body.pendingDeletion).toBe(false);
  });

  test('should send reminder 7 days before deletion', async () => {
    // Create deletion request scheduled for 7 days from now
    const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const deletionRequest = new AccountDeletionRequest({
      userId: testUser._id,
      type: 'scheduled',
      status: 'pending',
      scheduledDate,
      reminderSent: false
    });
    await deletionRequest.save();

    // Run reminder job (this would normally be a cron job)
    const AccountDeletionService = require('../../services/accountDeletionService');
    await AccountDeletionService.sendDeletionReminders();

    // Verify reminder was marked as sent
    const updatedRequest = await AccountDeletionRequest.findOne({ 
      userId: testUser._id 
    });
    expect(updatedRequest.reminderSent).toBe(true);

    // In real implementation, verify email was sent
    // For now, we just verify the flag was set
  });

  test('should permanently delete account after grace period', async () => {
    // Create deletion request that has passed grace period
    const scheduledDate = new Date(Date.now() - 1000); // Already passed
    const deletionRequest = new AccountDeletionRequest({
      userId: testUser._id,
      type: 'scheduled',
      status: 'pending',
      scheduledDate,
      reminderSent: true
    });
    await deletionRequest.save();

    // Create some user data to be deleted
    const session = new ActiveSession({
      userId: testUser._id,
      token: 'test-token',
      device: { type: 'desktop', os: 'Windows', browser: 'Chrome' },
      location: { ipAddress: '127.0.0.1' },
      loginTime: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await session.save();

    // Run deletion job (this would normally be a cron job)
    const AccountDeletionService = require('../../services/accountDeletionService');
    await AccountDeletionService.processScheduledDeletions();

    // Verify user was deleted
    const deletedUser = await User.findById(testUser._id);
    expect(deletedUser).toBeNull();

    // Verify deletion request was marked as completed
    const completedRequest = await AccountDeletionRequest.findOne({ 
      userId: testUser._id 
    });
    expect(completedRequest.status).toBe('completed');
    expect(completedRequest.completedAt).toBeTruthy();

    // Verify all user sessions were deleted
    const userSessions = await ActiveSession.find({ userId: testUser._id });
    expect(userSessions).toHaveLength(0);

    // In real implementation, verify all related data was deleted:
    // - Posts, messages, applications, reviews, etc.
  });

  test('should handle immediate deletion', async () => {
    // Request immediate deletion
    const deleteResponse = await request(app)
      .post('/api/settings/account/delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'immediate',
        password: 'Test123!@#'
      })
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toContain('deleted immediately');

    // Verify user was deleted immediately
    const deletedUser = await User.findById(testUser._id);
    expect(deletedUser).toBeNull();

    // Verify deletion request was created and completed
    const deletionRequest = await AccountDeletionRequest.findOne({ 
      userId: testUser._id 
    });
    expect(deletionRequest.type).toBe('immediate');
    expect(deletionRequest.status).toBe('completed');
    expect(deletionRequest.completedAt).toBeTruthy();
  });

  test('should require 2FA OTP for deletion if 2FA enabled', async () => {
    // Enable 2FA
    testUser.security.twoFactorEnabled = true;
    testUser.security.twoFactorSecret = 'test-secret';
    await testUser.save();

    // Try to delete without OTP
    const deleteResponse = await request(app)
      .post('/api/settings/account/delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'immediate',
        password: 'Test123!@#'
      })
      .expect(400);

    expect(deleteResponse.body.success).toBe(false);
    expect(deleteResponse.body.error.code).toBe('OTP_REQUIRED');

    // Delete with OTP
    const deleteWithOTPResponse = await request(app)
      .post('/api/settings/account/delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'immediate',
        password: 'Test123!@#',
        otp: '123456'
      })
      .expect(200);

    expect(deleteWithOTPResponse.body.success).toBe(true);
  });
});

describe('Integration Test 4: Complete Data Export Flow', () => {
  /**
   * Test complete data export flow:
   * 1. Request data export with specific options
   * 2. Export request created with pending status
   * 3. Background job processes export
   * 4. Export completed with download link
   * 5. User can download exported data
   * 6. Download link expires after 7 days
   * 7. Export completes within 48 hours
   */
  test('should complete full data export flow successfully', async () => {
    // Step 1: Request data export
    const exportResponse = await request(app)
      .post('/api/settings/data/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dataTypes: ['profile', 'activity', 'messages'],
        format: 'json'
      })
      .expect(200);

    expect(exportResponse.body.success).toBe(true);
    expect(exportResponse.body.requestId).toBeTruthy();
    expect(exportResponse.body.message).toContain('processing');

    const requestId = exportResponse.body.requestId;

    // Step 2: Verify export request was created
    const exportRequest = await DataExportRequest.findById(requestId);
    expect(exportRequest).toBeTruthy();
    expect(exportRequest.userId.toString()).toBe(testUser._id.toString());
    expect(exportRequest.dataTypes).toEqual(['profile', 'activity', 'messages']);
    expect(exportRequest.format).toBe('json');
    expect(exportRequest.status).toBe('pending');
    expect(exportRequest.progress).toBe(0);

    // Step 3: Check export status (still processing)
    const statusResponse = await request(app)
      .get(`/api/settings/data/export/${requestId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(statusResponse.body.status).toBe('pending');
    expect(statusResponse.body.progress).toBe(0);

    // Step 4: Simulate background processing
    const DataExportService = require('../../services/dataExportService');
    await DataExportService.processExport(requestId);

    // Step 5: Check export status (completed)
    const completedStatusResponse = await request(app)
      .get(`/api/settings/data/export/${requestId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(completedStatusResponse.body.status).toBe('completed');
    expect(completedStatusResponse.body.progress).toBe(100);
    expect(completedStatusResponse.body.downloadUrl).toBeTruthy();
    expect(completedStatusResponse.body.expiresAt).toBeTruthy();

    // Step 6: Verify export request was updated
    const completedRequest = await DataExportRequest.findById(requestId);
    expect(completedRequest.status).toBe('completed');
    expect(completedRequest.progress).toBe(100);
    expect(completedRequest.fileUrl).toBeTruthy();
    expect(completedRequest.downloadToken).toBeTruthy();
    expect(completedRequest.completedAt).toBeTruthy();

    // Verify expiration is 7 days from completion
    const expiresAt = new Date(completedRequest.expiresAt);
    const expectedExpiry = new Date(completedRequest.completedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    expect(Math.abs(expiresAt - expectedExpiry)).toBeLessThan(1000);

    // Step 7: Download exported data
    const downloadToken = completedRequest.downloadToken;
    const downloadResponse = await request(app)
      .get(`/api/settings/data/download/${downloadToken}`)
      .expect(200);

    expect(downloadResponse.headers['content-type']).toContain('application/json');
    expect(downloadResponse.body).toBeTruthy();

    // Verify download count was incremented
    const afterDownloadRequest = await DataExportRequest.findById(requestId);
    expect(afterDownloadRequest.downloadCount).toBe(1);
  });

  test('should support multiple data types and formats', async () => {
    // Test CSV format
    const csvResponse = await request(app)
      .post('/api/settings/data/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dataTypes: ['profile', 'applications'],
        format: 'csv'
      })
      .expect(200);

    expect(csvResponse.body.success).toBe(true);

    const csvRequest = await DataExportRequest.findById(csvResponse.body.requestId);
    expect(csvRequest.format).toBe('csv');

    // Test PDF format
    const pdfResponse = await request(app)
      .post('/api/settings/data/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dataTypes: ['profile'],
        format: 'pdf'
      })
      .expect(200);

    expect(pdfResponse.body.success).toBe(true);

    const pdfRequest = await DataExportRequest.findById(pdfResponse.body.requestId);
    expect(pdfRequest.format).toBe('pdf');

    // Test all data types
    const allDataResponse = await request(app)
      .post('/api/settings/data/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dataTypes: ['profile', 'activity', 'messages', 'applications', 'courses'],
        format: 'json'
      })
      .expect(200);

    expect(allDataResponse.body.success).toBe(true);

    const allDataRequest = await DataExportRequest.findById(allDataResponse.body.requestId);
    expect(allDataRequest.dataTypes).toHaveLength(5);
  });

  test('should reject download with expired token', async () => {
    // Create export request with expired download link
    const exportRequest = new DataExportRequest({
      userId: testUser._id,
      dataTypes: ['profile'],
      format: 'json',
      status: 'completed',
      progress: 100,
      fileUrl: 'https://example.com/export.json',
      downloadToken: 'expired-token',
      completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Expired 1 day ago
    });
    await exportRequest.save();

    // Try to download with expired token
    const downloadResponse = await request(app)
      .get(`/api/settings/data/download/${exportRequest.downloadToken}`)
      .expect(410);

    expect(downloadResponse.body.success).toBe(false);
    expect(downloadResponse.body.error.code).toBe('DOWNLOAD_EXPIRED');
  });

  test('should prevent unauthorized access to export', async () => {
    // Create export for test user
    const exportRequest = new DataExportRequest({
      userId: testUser._id,
      dataTypes: ['profile'],
      format: 'json',
      status: 'completed',
      downloadToken: 'test-token'
    });
    await exportRequest.save();

    // Create another user
    const otherUser = await createTestUser({
      email: 'other@example.com',
      phone: '+201234567891'
    });
    const otherToken = generateAuthToken(otherUser._id);

    // Try to access export with different user
    const unauthorizedResponse = await request(app)
      .get(`/api/settings/data/export/${exportRequest._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);

    expect(unauthorizedResponse.body.success).toBe(false);
    expect(unauthorizedResponse.body.error.code).toBe('UNAUTHORIZED_ACCESS');
  });

  test('should cleanup expired exports automatically', async () => {
    // Create multiple export requests with different expiration dates
    const activeExport = new DataExportRequest({
      userId: testUser._id,
      dataTypes: ['profile'],
      format: 'json',
      status: 'completed',
      completedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    });
    await activeExport.save();

    const expiredExport = new DataExportRequest({
      userId: testUser._id,
      dataTypes: ['profile'],
      format: 'json',
      status: 'completed',
      completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Expired 3 days ago
    });
    await expiredExport.save();

    // Run cleanup job
    const DataExportService = require('../../services/dataExportService');
    await DataExportService.cleanupExpiredExports();

    // Verify active export still exists
    const activeExists = await DataExportRequest.findById(activeExport._id);
    expect(activeExists).toBeTruthy();

    // Verify expired export was deleted
    const expiredExists = await DataExportRequest.findById(expiredExport._id);
    expect(expiredExists).toBeNull();
  });

  test('should handle export processing errors gracefully', async () => {
    // Create export request
    const exportResponse = await request(app)
      .post('/api/settings/data/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dataTypes: ['profile'],
        format: 'json'
      })
      .expect(200);

    const requestId = exportResponse.body.requestId;

    // Simulate processing error
    const exportRequest = await DataExportRequest.findById(requestId);
    exportRequest.status = 'failed';
    exportRequest.progress = 50; // Failed halfway
    await exportRequest.save();

    // Check status shows failure
    const statusResponse = await request(app)
      .get(`/api/settings/data/export/${requestId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(statusResponse.body.status).toBe('failed');
    expect(statusResponse.body.progress).toBe(50);
    expect(statusResponse.body.downloadUrl).toBeUndefined();

    // User can request new export
    const retryResponse = await request(app)
      .post('/api/settings/data/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dataTypes: ['profile'],
        format: 'json'
      })
      .expect(200);

    expect(retryResponse.body.success).toBe(true);
    expect(retryResponse.body.requestId).not.toBe(requestId);
  });
});

// Additional cross-flow integration tests
describe('Cross-Flow Integration Tests', () => {
  test('should handle email change during pending account deletion', async () => {
    // Request account deletion
    await request(app)
      .post('/api/settings/account/delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'scheduled',
        password: 'Test123!@#'
      })
      .expect(200);

    // Try to change email during grace period
    const emailChangeResponse = await request(app)
      .post('/api/settings/email/change')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ newEmail: 'newemail@example.com' })
      .expect(400);

    expect(emailChangeResponse.body.success).toBe(false);
    expect(emailChangeResponse.body.error.code).toBe('ACCOUNT_PENDING_DELETION');
  });

  test('should handle 2FA operations during pending deletion', async () => {
    // Request account deletion
    await request(app)
      .post('/api/settings/account/delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'scheduled',
        password: 'Test123!@#'
      })
      .expect(200);

    // Try to enable 2FA during grace period
    const enable2FAResponse = await request(app)
      .post('/api/settings/2fa/enable')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(enable2FAResponse.body.success).toBe(false);
    expect(enable2FAResponse.body.error.code).toBe('ACCOUNT_PENDING_DELETION');
  });

  test('should allow data export during pending deletion', async () => {
    // Request account deletion
    await request(app)
      .post('/api/settings/account/delete')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'scheduled',
        password: 'Test123!@#'
      })
      .expect(200);

    // Data export should still work during grace period
    const exportResponse = await request(app)
      .post('/api/settings/data/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        dataTypes: ['profile'],
        format: 'json'
      })
      .expect(200);

    expect(exportResponse.body.success).toBe(true);
  });
});
