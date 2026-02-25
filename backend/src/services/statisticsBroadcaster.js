const pusherService = require('./pusherService');
const statisticsService = require('./statisticsService');
const logger = require('../utils/logger');

/**
 * Statistics Broadcaster Service
 * 
 * Broadcasts real-time statistics updates to admin dashboard every 30 seconds
 * Requirements: 2.7
 */

class StatisticsBroadcaster {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.broadcastInterval = 30000; // 30 seconds
  }

  /**
   * Start broadcasting statistics updates
   */
  start() {
    if (this.isRunning) {
      logger.warn('Statistics broadcaster is already running');
      return;
    }

    if (!pusherService.isEnabled()) {
      logger.warn('Pusher is not enabled. Statistics broadcasting will not start.');
      return;
    }

    logger.info('Starting statistics broadcaster (every 30 seconds)...');
    
    // Broadcast immediately on start
    this.broadcastStatistics();
    
    // Then broadcast every 30 seconds
    this.intervalId = setInterval(() => {
      this.broadcastStatistics();
    }, this.broadcastInterval);
    
    this.isRunning = true;
    logger.info('✅ Statistics broadcaster started successfully');
  }

  /**
   * Stop broadcasting statistics updates
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Statistics broadcaster is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    logger.info('Statistics broadcaster stopped');
  }

  /**
   * Broadcast current statistics to admin dashboard
   */
  async broadcastStatistics() {
    try {
      // Get overview statistics (last 24 hours by default)
      const statistics = await statisticsService.getOverviewStatistics();
      
      // Broadcast to admin dashboard channel
      await pusherService.broadcastStatisticsUpdate(statistics);
      
      logger.debug('Statistics broadcasted successfully');
    } catch (error) {
      logger.error('Error broadcasting statistics:', error);
    }
  }

  /**
   * Trigger immediate broadcast (useful for testing or manual refresh)
   */
  async triggerBroadcast() {
    logger.info('Manual statistics broadcast triggered');
    await this.broadcastStatistics();
  }

  /**
   * Get broadcaster status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      broadcastInterval: this.broadcastInterval,
      pusherEnabled: pusherService.isEnabled()
    };
  }
}

// Export singleton instance
module.exports = new StatisticsBroadcaster();
