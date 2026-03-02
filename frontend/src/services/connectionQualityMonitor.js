/**
 * Connection Quality Monitor
 * يجمع إحصائيات WebRTC ويحسب جودة الاتصال في الوقت الفعلي
 */

class ConnectionQualityMonitor {
  constructor(peerConnection) {
    this.peerConnection = peerConnection;
    this.stats = {
      latency: 0,
      packetLoss: 0,
      jitter: 0,
      bitrate: 0,
      framesPerSecond: 0,
      resolution: { width: 0, height: 0 }
    };
    this.previousStats = null;
    this.monitoringInterval = null;
    this.listeners = [];
  }

  /**
   * بدء المراقبة
   */
  start(intervalMs = 1000) {
    if (this.monitoringInterval) {
      this.stop();
    }

    this.monitoringInterval = setInterval(async () => {
      await this.collectStats();
    }, intervalMs);
  }

  /**
   * إيقاف المراقبة
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * جمع الإحصائيات من WebRTC
   */
  async collectStats() {
    if (!this.peerConnection) {
      return;
    }

    try {
      const stats = await this.peerConnection.getStats();
      const currentStats = this._parseStats(stats);
      
      if (this.previousStats) {
        this._calculateMetrics(currentStats, this.previousStats);
      }
      
      this.previousStats = currentStats;
      this._notifyListeners(this.stats);
    } catch (error) {
      console.error('Error collecting stats:', error);
    }
  }

  /**
   * تحليل الإحصائيات من WebRTC
   */
  _parseStats(stats) {
    const parsed = {
      inbound: null,
      outbound: null,
      candidate: null,
      timestamp: Date.now()
    };

    stats.forEach(report => {
      // Inbound RTP (الفيديو الوارد)
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        parsed.inbound = {
          packetsReceived: report.packetsReceived || 0,
          packetsLost: report.packetsLost || 0,
          bytesReceived: report.bytesReceived || 0,
          jitter: report.jitter || 0,
          framesPerSecond: report.framesPerSecond || 0,
          frameWidth: report.frameWidth || 0,
          frameHeight: report.frameHeight || 0,
          timestamp: report.timestamp
        };
      }

      // Outbound RTP (الفيديو الصادر)
      if (report.type === 'outbound-rtp' && report.kind === 'video') {
        parsed.outbound = {
          packetsSent: report.packetsSent || 0,
          bytesSent: report.bytesSent || 0,
          timestamp: report.timestamp
        };
      }

      // Candidate pair (معلومات الاتصال)
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        parsed.candidate = {
          currentRoundTripTime: report.currentRoundTripTime || 0,
          availableOutgoingBitrate: report.availableOutgoingBitrate || 0,
          timestamp: report.timestamp
        };
      }
    });

    return parsed;
  }

  /**
   * حساب المقاييس
   */
  _calculateMetrics(current, previous) {
    // Latency (RTT)
    if (current.candidate && current.candidate.currentRoundTripTime) {
      this.stats.latency = Math.round(current.candidate.currentRoundTripTime * 1000); // تحويل إلى ms
    }

    // Packet Loss
    if (current.inbound && previous.inbound) {
      const packetsReceived = current.inbound.packetsReceived - previous.inbound.packetsReceived;
      const packetsLost = current.inbound.packetsLost - previous.inbound.packetsLost;
      const totalPackets = packetsReceived + packetsLost;
      
      if (totalPackets > 0) {
        this.stats.packetLoss = Number(((packetsLost / totalPackets) * 100).toFixed(2));
      }
    }

    // Jitter
    if (current.inbound && current.inbound.jitter) {
      this.stats.jitter = Math.round(current.inbound.jitter * 1000); // تحويل إلى ms
    }

    // Bitrate
    if (current.inbound && previous.inbound) {
      const timeDiff = (current.inbound.timestamp - previous.inbound.timestamp) / 1000; // seconds
      const bytesDiff = current.inbound.bytesReceived - previous.inbound.bytesReceived;
      
      if (timeDiff > 0) {
        this.stats.bitrate = Math.round((bytesDiff * 8) / timeDiff); // bits per second
      }
    }

    // FPS and Resolution
    if (current.inbound) {
      this.stats.framesPerSecond = current.inbound.framesPerSecond || 0;
      this.stats.resolution = {
        width: current.inbound.frameWidth || 0,
        height: current.inbound.frameHeight || 0
      };
    }
  }

  /**
   * الحصول على الإحصائيات الحالية
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * إضافة مستمع للتحديثات
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * إزالة مستمع
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  /**
   * إشعار المستمعين
   */
  _notifyListeners(stats) {
    this.listeners.forEach(listener => {
      try {
        listener(stats);
      } catch (error) {
        console.error('Error in listener:', error);
      }
    });
  }

  /**
   * حساب مستوى الجودة
   */
  calculateQuality() {
    const { latency, packetLoss, jitter, bitrate } = this.stats;

    // حساب النقاط لكل مقياس
    const latencyScore = this._calculateLatencyScore(latency);
    const packetLossScore = this._calculatePacketLossScore(packetLoss);
    const jitterScore = this._calculateJitterScore(jitter);
    const bitrateScore = this._calculateBitrateScore(bitrate);

    // المتوسط المرجح
    const overallScore = (
      latencyScore * 0.35 +
      packetLossScore * 0.30 +
      jitterScore * 0.20 +
      bitrateScore * 0.15
    );

    // تحديد المستوى
    let level = 'poor';
    if (overallScore >= 85) level = 'excellent';
    else if (overallScore >= 70) level = 'good';
    else if (overallScore >= 50) level = 'fair';

    return {
      level,
      score: Math.round(overallScore),
      stats: this.stats
    };
  }

  _calculateLatencyScore(latency) {
    if (latency < 150) return 100;
    if (latency < 300) return 80;
    if (latency < 500) return 60;
    if (latency < 1000) return 40;
    return 20;
  }

  _calculatePacketLossScore(packetLoss) {
    if (packetLoss < 1) return 100;
    if (packetLoss < 3) return 80;
    if (packetLoss < 5) return 60;
    if (packetLoss < 10) return 40;
    return 20;
  }

  _calculateJitterScore(jitter) {
    if (jitter < 30) return 100;
    if (jitter < 50) return 80;
    if (jitter < 100) return 60;
    if (jitter < 200) return 40;
    return 20;
  }

  _calculateBitrateScore(bitrate) {
    if (bitrate > 1000000) return 100;
    if (bitrate > 500000) return 80;
    if (bitrate > 250000) return 60;
    if (bitrate > 100000) return 40;
    return 20;
  }
}

export default ConnectionQualityMonitor;
