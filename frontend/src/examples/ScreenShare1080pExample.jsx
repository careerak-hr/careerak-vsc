import React, { useState } from 'react';
import ScreenShareService from '../services/screenShareService';

/**
 * مثال على استخدام مشاركة الشاشة بجودة 1080p
 * 
 * الميزات:
 * - مشاركة بجودة Full HD (1920x1080)
 * - دعم حتى 4K (3840x2160)
 * - عرض معلومات الجودة
 * - خيارات مخصصة
 */
const ScreenShare1080pExample = () => {
  const [screenShareService] = useState(() => new ScreenShareService());
  const [isSharing, setIsSharing] = useState(false);
  const [quality, setQuality] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  /**
   * بدء مشاركة الشاشة بجودة 1080p
   */
  const handleStartShare = async (type = 'screen') => {
    try {
      setError(null);
      let newStream;

      switch (type) {
        case 'screen':
          newStream = await screenShareService.startFullScreenShare();
          break;
        case 'window':
          newStream = await screenShareService.startWindowShare();
          break;
        case 'tab':
          newStream = await screenShareService.startTabShare();
          break;
        case '4k':
          // مشاركة بجودة 4K
          newStream = await screenShareService.startScreenShare({
            width: 3840,
            height: 2160,
            frameRate: 60
          });
          break;
        default:
          newStream = await screenShareService.startScreenShare();
      }

      setStream(newStream);
      setIsSharing(true);
      setQuality(screenShareService.getQuality());

      console.log('✅ Screen share started successfully');
      console.log('Quality:', screenShareService.getQuality());
    } catch (err) {
      console.error('Error starting screen share:', err);
      setError(err.message);
    }
  };

  /**
   * إيقاف مشاركة الشاشة
   */
  const handleStopShare = () => {
    screenShareService.stopScreenShare();
    setStream(null);
    setIsSharing(false);
    setQuality(null);
    console.log('Screen share stopped');
  };

  /**
   * الحصول على نص مستوى الجودة
   */
  const getQualityLevel = () => {
    if (!quality) return 'Unknown';
    if (quality.is4K) return '4K Ultra HD';
    if (quality.isFullHD) return 'Full HD (1080p)';
    if (quality.isHD) return 'HD (720p)';
    return 'Standard';
  };

  /**
   * الحصول على لون مستوى الجودة
   */
  const getQualityColor = () => {
    if (!quality) return '#999';
    if (quality.is4K) return '#9C27B0'; // Purple for 4K
    if (quality.isFullHD) return '#4CAF50'; // Green for Full HD
    if (quality.isHD) return '#2196F3'; // Blue for HD
    return '#FF9800'; // Orange for Standard
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>مثال مشاركة الشاشة بجودة 1080p</h2>

      {/* معلومات الميزة */}
      <div style={styles.infoBox}>
        <h3>الميزات:</h3>
        <ul>
          <li>✅ جودة Full HD (1920x1080) كإعداد مثالي</li>
          <li>✅ دعم حتى 4K (3840x2160)</li>
          <li>✅ حد أدنى HD (1280x720)</li>
          <li>✅ معدل إطارات 30fps (حتى 60fps)</li>
          <li>✅ كشف تلقائي لمستوى الجودة</li>
        </ul>
      </div>

      {/* أزرار التحكم */}
      {!isSharing ? (
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleStartShare('screen')}
            style={styles.button}
          >
            📺 مشاركة الشاشة (1080p)
          </button>
          <button
            onClick={() => handleStartShare('window')}
            style={styles.button}
          >
            🪟 مشاركة نافذة (1080p)
          </button>
          <button
            onClick={() => handleStartShare('tab')}
            style={styles.button}
          >
            🌐 مشاركة تبويب (1080p)
          </button>
          <button
            onClick={() => handleStartShare('4k')}
            style={{ ...styles.button, ...styles.button4k }}
          >
            🎬 مشاركة 4K (2160p)
          </button>
        </div>
      ) : (
        <div style={styles.sharingControls}>
          <button
            onClick={handleStopShare}
            style={styles.stopButton}
          >
            ⏹️ إيقاف المشاركة
          </button>
        </div>
      )}

      {/* عرض الفيديو */}
      {stream && (
        <div style={styles.videoContainer}>
          <video
            ref={(video) => {
              if (video && stream) {
                video.srcObject = stream;
                video.play();
              }
            }}
            style={styles.video}
            autoPlay
            muted
          />
        </div>
      )}

      {/* معلومات الجودة */}
      {quality && (
        <div style={styles.qualityInfo}>
          <h3>معلومات الجودة:</h3>
          <div style={styles.qualityGrid}>
            <div style={styles.qualityItem}>
              <span style={styles.qualityLabel}>المستوى:</span>
              <span
                style={{
                  ...styles.qualityValue,
                  color: getQualityColor(),
                  fontWeight: 'bold'
                }}
              >
                {getQualityLevel()}
              </span>
            </div>
            <div style={styles.qualityItem}>
              <span style={styles.qualityLabel}>الدقة:</span>
              <span style={styles.qualityValue}>
                {quality.width} × {quality.height}
              </span>
            </div>
            <div style={styles.qualityItem}>
              <span style={styles.qualityLabel}>معدل الإطارات:</span>
              <span style={styles.qualityValue}>
                {quality.frameRate} fps
              </span>
            </div>
            <div style={styles.qualityItem}>
              <span style={styles.qualityLabel}>نسبة العرض:</span>
              <span style={styles.qualityValue}>
                {quality.aspectRatio?.toFixed(2) || 'N/A'}
              </span>
            </div>
          </div>

          {/* مؤشرات الجودة */}
          <div style={styles.qualityIndicators}>
            <div style={styles.indicator}>
              <span style={styles.indicatorLabel}>HD (720p):</span>
              <span style={quality.isHD ? styles.indicatorOn : styles.indicatorOff}>
                {quality.isHD ? '✅' : '❌'}
              </span>
            </div>
            <div style={styles.indicator}>
              <span style={styles.indicatorLabel}>Full HD (1080p):</span>
              <span style={quality.isFullHD ? styles.indicatorOn : styles.indicatorOff}>
                {quality.isFullHD ? '✅' : '❌'}
              </span>
            </div>
            <div style={styles.indicator}>
              <span style={styles.indicatorLabel}>4K (2160p):</span>
              <span style={quality.is4K ? styles.indicatorOn : styles.indicatorOff}>
                {quality.is4K ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div style={styles.error}>
          <strong>خطأ:</strong> {error}
        </div>
      )}

      {/* معلومات إضافية */}
      <div style={styles.infoBox}>
        <h3>ملاحظات:</h3>
        <ul>
          <li>الجودة الفعلية تعتمد على دقة شاشتك</li>
          <li>4K يتطلب شاشة بدقة 3840×2160 أو أعلى</li>
          <li>معدل الإطارات يعتمد على أداء الجهاز</li>
          <li>افتح Console لرؤية تفاصيل الجودة</li>
        </ul>
      </div>
    </div>
  );
};

// الأنماط
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    color: '#304B60',
    marginBottom: '20px'
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '2px solid #E3DAD1'
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '20px'
  },
  button: {
    padding: '12px 20px',
    fontSize: '16px',
    backgroundColor: '#304B60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  button4k: {
    backgroundColor: '#9C27B0'
  },
  sharingControls: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  stopButton: {
    padding: '12px 30px',
    fontSize: '16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  videoContainer: {
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '3px solid #304B60'
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  qualityInfo: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #D48161',
    marginBottom: '20px'
  },
  qualityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  qualityItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  qualityLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold'
  },
  qualityValue: {
    fontSize: '18px',
    color: '#304B60'
  },
  qualityIndicators: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  indicatorLabel: {
    fontSize: '14px',
    color: '#666'
  },
  indicatorOn: {
    fontSize: '20px'
  },
  indicatorOff: {
    fontSize: '20px',
    opacity: 0.3
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '2px solid #ef5350'
  }
};

export default ScreenShare1080pExample;
