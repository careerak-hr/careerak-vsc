/**
 * WebRTC Service
 * خدمة إدارة اتصالات WebRTC مع دعم HD (720p+)
 * 
 * Features:
 * - HD video constraints (1280x720 minimum)
 * - Audio enhancements (echo cancellation, noise suppression)
 * - Connection quality monitoring
 * - ICE candidate handling
 */

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.connectionQuality = 'unknown';
    
    // HD Video Constraints (720p minimum)
    this.mediaConstraints = {
      video: {
        width: { min: 1280, ideal: 1280, max: 1920 },
        height: { min: 720, ideal: 720, max: 1080 },
        frameRate: { min: 24, ideal: 30, max: 60 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      }
    };

    // ICE Servers Configuration
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // TURN server (يجب إضافة credentials في الإنتاج)
        // {
        //   urls: 'turn:turn.careerak.com:3478',
        //   username: 'careerak',
        //   credential: 'secure_password'
        // }
      ]
    };
  }

  /**
   * Get user media with HD constraints
   * الحصول على وسائط المستخدم مع قيود HD
   */
  async getUserMedia() {
    try {
      console.log('Requesting user media with HD constraints...');
      this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
      
      // Log actual video settings
      const videoTrack = this.localStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      console.log('Video settings:', {
        width: settings.width,
        height: settings.height,
        frameRate: settings.frameRate,
        isHD: settings.height >= 720
      });

      if (settings.height < 720) {
        console.warn('⚠️ Video quality is below HD (720p). Actual:', settings.height);
      } else {
        console.log('✅ HD video quality achieved:', `${settings.width}x${settings.height}`);
      }

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Fallback to lower quality if HD fails
      if (error.name === 'OverconstrainedError') {
        console.log('Falling back to standard quality...');
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: this.mediaConstraints.audio
          });
          return this.localStream;
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Create peer connection
   * إنشاء اتصال peer
   */
  createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(this.iceServers);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);
      };

      // Monitor connection quality
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        this.updateConnectionQuality();
      };

      // Start monitoring stats
      this.startStatsMonitoring();

      return this.peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  /**
   * Monitor connection statistics
   * مراقبة إحصائيات الاتصال
   */
  startStatsMonitoring() {
    if (!this.peerConnection) return;

    this.statsInterval = setInterval(async () => {
      try {
        const stats = await this.peerConnection.getStats();
        let inboundRtp = null;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            inboundRtp = report;
          }
        });

        if (inboundRtp) {
          const quality = this.calculateQuality(inboundRtp);
          this.connectionQuality = quality;
        }
      } catch (error) {
        console.error('Error getting stats:', error);
      }
    }, 2000);
  }

  /**
   * Calculate connection quality
   * حساب جودة الاتصال
   */
  calculateQuality(stats) {
    const packetsLost = stats.packetsLost || 0;
    const packetsReceived = stats.packetsReceived || 0;
    const totalPackets = packetsLost + packetsReceived;
    
    if (totalPackets === 0) return 'unknown';

    const lossRate = (packetsLost / totalPackets) * 100;

    if (lossRate < 2) return 'excellent';
    if (lossRate < 5) return 'good';
    return 'poor';
  }

  /**
   * Update connection quality
   * تحديث جودة الاتصال
   */
  updateConnectionQuality() {
    const state = this.peerConnection?.iceConnectionState;
    
    switch (state) {
      case 'connected':
      case 'completed':
        // Quality will be determined by stats
        break;
      case 'checking':
      case 'new':
        this.connectionQuality = 'unknown';
        break;
      case 'disconnected':
      case 'failed':
      case 'closed':
        this.connectionQuality = 'poor';
        break;
      default:
        this.connectionQuality = 'unknown';
    }
  }

  /**
   * Toggle audio
   * تبديل الصوت
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle video
   * تبديل الفيديو
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Switch camera (front/back) - for mobile devices
   * تبديل الكاميرا (أمامية/خلفية) - للأجهزة المحمولة
   * 
   * @returns {Promise<MediaStream>} - The new media stream with switched camera
   */
  async switchCamera() {
    try {
      if (!this.localStream) {
        throw new Error('No active stream to switch camera');
      }

      // Get current facing mode
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track found');
      }

      const currentSettings = videoTrack.getSettings();
      const currentFacingMode = currentSettings.facingMode || 'user';
      
      // Determine new facing mode
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      
      console.log(`Switching camera from ${currentFacingMode} to ${newFacingMode}...`);

      // Stop current video track
      videoTrack.stop();

      // Get new stream with switched camera
      const newConstraints = {
        ...this.mediaConstraints,
        video: {
          ...this.mediaConstraints.video,
          facingMode: { exact: newFacingMode }
        }
      };

      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(newConstraints);
      } catch (error) {
        // Fallback without 'exact' if device doesn't support the facing mode
        console.warn('Exact facing mode not supported, trying without exact...');
        newConstraints.video.facingMode = newFacingMode;
        this.localStream = await navigator.mediaDevices.getUserMedia(newConstraints);
      }

      // Update peer connection with new track
      if (this.peerConnection) {
        const newVideoTrack = this.localStream.getVideoTracks()[0];
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
          console.log('✅ Camera switched successfully and peer connection updated');
        }
      }

      // Log new settings
      const newSettings = this.localStream.getVideoTracks()[0].getSettings();
      console.log('New camera settings:', {
        facingMode: newSettings.facingMode,
        width: newSettings.width,
        height: newSettings.height
      });

      return this.localStream;
    } catch (error) {
      console.error('Error switching camera:', error);
      throw new Error(`Failed to switch camera: ${error.message}`);
    }
  }

  /**
   * Get available cameras
   * الحصول على الكاميرات المتاحة
   * 
   * @returns {Promise<Array>} - List of available video input devices
   */
  async getAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available cameras:', cameras.length);
      return cameras;
    } catch (error) {
      console.error('Error getting available cameras:', error);
      return [];
    }
  }

  /**
   * Check if device has multiple cameras
   * التحقق من وجود كاميرات متعددة
   * 
   * @returns {Promise<boolean>}
   */
  async hasMultipleCameras() {
    const cameras = await this.getAvailableCameras();
    return cameras.length > 1;
  }

  /**
   * Get connection quality
   * الحصول على جودة الاتصال
   */
  getConnectionQuality() {
    return this.connectionQuality;
  }

  /**
   * Stop all streams and close connection
   * إيقاف جميع البثوث وإغلاق الاتصال
   */
  cleanup() {
    // Stop stats monitoring
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Stop remote stream
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.connectionQuality = 'unknown';
  }
}

export default WebRTCService;
