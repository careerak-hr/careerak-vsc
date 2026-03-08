const JobBookmark = require('../models/JobBookmark');
const JobPosting = require('../models/JobPosting');
const notificationService = require('../services/notificationService');

/**
 * Toggle bookmark for a job
 * Requirements: 2.1, 2.4
 */
exports.toggleBookmark = async (userId, jobId) => {
  try {
    const existingBookmark = await JobBookmark.findOne({ user: userId, job: jobId });

    if (existingBookmark) {
      // Remove bookmark
      await JobBookmark.findByIdAndDelete(existingBookmark._id);
      
      // Update bookmark count in JobPosting
      await JobPosting.findByIdAndUpdate(jobId, { $inc: { bookmarkCount: -1 } });

      return { bookmarked: false, message: 'Job removed from bookmarks' };
    } else {
      // Add bookmark
      const newBookmark = new JobBookmark({ user: userId, job: jobId });
      await newBookmark.save();

      // Update bookmark count in JobPosting
      await JobPosting.findByIdAndUpdate(jobId, { $inc: { bookmarkCount: 1 } });

      return { bookmarked: true, message: 'Job added to bookmarks' };
    }
  } catch (error) {
    throw new Error(`Failed to toggle bookmark: ${error.message}`);
  }
};

/**
 * Get all bookmarked jobs for a user
 * Requirements: 2.2, 2.5
 */
exports.getUserBookmarks = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const bookmarks = await JobBookmark.find({ user: userId })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'companyName companyIndustry' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await JobBookmark.countDocuments({ user: userId });

    return {
      bookmarks: bookmarks.map(b => b.job).filter(Boolean),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to get bookmarks: ${error.message}`);
  }
};

/**
 * Check if a job is bookmarked by a user
 */
exports.isJobBookmarked = async (userId, jobId) => {
  try {
    const bookmark = await JobBookmark.findOne({ user: userId, job: jobId });
    return !!bookmark;
  } catch (error) {
    return false;
  }
};
