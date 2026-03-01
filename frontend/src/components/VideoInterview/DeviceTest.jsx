import React, { useState, useEffect, useRef } from 'react';
import './DeviceTest.css';

/**
 * مكون اختبار الأجهزة (الكاميرا والميكروفون)
 * يسمح للمستخدم باختبار الكاميرا والميكروفون قبل الانضمام للمقابلة
 * 
 * Requirements: 1.4 - اختبار الكاميرا والميكروفون قبل الانضمام
 */
const DeviceTest = ({ onTestComplete, language = 'ar' }) => {
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [stream, setStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [testStatus, setTestStatus] = useState({
    camera: 'pending', // pending, testing, success, error
    microphone: 'pending'
  });
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const translations = {
    ar: {
      title: 'اختبار الكاميرا والميكروفون',
      subtitle: 'تأكد من أن أجهزتك تعمل بشكل صحيح قبل الانضمام',
      cameraLabel: 'الكاميرا',
      microphoneLabel: 'الميكروفون',
      selectCamera: 'اختر الكاميرا',
      selectMicrophone: 'اختر الميكروفون',
      testCamera: 'اختبار الكاميرا',
      testMicrophone: 'اختبار الميكروفون',
      retestCamera: 'إعادة اختبار الكاميرا',
      retestMicrophone: 'إعادة اختبار الميكروفون',
      cameraWorking: 'الكاميرا تعمل بشكل جيد',
      microphoneWorking: 'الميكروفون يعمل بشكل جيد',
      speakToTest: 'تحدث لاختبار الميكروفون',
      audioLevel: 'مستوى الصوت',
      continue: 'متابعة',
      permissionDenied: 'تم رفض الإذن. يرجى السماح بالوصول للكاميرا والميكروفون.',
      deviceError: 'حدث خطأ في الوصول للأجهزة',
      noDevices: 'لم يتم العثور على أجهزة'
    },
    en: {
      title: 'Camera and Microphone Test',
      subtitle: 'Make sure your devices work properly before joining',
      cameraLabel: 'Camera',
      microphoneLabel: 'Microphone',
      selectCamera: 'Select Camera',
      selectMicrophone: 'Select Microphone',
      testCamera: 'Test Camera',
      testMicrophone: 'Test Microphone',
      retestCamera: 'Retest Camera',
      retestMicrophone: 'Retest Microphone',
      cameraWorking: 'Camera is working well',
      microphoneWorking: 'Microphone is working well',
      speakToTest: 'Speak to test microphone',
      audioLevel: 'Audio Level',
      continue: 'Continue',
      permissionDenied: 'Permission denied. Please allow access to camera and microphone.',
      deviceError: 'Error accessing devices',
      noDevices: 'No devices found'
    },
    fr: {
      title: 'Test de caméra et microphone',
      subtitle: 'Assurez-vous que vos appareils fonctionnent correctement avant de rejoindre',
      cameraLabel: 'Caméra',
      microphoneLabel: 'Microphone',
      selectCamera: 'Sélectionner la caméra',
      selectMicrophone: 'Sélectionner le microphone',
      testCamera: 'Tester la caméra',
      testMicrophone: 'Tester le microphone',
      retestCamera: 'Retester la caméra',
      retestMicrophone: 'Retester le microphone',
      cameraWorking: 'La caméra fonctionne bien',
      microphoneWorking: 'Le microphone fonctionne bien',
      speakToTest: 'Parlez pour tester le microphone',
      audioLevel: 'Niveau audio',
      continue: 'Continuer',
      permissionDenied: 'Permission refusée. Veuillez autoriser l\'accès à la caméra et au microphone.',
      deviceError: 'Erreur d\'accès aux appareils',
      noDevices: 'Aucun appareil trouvé'
    }
  };

  const t = translations[language] || translations.ar;

  // تحميل قائمة الأجهزة المتاحة
  useEffect(() => {
    loadDevices();
    return () => {
      stopStream();
    };
  }, []);

  const loadDevices = async () => {
    try {
      // طلب الإذن أولاً
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const cameras = deviceList.filter(device => device.kind === 'videoinput');
      const microphones = deviceList.filter(device => device.kind === 'audioinput');

      setDevices({ cameras, microphones });

      // اختيار الأجهزة الافتراضية
      if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
      if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId);
    } catch (err) {
      console.error('Error loading devices:', err);
      setError(err.name === 'NotAllowedError' ? t.permissionDenied : t.deviceError);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const testCamera = async () => {
    try {
      setTestStatus(prev => ({ ...prev, camera: 'testing' }));
      setError(null);

      // إيقاف أي stream سابق
      stopStream();

      // الحصول على stream جديد
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
        audio: false
      });

      setStream(newStream);
      
      // عرض الفيديو
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      setTestStatus(prev => ({ ...prev, camera: 'success' }));
    } catch (err) {
      console.error('Error testing camera:', err);
      setTestStatus(prev => ({ ...prev, camera: 'error' }));
      setError(err.name === 'NotAllowedError' ? t.permissionDenied : t.deviceError);
    }
  };

  const testMicrophone = async () => {
    try {
      setTestStatus(prev => ({ ...prev, microphone: 'testing' }));
      setError(null);

      // الحصول على audio stream
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined },
        video: false
      });

      // إنشاء audio context لتحليل مستوى الصوت
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(audioStream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // بدء قياس مستوى الصوت
      measureAudioLevel();

      setTestStatus(prev => ({ ...prev, microphone: 'success' }));

      // إيقاف audio stream بعد 10 ثواني
      setTimeout(() => {
        audioStream.getTracks().forEach(track => track.stop());
      }, 10000);
    } catch (err) {
      console.error('Error testing microphone:', err);
      setTestStatus(prev => ({ ...prev, microphone: 'error' }));
      setError(err.name === 'NotAllowedError' ? t.permissionDenied : t.deviceError);
    }
  };

  const measureAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // حساب متوسط مستوى الصوت
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const level = Math.min(100, (average / 128) * 100);
    
    setAudioLevel(level);

    animationFrameRef.current = requestAnimationFrame(measureAudioLevel);
  };

  const handleContinue = () => {
    if (testStatus.camera === 'success' && testStatus.microphone === 'success') {
      onTestComplete({
        cameraId: selectedCamera,
        microphoneId: selectedMicrophone,
        devicesWorking: true
      });
    }
  };

  const canContinue = testStatus.camera === 'success' && testStatus.microphone === 'success';

  return (
    <div className="device-test-container">
      <div className="device-test-card">
        <h2 className="device-test-title">{t.title}</h2>
        <p className="device-test-subtitle">{t.subtitle}</p>

        {error && (
          <div className="device-test-error">
            {error}
          </div>
        )}

        {/* اختبار الكاميرا */}
        <div className="device-test-section">
          <h3 className="device-test-section-title">{t.cameraLabel}</h3>
          
          <div className="device-test-select-group">
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="device-test-select"
              disabled={devices.cameras.length === 0}
            >
              {devices.cameras.length === 0 ? (
                <option>{t.noDevices}</option>
              ) : (
                devices.cameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={testCamera}
              className={`device-test-button ${testStatus.camera === 'success' ? 'success' : ''}`}
              disabled={!selectedCamera || testStatus.camera === 'testing'}
            >
              {testStatus.camera === 'testing' ? '...' : 
               testStatus.camera === 'success' ? t.retestCamera : t.testCamera}
            </button>
          </div>

          <div className="device-test-preview">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="device-test-video"
            />
            {testStatus.camera === 'success' && (
              <div className="device-test-status success">
                ✓ {t.cameraWorking}
              </div>
            )}
          </div>
        </div>

        {/* اختبار الميكروفون */}
        <div className="device-test-section">
          <h3 className="device-test-section-title">{t.microphoneLabel}</h3>
          
          <div className="device-test-select-group">
            <select
              value={selectedMicrophone}
              onChange={(e) => setSelectedMicrophone(e.target.value)}
              className="device-test-select"
              disabled={devices.microphones.length === 0}
            >
              {devices.microphones.length === 0 ? (
                <option>{t.noDevices}</option>
              ) : (
                devices.microphones.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}`}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={testMicrophone}
              className={`device-test-button ${testStatus.microphone === 'success' ? 'success' : ''}`}
              disabled={!selectedMicrophone || testStatus.microphone === 'testing'}
            >
              {testStatus.microphone === 'testing' ? '...' : 
               testStatus.microphone === 'success' ? t.retestMicrophone : t.testMicrophone}
            </button>
          </div>

          {testStatus.microphone === 'testing' || testStatus.microphone === 'success' ? (
            <div className="device-test-audio">
              <p className="device-test-audio-label">{t.speakToTest}</p>
              <div className="device-test-audio-meter">
                <div 
                  className="device-test-audio-level"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
              <p className="device-test-audio-value">{t.audioLevel}: {Math.round(audioLevel)}%</p>
              {testStatus.microphone === 'success' && audioLevel > 10 && (
                <div className="device-test-status success">
                  ✓ {t.microphoneWorking}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* زر المتابعة */}
        <button
          onClick={handleContinue}
          className={`device-test-continue ${canContinue ? 'enabled' : 'disabled'}`}
          disabled={!canContinue}
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
};

export default DeviceTest;
