import React from 'react';
import { Info } from 'lucide-react';
import './ProgressRestoration.css';

/**
 * Progress Restoration Component
 * عرض رسالة استرجاع التقدم المحفوظ
 * 
 * Requirements: 6.2, 6.3, 6.4
 */
const ProgressRestoration = ({ progressInfo, onRestore, onClear, language = 'ar' }) => {
  if (!progressInfo) return null;

  const translations = {
    ar: {
      title: 'لديك تسجيل غير مكتمل',
      lastSaved: 'آخر حفظ',
      expiresIn: 'ينتهي خلال',
      days: 'أيام',
      day: 'يوم',
      continueButton: 'المتابعة من حيث توقفت',
      startOverButton: 'بدء من جديد',
      step: 'الخطوة'
    },
    en: {
      title: 'You have an incomplete registration',
      lastSaved: 'Last saved',
      expiresIn: 'Expires in',
      days: 'days',
      day: 'day',
      continueButton: 'Continue where you left off',
      startOverButton: 'Start over',
      step: 'Step'
    },
    fr: {
      title: 'Vous avez une inscription incomplète',
      lastSaved: 'Dernière sauvegarde',
      expiresIn: 'Expire dans',
      days: 'jours',
      day: 'jour',
      continueButton: 'Continuer où vous vous êtes arrêté',
      startOverButton: 'Recommencer',
      step: 'Étape'
    }
  };

  const t = translations[language] || translations.ar;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'ar' ? 'الآن' : 'Now';
    if (diffMins < 60) return `${diffMins} ${language === 'ar' ? 'دقيقة' : 'min'}`;
    if (diffHours < 24) return `${diffHours} ${language === 'ar' ? 'ساعة' : 'hour'}`;
    return `${diffDays} ${language === 'ar' ? 'يوم' : 'day'}`;
  };

  const daysText = progressInfo.daysRemaining === 1 ? t.day : t.days;

  return (
    <div className="progress-restoration-container">
      <div className="progress-restoration-card">
        <div className="progress-restoration-header">
          <Info className="progress-restoration-icon" size={24} />
          <div className="progress-restoration-content">
            <h3 className="progress-restoration-title">{t.title}</h3>
            <div className="progress-restoration-info">
              <span className="progress-info-item">
                {t.step} {progressInfo.step}
              </span>
              <span className="progress-info-separator">•</span>
              <span className="progress-info-item">
                {t.lastSaved}: {formatDate(progressInfo.savedAt)}
              </span>
              <span className="progress-info-separator">•</span>
              <span className="progress-info-item">
                {t.expiresIn}: {progressInfo.daysRemaining} {daysText}
              </span>
            </div>
          </div>
        </div>

        <div className="progress-restoration-actions">
          <button
            onClick={onRestore}
            className="progress-btn progress-btn-primary"
            type="button"
          >
            {t.continueButton}
          </button>
          <button
            onClick={onClear}
            className="progress-btn progress-btn-outline"
            type="button"
          >
            {t.startOverButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressRestoration;
