const JobPosting = require('../models/JobPosting');
const EducationalCourse = require('../models/EducationalCourse');
const Review = require('../models/Review');
const { createActivityLog } = require('./activityLogService');
const { createAdminNotification } = require('./adminNotificationService');

/**
 * Enhanced Content Management Service
 * Handles pending content, flagged content, and moderation actions
 */

/**
 * Get pending jobs with filtering
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} Pending jobs with pagination
 */
const getPendingJobs = async (filters = {}, page = 1, limit = 20) => {
  try {
    const query = { status: 'Closed' }; // Assuming 'Closed' means pending review
    
    // Apply filters
    if (filters.postedBy) {
      query.postedBy = filters.postedBy;
    }
    
    if (filters.postingType) {
      query.postingType = filters.postingType;
    }
    
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    const skip = (page - 1) * limit;
    
    const [jobs, total] = await Promise.all([
      JobPosting.find(query)
        .populate('postedBy', 'name email userType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobPosting.countDocuments(query)
    ]);
    
    return {
      jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  } catch (error) {
    throw new Error(`Failed to get pending jobs: ${error.message}`);
  }
};

/**
 * Get pending courses with filtering
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} Pending courses with pagination
 */
const getPendingCourses = async (filters = {}, page = 1, limit = 20) => {
  try {
    const query = { status: 'Draft' }; // Draft means pending review
    
    // Apply filters
    if (filters.instructor) {
      query.instructor = filters.instructor;
    }
    
    if (filters.category) {
      query.category = { $regex: filters.category, $options: 'i' };
    }
    
    if (filters.level) {
      query.level = filters.level;
    }
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    const skip = (page - 1) * limit;
    
    const [courses, total] = await Promise.all([
      EducationalCourse.find(query)
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EducationalCourse.countDocuments(query)
    ]);
    
    return {
      courses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  } catch (error) {
    throw new Error(`Failed to get pending courses: ${error.message}`);
  }
};

/**
 * Get flagged content (reviews) with filtering
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} Flagged content with pagination
 */
const getFlaggedContent = async (filters = {}, page = 1, limit = 20) => {
  try {
    const query = { status: 'flagged' };
    
    // Apply filters
    if (filters.reviewType) {
      query.reviewType = filters.reviewType;
    }
    
    if (filters.reviewer) {
      query.reviewer = filters.reviewer;
    }
    
    if (filters.reviewee) {
      query.reviewee = filters.reviewee;
    }
    
    if (filters.minReports) {
      query['reports'] = { $exists: true };
      query.$expr = { $gte: [{ $size: '$reports' }, parseInt(filters.minReports)] };
    }
    
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }
    
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('reviewer', 'name email userType')
        .populate('reviewee', 'name email userType')
        .populate('jobPosting', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query)
    ]);
    
    return {
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  } catch (error) {
    throw new Error(`Failed to get flagged content: ${error.message}`);
  }
};

/**
 * Approve content (job, course, or review)
 * @param {String} contentType - Type of content ('job', 'course', 'review')
 * @param {String} contentId - Content ID
 * @param {String} adminId - Admin user ID
 * @returns {Promise<Object>} Approved content
 */
const approveContent = async (contentType, contentId, adminId) => {
  try {
    let content;
    let Model;
    let notificationMessage;
    let creatorField;
    
    switch (contentType) {
      case 'job':
        Model = JobPosting;
        content = await Model.findByIdAndUpdate(
          contentId,
          { status: 'Open' },
          { new: true }
        ).populate('postedBy');
        creatorField = 'postedBy';
        notificationMessage = `Your job posting "${content.title}" has been approved and is now live.`;
        break;
        
      case 'course':
        Model = EducationalCourse;
        content = await Model.findByIdAndUpdate(
          contentId,
          { status: 'Published' },
          { new: true }
        ).populate('instructor');
        creatorField = 'instructor';
        notificationMessage = `Your course "${content.title}" has been approved and is now published.`;
        break;
        
      case 'review':
        Model = Review;
        content = await Model.findByIdAndUpdate(
          contentId,
          { status: 'approved', moderationNote: 'Approved by admin' },
          { new: true }
        ).populate('reviewer');
        creatorField = 'reviewer';
        notificationMessage = `Your review has been approved and is now visible.`;
        break;
        
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }
    
    if (!content) {
      throw new Error(`${contentType} not found`);
    }
    
    // Create activity log
    await createActivityLog({
      actorId: adminId,
      actionType: 'content_approved',
      targetType: contentType,
      targetId: contentId,
      details: `Approved ${contentType}: ${content.title || content._id}`
    });
    
    // Send notification to creator
    const creatorId = content[creatorField]?._id || content[creatorField];
    if (creatorId) {
      await createAdminNotification({
        userId: creatorId,
        type: 'content_approved',
        priority: 'medium',
        title: 'Content Approved',
        message: notificationMessage,
        actionUrl: `/${contentType}s/${contentId}`
      });
    }
    
    return content;
  } catch (error) {
    throw new Error(`Failed to approve content: ${error.message}`);
  }
};

/**
 * Reject content with reason
 * @param {String} contentType - Type of content ('job', 'course', 'review')
 * @param {String} contentId - Content ID
 * @param {String} adminId - Admin user ID
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} Rejected content
 */
const rejectContent = async (contentType, contentId, adminId, reason) => {
  try {
    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }
    
    let content;
    let Model;
    let notificationMessage;
    let creatorField;
    
    switch (contentType) {
      case 'job':
        Model = JobPosting;
        content = await Model.findByIdAndUpdate(
          contentId,
          { status: 'Closed' },
          { new: true }
        ).populate('postedBy');
        creatorField = 'postedBy';
        notificationMessage = `Your job posting "${content.title}" has been rejected. Reason: ${reason}`;
        break;
        
      case 'course':
        Model = EducationalCourse;
        content = await Model.findByIdAndUpdate(
          contentId,
          { status: 'Archived' },
          { new: true }
        ).populate('instructor');
        creatorField = 'instructor';
        notificationMessage = `Your course "${content.title}" has been rejected. Reason: ${reason}`;
        break;
        
      case 'review':
        Model = Review;
        content = await Model.findByIdAndUpdate(
          contentId,
          { status: 'rejected', moderationNote: reason },
          { new: true }
        ).populate('reviewer');
        creatorField = 'reviewer';
        notificationMessage = `Your review has been rejected. Reason: ${reason}`;
        break;
        
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }
    
    if (!content) {
      throw new Error(`${contentType} not found`);
    }
    
    // Create activity log
    await createActivityLog({
      actorId: adminId,
      actionType: 'content_rejected',
      targetType: contentType,
      targetId: contentId,
      details: `Rejected ${contentType}: ${content.title || content._id}. Reason: ${reason}`
    });
    
    // Send notification to creator with reason
    const creatorId = content[creatorField]?._id || content[creatorField];
    if (creatorId) {
      await createAdminNotification({
        userId: creatorId,
        type: 'content_rejected',
        priority: 'high',
        title: 'Content Rejected',
        message: notificationMessage,
        actionUrl: `/${contentType}s/${contentId}`
      });
    }
    
    return content;
  } catch (error) {
    throw new Error(`Failed to reject content: ${error.message}`);
  }
};

/**
 * Delete content permanently
 * @param {String} contentType - Type of content ('job', 'course', 'review')
 * @param {String} contentId - Content ID
 * @param {String} adminId - Admin user ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteContent = async (contentType, contentId, adminId) => {
  try {
    let content;
    let Model;
    
    switch (contentType) {
      case 'job':
        Model = JobPosting;
        break;
      case 'course':
        Model = EducationalCourse;
        break;
      case 'review':
        Model = Review;
        break;
      default:
        throw new Error(`Invalid content type: ${contentType}`);
    }
    
    // Get content before deletion for logging
    content = await Model.findById(contentId).lean();
    
    if (!content) {
      throw new Error(`${contentType} not found`);
    }
    
    // Delete the content
    await Model.findByIdAndDelete(contentId);
    
    // Create activity log
    await createActivityLog({
      actorId: adminId,
      actionType: 'content_deleted',
      targetType: contentType,
      targetId: contentId,
      details: `Permanently deleted ${contentType}: ${content.title || contentId}`
    });
    
    return {
      success: true,
      message: `${contentType} deleted successfully`,
      deletedContent: content
    };
  } catch (error) {
    throw new Error(`Failed to delete content: ${error.message}`);
  }
};

module.exports = {
  getPendingJobs,
  getPendingCourses,
  getFlaggedContent,
  approveContent,
  rejectContent,
  deleteContent
};
