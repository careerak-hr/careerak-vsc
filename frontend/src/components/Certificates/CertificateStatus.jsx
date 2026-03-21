import React from 'react';
import { useApp } from '../../context/AppContext';
import './CertificateStatus.css';

const translations = {
  ar: {
    valid: 'صالحة',
    revoked: 'ملغاة',
    expired: 'منتهية',
    validDesc: 'هذه الشهادة صالحة ونشطة',
    revokedDesc: 'تم إلغاء هذه الشهادة',
    expiredDesc: 'هذه الشهادة منتهية الصلاحية',
    expiresOn: 'تنتهي في',
    reason: 'السبب',
  },
  en: {
    valid: 'Valid',
    revoked: 'Revoked',
    expired: 'Expired',
    validDesc: 'This certificate is valid and active',
    revokedDesc: 'This certificate has been revoked',
    expiredDesc: 'This certificate has expired',
    expiresOn: 'Expires on',
    reason: 'Reason',
  },
  fr: {
    valid: 'Valide',
    revoked: 'Révoqué',
    expired: 'Expiré',
    validDesc: 'Ce certificat est valide et actif',
    revokedDesc: 'Ce certificat a été révoqué',
    expiredDesc: 'Ce certificat a expiré',
    expiresOn: 'Expire le',
    reason: 'Raison',
  },
};

/**
 * مكون عرض حالة الشهادة - يدعم العربية والإنجليزية والفرنسية
 */
const CertificateStatus = ({ status, expiryDate, revocationReason, className = '' }) => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;

  const getStatusInfo = () => {
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return { key: 'expired', icon: '⏰', color: 'orange', label: t.expired, description: t.expiredDesc };
    }
    if (status === 'revoked') {
      return { key: 'revoked', icon: '❌', color: 'red', label: t.revoked, description: revocationReason || t.revokedDesc };
    }
    return { key: 'valid', icon: '✅', color: 'green', label: t.valid, description: t.validDesc };
  };

  const statusInfo = getStatusInfo();

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );

  return (
    <div className={`certificate-status certificate-status-${statusInfo.color} ${className}`}>
      <div className="certificate-status-badge">
        <span className="certificate-status-icon">{statusInfo.icon}</span>
        <span className="certificate-status-label">{statusInfo.label}</span>
      </div>

      <div className="certificate-status-description">
        <p>{statusInfo.description}</p>
      </div>

      {expiryDate && statusInfo.key !== 'expired' && (
        <div className="certificate-status-expiry">
          <span className="certificate-status-expiry-label">{t.expiresOn}: </span>
          <span className="certificate-status-expiry-date">{formatDate(expiryDate)}</span>
        </div>
      )}

      {statusInfo.key === 'revoked' && revocationReason && (
        <div className="certificate-status-revocation-reason">
          <span className="certificate-status-revocation-label">{t.reason}: </span>
          <span className="certificate-status-revocation-text">{revocationReason}</span>
        </div>
      )}
    </div>
  );
};

export default CertificateStatus;
