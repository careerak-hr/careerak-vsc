const bcrypt = require('bcryptjs');
const PhoneChangeRequest = require('../models/PhoneChangeRequest');
const { User } = require('../models/User');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * خدمة تغيير رقم الهاتف (Phone Change Service)
 * 
 * تدير عملية تغيير رقم الهاتف بشكل آمن من خلال:
 * - التحقق من عدم تكرار الرقم الجديد
 * - إرسال OTP للرقم الجديد
 * - التحقق من OTP وتحديث الرقم
 * - إرسال إشعار تأكيد
 * 
 * @validates Requirements 4.1, 4.2, 4.3, 4.4
 */
class PhoneChangeService {
  
  /**
   * بدء عملية تغيير رقم الهاتف
   * 
   * @param {string} userId - معرف المستخدم
   * @param {string} newPhone - رقم الهاتف الجديد
   * @returns {Promise<Object>} - { success: boolean, message: string, requestId?: string }
   * 
   * @validates Requirement 4.1: التحقق من عدم تسجيل الرقم الجديد مسبقاً
   */
  async initiatePhoneChange(userId, newPhone) {
    try {
      // التحقق من صحة المدخلات
      if (!userId || !newPhone) {
        return {
          success: false,
          message: 'معرف المستخدم ورقم الهاتف الجديد مطلوبان'
        };
      }
      
      // تنظيف رقم الهاتف (إزالة المسافات والرموز غير الضرورية)
      const cleanNewPhone = newPhone.replace(/\s+/g, '').trim();
      
      // التحقق من صحة تنسيق رقم الهاتف (يجب أن يبدأ بـ + ويحتوي على أرقام فقط)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(cleanNewPhone)) {
        return {
          success: false,
          message: 'تنسيق رقم الهاتف غير صحيح. يجب أن يبدأ بـ + ويحتوي على 7-15 رقم'
        };
      }
      
      // الحصول على بيانات المستخدم
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'المستخدم غير موجود'
        };
      }
      
      // التحقق من أن الرقم الجديد مختلف عن القديم
      if (user.phone && user.phone === cleanNewPhone) {
        return {
          success: false,
          message: 'رقم الهاتف الجديد مطابق للرقم الحالي'
        };
      }
      
      // التحقق من عدم تسجيل الرقم الجديد مسبقاً (Requirement 4.1)
      const existingUser = await User.findOne({ 
        phone: cleanNewPhone,
        _id: { $ne: userId } // استثناء المستخدم الحالي
      });
      
      if (existingUser) {
        logger.warn(`Phone change attempt with existing phone: ${cleanNewPhone}`);
        return {
          success: false,
          message: 'رقم الهاتف مستخدم بالفعل'
        };
      }
      
      // إنشاء OTP
      const otp = this.generateOTP();
      
      // إنشاء طلب تغيير الهاتف
      const request = await PhoneChangeRequest.createRequest(
        userId,
        user.phone || 'غير محدد',
        cleanNewPhone,
        otp
      );
      
      logger.info(`Phone change request created: ${request._id} for user ${userId}`);
      
      return {
        success: true,
        message: 'تم إنشاء طلب تغيير رقم الهاتف بنجاح',
        requestId: request._id.toString(),
        // في بيئة التطوير فقط، نعيد OTP للاختبار
        ...(process.env.NODE_ENV === 'test' && { otp })
      };
      
    } catch (error) {
      logger.error('Error initiating phone change:', error);
      throw error;
    }
  }
  
  /**
   * إرسال OTP إلى رقم الهاتف الجديد
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} - { success: boolean, message: string }
   * 
   * @validates Requirement 4.2: إرسال رمز التحقق للرقم الجديد
   */
  async sendOTP(userId) {
    try {
      // الحصول على طلب التغيير المعلق
      const request = await PhoneChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير رقم هاتف معلق'
        };
      }
      
      // التحقق من عدم انتهاء صلاحية الطلب
      if (request.isExpired()) {
        return {
          success: false,
          message: 'انتهت صلاحية طلب تغيير رقم الهاتف'
        };
      }
      
      // توليد OTP جديد
      const otpCode = this.generateOTP();
      
      // تحديث OTP المشفر في قاعدة البيانات
      const hashedOTP = await bcrypt.hash(otpCode, 10);
      await PhoneChangeRequest.findByIdAndUpdate(request._id, {
        otp: hashedOTP
      });
      
      // إرسال OTP عبر SMS (محاكاة)
      // في بيئة حقيقية، استخدم خدمة SMS مثل Twilio أو AWS SNS
      logger.info(`Sending OTP ${otpCode} to new phone: ${request.newPhone}`);
      console.log(`[SMS] OTP للرقم الجديد (${request.newPhone}): ${otpCode}`);
      
      // إرسال إشعار داخل التطبيق
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'طلب تغيير رقم الهاتف',
        message: `تم إرسال رمز التحقق إلى رقم هاتفك الجديد ${request.newPhone}`,
        priority: 'high'
      });
      
      return {
        success: true,
        message: 'تم إرسال رمز التحقق إلى رقم الهاتف الجديد',
        // في بيئة التطوير فقط، نعيد OTP للاختبار
        ...(process.env.NODE_ENV === 'test' && { otp: otpCode })
      };
      
    } catch (error) {
      logger.error('Error sending OTP:', error);
      throw error;
    }
  }
  
  /**
   * التحقق من OTP وتحديث رقم الهاتف
   * 
   * @param {string} userId - معرف المستخدم
   * @param {string} otp - رمز التحقق
   * @returns {Promise<Object>} - { success: boolean, message: string, newPhone?: string }
   * 
   * @validates Requirements 4.2, 4.3, 4.4: التحقق من OTP، تحديث الرقم، إرسال إشعار
   */
  async verifyAndUpdate(userId, otp) {
    try {
      // التحقق من صحة المدخلات
      if (!userId || !otp) {
        return {
          success: false,
          message: 'معرف المستخدم ورمز التحقق مطلوبان'
        };
      }
      
      // الحصول على طلب التغيير المعلق
      const request = await PhoneChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير رقم هاتف معلق'
        };
      }
      
      // التحقق من عدم انتهاء صلاحية الطلب
      if (request.isExpired()) {
        return {
          success: false,
          message: 'انتهت صلاحية رمز التحقق'
        };
      }
      
      // التحقق من OTP (Requirement 4.2)
      const isValid = await request.verifyOTP(otp);
      
      if (!isValid) {
        logger.warn(`Invalid OTP attempt for phone change: user ${userId}`);
        return {
          success: false,
          message: 'رمز التحقق غير صحيح'
        };
      }
      
      // الحصول على بيانات المستخدم
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'المستخدم غير موجود'
        };
      }
      
      // حفظ الرقم القديم للسجل
      const oldPhone = user.phone;
      
      // تحديث رقم الهاتف (Requirement 4.3)
      user.phone = request.newPhone;
      // Note: phoneVerified field doesn't exist in User model, so we skip it
      await user.save();
      
      logger.info(`Phone updated for user ${userId} from ${oldPhone} to ${request.newPhone}`);
      
      // تحديث حالة الطلب
      await request.verify();
      await request.complete();
      
      // إرسال إشعار تأكيد (Requirement 4.4)
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'تم تغيير رقم الهاتف',
        message: `تم تحديث رقم هاتفك بنجاح إلى ${request.newPhone}`,
        priority: 'high'
      });
      
      // إرسال SMS تأكيد (محاكاة)
      console.log(`[SMS] إشعار للرقم الجديد (${request.newPhone}): تم تفعيل رقم هاتفك بنجاح`);
      
      return {
        success: true,
        message: 'تم تحديث رقم الهاتف بنجاح',
        newPhone: request.newPhone
      };
      
    } catch (error) {
      logger.error('Error verifying and updating phone:', error);
      throw error;
    }
  }
  
  /**
   * توليد رمز OTP من 6 أرقام
   * 
   * @returns {string} - رمز OTP
   * @private
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * الحصول على حالة طلب تغيير الهاتف
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object|null>} - حالة الطلب أو null
   */
  async getRequestStatus(userId) {
    try {
      const request = await PhoneChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return null;
      }
      
      return {
        requestId: request._id,
        oldPhone: request.oldPhone,
        newPhone: request.newPhone,
        verified: request.verified,
        status: request.status,
        expiresAt: request.expiresAt,
        isExpired: request.isExpired()
      };
      
    } catch (error) {
      logger.error('Error getting request status:', error);
      throw error;
    }
  }
  
  /**
   * إلغاء طلب تغيير الهاتف
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} - { success: boolean, message: string }
   */
  async cancelRequest(userId) {
    try {
      const result = await PhoneChangeRequest.deleteMany({
        userId,
        status: 'pending'
      });
      
      if (result.deletedCount === 0) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير رقم هاتف معلق'
        };
      }
      
      logger.info(`Phone change request cancelled for user ${userId}`);
      
      return {
        success: true,
        message: 'تم إلغاء طلب تغيير رقم الهاتف'
      };
      
    } catch (error) {
      logger.error('Error cancelling request:', error);
      throw error;
    }
  }
}

module.exports = new PhoneChangeService();
