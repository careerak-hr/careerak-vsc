const { Individual } = require('../models/User');
const profileCompletionService = require('./profileCompletionService');

/**
 * Update the "About Me" (bio) section of the user profile.
 * Requirements: 6.1, 6.2 (Backend part)
 */
const updateAbout = async (userId, bio) => {
  const user = await Individual.findByIdAndUpdate(
    userId,
    { bio },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  // Recalculate completion after update
  const completion = await profileCompletionService.calculateCompletion(userId);

  return {
    bio: user.bio,
    completion
  };
};

module.exports = {
  updateAbout
};
