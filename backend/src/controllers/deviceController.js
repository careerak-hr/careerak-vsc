const deviceTrackingService = require('../services/deviceTrackingService');
const LoginDevice = require('../models/LoginDevice');

/**
 * الحصول على جميع أجهزة المستخدم
 * GET /devices
 */
exports.getUserDevices = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const devices = await deviceTrackingService.getUserDevices(userId);
    
    // تنسيق البيانات للعرض
    const formattedDevices = devices.map(device => ({
      id: device._id,
      deviceType: device.deviceInfo.deviceType,
      browser: device.deviceInfo.browser,
      os: device.deviceInfo.os,
      location: {
        city: device.location.city,
        country: device.location.country,
        ipAddress: device.location.ipAddress
      },
      isTrusted: device.status.isTrusted,
      isCurrentDevice: req.loginDevice && 
                       device.deviceInfo.deviceId === req.loginDevice.deviceInfo.deviceId,
      firstLoginAt: device.firstLoginAt,
      lastLoginAt: device.lastLoginAt,
      loginCount: device.loginCount,
      description: new LoginDevice(device).getDeviceDescription()
    }));
    
    return res.status(200).json({
      success: true,
      data: {
        devices: formattedDevices,
        total: formattedDevices.length
      }
    });
    
  } catch (error) {
    console.error('خطأ في الحصول على الأجهزة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الحصول على الأجهزة',
      messageEn: 'Error fetching devices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * تحديد جهاز كموثوق
 * POST /devices/:deviceId/trust
 */
exports.trustDevice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deviceId } = req.params;
    
    const success = await deviceTrackingService.trustDevice(userId, deviceId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'الجهاز غير موجود',
        messageEn: 'Device not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'تم تحديد الجهاز كموثوق بنجاح',
      messageEn: 'Device marked as trusted successfully'
    });
    
  } catch (error) {
    console.error('خطأ في تحديد الجهاز كموثوق:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديد الجهاز كموثوق',
      messageEn: 'Error trusting device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * حذف جهاز
 * DELETE /devices/:deviceId
 */
exports.removeDevice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deviceId } = req.params;
    
    // التحقق من عدم حذف الجهاز الحالي
    if (req.loginDevice && req.loginDevice._id.toString() === deviceId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك حذف الجهاز الحالي',
        messageEn: 'Cannot remove current device'
      });
    }
    
    const success = await deviceTrackingService.removeDevice(userId, deviceId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'الجهاز غير موجود',
        messageEn: 'Device not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'تم حذف الجهاز بنجاح',
      messageEn: 'Device removed successfully'
    });
    
  } catch (error) {
    console.error('خطأ في حذف الجهاز:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الجهاز',
      messageEn: 'Error removing device',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * حذف جميع الأجهزة الأخرى (ما عدا الجهاز الحالي)
 * DELETE /devices/others
 */
exports.removeOtherDevices = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDeviceId = req.loginDevice ? req.loginDevice._id : null;
    
    if (!currentDeviceId) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تحديد الجهاز الحالي',
        messageEn: 'Cannot identify current device'
      });
    }
    
    // حذف جميع الأجهزة ما عدا الحالي
    const result = await LoginDevice.deleteMany({
      userId,
      _id: { $ne: currentDeviceId }
    });
    
    return res.status(200).json({
      success: true,
      message: `تم حذف ${result.deletedCount} جهاز بنجاح`,
      messageEn: `${result.deletedCount} devices removed successfully`,
      data: {
        removedCount: result.deletedCount
      }
    });
    
  } catch (error) {
    console.error('خطأ في حذف الأجهزة الأخرى:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الأجهزة',
      messageEn: 'Error removing devices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * الحصول على معلومات الجهاز الحالي
 * GET /devices/current
 */
exports.getCurrentDevice = async (req, res) => {
  try {
    if (!req.loginDevice) {
      return res.status(404).json({
        success: false,
        message: 'لا يمكن تحديد الجهاز الحالي',
        messageEn: 'Cannot identify current device'
      });
    }
    
    const device = req.loginDevice;
    
    return res.status(200).json({
      success: true,
      data: {
        id: device._id,
        deviceType: device.deviceInfo.deviceType,
        browser: device.deviceInfo.browser,
        os: device.deviceInfo.os,
        location: {
          city: device.location.city,
          country: device.location.country,
          ipAddress: device.location.ipAddress
        },
        isTrusted: device.status.isTrusted,
        isNewDevice: req.isNewDevice,
        firstLoginAt: device.firstLoginAt,
        lastLoginAt: device.lastLoginAt,
        loginCount: device.loginCount,
        description: device.getDeviceDescription()
      }
    });
    
  } catch (error) {
    console.error('خطأ في الحصول على الجهاز الحالي:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الحصول على معلومات الجهاز',
      messageEn: 'Error fetching device info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
