const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  platform: {
    type: String,
    enum: ['linkedin', 'github', 'behance', 'dribbble', 'twitter', 'website', 'youtube', 'medium'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure unique platform per user
socialLinkSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('SocialLink', socialLinkSchema);
