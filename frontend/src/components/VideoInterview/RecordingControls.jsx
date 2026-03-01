/**
 * Recording Controls Component
 * مكون التحكم في تسجيل المقابلات
 * 
 * الميزات:
 * - بدء/إيقاف التسجيل
 * - مؤشر التسجيل
 * - عداد الوقت
 * - رفع التسجيل تلقائياً
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './RecordingControls.css';

const RecordingControls = ({ 
  interviewId, 
  localStream, 
  remoteStream,
  isHost,
  onRecordingStart,
  onRecordingStop 
}) => {
  const { language } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const currentRecordingIdRef = useRef(null);

  const translations = {
    ar: {
      startRecording: 'بدء التسجيل',
      stopRecording: 'إيقاف التسجيل',
      recording: 'جاري التسجيل',
      uploading: 'جاري الرفع',
      uploadComplete: 'تم الرفع بنجاح',
      uploadFailed: 'فشل الرفع',
      onlyHost: 'فقط المضيف يمكنه التسجيل',
      noStreams: 'لا توجد بثوث متاحة للتسجيل'
    },
    en: {
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      recording: 'Recording',
      uploading: 'Uploading',
      uploadComplete: 'Upload Complete',
      uploadFailed: 'Upload Failed',
      onlyHost: 'Only host can record',
      noStreams: 'No streams available to record'
    },
    fr: {
      startRecording: 'Démarrer l\'enregistrement',
      stopRecording: 'Arrêter l\'enregistrement',
      recording: 'Enregistrement',
      uploading: 'Téléchargement',
      uploadComplete: 'Téléchargement terminé',
      uploadFailed: 'Échec du téléchargement',
      onlyHost: 'Seul l\'hôte peut enregistrer',
      noStreams: 'Aucun flux disponible pour enregistrer'
    }
  };

  const t = translations[language] || translations.ar;

  // تنظيف عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  /**
   * بدء التسجيل
   */
  const handleStartRecording = async () => {
    if (!isHost) {
      alert(t.onlyHost);
      return;
    }

    if (!localStream && !remoteStream) {
      alert(t.noStreams);
      return;
    }

    try {
      // إنشاء stream مدمج (local + remote)
      const combinedStream = new MediaStream();

      // إضافة tracks من local stream
      if (localStream) {
        localStream.getTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }

      // إضافة tracks من remote stream
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }

      // إعداد MediaRecorder بجودة عالية
      const options = {
        mimeType: 'video/webm;codecs=vp9,opus', // VP9 للفيديو، Opus للصوت
        videoBitsPerSecond: 2500000, // 2.5 Mbps للفيديو (HD)
        audioBitsPerSecond: 128000   // 128 kbps للصوت
      };

      // التحقق من دعم المتصفح
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // fallback إلى VP8
        options.mimeType = 'video/webm;codecs=vp8,opus';
        options.videoBitsPerSecond = 2000000; // 2 Mbps
      }

      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      // معالجة البيانات المسجلة
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // معالجة انتهاء التسجيل
      mediaRecorder.onstop = async () => {
        await handleRecordingComplete();
      };

      // بدء التسجيل (حفظ كل 10 ثواني)
      mediaRecorder.start(10000);

      // إخبار Backend ببدء التسجيل
      const response = await fetch('/api/recordings/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ interviewId })
      });

      const data = await response.json();
      if (data.success) {
        currentRecordingIdRef.current = data.recordingId;
        setIsRecording(true);
        setRecordingTime(0);

        // بدء عداد الوقت
        timerIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

        if (onRecordingStart) {
          onRecordingStart();
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('خطأ في بدء التسجيل:', error);
      alert('فشل بدء التسجيل: ' + error.message);
    }
  };

  /**
   * إيقاف التسجيل
   */
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // إيقاف عداد الوقت
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      setIsRecording(false);

      if (onRecordingStop) {
        onRecordingStop();
      }
    }
  };

  /**
   * معالجة اكتمال التسجيل ورفعه
   */
  const handleRecordingComplete = async () => {
    try {
      // إخبار Backend بإيقاف التسجيل
      const stopResponse = await fetch(`/api/recordings/${currentRecordingIdRef.current}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const stopData = await stopResponse.json();
      if (!stopData.success) {
        throw new Error(stopData.message);
      }

      // إنشاء Blob من البيانات المسجلة
      const blob = new Blob(recordedChunksRef.current, {
        type: 'video/webm'
      });

      // رفع الملف
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('recording', blob, `recording-${Date.now()}.webm`);

      const xhr = new XMLHttpRequest();

      // تتبع تقدم الرفع
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // معالجة اكتمال الرفع
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            alert(t.uploadComplete);
            setIsUploading(false);
            setUploadProgress(0);
            recordedChunksRef.current = [];
          } else {
            throw new Error(response.message);
          }
        } else {
          throw new Error('فشل رفع التسجيل');
        }
      });

      // معالجة الأخطاء
      xhr.addEventListener('error', () => {
        alert(t.uploadFailed);
        setIsUploading(false);
        setUploadProgress(0);
      });

      // إرسال الطلب
      xhr.open('POST', `/api/recordings/${currentRecordingIdRef.current}/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);

    } catch (error) {
      console.error('خطأ في معالجة التسجيل:', error);
      alert('فشل معالجة التسجيل: ' + error.message);
      setIsUploading(false);
    }
  };

  /**
   * تنسيق الوقت (HH:MM:SS)
   */
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isHost) {
    return null; // لا نعرض شيء للمشاركين
  }

  return (
    <div className="recording-controls">
      {!isRecording && !isUploading && (
        <button
          className="recording-btn start-recording"
          onClick={handleStartRecording}
          title={t.startRecording}
        >
          <span className="record-icon">⏺</span>
          <span className="record-text">{t.startRecording}</span>
        </button>
      )}

      {isRecording && (
        <div className="recording-active">
          <button
            className="recording-btn stop-recording"
            onClick={handleStopRecording}
            title={t.stopRecording}
          >
            <span className="stop-icon">⏹</span>
            <span className="stop-text">{t.stopRecording}</span>
          </button>
          
          <div className="recording-indicator">
            <span className="recording-dot"></span>
            <span className="recording-label">{t.recording}</span>
            <span className="recording-time">{formatTime(recordingTime)}</span>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="uploading-indicator">
          <span className="upload-label">{t.uploading}</span>
          <div className="upload-progress-bar">
            <div 
              className="upload-progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span className="upload-percentage">{uploadProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
