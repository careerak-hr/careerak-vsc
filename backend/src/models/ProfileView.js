const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  profileUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  viewerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  viewerType: {
    type: String,
    enum: ['company', 'user', 'anonymous'],
    default: 'anonymous'
  },
  viewerCompanyName: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  duration: Number, // Duration in seconds
  sectionsViewed: [String],
  deviceType: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet']
  }
}, { timestamps: true });

module.exports = mongoose.model('ProfileView', profileViewSchema);
