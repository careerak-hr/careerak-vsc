const deviceTrackingService = require('../services/deviceTrackingService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Middleware لتتبع الأجهزة عند تسجيل الدخول
 * يجب استخدامه بعد middleware المصادقة
 */
const trackLoginDevice = async (req, res, next) => {
  try {
    // التحقق من وجود مستخدم مصادق
    if (!req.user || !req.user._id) {
      return next();
    }
    
    const userId = req.user._id;
    
    // تتبع الجهاز
    const { device, isNewDevice } = await deviceTrackingService.trackDevice(userId, req);
    
    // إضافة معلومات الجهاز إلى الطلب
    req.loginDevice = device;
    req.isNewDevice = isNewDevice;
    
    // إذا كان جهاز جديد وغير موثوق، إرسال تنبيه
    if (isNewDevice && !device.status.isTrusted && !device.status.alertSent) {
      // إرسال إشعار للمستخدم
      await notificationService.notifyNewDeviceLogin(userId, device);
      
      // تحديد أن التنبيه تم إرساله
      await device.markAlertSent();
      
      logger.info(`New device login alert sent to user ${userId}`);
    }
    
    next();
    
  } catch (error) {
    // في حالة الخطأ، نسجل الخطأ ونكمل بدون إيقاف العملية
    logger.error('Error in device tracking middleware:', error);
    next();
  }
};

/**
 * Middleware للتحقق من أن الجهاز موثوق (اختياري)
 * يمكن استخدامه للعمليات الحساسة
 */
const requireTrustedDevice = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح',
        messageEn: 'Unauthorized'
      });
    }
    
    const userId = req.user._id;
    const isTrusted = await deviceTrackingService.isDeviceTrusted(userId, req);
    
    if (!isTrusted) {
      return res.status(403).json({
        success: false,
        message: 'هذا الجهاز غير موثوق. يرجى تأكيد الجهاز أولاً.',
        messageEn: 'This device is not trusted. Please verify your device first.',
        requireDeviceVerification: true
      });
    }
    
    next();
    
  } catch (error) {
    logger.error('Error in trusted device middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في التحقق من الجهاز',
      messageEn: 'Error verifying device'
    });
  }
};

module.exports = {
  trackLoginDevice,
  requireTrustedDevice
};
