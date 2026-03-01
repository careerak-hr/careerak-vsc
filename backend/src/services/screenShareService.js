/**
 * Screen Share Service
 * خدمة مشاركة الشاشة لنظام الفيديو للمقابلات
 * 
 * الميزات:
 * - مشاركة الشاشة الكاملة
 * - مشاركة نافذة محددة
 * - مشاركة تبويب المتصفح
 * - إدارة حالة المشاركة
 * - التحكم في جودة المشاركة
 */

class ScreenShareService {
  constructor() {
    this.activeShares = new Map(); // roomId -> { userId, type, stream }
  }

  /**
   * بدء مشاركة الشاشة
   * @param {string} roomId - معرف الغرفة
   * @param {string} userId - معرف المستخدم
   * @param {string} type - نوع المشاركة (screen/window/tab)
   * @param {MediaStream} stream - stream المشاركة
   * @returns {Object} معلومات المشاركة
   */
  async startScreenShare(roomId, userId, type, stream) {
    try {
      // التحقق من عدم وجود مشاركة نشطة في الغرفة
      if (this.activeShares.has(roomId)) {
        const currentShare = this.activeShares.get(roomId);
        throw new Error(`Screen share already active by user ${currentShare.userId}`);
      }

      // حفظ معلومات المشاركة
      const shareInfo = {
        userId,
        type,
        stream,
        startedAt: new Date(),
        quality: this.getStreamQuality(stream)
      };

      this.activeShares.set(roomId, shareInfo);

      return {
        success: true,
        roomId,
        userId,
        type,
        quality: shareInfo.quality,
        startedAt: shareInfo.startedAt
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  /**
   * إيقاف مشاركة الشاشة
   * @param {string} roomId - معرف الغرفة
   * @param {string} userId - معرف المستخدم
   * @returns {Object} نتيجة الإيقاف
   */
  async stopScreenShare(roomId, userId) {
    try {
      const shareInfo = this.activeShares.get(roomId);

      if (!shareInfo) {
        throw new Error('No active screen share found');
      }

      if (shareInfo.userId !== userId) {
        throw new Error('Only the sharing user can stop the screen share');
      }

      // إيقاف جميع tracks
      if (shareInfo.stream) {
        shareInfo.stream.getTracks().forEach(track => track.stop());
      }

      // حذف المشاركة
      this.activeShares.delete(roomId);

      return {
        success: true,
        roomId,
        userId,
        duration: Date.now() - shareInfo.startedAt.getTime()
      };
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  }

  /**
   * الحصول على معلومات المشاركة النشطة
   * @param {string} roomId - معرف الغرفة
   * @returns {Object|null} معلومات المشاركة أو null
   */
  getActiveShare(roomId) {
    const shareInfo = this.activeShares.get(roomId);
    
    if (!shareInfo) {
      return null;
    }

    return {
      userId: shareInfo.userId,
      type: shareInfo.type,
      quality: shareInfo.quality,
      startedAt: shareInfo.startedAt,
      duration: Date.now() - shareInfo.startedAt.getTime()
    };
  }

  /**
   * التحقق من وجود مشاركة نشطة
   * @param {string} roomId - معرف الغرفة
   * @returns {boolean}
   */
  hasActiveShare(roomId) {
    return this.activeShares.has(roomId);
  }

  /**
   * الحصول على جودة stream المشاركة
   * @param {MediaStream} stream
   * @returns {Object} معلومات الجودة
   */
  getStreamQuality(stream) {
    const videoTrack = stream.getVideoTracks()[0];
    
    if (!videoTrack) {
      return { width: 0, height: 0, frameRate: 0 };
    }

    const settings = videoTrack.getSettings();
    
    return {
      width: settings.width || 0,
      height: settings.height || 0,
      frameRate: settings.frameRate || 0
    };
  }

  /**
   * تبديل مصدر المشاركة (من شاشة إلى نافذة مثلاً)
   * @param {string} roomId - معرف الغرفة
   * @param {string} userId - معرف المستخدم
   * @param {string} newType - النوع الجديد
   * @param {MediaStream} newStream - stream الجديد
   * @returns {Object} نتيجة التبديل
   */
  async switchSource(roomId, userId, newType, newStream) {
    try {
      const shareInfo = this.activeShares.get(roomId);

      if (!shareInfo) {
        throw new Error('No active screen share found');
      }

      if (shareInfo.userId !== userId) {
        throw new Error('Only the sharing user can switch source');
      }

      // إيقاف stream القديم
      if (shareInfo.stream) {
        shareInfo.stream.getTracks().forEach(track => track.stop());
      }

      // تحديث المشاركة
      shareInfo.type = newType;
      shareInfo.stream = newStream;
      shareInfo.quality = this.getStreamQuality(newStream);

      return {
        success: true,
        roomId,
        userId,
        newType,
        quality: shareInfo.quality
      };
    } catch (error) {
      console.error('Error switching source:', error);
      throw error;
    }
  }

  /**
   * تنظيف المشاركات المنتهية
   */
  cleanup() {
    for (const [roomId, shareInfo] of this.activeShares.entries()) {
      if (shareInfo.stream) {
        shareInfo.stream.getTracks().forEach(track => track.stop());
      }
      this.activeShares.delete(roomId);
    }
  }
}

module.exports = ScreenShareService;
