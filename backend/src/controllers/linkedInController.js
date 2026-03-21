const linkedInService = require('../services/linkedInService');
const crypto = require('crypto');

/**
 * LinkedIn Controller
 * يتعامل مع طلبات تكامل LinkedIn
 */
class LinkedInController {
  /**
   * الحصول على رابط OAuth للمصادقة
   * GET /api/linkedin/auth-url
   */
  async getAuthUrl(req, res) {
    try {
      // توليد state عشوائي للأمان
      const state = crypto.randomBytes(16).toString('hex');
      
      // حفظ state في session أو database للتحقق لاحقاً
      req.session = req.session || {};
      req.session.linkedInState = state;

      const authUrl = linkedInService.getAuthorizationUrl(state);

      res.json({
        success: true,
        authUrl: authUrl,
        state: state
      });
    } catch (error) {
      console.error('Error getting LinkedIn auth URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate LinkedIn authorization URL',
        messageAr: 'فشل في توليد رابط المصادقة مع LinkedIn',
        error: error.message
      });
    }
  }

  /**
   * معالجة callback من LinkedIn بعد المصادقة
   * GET /api/linkedin/callback
   */
  async handleCallback(req, res) {
    try {
      const { code, state, error } = req.query;

      // التحقق من وجود خطأ من LinkedIn
      if (error) {
        return res.status(400).json({
          success: false,
          message: `LinkedIn authorization error: ${error}`,
          messageAr: `خطأ في المصادقة مع LinkedIn: ${error}`
        });
      }

      // التحقق من state للأمان
      if (!state || state !== req.session?.linkedInState) {
        return res.status(400).json({
          success: false,
          message: 'Invalid state parameter',
          messageAr: 'معامل state غير صالح'
        });
      }

      // تبديل code بـ access token
      const tokenData = await linkedInService.exchangeCodeForToken(code);

      // حفظ access token في قاعدة البيانات
      await linkedInService.saveAccessToken(
        req.user._id,
        tokenData.accessToken,
        tokenData.expiresIn
      );

      // حذف state من session
      delete req.session.linkedInState;

      res.json({
        success: true,
        message: 'LinkedIn account connected successfully',
        messageAr: 'تم ربط حساب LinkedIn بنجاح',
        expiresIn: tokenData.expiresIn
      });
    } catch (error) {
      console.error('Error handling LinkedIn callback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to connect LinkedIn account',
        messageAr: 'فشل في ربط حساب LinkedIn',
        error: error.message
      });
    }
  }

  /**
   * مشاركة الشهادة على LinkedIn
   * POST /api/linkedin/share-certificate
   */
  async shareCertificate(req, res) {
    try {
      const { certificateId } = req.body;
      const userId = req.user._id;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message: 'Certificate ID is required',
          messageAr: 'معرف الشهادة مطلوب'
        });
      }

      // الحصول على access token من قاعدة البيانات
      const accessToken = await linkedInService.getAccessToken(userId);

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: 'LinkedIn account not connected or token expired',
          messageAr: 'حساب LinkedIn غير مربوط أو انتهت صلاحية التوكن',
          requiresAuth: true
        });
      }

      // مشاركة الشهادة
      const result = await linkedInService.shareCertificateAsPost(
        accessToken,
        certificateId,
        userId
      );

      res.json(result);
    } catch (error) {
      console.error('Error sharing certificate on LinkedIn:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to share certificate on LinkedIn',
        messageAr: 'فشل في مشاركة الشهادة على LinkedIn',
        error: error.message
      });
    }
  }

  /**
   * إضافة الشهادة إلى قسم Certifications
   * POST /api/linkedin/add-certification
   */
  async addCertification(req, res) {
    try {
      const { certificateId } = req.body;
      const userId = req.user._id;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message: 'Certificate ID is required',
          messageAr: 'معرف الشهادة مطلوب'
        });
      }

      // الحصول على access token من قاعدة البيانات
      const accessToken = await linkedInService.getAccessToken(userId);

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: 'LinkedIn account not connected or token expired',
          messageAr: 'حساب LinkedIn غير مربوط أو انتهت صلاحية التوكن',
          requiresAuth: true
        });
      }

      // إضافة الشهادة
      const result = await linkedInService.addToCertifications(
        accessToken,
        certificateId
      );

      res.json(result);
    } catch (error) {
      console.error('Error adding certification to LinkedIn:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add certification to LinkedIn',
        messageAr: 'فشل في إضافة الشهادة إلى LinkedIn',
        error: error.message
      });
    }
  }

  /**
   * إلغاء ربط حساب LinkedIn
   * DELETE /api/linkedin/unlink
   */
  async unlinkAccount(req, res) {
    try {
      const userId = req.user._id;

      const result = await linkedInService.unlinkAccount(userId);

      res.json(result);
    } catch (error) {
      console.error('Error unlinking LinkedIn account:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unlink LinkedIn account',
        messageAr: 'فشل في إلغاء ربط حساب LinkedIn',
        error: error.message
      });
    }
  }

  /**
   * التحقق من حالة ربط LinkedIn
   * GET /api/linkedin/status
   */
  async getConnectionStatus(req, res) {
    try {
      const userId = req.user._id;

      const accessToken = await linkedInService.getAccessToken(userId);
      const isConnected = !!accessToken;

      // إذا كان متصل، التحقق من صلاحية التوكن
      let isValid = false;
      if (isConnected) {
        isValid = await linkedInService.validateAccessToken(accessToken);
      }

      res.json({
        success: true,
        isConnected: isConnected && isValid,
        requiresReauth: isConnected && !isValid
      });
    } catch (error) {
      console.error('Error getting LinkedIn connection status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get LinkedIn connection status',
        messageAr: 'فشل في الحصول على حالة ربط LinkedIn',
        error: error.message
      });
    }
  }

  /**
   * الحصول على معلومات المستخدم من LinkedIn
   * GET /api/linkedin/profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user._id;

      const accessToken = await linkedInService.getAccessToken(userId);

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: 'LinkedIn account not connected',
          messageAr: 'حساب LinkedIn غير مربوط',
          requiresAuth: true
        });
      }

      const profile = await linkedInService.getUserProfile(accessToken);

      res.json(profile);
    } catch (error) {
      console.error('Error getting LinkedIn profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get LinkedIn profile',
        messageAr: 'فشل في الحصول على ملف LinkedIn الشخصي',
        error: error.message
      });
    }
  }
  /**
   * معاينة المنشور قبل النشر على LinkedIn
   * POST /api/linkedin/preview-post
   */
  async previewPost(req, res) {
    try {
      const { certificateId } = req.body;
      const userId = req.user._id;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message: 'Certificate ID is required',
          messageAr: 'معرف الشهادة مطلوب'
        });
      }

      // توليد المعاينة
      const preview = await linkedInService.generatePostPreview(certificateId, userId);

      res.json(preview);
    } catch (error) {
      console.error('Error generating LinkedIn post preview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate post preview',
        messageAr: 'فشل في توليد معاينة المنشور',
        error: error.message
      });
    }
  }

}

module.exports = new LinkedInController();
