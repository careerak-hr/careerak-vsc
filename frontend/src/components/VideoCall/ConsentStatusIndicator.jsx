import React from 'react';
import './ConsentStatusIndicator.css';

/**
 * ConsentStatusIndicator Component
 * مؤشر حالة موافقة المشاركين على التسجيل
 * 
 * Features:
 * - عرض قائمة المشاركين وحالة موافقتهم
 * - مؤشرات بصرية واضحة (✓ موافق، ✗ رفض، ⏳ في الانتظار)
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متجاوب
 * - تحديث في الوقت الفعلي
 * 
 * Requirements: 2.3 (موافقة المرشح إلزامية قبل التسجيل)
 */
const ConsentStatusIndicator = ({
  participants = [],
  language = 'ar',
  showForHost = false // عرض للمضيف فقط
}) => {
  if (!showForHost || participants.length === 0) return null;

  const translations = {
    ar: {
      title: 'حالة الموافقة على التسجيل',
      consented: 'موافق',
      declined: 'رفض',
      pending: 'في الانتظار',
      allConsented: 'جميع المشاركين وافقوا على التسجيل',
      waitingFor: 'في انتظار موافقة',
      cannotStart: 'لا يمكن بدء التسجيل حتى يوافق الجميع'
    },
    en: {
      title: 'Recording Consent Status',
      consented: 'Consented',
      declined: 'Declined',
      pending: 'Pending',
      allConsented: 'All participants consented to recording',
      waitingFor: 'Waiting for consent from',
      cannotStart: 'Cannot start recording until everyone consents'
    },
    fr: {
      title: 'État du consentement à l\'enregistrement',
      consented: 'Consenti',
      declined: 'Refusé',
      pending: 'En attente',
      allConsented: 'Tous les participants ont consenti à l\'enregistrement',
      waitingFor: 'En attente du consentement de',
      cannotStart: 'Impossible de démarrer l\'enregistrement tant que tout le monde n\'a pas consenti'
    }
  };

  const t = translations[language] || translations.ar;

  const getConsentStatus = (participant) => {
    if (participant.consented === true) {
      return { status: 'consented', icon: '✓', label: t.consented, color: '#4CAF50' };
    } else if (participant.consented === false) {
      return { status: 'declined', icon: '✗', label: t.declined, color: '#F44336' };
    } else {
      return { status: 'pending', icon: '⏳', label: t.pending, color: '#FFC107' };
    }
  };

  const allConsented = participants.every(p => p.consented === true);
  const pendingParticipants = participants.filter(p => p.consented === null || p.consented === undefined);
  const declinedParticipants = participants.filter(p => p.consented === false);

  return (
    <div className="consent-status-indicator">
      <div className="consent-status-header">
        <h3 className="consent-status-title">{t.title}</h3>
        {allConsented && (
          <div className="consent-status-badge consent-status-badge-success">
            ✓ {t.allConsented}
          </div>
        )}
      </div>

      <div className="consent-status-list">
        {participants.map((participant, index) => {
          const status = getConsentStatus(participant);
          return (
            <div key={index} className={`consent-status-item consent-status-${status.status}`}>
              <div className="participant-info">
                <div className="participant-avatar">
                  {participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="participant-details">
                  <div className="participant-name">{participant.name || 'مشارك'}</div>
                  <div className="participant-email">{participant.email || ''}</div>
                </div>
              </div>
              <div className="consent-status-badge" style={{ backgroundColor: status.color }}>
                <span className="status-icon">{status.icon}</span>
                <span className="status-label">{status.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {!allConsented && (
        <div className="consent-status-footer">
          {pendingParticipants.length > 0 && (
            <div className="consent-warning">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">
                {t.waitingFor} {pendingParticipants.length} {pendingParticipants.length === 1 ? 'مشارك' : 'مشاركين'}
              </span>
            </div>
          )}
          {declinedParticipants.length > 0 && (
            <div className="consent-error">
              <span className="error-icon">❌</span>
              <span className="error-text">
                {declinedParticipants.length} {declinedParticipants.length === 1 ? 'مشارك رفض' : 'مشاركين رفضوا'} التسجيل
              </span>
            </div>
          )}
          <div className="consent-note">
            <p>{t.cannotStart}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentStatusIndicator;
