const bcrypt = require('bcryptjs');
const EmailChangeRequest = require('../models/EmailChangeRequest');
const { User } = require('../models/User');
const ActiveSession = require('../models/ActiveSession');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * خدمة تغيير البريد الإلكتروني (Email Change Service)
 * 
 * تدير عملية تغيير البريد الإلكتروني بشكل آمن من خلال:
 * - التحقق من عدم تكرار البريد الجديد
 * - إرسال OTP للبريد القديم
 * - إرسال OTP للبريد الجديد بعد التحقق من القديم
 * - تأكيد كلمة المرور قبل التحديث النهائي
 * - إنهاء جميع الجلسات الأخرى بعد التحديث
 * - إرسال إشعارات للبريدين القديم والجديد
 * 
 * @validates Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
class EmailChangeService {
  
  /**
   * بدء عملية تغيير البريد الإلكتروني
   * 
   * @param {string} userId - معرف المستخدم
   * @param {string} newEmail - البريد الإلكتروني الجديد
   * @returns {Promise<Object>} - { success: boolean, message: string, requestId?: string }
   * 
   * @validates Requirement 3.1: التحقق من عدم تسجيل البريد الجديد مسبقاً
   */
  async initiateEmailChange(userId, newEmail) {
    try {
      // التحقق من صحة المدخلات
      if (!userId || !newEmail) {
        return {
          success: false,
          message: 'معرف المستخدم والبريد الإلكتروني الجديد مطلوبان'
        };
      }
      
      // تنظيف وتحويل البريد إلى أحرف صغيرة
      const cleanNewEmail = newEmail.toLowerCase().trim();
      
      // التحقق من صحة تنسيق البريد الإلكتروني
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanNewEmail)) {
        return {
          success: false,
          message: 'تنسيق البريد الإلكتروني غير صحيح'
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
      
      // التحقق من أن البريد الجديد مختلف عن القديم
      if (user.email && user.email.toLowerCase() === cleanNewEmail) {
        return {
          success: false,
          message: 'البريد الإلكتروني الجديد مطابق للبريد الحالي'
        };
      }
      
      // التحقق من عدم تسجيل البريد الجديد مسبقاً (Requirement 3.1)
      const existingUser = await User.findOne({ 
        email: cleanNewEmail,
        _id: { $ne: userId } // استثناء المستخدم الحالي
      });
      
      if (existingUser) {
        logger.warn(`Email change attempt with existing email: ${cleanNewEmail}`);
        return {
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل'
        };
      }
      
      // إنشاء OTPs للبريدين القديم والجديد
      const oldEmailOTP = this.generateOTP();
      const newEmailOTP = this.generateOTP();
      
      // إنشاء طلب تغيير البريد
      const request = await EmailChangeRequest.createRequest(
        userId,
        user.email || user.phone, // استخدام الهاتف إذا لم يكن هناك بريد
        cleanNewEmail,
        oldEmailOTP,
        newEmailOTP
      );
      
      logger.info(`Email change request created: ${request._id} for user ${userId}`);
      
      return {
        success: true,
        message: 'تم إنشاء طلب تغيير البريد الإلكتروني بنجاح',
        requestId: request._id.toString()
      };
      
    } catch (error) {
      logger.error('Error initiating email change:', error);
      throw error;
    }
  }
  
  /**
   * إرسال OTP إلى البريد الإلكتروني القديم
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} - { success: boolean, message: string }
   * 
   * @validates Requirement 3.2: إرسال رمز التحقق للبريد القديم
   */
  async sendOTPToOldEmail(userId) {
    try {
      // الحصول على طلب التغيير المعلق
      const request = await EmailChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير بريد إلكتروني معلق'
        };
      }
      
      // التحقق من عدم انتهاء صلاحية الطلب
      if (request.isExpired()) {
        return {
          success: false,
          message: 'انتهت صلاحية طلب تغيير البريد الإلكتروني'
        };
      }
      
      // الحصول على OTP من قاعدة البيانات (مشفر)
      const requestWithOTP = await EmailChangeRequest.findById(request._id).select('+oldEmailOTP');
      
      // فك تشفير OTP للإرسال (في بيئة حقيقية، يجب تخزين OTP غير مشفر مؤقتاً)
      // هنا نستخدم نفس آلية OTP الموجودة في النظام
      const otpCode = this.generateOTP(); // توليد OTP جديد
      
      // تحديث OTP المشفر في قاعدة البيانات
      const hashedOTP = await bcrypt.hash(otpCode, 10);
      await EmailChangeRequest.findByIdAndUpdate(request._id, {
        oldEmailOTP: hashedOTP
      });
      
      // إرسال OTP عبر البريد الإلكتروني (محاكاة)
      // في بيئة حقيقية، استخدم خدمة بريد إلكتروني
      logger.info(`Sending OTP ${otpCode} to old email: ${request.oldEmail}`);
      console.log(`[EMAIL] OTP للبريد القديم (${request.oldEmail}): ${otpCode}`);
      
      // إرسال إشعار
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'طلب تغيير البريد الإلكتروني',
        message: `تم إرسال رمز التحقق إلى بريدك الإلكتروني القديم`,
        priority: 'high'
      });
      
      return {
        success: true,
        message: 'تم إرسال رمز التحقق إلى البريد الإلكتروني القديم',
        // في بيئة التطوير فقط، نعيد OTP للاختبار
        ...(process.env.NODE_ENV === 'test' && { otp: otpCode })
      };
      
    } catch (error) {
      logger.error('Error sending OTP to old email:', error);
      throw error;
    }
  }
  
  /**
   * التحقق من OTP البريد القديم
   * 
   * @param {string} userId - معرف المستخدم
   * @param {string} otp - رمز التحقق
   * @returns {Promise<Object>} - { success: boolean, message: string }
   * 
   * @validates Requirement 3.2: التحقق من رمز البريد القديم
   */
  async verifyOldEmail(userId, otp) {
    try {
      // التحقق من صحة المدخلات
      if (!userId || !otp) {
        return {
          success: false,
          message: 'معرف المستخدم ورمز التحقق مطلوبان'
        };
      }
      
      // الحصول على طلب التغيير المعلق
      const request = await EmailChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير بريد إلكتروني معلق'
        };
      }
      
      // التحقق من عدم انتهاء صلاحية الطلب
      if (request.isExpired()) {
        return {
          success: false,
          message: 'انتهت صلاحية رمز التحقق'
        };
      }
      
      // التحقق من OTP
      const isValid = await request.verifyOTP(request.oldEmail, otp);
      
      if (!isValid) {
        logger.warn(`Invalid OTP attempt for old email verification: user ${userId}`);
        return {
          success: false,
          message: 'رمز التحقق غير صحيح'
        };
      }
      
      // تحديث حالة التحقق
      await request.verifyOldEmail();
      
      logger.info(`Old email verified for user ${userId}`);
      
      return {
        success: true,
        message: 'تم التحقق من البريد الإلكتروني القديم بنجاح'
      };
      
    } catch (error) {
      logger.error('Error verifying old email:', error);
      throw error;
    }
  }
  
  /**
   * إرسال OTP إلى البريد الإلكتروني الجديد
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} - { success: boolean, message: string }
   * 
   * @validates Requirement 3.3: إرسال رمز التحقق للبريد الجديد بعد التحقق من القديم
   */
  async sendOTPToNewEmail(userId) {
    try {
      // الحصول على طلب التغيير المعلق
      const request = await EmailChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير بريد إلكتروني معلق'
        };
      }
      
      // التحقق من أن البريد القديم تم التحقق منه (Requirement 3.3)
      if (!request.oldEmailVerified) {
        return {
          success: false,
          message: 'يجب التحقق من البريد الإلكتروني القديم أولاً'
        };
      }
      
      // التحقق من عدم انتهاء صلاحية الطلب
      if (request.isExpired()) {
        return {
          success: false,
          message: 'انتهت صلاحية طلب تغيير البريد الإلكتروني'
        };
      }
      
      // توليد OTP جديد
      const otpCode = this.generateOTP();
      
      // تحديث OTP المشفر في قاعدة البيانات
      const hashedOTP = await bcrypt.hash(otpCode, 10);
      await EmailChangeRequest.findByIdAndUpdate(request._id, {
        newEmailOTP: hashedOTP
      });
      
      // إرسال OTP عبر البريد الإلكتروني (محاكاة)
      logger.info(`Sending OTP ${otpCode} to new email: ${request.newEmail}`);
      console.log(`[EMAIL] OTP للبريد الجديد (${request.newEmail}): ${otpCode}`);
      
      // إرسال إشعار
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'تأكيد البريد الإلكتروني الجديد',
        message: `تم إرسال رمز التحقق إلى بريدك الإلكتروني الجديد`,
        priority: 'high'
      });
      
      return {
        success: true,
        message: 'تم إرسال رمز التحقق إلى البريد الإلكتروني الجديد',
        // في بيئة التطوير فقط، نعيد OTP للاختبار
        ...(process.env.NODE_ENV === 'test' && { otp: otpCode })
      };
      
    } catch (error) {
      logger.error('Error sending OTP to new email:', error);
      throw error;
    }
  }
  
  /**
   * التحقق من OTP البريد الجديد
   * 
   * @param {string} userId - معرف المستخدم
   * @param {string} otp - رمز التحقق
   * @returns {Promise<Object>} - { success: boolean, message: string }
   * 
   * @validates Requirement 3.3: التحقق من رمز البريد الجديد
   */
  async verifyNewEmail(userId, otp) {
    try {
      // التحقق من صحة المدخلات
      if (!userId || !otp) {
        return {
          success: false,
          message: 'معرف المستخدم ورمز التحقق مطلوبان'
        };
      }
      
      // الحصول على طلب التغيير المعلق
      const request = await EmailChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير بريد إلكتروني معلق'
        };
      }
      
      // التحقق من أن البريد القديم تم التحقق منه
      if (!request.oldEmailVerified) {
        return {
          success: false,
          message: 'يجب التحقق من البريد الإلكتروني القديم أولاً'
        };
      }
      
      // التحقق من عدم انتهاء صلاحية الطلب
      if (request.isExpired()) {
        return {
          success: false,
          message: 'انتهت صلاحية رمز التحقق'
        };
      }
      
      // التحقق من OTP
      const isValid = await request.verifyOTP(request.newEmail, otp);
      
      if (!isValid) {
        logger.warn(`Invalid OTP attempt for new email verification: user ${userId}`);
        return {
          success: false,
          message: 'رمز التحقق غير صحيح'
        };
      }
      
      // تحديث حالة التحقق
      await request.verifyNewEmail();
      
      logger.info(`New email verified for user ${userId}`);
      
      return {
        success: true,
        message: 'تم التحقق من البريد الإلكتروني الجديد بنجاح'
      };
      
    } catch (error) {
      logger.error('Error verifying new email:', error);
      throw error;
    }
  }
  
  /**
   * التحقق من كلمة المرور وتحديث البريد الإلكتروني
   * 
   * @param {string} userId - معرف المستخدم
   * @param {string} password - كلمة المرور للتأكيد
   * @param {string} currentSessionId - معرف الجلسة الحالية (اختياري)
   * @returns {Promise<Object>} - { success: boolean, message: string }
   * 
   * @validates Requirements 3.4, 3.5, 3.6: تأكيد كلمة المرور، تحديث البريد، إنهاء الجلسات، إرسال إشعارات
   */
  async verifyAndUpdate(userId, password, currentSessionId = null) {
    try {
      // التحقق من صحة المدخلات
      if (!userId || !password) {
        return {
          success: false,
          message: 'معرف المستخدم وكلمة المرور مطلوبان'
        };
      }
      
      // الحصول على طلب التغيير المعلق
      const request = await EmailChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير بريد إلكتروني معلق'
        };
      }
      
      // التحقق من أن كلا البريدين تم التحقق منهما (Requirement 3.4)
      if (!request.isBothEmailsVerified()) {
        return {
          success: false,
          message: 'يجب التحقق من كلا البريدين الإلكترونيين أولاً'
        };
      }
      
      // التحقق من عدم انتهاء صلاحية الطلب
      if (request.isExpired()) {
        return {
          success: false,
          message: 'انتهت صلاحية طلب تغيير البريد الإلكتروني'
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
      
      // التحقق من كلمة المرور (Requirement 3.4)
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        logger.warn(`Invalid password attempt for email change: user ${userId}`);
        return {
          success: false,
          message: 'كلمة المرور غير صحيحة'
        };
      }
      
      // حفظ البريد القديم للإشعار
      const oldEmail = user.email;
      
      // تحديث البريد الإلكتروني (Requirement 3.5)
      user.email = request.newEmail;
      user.emailVerified = true; // تأكيد البريد الجديد
      await user.save();
      
      // إنهاء جميع الجلسات الأخرى (Requirement 3.5)
      const invalidatedCount = await ActiveSession.invalidateUserSessions(
        userId,
        currentSessionId
      );
      
      logger.info(`Email updated for user ${userId}. Invalidated ${invalidatedCount} sessions.`);
      
      // تحديث حالة الطلب
      await request.complete();
      
      // إرسال إشعار للبريد القديم (Requirement 3.6)
      if (oldEmail) {
        console.log(`[EMAIL] إشعار للبريد القديم (${oldEmail}): تم تغيير بريدك الإلكتروني إلى ${request.newEmail}`);
      }
      
      // إرسال إشعار للبريد الجديد (Requirement 3.6)
      console.log(`[EMAIL] إشعار للبريد الجديد (${request.newEmail}): تم تفعيل بريدك الإلكتروني بنجاح`);
      
      // إرسال إشعار داخل التطبيق
      await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title: 'تم تغيير البريد الإلكتروني',
        message: `تم تحديث بريدك الإلكتروني بنجاح إلى ${request.newEmail}`,
        priority: 'high'
      });
      
      return {
        success: true,
        message: 'تم تحديث البريد الإلكتروني بنجاح',
        newEmail: request.newEmail,
        sessionsInvalidated: invalidatedCount
      };
      
    } catch (error) {
      logger.error('Error verifying and updating email:', error);
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
   * الحصول على حالة طلب تغيير البريد
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object|null>} - حالة الطلب أو null
   */
  async getRequestStatus(userId) {
    try {
      const request = await EmailChangeRequest.findPendingRequest(userId);
      
      if (!request) {
        return null;
      }
      
      return {
        requestId: request._id,
        oldEmail: request.oldEmail,
        newEmail: request.newEmail,
        oldEmailVerified: request.oldEmailVerified,
        newEmailVerified: request.newEmailVerified,
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
   * إلغاء طلب تغيير البريد
   * 
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<Object>} - { success: boolean, message: string }
   */
  async cancelRequest(userId) {
    try {
      const result = await EmailChangeRequest.deleteMany({
        userId,
        status: 'pending'
      });
      
      if (result.deletedCount === 0) {
        return {
          success: false,
          message: 'لا يوجد طلب تغيير بريد إلكتروني معلق'
        };
      }
      
      logger.info(`Email change request cancelled for user ${userId}`);
      
      return {
        success: true,
        message: 'تم إلغاء طلب تغيير البريد الإلكتروني'
      };
      
    } catch (error) {
      logger.error('Error cancelling request:', error);
      throw error;
    }
  }
}

module.exports = new EmailChangeService();
