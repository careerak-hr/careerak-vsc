/**
 * Wishlist Routes
 * Defines all routes for wishlist management
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const notesSchema = Joi.object({
  notes: Joi.string().max(500).allow('').optional()
    .messages({
      'string.max': 'الملاحظات يجب ألا تتجاوز 500 حرف'
    })
});

// All wishlist routes require authentication
router.use(protect);

/**
 * GET /wishlist
 * Get user's wishlist with populated course details
 */
router.get('/', wishlistController.getWishlist);

/**
 * POST /wishlist/:courseId
 * Add a course to user's wishlist
 */
router.post('/:courseId', wishlistController.addToWishlist);

/**
 * DELETE /wishlist/:courseId
 * Remove a course from user's wishlist
 */
router.delete('/:courseId', wishlistController.removeFromWishlist);

/**
 * POST /wishlist/:courseId/notes
 * Update notes for a wishlisted course
 */
router.post('/:courseId/notes', validate(notesSchema), wishlistController.updateWishlistNotes);

module.exports = router;
