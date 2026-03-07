import React from 'react';
import './CompanyResponseRate.css';

/**
 * مكون عرض معدل استجابة الشركة
 * يعرض تصنيف الاستجابة (سريع، متوسط، بطيء) مع معلومات إضافية
 */
const CompanyResponseRate = ({ responseRate, showDetails = false }) => {
  if (!responseRate || !responseRate.label) {
    return null;
  }

  const { label, percentage, averageResponseTime, averageResponseDays } = responseRate;

  // النصوص حسب اللغة
  const labels = {
    fast: {
      ar: 'استجابة سريعة',
      en: 'Fast Response',
      fr: 'Réponse Rapide'
    },
    medium: {
      ar: 'استجابة متوسطة',
      en: 'Medium Response',
      fr: 'Réponse Moyenne'
    },
    slow: {
      ar: 'استجابة بطيئة',
      en: 'Slow Response',
      fr: 'Réponse Lente'
    }
  };

  // الأيقونات
  const icons = {
    fast: '⚡',
    medium: '⏱️',
    slow: '🐌'
  };

  // الألوان
  const colors = {
    fast: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300'
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300'
    },
    slow: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300'
    }
  };

  const currentLang = document.documentElement.lang || 'ar';
  const labelText = labels[label][currentLang] || labels[label].ar;
  const icon = icons[label];
  const colorClasses = colors[label];

  return (
    <div className={`company-response-rate ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}>
      <div className="response-rate-badge">
        <span className="response-rate-icon">{icon}</span>
        <span className="response-rate-label">{labelText}</span>
      </div>
      
      {showDetails && percentage && (
        <div className="response-rate-details">
          <div className="response-rate-percentage">
            {percentage}% معدل الاستجابة
          </div>
          {averageResponseDays && (
            <div className="response-rate-time">
              متوسط الوقت: {averageResponseDays} {averageResponseDays === 1 ? 'يوم' : 'أيام'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyResponseRate;
