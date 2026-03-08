const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['design', 'development', 'writing', 'marketing', 'other'],
    default: 'other'
  },
  type: {
    type: String,
    enum: ['image', 'link', 'pdf'],
    required: true
  },
  fileUrl: String,        // Cloudinary URL
  publicId: String,       // Cloudinary Public ID for deletion
  thumbnailUrl: String,   // for images
  externalLink: String,   // for links
  date: Date,
  tags: [String],
  order: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PortfolioItem', portfolioItemSchema);
