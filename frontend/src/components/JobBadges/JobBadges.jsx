import React from 'react';
import { useApp } from '../../context/AppContext';
import './JobBadges.css';

/**
 * JobBadges Component
 * عرض badges للوظائف (جديد، عاجل)
 */
const JobBadges = ({ job, className = '' }) => {
  const { language } = useApp();
  
  if (!job) return null;
  
  const { isNew, isUrgent } = job;
  
  // إذا لم يكن هناك badges، لا تعرض شيء
  if (!isNew && !isUrgent) return null;
  
  const translations = {
    ar: {
      new: 'جديد',
      urgent: 'عاجل'
    },
    en: {
      new: 'New',
      urgent: 'Urgent'
    },
    fr: {
      new: 'Nouveau',
      urgent: 'Urgent'
    }
  };
  
  const t = translations[language] || translations.ar;
  
  return (
    <div className={`job-badges ${className}`}>
      {isNew && (
        <span className="job-badge job-badge-new">
          <span className="job-badge-icon">✨</span>
          <span className="job-badge-text">{t.new}</span>
        </span>
      )}
      
      {isUrgent && (
        <span className="job-badge job-badge-urgent">
          <span className="job-badge-icon">⚡</span>
          <span className="job-badge-text">{t.urgent}</span>
        </span>
      )}
    </div>
  );
};

export default JobBadges;
