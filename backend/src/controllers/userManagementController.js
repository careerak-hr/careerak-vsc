const userManagementService = require('../services/userManagementService');
const { User } = require('../models/User');

/**
 * User Management Controller
 * Handles admin operations for user management
 */

/**
 * Search users with multi-field search
 * GET /api/admin/users/search?q=query&page=1&limit=20
 */
exports.searchUsers = async (req, res) => {
  try {
    const { q, page, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    };

    const result = await userManagementService.searchUsers(q, options);

    res.status(200).json({
      success: true,
      query: q,
      ...result
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      error: 'Failed to search users',
      details: error.message 
    });
  }
};

/**
 * Get users with filters
 * GET /api/admin/users?type=Employee&isVerified=true&page=1&limit=20
 */
exports.getUsers = async (req, res) => {
  try {
    const { 
      type, 
      isVerified, 
      emailVerified,
      startDate, 
      endDate, 
      country,
      isSpecialNeeds,
      twoFactorEnabled,
      page, 
      limit,
      sortBy,
      sortOrder
    } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (isVerified !== undefined) filters.isVerified = isVerified;
    if (emailVerified !== undefined) filters.emailVerified = emailVerified;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (country) filters.country = country;
    if (isSpecialNeeds !== undefined) filters.isSpecialNeeds = isSpecialNeeds;
    if (twoFactorEnabled !== undefined) filters.twoFactorEnabled = twoFactorEnabled;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    };

    const result = await userManagementService.filterUsers(filters, options);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      details: error.message 
    });
  }
};

/**
 * Get user by ID with full details
 * GET /api/admin/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -otp -twoFactorSecret -backupCodes')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const stats = await userManagementService.getUserStatistics(id);

    res.status(200).json({
      success: true,
      user,
      stats
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      details: error.message 
    });
  }
};

/**
 * Disable user account
 * PATCH /api/admin/users/:id/disable
 */
exports.disableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    const user = await userManagementService.disableUserAccount(
      id, 
      adminId, 
      reason, 
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'User account disabled successfully',
      user
    });
  } catch (error) {
    console.error('Disable user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Account is already disabled') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Failed to disable user account',
      details: error.message 
    });
  }
};

/**
 * Enable user account
 * PATCH /api/admin/users/:id/enable
 */
exports.enableUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    const user = await userManagementService.enableUserAccount(
      id, 
      adminId, 
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: 'User account enabled successfully',
      user
    });
  } catch (error) {
    console.error('Enable user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Account is already enabled') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Failed to enable user account',
      details: error.message 
    });
  }
};

/**
 * Delete user account permanently
 * DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    const result = await userManagementService.deleteUserAccount(
      id, 
      adminId, 
      reason, 
      ipAddress
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ 
      error: 'Failed to delete user account',
      details: error.message 
    });
  }
};

/**
 * Get user activity history
 * GET /api/admin/users/:id/activity?page=1&limit=50&actionType=user_modified
 */
exports.getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, actionType, startDate, endDate } = req.query;

    // Verify user exists
    const user = await User.findById(id).select('_id');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    };

    if (actionType) options.actionType = actionType;
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;

    const result = await userManagementService.getUserActivity(id, options);

    res.status(200).json({
      success: true,
      userId: id,
      ...result
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ 
      error: 'Failed to get user activity',
      details: error.message 
    });
  }
};

module.exports = exports;
