const cronScheduler = require('../jobs/cronScheduler');
const sessionService = require('../services/sessionService');
const dataExportService = require('../services/dataExportService');
const accountDeletionService = require('../services/accountDeletionService');
const notificationService = require('../services/notificationService');

// Mock services
jest.mock('../services/sessionService');
jest.mock('../services/dataExportService');
jest.mock('../services/accountDeletionService');
jest.mock('../services/notificationService');
jest.mock('../utils/logger');

describe('Cron Scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Stop scheduler if running
    if (cronScheduler.isRunning) {
      cronScheduler.stop();
    }
  });

  afterEach(() => {
    // Clean up
    if (cronScheduler.isRunning) {
      cronScheduler.stop();
    }
  });

  describe('start()', () => {
    it('should start all cron jobs', () => {
      cronScheduler.start();
      
      const status = cronScheduler.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.jobs).toHaveLength(5);
    });

    it('should not start if already running', () => {
      cronScheduler.start();
      cronScheduler.start(); // Try to start again
      
      const status = cronScheduler.getStatus();
      expect(status.isRunning).toBe(true);
    });
  });

  describe('stop()', () => {
    it('should stop all cron jobs', () => {
      cronScheduler.start();
      cronScheduler.stop();
      
      const status = cronScheduler.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.jobs).toHaveLength(0);
    });

    it('should not fail if not running', () => {
      expect(() => cronScheduler.stop()).not.toThrow();
    });
  });

  describe('getStatus()', () => {
    it('should return correct status when running', () => {
      cronScheduler.start();
      
      const status = cronScheduler.getStatus();
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('jobs');
      expect(status.isRunning).toBe(true);
      expect(Array.isArray(status.jobs)).toBe(true);
    });

    it('should return correct status when stopped', () => {
      const status = cronScheduler.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.jobs).toHaveLength(0);
    });
  });

  describe('getAvailableJobs()', () => {
    it('should return list of all available jobs', () => {
      const jobs = cronScheduler.getAvailableJobs();
      
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs).toHaveLength(5);
      
      // Check job structure
      jobs.forEach(job => {
        expect(job).toHaveProperty('name');
        expect(job).toHaveProperty('description');
        expect(job).toHaveProperty('schedule');
        expect(job).toHaveProperty('requirement');
      });
      
      // Check specific jobs
      const jobNames = jobs.map(j => j.name);
      expect(jobNames).toContain('cleanupExpiredSessions');
      expect(jobNames).toContain('cleanupExpiredExports');
      expect(jobNames).toContain('processScheduledDeletions');
      expect(jobNames).toContain('sendDeletionReminders');
      expect(jobNames).toContain('sendQueuedNotifications');
    });
  });

  describe('runJobManually()', () => {
    it('should run cleanupExpiredSessions job', async () => {
      sessionService.cleanupExpiredSessions.mockResolvedValue(5);
      sessionService.cleanupInactiveSessions.mockResolvedValue(3);
      
      const result = await cronScheduler.runJobManually('cleanupExpiredSessions');
      
      expect(result.success).toBe(true);
      expect(result.expiredCount).toBe(5);
      expect(result.inactiveCount).toBe(3);
      expect(sessionService.cleanupExpiredSessions).toHaveBeenCalled();
      expect(sessionService.cleanupInactiveSessions).toHaveBeenCalled();
    });

    it('should run cleanupExpiredExports job', async () => {
      dataExportService.cleanupExpiredExports.mockResolvedValue({
        deletedCount: 10,
        errorCount: 0,
        totalExpired: 10
      });
      
      const result = await cronScheduler.runJobManually('cleanupExpiredExports');
      
      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(10);
      expect(dataExportService.cleanupExpiredExports).toHaveBeenCalled();
    });

    it('should run processScheduledDeletions job', async () => {
      accountDeletionService.processScheduledDeletions.mockResolvedValue({
        processed: 2,
        succeeded: 2,
        failed: 0,
        errors: []
      });
      
      const result = await cronScheduler.runJobManually('processScheduledDeletions');
      
      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(accountDeletionService.processScheduledDeletions).toHaveBeenCalled();
    });

    it('should run sendDeletionReminders job', async () => {
      accountDeletionService.sendDeletionReminders.mockResolvedValue({
        processed: 5,
        sent: 5,
        failed: 0,
        errors: []
      });
      
      const result = await cronScheduler.runJobManually('sendDeletionReminders');
      
      expect(result.success).toBe(true);
      expect(result.sent).toBe(5);
      expect(accountDeletionService.sendDeletionReminders).toHaveBeenCalled();
    });

    it('should run sendQueuedNotifications job', async () => {
      notificationService.sendQueuedNotifications.mockResolvedValue({
        sent: 15,
        failed: 0,
        total: 15
      });
      
      const result = await cronScheduler.runJobManually('sendQueuedNotifications');
      
      expect(result.success).toBe(true);
      expect(result.sent).toBe(15);
      expect(notificationService.sendQueuedNotifications).toHaveBeenCalled();
    });

    it('should return error for unknown job', async () => {
      const result = await cronScheduler.runJobManually('unknownJob');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle job execution errors', async () => {
      sessionService.cleanupExpiredSessions.mockRejectedValue(new Error('Database error'));
      
      const result = await cronScheduler.runJobManually('cleanupExpiredSessions');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
