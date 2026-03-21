const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['monthly', 'yearly', 'alltime'],
    required: true
  },
  referralCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index: userId + period unique
leaderboardSchema.index({ userId: 1, period: 1 }, { unique: true });
leaderboardSchema.index({ period: 1, rank: 1 });
leaderboardSchema.index({ period: 1, totalPoints: -1, referralCount: -1 });

module.exports = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);
