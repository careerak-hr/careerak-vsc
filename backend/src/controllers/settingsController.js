const SettingsService = require('../services/settingsService');
const EmailChangeService = require('../services/emailChangeService');
const PhoneChangeService = require('../services/phoneChangeService');
const PasswordChangeService = require('../services/passwordChangeService');
const logger = require('../utils/logger');

/**
 * Settings Controller
 * معالج طلبات الإعدادات (Profile, Email, Phone, Password, Privacy, Notifications)
 */
class SettingsController {
  constructor() {
    this.settingsService = new SettingsService();
    this.emailChangeService = new EmailChangeService();
    this.phoneChangeService = new PhoneChangeService();
    this.passwordChangeService = new PasswordChangeService();
  }

  /**
   * PUT /api/settings/profile
   * تحديث معلومات الملف الشخصي
   */
  updateProfile = async (req, res) => {
    try {
      const userId = req.user._id;
      const updates = req.body;

      // التحقق من الصحة
      if (updates.name && updates.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_NAME', message: 'الاسم لا يمكن أن يكون فارغاً' }
        });
      }

      // تحديث الملف الشخصي
      const updatedUser = await this.settingsService.updateProfile(userId, updates);

      logger.info('Profile updated', { userId, updates: Object.keys(updates) });

      res.json({
        success: true,
        data: {
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            profilePicture: updatedUser.profilePicture,
            language: updatedUser.preferences?.language,
            timezone: updatedUser.preferences?.timezone
          }
        },
        message: 'تم تحديث الملف الشخصي بنجاح'
      });
    } catch (error) {
      logger.error('Error updating profile', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'فشل تحديث الملف الشخصي' }
      });
    }
  };

  /**
   * POST /api/settings/email/change
   * بدء عملية تغيير البريد الإلكتروني
   */
  initiateEmailChange = async (req, res) => {
    try {
      const userId = req.user._id;
      const { newEmail } = req.body;

      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_EMAIL', message: 'البريد الإلكتروني غير صحيح' }
        });
      }

      await this.emailChangeService.initiateEmailChange(userId, newEmail);

      logger.info('Email change initiated', { userId, newEmail });

      res.json({
        success: true,
        message: 'تم إرسال رموز التحقق إلى البريدين القديم والجديد'
      });
    } catch (error) {
      logger.error('Error initiating email change', { error: error.message, userId: req.user._id });
      
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'EMAIL_ALREADY_EXISTS', message: 'البريد الإلكتروني مستخدم بالفعل' }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'INITIATE_FAILED', message: 'فشل بدء عملية تغيير البريد' }
      });
    }
  };

  /**
   * POST /api/settings/email/verify
   * التحقق من OTPs وإتمام تغيير البريد
   */
  verifyEmailChange = async (req, res) => {
    try {
      const userId = req.user._id;
      const { oldEmailOTP, newEmailOTP, password } = req.body;

      if (!oldEmailOTP || !newEmailOTP || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'جميع الحقول مطلوبة' }
        });
      }

      await this.emailChangeService.verifyAndUpdate(userId, oldEmailOTP, newEmailOTP, password);

      logger.info('Email changed successfully', { userId });

      res.json({
        success: true,
        message: 'تم تغيير البريد الإلكتروني بنجاح'
      });
    } catch (error) {
      logger.error('Error verifying email change', { error: error.message, userId: req.user._id });
      
      if (error.message === 'INVALID_OTP') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_OTP', message: 'رمز التحقق غير صحيح' }
        });
      }

      if (error.message === 'INVALID_PASSWORD') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'كلمة المرور غير صحيحة' }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'VERIFY_FAILED', message: 'فشل التحقق من تغيير البريد' }
      });
    }
  };

  /**
   * POST /api/settings/phone/change
   * تغيير رقم الهاتف
   */
  changePhone = async (req, res) => {
    try {
      const userId = req.user._id;
      const { newPhone, otp } = req.body;

      if (!newPhone || !otp) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'رقم الهاتف ورمز التحقق مطلوبان' }
        });
      }

      await this.phoneChangeService.verifyAndUpdate(userId, newPhone, otp);

      logger.info('Phone changed successfully', { userId });

      res.json({
        success: true,
        message: 'تم تغيير رقم الهاتف بنجاح'
      });
    } catch (error) {
      logger.error('Error changing phone', { error: error.message, userId: req.user._id });
      
      if (error.message === 'PHONE_ALREADY_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'PHONE_ALREADY_EXISTS', message: 'رقم الهاتف مستخدم بالفعل' }
        });
      }

      if (error.message === 'INVALID_OTP') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_OTP', message: 'رمز التحقق غير صحيح' }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'CHANGE_FAILED', message: 'فشل تغيير رقم الهاتف' }
        });
    }
  };

  /**
   * POST /api/settings/password/change
   * تغيير كلمة المرور
   */
  changePassword = async (req, res) => {
    try {
      const userId = req.user._id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'كلمة المرور القديمة والجديدة مطلوبتان' }
        });
      }

      await this.passwordChangeService.changePassword(userId, oldPassword, newPassword);

      logger.info('Password changed successfully', { userId });

      res.json({
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح'
      });
    } catch (error) {
      logger.error('Error changing password', { error: error.message, userId: req.user._id });
      
      if (error.message === 'INVALID_PASSWORD') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'كلمة المرور الحالية غير صحيحة' }
        });
      }

      if (error.message === 'WEAK_PASSWORD') {
        return res.status(400).json({
          success: false,
          error: { code: 'WEAK_PASSWORD', message: 'كلمة المرور الجديدة ضعيفة' }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'CHANGE_FAILED', message: 'فشل تغيير كلمة المرور' }
      });
    }
  };

  /**
   * GET /api/settings/privacy
   * الحصول على إعدادات الخصوصية
   */
  getPrivacySettings = async (req, res) => {
    try {
      const userId = req.user._id;
      const settings = await this.settingsService.getPrivacySettings(userId);

      res.json({
        success: true,
        data: { privacy: settings }
      });
    } catch (error) {
      logger.error('Error getting privacy settings', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'GET_FAILED', message: 'فشل الحصول على إعدادات الخصوصية' }
      });
    }
  };

  /**
   * PUT /api/settings/privacy
   * تحديث إعدادات الخصوصية
   */
  updatePrivacySettings = async (req, res) => {
    try {
      const userId = req.user._id;
      const settings = req.body;

      await this.settingsService.updatePrivacySettings(userId, settings);

      logger.info('Privacy settings updated', { userId });

      res.json({
        success: true,
        message: 'تم تحديث إعدادات الخصوصية بنجاح'
      });
    } catch (error) {
      logger.error('Error updating privacy settings', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'فشل تحديث إعدادات الخصوصية' }
      });
    }
  };

  /**
   * GET /api/settings/notifications
   * الحصول على تفضيلات الإشعارات
   */
  getNotificationPreferences = async (req, res) => {
    try {
      const userId = req.user._id;
      const preferences = await this.settingsService.getNotificationPreferences(userId);

      res.json({
        success: true,
        data: { notifications: preferences }
      });
    } catch (error) {
      logger.error('Error getting notification preferences', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'GET_FAILED', message: 'فشل الحصول على تفضيلات الإشعارات' }
      });
    }
  };

  /**
   * PUT /api/settings/notifications
   * تحديث تفضيلات الإشعارات
   */
  updateNotificationPreferences = async (req, res) => {
    try {
      const userId = req.user._id;
      const preferences = req.body;

      await this.settingsService.updateNotificationPreferences(userId, preferences);

      logger.info('Notification preferences updated', { userId });

      res.json({
        success: true,
        message: 'تم تحديث تفضيلات الإشعارات بنجاح'
      });
    } catch (error) {
      logger.error('Error updating notification preferences', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'فشل تحديث تفضيلات الإشعارات' }
      });
    }
  };
}

module.exports = new SettingsController();
