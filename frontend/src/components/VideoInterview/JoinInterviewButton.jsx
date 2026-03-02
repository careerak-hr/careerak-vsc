import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './JoinInterviewButton.css';

/**
 * زر الانضمام للمقابلة مع countdown timer
 * يظهر الزر نشطاً فقط قبل 5 دقائق من الموعد المحدد
 * 
 * Requirements: 5.3, 5.4, 5.5
 * Property: 7 (Scheduled Interview Access)
 * 
 * @param {string} interviewId - معرف المقابلة
 * @param {function} onJoin - دالة تُنفذ عند النقر على "انضم الآن"
 * @param {string} className - CSS classes إضافية
 */
const JoinInterviewButton = ({ interviewId, onJoin, className = '' }) => {
  const { language } = useApp();
  const [canJoin, setCanJoin] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // التحقق من إمكانية الانضمام
  const checkCanJoin = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/interviews/${interviewId}/can-join`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCanJoin(data.canJoin);
        setTimeUntilStart(data.timeUntilStart);
        setMessage(data.message[language] || data.message.ar);
        setStatus(data.status);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error checking can join:', err);
      setError(
        language === 'ar' ? 'فشل التحقق من حالة المقابلة' :
        language === 'en' ? 'Failed to check interview status' :
        'Échec de la vérification du statut de l\'entretien'
      );
    } finally {
      setLoading(false);
    }
  }, [interviewId, language]);

  // التحقق عند التحميل
  useEffect(() => {
    checkCanJoin();
  }, [checkCanJoin]);

  // تحديث كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      checkCanJoin();
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [checkCanJoin]);

  // معالجة النقر على الزر
  const handleJoinClick = () => {
    if (canJoin && onJoin) {
      onJoin();
    }
  };

  // الترجمات
  const translations = {
    ar: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      retry: 'إعادة المحاولة',
    },
    en: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
    },
    fr: {
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      retry: 'Réessayer',
    },
  };

  const t = translations[language] || translations.ar;

  // حالة التحميل
  if (loading) {
    return (
      <div className={`join-interview-button loading ${className}`}>
        <div className="spinner"></div>
        <span>{t.loading}</span>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className={`join-interview-button error ${className}`}>
        <span className="error-message">{error}</span>
        <button onClick={checkCanJoin} className="retry-button">
          {t.retry}
        </button>
      </div>
    );
  }

  // تحديد CSS class حسب الحالة
  const buttonClass = `join-interview-button ${status} ${canJoin ? 'active' : 'disabled'} ${className}`;

  return (
    <div className={buttonClass}>
      {/* Countdown Timer */}
      {status === 'waiting' && timeUntilStart > 0 && (
        <div className="countdown-timer">
          <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="time-remaining">{timeUntilStart}</span>
        </div>
      )}

      {/* زر الانضمام */}
      <button
        onClick={handleJoinClick}
        disabled={!canJoin}
        className="join-button"
      >
        {/* أيقونة الفيديو */}
        <svg className="video-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
        
        {/* النص */}
        <span className="button-text">{message}</span>
      </button>

      {/* مؤشر الحالة */}
      <div className={`status-indicator ${status}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {status === 'waiting' && (language === 'ar' ? 'في الانتظار' : language === 'en' ? 'Waiting' : 'En attente')}
          {status === 'ready' && (language === 'ar' ? 'جاهز' : language === 'en' ? 'Ready' : 'Prêt')}
          {status === 'active' && (language === 'ar' ? 'نشط' : language === 'en' ? 'Active' : 'Actif')}
          {status === 'ended' && (language === 'ar' ? 'انتهى' : language === 'en' ? 'Ended' : 'Terminé')}
        </span>
      </div>
    </div>
  );
};

export default JoinInterviewButton;
