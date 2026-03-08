const PortfolioItem = require('../models/PortfolioItem');
const { uploadImage, getOptimizedUrl } = require('../config/cloudinary');

/**
 * Portfolio Service - Manage portfolio items and file uploads
 * Requirements: 5.1
 */

const addPortfolioItem = async (userId, itemData, file) => {
  let fileUrl = itemData.externalLink;
  let publicId = null;
  let thumbnailUrl = null;

  if (file) {
    // 1. Upload to Cloudinary
    const uploadResult = await uploadImage(file.buffer, {
      folder: `careerak/portfolios/${userId}`,
      tags: ['portfolio', userId]
    });

    fileUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;

    // 2. Generate thumbnail if it's an image
    if (file.mimetype.startsWith('image/')) {
      thumbnailUrl = getOptimizedUrl(publicId, { width: 400, height: 300, crop: 'fill' });
    }
  }

  const newItem = new PortfolioItem({
    userId,
    title: itemData.title,
    description: itemData.description,
    category: itemData.category,
    type: file ? (file.mimetype.includes('pdf') ? 'pdf' : 'image') : 'link',
    fileUrl,
    publicId,
    thumbnailUrl,
    externalLink: itemData.externalLink,
    date: itemData.date || new Date(),
    tags: itemData.tags
  });

  return await newItem.save();
};

const getUserPortfolio = async (userId) => {
  return await PortfolioItem.find({ userId }).sort({ order: 1, createdAt: -1 });
};

const deletePortfolioItem = async (userId, itemId) => {
  const item = await PortfolioItem.findOne({ _id: itemId, userId });
  if (!item) throw new Error('Item not found or unauthorized');

  // Delete from Cloudinary if needed
  if (item.publicId) {
    const cloudinary = require('../config/cloudinary');
    await cloudinary.uploader.destroy(item.publicId);
  }

  return await PortfolioItem.findByIdAndDelete(itemId);
};

module.exports = {
  addPortfolioItem,
  getUserPortfolio,
  deletePortfolioItem
};
