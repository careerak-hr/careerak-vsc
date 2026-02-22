const express = require('express');
const router = express.Router();
const errorLogController = require('../controllers/errorLogController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Error Log Routes
 * 
 * Requirements:
 * - FR-ERR-3: Log error details (component, stack trace, timestamp)
 * - Task 9.1.4: Integrate error logging with backend
 * 
 * Routes:
 * - POST   /api/errors              - Log an error (authenticated users)
 * - GET    /api/errors              - Get error logs (admin only)
 * - GET    /api/errors/statistics   - Get error statistics (admin only)
 * - GET    /api/errors/:id          - Get single error log (admin only)
 * - PATCH  /api/errors/:id          - Update error status (admin only)
 * - DELETE /api/errors/:id          - Delete error log (admin only)
 */

// Public route - log error (requires authentication but not admin)
router.post('/', protect, errorLogController.logError);

// Admin routes - manage error logs
router.get('/', protect, authorize('admin'), errorLogController.getErrors);
router.get('/statistics', protect, authorize('admin'), errorLogController.getStatistics);
router.get('/:id', protect, authorize('admin'), errorLogController.getError);
router.patch('/:id', protect, authorize('admin'), errorLogController.updateErrorStatus);
router.delete('/:id', protect, authorize('admin'), errorLogController.deleteError);

module.exports = router;
