/**
 * Frontend Screen Share Service
 * خدمة مشاركة الشاشة من جانب العميل
 * 
 * الميزات:
 * - مشاركة الشاشة الكاملة
 * - مشاركة نافذة محددة
 * - مشاركة تبويب المتصفح
 * - معالجة الأخطاء
 */

class ScreenShareService {
  constructor() {
    this.currentStream = null;
    this.shareType = null;
  }

  /**
   * بدء مشاركة الشاشة الكاملة
   * @returns {Promise<MediaStream>}
   */
  async startFullScreenShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // شاشة كاملة
          width: { min: 1280, ideal: 1920, max: 3840 }, // دعم حتى 4K
          height: { min: 720, ideal: 1080, max: 2160 }, // دعم حتى 4K
          frameRate: { min: 24, ideal: 30, max: 60 }
        },
        audio: false
      });

      this.currentStream = stream;
      this.shareType = 'screen';

      // التحقق من جودة المشاركة
      this.logShareQuality(stream, 'Full Screen');

      // الاستماع لحدث إيقاف المشاركة من المتصفح
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.handleStreamEnded();
      });

      return stream;
    } catch (error) {
      console.error('Error starting full screen share:', error);
      throw this.handleError(error);
    }
  }

  /**
   * بدء مشاركة نافذة محددة
   * @returns {Promise<MediaStream>}
   */
  async startWindowShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window', // نافذة محددة
          width: { min: 1280, ideal: 1920, max: 3840 },
          height: { min: 720, ideal: 1080, max: 2160 },
          frameRate: { min: 24, ideal: 30, max: 60 }
        },
        audio: false
      });

      this.currentStream = stream;
      this.shareType = 'window';

      // التحقق من جودة المشاركة
      this.logShareQuality(stream, 'Window');

      // الاستماع لحدث إيقاف المشاركة
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.handleStreamEnded();
      });

      return stream;
    } catch (error) {
      console.error('Error starting window share:', error);
      throw this.handleError(error);
    }
  }

  /**
   * بدء مشاركة تبويب المتصفح
   * @returns {Promise<MediaStream>}
   */
  async startTabShare() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser', // تبويب المتصفح
          width: { min: 1280, ideal: 1920, max: 3840 },
          height: { min: 720, ideal: 1080, max: 2160 },
          frameRate: { min: 24, ideal: 30, max: 60 }
        },
        audio: true // يمكن مشاركة صوت التبويب
      });

      this.currentStream = stream;
      this.shareType = 'tab';

      // التحقق من جودة المشاركة
      this.logShareQuality(stream, 'Tab');

      // الاستماع لحدث إيقاف المشاركة
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.handleStreamEnded();
      });

      return stream;
    } catch (error) {
      console.error('Error starting tab share:', error);
      throw this.handleError(error);
    }
  }

  /**
   * بدء مشاركة الشاشة (يعرض خيارات للمستخدم)
   * @param {Object} options - خيارات المشاركة
   * @returns {Promise<MediaStream>}
   */
  async startScreenShare(options = {}) {
    try {
      const constraints = {
        video: {
          width: { 
            min: options.minWidth || 1280,
            ideal: options.width || 1920,
            max: options.maxWidth || 3840
          },
          height: { 
            min: options.minHeight || 720,
            ideal: options.height || 1080,
            max: options.maxHeight || 2160
          },
          frameRate: { 
            min: options.minFrameRate || 24,
            ideal: options.frameRate || 30,
            max: options.maxFrameRate || 60
          }
        },
        audio: options.audio || false
      };

      // إذا كان displaySurface محدد، أضفه
      if (options.displaySurface) {
        constraints.video.displaySurface = options.displaySurface;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      this.currentStream = stream;
      this.shareType = this.detectShareType(stream);

      // التحقق من جودة المشاركة
      this.logShareQuality(stream, 'Custom');

      // الاستماع لحدث إيقاف المشاركة
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.handleStreamEnded();
      });

      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw this.handleError(error);
    }
  }

  /**
   * إيقاف مشاركة الشاشة
   */
  stopScreenShare() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
      this.shareType = null;
    }
  }

  /**
   * الحصول على stream الحالي
   * @returns {MediaStream|null}
   */
  getCurrentStream() {
    return this.currentStream;
  }

  /**
   * الحصول على نوع المشاركة الحالي
   * @returns {string|null}
   */
  getShareType() {
    return this.shareType;
  }

  /**
   * التحقق من وجود مشاركة نشطة
   * @returns {boolean}
   */
  isSharing() {
    return this.currentStream !== null && 
           this.currentStream.getVideoTracks().length > 0 &&
           this.currentStream.getVideoTracks()[0].readyState === 'live';
  }

  /**
   * الحصول على معلومات جودة المشاركة
   * @returns {Object}
   */
  getQuality() {
    if (!this.currentStream) {
      return null;
    }

    const videoTrack = this.currentStream.getVideoTracks()[0];
    if (!videoTrack) {
      return null;
    }

    const settings = videoTrack.getSettings();
    
    return {
      width: settings.width || 0,
      height: settings.height || 0,
      frameRate: settings.frameRate || 0,
      aspectRatio: settings.aspectRatio || 0,
      isHD: settings.height >= 720,
      isFullHD: settings.height >= 1080,
      is4K: settings.height >= 2160
    };
  }

  /**
   * تسجيل جودة المشاركة
   * @param {MediaStream} stream
   * @param {string} type
   */
  logShareQuality(stream, type) {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      console.warn('⚠️ No video track found in stream');
      return;
    }

    const settings = videoTrack.getSettings();
    const quality = {
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
      aspectRatio: settings.aspectRatio
    };

    console.log(`📺 ${type} Share Quality:`, quality);

    // التحقق من تحقيق جودة 1080p
    if (settings.height >= 1080) {
      console.log('✅ Full HD (1080p) quality achieved!');
    } else if (settings.height >= 720) {
      console.log('✅ HD (720p) quality achieved');
    } else {
      console.warn('⚠️ Quality is below HD (720p):', settings.height);
    }

    // تحذير إذا كان frame rate منخفض
    if (settings.frameRate < 24) {
      console.warn('⚠️ Frame rate is below 24fps:', settings.frameRate);
    }
  }

  /**
   * تبديل مصدر المشاركة
   * @param {string} newType - النوع الجديد (screen/window/tab)
   * @returns {Promise<MediaStream>}
   */
  async switchSource(newType) {
    // إيقاف المشاركة الحالية
    this.stopScreenShare();

    // بدء مشاركة جديدة
    switch (newType) {
      case 'screen':
        return await this.startFullScreenShare();
      case 'window':
        return await this.startWindowShare();
      case 'tab':
        return await this.startTabShare();
      default:
        return await this.startScreenShare();
    }
  }

  /**
   * اكتشاف نوع المشاركة من stream
   * @param {MediaStream} stream
   * @returns {string}
   */
  detectShareType(stream) {
    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      return 'unknown';
    }

    const settings = videoTrack.getSettings();
    
    // محاولة اكتشاف النوع من displaySurface
    if (settings.displaySurface) {
      switch (settings.displaySurface) {
        case 'monitor':
          return 'screen';
        case 'window':
          return 'window';
        case 'browser':
          return 'tab';
        default:
          return 'unknown';
      }
    }

    return 'unknown';
  }

  /**
   * معالجة انتهاء stream
   */
  handleStreamEnded() {
    console.log('Screen share ended by user');
    this.currentStream = null;
    this.shareType = null;
    
    // يمكن إطلاق حدث مخصص هنا
    window.dispatchEvent(new CustomEvent('screenshare-ended'));
  }

  /**
   * معالجة الأخطاء
   * @param {Error} error
   * @returns {Error}
   */
  handleError(error) {
    if (error.name === 'NotAllowedError') {
      return new Error('تم رفض إذن مشاركة الشاشة');
    } else if (error.name === 'NotFoundError') {
      return new Error('لم يتم العثور على شاشة للمشاركة');
    } else if (error.name === 'NotSupportedError') {
      return new Error('مشاركة الشاشة غير مدعومة في هذا المتصفح');
    } else if (error.name === 'AbortError') {
      return new Error('تم إلغاء مشاركة الشاشة');
    } else {
      return new Error(`خطأ في مشاركة الشاشة: ${error.message}`);
    }
  }

  /**
   * التحقق من دعم مشاركة الشاشة
   * @returns {boolean}
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }
}

export default ScreenShareService;
