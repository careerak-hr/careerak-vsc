/**
 * Recording Download Component
 * مكون تحميل تسجيلات المقابلات
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './RecordingDownload.css';

const RecordingDownload = ({ recording, onDownloadComplete }) => {
  const { language } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState(null);

  const translations = {
    ar: {
      download: 'تحميل التسجيل',
      downloading: 'جاري التحميل...',
      downloadComplete: 'تم التحميل بنجاح',
      downloadFailed: 'فشل التحميل',
      fileSize: 'حجم الملف',
      duration: 'المدة',
      format: 'الصيغة',
      quality: 'الجودة',
      recordedOn: 'تاريخ التسجيل',
      notReady: 'التسجيل غير جاهز بعد',
      processing: 'جاري المعالجة...',
      retry: 'إعادة المحاولة'
    },
    en: {
      download: 'Download Recording',
      downloading: 'Downloading...',
      downloadComplete: 'Download Complete',
      downloadFailed: 'Download Failed',
      fileSize: 'File Size',
      duration: 'Duration',
      format: 'Format',
      quality: 'Quality',
      recordedOn: 'Recorded On',
      notReady: 'Recording not ready yet',
      processing: 'Processing...',
      retry: 'Retry'
    },
    fr: {
      download: 'Télécharger l\'enregistrement',
      downloading: 'Téléchargement...',
      downloadComplete: 'Téléchargement terminé',
      downloadFailed: 'Échec du téléchargement',
      fileSize: 'Taille du fichier',
      duration: 'Durée',
      format: 'Format',
      quality: 'Qualité',
      recordedOn: 'Enregistré le',
      notReady: 'Enregistrement pas encore prêt',
      processing: 'Traitement...',
      retry: 'Réessayer'
    }
  };

  const t = translations[language] || translations.ar;

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`;
    }
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  // تنسيق المدة
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // تحميل التسجيل
  const handleDownload = async () => {
    if (recording.status !== 'ready') {
      setError(t.notReady);
      return;
    }

    setIsDownloading(true);
    setError(null);
    setDownloadProgress(0);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // الحصول على رابط التحميل
      const response = await fetch(`${apiUrl}/api/recordings/${recording._id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل الحصول على رابط التحميل');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'فشل التحميل');
      }

      // تحميل الملف
      const downloadResponse = await fetch(data.downloadUrl);
      
      if (!downloadResponse.ok) {
        throw new Error('فشل تحميل الملف');
      }

      // قراءة الملف كـ blob مع تتبع التقدم
      const reader = downloadResponse.body.getReader();
      const contentLength = +downloadResponse.headers.get('Content-Length');
      
      let receivedLength = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        // تحديث التقدم
        if (contentLength) {
          const progress = Math.round((receivedLength / contentLength) * 100);
          setDownloadProgress(progress);
        }
      }

      // دمج الـ chunks
      const blob = new Blob(chunks, { type: 'video/mp4' });

      // إنشاء رابط تحميل
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.fileName || `recording-${recording._id}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setDownloadProgress(100);
      
      // إشعار بالنجاح
      if (onDownloadComplete) {
        onDownloadComplete(recording);
      }

      // إعادة تعيين بعد ثانيتين
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 2000);

    } catch (err) {
      console.error('خطأ في التحميل:', err);
      setError(err.message || t.downloadFailed);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="recording-download">
      <div className="recording-info">
        <div className="info-row">
          <span className="info-label">{t.fileSize}:</span>
          <span className="info-value">{formatFileSize(recording.fileSize)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t.duration}:</span>
          <span className="info-value">{formatDuration(recording.duration)}</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t.format}:</span>
          <span className="info-value">MP4</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t.quality}:</span>
          <span className="info-value">HD 720p</span>
        </div>
        <div className="info-row">
          <span className="info-label">{t.recordedOn}:</span>
          <span className="info-value">{formatDate(recording.startTime)}</span>
        </div>
      </div>

      {recording.status === 'processing' && (
        <div className="processing-status">
          <div className="spinner"></div>
          <span>{t.processing}</span>
        </div>
      )}

      {recording.status === 'ready' && (
        <>
          <button
            className={`download-button ${isDownloading ? 'downloading' : ''}`}
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <div className="download-spinner"></div>
                <span>{t.downloading} {downloadProgress}%</span>
              </>
            ) : (
              <>
                <svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{t.download}</span>
              </>
            )}
          </button>

          {isDownloading && downloadProgress > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button className="retry-button" onClick={handleDownload}>
            {t.retry}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordingDownload;
