import React, { useEffect, useRef, useState } from 'react';
import ConnectionQualityMonitor from '../services/connectionQualityMonitor';
import ConnectionQualityIndicator from '../components/VideoInterview/ConnectionQualityIndicator';

/**
 * مثال على استخدام مؤشر جودة الاتصال
 */
const ConnectionQualityExample = () => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [qualityMonitor, setQualityMonitor] = useState(null);
  const [language, setLanguage] = useState('ar');

  useEffect(() => {
    // إنشاء peer connection (مثال)
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    setPeerConnection(pc);

    // إنشاء monitor
    const monitor = new ConnectionQualityMonitor(pc);
    setQualityMonitor(monitor);

    // بدء المراقبة (كل ثانية)
    monitor.start(1000);

    // تنظيف
    return () => {
      monitor.stop();
      pc.close();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>مثال على مؤشر جودة الاتصال</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setLanguage('ar')}>العربية</button>
        <button onClick={() => setLanguage('en')} style={{ marginLeft: '10px' }}>English</button>
      </div>

      {qualityMonitor && (
        <div style={{ 
          position: 'relative', 
          width: '640px', 
          height: '480px', 
          background: '#000',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '20px'
        }}>
          <ConnectionQualityIndicator 
            qualityMonitor={qualityMonitor}
            language={language}
          />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>كيفية الاستخدام:</h3>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          overflow: 'auto'
        }}>
{`// 1. إنشاء peer connection
const peerConnection = new RTCPeerConnection({
  iceServers: [...]
});

// 2. إنشاء monitor
const monitor = new ConnectionQualityMonitor(peerConnection);

// 3. بدء المراقبة
monitor.start(1000); // كل ثانية

// 4. استخدام المكون
<ConnectionQualityIndicator 
  qualityMonitor={monitor}
  language="ar"
/>

// 5. إيقاف المراقبة عند الانتهاء
monitor.stop();`}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>المقاييس المتتبعة:</h3>
        <ul>
          <li><strong>Latency (التأخير):</strong> زمن الاستجابة بالميلي ثانية</li>
          <li><strong>Packet Loss (فقدان الحزم):</strong> نسبة الحزم المفقودة</li>
          <li><strong>Jitter (التذبذب):</strong> تباين زمن الوصول</li>
          <li><strong>Bitrate (معدل البت):</strong> سرعة نقل البيانات</li>
          <li><strong>FPS (الإطارات/ثانية):</strong> معدل الإطارات</li>
          <li><strong>Resolution (الدقة):</strong> دقة الفيديو</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>مستويات الجودة:</h3>
        <ul>
          <li>🟢 <strong>ممتاز (Excellent):</strong> 85-100 نقطة</li>
          <li>🟡 <strong>جيد (Good):</strong> 70-84 نقطة</li>
          <li>🟠 <strong>مقبول (Fair):</strong> 50-69 نقطة</li>
          <li>🔴 <strong>ضعيف (Poor):</strong> 0-49 نقطة</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionQualityExample;
