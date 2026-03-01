/**
 * Screen Share Example
 * مثال كامل لاستخدام مشاركة الشاشة
 */

import React, { useState, useEffect, useRef } from 'react';
import ScreenShareControls from '../components/VideoInterview/ScreenShareControls';
import ScreenShareService from '../services/screenShareService';

const ScreenShareExample = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareInfo, setShareInfo] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareService = useRef(new ScreenShareService());

  /**
   * معالج بدء مشاركة الشاشة
   */
  const handleScreenShareStart = (stream) => {
    console.log('Screen share started:', stream);
    setIsSharing(true);

    // عرض المشاركة المحلية
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    // الحصول على معلومات المشاركة
    const info = screenShareService.current.getCurrentScreenShare();
    setShareInfo(info);

    // في التطبيق الحقيقي، سترسل stream عبر WebRTC
    // peerConnection.addStream(stream);
  };

  /**
   * معالج إيقاف مشاركة الشاشة
   */
  const handleScreenShareStop = () => {
    console.log('Screen share stopped');
    setIsSharing(false);
    setShareInfo(null);

    // إيقاف عرض المشاركة المحلية
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // في التطبيق الحقيقي، ستزيل stream من WebRTC
    // peerConnection.removeStream(stream);
  };

  /**
   * محاكاة استقبال مشاركة شاشة من مستخدم آخر
   */
  const simulateRemoteScreenShare = async () => {
    try {
      // في التطبيق الحقيقي، ستستقبل stream عبر WebRTC
      // هنا نحاكي ذلك بالحصول على stream محلي
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1280, height: 720 }
      });

      setRemoteStream(stream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      // إيقاف المحاكاة بعد 10 ثواني
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setRemoteStream(null);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }, 10000);
    } catch (error) {
      console.error('Error simulating remote screen share:', error);
    }
  };

  /**
   * تحديث معلومات المشاركة كل ثانية
   */
  useEffect(() => {
    if (!isSharing) return;

    const interval = setInterval(() => {
      const info = screenShareService.current.getCurrentScreenShare();
      setShareInfo(info);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSharing]);

  /**
   * تنسيق المدة
   */
  const formatDuration = (ms) => {
    if (!ms) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>مثال مشاركة الشاشة</h1>

      {/* أزرار التحكم */}
      <div style={styles.controls}>
        <ScreenShareControls
          onScreenShareStart={handleScreenShareStart}
          onScreenShareStop={handleScreenShareStop}
          language="ar"
        />

        <button
          style={styles.simulateButton}
          onClick={simulateRemoteScreenShare}
          disabled={!!remoteStream}
        >
          محاكاة مشاركة شاشة بعيدة
        </button>
      </div>

      {/* معلومات المشاركة */}
      {shareInfo && (
        <div style={styles.info}>
          <h3>معلومات المشاركة:</h3>
          <ul>
            <li>النوع: {shareInfo.shareType}</li>
            <li>المدة: {formatDuration(shareInfo.duration)}</li>
            <li>الجودة: {shareInfo.settings?.width}x{shareInfo.settings?.height}</li>
            <li>معدل الإطارات: {shareInfo.settings?.frameRate} fps</li>
          </ul>
        </div>
      )}

      {/* عرض الفيديو */}
      <div style={styles.videoContainer}>
        {/* المشاركة المحلية */}
        <div style={styles.videoBox}>
          <h3>مشاركتي</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            style={styles.video}
          />
          {!isSharing && (
            <div style={styles.placeholder}>
              لا توجد مشاركة نشطة
            </div>
          )}
        </div>

        {/* المشاركة البعيدة */}
        <div style={styles.videoBox}>
          <h3>مشاركة المستخدم الآخر</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            style={styles.video}
          />
          {!remoteStream && (
            <div style={styles.placeholder}>
              لا توجد مشاركة بعيدة
            </div>
          )}
        </div>
      </div>

      {/* أمثلة الكود */}
      <div style={styles.codeExamples}>
        <h3>أمثلة الكود:</h3>

        <div style={styles.codeBlock}>
          <h4>1. مشاركة الشاشة الكاملة (1080p)</h4>
          <pre style={styles.code}>
{`const service = new ScreenShareService();
const result = await service.startScreenShare({
  quality: 'high' // 1920x1080 @ 60fps
});
console.log('Sharing:', result.shareType);`}
          </pre>
        </div>

        <div style={styles.codeBlock}>
          <h4>2. مشاركة نافذة محددة (720p)</h4>
          <pre style={styles.code}>
{`const result = await service.startScreenShare({
  preferWindow: true,
  quality: 'medium' // 1280x720 @ 30fps
});`}
          </pre>
        </div>

        <div style={styles.codeBlock}>
          <h4>3. مشاركة تبويب المتصفح (480p)</h4>
          <pre style={styles.code}>
{`const result = await service.startScreenShare({
  preferCurrentTab: true,
  quality: 'low' // 854x480 @ 15fps
});`}
          </pre>
        </div>

        <div style={styles.codeBlock}>
          <h4>4. إيقاف المشاركة</h4>
          <pre style={styles.code}>
{`service.stopScreenShare();`}
          </pre>
        </div>

        <div style={styles.codeBlock}>
          <h4>5. التحقق من الحالة</h4>
          <pre style={styles.code}>
{`const isActive = service.isScreenShareActive();
const info = service.getCurrentScreenShare();
console.log('Duration:', info.duration);`}
          </pre>
        </div>
      </div>

      {/* ملاحظات */}
      <div style={styles.notes}>
        <h3>ملاحظات مهمة:</h3>
        <ul>
          <li>✅ مشاركة الشاشة تعمل فقط على HTTPS</li>
          <li>✅ يتطلب إذن المستخدم</li>
          <li>✅ مشاركة واحدة فقط في كل غرفة</li>
          <li>✅ جودة عالية (1080p) افتراضياً</li>
          <li>✅ دعم Chrome, Firefox, Edge, Safari (iOS 13+)</li>
        </ul>
      </div>
    </div>
  );
};

// التنسيقات
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl'
  },
  title: {
    textAlign: 'center',
    color: '#304B60',
    marginBottom: '30px'
  },
  controls: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  simulateButton: {
    padding: '12px 24px',
    background: '#304B60',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  info: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px'
  },
  videoContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  videoBox: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    position: 'relative'
  },
  video: {
    width: '100%',
    height: '300px',
    background: '#000',
    borderRadius: '8px'
  },
  placeholder: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#666',
    fontSize: '18px'
  },
  codeExamples: {
    marginBottom: '30px'
  },
  codeBlock: {
    marginBottom: '20px'
  },
  code: {
    background: '#2d2d2d',
    color: '#f8f8f2',
    padding: '15px',
    borderRadius: '8px',
    overflow: 'auto',
    fontSize: '14px',
    direction: 'ltr',
    textAlign: 'left'
  },
  notes: {
    background: '#e3f2fd',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #2196f3'
  }
};

export default ScreenShareExample;
