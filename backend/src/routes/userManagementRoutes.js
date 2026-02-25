const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const { auth, checkRole } = require('../middleware/auth');

/**
 * User Management Routes
 * All routes require admin authentication
 */

// Middleware: Require admin role for all routes
router.use(auth);
router.use(checkRole('Admin'));

/**
 * @route   GET /api/admin/users/search
 * @desc    Search users with multi-field search
 * @access  Admin only
 * @query   q - Search query (required)
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 20)
 */
router.get('/search', userManagementController.searchUsers);

/**
 * @route   GET /api/admin/users
 * @desc    Get users with filters
 * @access  Admin only
 * @query   type - User type (Employee, HR, Admin)
 * @query   isVerified - Verification status (true/false)
 * @query   emailVerified - Email verification status (true/false)
 * @query   startDate - Registration start date
 * @query   endDate - Registration end date
 * @query   country - Country filter
 * @query   isSpecialNeeds - Special needs status (true/false)
 * @query   twoFactorEnabled - 2FA status (true/false)
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 20)
 * @query   sortBy - Sort field (default: createdAt)
 * @query   sortOrder - Sort order (asc/desc, default: desc)
 */
router.get('/', userManagementController.getUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with full details and statistics
 * @access  Admin only
 */
router.get('/:id', userManagementController.getUserById);

/**
 * @route   PATCH /api/admin/users/:id/disable
 * @desc    Disable user account (prevents login)
 * @access  Admin only
 * @body    reason - Reason for disabling (required)
 */
router.patch('/:id/disable', userManagementController.disableUser);

/**
 * @route   PATCH /api/admin/users/:id/enable
 * @desc    Enable user account (restores login access)
 * @access  Admin only
 */
router.patch('/:id/enable', userManagementController.enableUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account permanently
 * @access  Admin only
 * @body    reason - Reason for deletion (required)
 */
router.delete('/:id', userManagementController.deleteUser);

/**
 * @route   GET /api/admin/users/:id/activity
 * @desc    Get user activity history
 * @access  Admin only
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 50)
 * @query   actionType - Filter by action type
 * @query   startDate - Activity start date
 * @query   endDate - Activity end date
 */
router.get('/:id/activity', userManagementController.getUserActivity);

module.exports = router;
