/**
 * Unit Tests for Activity Log Service
 * 
 * Tests Requirements: 5.1-5.14
 * 
 * Test Cases:
 * 1. Log creation with missing fields (should fail)
 * 2. Concurrent log writes
 * 3. Search with special characters
 */

const {
  createActivityLog,
  getActivityLogs,
  searchActivityLogs,
  getUserActivityLogs,
  getActivityLogStats
} = require('../src/services/activityLogService');

const ActivityLog = require('../src/models/ActivityLog');
const logger = require('../src/utils/logger');

// Mock the ActivityLog model and logger
jest.mock('../src/models/ActivityLog');
jest.mock('../src/utils/logger');

describe('Activity Log Service - Unit Tests', () => {
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createActivityLog - Missing Fields Validation', () => {
    
    test('should throw error when actorId is missing', async () => {
      const logData = {
        // actorId: missing
        actorName: 'John Doe',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439011',
        details: 'User registered successfully',
        ipAddress: '192.168.1.1'
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
      expect(logger.error).toHaveBeenCalledWith(
        'Error creating activity log',
        expect.objectContaining({
          error: 'Missing required fields for activity log'
        })
      );
    });

    test('should throw error when actorName is missing', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        // actorName: missing
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        details: 'User registered successfully',
        ipAddress: '192.168.1.1'
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should throw error when actionType is missing', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        // actionType: missing
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        details: 'User registered successfully',
        ipAddress: '192.168.1.1'
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should throw error when targetType is missing', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        actionType: 'user_registered',
        // targetType: missing
        targetId: '507f1f77bcf86cd799439012',
        details: 'User registered successfully',
        ipAddress: '192.168.1.1'
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should throw error when targetId is missing', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        actionType: 'user_registered',
        targetType: 'User',
        // targetId: missing
        details: 'User registered successfully',
        ipAddress: '192.168.1.1'
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should throw error when details is missing', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        // details: missing
        ipAddress: '192.168.1.1'
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should throw error when ipAddress is missing', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        details: 'User registered successfully'
        // ipAddress: missing
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should throw error when multiple fields are missing', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        // actorName: missing
        // actionType: missing
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        // details: missing
        ipAddress: '192.168.1.1'
      };

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should throw error when all fields are missing', async () => {
      const logData = {};

      await expect(createActivityLog(logData)).rejects.toThrow('Missing required fields for activity log');
    });

    test('should succeed when all required fields are present', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        details: 'User registered successfully',
        ipAddress: '192.168.1.1'
      };

      const mockSavedLog = {
        _id: '507f1f77bcf86cd799439013',
        ...logData,
        timestamp: new Date(),
        metadata: {}
      };

      // Mock ActivityLog constructor and save method
      const mockSave = jest.fn().mockResolvedValue(mockSavedLog);
      ActivityLog.mockImplementation(() => ({
        save: mockSave,
        ...logData
      }));

      const result = await createActivityLog(logData);

      expect(mockSave).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Activity log created',
        expect.objectContaining({
          actorId: logData.actorId,
          actionType: logData.actionType
        })
      );
    });

    test('should succeed with optional metadata field', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        details: 'User registered successfully',
        ipAddress: '192.168.1.1',
        metadata: { userAgent: 'Mozilla/5.0', source: 'web' }
      };

      const mockSave = jest.fn().mockResolvedValue({ ...logData, _id: '123' });
      ActivityLog.mockImplementation(() => ({
        save: mockSave,
        ...logData
      }));

      await createActivityLog(logData);

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('createActivityLog - Concurrent Log Writes', () => {
    
    test('should handle concurrent writes without data corruption', async () => {
      // Simulate 10 concurrent log writes
      const concurrentWrites = 10;
      const logPromises = [];

      for (let i = 0; i < concurrentWrites; i++) {
        const logData = {
          actorId: `507f1f77bcf86cd79943901${i}`,
          actorName: `User ${i}`,
          actionType: 'user_registered',
          targetType: 'User',
          targetId: `507f1f77bcf86cd79943902${i}`,
          details: `User ${i} registered successfully`,
          ipAddress: `192.168.1.${i}`
        };

        // Mock save for each log
        const mockSave = jest.fn().mockResolvedValue({
          _id: `log_${i}`,
          ...logData
        });

        ActivityLog.mockImplementationOnce(() => ({
          save: mockSave,
          ...logData
        }));

        logPromises.push(createActivityLog(logData));
      }

      // Wait for all concurrent writes to complete
      const results = await Promise.all(logPromises);

      // Verify all writes succeeded
      expect(results).toHaveLength(concurrentWrites);
      expect(logger.info).toHaveBeenCalledTimes(concurrentWrites);
    });

    test('should handle concurrent writes with same actorId', async () => {
      // Simulate same user performing multiple actions concurrently
      const concurrentActions = 5;
      const actorId = '507f1f77bcf86cd799439011';
      const actionTypes = [
        'user_registered',
        'job_posted',
        'application_submitted',
        'course_enrolled',
        'review_posted'
      ];

      const logPromises = actionTypes.map((actionType, i) => {
        const logData = {
          actorId,
          actorName: 'John Doe',
          actionType,
          targetType: 'Various',
          targetId: `507f1f77bcf86cd79943902${i}`,
          details: `Action ${actionType} performed`,
          ipAddress: '192.168.1.1'
        };

        const mockSave = jest.fn().mockResolvedValue({
          _id: `log_${i}`,
          ...logData
        });

        ActivityLog.mockImplementationOnce(() => ({
          save: mockSave,
          ...logData
        }));

        return createActivityLog(logData);
      });

      const results = await Promise.all(logPromises);

      expect(results).toHaveLength(concurrentActions);
      // All logs should have the same actorId
      results.forEach(result => {
        expect(result.actorId).toBe(actorId);
      });
    });

    test('should handle race condition with database errors', async () => {
      // Simulate concurrent writes where some fail
      const logData1 = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'User 1',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439021',
        details: 'User 1 registered',
        ipAddress: '192.168.1.1'
      };

      const logData2 = {
        actorId: '507f1f77bcf86cd799439012',
        actorName: 'User 2',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439022',
        details: 'User 2 registered',
        ipAddress: '192.168.1.2'
      };

      // First write succeeds
      const mockSave1 = jest.fn().mockResolvedValue({ _id: 'log_1', ...logData1 });
      ActivityLog.mockImplementationOnce(() => ({
        save: mockSave1,
        ...logData1
      }));

      // Second write fails (database error)
      const mockSave2 = jest.fn().mockRejectedValue(new Error('Database write conflict'));
      ActivityLog.mockImplementationOnce(() => ({
        save: mockSave2,
        ...logData2
      }));

      const promise1 = createActivityLog(logData1);
      const promise2 = createActivityLog(logData2);

      // First should succeed
      await expect(promise1).resolves.toBeDefined();
      
      // Second should fail
      await expect(promise2).rejects.toThrow('Database write conflict');
      
      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith(
        'Error creating activity log',
        expect.objectContaining({
          error: 'Database write conflict'
        })
      );
    });

    test('should maintain data integrity during concurrent writes', async () => {
      // Test that concurrent writes don't mix data
      const user1Data = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'Alice',
        actionType: 'job_posted',
        targetType: 'Job',
        targetId: '507f1f77bcf86cd799439021',
        details: 'Alice posted a job',
        ipAddress: '192.168.1.1'
      };

      const user2Data = {
        actorId: '507f1f77bcf86cd799439012',
        actorName: 'Bob',
        actionType: 'application_submitted',
        targetType: 'Application',
        targetId: '507f1f77bcf86cd799439022',
        details: 'Bob submitted an application',
        ipAddress: '192.168.1.2'
      };

      // Mock saves
      const mockSave1 = jest.fn().mockResolvedValue({ _id: 'log_1', ...user1Data });
      const mockSave2 = jest.fn().mockResolvedValue({ _id: 'log_2', ...user2Data });

      ActivityLog.mockImplementationOnce(() => ({
        save: mockSave1,
        ...user1Data
      }));

      ActivityLog.mockImplementationOnce(() => ({
        save: mockSave2,
        ...user2Data
      }));

      const [result1, result2] = await Promise.all([
        createActivityLog(user1Data),
        createActivityLog(user2Data)
      ]);

      // Verify data integrity - no mixing of data
      expect(result1.actorName).toBe('Alice');
      expect(result1.actionType).toBe('job_posted');
      expect(result2.actorName).toBe('Bob');
      expect(result2.actionType).toBe('application_submitted');
    });
  });

  describe('searchActivityLogs - Special Characters', () => {
    
    test('should handle search with special regex characters', async () => {
      const searchTerm = 'user@example.com';
      
      const mockLogs = [
        {
          _id: '1',
          actorName: 'User',
          details: 'Email: user@example.com',
          actionType: 'user_registered'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].details).toContain('user@example.com');
    });

    test('should handle search with parentheses', async () => {
      const searchTerm = 'User (Admin)';
      
      const mockLogs = [
        {
          _id: '1',
          actorName: 'User (Admin)',
          details: 'Admin action performed',
          actionType: 'user_modified'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].actorName).toBe('User (Admin)');
    });

    test('should handle search with brackets', async () => {
      const searchTerm = 'Job [ID: 12345]';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'Job [ID: 12345] was posted',
          actionType: 'job_posted'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with asterisk', async () => {
      const searchTerm = 'user*';
      
      const mockLogs = [
        {
          _id: '1',
          actorName: 'user123',
          details: 'User action',
          actionType: 'user_registered'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with plus sign', async () => {
      const searchTerm = 'C++ Developer';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'Job posted for C++ Developer',
          actionType: 'job_posted'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with question mark', async () => {
      const searchTerm = 'What?';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'User asked: What?',
          actionType: 'content_reported'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with dollar sign', async () => {
      const searchTerm = '$100';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'Payment of $100 received',
          actionType: 'user_modified'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with backslash', async () => {
      const searchTerm = 'C:\\Users\\Admin';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'File path: C:\\Users\\Admin',
          actionType: 'user_modified'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with quotes', async () => {
      const searchTerm = '"Important Message"';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'Message: "Important Message"',
          actionType: 'content_reported'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with pipe character', async () => {
      const searchTerm = 'option1|option2';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'Selected: option1|option2',
          actionType: 'user_modified'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle search with multiple special characters', async () => {
      const searchTerm = 'user@example.com (Admin) [ID: 123]';
      
      const mockLogs = [
        {
          _id: '1',
          details: 'User: user@example.com (Admin) [ID: 123]',
          actionType: 'user_registered'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });

    test('should handle empty search term', async () => {
      await expect(searchActivityLogs({ searchTerm: '' })).rejects.toThrow('Search term is required');
    });

    test('should handle undefined search term', async () => {
      await expect(searchActivityLogs({})).rejects.toThrow('Search term is required');
    });

    test('should handle search with Arabic characters', async () => {
      const searchTerm = 'مستخدم';
      
      const mockLogs = [
        {
          _id: '1',
          actorName: 'مستخدم',
          details: 'تم التسجيل بنجاح',
          actionType: 'user_registered'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].actorName).toBe('مستخدم');
    });

    test('should handle search with emoji', async () => {
      const searchTerm = '🎉 celebration';
      
      const mockLogs = [
        {
          _id: '1',
          details: '🎉 celebration event',
          actionType: 'user_modified'
        }
      ];

      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLogs)
      });

      ActivityLog.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await searchActivityLogs({ searchTerm });

      expect(result.logs).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    
    test('should handle database errors gracefully', async () => {
      const logData = {
        actorId: '507f1f77bcf86cd799439011',
        actorName: 'John Doe',
        actionType: 'user_registered',
        targetType: 'User',
        targetId: '507f1f77bcf86cd799439012',
        details: 'User registered',
        ipAddress: '192.168.1.1'
      };

      const mockSave = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      ActivityLog.mockImplementation(() => ({
        save: mockSave,
        ...logData
      }));

      await expect(createActivityLog(logData)).rejects.toThrow('Database connection failed');
      expect(logger.error).toHaveBeenCalled();
    });

    test('should handle search errors gracefully', async () => {
      ActivityLog.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Search failed'))
      });

      await expect(searchActivityLogs({ searchTerm: 'test' })).rejects.toThrow('Search failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
