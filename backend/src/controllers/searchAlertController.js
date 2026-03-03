const SearchAlert = require('../models/SearchAlert');
const SavedSearch = require('../models/SavedSearch');
const notificationService = require('../services/notificationService');

/**
 * إنشاء تنبيه جديد
 * POST /api/search/alerts
 */
exports.createAlert = async (req, res) => {
  try {
    const { savedSearchId, frequency, notificationMethod } = req.body;
    const userId = req.user._id;

    // التحقق من وجود عملية البحث المحفوظة
    const savedSearch = await SavedSearch.findOne({
      _id: savedSearchId,
      userId
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'عملية البحث المحفوظة غير موجودة'
      });
    }

    // التحقق من عدم وجود تنبيه مسبق لنفس عملية البحث
    const existingAlert = await SearchAlert.findOne({
      userId,
      savedSearchId
    });

    if (existingAlert) {
      return res.status(400).json({
        success: false,
        message: 'يوجد تنبيه بالفعل لهذه العملية البحثية'
      });
    }

    // إنشاء التنبيه
    const alert = await SearchAlert.create({
      userId,
      savedSearchId,
      frequency: frequency || 'instant',
      notificationMethod: notificationMethod || 'push'
    });

    // تحديث حالة التنبيه في عملية البحث المحفوظة
    savedSearch.alertEnabled = true;
    savedSearch.alertFrequency = frequency || 'instant';
    savedSearch.notificationMethod = notificationMethod || 'push';
    await savedSearch.save();

    // إرسال إشعار بالتفعيل
    await notificationService.create({
      userId,
      type: 'system',
      title: 'تم تفعيل التنبيه',
      message: `تم تفعيل التنبيه لعملية البحث "${savedSearch.name}"`,
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء التنبيه'
    });
  }
};

/**
 * جلب جميع التنبيهات
 * GET /api/search/alerts
 */
exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user._id;

    const alerts = await SearchAlert.find({ userId })
      .populate('savedSearchId', 'name searchType searchParams')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التنبيهات'
    });
  }
};

/**
 * جلب تنبيه واحد
 * GET /api/search/alerts/:id
 */
exports.getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const alert = await SearchAlert.findOne({
      _id: id,
      userId
    }).populate('savedSearchId', 'name searchType searchParams');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'التنبيه غير موجود'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التنبيه'
    });
  }
};

/**
 * تحديث تنبيه
 * PUT /api/search/alerts/:id
 */
exports.updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { frequency, notificationMethod, isActive } = req.body;

    const alert = await SearchAlert.findOne({
      _id: id,
      userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'التنبيه غير موجود'
      });
    }

    // تحديث الحقول
    if (frequency) alert.frequency = frequency;
    if (notificationMethod) alert.notificationMethod = notificationMethod;
    if (typeof isActive !== 'undefined') alert.isActive = isActive;

    await alert.save();

    // تحديث عملية البحث المحفوظة
    const savedSearch = await SavedSearch.findById(alert.savedSearchId);
    if (savedSearch) {
      savedSearch.alertEnabled = alert.isActive;
      savedSearch.alertFrequency = alert.frequency;
      savedSearch.notificationMethod = alert.notificationMethod;
      await savedSearch.save();
    }

    // إرسال إشعار بالتحديث
    await notificationService.create({
      userId,
      type: 'system',
      title: 'تم تحديث التنبيه',
      message: `تم تحديث إعدادات التنبيه لعملية البحث "${savedSearch?.name || ''}"`,
      priority: 'low'
    });

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث التنبيه'
    });
  }
};

/**
 * حذف تنبيه
 * DELETE /api/search/alerts/:id
 */
exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const alert = await SearchAlert.findOne({
      _id: id,
      userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'التنبيه غير موجود'
      });
    }

    // تحديث عملية البحث المحفوظة
    const savedSearch = await SavedSearch.findById(alert.savedSearchId);
    if (savedSearch) {
      savedSearch.alertEnabled = false;
      await savedSearch.save();
    }

    await SearchAlert.deleteOne({ _id: id });

    // إرسال إشعار بالحذف
    await notificationService.create({
      userId,
      type: 'system',
      title: 'تم إلغاء التنبيه',
      message: `تم إلغاء التنبيه لعملية البحث "${savedSearch?.name || ''}"`,
      priority: 'low'
    });

    res.json({
      success: true,
      message: 'تم حذف التنبيه بنجاح'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف التنبيه'
    });
  }
};

module.exports = exports;
