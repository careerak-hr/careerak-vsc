const cron = require('node-cron');
const logger = require('../utils/logger');

// Import services
const sessionService = require('../services/sessionService');
const dataExportService = require('../services/dataExportService');
const accountDeletionService = require('../services/accountDeletionService');
const notificationService = require('../services/notificationService');

/**
 * Cron Job Scheduler
 * Manages all scheduled background jobs for the Settings Page
 * 
 * Requirements: 7.5, 9.6, 11.5, 12.7, 12.8
 */
class CronScheduler {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Initialize and start all cron jobs
   */
  start() {
    if (this.isRunning) {
      logger.warn('Cron scheduler is already running');
      return;
    }

    logger.info('Starting cron scheduler...');

    // 1. Cleanup expired sessions (daily at 2:00 AM)
    // Requirement: 9.6
    this.jobs.set('cleanupExpiredSessions', cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running cleanupExpiredSessions job...');
        const expiredCount = await sessionService.cleanupExpiredSessions();
        const inactiveCount = await sessionService.cleanupInactiveSessions();
        logger.info(`Cleaned up ${expiredCount} expired sessions and ${inactiveCount} inactive sessions`);
      } catch (error) {
        logger.error('Error in cleanupExpiredSessions job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // 2. Cleanup expired data exports (daily at 3:00 AM)
    // Requirement: 11.5
    this.jobs.set('cleanupExpiredExports', cron.schedule('0 3 * * *', async () => {
      try {
        logger.info('Running cleanupExpiredExports job...');
        const result = await dataExportService.cleanupExpiredExports();
        logger.info(`Cleaned up ${result.deletedCount} expired exports (${result.errorCount} errors)`);
      } catch (error) {
        logger.error('Error in cleanupExpiredExports job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // 3. Process scheduled account deletions (daily at 4:00 AM)
    // Requirement: 12.5, 12.8
    this.jobs.set('processScheduledDeletions', cron.schedule('0 4 * * *', async () => {
      try {
        logger.info('Running processScheduledDeletions job...');
        const result = await accountDeletionService.processScheduledDeletions();
        logger.info(`Processed ${result.processed} deletions: ${result.succeeded} succeeded, ${result.failed} failed`);
        
        if (result.errors.length > 0) {
          logger.error('Deletion errors:', result.errors);
        }
      } catch (error) {
        logger.error('Error in processScheduledDeletions job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // 4. Send deletion reminders (daily at 10:00 AM)
    // Requirement: 12.7
    this.jobs.set('sendDeletionReminders', cron.schedule('0 10 * * *', async () => {
      try {
        logger.info('Running sendDeletionReminders job...');
        const result = await accountDeletionService.sendDeletionReminders();
        logger.info(`Sent ${result.sent} deletion reminders (${result.failed} failed)`);
        
        if (result.errors.length > 0) {
          logger.error('Reminder errors:', result.errors);
        }
      } catch (error) {
        logger.error('Error in sendDeletionReminders job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    // 5. Send queued notifications (every hour)
    // Requirement: 7.5
    this.jobs.set('sendQueuedNotifications', cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running sendQueuedNotifications job...');
        const result = await notificationService.sendQueuedNotifications();
        logger.info(`Sent ${result.sent} queued notifications (${result.failed} failed)`);
      } catch (error) {
        logger.error('Error in sendQueuedNotifications job:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    }));

    this.isRunning = true;
    logger.info('Cron scheduler started successfully');
    logger.info(`Active jobs: ${Array.from(this.jobs.keys()).join(', ')}`);
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Cron scheduler is not running');
      return;
    }

    logger.info('Stopping cron scheduler...');

    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    logger.info('Cron scheduler stopped successfully');
  }

  /**
   * Get status of all jobs
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      jobs: []
    };

    this.jobs.forEach((job, name) => {
      status.jobs.push({
        name,
        running: job.running || false
      });
    });

    return status;
  }

  /**
   * Run a specific job manually (for testing)
   * @param {string} jobName - Name of the job to run
   */
  async runJobManually(jobName) {
    logger.info(`Manually running job: ${jobName}`);

    try {
      switch (jobName) {
        case 'cleanupExpiredSessions':
          const expiredCount = await sessionService.cleanupExpiredSessions();
          const inactiveCount = await sessionService.cleanupInactiveSessions();
          return { 
            success: true, 
            expiredCount, 
            inactiveCount,
            message: `Cleaned up ${expiredCount} expired and ${inactiveCount} inactive sessions`
          };

        case 'cleanupExpiredExports':
          const exportResult = await dataExportService.cleanupExpiredExports();
          return { 
            success: true, 
            ...exportResult,
            message: `Cleaned up ${exportResult.deletedCount} expired exports`
          };

        case 'processScheduledDeletions':
          const deletionResult = await accountDeletionService.processScheduledDeletions();
          return { 
            success: true, 
            ...deletionResult,
            message: `Processed ${deletionResult.processed} deletions`
          };

        case 'sendDeletionReminders':
          const reminderResult = await accountDeletionService.sendDeletionReminders();
          return { 
            success: true, 
            ...reminderResult,
            message: `Sent ${reminderResult.sent} deletion reminders`
          };

        case 'sendQueuedNotifications':
          const notifResult = await notificationService.sendQueuedNotifications();
          return { 
            success: true, 
            ...notifResult,
            message: `Sent ${notifResult.sent} queued notifications`
          };

        default:
          throw new Error(`Unknown job: ${jobName}`);
      }
    } catch (error) {
      logger.error(`Error running job ${jobName} manually:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get list of all available jobs
   */
  getAvailableJobs() {
    return [
      {
        name: 'cleanupExpiredSessions',
        description: 'Cleanup expired and inactive sessions',
        schedule: 'Daily at 2:00 AM UTC',
        requirement: '9.6'
      },
      {
        name: 'cleanupExpiredExports',
        description: 'Cleanup expired data export files',
        schedule: 'Daily at 3:00 AM UTC',
        requirement: '11.5'
      },
      {
        name: 'processScheduledDeletions',
        description: 'Process scheduled account deletions',
        schedule: 'Daily at 4:00 AM UTC',
        requirement: '12.5, 12.8'
      },
      {
        name: 'sendDeletionReminders',
        description: 'Send account deletion reminders (7 days before)',
        schedule: 'Daily at 10:00 AM UTC',
        requirement: '12.7'
      },
      {
        name: 'sendQueuedNotifications',
        description: 'Send queued notifications (quiet hours)',
        schedule: 'Every hour',
        requirement: '7.5'
      }
    ];
  }
}

// Export singleton instance
module.exports = new CronScheduler();
