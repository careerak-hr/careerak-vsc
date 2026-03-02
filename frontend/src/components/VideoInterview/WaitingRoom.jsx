/**
 * Waiting Room Component
 * واجهة غرفة الانتظار للمقابلات
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './WaitingRoom.css';

const WaitingRoom = ({ interviewId, onAdmitted, onRejected }) => {
  const { language } = useApp();
  const [waitingInfo, setWaitingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'غرفة الانتظار',
      waiting: 'في الانتظار...',
      position: 'موقعك في الطابور',
      waitingTime: 'وقت الانتظار',
      totalWaiting: 'إجمالي المنتظرين',
      testDevices: 'اختبار الأجهزة',
      microphone: 'الميكروفون',
      camera: 'الكاميرا',
      on: 'مفعّل',
      off: 'معطّل',
      admitted: 'تم قبولك! جاري الانضمام للمقابلة...',
      rejected: 'عذراً، تم رفض طلبك',
      error: 'حدث خطأ',
      retry: 'إعادة المحاولة',
      leave: 'مغادرة',
      seconds: 'ثانية',
      minutes: 'دقيقة',
      hours: 'ساعة'
    },
    en: {
      title: 'Waiting Room',
      waiting: 'Waiting...',
      position: 'Your Position',
      waitingTime: 'Waiting Time',
      totalWaiting: 'Total Waiting',
      testDevices: 'Test Devices',
      microphone: 'Microphone',
      camera: 'Camera',
      on: 'On',
      off: 'Off',
      admitted: 'You have been admitted! Joining interview...',
      rejected: 'Sorry, your request was rejected',
      error: 'An error occurred',
      retry: 'Retry',
      leave: 'Leave',
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours'
    },
    fr: {
      title: 'Salle d\'attente',
      waiting: 'En attente...',
      position: 'Votre Position',
      waitingTime: 'Temps d\'attente',
      totalWaiting: 'Total en attente',
      testDevices: 'Tester les appareils',
      microphone: 'Microphone',
      camera: 'Caméra',
      on: 'Activé',
      off: 'Désactivé',
      admitted: 'Vous avez été admis! Rejoindre l\'entretien...',
      rejected: 'Désolé, votre demande a été rejetée',
      error: 'Une erreur s\'est produite',
      retry: 'Réessayer',
      leave: 'Quitter',
      seconds: 'secondes',
      minutes: 'minutes',
      hours: 'heures'
    }
  };

  const t = translations[language] || translations.ar;

  // تحميل معلومات غرفة الانتظار
  const loadWaitingInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/waiting-rooms/${interviewId}/info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load waiting room info');
      }

      const data = await response.json();
      setWaitingInfo(data.data);

      // التحقق من الحالة
      if (data.data.status === 'admitted') {
        onAdmitted && onAdmitted();
      } else if (data.data.status === 'rejected') {
        onRejected && onRejected();
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading waiting info:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // بدء معاينة الفيديو
  const startVideoPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera/microphone');
    }
  };

  // إيقاف معاينة الفيديو
  const stopVideoPreview = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  // تبديل الصوت
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // تبديل الفيديو
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // مغادرة غرفة الانتظار
  const handleLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/waiting-rooms/${interviewId}/leave`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      stopVideoPreview();
      window.history.back();
    } catch (err) {
      console.error('Error leaving waiting room:', err);
    }
  };

  // تنسيق وقت الانتظار
  const formatWaitingTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds} ${t.seconds}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} ${t.minutes}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} ${t.hours} ${minutes} ${t.minutes}`;
    }
  };

  useEffect(() => {
    loadWaitingInfo();
    startVideoPreview();

    // تحديث المعلومات كل 5 ثواني
    intervalRef.current = setInterval(loadWaitingInfo, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopVideoPreview();
    };
  }, [interviewId]);

  if (loading) {
    return (
      <div className="waiting-room-container">
        <div className="waiting-room-loading">
          <div className="spinner"></div>
          <p>{t.waiting}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="waiting-room-container">
        <div className="waiting-room-error">
          <i className="fas fa-exclamation-circle"></i>
          <h3>{t.error}</h3>
          <p>{error}</p>
          <button onClick={loadWaitingInfo} className="btn-retry">
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="waiting-room-container">
      <div className="waiting-room-header">
        <h2>{t.title}</h2>
        <button onClick={handleLeave} className="btn-leave">
          <i className="fas fa-times"></i> {t.leave}
        </button>
      </div>

      <div className="waiting-room-content">
        {/* رسالة الترحيب */}
        <div className="welcome-message">
          <i className="fas fa-info-circle"></i>
          <p>{waitingInfo?.welcomeMessage}</p>
        </div>

        {/* معلومات الانتظار */}
        <div className="waiting-info">
          <div className="info-card">
            <i className="fas fa-list-ol"></i>
            <div>
              <span className="info-label">{t.position}</span>
              <span className="info-value">{waitingInfo?.position}</span>
            </div>
          </div>

          <div className="info-card">
            <i className="fas fa-clock"></i>
            <div>
              <span className="info-label">{t.waitingTime}</span>
              <span className="info-value">
                {formatWaitingTime(waitingInfo?.waitingTime || 0)}
              </span>
            </div>
          </div>

          <div className="info-card">
            <i className="fas fa-users"></i>
            <div>
              <span className="info-label">{t.totalWaiting}</span>
              <span className="info-value">{waitingInfo?.totalWaiting}</span>
            </div>
          </div>
        </div>

        {/* معاينة الفيديو */}
        <div className="video-preview-section">
          <h3>{t.testDevices}</h3>
          <div className="video-preview-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-preview"
            />
            <div className="video-controls">
              <button
                onClick={toggleAudio}
                className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
              >
                <i className={`fas fa-microphone${!audioEnabled ? '-slash' : ''}`}></i>
                <span>{t.microphone}: {audioEnabled ? t.on : t.off}</span>
              </button>
              <button
                onClick={toggleVideo}
                className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
              >
                <i className={`fas fa-video${!videoEnabled ? '-slash' : ''}`}></i>
                <span>{t.camera}: {videoEnabled ? t.on : t.off}</span>
              </button>
            </div>
          </div>
        </div>

        {/* مؤشر الانتظار */}
        <div className="waiting-indicator">
          <div className="pulse-animation"></div>
          <p>{t.waiting}</p>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
