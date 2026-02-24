import React from 'react';
import './ConnectedAccountCard.css';

// Provider icons and colors
const providerConfig = {
  google: {
    name: {
      ar: 'جوجل',
      en: 'Google',
      fr: 'Google'
    },
    color: '#4285F4',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    )
  },
  facebook: {
    name: {
      ar: 'فيسبوك',
      en: 'Facebook',
      fr: 'Facebook'
    },
    color: '#1877F2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
      </svg>
    )
  },
  linkedin: {
    name: {
      ar: 'لينكد إن',
      en: 'LinkedIn',
      fr: 'LinkedIn'
    },
    color: '#0A66C2',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
      </svg>
    )
  }
};

// Translations
const translations = {
  ar: {
    connectedOn: 'متصل منذ',
    lastUsed: 'آخر استخدام',
    unlink: 'فك الربط',
    never: 'لم يستخدم بعد'
  },
  en: {
    connectedOn: 'Connected on',
    lastUsed: 'Last used',
    unlink: 'Unlink',
    never: 'Never used'
  },
  fr: {
    connectedOn: 'Connecté le',
    lastUsed: 'Dernière utilisation',
    unlink: 'Déconnecter',
    never: 'Jamais utilisé'
  }
};

// Format date
const formatDate = (dateString, language) => {
  if (!dateString) return translations[language].never;
  
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const locale = language === 'ar' ? 'ar-SA' : 
                 language === 'fr' ? 'fr-FR' : 
                 'en-US';
  
  return date.toLocaleDateString(locale, options);
};

// Calculate time ago
const timeAgo = (dateString, language) => {
  if (!dateString) return translations[language].never;
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    ar: {
      year: 'سنة',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      hour: 'ساعة',
      minute: 'دقيقة',
      just_now: 'الآن'
    },
    en: {
      year: 'year',
      month: 'month',
      week: 'week',
      day: 'day',
      hour: 'hour',
      minute: 'minute',
      just_now: 'just now'
    },
    fr: {
      year: 'an',
      month: 'mois',
      week: 'semaine',
      day: 'jour',
      hour: 'heure',
      minute: 'minute',
      just_now: 'à l\'instant'
    }
  };
  
  const t = intervals[language] || intervals.en;
  
  if (seconds < 60) return t.just_now;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${t.minute}${minutes > 1 && language !== 'ar' ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${t.hour}${hours > 1 && language !== 'ar' ? 's' : ''}`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${t.day}${days > 1 && language !== 'ar' ? 's' : ''}`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} ${t.week}${weeks > 1 && language !== 'ar' ? 's' : ''}`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${t.month}${months > 1 && language !== 'ar' ? 's' : ''}`;
  
  const years = Math.floor(days / 365);
  return `${years} ${t.year}${years > 1 && language !== 'ar' ? 's' : ''}`;
};

export default function ConnectedAccountCard({ account, onUnlink, language = 'ar' }) {
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';
  
  const config = providerConfig[account.provider] || providerConfig.google;
  const providerName = config.name[language] || config.name.en;
  
  return (
    <div 
      className="connected-account-card"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ '--provider-color': config.color }}
    >
      {/* Header */}
      <div className="card-header">
        <div className="provider-icon" style={{ color: config.color }}>
          {config.icon}
        </div>
        <div className="provider-info">
          <h3 className="provider-name">{providerName}</h3>
          <p className="provider-email">{account.email}</p>
        </div>
      </div>
      
      {/* Details */}
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">{t.connectedOn}:</span>
          <span className="detail-value">{formatDate(account.connectedAt, language)}</span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">{t.lastUsed}:</span>
          <span className="detail-value">{timeAgo(account.lastUsed, language)}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="card-actions">
        <button 
          className="unlink-button"
          onClick={() => onUnlink(account)}
          aria-label={`${t.unlink} ${providerName}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{t.unlink}</span>
        </button>
      </div>
    </div>
  );
}
