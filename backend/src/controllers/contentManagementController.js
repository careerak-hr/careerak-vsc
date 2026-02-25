const contentManagementService = require('../services/contentManagementService');

/**
 * Content Management Controller
 * Handles admin content moderation endpoints
 */

/**
 * Get pending jobs
 * GET /api/admin/content/pending-jobs
 */
const getPendingJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    
    const result = await contentManagementService.getPendingJobs(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.jobs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get pending jobs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pending jobs'
    });
  }
};

/**
 * Get pending courses
 * GET /api/admin/content/pending-courses
 */
const getPendingCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    
    const result = await contentManagementService.getPendingCourses(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.courses,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pending courses'
    });
  }
};

/**
 * Get flagged content
 * GET /api/admin/content/flagged
 */
const getFlaggedContent = async (req, res) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.query;
    
    const result = await contentManagementService.getFlaggedContent(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get flagged content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get flagged content'
    });
  }
};

/**
 * Approve content
 * PATCH /api/admin/content/:id/approve
 */
const approveContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { contentType } = req.body;
    const adminId = req.user._id;
    
    if (!contentType || !['job', 'course', 'review'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid content type is required (job, course, or review)'
      });
    }
    
    const content = await contentManagementService.approveContent(
      contentType,
      id,
      adminId
    );
    
    res.status(200).json({
      success: true,
      message: `${contentType} approved successfully`,
      data: content
    });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve content'
    });
  }
};

/**
 * Reject content
 * PATCH /api/admin/content/:id/reject
 */
const rejectContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { contentType, reason } = req.body;
    const adminId = req.user._id;
    
    if (!contentType || !['job', 'course', 'review'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid content type is required (job, course, or review)'
      });
    }
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const content = await contentManagementService.rejectContent(
      contentType,
      id,
      adminId,
      reason
    );
    
    res.status(200).json({
      success: true,
      message: `${contentType} rejected successfully`,
      data: content
    });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject content'
    });
  }
};

/**
 * Delete content
 * DELETE /api/admin/content/:id
 */
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { contentType } = req.query;
    const adminId = req.user._id;
    
    if (!contentType || !['job', 'course', 'review'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid content type is required (job, course, or review)'
      });
    }
    
    const result = await contentManagementService.deleteContent(
      contentType,
      id,
      adminId
    );
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.deletedContent
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete content'
    });
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
