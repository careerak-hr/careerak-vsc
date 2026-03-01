/**
 * Screen Share Controller
 * معالج طلبات مشاركة الشاشة
 */

const ScreenShareService = require('../services/screenShareService');

class ScreenShareController {
  constructor() {
    this.screenShareService = new ScreenShareService();
  }

  /**
   * بدء مشاركة الشاشة
   * POST /api/screen-share/start
   */
  async startScreenShare(req, res) {
    try {
      const { roomId, options } = req.body;
      const userId = req.user.id;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      // التحقق من عدم وجود مشاركة نشطة
      if (this.screenShareService.isScreenShareActive(roomId)) {
        const activeShare = this.screenShareService.getActiveScreenShare(roomId);
        return res.status(409).json({
          success: false,
          message: 'Screen is already being shared in this room',
          activeShare: {
            userId: activeShare.userId,
            shareType: activeShare.shareType,
            duration: activeShare.duration
          }
        });
      }

      // ملاحظة: في الواقع، startScreenShare يتم استدعاؤه من Frontend
      // هذا endpoint للتحقق والتسجيل فقط
      
      res.json({
        success: true,
        message: 'Screen share can be started',
        roomId,
        userId
      });
    } catch (error) {
      console.error('Error in startScreenShare:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start screen share'
      });
    }
  }

  /**
   * إيقاف مشاركة الشاشة
   * POST /api/screen-share/stop
   */
  async stopScreenShare(req, res) {
    try {
      const { roomId } = req.body;
      const userId = req.user.id;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      // التحقق من وجود مشاركة نشطة
      if (!this.screenShareService.isScreenShareActive(roomId)) {
        return res.status(404).json({
          success: false,
          message: 'No active screen share in this room'
        });
      }

      const activeShare = this.screenShareService.getActiveScreenShare(roomId);

      // التحقق من أن المستخدم هو من بدأ المشاركة
      if (activeShare.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the user who started screen share can stop it'
        });
      }

      // إيقاف المشاركة
      this.screenShareService.stopScreenShare(roomId, userId);

      res.json({
        success: true,
        message: 'Screen share stopped successfully',
        duration: activeShare.duration
      });
    } catch (error) {
      console.error('Error in stopScreenShare:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to stop screen share'
      });
    }
  }

  /**
   * الحصول على حالة مشاركة الشاشة
   * GET /api/screen-share/status/:roomId
   */
  async getScreenShareStatus(req, res) {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      const isActive = this.screenShareService.isScreenShareActive(roomId);
      const activeShare = this.screenShareService.getActiveScreenShare(roomId);

      res.json({
        success: true,
        isActive,
        activeShare: activeShare ? {
          userId: activeShare.userId,
          shareType: activeShare.shareType,
          startedAt: activeShare.startedAt,
          duration: activeShare.duration,
          settings: activeShare.settings
        } : null
      });
    } catch (error) {
      console.error('Error in getScreenShareStatus:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get screen share status'
      });
    }
  }

  /**
   * الحصول على إحصائيات مشاركة الشاشة
   * GET /api/screen-share/stats/:roomId
   */
  async getScreenShareStats(req, res) {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      const stats = this.screenShareService.getScreenShareStats(roomId);

      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'No active screen share in this room'
        });
      }

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Error in getScreenShareStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get screen share stats'
      });
    }
  }

  /**
   * تبديل مصدر المشاركة
   * POST /api/screen-share/switch-source
   */
  async switchSource(req, res) {
    try {
      const { roomId, options } = req.body;
      const userId = req.user.id;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID is required'
        });
      }

      // التحقق من وجود مشاركة نشطة
      if (!this.screenShareService.isScreenShareActive(roomId)) {
        return res.status(404).json({
          success: false,
          message: 'No active screen share in this room'
        });
      }

      const activeShare = this.screenShareService.getActiveScreenShare(roomId);

      // التحقق من أن المستخدم هو من بدأ المشاركة
      if (activeShare.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the user who started screen share can switch source'
        });
      }

      // ملاحظة: في الواقع، switchSource يتم استدعاؤه من Frontend
      // هذا endpoint للتحقق فقط

      res.json({
        success: true,
        message: 'Screen share source can be switched',
        roomId,
        userId
      });
    } catch (error) {
      console.error('Error in switchSource:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to switch screen share source'
      });
    }
  }
}

module.exports = new ScreenShareController();
