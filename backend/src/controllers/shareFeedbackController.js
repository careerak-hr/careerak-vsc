const ShareFeedback = require('../models/ShareFeedback');

/**
 * Submit feedback after a share action
 * POST /api/share-feedback
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { shareId, contentType, contentId, shareMethod, rating, comment, wasEasy } = req.body;
    const userId = req.user?.id;

    if (!contentType || !contentId || !shareMethod || !rating) {
      return res.status(400).json({
        success: false,
        error: 'contentType, contentId, shareMethod, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'rating must be between 1 and 5'
      });
    }

    const feedback = await ShareFeedback.create({
      shareId: shareId || undefined,
      userId: userId || undefined,
      contentType,
      contentId,
      shareMethod,
      rating,
      comment: comment || undefined,
      wasEasy: wasEasy !== undefined ? wasEasy : undefined
    });

    return res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get feedback summary (admin)
 * GET /api/share-feedback/summary
 */
exports.getFeedbackSummary = async (req, res) => {
  try {
    const [avgByMethod, ratingDistribution, totalCount, recentComments] = await Promise.all([
      ShareFeedback.getAverageRatingByMethod(),
      ShareFeedback.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      ShareFeedback.countDocuments(),
      ShareFeedback.find({ comment: { $exists: true, $ne: '' } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('contentType shareMethod rating comment createdAt')
    ]);

    const overallAvg = await ShareFeedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalFeedback: totalCount,
        overallAverageRating: overallAvg[0]?.avgRating || 0,
        averageRatingByMethod: avgByMethod,
        ratingDistribution,
        recentComments
      }
    });
  } catch (error) {
    console.error('Error in getFeedbackSummary:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all feedback (admin, paginated)
 * GET /api/share-feedback
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.shareMethod) filter.shareMethod = req.query.shareMethod;
    if (req.query.contentType) filter.contentType = req.query.contentType;
    if (req.query.rating) filter.rating = parseInt(req.query.rating);

    const [feedback, total] = await Promise.all([
      ShareFeedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      ShareFeedback.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: feedback,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error in getAllFeedback:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
