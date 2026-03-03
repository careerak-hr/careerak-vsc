const savedSearchService = require('../services/savedSearchService');

/**
 * إنشاء عملية بحث محفوظة جديدة
 * POST /api/search/saved
 */
exports.createSavedSearch = async (req, res) => {
  try {
    const userId = req.user._id;
    const searchData = req.body;

    // التحقق من البيانات المطلوبة
    if (!searchData.name || !searchData.searchType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name and searchType are required'
        }
      });
    }

    // التحقق من الحد الأقصى
    const canAdd = await savedSearchService.canAddMore(userId);
    if (!canAdd) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LIMIT_EXCEEDED',
          message: 'Maximum 10 saved searches allowed per user'
        }
      });
    }

    const savedSearch = await savedSearchService.create(userId, searchData);

    res.status(201).json({
      success: true,
      data: savedSearch
    });
  } catch (error) {
    console.error('Error creating saved search:', error);
    
    if (error.name === 'ValidationError' && error.message.includes('Maximum 10')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LIMIT_EXCEEDED',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create saved search'
      }
    });
  }
};

/**
 * جلب جميع عمليات البحث المحفوظة
 * GET /api/search/saved
 */
exports.getSavedSearches = async (req, res) => {
  try {
    const userId = req.user._id;
    const savedSearches = await savedSearchService.getAll(userId);

    res.status(200).json({
      success: true,
      data: {
        savedSearches,
        count: savedSearches.length,
        limit: 10
      }
    });
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch saved searches'
      }
    });
  }
};

/**
 * جلب عملية بحث محفوظة واحدة
 * GET /api/search/saved/:id
 */
exports.getSavedSearchById = async (req, res) => {
  try {
    const userId = req.user._id;
    const searchId = req.params.id;

    const savedSearch = await savedSearchService.getById(userId, searchId);

    res.status(200).json({
      success: true,
      data: savedSearch
    });
  } catch (error) {
    console.error('Error fetching saved search:', error);
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch saved search'
      }
    });
  }
};

/**
 * تحديث عملية بحث محفوظة
 * PUT /api/search/saved/:id
 */
exports.updateSavedSearch = async (req, res) => {
  try {
    const userId = req.user._id;
    const searchId = req.params.id;
    const updateData = req.body;

    const savedSearch = await savedSearchService.update(userId, searchId, updateData);

    res.status(200).json({
      success: true,
      data: savedSearch
    });
  } catch (error) {
    console.error('Error updating saved search:', error);
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update saved search'
      }
    });
  }
};

/**
 * حذف عملية بحث محفوظة
 * DELETE /api/search/saved/:id
 */
exports.deleteSavedSearch = async (req, res) => {
  try {
    const userId = req.user._id;
    const searchId = req.params.id;

    const result = await savedSearchService.delete(userId, searchId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete saved search'
      }
    });
  }
};

/**
 * التحقق من إمكانية إضافة عملية بحث جديدة
 * GET /api/search/saved/check-limit
 */
exports.checkLimit = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await savedSearchService.count(userId);
    const canAdd = count < 10;

    res.status(200).json({
      success: true,
      data: {
        count,
        limit: 10,
        canAdd,
        remaining: 10 - count
      }
    });
  } catch (error) {
    console.error('Error checking saved search limit:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to check limit'
      }
    });
  }
};
