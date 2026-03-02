import React, { useState, useEffect } from 'react';
import './ConnectionQualityIndicator.css';

/**
 * مؤشر جودة الاتصال في الوقت الفعلي
 */
const ConnectionQualityIndicator = ({ qualityMonitor, language = 'ar' }) => {
  const [quality, setQuality] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!qualityMonitor) return;

    // الاستماع للتحديثات
    const handleUpdate = (newStats) => {
      setStats(newStats);
      const newQuality = qualityMonitor.calculateQuality();
      setQuality(newQuality);
    };

    qualityMonitor.addListener(handleUpdate);

    return () => {
      qualityMonitor.removeListener(handleUpdate);
    };
  }, [qualityMonitor]);

  if (!quality) {
    return null;
  }

  const getQualityIcon = (level) => {
    switch (level) {
      case 'excellent':
        return '🟢';
      case 'good':
        return '🟡';
      case 'fair':
        return '🟠';
      case 'poor':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getQualityText = (level) => {
    const texts = {
      ar: {
        excellent: 'ممتاز',
        good: 'جيد',
        fair: 'مقبول',
        poor: 'ضعيف'
      },
      en: {
        excellent: 'Excellent',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor'
      }
    };
    return texts[language][level] || level;
  };

  const getMetricLabel = (metric) => {
    const labels = {
      ar: {
        latency: 'التأخير',
        packetLoss: 'فقدان الحزم',
        jitter: 'التذبذب',
        bitrate: 'معدل البت',
        framesPerSecond: 'الإطارات/ثانية',
        resolution: 'الدقة'
      },
      en: {
        latency: 'Latency',
        packetLoss: 'Packet Loss',
        jitter: 'Jitter',
        bitrate: 'Bitrate',
        framesPerSecond: 'FPS',
        resolution: 'Resolution'
      }
    };
    return labels[language][metric] || metric;
  };

  const formatValue = (metric, value) => {
    switch (metric) {
      case 'latency':
      case 'jitter':
        return `${value} ms`;
      case 'packetLoss':
        return `${value}%`;
      case 'bitrate':
        return value > 1000000 
          ? `${(value / 1000000).toFixed(1)} Mbps`
          : `${(value / 1000).toFixed(0)} Kbps`;
      case 'framesPerSecond':
        return `${Math.round(value)} fps`;
      case 'resolution':
        return `${value.width}x${value.height}`;
      default:
        return value;
    }
  };

  return (
    <div className="connection-quality-indicator">
      <div 
        className="quality-badge"
        onClick={() => setShowDetails(!showDetails)}
        title={language === 'ar' ? 'انقر لعرض التفاصيل' : 'Click for details'}
      >
        <span className="quality-icon">{getQualityIcon(quality.level)}</span>
        <span className="quality-text">{getQualityText(quality.level)}</span>
        <span className="quality-score">({quality.score})</span>
      </div>

      {showDetails && stats && (
        <div className="quality-details">
          <div className="details-header">
            <h4>{language === 'ar' ? 'تفاصيل الاتصال' : 'Connection Details'}</h4>
            <button 
              className="close-btn"
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
          </div>

          <div className="details-content">
            <div className="metric-row">
              <span className="metric-label">{getMetricLabel('latency')}</span>
              <span className="metric-value">{formatValue('latency', stats.latency)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">{getMetricLabel('packetLoss')}</span>
              <span className="metric-value">{formatValue('packetLoss', stats.packetLoss)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">{getMetricLabel('jitter')}</span>
              <span className="metric-value">{formatValue('jitter', stats.jitter)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">{getMetricLabel('bitrate')}</span>
              <span className="metric-value">{formatValue('bitrate', stats.bitrate)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">{getMetricLabel('framesPerSecond')}</span>
              <span className="metric-value">{formatValue('framesPerSecond', stats.framesPerSecond)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">{getMetricLabel('resolution')}</span>
              <span className="metric-value">{formatValue('resolution', stats.resolution)}</span>
            </div>
          </div>

          {quality.level === 'poor' || quality.level === 'fair' ? (
            <div className="quality-warning">
              <p>
                {language === 'ar' 
                  ? '⚠️ جودة الاتصال منخفضة. حاول تحسين اتصال الإنترنت.'
                  : '⚠️ Low connection quality. Try improving your internet connection.'}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ConnectionQualityIndicator;
