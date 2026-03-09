/**
 * SettingsService Usage Examples
 * 
 * أمثلة عملية لاستخدام SettingsService في Controllers
 */

const settingsService = require('../services/settingsService');

// ==================== Example 1: Update Profile in Controller ====================

/**
 * مثال: تحديث الملف الشخصي في Controller
 */
async function updateProfileController(req, res) {
  try {
    const userId = req.user._id; // من authentication middleware
    const { name, phone, country, city, language, timezone } = req.body;
    
    // بناء كائن التحديثات
    const updates = {};
    
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (country) updates.country = country;
    if (city) updates.city = city;
    if (language) updates.language = language;
    if (timezone) updates.timezone = timezone;
    
    // معالجة رفع الصورة (إذا وجدت)
    if (req.file) {
      updates.photoBuffer = req.file.buffer;
    }
    
    // تحديث الملف الشخصي
    const result = await settingsService.updateProfile(userId, updates);
    
    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: result.user,
        settings: result.settings
      }
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 2: Update Privacy Settings ====================

/**
 * مثال: تحديث إعدادات الخصوصية
 */
async function updatePrivacyController(req, res) {
  try {
    const userId = req.user._id;
    const {
      profileVisibility,
      showEmail,
      showPhone,
      messagePermissions,
      showOnlineStatus,
      allowSearchEngineIndexing
    } = req.body;
    
    // بناء كائن الإعدادات
    const settings = {};
    
    if (profileVisibility !== undefined) settings.profileVisibility = profileVisibility;
    if (showEmail !== undefined) settings.showEmail = showEmail;
    if (showPhone !== undefined) settings.showPhone = showPhone;
    if (messagePermissions !== undefined) settings.messagePermissions = messagePermissions;
    if (showOnlineStatus !== undefined) settings.showOnlineStatus = showOnlineStatus;
    if (allowSearchEngineIndexing !== undefined) settings.allowSearchEngineIndexing = allowSearchEngineIndexing;
    
    // تحديث إعدادات الخصوصية
    const updatedSettings = await settingsService.updatePrivacySettings(userId, settings);
    
    res.json({
      success: true,
      message: 'تم تحديث إعدادات الخصوصية بنجاح',
      data: updatedSettings.privacy
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 3: Update Notification Preferences ====================

/**
 * مثال: تحديث تفضيلات الإشعارات
 */
async function updateNotificationsController(req, res) {
  try {
    const userId = req.user._id;
    const { job, course, chat, review, system, quietHours, frequency } = req.body;
    
    // بناء كائن التفضيلات
    const preferences = {};
    
    if (job !== undefined) preferences.job = job;
    if (course !== undefined) preferences.course = course;
    if (chat !== undefined) preferences.chat = chat;
    if (review !== undefined) preferences.review = review;
    if (system !== undefined) preferences.system = system;
    if (quietHours !== undefined) preferences.quietHours = quietHours;
    if (frequency !== undefined) preferences.frequency = frequency;
    
    // تحديث تفضيلات الإشعارات
    const updatedSettings = await settingsService.updateNotificationPreferences(userId, preferences);
    
    res.json({
      success: true,
      message: 'تم تحديث تفضيلات الإشعارات بنجاح',
      data: updatedSettings.notifications
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 4: Get All Settings ====================

/**
 * مثال: الحصول على جميع الإعدادات
 */
async function getSettingsController(req, res) {
  try {
    const userId = req.user._id;
    
    // الحصول على الإعدادات
    const settings = await settingsService.getUserSettings(userId);
    
    res.json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 5: Complete Settings Update ====================

/**
 * مثال: تحديث شامل لجميع الإعدادات
 */
async function updateAllSettingsController(req, res) {
  try {
    const userId = req.user._id;
    const { profile, privacy, notifications } = req.body;
    
    const results = {};
    
    // تحديث الملف الشخصي (إذا وجد)
    if (profile) {
      if (req.file) {
        profile.photoBuffer = req.file.buffer;
      }
      results.profile = await settingsService.updateProfile(userId, profile);
    }
    
    // تحديث إعدادات الخصوصية (إذا وجدت)
    if (privacy) {
      results.privacy = await settingsService.updatePrivacySettings(userId, privacy);
    }
    
    // تحديث تفضيلات الإشعارات (إذا وجدت)
    if (notifications) {
      results.notifications = await settingsService.updateNotificationPreferences(userId, notifications);
    }
    
    res.json({
      success: true,
      message: 'تم تحديث جميع الإعدادات بنجاح',
      data: results
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 6: Validation Error Handling ====================

/**
 * مثال: معالجة أخطاء التحقق من الصحة
 */
async function updateProfileWithValidationController(req, res) {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    // محاولة التحديث
    const result = await settingsService.updateProfile(userId, updates);
    
    res.json({
      success: true,
      message: 'تم التحديث بنجاح',
      data: result
    });
    
  } catch (error) {
    // معالجة أنواع مختلفة من الأخطاء
    let statusCode = 400;
    let errorMessage = error.message;
    
    if (error.message.includes('غير موجود')) {
      statusCode = 404;
    } else if (error.message.includes('مستخدم بالفعل')) {
      statusCode = 409; // Conflict
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
}

// ==================== Example 7: Integration with Multer ====================

/**
 * مثال: استخدام مع Multer لرفع الصور
 */
const multer = require('multer');

// إعداد Multer للذاكرة (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // قبول الصور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يجب أن يكون الملف صورة'), false);
    }
  }
});

// Route مع Multer
async function uploadProfilePhotoRoute(req, res) {
  try {
    const userId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم رفع أي صورة'
      });
    }
    
    // تحديث الصورة
    const result = await settingsService.updateProfile(userId, {
      photoBuffer: req.file.buffer
    });
    
    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      data: {
        imageUrl: result.user.profileImage
      }
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 8: Auto-Save Implementation ====================

/**
 * مثال: تنفيذ الحفظ التلقائي (Auto-Save)
 */
async function autoSaveSettingsController(req, res) {
  try {
    const userId = req.user._id;
    const { field, value, section } = req.body;
    
    let result;
    
    // تحديد القسم المراد تحديثه
    switch (section) {
      case 'profile':
        result = await settingsService.updateProfile(userId, { [field]: value });
        break;
        
      case 'privacy':
        result = await settingsService.updatePrivacySettings(userId, { [field]: value });
        break;
        
      case 'notifications':
        result = await settingsService.updateNotificationPreferences(userId, { [field]: value });
        break;
        
      default:
        throw new Error('قسم غير معروف');
    }
    
    res.json({
      success: true,
      message: 'تم الحفظ تلقائياً',
      data: result
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 9: Batch Update ====================

/**
 * مثال: تحديث دفعة من الإعدادات
 */
async function batchUpdateController(req, res) {
  try {
    const userId = req.user._id;
    const { updates } = req.body; // Array of updates
    
    const results = [];
    const errors = [];
    
    for (const update of updates) {
      try {
        let result;
        
        switch (update.section) {
          case 'profile':
            result = await settingsService.updateProfile(userId, update.data);
            break;
          case 'privacy':
            result = await settingsService.updatePrivacySettings(userId, update.data);
            break;
          case 'notifications':
            result = await settingsService.updateNotificationPreferences(userId, update.data);
            break;
        }
        
        results.push({
          section: update.section,
          success: true,
          data: result
        });
        
      } catch (error) {
        errors.push({
          section: update.section,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: errors.length === 0,
      message: `تم تحديث ${results.length} من ${updates.length} إعدادات`,
      results,
      errors
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Example 10: Settings Comparison ====================

/**
 * مثال: مقارنة الإعدادات قبل وبعد التحديث
 */
async function updateWithComparisonController(req, res) {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    // الحصول على الإعدادات الحالية
    const oldSettings = await settingsService.getUserSettings(userId);
    
    // تحديث الإعدادات
    const result = await settingsService.updatePrivacySettings(userId, updates);
    
    // مقارنة التغييرات
    const changes = {};
    for (const key in updates) {
      if (oldSettings.privacy[key] !== result.privacy[key]) {
        changes[key] = {
          old: oldSettings.privacy[key],
          new: result.privacy[key]
        };
      }
    }
    
    res.json({
      success: true,
      message: 'تم التحديث بنجاح',
      data: result.privacy,
      changes
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// ==================== Export Examples ====================

module.exports = {
  updateProfileController,
  updatePrivacyController,
  updateNotificationsController,
  getSettingsController,
  updateAllSettingsController,
  updateProfileWithValidationController,
  uploadProfilePhotoRoute,
  autoSaveSettingsController,
  batchUpdateController,
  updateWithComparisonController,
  
  // Multer middleware
  upload
};
