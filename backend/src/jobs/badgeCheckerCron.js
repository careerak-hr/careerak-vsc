const cron = require('node-cron');
const logger = require('../utils/logger');
const badgeService = require('../services/badgeService');
const User = require('../models/User');

/**
 * Badge Checker Cron Job
 * Periodically checks user achievements and awards badges automatically
 * Requirements: 5.2, 5.3
 */

let job = null;

/**
 * Process a single user - check and award badges
 * @param {String} userId
 * @returns {Object} result summary
 */
async function processUser(userId) {
  try {
    const newBadges = await badgeService.checkAndAwardBadges(userId);
    return { userId, awarded: newBadges.length, badges: newBadges.map(b => b.badge.badgeId) };
  } catch (error) {
    logger.error(`Badge check failed for user ${userId}:`, error.message);
    return { userId, awarded: 0, error: error.message };
  }
}

/**
 * Run the badge check for all active users
 */
async function runBadgeCheck() {
  logger.info('🏅 Starting badge checker job...');
  const startTime = Date.now();

  try {
    // Process users in batches to avoid memory pressure
    const BATCH_SIZE = 50;
    let skip = 0;
    let totalProcessed = 0;
    let totalAwarded = 0;

    while (true) {
      const users = await User.find({ isActive: { $ne: false } })
        .select('_id')
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean();

      if (users.length === 0) break;

      const results = await Promise.allSettled(
        users.map(u => processUser(u._id.toString()))
      );

      results.forEach(r => {
        if (r.status === 'fulfilled') {
          totalProcessed++;
          totalAwarded += r.value.awarded;
          if (r.value.awarded > 0) {
            logger.info(`Awarded ${r.value.awarded} badge(s) to user ${r.value.userId}: ${r.value.badges.join(', ')}`);
          }
        }
      });

      skip += BATCH_SIZE;

      // Stop if we got fewer users than batch size (last batch)
      if (users.length < BATCH_SIZE) break;
    }

    const duration = Date.now() - startTime;
    logger.info(`✅ Badge checker completed: ${totalProcessed} users checked, ${totalAwarded} badges awarded (${duration}ms)`);

    return { totalProcessed, totalAwarded, duration };
  } catch (error) {
    logger.error('❌ Badge checker job failed:', error);
    throw error;
  }
}

/**
 * Start the badge checker cron job
 * Runs every 6 hours
 */
function start() {
  if (job) {
    logger.warn('Badge checker cron is already running');
    return;
  }

  // Run every 6 hours: 0 */6 * * *
  job = cron.schedule('0 */6 * * *', async () => {
    try {
      await runBadgeCheck();
    } catch (error) {
      logger.error('Badge checker cron error:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  logger.info('✅ Badge checker cron started (every 6 hours)');
}

/**
 * Stop the badge checker cron job
 */
function stop() {
  if (job) {
    job.stop();
    job = null;
    logger.info('Badge checker cron stopped');
  }
}

/**
 * Run manually (for testing or admin trigger)
 */
async function runManually() {
  return runBadgeCheck();
}

module.exports = { start, stop, runManually };
