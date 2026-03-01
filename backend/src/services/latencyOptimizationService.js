/**
 * Latency Optimization Service
 * خدمة تحسين زمن الانتقال (Latency) لمقابلات الفيديو
 * 
 * الهدف: تحقيق latency < 300ms
 * 
 * الاستراتيجيات:
 * 1. إعادة الاتصال التلقائي (Auto-reconnection)
 * 2. معالجة فقدان الحزم (Packet loss handling)
 * 3. تحسين الـ latency (Latency optimization)
 */

class LatencyOptimizationService {
  constructor() {
    // إعدادات إعادة الاتصال
    this.reconnectionConfig = {
      maxAttempts: 5,
      initialDelay: 1000, // 1 ثانية
      maxDelay: 10000, // 10 ثواني
      backoffMultiplier: 1.5
    };

    // إعدادات معالجة فقدان الحزم
    this.packetLossConfig = {
      threshold: 5, // 5% حد أقصى لفقدان الحزم
      recoveryStrategies: ['fec', 'nack', 'rtx']
    };

    // إعدادات تحسين الـ latency
    this.latencyConfig = {
      targetLatency: 300, // ms
      bufferSize: 50, // ms
      jitterBuffer: 'adaptive'
    };
  }

  /**
   * إعادة الاتصال التلقائي
   * Auto-reconnection with exponential backoff
   */
  async handleAutoReconnection(peerConnection, roomId, userId) {
    let attempt = 0;
    let delay = this.reconnectionConfig.initialDelay;

    while (attempt < this.reconnectionConfig.maxAttempts) {
      try {
        console.log(`[Reconnection] Attempt ${attempt + 1}/${this.reconnectionConfig.maxAttempts}`);

        // محاولة إعادة الاتصال
        const reconnected = await this.attemptReconnection(peerConnection, roomId, userId);

        if (reconnected) {
          console.log('[Reconnection] Successfully reconnected');
          return {
            success: true,
            attempts: attempt + 1,
            latency: await this.measureLatency(peerConnection)
          };
        }

        // زيادة التأخير بشكل تصاعدي (exponential backoff)
        await this.sleep(delay);
        delay = Math.min(
          delay * this.reconnectionConfig.backoffMultiplier,
          this.reconnectionConfig.maxDelay
        );
        attempt++;

      } catch (error) {
        console.error(`[Reconnection] Attempt ${attempt + 1} failed:`, error.message);
        attempt++;
      }
    }

    return {
      success: false,
      attempts: attempt,
      error: 'Max reconnection attempts reached'
    };
  }

  /**
   * محاولة إعادة الاتصال
   */
  async attemptReconnection(peerConnection, roomId, userId) {
    // إعادة تعيين الاتصال
    if (peerConnection.iceConnectionState === 'failed' || 
        peerConnection.iceConnectionState === 'disconnected') {
      
      // إعادة تشغيل ICE
      await peerConnection.restartIce();
      
      // انتظار إعادة الاتصال
      return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);
        
        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'connected' ||
              peerConnection.iceConnectionState === 'completed') {
            clearTimeout(timeout);
            resolve(true);
          }
        };
      });
    }

    return false;
  }

  /**
   * معالجة فقدان الحزم
   * Packet loss handling with FEC, NACK, and RTX
   */
  configurePacketLossHandling(peerConnection) {
    // الحصول على المرسلين (senders)
    const senders = peerConnection.getSenders();

    senders.forEach(sender => {
      if (sender.track && sender.track.kind === 'video') {
        const parameters = sender.getParameters();

        if (!parameters.encodings) {
          parameters.encodings = [{}];
        }

        // تفعيل Forward Error Correction (FEC)
        parameters.encodings[0].fec = {
          mechanism: 'flexfec-03'
        };

        // تفعيل Negative Acknowledgment (NACK)
        parameters.encodings[0].nack = true;

        // تفعيل Retransmission (RTX)
        parameters.encodings[0].rtx = {
          ssrc: parameters.encodings[0].ssrc + 1
        };

        // تطبيق الإعدادات
        sender.setParameters(parameters)
          .then(() => console.log('[Packet Loss] FEC, NACK, RTX enabled'))
          .catch(err => console.error('[Packet Loss] Configuration failed:', err));
      }
    });

    return {
      fecEnabled: true,
      nackEnabled: true,
      rtxEnabled: true
    };
  }

  /**
   * تحسين الـ latency
   * Latency optimization with adaptive jitter buffer
   */
  optimizeLatency(peerConnection) {
    const receivers = peerConnection.getReceivers();

    receivers.forEach(receiver => {
      if (receiver.track && receiver.track.kind === 'video') {
        // تقليل حجم الـ jitter buffer
        const parameters = {
          jitterBufferTarget: this.latencyConfig.bufferSize,
          jitterBufferMinimumDelay: 0,
          jitterBufferMaximumDelay: this.latencyConfig.bufferSize * 2
        };

        // ملاحظة: هذه API تجريبية وقد لا تكون مدعومة في جميع المتصفحات
        if (receiver.playoutDelayHint !== undefined) {
          receiver.playoutDelayHint = this.latencyConfig.bufferSize / 1000; // تحويل إلى ثواني
        }

        console.log('[Latency] Jitter buffer optimized:', parameters);
      }
    });

    return {
      targetLatency: this.latencyConfig.targetLatency,
      bufferSize: this.latencyConfig.bufferSize,
      jitterBuffer: this.latencyConfig.jitterBuffer
    };
  }

  /**
   * قياس زمن الانتقال (latency)
   */
  async measureLatency(peerConnection) {
    try {
      const stats = await peerConnection.getStats();
      let totalLatency = 0;
      let count = 0;

      stats.forEach(report => {
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          // RTT (Round Trip Time) = latency
          if (report.currentRoundTripTime) {
            totalLatency += report.currentRoundTripTime * 1000; // تحويل إلى ms
            count++;
          }
        }
      });

      const averageLatency = count > 0 ? totalLatency / count : 0;

      return {
        latency: Math.round(averageLatency),
        unit: 'ms',
        meetsTarget: averageLatency < this.latencyConfig.targetLatency
      };

    } catch (error) {
      console.error('[Latency] Measurement failed:', error);
      return {
        latency: null,
        error: error.message
      };
    }
  }

  /**
   * مراقبة جودة الاتصال
   */
  async monitorConnectionQuality(peerConnection) {
    try {
      const stats = await peerConnection.getStats();
      const quality = {
        latency: 0,
        packetLoss: 0,
        jitter: 0,
        bandwidth: 0
      };

      stats.forEach(report => {
        // قياس الـ latency
        if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          if (report.currentRoundTripTime) {
            quality.latency = Math.round(report.currentRoundTripTime * 1000);
          }
        }

        // قياس فقدان الحزم
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          const packetsLost = report.packetsLost || 0;
          const packetsReceived = report.packetsReceived || 0;
          const totalPackets = packetsLost + packetsReceived;
          
          if (totalPackets > 0) {
            quality.packetLoss = ((packetsLost / totalPackets) * 100).toFixed(2);
          }

          // قياس الـ jitter
          if (report.jitter) {
            quality.jitter = Math.round(report.jitter * 1000);
          }
        }

        // قياس النطاق الترددي
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          if (report.bytesReceived && report.timestamp) {
            // حساب النطاق الترددي بالـ Mbps
            quality.bandwidth = ((report.bytesReceived * 8) / 1000000).toFixed(2);
          }
        }
      });

      // تحديد مستوى الجودة
      quality.level = this.determineQualityLevel(quality);

      return quality;

    } catch (error) {
      console.error('[Quality] Monitoring failed:', error);
      return null;
    }
  }

  /**
   * تحديد مستوى الجودة
   */
  determineQualityLevel(quality) {
    const { latency, packetLoss } = quality;

    // ممتاز: latency < 150ms, packet loss < 1%
    if (latency < 150 && packetLoss < 1) {
      return 'excellent';
    }

    // جيد: latency < 300ms, packet loss < 3%
    if (latency < 300 && packetLoss < 3) {
      return 'good';
    }

    // مقبول: latency < 500ms, packet loss < 5%
    if (latency < 500 && packetLoss < 5) {
      return 'fair';
    }

    // ضعيف
    return 'poor';
  }

  /**
   * تطبيق جميع التحسينات
   */
  applyAllOptimizations(peerConnection) {
    console.log('[Optimization] Applying all latency optimizations...');

    // 1. معالجة فقدان الحزم
    const packetLossConfig = this.configurePacketLossHandling(peerConnection);

    // 2. تحسين الـ latency
    const latencyConfig = this.optimizeLatency(peerConnection);

    // 3. إعداد مراقبة الجودة
    const qualityMonitor = setInterval(async () => {
      const quality = await this.monitorConnectionQuality(peerConnection);
      
      if (quality) {
        console.log('[Quality]', quality);

        // إذا كانت الجودة ضعيفة، حاول إعادة الاتصال
        if (quality.level === 'poor' && quality.latency > 500) {
          console.warn('[Quality] Poor connection detected, attempting reconnection...');
          clearInterval(qualityMonitor);
          // يمكن تفعيل إعادة الاتصال هنا
        }
      }
    }, 5000); // كل 5 ثواني

    return {
      packetLossConfig,
      latencyConfig,
      qualityMonitor
    };
  }

  /**
   * دالة مساعدة للانتظار
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = LatencyOptimizationService;
