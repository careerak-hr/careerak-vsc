/**
 * WebRTC Service
 * خدمة إدارة اتصالات WebRTC مع دعم HD (720p+)
 * 
 * Features:
 * - HD video constraints (1280x720 minimum)
 * - Adaptive bitrate based on network conditions
 * - Automatic lighting enhancement (brightness/contrast)
 * - Advanced noise suppression
 * - Connection quality monitoring
 * - ICE candidate handling
 */

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.connectionQuality = 'unknown';
    this.currentBitrate = 2500000; // 2.5 Mbps default for HD
    this.adaptiveBitrateEnabled = true;
    this.lightingEnhancementEnabled = true;
    
    // HD Video Constraints (720p minimum)
    this.mediaConstraints = {
      video: {
        width: { min: 1280, ideal: 1280, max: 1920 },
        height: { min: 720, ideal: 720, max: 1080 },
        frameRate: { min: 24, ideal: 30, max: 60 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: { exact: true },
        noiseSuppression: { exact: true },
        autoGainControl: { exact: true },
        sampleRate: 48000,
        // Advanced noise suppression settings
        channelCount: 1, // Mono for better noise suppression
        latency: 0.01 // Low latency
      }
    };

    // Bitrate levels for adaptive streaming
    this.bitratePresets = {
      excellent: 2500000, // 2.5 Mbps - Full HD quality
      good: 1500000,      // 1.5 Mbps - HD quality
      poor: 800000,       // 800 Kbps - Reduced quality
      minimum: 500000     // 500 Kbps - Minimum acceptable
    };

    // Bitrate levels for adaptive streaming
    this.bitratePresets = {
      excellent: 2500000, // 2.5 Mbps - Full HD quality
      good: 1500000,      // 1.5 Mbps - HD quality
      poor: 800000,       // 800 Kbps - Reduced quality
      minimum: 500000     // 500 Kbps - Minimum acceptable
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

    // Canvas for lighting enhancement
    this.videoCanvas = null;
    this.canvasContext = null;
    this.enhancedStream = null;
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

      // Apply lighting enhancement if enabled
      if (this.lightingEnhancementEnabled) {
        await this.applyLightingEnhancement();
      }

      return this.enhancedStream || this.localStream;
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
   * Apply lighting enhancement to video stream
   * تطبيق تحسين الإضاءة على بث الفيديو
   * 
   * Uses canvas to adjust brightness and contrast automatically
   */
  async applyLightingEnhancement() {
    try {
      if (!this.localStream) {
        throw new Error('No local stream available for enhancement');
      }

      const videoTrack = this.localStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      // Create canvas for processing
      this.videoCanvas = document.createElement('canvas');
      this.videoCanvas.width = settings.width || 1280;
      this.videoCanvas.height = settings.height || 720;
      this.canvasContext = this.videoCanvas.getContext('2d', { willReadFrequently: true });

      // Create video element to draw from
      const videoElement = document.createElement('video');
      videoElement.srcObject = this.localStream;
      videoElement.play();

      // Process video frames
      const processFrame = () => {
        if (!this.canvasContext || !this.lightingEnhancementEnabled) return;

        // Draw current frame
        this.canvasContext.drawImage(videoElement, 0, 0, this.videoCanvas.width, this.videoCanvas.height);

        // Get image data
        const imageData = this.canvasContext.getImageData(0, 0, this.videoCanvas.width, this.videoCanvas.height);
        const data = imageData.data;

        // Calculate average brightness
        let totalBrightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalBrightness += (r + g + b) / 3;
        }
        const avgBrightness = totalBrightness / (data.length / 4);

        // Determine adjustment needed
        const targetBrightness = 128; // Mid-range brightness
        const brightnessFactor = targetBrightness / avgBrightness;
        
        // Apply brightness and contrast adjustment
        const contrast = 1.1; // Slight contrast boost
        const brightness = (brightnessFactor - 1) * 30; // Brightness adjustment

        for (let i = 0; i < data.length; i += 4) {
          // Apply contrast
          data[i] = ((data[i] - 128) * contrast + 128) + brightness;
          data[i + 1] = ((data[i + 1] - 128) * contrast + 128) + brightness;
          data[i + 2] = ((data[i + 2] - 128) * contrast + 128) + brightness;

          // Clamp values
          data[i] = Math.max(0, Math.min(255, data[i]));
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
        }

        // Put processed image back
        this.canvasContext.putImageData(imageData, 0, 0);

        // Continue processing
        requestAnimationFrame(processFrame);
      };

      // Start processing after video is ready
      videoElement.onloadedmetadata = () => {
        processFrame();
      };

      // Capture enhanced stream from canvas
      const canvasStream = this.videoCanvas.captureStream(30); // 30 FPS
      const enhancedVideoTrack = canvasStream.getVideoTracks()[0];

      // Combine enhanced video with original audio
      const audioTrack = this.localStream.getAudioTracks()[0];
      this.enhancedStream = new MediaStream([enhancedVideoTrack, audioTrack]);

      console.log('✅ Lighting enhancement applied successfully');
    } catch (error) {
      console.error('Error applying lighting enhancement:', error);
      // Continue without enhancement
      this.lightingEnhancementEnabled = false;
    }
  }

  /**
   * Toggle lighting enhancement
   * تبديل تحسين الإضاءة
   */
  toggleLightingEnhancement(enabled) {
    this.lightingEnhancementEnabled = enabled;
    if (!enabled && this.enhancedStream) {
      // Stop enhanced stream and use original
      this.enhancedStream.getTracks().forEach(track => track.stop());
      this.enhancedStream = null;
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
      const streamToUse = this.enhancedStream || this.localStream;
      if (streamToUse) {
        streamToUse.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, streamToUse);
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

      // Start monitoring stats and adaptive bitrate
      this.startStatsMonitoring();
      if (this.adaptiveBitrateEnabled) {
        this.startAdaptiveBitrate();
      }

      return this.peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  /**
   * Start adaptive bitrate adjustment
   * بدء تعديل معدل البت التكيفي
   * 
   * Automatically adjusts video bitrate based on network conditions
   */
  startAdaptiveBitrate() {
    if (!this.peerConnection) return;

    this.bitrateInterval = setInterval(async () => {
      try {
        const stats = await this.peerConnection.getStats();
        let outboundRtp = null;
        let candidatePair = null;

        stats.forEach(report => {
          if (report.type === 'outbound-rtp' && report.kind === 'video') {
            outboundRtp = report;
          }
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            candidatePair = report;
          }
        });

        if (outboundRtp && candidatePair) {
          // Calculate packet loss rate
          const packetsLost = outboundRtp.packetsLost || 0;
          const packetsSent = outboundRtp.packetsSent || 0;
          const lossRate = packetsSent > 0 ? (packetsLost / packetsSent) * 100 : 0;

          // Calculate available bandwidth (rough estimate)
          const currentRoundTripTime = candidatePair.currentRoundTripTime || 0;
          
          // Determine target bitrate based on conditions
          let targetBitrate;
          if (lossRate < 1 && currentRoundTripTime < 0.1) {
            // Excellent conditions - use highest quality
            targetBitrate = this.bitratePresets.excellent;
          } else if (lossRate < 3 && currentRoundTripTime < 0.2) {
            // Good conditions - use high quality
            targetBitrate = this.bitratePresets.good;
          } else if (lossRate < 5 && currentRoundTripTime < 0.3) {
            // Poor conditions - reduce quality
            targetBitrate = this.bitratePresets.poor;
          } else {
            // Very poor conditions - minimum quality
            targetBitrate = this.bitratePresets.minimum;
          }

          // Apply bitrate if changed significantly
          if (Math.abs(targetBitrate - this.currentBitrate) > 200000) {
            await this.adjustBitrate(targetBitrate);
          }
        }
      } catch (error) {
        console.error('Error in adaptive bitrate:', error);
      }
    }, 3000); // Check every 3 seconds
  }

  /**
   * Adjust video bitrate
   * تعديل معدل بت الفيديو
   */
  async adjustBitrate(targetBitrate) {
    try {
      if (!this.peerConnection) return;

      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(sender => sender.track?.kind === 'video');

      if (!videoSender) return;

      const parameters = videoSender.getParameters();
      
      if (!parameters.encodings || parameters.encodings.length === 0) {
        parameters.encodings = [{}];
      }

      // Set max bitrate
      parameters.encodings[0].maxBitrate = targetBitrate;

      await videoSender.setParameters(parameters);
      
      this.currentBitrate = targetBitrate;
      console.log(`✅ Bitrate adjusted to: ${(targetBitrate / 1000000).toFixed(2)} Mbps`);
    } catch (error) {
      console.error('Error adjusting bitrate:', error);
    }
  }

  /**
   * Toggle adaptive bitrate
   * تبديل معدل البت التكيفي
   */
  toggleAdaptiveBitrate(enabled) {
    this.adaptiveBitrateEnabled = enabled;
    if (enabled && this.peerConnection) {
      this.startAdaptiveBitrate();
    } else if (this.bitrateInterval) {
      clearInterval(this.bitrateInterval);
      this.bitrateInterval = null;
    }
  }

  /**
   * Get current bitrate
   * الحصول على معدل البت الحالي
   */
  getCurrentBitrate() {
    return {
      bitrate: this.currentBitrate,
      mbps: (this.currentBitrate / 1000000).toFixed(2),
      quality: this.getBitrateQuality()
    };
  }

  /**
   * Get bitrate quality level
   * الحصول على مستوى جودة معدل البت
   */
  getBitrateQuality() {
    if (this.currentBitrate >= this.bitratePresets.excellent) return 'excellent';
    if (this.currentBitrate >= this.bitratePresets.good) return 'good';
    if (this.currentBitrate >= this.bitratePresets.poor) return 'poor';
    return 'minimum';
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

    // Stop adaptive bitrate
    if (this.bitrateInterval) {
      clearInterval(this.bitrateInterval);
    }

    // Stop lighting enhancement
    this.lightingEnhancementEnabled = false;
    if (this.enhancedStream) {
      this.enhancedStream.getTracks().forEach(track => track.stop());
      this.enhancedStream = null;
    }

    // Clean up canvas
    if (this.videoCanvas) {
      this.videoCanvas = null;
      this.canvasContext = null;
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
    this.currentBitrate = this.bitratePresets.good;
  }
}

export default WebRTCService;
