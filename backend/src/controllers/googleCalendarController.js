const crypto = require('crypto');
const googleCalendarService = require('../services/googleCalendarService');

/**
 * Google Calendar Controller
 * يتعامل مع طلبات تكامل Google Calendar
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */
class GoogleCalendarController {
  /**
   * الحصول على رابط OAuth للمصادقة
   * GET /integrations/google/auth
   */
  async getAuthUrl(req, res) {
    try {
      const userId = req.user._id;
      const { url, state } = googleCalendarService.getAuthorizationUrl(userId);

      // حفظ state في session للتحقق لاحقاً
      req.session = req.session || {};
      req.session.googleCalendarState = state;

      res.json({
        success: true,
        authUrl: url,
        state,
      });
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في توليد رابط المصادقة مع Google',
        error: error.message,
      });
    }
  }

  /**
   * معالجة callback من Google بعد المصادقة
   * GET /integrations/google/callback
   */
  async handleCallback(req, res) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return res.status(400).json({
          success: false,
          message: `خطأ في المصادقة مع Google: ${error}`,
        });
      }

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          message: 'معاملات غير صالحة',
        });
      }

      // التحقق من state للحماية من CSRF
      const sessionState = req.session?.googleCalendarState;
      if (sessionState && state !== sessionState) {
        return res.status(400).json({
          success: false,
          message: 'معامل state غير صالح - محاولة CSRF محتملة',
        });
      }

      const result = await googleCalendarService.handleCallback(code, state);

      // حذف state من session
      if (req.session) {
        delete req.session.googleCalendarState;
      }

      res.json(result);
    } catch (error) {
      console.error('Error handling Google callback:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في ربط Google Calendar',
        error: error.message,
      });
    }
  }

  /**
   * مزامنة يدوية مع Google Calendar
   * POST /integrations/google/sync
   */
  async syncCalendar(req, res) {
    try {
      const userId = req.user._id;
      const result = await googleCalendarService.syncAppointments(userId);
      res.json(result);
    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      const status = error.message.includes('لا يوجد ربط') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: 'فشل في مزامنة Google Calendar',
        error: error.message,
      });
    }
  }

  /**
   * إلغاء ربط Google Calendar
   * DELETE /integrations/google/disconnect
   */
  async disconnect(req, res) {
    try {
      const userId = req.user._id;
      const result = await googleCalendarService.disconnectCalendar(userId);
      res.json(result);
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في إلغاء ربط Google Calendar',
        error: error.message,
      });
    }
  }

  /**
   * الحصول على حالة التكامل
   * GET /integrations/google/status
   */
  async getStatus(req, res) {
    try {
      const userId = req.user._id;
      const status = await googleCalendarService.getIntegrationStatus(userId);
      res.json({
        success: true,
        ...status,
      });
    } catch (error) {
      console.error('Error getting Google Calendar status:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في الحصول على حالة التكامل',
        error: error.message,
      });
    }
  }
}

module.exports = new GoogleCalendarController();
