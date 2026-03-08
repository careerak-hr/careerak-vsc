const profileCompletionService = require('../services/profileCompletionService');
const suggestionsService = require('../services/suggestionsService');
const profileService = require('../services/profileService');
const profilePreviewService = require('../services/profilePreviewService');

/**
 * Get profile completion data
 * GET /api/profile/completion
 */
exports.getProfileCompletion = async (req, res) => {
  try {
    const userId = req.user.id;
    const completionData = await profileCompletionService.calculateCompletion(userId);

    if (!completionData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: completionData
    });
  } catch (error) {
    console.error('Error fetching profile completion:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get profile suggestions
 * GET /api/profile/suggestions
 */
exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const suggestions = await suggestionsService.generateSuggestions(userId);

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Mark a suggestion as complete
 * POST /api/profile/suggestions/:id/complete
 */
exports.markSuggestionComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: suggestionId } = req.params;

    const result = await suggestionsService.markSuggestionComplete(userId, suggestionId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Suggestion marked as complete'
    });
  } catch (error) {
    console.error('Error completing suggestion:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update about section (bio)
 * PUT /api/profile/about
 */
exports.updateAbout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio } = req.body;

    const result = await profileService.updateAbout(userId, bio);

    res.status(200).json({
      success: true,
      data: result,
      message: 'About section updated successfully'
    });
  } catch (error) {
    console.error('Error updating about section:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get profile preview data (employer view)
 * GET /api/profile/preview
 */
exports.getProfilePreview = async (req, res) => {
  try {
    const userId = req.user.id;
    const previewData = await profilePreviewService.getProfilePreview(userId);

    if (!previewData) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: previewData
    });
  } catch (error) {
    console.error('Error getting profile preview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
