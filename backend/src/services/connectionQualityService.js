/**
 * Connection Quality Service
 * يحسب ويتتبع جودة الاتصال في الوقت الفعلي
 */

class ConnectionQualityService {
  constructor() {
    // عتبات جودة الاتصال
    this.thresholds = {
      excellent: {
        latency: 150,      // < 150ms
        packetLoss: 1,     // < 1%
        jitter: 30,        // < 30ms
        bitrate: 1000000   // > 1 Mbps
      },
      good: {
        latency: 300,      // < 300ms
        packetLoss: 3,     // < 3%
        jitter: 50,        // < 50ms
        bitrate: 500000    // > 500 Kbps
      },
      fair: {
        latency: 500,      // < 500ms
        packetLoss: 5,     // < 5%
        jitter: 100,       // < 100ms
        bitrate: 250000    // > 250 Kbps
      }
      // أي شيء أسوأ من fair يعتبر poor
    };
  }

  /**
   * حساب مستوى جودة الاتصال
   * @param {Object} stats - إحصائيات الاتصال
   * @returns {Object} - مستوى الجودة والتفاصيل
   */
  calculateQuality(stats) {
    const { latency, packetLoss, jitter, bitrate } = stats;

    // حساب النقاط لكل مقياس (0-100)
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
    const level = this._determineLevel(overallScore);

    return {
      level,
      score: Math.round(overallScore),
      details: {
        latency: {
          value: latency,
          score: Math.round(latencyScore),
          status: this._getMetricStatus(latency, 'latency')
        },
        packetLoss: {
          value: packetLoss,
          score: Math.round(packetLossScore),
          status: this._getMetricStatus(packetLoss, 'packetLoss')
        },
        jitter: {
          value: jitter,
          score: Math.round(jitterScore),
          status: this._getMetricStatus(jitter, 'jitter')
        },
        bitrate: {
          value: bitrate,
          score: Math.round(bitrateScore),
          status: this._getMetricStatus(bitrate, 'bitrate')
        }
      },
      timestamp: new Date()
    };
  }

  /**
   * حساب نقاط الـ latency
   */
  _calculateLatencyScore(latency) {
    if (latency < this.thresholds.excellent.latency) return 100;
    if (latency < this.thresholds.good.latency) return 80;
    if (latency < this.thresholds.fair.latency) return 60;
    if (latency < 1000) return 40;
    return 20;
  }

  /**
   * حساب نقاط packet loss
   */
  _calculatePacketLossScore(packetLoss) {
    if (packetLoss < this.thresholds.excellent.packetLoss) return 100;
    if (packetLoss < this.thresholds.good.packetLoss) return 80;
    if (packetLoss < this.thresholds.fair.packetLoss) return 60;
    if (packetLoss < 10) return 40;
    return 20;
  }

  /**
   * حساب نقاط jitter
   */
  _calculateJitterScore(jitter) {
    if (jitter < this.thresholds.excellent.jitter) return 100;
    if (jitter < this.thresholds.good.jitter) return 80;
    if (jitter < this.thresholds.fair.jitter) return 60;
    if (jitter < 200) return 40;
    return 20;
  }

  /**
   * حساب نقاط bitrate
   */
  _calculateBitrateScore(bitrate) {
    if (bitrate > this.thresholds.excellent.bitrate) return 100;
    if (bitrate > this.thresholds.good.bitrate) return 80;
    if (bitrate > this.thresholds.fair.bitrate) return 60;
    if (bitrate > 100000) return 40;
    return 20;
  }

  /**
   * تحديد مستوى الجودة من النقاط
   */
  _determineLevel(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  /**
   * الحصول على حالة المقياس
   */
  _getMetricStatus(value, metric) {
    const thresholds = this.thresholds;
    
    switch (metric) {
      case 'latency':
        if (value < thresholds.excellent.latency) return 'excellent';
        if (value < thresholds.good.latency) return 'good';
        if (value < thresholds.fair.latency) return 'fair';
        return 'poor';
      
      case 'packetLoss':
        if (value < thresholds.excellent.packetLoss) return 'excellent';
        if (value < thresholds.good.packetLoss) return 'good';
        if (value < thresholds.fair.packetLoss) return 'fair';
        return 'poor';
      
      case 'jitter':
        if (value < thresholds.excellent.jitter) return 'excellent';
        if (value < thresholds.good.jitter) return 'good';
        if (value < thresholds.fair.jitter) return 'fair';
        return 'poor';
      
      case 'bitrate':
        if (value > thresholds.excellent.bitrate) return 'excellent';
        if (value > thresholds.good.bitrate) return 'good';
        if (value > thresholds.fair.bitrate) return 'fair';
        return 'poor';
      
      default:
        return 'unknown';
    }
  }

  /**
   * الحصول على توصيات لتحسين الجودة
   */
  getRecommendations(quality) {
    const recommendations = [];
    const { details } = quality;

    if (details.latency.status === 'poor' || details.latency.status === 'fair') {
      recommendations.push({
        type: 'latency',
        severity: details.latency.status === 'poor' ? 'high' : 'medium',
        message: 'High latency detected. Try moving closer to your router or using a wired connection.',
        messageAr: 'تأخير عالي في الاتصال. حاول الاقتراب من الراوتر أو استخدام اتصال سلكي.'
      });
    }

    if (details.packetLoss.status === 'poor' || details.packetLoss.status === 'fair') {
      recommendations.push({
        type: 'packetLoss',
        severity: details.packetLoss.status === 'poor' ? 'high' : 'medium',
        message: 'Packet loss detected. Check your network connection or close other applications using bandwidth.',
        messageAr: 'فقدان في الحزم. تحقق من اتصال الشبكة أو أغلق التطبيقات الأخرى التي تستخدم النطاق الترددي.'
      });
    }

    if (details.jitter.status === 'poor' || details.jitter.status === 'fair') {
      recommendations.push({
        type: 'jitter',
        severity: details.jitter.status === 'poor' ? 'high' : 'medium',
        message: 'Network instability detected. Try using a more stable connection.',
        messageAr: 'عدم استقرار في الشبكة. حاول استخدام اتصال أكثر استقراراً.'
      });
    }

    if (details.bitrate.status === 'poor' || details.bitrate.status === 'fair') {
      recommendations.push({
        type: 'bitrate',
        severity: details.bitrate.status === 'poor' ? 'high' : 'medium',
        message: 'Low bandwidth detected. Consider reducing video quality or closing other applications.',
        messageAr: 'نطاق ترددي منخفض. فكر في تقليل جودة الفيديو أو إغلاق التطبيقات الأخرى.'
      });
    }

    return recommendations;
  }

  /**
   * تحليل الاتجاهات التاريخية
   */
  analyzeTrends(qualityHistory) {
    if (!qualityHistory || qualityHistory.length < 2) {
      return { trend: 'stable', message: 'Not enough data to analyze trends' };
    }

    const recentScores = qualityHistory.slice(-10).map(q => q.score);
    const average = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;

    if (change > 10) {
      return { trend: 'improving', change, average };
    } else if (change < -10) {
      return { trend: 'degrading', change, average };
    } else {
      return { trend: 'stable', change, average };
    }
  }
}

module.exports = ConnectionQualityService;
