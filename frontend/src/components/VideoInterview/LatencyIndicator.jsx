import React, { useState, useEffect } from 'react';
import { measureLatency, startQualityMonitoring, stopQualityMonitoring } from '../../utils/latencyOptimization';
import './LatencyIndicator.css';

/**
 * مكون مؤشر زمن الانتقال (Latency Indicator)
 * يعرض جودة الاتصال في الوقت الفعلي
 */
const LatencyIndicator = ({ peerConnection, showDetails = false }) => {
  const [stats, setStats] = useState({
    latency: 0,
    quality: 'unknown',
    packetLoss: 0,
    jitter: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!peerConnection) return;

    // بدء المراقبة
    setIsMonitoring(true);
    const monitor = startQualityMonitoring(peerConnection, (newStats) => {
      setStats(newStats);
    }, 2000); // كل 2 ثانية

    // تنظيف عند الإلغاء
    return () => {
      stopQualityMonitoring(monitor);
      setIsMonitoring(false);
    };
  }, [peerConnection]);

  // تحديد اللون حسب الجودة
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent':
        return '#4CAF50'; // أخضر
      case 'good':
        return '#8BC34A'; // أخضر فاتح
      case 'fair':
        return '#FFC107'; // أصفر
      case 'poor':
        return '#F44336'; // أحمر
      default:
        return '#9E9E9E'; // رمادي
    }
  };

  // تحديد النص حسب الجودة
  const getQualityText = (quality) => {
    switch (quality) {
      case 'excellent':
        return 'ممتاز';
      case 'good':
        return 'جيد';
      case 'fair':
        return 'مقبول';
      case 'poor':
        return 'ضعيف';
      default:
        return 'غير معروف';
    }
  };

  // تحديد الأيقونة حسب الجودة
  const getQualityIcon = (quality) => {
    switch (quality) {
      case 'excellent':
        return '📶'; // إشارة قوية
      case 'good':
        return '📶';
      case 'fair':
        return '📡'; // إشارة متوسطة
      case 'poor':
        return '⚠️'; // تحذير
      default:
        return '❓';
    }
  };

  if (!peerConnection || !isMonitoring) {
    return null;
  }

  return (
    <div className="latency-indicator">
      {/* المؤشر الأساسي */}
      <div 
        className="latency-badge"
        style={{ backgroundColor: getQualityColor(stats.quality) }}
        title={`Latency: ${stats.latency}ms`}
      >
        <span className="latency-icon">{getQualityIcon(stats.quality)}</span>
        <span className="latency-value">{stats.latency}ms</span>
      </div>

      {/* التفاصيل (اختياري) */}
      {showDetails && (
        <div className="latency-details">
          <div className="latency-detail-item">
            <span className="detail-label">الجودة:</span>
            <span 
              className="detail-value"
              style={{ color: getQualityColor(stats.quality) }}
            >
              {getQualityText(stats.quality)}
            </span>
          </div>

          <div className="latency-detail-item">
            <span className="detail-label">زمن الانتقال:</span>
            <span className="detail-value">{stats.latency}ms</span>
          </div>

          <div className="latency-detail-item">
            <span className="detail-label">فقدان الحزم:</span>
            <span className="detail-value">{stats.packetLoss}%</span>
          </div>

          <div className="latency-detail-item">
            <span className="detail-label">Jitter:</span>
            <span className="detail-value">{stats.jitter}ms</span>
          </div>

          {/* تحذير إذا كانت الجودة ضعيفة */}
          {stats.quality === 'poor' && (
            <div className="latency-warning">
              ⚠️ جودة الاتصال ضعيفة. قد تواجه تقطعاً في الفيديو.
            </div>
          )}

          {/* نصيحة إذا كان الـ latency مرتفع */}
          {stats.latency > 300 && (
            <div className="latency-tip">
              💡 نصيحة: تحقق من اتصال الإنترنت أو أغلق التطبيقات الأخرى.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LatencyIndicator;
