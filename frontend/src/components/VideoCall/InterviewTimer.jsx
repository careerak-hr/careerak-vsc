import React, { useEffect, useState } from 'react';
import './InterviewTimer.css';

/**
 * InterviewTimer Component
 * مؤقت يعرض مدة المقابلة
 * 
 * Requirements: 6.5 - مؤقت يعرض مدة المقابلة
 * 
 * Features:
 * - عرض الوقت المنقضي بصيغة HH:MM:SS
 * - بدء تلقائي عند بدء المقابلة
 * - إيقاف عند انتهاء المقابلة
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متجاوب
 */
const InterviewTimer = ({ 
  startTime = null, // وقت بدء المقابلة (timestamp)
  isActive = true, // هل المؤقت نشط
  language = 'ar', // اللغة
  showLabel = true, // عرض التسمية
  position = 'top-left' // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // حساب الوقت المنقضي
  useEffect(() => {
    if (!isActive || !startTime) {
      return;
    }

    // حساب الوقت المنقضي الأولي
    const initialElapsed = Math.floor((Date.now() - startTime) / 1000);
    setElapsedTime(initialElapsed);

    // تحديث كل ثانية
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  // تنسيق الوقت HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // الترجمات
  const translations = {
    ar: {
      label: 'مدة المقابلة',
      notStarted: 'لم تبدأ بعد'
    },
    en: {
      label: 'Interview Duration',
      notStarted: 'Not started yet'
    },
    fr: {
      label: 'Durée de l\'entretien',
      notStarted: 'Pas encore commencé'
    }
  };

  const t = translations[language] || translations.ar;

  // إذا لم تبدأ المقابلة بعد
  if (!startTime) {
    return (
      <div className={`interview-timer ${position} not-started`}>
        {showLabel && <span className="timer-label">{t.label}:</span>}
        <span className="timer-value">{t.notStarted}</span>
      </div>
    );
  }

  return (
    <div className={`interview-timer ${position} ${isActive ? 'active' : 'paused'}`}>
      {showLabel && <span className="timer-label">{t.label}:</span>}
      <span className="timer-value">{formatTime(elapsedTime)}</span>
      {!isActive && <span className="timer-status">⏸️</span>}
    </div>
  );
};

export default InterviewTimer;
