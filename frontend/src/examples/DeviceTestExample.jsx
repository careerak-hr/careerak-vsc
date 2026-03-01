import React, { useState } from 'react';
import DeviceTest from '../components/VideoInterview/DeviceTest';

/**
 * مثال على استخدام مكون DeviceTest
 * يوضح كيفية دمج اختبار الأجهزة قبل الانضمام للمقابلة
 */
const DeviceTestExample = () => {
  const [testCompleted, setTestCompleted] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);

  const handleTestComplete = (info) => {
    console.log('Device test completed:', info);
    setDeviceInfo(info);
    setTestCompleted(true);
    
    // هنا يمكنك الانتقال لصفحة المقابلة
    // navigate('/interview/join');
  };

  if (testCompleted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#E3DAD1',
        fontFamily: 'Amiri, Cairo, serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#304B60', marginBottom: '20px' }}>
            ✓ اختبار الأجهزة مكتمل
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            أجهزتك تعمل بشكل جيد. يمكنك الآن الانضمام للمقابلة.
          </p>
          <div style={{ 
            background: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px',
            textAlign: 'right',
            marginBottom: '20px'
          }}>
            <p><strong>معرف الكاميرا:</strong> {deviceInfo?.cameraId?.slice(0, 20)}...</p>
            <p><strong>معرف الميكروفون:</strong> {deviceInfo?.microphoneId?.slice(0, 20)}...</p>
          </div>
          <button
            onClick={() => setTestCompleted(false)}
            style={{
              padding: '12px 24px',
              background: '#D48161',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            إعادة الاختبار
          </button>
        </div>
      </div>
    );
  }

  return (
    <DeviceTest 
      onTestComplete={handleTestComplete}
      language="ar" // يمكن تغييره إلى 'en' أو 'fr'
    />
  );
};

export default DeviceTestExample;

/**
 * مثال على الاستخدام في تطبيق React Router:
 * 
 * import { useNavigate } from 'react-router-dom';
 * import DeviceTest from './components/VideoInterview/DeviceTest';
 * 
 * function PreInterviewPage() {
 *   const navigate = useNavigate();
 * 
 *   const handleTestComplete = (deviceInfo) => {
 *     // حفظ معلومات الأجهزة
 *     localStorage.setItem('selectedDevices', JSON.stringify(deviceInfo));
 *     
 *     // الانتقال لصفحة المقابلة
 *     navigate('/interview/room');
 *   };
 * 
 *   return <DeviceTest onTestComplete={handleTestComplete} language="ar" />;
 * }
 */

/**
 * مثال على الاستخدام مع useApp context:
 * 
 * import { useApp } from '../context/AppContext';
 * import DeviceTest from './components/VideoInterview/DeviceTest';
 * 
 * function PreInterviewPage() {
 *   const { language } = useApp();
 * 
 *   const handleTestComplete = (deviceInfo) => {
 *     console.log('Devices ready:', deviceInfo);
 *   };
 * 
 *   return <DeviceTest onTestComplete={handleTestComplete} language={language} />;
 * }
 */
