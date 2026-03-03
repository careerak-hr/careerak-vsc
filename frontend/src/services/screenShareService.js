/**
 * Screen Share Service
 * خدمة مشاركة الشاشة مع دعم 1080p
 * 
 * Features:
 * - Share entire screen
 * - Share specific window
 * - Share browser tab
 * - High quality (1080p) screen sharing
 * - Switch between sources
 * - Stop sharing
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

class ScreenShareService {
  constructor() {
    this.screenStream = null;
    this.isSharing = false;
    this.currentSource = null; // 'screen', 'window', or 'tab'
    
    // High quality constraints for screen sharing (1080p)
    this.displayMediaConstraints = {
      video: {
        width: { ideal: 1920, max: 3840 },      // Up to 4K
        height: { ideal: 1080, max: 2160 },     // Up to 4K
        frameRate: { ideal: 30, max: 60 },
        cursor: 'always',                        // Show cursor
        displaySurface: 'monitor'                // Prefer full screen
      },
      audio: false // Screen audio can be enabled if needed
    };
  }

  /**
   * Start screen sharing
   * بدء مشاركة الشاشة
   * 
   * @param {Object} options - Sharing options
   * @param {boolean} options.audio - Include system audio (default: false)
   * @param {string} options.preferredSource - 'screen', 'window', or 'tab'
   * @returns {Promise<MediaStream>} - Screen share stream
   */
  async startScreenShare(options = {}) {
    try {
      console.log('Starting screen share...');

      // Check if already sharing
      if (this.isSharing) {
        console.warn('Screen sharing already active');
        return this.screenStream;
      }

      // Prepare constraints
      const constraints = {
        video: { ...this.displayMediaConstraints.video },
        audio: options.audio || false
      };

      // Set preferred source if specified
      if (options.preferredSource) {
        switch (options.preferredSource) {
          case 'screen':
            constraints.video.displaySurface = 'monitor';
            break;
          case 'window':
            constraints.video.displaySurface = 'window';
            break;
          case 'tab':
            constraints.video.displaySurface = 'browser';
            break;
        }
      }

      // Request screen share
      this.screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      // Log actual settings
      const videoTrack = this.screenStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      
      console.log('Screen share started:', {
        width: settings.width,
        height: settings.height,
        frameRate: settings.frameRate,
        displaySurface: settings.displaySurface,
        cursor: settings.cursor,
        isHD: settings.height >= 1080
      });

      // Determine source type
      this.currentSource = this.determineSourceType(settings.displaySurface);

      // Set sharing flag
      this.isSharing = true;

      // Handle track ended (user stops sharing from browser UI)
      videoTrack.onended = () => {
        console.log('Screen sharing stopped by user');
        this.stopScreenShare();
      };

      // Verify quality
      if (settings.height >= 1080) {
        console.log('✅ Full HD (1080p) screen sharing achieved');
      } else if (settings.height >= 720) {
        console.log('⚠️ HD (720p) screen sharing - lower than target 1080p');
      } else {
        console.warn('⚠️ Screen sharing quality below HD:', `${settings.width}x${settings.height}`);
      }

      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      
      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        throw new Error('Screen sharing permission denied by user');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No screen sharing source available');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Screen sharing not supported in this browser');
      } else if (error.name === 'AbortError') {
        throw new Error('Screen sharing cancelled by user');
      }
      
      throw error;
    }
  }

  /**
   * Stop screen sharing
   * إيقاف مشاركة الشاشة
   */
  stopScreenShare() {
    try {
      console.log('Stopping screen share...');

      if (this.screenStream) {
        // Stop all tracks
        this.screenStream.getTracks().forEach(track => {
          track.stop();
          console.log(`Stopped ${track.kind} track`);
        });

        this.screenStream = null;
      }

      this.isSharing = false;
      this.currentSource = null;

      console.log('✅ Screen sharing stopped');
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  }

  /**
   * Switch screen share source
   * تبديل مصدر مشاركة الشاشة
   * 
   * Allows user to switch between screen/window/tab without stopping
   * 
   * @param {Object} options - New source options
   * @returns {Promise<MediaStream>} - New screen share stream
   */
  async switchSource(options = {}) {
    try {
      console.log('Switching screen share source...');

      // Stop current sharing
      this.stopScreenShare();

      // Start new sharing with new options
      return await this.startScreenShare(options);
    } catch (error) {
      console.error('Error switching screen share source:', error);
      throw error;
    }
  }

  /**
   * Replace track in peer connection
   * استبدال المسار في اتصال peer
   * 
   * @param {RTCPeerConnection} peerConnection - The peer connection
   * @param {MediaStreamTrack} newTrack - New screen share track
   * @returns {Promise<void>}
   */
  async replaceTrackInPeerConnection(peerConnection, newTrack) {
    try {
      if (!peerConnection) {
        throw new Error('No peer connection provided');
      }

      // Find video sender
      const senders = peerConnection.getSenders();
      const videoSender = senders.find(sender => sender.track?.kind === 'video');

      if (!videoSender) {
        throw new Error('No video sender found in peer connection');
      }

      // Replace track
      await videoSender.replaceTrack(newTrack);
      console.log('✅ Screen share track replaced in peer connection');
    } catch (error) {
      console.error('Error replacing track in peer connection:', error);
      throw error;
    }
  }

  /**
   * Add screen share track to peer connection
   * إضافة مسار مشاركة الشاشة إلى اتصال peer
   * 
   * @param {RTCPeerConnection} peerConnection - The peer connection
   * @returns {Promise<void>}
   */
  async addTrackToPeerConnection(peerConnection) {
    try {
      if (!peerConnection) {
        throw new Error('No peer connection provided');
      }

      if (!this.screenStream) {
        throw new Error('No screen share stream available');
      }

      const videoTrack = this.screenStream.getVideoTracks()[0];
      
      // Add track to peer connection
      peerConnection.addTrack(videoTrack, this.screenStream);
      console.log('✅ Screen share track added to peer connection');
    } catch (error) {
      console.error('Error adding track to peer connection:', error);
      throw error;
    }
  }

  /**
   * Determine source type from display surface
   * تحديد نوع المصدر من سطح العرض
   * 
   * @param {string} displaySurface - Display surface type
   * @returns {string} - Source type ('screen', 'window', or 'tab')
   */
  determineSourceType(displaySurface) {
    switch (displaySurface) {
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

  /**
   * Get screen share stream
   * الحصول على بث مشاركة الشاشة
   * 
   * @returns {MediaStream|null}
   */
  getScreenStream() {
    return this.screenStream;
  }

  /**
   * Check if currently sharing
   * التحقق من المشاركة الحالية
   * 
   * @returns {boolean}
   */
  isScreenSharing() {
    return this.isSharing;
  }

  /**
   * Get current source type
   * الحصول على نوع المصدر الحالي
   * 
   * @returns {string|null} - 'screen', 'window', 'tab', or null
   */
  getCurrentSource() {
    return this.currentSource;
  }

  /**
   * Get screen share settings
   * الحصول على إعدادات مشاركة الشاشة
   * 
   * @returns {Object|null} - Current screen share settings
   */
  getScreenShareSettings() {
    if (!this.screenStream) {
      return null;
    }

    const videoTrack = this.screenStream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();

    return {
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
      displaySurface: settings.displaySurface,
      cursor: settings.cursor,
      source: this.currentSource,
      isHD: settings.height >= 1080,
      quality: this.getQualityLevel(settings.height)
    };
  }

  /**
   * Get quality level based on resolution
   * الحصول على مستوى الجودة بناءً على الدقة
   * 
   * @param {number} height - Video height
   * @returns {string} - Quality level
   */
  getQualityLevel(height) {
    if (height >= 2160) return '4K';
    if (height >= 1440) return '2K';
    if (height >= 1080) return 'Full HD';
    if (height >= 720) return 'HD';
    return 'SD';
  }

  /**
   * Check if screen sharing is supported
   * التحقق من دعم مشاركة الشاشة
   * 
   * @returns {boolean}
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  /**
   * Get supported constraints
   * الحصول على القيود المدعومة
   * 
   * @returns {Object}
   */
  getSupportedConstraints() {
    if (navigator.mediaDevices && navigator.mediaDevices.getSupportedConstraints) {
      return navigator.mediaDevices.getSupportedConstraints();
    }
    return {};
  }

  /**
   * Cleanup resources
   * تنظيف الموارد
   */
  cleanup() {
    this.stopScreenShare();
  }
}

export default ScreenShareService;
