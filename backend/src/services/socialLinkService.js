const SocialLink = require('../models/SocialLink');
const validator = require('validator');

/**
 * Social Links Service
 * Requirements: 5.1, 5.2, 5.3
 */

const addOrUpdateSocialLink = async (userId, platform, url) => {
  // 1. Validate URL
  if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
    throw new Error('رابط غير صالح. يجب أن يبدأ بـ http:// أو https://');
  }

  // 2. Add or Update (Upsert)
  return await SocialLink.findOneAndUpdate(
    { userId, platform },
    { url, isVisible: true },
    { upsert: true, new: true, runValidators: true }
  );
};

const getUserSocialLinks = async (userId) => {
  return await SocialLink.find({ userId }).sort({ order: 1 });
};

const deleteSocialLink = async (userId, linkId) => {
  return await SocialLink.findOneAndDelete({ _id: linkId, userId });
};

const toggleVisibility = async (userId, linkId, isVisible) => {
  return await SocialLink.findOneAndUpdate(
    { _id: linkId, userId },
    { isVisible },
    { new: true }
  );
};

module.exports = {
  addOrUpdateSocialLink,
  getUserSocialLinks,
  deleteSocialLink,
  toggleVisibility
};
