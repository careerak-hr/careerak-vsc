import React, { useState, useEffect, useRef } from 'react';
import RecordingService from '../../services/recordingService';
import './RecordingControls.css';

/**
 * Recording Controls Component
 * أزرار التحكم في التسجيل
 * 
 * Requirements: 2.1, 2.4
 */
const RecordingControls = ({
  interviewId,
  stream,
  isHost,
  hasAllConsents,
  onRecordingStart,
  onRecordingStop,
  apiUrl,
  token,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingSize, setRecordingSize] = useState(0);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const recordingServiceRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // إنشاء RecordingService
    recordingServiceRef.current = new RecordingService();

    return () => {
      // تنظيف عند إلغاء التحميل
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingServiceRef.current) {
        recordingServiceRef.current.reset();
      }
    };
  }, []);

  /**
   * بدء التسجيل
   */
  const handleStartRecording = async () => {
    try {
      setError(null);

      // التحقق من الموافقات
      if (!hasAllConsents) {
        setError('يجب موافقة جميع المشاركين قبل بدء التسجيل');
        return;
      }

      // التحقق من stream
      if (!stream) {
        setError('لا يوجد stream متاح للتسجيل');
        return;
      }

      // إرسال طلب بدء التسجيل للخادم
      const response = await fetch(`${apiUrl}/api/recordings/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ interviewId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start recording');
      }

      // بدء التسجيل محلياً
      await recordingServiceRef.current.startRecording(
        stream,
        (chunk) => {
          // تحديث حجم التسجيل
          setRecordingSize(recordingServiceRef.current.getRecordingSize());
        }
      );

      setIsRecording(true);

      // بدء المؤقت
      timerRef.current = setInterval(() => {
        setDuration(recordingServiceRef.current.getRecordingDuration());
      }, 1000);

      // استدعاء callback
      if (onRecordingStart) {
        onRecordingStart();
      }
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message);
    }
  };

  /**
   * إيقاف التسجيل
   */
  const handleStopRecording = async () => {
    try {
      setError(null);

      // إيقاف المؤقت
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // إيقاف التسجيل محلياً
      const blob = await recordingServiceRef.current.stopRecording();

      setIsRecording(false);
      setIsPaused(false);

      // إرسال طلب إيقاف التسجيل للخادم
      const response = await fetch(`${apiUrl}/api/recordings/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ interviewId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to stop recording');
      }

      // رفع التسجيل
      await handleUploadRecording(blob);

      // استدعاء callback
      if (onRecordingStop) {
        onRecordingStop(blob);
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError(err.message);
    }
  };

  /**
   * إيقاف مؤقت للتسجيل
   */
  const handlePauseRecording = () => {
    recordingServiceRef.current.pauseRecording();
    setIsPaused(true);

    // إيقاف المؤقت
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /**
   * استئناف التسجيل
   */
  const handleResumeRecording = () => {
    recordingServiceRef.current.resumeRecording();
    setIsPaused(false);

    // استئناف المؤقت
    timerRef.current = setInterval(() => {
      setDuration(recordingServiceRef.current.getRecordingDuration());
    }, 1000);
  };

  /**
   * رفع التسجيل
   */
  const handleUploadRecording = async (blob) => {
    try {
      setUploading(true);

      await recordingServiceRef.current.uploadRecording(interviewId, token);

      setUploading(false);
    } catch (err) {
      console.error('Error uploading recording:', err);
      setError('فشل رفع التسجيل: ' + err.message);
      setUploading(false);
    }
  };

  /**
   * تنسيق المدة
   */
  const formatDuration = (seconds) => {
    return RecordingService.formatDuration(seconds);
  };

  /**
   * تنسيق حجم الملف
   */
  const formatSize = (bytes) => {
    return RecordingService.formatFileSize(bytes);
  };

  // إذا لم يكن المضيف، لا تعرض الأزرار
  if (!isHost) {
    return null;
  }

  return (
    <div className="recording-controls">
      {error && (
        <div className="recording-error">
          <span className="error-icon">✗</span>
          <span>{error}</span>
        </div>
      )}

      {uploading && (
        <div className="recording-uploading">
          <span className="uploading-icon">⏳</span>
          <span>جاري رفع التسجيل...</span>
        </div>
      )}

      {isRecording && (
        <div className="recording-info">
          <span className="recording-indicator">🔴 جاري التسجيل</span>
          <span className="recording-duration">{formatDuration(duration)}</span>
          <span className="recording-size">{formatSize(recordingSize)}</span>
        </div>
      )}

      <div className="recording-buttons">
        {!isRecording ? (
          <button
            className="recording-button start"
            onClick={handleStartRecording}
            disabled={!hasAllConsents || uploading}
            title={!hasAllConsents ? 'يجب موافقة جميع المشاركين' : 'بدء التسجيل'}
          >
            <span className="button-icon">⏺</span>
            <span>بدء التسجيل</span>
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                className="recording-button pause"
                onClick={handlePauseRecording}
                title="إيقاف مؤقت"
              >
                <span className="button-icon">⏸</span>
                <span>إيقاف مؤقت</span>
              </button>
            ) : (
              <button
                className="recording-button resume"
                onClick={handleResumeRecording}
                title="استئناف"
              >
                <span className="button-icon">▶</span>
                <span>استئناف</span>
              </button>
            )}
            <button
              className="recording-button stop"
              onClick={handleStopRecording}
              title="إيقاف التسجيل"
            >
              <span className="button-icon">⏹</span>
              <span>إيقاف التسجيل</span>
            </button>
          </>
        )}
      </div>

      {!hasAllConsents && (
        <div className="recording-warning">
          <span className="warning-icon">⚠️</span>
          <span>يجب موافقة جميع المشاركين قبل بدء التسجيل</span>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
