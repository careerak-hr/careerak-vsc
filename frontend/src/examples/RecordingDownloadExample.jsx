/**
 * Recording Download Example
 * مثال استخدام مكون تحميل التسجيلات
 */

import React, { useState, useEffect } from 'react';
import RecordingDownload from '../components/VideoInterview/RecordingDownload';
import { useApp } from '../context/AppContext';

const RecordingDownloadExample = () => {
  const { language } = useApp();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    ar: {
      title: 'تسجيلات المقابلات',
      loading: 'جاري التحميل...',
      noRecordings: 'لا توجد تسجيلات',
      error: 'حدث خطأ',
      downloadSuccess: 'تم تحميل التسجيل بنجاح',
      interviewRoom: 'غرفة المقابلة'
    },
    en: {
      title: 'Interview Recordings',
      loading: 'Loading...',
      noRecordings: 'No recordings found',
      error: 'An error occurred',
      downloadSuccess: 'Recording downloaded successfully',
      interviewRoom: 'Interview Room'
    },
    fr: {
      title: 'Enregistrements d\'entretiens',
      loading: 'Chargement...',
      noRecordings: 'Aucun enregistrement trouvé',
      error: 'Une erreur s\'est produite',
      downloadSuccess: 'Enregistrement téléchargé avec succès',
      interviewRoom: 'Salle d\'entretien'
    }
  };

  const t = translations[language] || translations.ar;

  // جلب التسجيلات
  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // مثال: جلب تسجيلات مقابلة معينة
      const interviewId = 'your-interview-id'; // استبدل بمعرف المقابلة الفعلي

      const response = await fetch(`${apiUrl}/api/recordings/interview/${interviewId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل جلب التسجيلات');
      }

      const data = await response.json();

      if (data.success) {
        setRecordings(data.recordings);
      } else {
        throw new Error(data.message || 'فشل جلب التسجيلات');
      }
    } catch (err) {
      console.error('خطأ في جلب التسجيلات:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadComplete = (recording) => {
    console.log('تم تحميل التسجيل:', recording);
    alert(t.downloadSuccess);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#c33' }}>
        <p>{t.error}: {error}</p>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>{t.noRecordings}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#304B60' }}>
        {t.title}
      </h1>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))' }}>
        {recordings.map((recording) => (
          <div key={recording._id} style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '16px', color: '#304B60' }}>
              {t.interviewRoom}: {recording.interviewId?.roomId || 'N/A'}
            </h3>
            <RecordingDownload
              recording={recording}
              onDownloadComplete={handleDownloadComplete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordingDownloadExample;

/**
 * مثال استخدام بسيط:
 * 
 * import RecordingDownload from './components/VideoInterview/RecordingDownload';
 * 
 * function MyComponent() {
 *   const recording = {
 *     _id: '123',
 *     fileUrl: 'https://cloudinary.com/...',
 *     fileSize: 52428800, // 50 MB
 *     duration: 1800, // 30 minutes
 *     startTime: new Date(),
 *     status: 'ready'
 *   };
 * 
 *   return (
 *     <RecordingDownload
 *       recording={recording}
 *       onDownloadComplete={(rec) => console.log('Downloaded:', rec)}
 *     />
 *   );
 * }
 */
