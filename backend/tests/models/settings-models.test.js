/**
 * Settings Models - Basic Structure Tests
 * 
 * هذه الاختبارات تتحقق من أن جميع نماذج الإعدادات تم إنشاؤها بشكل صحيح
 * وأن الـ schemas والـ indexes والـ methods موجودة
 */

const mongoose = require('mongoose');

// Import all settings models
const UserSettings = require('../../src/models/UserSettings');
const ActiveSession = require('../../src/models/ActiveSession');
const LoginHistory = require('../../src/models/LoginHistory');
const DataExportRequest = require('../../src/models/DataExportRequest');
const AccountDeletionRequest = require('../../src/models/AccountDeletionRequest');
const EmailChangeRequest = require('../../src/models/EmailChangeRequest');
const PhoneChangeRequest = require('../../src/models/PhoneChangeRequest');

describe('Settings Models - Structure Tests', () => {
  
  describe('UserSettings Model', () => {
    test('should be defined', () => {
      expect(UserSettings).toBeDefined();
      expect(UserSettings.modelName).toBe('UserSettings');
    });

    test('should have required schema fields', () => {
      const schema = UserSettings.schema;
      expect(schema.path('userId')).toBeDefined();
      expect(schema.path('privacy.profileVisibility')).toBeDefined();
      expect(schema.path('notifications.job')).toBeDefined();
      expect(schema.path('security.twoFactorEnabled')).toBeDefined();
      expect(schema.path('preferences.language')).toBeDefined();
    });

    test('should have isInQuietHours method', () => {
      const instance = new UserSettings();
      expect(typeof instance.isInQuietHours).toBe('function');
    });

    test('should have timestamps', () => {
      const schema = UserSettings.schema;
      expect(schema.path('createdAt')).toBeDefined();
      expect(schema.path('updatedAt')).toBeDefined();
    });
  });

  describe('ActiveSession Model', () => {
    test('should be defined', () => {
      expect(ActiveSession).toBeDefined();
      expect(ActiveSession.modelName).toBe('ActiveSession');
    });

    test('should have required schema fields', () => {
      const schema = ActiveSession.schema;
      expect(schema.path('userId')).toBeDefined();
      expect(schema.path('token')).toBeDefined();
      expect(schema.path('device.type')).toBeDefined();
      expect(schema.path('location.ipAddress')).toBeDefined();
      expect(schema.path('loginTime')).toBeDefined();
      expect(schema.path('lastActivity')).toBeDefined();
      expect(schema.path('expiresAt')).toBeDefined();
    });

    test('should have instance methods', () => {
      const instance = new ActiveSession();
      expect(typeof instance.updateActivity).toBe('function');
      expect(typeof instance.isExpired).toBe('function');
    });

    test('should have static methods', () => {
      expect(typeof ActiveSession.findByUserId).toBe('function');
      expect(typeof ActiveSession.findByToken).toBe('function');
      expect(typeof ActiveSession.invalidateUserSessions).toBe('function');
    });
  });

  describe('LoginHistory Model', () => {
    test('should be defined', () => {
      expect(LoginHistory).toBeDefined();
      expect(LoginHistory.modelName).toBe('LoginHistory');
    });

    test('should have required schema fields', () => {
      const schema = LoginHistory.schema;
      expect(schema.path('userId')).toBeDefined();
      expect(schema.path('timestamp')).toBeDefined();
      expect(schema.path('success')).toBeDefined();
      expect(schema.path('device')).toBeDefined();
      expect(schema.path('location.ipAddress')).toBeDefined();
    });

    test('should have static methods', () => {
      expect(typeof LoginHistory.logAttempt).toBe('function');
      expect(typeof LoginHistory.getUserHistory).toBe('function');
      expect(typeof LoginHistory.getFailedAttempts).toBe('function');
    });
  });

  describe('DataExportRequest Model', () => {
    test('should be defined', () => {
      expect(DataExportRequest).toBeDefined();
      expect(DataExportRequest.modelName).toBe('DataExportRequest');
    });

    test('should have required schema fields', () => {
      const schema = DataExportRequest.schema;
      expect(schema.path('userId')).toBeDefined();
      expect(schema.path('dataTypes')).toBeDefined();
      expect(schema.path('format')).toBeDefined();
      expect(schema.path('status')).toBeDefined();
      expect(schema.path('progress')).toBeDefined();
      expect(schema.path('expiresAt')).toBeDefined();
    });

    test('should have instance methods', () => {
      const instance = new DataExportRequest();
      expect(typeof instance.markAsProcessing).toBe('function');
      expect(typeof instance.updateProgress).toBe('function');
      expect(typeof instance.markAsCompleted).toBe('function');
      expect(typeof instance.markAsFailed).toBe('function');
      expect(typeof instance.generateDownloadToken).toBe('function');
      expect(typeof instance.incrementDownloadCount).toBe('function');
      expect(typeof instance.isExpired).toBe('function');
    });

    test('should have static methods', () => {
      expect(typeof DataExportRequest.findByToken).toBe('function');
      expect(typeof DataExportRequest.getUserRequests).toBe('function');
    });
  });

  describe('AccountDeletionRequest Model', () => {
    test('should be defined', () => {
      expect(AccountDeletionRequest).toBeDefined();
      expect(AccountDeletionRequest.modelName).toBe('AccountDeletionRequest');
    });

    test('should have required schema fields', () => {
      const schema = AccountDeletionRequest.schema;
      expect(schema.path('userId')).toBeDefined();
      expect(schema.path('type')).toBeDefined();
      expect(schema.path('status')).toBeDefined();
      expect(schema.path('requestedAt')).toBeDefined();
      expect(schema.path('scheduledDate')).toBeDefined();
    });

    test('should have instance methods', () => {
      const instance = new AccountDeletionRequest();
      expect(typeof instance.cancel).toBe('function');
      expect(typeof instance.complete).toBe('function');
      expect(typeof instance.markReminderSent).toBe('function');
      expect(typeof instance.getDaysRemaining).toBe('function');
      expect(typeof instance.shouldSendReminder).toBe('function');
      expect(typeof instance.isReadyForDeletion).toBe('function');
    });

    test('should have static methods', () => {
      expect(typeof AccountDeletionRequest.findPendingDeletions).toBe('function');
      expect(typeof AccountDeletionRequest.findDeletionsNeedingReminder).toBe('function');
    });
  });

  describe('EmailChangeRequest Model', () => {
    test('should be defined', () => {
      expect(EmailChangeRequest).toBeDefined();
      expect(EmailChangeRequest.modelName).toBe('EmailChangeRequest');
    });

    test('should have required schema fields', () => {
      const schema = EmailChangeRequest.schema;
      expect(schema.path('userId')).toBeDefined();
      expect(schema.path('oldEmail')).toBeDefined();
      expect(schema.path('newEmail')).toBeDefined();
      expect(schema.path('oldEmailOTP')).toBeDefined();
      expect(schema.path('newEmailOTP')).toBeDefined();
      expect(schema.path('status')).toBeDefined();
      expect(schema.path('expiresAt')).toBeDefined();
    });

    test('should have instance methods', () => {
      const instance = new EmailChangeRequest();
      expect(typeof instance.verifyOldEmail).toBe('function');
      expect(typeof instance.verifyNewEmail).toBe('function');
      expect(typeof instance.complete).toBe('function');
      expect(typeof instance.isExpired).toBe('function');
      expect(typeof instance.isBothEmailsVerified).toBe('function');
      expect(typeof instance.verifyOTP).toBe('function');
    });

    test('should have static methods', () => {
      expect(typeof EmailChangeRequest.createRequest).toBe('function');
      expect(typeof EmailChangeRequest.findPendingRequest).toBe('function');
    });
  });

  describe('PhoneChangeRequest Model', () => {
    test('should be defined', () => {
      expect(PhoneChangeRequest).toBeDefined();
      expect(PhoneChangeRequest.modelName).toBe('PhoneChangeRequest');
    });

    test('should have required schema fields', () => {
      const schema = PhoneChangeRequest.schema;
      expect(schema.path('userId')).toBeDefined();
      expect(schema.path('oldPhone')).toBeDefined();
      expect(schema.path('newPhone')).toBeDefined();
      expect(schema.path('otp')).toBeDefined();
      expect(schema.path('status')).toBeDefined();
      expect(schema.path('expiresAt')).toBeDefined();
    });

    test('should have instance methods', () => {
      const instance = new PhoneChangeRequest();
      expect(typeof instance.verify).toBe('function');
      expect(typeof instance.complete).toBe('function');
      expect(typeof instance.isExpired).toBe('function');
      expect(typeof instance.verifyOTP).toBe('function');
    });

    test('should have static methods', () => {
      expect(typeof PhoneChangeRequest.createRequest).toBe('function');
      expect(typeof PhoneChangeRequest.findPendingRequest).toBe('function');
    });
  });

  describe('Model Indexes', () => {
    test('UserSettings should have userId unique index', () => {
      const indexes = UserSettings.schema.indexes();
      const userIdIndex = indexes.find(idx => idx[0].userId === 1);
      expect(userIdIndex).toBeDefined();
      expect(userIdIndex[1].unique).toBe(true);
    });

    test('ActiveSession should have token unique index', () => {
      const indexes = ActiveSession.schema.indexes();
      const tokenIndex = indexes.find(idx => idx[0].token === 1);
      expect(tokenIndex).toBeDefined();
      expect(tokenIndex[1].unique).toBe(true);
    });

    test('ActiveSession should have TTL index on expiresAt', () => {
      const indexes = ActiveSession.schema.indexes();
      const ttlIndex = indexes.find(idx => 
        idx[0].expiresAt === 1 && idx[1].expireAfterSeconds === 0
      );
      expect(ttlIndex).toBeDefined();
    });

    test('LoginHistory should have TTL index on timestamp', () => {
      const indexes = LoginHistory.schema.indexes();
      const ttlIndex = indexes.find(idx => 
        idx[0].timestamp === 1 && idx[1].expireAfterSeconds
      );
      expect(ttlIndex).toBeDefined();
      expect(ttlIndex[1].expireAfterSeconds).toBe(90 * 24 * 60 * 60);
    });

    test('DataExportRequest should have TTL index on expiresAt', () => {
      const indexes = DataExportRequest.schema.indexes();
      const ttlIndex = indexes.find(idx => 
        idx[0].expiresAt === 1 && idx[1].expireAfterSeconds === 0
      );
      expect(ttlIndex).toBeDefined();
    });

    test('EmailChangeRequest should have TTL index on expiresAt', () => {
      const indexes = EmailChangeRequest.schema.indexes();
      const ttlIndex = indexes.find(idx => 
        idx[0].expiresAt === 1 && idx[1].expireAfterSeconds === 0
      );
      expect(ttlIndex).toBeDefined();
    });

    test('PhoneChangeRequest should have TTL index on expiresAt', () => {
      const indexes = PhoneChangeRequest.schema.indexes();
      const ttlIndex = indexes.find(idx => 
        idx[0].expiresAt === 1 && idx[1].expireAfterSeconds === 0
      );
      expect(ttlIndex).toBeDefined();
    });

    test('AccountDeletionRequest should have userId unique index', () => {
      const indexes = AccountDeletionRequest.schema.indexes();
      const userIdIndex = indexes.find(idx => idx[0].userId === 1);
      expect(userIdIndex).toBeDefined();
      expect(userIdIndex[1].unique).toBe(true);
    });
  });
});
