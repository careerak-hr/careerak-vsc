const { User, Individual, Company } = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');
const Review = require('../models/Review');

/**
 * Enhanced User Management Service
 * Provides comprehensive user management functionality for admin dashboard
 */

/**
 * Search users with multi-field search
 * Searches across: name, email, username, phone
 * @param {string} query - Search query
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Search results with pagination
 */
exports.searchUsers = async (query, options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Build search conditions for multiple fields
    const searchConditions = [];

    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i');
      
      searchConditions.push(
        { email: searchRegex },
        { phone: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { companyName: searchRegex }
      );
    }

    const searchQuery = searchConditions.length > 0 
      ? { $or: searchConditions }
      : {};

    // Execute search with pagination
    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('-password -otp -twoFactorSecret -backupCodes')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(searchQuery)
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    };
  } catch (error) {
    console.error('Search users error:', error);
    throw new Error('Failed to search users');
  }
};

/**
 * Filter users with multiple criteria
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Filtered results with pagination
 */
exports.filterUsers = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Build filter query
    const query = {};

    // Filter by user type (role)
    if (filters.type) {
      if (filters.type === 'Employee' || filters.type === 'HR') {
        query.userType = filters.type;
      } else if (filters.type === 'Admin') {
        query.role = 'Admin';
      }
    }

    // Filter by verification status
    if (filters.isVerified !== undefined) {
      query.isVerified = filters.isVerified === 'true' || filters.isVerified === true;
    }

    // Filter by email verification status
    if (filters.emailVerified !== undefined) {
      query.emailVerified = filters.emailVerified === 'true' || filters.emailVerified === true;
    }

    // Filter by registration date range
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Filter by country
    if (filters.country) {
      query.country = filters.country;
    }

    // Filter by special needs
    if (filters.isSpecialNeeds !== undefined) {
      query.isSpecialNeeds = filters.isSpecialNeeds === 'true' || filters.isSpecialNeeds === true;
    }

    // Filter by 2FA status
    if (filters.twoFactorEnabled !== undefined) {
      query.twoFactorEnabled = filters.twoFactorEnabled === 'true' || filters.twoFactorEnabled === true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -otp -twoFactorSecret -backupCodes')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users,
      filters: filters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    };
  } catch (error) {
    console.error('Filter users error:', error);
    throw new Error('Failed to filter users');
  }
};

/**
 * Disable user account (prevents login)
 * @param {string} userId - User ID to disable
 * @param {string} adminId - Admin performing the action
 * @param {string} reason - Reason for disabling
 * @param {string} ipAddress - IP address of admin
 * @returns {Promise<Object>} Updated user
 */
exports.disableUserAccount = async (userId, adminId, reason, ipAddress) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already disabled
    if (user.accountDisabled) {
      throw new Error('Account is already disabled');
    }

    // Disable account
    user.accountDisabled = true;
    user.accountDisabledAt = new Date();
    user.accountDisabledReason = reason;
    user.accountDisabledBy = adminId;
    
    await user.save();

    // Get admin info for activity log
    const admin = await User.findById(adminId).select('firstName lastName email');
    const adminName = admin ? 
      (admin.firstName ? `${admin.firstName} ${admin.lastName}` : admin.email) : 
      'Admin';

    // Log activity
    await ActivityLog.create({
      timestamp: new Date(),
      actorId: adminId,
      actorName: adminName,
      actionType: 'user_modified',
      targetType: 'User',
      targetId: userId,
      details: `Account disabled: ${reason}`,
      ipAddress: ipAddress,
      metadata: {
        action: 'disable_account',
        reason: reason,
        userEmail: user.email,
        userType: user.userType || user.role
      }
    });

    // Return sanitized user
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.otp;
    delete sanitizedUser.twoFactorSecret;
    delete sanitizedUser.backupCodes;

    return sanitizedUser;
  } catch (error) {
    console.error('Disable user account error:', error);
    throw error;
  }
};

/**
 * Enable user account (restores login access)
 * @param {string} userId - User ID to enable
 * @param {string} adminId - Admin performing the action
 * @param {string} ipAddress - IP address of admin
 * @returns {Promise<Object>} Updated user
 */
exports.enableUserAccount = async (userId, adminId, ipAddress) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if already enabled
    if (!user.accountDisabled) {
      throw new Error('Account is already enabled');
    }

    // Enable account
    user.accountDisabled = false;
    user.accountDisabledAt = undefined;
    user.accountDisabledReason = undefined;
    user.accountDisabledBy = undefined;
    
    await user.save();

    // Get admin info for activity log
    const admin = await User.findById(adminId).select('firstName lastName email');
    const adminName = admin ? 
      (admin.firstName ? `${admin.firstName} ${admin.lastName}` : admin.email) : 
      'Admin';

    // Log activity
    await ActivityLog.create({
      timestamp: new Date(),
      actorId: adminId,
      actorName: adminName,
      actionType: 'user_modified',
      targetType: 'User',
      targetId: userId,
      details: 'Account enabled',
      ipAddress: ipAddress,
      metadata: {
        action: 'enable_account',
        userEmail: user.email,
        userType: user.userType || user.role
      }
    });

    // Return sanitized user
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.otp;
    delete sanitizedUser.twoFactorSecret;
    delete sanitizedUser.backupCodes;

    return sanitizedUser;
  } catch (error) {
    console.error('Enable user account error:', error);
    throw error;
  }
};

/**
 * Delete user account permanently
 * Removes all user data and creates activity log
 * @param {string} userId - User ID to delete
 * @param {string} adminId - Admin performing the action
 * @param {string} reason - Reason for deletion
 * @param {string} ipAddress - IP address of admin
 * @returns {Promise<Object>} Deletion result
 */
exports.deleteUserAccount = async (userId, adminId, reason, ipAddress) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Store user info before deletion
    const userInfo = {
      email: user.email,
      phone: user.phone,
      userType: user.userType || user.role,
      name: user.firstName ? `${user.firstName} ${user.lastName}` : user.companyName
    };

    // Get admin info for activity log
    const admin = await User.findById(adminId).select('firstName lastName email');
    const adminName = admin ? 
      (admin.firstName ? `${admin.firstName} ${admin.lastName}` : admin.email) : 
      'Admin';

    // Delete related data
    await Promise.all([
      // Delete job applications
      JobApplication.deleteMany({ applicantId: userId }),
      // Delete job postings (if HR)
      JobPosting.deleteMany({ companyId: userId }),
      // Delete reviews (as reviewer or reviewee)
      Review.deleteMany({ $or: [{ reviewerId: userId }, { revieweeId: userId }] })
    ]);

    // Log activity BEFORE deleting user
    await ActivityLog.create({
      timestamp: new Date(),
      actorId: adminId,
      actorName: adminName,
      actionType: 'content_deleted',
      targetType: 'User',
      targetId: userId,
      details: `User account deleted: ${reason}`,
      ipAddress: ipAddress,
      metadata: {
        action: 'delete_account',
        reason: reason,
        userEmail: userInfo.email,
        userPhone: userInfo.phone,
        userType: userInfo.userType,
        userName: userInfo.name
      }
    });

    // Delete user
    await User.findByIdAndDelete(userId);

    return {
      success: true,
      message: 'User account deleted successfully',
      deletedUser: userInfo
    };
  } catch (error) {
    console.error('Delete user account error:', error);
    throw error;
  }
};

/**
 * Get user activity history
 * @param {string} userId - User ID
 * @param {Object} options - Pagination and filter options
 * @returns {Promise<Object>} Activity history with pagination
 */
exports.getUserActivity = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 50, actionType, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query = { actorId: userId };

    // Filter by action type
    if (actionType) {
      query.actionType = actionType;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query)
    ]);

    return {
      activities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + activities.length < total
      }
    };
  } catch (error) {
    console.error('Get user activity error:', error);
    throw new Error('Failed to get user activity');
  }
};

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
exports.getUserStatistics = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -otp -twoFactorSecret -backupCodes');
    
    if (!user) {
      throw new Error('User not found');
    }

    const stats = {
      accountInfo: {
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        accountDisabled: user.accountDisabled || false
      },
      reviewStats: user.reviewStats || {
        averageRating: 0,
        totalReviews: 0
      }
    };

    // Get activity count
    stats.activityCount = await ActivityLog.countDocuments({ actorId: userId });

    // Get type-specific stats
    if (user.userType === 'Employee' || user.role === 'Employee') {
      // Job applications count
      stats.applicationsCount = await JobApplication.countDocuments({ applicantId: userId });
      
      // Applications by status
      const applicationsByStatus = await JobApplication.aggregate([
        { $match: { applicantId: user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      stats.applicationsByStatus = applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
    } else if (user.userType === 'HR' || user.role === 'HR') {
      // Job postings count
      stats.jobPostingsCount = await JobPosting.countDocuments({ companyId: userId });
      
      // Applications received count
      const jobIds = await JobPosting.find({ companyId: userId }).distinct('_id');
      stats.applicationsReceivedCount = await JobApplication.countDocuments({ jobId: { $in: jobIds } });
    }

    return stats;
  } catch (error) {
    console.error('Get user statistics error:', error);
    throw new Error('Failed to get user statistics');
  }
};

module.exports = exports;
