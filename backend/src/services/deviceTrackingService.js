const LoginDevice = require('../models/LoginDevice');
const UAParser = require('ua-parser-js');
const crypto = require('crypto');

/**
 * خدمة تتبع الأجهزة
 * تتعامل مع تسجيل وتتبع الأجهزة التي يتم تسجيل الدخول منها
 */
class DeviceTrackingService {
  
  /**
   * توليد معرف فريد للجهاز (Device Fingerprint)
   * @param {Object} req - Express request object
   * @returns {String} Device ID
   */
  generateDeviceId(req) {
    const userAgent = req.get('user-agent') || '';
    const acceptLanguage = req.get('accept-language') || '';
    const acceptEncoding = req.get('accept-encoding') || '';
    
    // دمج المعلومات لإنشاء fingerprint
    const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    
    // إنشاء hash
    return crypto
      .createHash('sha256')
      .update(fingerprint)
      .digest('hex');
  }
  
  /**
   * استخراج معلومات الجهاز من User Agent
   * @param {String} userAgent - User agent string
   * @returns {Object} Device info
   */
  parseDeviceInfo(userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      deviceType: this.getDeviceType(result.device.type),
      os: {
        name: result.os.name || 'Unknown',
        version: result.os.version || ''
      },
      browser: {
        name: result.browser.name || 'Unknown',
        version: result.browser.version || ''
      },
      userAgent: userAgent
    };
  }
  
  /**
   * تحديد نوع الجهاز
   * @param {String} type - Device type from UAParser
   * @returns {String} Normalized device type
   */
  getDeviceType(type) {
    if (!type) return 'desktop';
    
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('mobile') || lowerType.includes('phone')) {
      return 'mobile';
    }
    if (lowerType.includes('tablet')) {
      return 'tablet';
    }
    
    return 'desktop';
  }
  
  /**
   * الحصول على عنوان IP من الطلب
   * @param {Object} req - Express request object
   * @returns {String} IP address
   */
  getIpAddress(req) {
    // التحقق من headers المختلفة للحصول على IP الحقيقي
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
  }
  
  /**
   * الحصول على معلومات الموقع من IP (مبسط)
   * في الإنتاج، يمكن استخدام خدمة مثل MaxMind GeoIP
   * @param {String} ipAddress - IP address
   * @returns {Object} Location info
   */
  async getLocationFromIp(ipAddress) {
    // TODO: في الإنتاج، استخدم خدمة GeoIP حقيقية
    // مثال: const geoip = require('geoip-lite');
    // const geo = geoip.lookup(ipAddress);
    
    // حالياً نرجع بيانات افتراضية
    return {
      country: null,
      city: null,
      coordinates: {
        latitude: null,
        longitude: null
      }
    };
  }
  
  /**
   * تسجيل جهاز جديد أو تحديث جهاز موجود
   * @param {String} userId - User ID
   * @param {Object} req - Express request object
   * @returns {Object} { device, isNewDevice }
   */
  async trackDevice(userId, req) {
    try {
      // توليد معرف الجهاز
      const deviceId = this.generateDeviceId(req);
      
      // استخراج معلومات الجهاز
      const userAgent = req.get('user-agent') || '';
      const deviceInfo = this.parseDeviceInfo(userAgent);
      deviceInfo.deviceId = deviceId;
      
      // الحصول على IP والموقع
      const ipAddress = this.getIpAddress(req);
      const location = await this.getLocationFromIp(ipAddress);
      location.ipAddress = ipAddress;
      
      // البحث عن الجهاز في قاعدة البيانات
      let device = await LoginDevice.findOne({
        userId,
        'deviceInfo.deviceId': deviceId
      });
      
      let isNewDevice = false;
      
      if (device) {
        // جهاز موجود - تحديث آخر تسجيل دخول
        await device.updateLastLogin();
      } else {
        // جهاز جديد - إنشاء سجل جديد
        device = await LoginDevice.create({
          userId,
          deviceInfo,
          location
        });
        isNewDevice = true;
      }
      
      return {
        device,
        isNewDevice
      };
      
    } catch (error) {
      console.error('خطأ في تتبع الجهاز:', error);
      throw error;
    }
  }
  
  /**
   * الحصول على جميع أجهزة المستخدم
   * @param {String} userId - User ID
   * @returns {Array} List of devices
   */
  async getUserDevices(userId) {
    try {
      return await LoginDevice.find({ userId })
        .sort({ lastLoginAt: -1 })
        .lean();
    } catch (error) {
      console.error('خطأ في الحصول على أجهزة المستخدم:', error);
      throw error;
    }
  }
  
  /**
   * حذف جهاز
   * @param {String} userId - User ID
   * @param {String} deviceId - Device ID
   * @returns {Boolean} Success
   */
  async removeDevice(userId, deviceId) {
    try {
      const result = await LoginDevice.deleteOne({
        userId,
        _id: deviceId
      });
      
      return result.deletedCount > 0;
    } catch (error) {
      console.error('خطأ في حذف الجهاز:', error);
      throw error;
    }
  }
  
  /**
   * تحديد جهاز كموثوق
   * @param {String} userId - User ID
   * @param {String} deviceId - Device ID
   * @returns {Boolean} Success
   */
  async trustDevice(userId, deviceId) {
    try {
      const device = await LoginDevice.findOne({
        userId,
        _id: deviceId
      });
      
      if (!device) {
        return false;
      }
      
      await device.markAsTrusted();
      return true;
    } catch (error) {
      console.error('خطأ في تحديد الجهاز كموثوق:', error);
      throw error;
    }
  }
  
  /**
   * التحقق من أن الجهاز موثوق
   * @param {String} userId - User ID
   * @param {Object} req - Express request object
   * @returns {Boolean} Is trusted
   */
  async isDeviceTrusted(userId, req) {
    try {
      const deviceId = this.generateDeviceId(req);
      
      const device = await LoginDevice.findOne({
        userId,
        'deviceInfo.deviceId': deviceId,
        'status.isTrusted': true
      });
      
      return !!device;
    } catch (error) {
      console.error('خطأ في التحقق من الجهاز الموثوق:', error);
      return false;
    }
  }
}

module.exports = new DeviceTrackingService();
