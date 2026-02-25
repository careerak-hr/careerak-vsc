/**
 * Unit Tests for Admin Notification Service
 * 
 * Tests Requirements: 6.1-6.12
 * 
 * Test Cases:
 * 1. Test notification during quiet hours
 * 2. Test notification to multiple admins
 * 3. Test notification with invalid admin ID
 */

const adminNotificationService = require('../src/services/adminNotificationService');
const AdminNotification = require('../src/models/AdminNotification');
const NotificationPreference = require('../src/models/NotificationPreference');
const { User } = require('../src/models/User');
const logger = require('../src/utils/logger');

// Mock the models and logger
jest.mock('../src/models/AdminNotification');
jest.mock('../src/models/NotificationPreference');
jest.mock('../src/models/User');
jest.mock('../src/utils/logger');

describe('Admin Notification Service - Unit Tests', () => {
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createAdminNotification - Quiet Hours', () => {
    
    test('should skip notification during quiet hours', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      // Mock current time to be within quiet hours (23:00)
      const mockDate = new Date('2024-01-01T23:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      // Mock preferences with quiet hours enabled (22:00 - 08:00)
      NotificationPreference.findOne = jest.fn().mockResolvedValue({
        user: adminId,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      });

      const result = await adminNotificationService.createAdminNotification({
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered'
      });
      
      // Should return empty array (no notifications created)
      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Quiet hours active')
      );
      
      // Restore Date
      global.Date.mockRestore();
    });

    test('should send notification outside quiet hours', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      // Mock current time to be outside quiet hours (10:00)
      const realDate = Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            super('2024-01-01T10:00:00Z');
          } else {
            super(...args);
          }
        }
        
        static now() {
          return new realDate('2024-01-01T10:00:00Z').getTime();
        }
      };
      
      // Mock preferences with quiet hours enabled (22:00 - 08:00)
      NotificationPreference.findOne = jest.fn().mockResolvedValue({
        user: adminId,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      });
      
      const mockNotification = {
        _id: '507f1f77bcf86cd799439012',
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered',
        isRead: false,
        timestamp: new Date()
      };
      
      AdminNotification.create = jest.fn().mockResolvedValue(mockNotification);
      
      const result = await adminNotificationService.createAdminNotification({
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered'
      });
      
      // Should create notification
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockNotification);
      expect(AdminNotification.create).toHaveBeenCalled();
      
      // Restore Date
      global.Date = realDate;
    });

    test('should send notification when quiet hours disabled', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      // Mock current time to be within quiet hours (23:00)
      const mockDate = new Date('2024-01-01T23:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      // Mock preferences with quiet hours disabled
      NotificationPreference.findOne = jest.fn().mockResolvedValue({
        user: adminId,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      });
      
      const mockNotification = {
        _id: '507f1f77bcf86cd799439012',
        adminId,
        type: 'system_error',
        priority: 'urgent',
        title: 'System Error',
        message: 'Critical error occurred',
        isRead: false,
        timestamp: new Date()
      };
      
      AdminNotification.create = jest.fn().mockResolvedValue(mockNotification);
      
      const result = await adminNotificationService.createAdminNotification({
        adminId,
        type: 'system_error',
        priority: 'urgent',
        title: 'System Error',
        message: 'Critical error occurred'
      });
      
      // Should create notification even during quiet hours
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockNotification);
      
      // Restore Date
      global.Date.mockRestore();
    });

    test('should handle quiet hours spanning midnight', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      // Mock current time to be at 01:00 (after midnight)
      const mockDate = new Date('2024-01-01T01:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      // Mock preferences with quiet hours spanning midnight (22:00 - 08:00)
      NotificationPreference.findOne = jest.fn().mockResolvedValue({
        user: adminId,
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      });
      
      const result = await adminNotificationService.createAdminNotification({
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered'
      });
      
      // Should skip notification (01:00 is within 22:00-08:00)
      expect(result).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Quiet hours active')
      );
      
      // Restore Date
      global.Date.mockRestore();
    });

    test('should send notification when no preferences exist', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      // Mock no preferences found
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      
      const mockNotification = {
        _id: '507f1f77bcf86cd799439012',
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered',
        isRead: false,
        timestamp: new Date()
      };
      
      AdminNotification.create = jest.fn().mockResolvedValue(mockNotification);
      
      const result = await adminNotificationService.createAdminNotification({
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered'
      });
      
      // Should create notification (default: no quiet hours)
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockNotification);
    });
  });

  describe('createAdminNotification - Multiple Admins', () => {
    
    test('should send notification to multiple admins', async () => {
      const admin1Id = '507f1f77bcf86cd799439011';
      const admin2Id = '507f1f77bcf86cd799439012';
      const admin3Id = '507f1f77bcf86cd799439013';
      
      // Mock preferences for all admins (no quiet hours)
      NotificationPreference.findOne = jest.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      
      const mockNotifications = [
        {
          _id: '507f1f77bcf86cd799439021',
          adminId: admin1Id,
          type: 'review_flagged',
          priority: 'high',
          title: 'Flagged Review',
          message: 'A review was flagged',
          isRead: false
        },
        {
          _id: '507f1f77bcf86cd799439022',
          adminId: admin2Id,
          type: 'review_flagged',
          priority: 'high',
          title: 'Flagged Review',
          message: 'A review was flagged',
          isRead: false
        },
        {
          _id: '507f1f77bcf86cd799439023',
          adminId: admin3Id,
          type: 'review_flagged',
          priority: 'high',
          title: 'Flagged Review',
          message: 'A review was flagged',
          isRead: false
        }
      ];
      
      AdminNotification.create = jest.fn()
        .mockResolvedValueOnce(mockNotifications[0])
        .mockResolvedValueOnce(mockNotifications[1])
        .mockResolvedValueOnce(mockNotifications[2]);

      const result = await adminNotificationService.createAdminNotification({
        adminId: [admin1Id, admin2Id, admin3Id],
        type: 'review_flagged',
        priority: 'high',
        title: 'Flagged Review',
        message: 'A review was flagged'
      });
      
      // Should create 3 notifications
      expect(result).toHaveLength(3);
      expect(result[0].adminId).toBe(admin1Id);
      expect(result[1].adminId).toBe(admin2Id);
      expect(result[2].adminId).toBe(admin3Id);
      expect(AdminNotification.create).toHaveBeenCalledTimes(3);
    });

    test('should send notification to all admins when adminId is "all"', async () => {
      // Mock User.find to return all admins
      const mockAdmins = [
        { _id: '507f1f77bcf86cd799439011' },
        { _id: '507f1f77bcf86cd799439012' },
        { _id: '507f1f77bcf86cd799439013' }
      ];
      
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmins)
      });
      
      // Mock preferences for all admins (no quiet hours)
      NotificationPreference.findOne = jest.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      
      const mockNotifications = mockAdmins.map((admin, i) => ({
        _id: `507f1f77bcf86cd79943902${i}`,
        adminId: admin._id,
        type: 'system_error',
        priority: 'urgent',
        title: 'System Error',
        message: 'Critical error occurred',
        isRead: false
      }));
      
      AdminNotification.create = jest.fn()
        .mockResolvedValueOnce(mockNotifications[0])
        .mockResolvedValueOnce(mockNotifications[1])
        .mockResolvedValueOnce(mockNotifications[2]);
      
      const result = await adminNotificationService.createAdminNotification({
        adminId: 'all',
        type: 'system_error',
        priority: 'urgent',
        title: 'System Error',
        message: 'Critical error occurred'
      });
      
      // Should create notifications for all admins
      expect(result).toHaveLength(3);
      expect(User.find).toHaveBeenCalledWith({
        role: { $in: ['admin', 'moderator'] }
      });
      expect(AdminNotification.create).toHaveBeenCalledTimes(3);
    });

    test('should skip admins with disabled notification type', async () => {
      const admin1Id = '507f1f77bcf86cd799439011';
      const admin2Id = '507f1f77bcf86cd799439012';
      
      // Mock preferences: admin1 has type disabled, admin2 enabled
      NotificationPreference.findOne = jest.fn()
        .mockResolvedValueOnce({
          user: admin1Id,
          adminPreferences: {
            user_registered: { enabled: false }
          }
        })
        .mockResolvedValueOnce({
          user: admin2Id,
          adminPreferences: {
            user_registered: { enabled: true }
          }
        });
      
      const mockNotification = {
        _id: '507f1f77bcf86cd799439022',
        adminId: admin2Id,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered',
        isRead: false
      };
      
      AdminNotification.create = jest.fn().mockResolvedValue(mockNotification);
      
      const result = await adminNotificationService.createAdminNotification({
        adminId: [admin1Id, admin2Id],
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered'
      });
      
      // Should only create notification for admin2
      expect(result).toHaveLength(1);
      expect(result[0].adminId).toBe(admin2Id);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Notification type user_registered is disabled')
      );
    });

    test('should return empty array when no admins found', async () => {
      // Mock User.find to return empty array
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([])
      });
      
      const result = await adminNotificationService.createAdminNotification({
        adminId: 'all',
        type: 'system_error',
        priority: 'urgent',
        title: 'System Error',
        message: 'Critical error occurred'
      });
      
      // Should return empty array
      expect(result).toEqual([]);
      expect(logger.warn).toHaveBeenCalledWith('No admin users found for notification');
    });
  });

  describe('createAdminNotification - Invalid Admin ID', () => {
    
    test('should handle invalid admin ID gracefully', async () => {
      const invalidAdminId = 'invalid_id_format';
      
      // Mock preferences to return null (will proceed to create notification)
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock AdminNotification.create to throw error for invalid ID
      AdminNotification.create = jest.fn().mockRejectedValue(
        new Error('Cast to ObjectId failed')
      );
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId: invalidAdminId,
          type: 'user_registered',
          priority: 'low',
          title: 'New User',
          message: 'A new user registered'
        })
      ).rejects.toThrow();
      
      expect(logger.error).toHaveBeenCalledWith(
        'Error creating admin notification:',
        expect.any(Error)
      );
    });

    test('should handle non-existent admin ID', async () => {
      const nonExistentAdminId = '507f1f77bcf86cd799439999';
      
      // Mock preferences not found
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock AdminNotification.create to throw error (admin doesn't exist)
      AdminNotification.create = jest.fn().mockRejectedValue(
        new Error('Admin user not found')
      );
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId: nonExistentAdminId,
          type: 'user_registered',
          priority: 'low',
          title: 'New User',
          message: 'A new user registered'
        })
      ).rejects.toThrow('Admin user not found');
    });

    test('should handle null admin ID', async () => {
      await expect(
        adminNotificationService.createAdminNotification({
          adminId: null,
          type: 'user_registered',
          priority: 'low',
          title: 'New User',
          message: 'A new user registered'
        })
      ).rejects.toThrow();
    });

    test('should handle undefined admin ID', async () => {
      await expect(
        adminNotificationService.createAdminNotification({
          adminId: undefined,
          type: 'user_registered',
          priority: 'low',
          title: 'New User',
          message: 'A new user registered'
        })
      ).rejects.toThrow();
    });

    test('should handle empty array of admin IDs', async () => {
      const result = await adminNotificationService.createAdminNotification({
        adminId: [],
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered'
      });
      
      // Should return empty array
      expect(result).toEqual([]);
      expect(logger.warn).toHaveBeenCalledWith('No admin users found for notification');
    });

    test('should handle array with invalid admin IDs', async () => {
      const invalidIds = ['invalid1', 'invalid2', 'invalid3'];
      
      // Mock preferences to throw error for each invalid ID
      NotificationPreference.findOne = jest.fn().mockRejectedValue(
        new Error('Cast to ObjectId failed')
      );
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId: invalidIds,
          type: 'user_registered',
          priority: 'low',
          title: 'New User',
          message: 'A new user registered'
        })
      ).rejects.toThrow();
    });

    test('should handle mix of valid and invalid admin IDs', async () => {
      const validAdminId = '507f1f77bcf86cd799439011';
      const invalidAdminId = 'invalid_id';
      
      // Mock preferences: valid ID succeeds, invalid ID fails
      NotificationPreference.findOne = jest.fn()
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('Cast to ObjectId failed'));
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId: [validAdminId, invalidAdminId],
          type: 'user_registered',
          priority: 'low',
          title: 'New User',
          message: 'A new user registered'
        })
      ).rejects.toThrow();
    });
  });

  describe('Additional Edge Cases', () => {
    
    test('should handle database connection error', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      AdminNotification.create = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId,
          type: 'user_registered',
          priority: 'low',
          title: 'New User',
          message: 'A new user registered'
        })
      ).rejects.toThrow('Database connection failed');
      
      expect(logger.error).toHaveBeenCalled();
    });

    test('should handle missing required fields', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      AdminNotification.create = jest.fn().mockRejectedValue(
        new Error('Validation failed: title is required')
      );
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId,
          type: 'user_registered',
          priority: 'low',
          // title: missing
          message: 'A new user registered'
        })
      ).rejects.toThrow('Validation failed');
    });

    test('should handle invalid notification type', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      AdminNotification.create = jest.fn().mockRejectedValue(
        new Error('Invalid notification type')
      );
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId,
          type: 'invalid_type',
          priority: 'low',
          title: 'Test',
          message: 'Test message'
        })
      ).rejects.toThrow('Invalid notification type');
    });

    test('should handle invalid priority level', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      AdminNotification.create = jest.fn().mockRejectedValue(
        new Error('Invalid priority level')
      );
      
      await expect(
        adminNotificationService.createAdminNotification({
          adminId,
          type: 'user_registered',
          priority: 'invalid_priority',
          title: 'Test',
          message: 'Test message'
        })
      ).rejects.toThrow('Invalid priority level');
    });

    test('should create notification with optional fields', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      
      const mockNotification = {
        _id: '507f1f77bcf86cd799439012',
        adminId,
        type: 'job_posted',
        priority: 'medium',
        title: 'New Job',
        message: 'A new job was posted',
        actionUrl: '/admin/jobs/123',
        relatedId: '507f1f77bcf86cd799439020',
        relatedType: 'JobPosting',
        isRead: false,
        timestamp: new Date()
      };
      
      AdminNotification.create = jest.fn().mockResolvedValue(mockNotification);

      const result = await adminNotificationService.createAdminNotification({
        adminId,
        type: 'job_posted',
        priority: 'medium',
        title: 'New Job',
        message: 'A new job was posted',
        actionUrl: '/admin/jobs/123',
        relatedId: '507f1f77bcf86cd799439020',
        relatedType: 'JobPosting'
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].actionUrl).toBe('/admin/jobs/123');
      expect(result[0].relatedId).toBe('507f1f77bcf86cd799439020');
      expect(result[0].relatedType).toBe('JobPosting');
    });

    test('should handle concurrent notification creation', async () => {
      const admin1Id = '507f1f77bcf86cd799439011';
      const admin2Id = '507f1f77bcf86cd799439012';
      
      NotificationPreference.findOne = jest.fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      
      const mockNotification1 = {
        _id: '507f1f77bcf86cd799439021',
        adminId: admin1Id,
        type: 'system_error',
        priority: 'urgent',
        title: 'Error 1',
        message: 'Error occurred',
        isRead: false
      };
      
      const mockNotification2 = {
        _id: '507f1f77bcf86cd799439022',
        adminId: admin2Id,
        type: 'system_error',
        priority: 'urgent',
        title: 'Error 2',
        message: 'Error occurred',
        isRead: false
      };
      
      AdminNotification.create = jest.fn()
        .mockResolvedValueOnce(mockNotification1)
        .mockResolvedValueOnce(mockNotification2);
      
      const [result1, result2] = await Promise.all([
        adminNotificationService.createAdminNotification({
          adminId: admin1Id,
          type: 'system_error',
          priority: 'urgent',
          title: 'Error 1',
          message: 'Error occurred'
        }),
        adminNotificationService.createAdminNotification({
          adminId: admin2Id,
          type: 'system_error',
          priority: 'urgent',
          title: 'Error 2',
          message: 'Error occurred'
        })
      ]);
      
      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(result1[0].adminId).toBe(admin1Id);
      expect(result2[0].adminId).toBe(admin2Id);
    });

    test('should log successful notification creation', async () => {
      const adminId = '507f1f77bcf86cd799439011';
      
      NotificationPreference.findOne = jest.fn().mockResolvedValue(null);
      
      const mockNotification = {
        _id: '507f1f77bcf86cd799439012',
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered',
        isRead: false
      };
      
      AdminNotification.create = jest.fn().mockResolvedValue(mockNotification);
      
      await adminNotificationService.createAdminNotification({
        adminId,
        type: 'user_registered',
        priority: 'low',
        title: 'New User',
        message: 'A new user registered'
      });
      
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Admin notification created')
      );
    });
  });
});
