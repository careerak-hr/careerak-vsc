const cronScheduler = require('../jobs/cronScheduler');
const logger = require('../utils/logger');

/**
 * Cron Controller
 * Provides API endpoints for managing cron jobs
 * (Admin only)
 */
class CronController {
  /**
   * Get status of all cron jobs
   * GET /api/cron/status
   */
  async getStatus(req, res) {
    try {
      const status = cronScheduler.getStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error getting cron status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cron status',
        error: error.message
      });
    }
  }

  /**
   * Get list of all available jobs
   * GET /api/cron/jobs
   */
  async getJobs(req, res) {
    try {
      const jobs = cronScheduler.getAvailableJobs();
      
      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      logger.error('Error getting cron jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cron jobs',
        error: error.message
      });
    }
  }

  /**
   * Run a specific job manually
   * POST /api/cron/run/:jobName
   */
  async runJob(req, res) {
    try {
      const { jobName } = req.params;
      
      logger.info(`Admin ${req.user._id} manually running job: ${jobName}`);
      
      const result = await cronScheduler.runJobManually(jobName);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error || 'Job execution failed'
        });
      }
    } catch (error) {
      logger.error('Error running cron job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to run cron job',
        error: error.message
      });
    }
  }

  /**
   * Start cron scheduler
   * POST /api/cron/start
   */
  async start(req, res) {
    try {
      cronScheduler.start();
      
      logger.info(`Admin ${req.user._id} started cron scheduler`);
      
      res.json({
        success: true,
        message: 'Cron scheduler started successfully'
      });
    } catch (error) {
      logger.error('Error starting cron scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start cron scheduler',
        error: error.message
      });
    }
  }

  /**
   * Stop cron scheduler
   * POST /api/cron/stop
   */
  async stop(req, res) {
    try {
      cronScheduler.stop();
      
      logger.info(`Admin ${req.user._id} stopped cron scheduler`);
      
      res.json({
        success: true,
        message: 'Cron scheduler stopped successfully'
      });
    } catch (error) {
      logger.error('Error stopping cron scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop cron scheduler',
        error: error.message
      });
    }
  }
}

module.exports = new CronController();
