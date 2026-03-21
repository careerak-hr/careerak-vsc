const dataExportService = require('../services/dataExportService');
const accountDeletionService = require('../services/accountDeletionService');
const logger = require('../utils/logger');

/**
 * Data Controller
 * معالج طلبات البيانات (Export, Account Deletion)
 */
class DataController {
  constructor() {
    this.dataExportService = dataExportService;
    this.accountDeletionService = accountDeletionService;
  }

  /**
   * POST /api/settings/data/export
   * طلب تصدير البيانات
   */
  requestDataExport = async (req, res) => {
    try {
      const userId = req.user._id;
      const { dataTypes, format } = req.body;

      if (!dataTypes || !Array.isArray(dataTypes) || dataTypes.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DATA_TYPES', message: 'يجب تحديد أنواع البيانات المطلوبة' }
        });
      }

      if (!format || !['json', 'csv', 'pdf'].includes(format)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_FORMAT', message: 'صيغة التصدير غير صحيحة' }
        });
      }

      const requestId = await this.dataExportService.requestExport(userId, { dataTypes, format });

      logger.info('Data export requested', { userId, requestId, dataTypes, format });

      res.json({
        success: true,
        data: { requestId },
        message: 'تم إنشاء طلب التصدير بنجاح. سيتم إشعارك عند اكتمال التصدير.'
      });
    } catch (error) {
      logger.error('Error requesting data export', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'REQUEST_FAILED', message: 'فشل إنشاء طلب التصدير' }
      });
    }
  };

  /**
   * GET /api/settings/data/export/:id
   * التحقق من حالة التصدير
   */
  getExportStatus = async (req, res) => {
    try {
      const userId = req.user._id;
      const requestId = req.params.id;

      const status = await this.dataExportService.getExportStatus(requestId);

      // التحقق من أن الطلب يخص المستخدم الحالي
      if (status.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'غير مصرح بالوصول لهذا الطلب' }
        });
      }

      res.json({
        success: true,
        data: { status }
      });
    } catch (error) {
      logger.error('Error getting export status', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'GET_FAILED', message: 'فشل الحصول على حالة التصدير' }
      });
    }
  };

  /**
   * GET /api/settings/data/download/:token
   * تحميل البيانات المصدرة
   */
  downloadExport = async (req, res) => {
    try {
      const token = req.params.token;

      const fileBuffer = await this.dataExportService.downloadExport(token);

      logger.info('Data export downloaded', { token });

      // تحديد نوع المحتوى بناءً على الصيغة
      const format = token.split('_').pop().split('.')[1] || 'json';
      const contentType = {
        json: 'application/json',
        csv: 'text/csv',
        pdf: 'application/pdf'
      }[format] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="careerak_data_export.${format}"`);
      res.send(fileBuffer);
    } catch (error) {
      logger.error('Error downloading export', { error: error.message, token: req.params.token });
      
      if (error.message === 'INVALID_TOKEN') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'رابط التحميل غير صحيح أو منتهي الصلاحية' }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'DOWNLOAD_FAILED', message: 'فشل تحميل البيانات' }
      });
    }
  };

  /**
   * POST /api/settings/account/delete
   * طلب حذف الحساب
   */
  requestAccountDeletion = async (req, res) => {
    try {
      const userId = req.user._id;
      const { type, password, otp } = req.body;

      if (!type || !['immediate', 'scheduled'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TYPE', message: 'نوع الحذف غير صحيح' }
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_PASSWORD', message: 'كلمة المرور مطلوبة' }
        });
      }

      await this.accountDeletionService.requestDeletion(userId, { type, password, otp });

      logger.info('Account deletion requested', { userId, type });

      const message = type === 'immediate' 
        ? 'تم حذف حسابك بنجاح'
        : 'تم جدولة حذف حسابك. لديك 30 يوماً لإلغاء الحذف.';

      res.json({
        success: true,
        message
      });
    } catch (error) {
      logger.error('Error requesting account deletion', { error: error.message, userId: req.user._id });
      
      if (error.message === 'INVALID_PASSWORD') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PASSWORD', message: 'كلمة المرور غير صحيحة' }
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
        error: { code: 'REQUEST_FAILED', message: 'فشل طلب حذف الحساب' }
      });
    }
  };

  /**
   * POST /api/settings/account/cancel-deletion
   * إلغاء طلب حذف الحساب
   */
  cancelAccountDeletion = async (req, res) => {
    try {
      const userId = req.user._id;

      await this.accountDeletionService.cancelDeletion(userId);

      logger.info('Account deletion cancelled', { userId });

      res.json({
        success: true,
        message: 'تم إلغاء طلب حذف الحساب بنجاح'
      });
    } catch (error) {
      logger.error('Error cancelling account deletion', { error: error.message, userId: req.user._id });
      
      if (error.message === 'NO_PENDING_DELETION') {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_PENDING_DELETION', message: 'لا يوجد طلب حذف معلق' }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'CANCEL_FAILED', message: 'فشل إلغاء طلب حذف الحساب' }
      });
    }
  };

  /**
   * GET /api/settings/account/deletion-status
   * التحقق من حالة حذف الحساب
   */
  getDeletionStatus = async (req, res) => {
    try {
      const userId = req.user._id;

      const status = await this.accountDeletionService.getDeletionStatus(userId);

      res.json({
        success: true,
        data: { status }
      });
    } catch (error) {
      logger.error('Error getting deletion status', { error: error.message, userId: req.user._id });
      res.status(500).json({
        success: false,
        error: { code: 'GET_FAILED', message: 'فشل الحصول على حالة حذف الحساب' }
      });
    }
  };
}

module.exports = new DataController();
