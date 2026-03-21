const mongoose = require('mongoose');

/**
 * ShareFeedback - stores user feedback after a share action
 * Task 9.10: Gather user feedback on the content sharing feature
 */
const shareFeedbackSchema = new mongoose.Schema({
  // The share event this feedback relates to (optional - user may not always have a shareId)
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Share'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Content that was shared
  contentType: {
    type: String,
    enum: ['job', 'course', 'profile', 'company'],
    required: [true, 'contentType is required']
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'contentId is required']
  },
  // Share method used
  shareMethod: {
    type: String,
    enum: ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email', 'copy_link', 'internal_chat', 'native'],
    required: [true, 'shareMethod is required']
  },
  // Rating: 1-5 stars
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'rating is required']
  },
  // Optional free-text comment
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  // Was the sharing experience easy?
  wasEasy: {
    type: Boolean
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
shareFeedbackSchema.index({ contentType: 1, contentId: 1 });
shareFeedbackSchema.index({ userId: 1, createdAt: -1 });
shareFeedbackSchema.index({ shareMethod: 1 });
shareFeedbackSchema.index({ rating: 1 });

/**
 * Get average rating for a content item
 */
shareFeedbackSchema.statics.getAverageRating = function (contentType, contentId) {
  return this.aggregate([
    { $match: { contentType, contentId: new mongoose.Types.ObjectId(contentId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
};

/**
 * Get average rating by share method
 */
shareFeedbackSchema.statics.getAverageRatingByMethod = function () {
  return this.aggregate([
    { $group: { _id: '$shareMethod', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $sort: { avgRating: -1 } }
  ]);
};

module.exports = mongoose.model('ShareFeedback', shareFeedbackSchema);
