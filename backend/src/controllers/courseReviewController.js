const Review = require('../models/Review');
const EducationalCourse = require('../models/EducationalCourse');
const CourseEnrollment = require('../models/CourseEnrollment');
const notificationService = require('../services/notificationService');
const BadgeService = require('../services/badgeService');
const logger = require('../utils/logger');

const badgeService = new BadgeService(EducationalCourse);

/**
 * Create a new course review
 * POST /courses/:id/reviews
 * Requirements: 3.5, 3.6, 11.1
 */
exports.createCourseReview = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.user._id;
    const {
      rating,
      detailedRatings,
      comment,
      title,
      pros,
      cons,
      wouldRecommend,
      isAnonymous
    } = req.body;

    // Verify course exists
    const course = await EducationalCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify user is enrolled
    const enrollment = await CourseEnrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to leave a review'
      });
    }

    // Check enrollment progress >= 50%
    if (enrollment.progress.percentageComplete < 50) {
      return res.status(403).json({
        success: false,
        message: `You must complete at least 50% of the course to leave a review. Current progress: ${enrollment.progress.percentageComplete}%`
      });
    }

    // Check if user already reviewed this course
    const existingReview = await Review.findOne({
      reviewType: 'course_review',
      reviewer: userId,
      'relatedData.course': courseId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this course. You can edit your existing review instead.'
      });
    }

    // Create review using existing Review model with reviewType: 'course_review'
    const review = await Review.create({
      reviewType: 'course_review',
      reviewer: userId,
      reviewee: course.instructor, // The instructor receives the review
      rating,
      detailedRatings: {
        contentQuality: detailedRatings?.contentQuality,
        instructorEffectiveness: detailedRatings?.instructorEffectiveness,
        valueForMoney: detailedRatings?.valueForMoney,
        practicalApplication: detailedRatings?.practicalApplication
      },
      comment,
      title,
      pros,
      cons,
      wouldRecommend,
      isAnonymous: isAnonymous || false,
      status: 'approved', // Auto-approve course reviews
      relatedData: {
        course: courseId,
        enrollment: enrollment._id,
        completionStatus: enrollment.status
      }
    });

    // Update course stats
    await updateCourseRatingStats(courseId);

    // Run badgeService.updateCourseBadges() to update badges
    try {
      await badgeService.updateCourseBadges(courseId);
    } catch (badgeError) {
      logger.error('Error updating course badges:', badgeError);
      // Don't fail the request if badge update fails
    }

    // Send notification to instructor
    try {
      const reviewerName = isAnonymous ? 'مستخدم مجهول' : `${req.user.firstName} ${req.user.lastName}`;
      await notificationService.createNotification({
        recipient: course.instructor,
        type: 'course_review',
        title: 'مراجعة جديدة على دورتك! ⭐',
        message: `${reviewerName} ترك مراجعة ${rating} نجوم على دورة "${course.title}"`,
        relatedData: {
          course: courseId,
          review: review._id,
          rating
        },
        priority: 'medium'
      });
    } catch (notifError) {
      logger.error('Error sending notification:', notifError);
      // Don't fail the request if notification fails
    }

    // Populate reviewer info for response
    await review.populate('reviewer', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });

  } catch (error) {
    logger.error('Error creating course review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

/**
 * Helper function to update course rating statistics
 * @param {String} courseId - Course ID
 */
async function updateCourseRatingStats(courseId) {
  try {
    const reviews = await Review.find({
      reviewType: 'course_review',
      'relatedData.course': courseId,
      status: 'approved'
    });

    if (reviews.length === 0) {
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update course stats
    await EducationalCourse.findByIdAndUpdate(courseId, {
      'stats.averageRating': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'stats.totalReviews': reviews.length
    });

    logger.info(`Updated rating stats for course ${courseId}: ${averageRating} (${reviews.length} reviews)`);
  } catch (error) {
    logger.error('Error updating course rating stats:', error);
    throw error;
  }
}

module.exports = {
  createCourseReview,
  updateCourseRatingStats
};

/**
 * Get all reviews for a course
 * GET /courses/:id/reviews
 * Requirements: 3.4, 3.7, 3.8
 */
exports.getCourseReviews = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify course exists
    const course = await EducationalCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all approved reviews for course
    // Sort by helpfulCount descending (most helpful first)
    const reviews = await Review.find({
      reviewType: 'course_review',
      'relatedData.course': courseId,
      status: 'approved'
    })
      .sort({ helpfulCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('reviewer', 'firstName lastName profilePicture') // Populate reviewer info (if not anonymous)
      .lean();

    // Include completion status and handle anonymous reviews
    const reviewsWithDetails = reviews.map(review => {
      // Hide reviewer info if anonymous
      if (review.isAnonymous) {
        review.reviewer = {
          firstName: 'مستخدم',
          lastName: 'مجهول',
          profilePicture: null
        };
      }

      // Add completion status from relatedData
      review.completionStatus = review.relatedData?.completionStatus || 'unknown';

      return review;
    });

    // Get total count for pagination
    const total = await Review.countDocuments({
      reviewType: 'course_review',
      'relatedData.course': courseId,
      status: 'approved'
    });

    res.status(200).json({
      success: true,
      reviews: reviewsWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Error getting course reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reviews',
      error: error.message
    });
  }
};

/**
 * Get review statistics for a course
 * GET /courses/:id/reviews/stats
 * Requirements: 3.1, 3.2, 3.3
 */
exports.getCourseReviewStats = async (req, res) => {
  try {
    const { id: courseId } = req.params;

    // Verify course exists
    const course = await EducationalCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get all approved reviews
    const reviews = await Review.find({
      reviewType: 'course_review',
      'relatedData.course': courseId,
      status: 'approved'
    });

    // Calculate average rating
    const totalReviews = reviews.length;
    let averageRating = 0;

    if (totalReviews > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = Math.round((totalRating / totalReviews) * 10) / 10;
    }

    // Calculate rating distribution (1-5 stars)
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    reviews.forEach(review => {
      const roundedRating = Math.round(review.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        ratingDistribution[roundedRating]++;
      }
    });

    // Calculate percentage for each rating
    const ratingDistributionPercentage = {};
    Object.keys(ratingDistribution).forEach(rating => {
      ratingDistributionPercentage[rating] = totalReviews > 0
        ? Math.round((ratingDistribution[rating] / totalReviews) * 100)
        : 0;
    });

    // Return course completion rate from course stats
    const completionRate = course.stats.completionRate || 0;

    res.status(200).json({
      success: true,
      stats: {
        averageRating,
        totalReviews,
        ratingDistribution,
        ratingDistributionPercentage,
        completionRate
      }
    });

  } catch (error) {
    logger.error('Error getting course review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review statistics',
      error: error.message
    });
  }
};

/**
 * Update a course review
 * PUT /courses/:id/reviews/:reviewId
 * Requirements: 3.6
 */
exports.updateCourseReview = async (req, res) => {
  try {
    const { id: courseId, reviewId } = req.params;
    const userId = req.user._id;
    const {
      rating,
      detailedRatings,
      comment,
      title,
      pros,
      cons,
      wouldRecommend
    } = req.body;

    // Find the review
    const review = await Review.findOne({
      _id: reviewId,
      reviewType: 'course_review',
      'relatedData.course': courseId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify review ownership
    if (review.reviewer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews'
      });
    }

    // Check edit window (24 hours)
    if (!review.canEdit()) {
      return res.status(403).json({
        success: false,
        message: 'Review can only be edited within 24 hours of creation and up to 3 times'
      });
    }

    // Store old rating to check if it changed significantly
    const oldRating = review.rating;

    // Update review fields
    if (rating !== undefined) review.rating = rating;
    if (detailedRatings) {
      review.detailedRatings = {
        contentQuality: detailedRatings.contentQuality,
        instructorEffectiveness: detailedRatings.instructorEffectiveness,
        valueForMoney: detailedRatings.valueForMoney,
        practicalApplication: detailedRatings.practicalApplication
      };
    }
    if (comment !== undefined) review.comment = comment;
    if (title !== undefined) review.title = title;
    if (pros !== undefined) review.pros = pros;
    if (cons !== undefined) review.cons = cons;
    if (wouldRecommend !== undefined) review.wouldRecommend = wouldRecommend;

    // Update metadata
    review.metadata = review.metadata || {};
    review.metadata.editedAt = new Date();
    review.metadata.editCount = (review.metadata.editCount || 0) + 1;

    await review.save();

    // Recalculate course.stats.averageRating
    await updateCourseRatingStats(courseId);

    // Update badges if rating changed significantly (>= 0.5 stars)
    const ratingChange = Math.abs(review.rating - oldRating);
    if (ratingChange >= 0.5) {
      try {
        await badgeService.updateCourseBadges(courseId);
      } catch (badgeError) {
        logger.error('Error updating course badges:', badgeError);
      }
    }

    // Populate reviewer info for response
    await review.populate('reviewer', 'firstName lastName profilePicture');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    logger.error('Error updating course review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

/**
 * Mark a review as helpful or not helpful
 * POST /courses/:id/reviews/:reviewId/helpful
 * Requirements: 3.7
 */
exports.markReviewHelpful = async (req, res) => {
  try {
    const { id: courseId, reviewId } = req.params;
    const userId = req.user._id;
    const { isHelpful } = req.body; // true for helpful, false for not helpful

    // Find the review
    const review = await Review.findOne({
      _id: reviewId,
      reviewType: 'course_review',
      'relatedData.course': courseId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Use existing Review model markHelpful() method
    await review.markHelpful(userId, isHelpful);

    res.status(200).json({
      success: true,
      message: isHelpful ? 'Review marked as helpful' : 'Review marked as not helpful',
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount
    });

  } catch (error) {
    logger.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review',
      error: error.message
    });
  }
};

/**
 * Add instructor response to a review
 * POST /courses/:id/reviews/:reviewId/response
 * Requirements: 11.1
 */
exports.addReviewResponse = async (req, res) => {
  try {
    const { id: courseId, reviewId } = req.params;
    const userId = req.user._id;
    const { responseText } = req.body;

    if (!responseText || responseText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    // Verify course exists and user is the instructor
    const course = await EducationalCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the course instructor can respond to reviews'
      });
    }

    // Find the review
    const review = await Review.findOne({
      _id: reviewId,
      reviewType: 'course_review',
      'relatedData.course': courseId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if response already exists
    if (review.response && review.response.text) {
      return res.status(400).json({
        success: false,
        message: 'A response has already been added to this review'
      });
    }

    // Add response using Review model method
    await review.addResponse(responseText);

    // Send notification to reviewer
    try {
      await notificationService.createNotification({
        recipient: review.reviewer,
        type: 'review_response',
        title: 'المدرب رد على مراجعتك! 💬',
        message: `رد المدرب على مراجعتك لدورة "${course.title}"`,
        relatedData: {
          course: courseId,
          review: review._id
        },
        priority: 'medium'
      });
    } catch (notifError) {
      logger.error('Error sending notification:', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      response: review.response
    });

  } catch (error) {
    logger.error('Error adding review response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
};
