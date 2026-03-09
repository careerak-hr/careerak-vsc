const TwoFactorService = require('../services/twoFactorService');
const SessionService = require('../services/sessionService');
const logger = require('../utils/logger');

/**
 * Security Controller
 * معالج طلبات الأمان (2FA, Sessions, Login History)
 */
class SecurityController {
  constructor() {
    this.twoFactorService = new TwoFactorService();
    this.sessionService = new SessionService();
  }

  /**
   * POST /api/settings/2fa/enable
   * تفعيل المصادقة الثنائية
   */
  enable2FA = async (req, res) => {
    try {
      const userId = req.user._id;

      const result = await this.twoFactorService.enable2FA(userId);

      logger.info('2FA enabled', { userId });

      res.json({
        success: true,
        data: {
          qrCode: result.qrCode,
          secret: result.secret,
          backupCodes: result.backupCodes
        },
        message: 'تم تفعيل المصادقة الثنائية بنجاح'
      });
    } catch (error) {
      logger.error('Error enabling 2FA', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'ENABLE_FAILED', message: 'فشل تفعيل المصادقة الثنائية' }
      });
    }
  };

  /**
   * POST /api/settings/2fa/disable
   * تعطيل المصادقة الثنائية
   */
  disable2FA = async (req, res) => {
    try {
      const userId = req.user._id;
      const { otp, password } = req.body;

      if (!otp || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'رمز التحقق وكلمة المرور مطلوبان' }
        });
      }

      await this.twoFactorService.disable2FA(userId, otp, password);

      logger.info('2FA disabled', { userId });

      res.json({
        success: true,
        message: 'تم تعطيل المصادقة الثنائية بنجاح'
      });
    } catch (error) {
      logger.error('Error disabling 2FA', { error: error.message, userId: req.user._id });
      
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
        error: { code: 'DISABLE_FAILED', message: 'فشل تعطيل المصادقة الثنائية' }
      });
    }
  };

  /**
   * GET /api/settings/2fa/backup-codes
   * الحصول على أكواد الاحتياط
   */
  getBackupCodes = async (req, res) => {
    try {
      const userId = req.user._id;

      const backupCodes = await this.twoFactorService.getBackupCodes(userId);

      res.json({
        success: true,
        data: { backupCodes }
      });
    } catch (error) {
      logger.error('Error getting backup codes', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'GET_FAILED', message: 'فشل الحصول على أكواد الاحتياط' }
      });
    }
  };

  /**
   * POST /api/settings/2fa/regenerate-codes
   * إعادة إنشاء أكواد الاحتياط
   */
  regenerateBackupCodes = async (req, res) => {
    try {
      const userId = req.user._id;

      const backupCodes = await this.twoFactorService.regenerateBackupCodes(userId);

      logger.info('Backup codes regenerated', { userId });

      res.json({
        success: true,
        data: { backupCodes },
        message: 'تم إعادة إنشاء أكواد الاحتياط بنجاح'
      });
    } catch (error) {
      logger.error('Error regenerating backup codes', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'REGENERATE_FAILED', message: 'فشل إعادة إنشاء أكواد الاحتياط' }
      });
    }
  };

  /**
   * GET /api/settings/sessions
   * الحصول على جميع الجلسات النشطة
   */
  getActiveSessions = async (req, res) => {
    try {
      const userId = req.user._id;

      const sessions = await this.sessionService.getActiveSessions(userId);

      res.json({
        success: true,
        data: { sessions }
      });
    } catch (error) {
      logger.error('Error getting active sessions', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'GET_FAILED', message: 'فشل الحصول على الجلسات النشطة' }
      });
    }
  };

  /**
   * DELETE /api/settings/sessions/:id
   * تسجيل الخروج من جلسة محددة
   */
  logoutSession = async (req, res) => {
    try {
      const userId = req.user._id;
      const sessionId = req.params.id;

      await this.sessionService.logoutSession(userId, sessionId);

      logger.info('Session logged out', { userId, sessionId });

      res.json({
        success: true,
        message: 'تم تسجيل الخروج من الجلسة بنجاح'
      });
    } catch (error) {
      logger.error('Error logging out session', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'LOGOUT_FAILED', message: 'فشل تسجيل الخروج من الجلسة' }
      });
    }
  };

  /**
   * DELETE /api/settings/sessions/others
   * تسجيل الخروج من جميع الجلسات الأخرى
   */
  logoutAllOtherSessions = async (req, res) => {
    try {
      const userId = req.user._id;
      const currentSessionId = req.sessionID || req.headers['x-session-id'];

      await this.sessionService.logoutAllOtherSessions(userId, currentSessionId);

      logger.info('All other sessions logged out', { userId });

      res.json({
        success: true,
        message: 'تم تسجيل الخروج من جميع الجلسات الأخرى بنجاح'
      });
    } catch (error) {
      logger.error('Error logging out all other sessions', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'LOGOUT_FAILED', message: 'فشل تسجيل الخروج من الجلسات' }
      });
    }
  };

  /**
   * GET /api/settings/login-history
   * الحصول على سجل تسجيل الدخول
   */
  getLoginHistory = async (req, res) => {
    try {
      const userId = req.user._id;
      const limit = parseInt(req.query.limit) || 50;

      const history = await this.sessionService.getLoginHistory(userId, limit);

      res.json({
        success: true,
        data: { history }
      });
    } catch (error) {
      logger.error('Error getting login history', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'GET_FAILED', message: 'فشل الحصول على سجل تسجيل الدخول' }
      });
    }
  };
}

module.exports = new SecurityController();
