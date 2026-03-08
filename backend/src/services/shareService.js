const JobShare = require('../models/JobShare');
const JobPosting = require('../models/JobPosting');

/**
 * Record a job share
 * Requirements: 5.1
 */
exports.recordShare = async (jobId, shareData) => {
  try {
    const { userId, platform, ip, userAgent } = shareData;

    const newShare = new JobShare({
      job: jobId,
      user: userId,
      platform,
      ip,
      userAgent
    });

    await newShare.save();

    // Update share count in JobPosting
    await JobPosting.findByIdAndUpdate(jobId, { $inc: { shareCount: 1 } });

    return { success: true, message: 'Share recorded successfully' };
  } catch (error) {
    throw new Error(`Failed to record share: ${error.message}`);
  }
};

/**
 * Get share statistics for a job
 */
exports.getJobShareStats = async (jobId) => {
  try {
    const stats = await JobShare.aggregate([
      { $match: { job: new mongoose.Types.ObjectId(jobId) } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    return stats;
  } catch (error) {
    throw new Error(`Failed to get share stats: ${error.message}`);
  }
};
