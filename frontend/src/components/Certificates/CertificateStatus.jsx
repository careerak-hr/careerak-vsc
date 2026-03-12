import React from 'react';
import './CertificateStatus.css';

/**
 * مكون عرض حالة الشهادة
 * يعرض حالة الشهادة (صالحة، ملغاة، منتهية) مع أيقونة ولون مناسب
 */
const CertificateStatus = ({ status, expiryDate, revocationReason, className = '' }) => {
  /**
   * تحديد حالة الشهادة
   * @returns {Object} - { status, label, labelAr, icon, color }
   */
  const getStatusInfo = () => {
    // التحقق من الانتهاء
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return {
        status: 'expired',
        label: 'Expired',
        labelAr: 'منتهية',
        icon: '⏰',
        color: 'orange',
        description: 'This certificate has expired',
        descriptionAr: 'هذه الشهادة منتهية الصلاحية'
      };
    }

    // التحقق من الإلغاء
    if (status === 'revoked') {
      return {
        status: 'revoked',
        label: 'Revoked',
        labelAr: 'ملغاة',
        icon: '❌',
        color: 'red',
        description: revocationReason || 'This certificate has been revoked',
        descriptionAr: revocationReason || 'تم إلغاء هذه الشهادة'
      };
    }

    // الشهادة صالحة
    return {
      status: 'valid',
      label: 'Valid',
      labelAr: 'صالحة',
      icon: '✅',
      color: 'green',
      description: 'This certificate is valid and active',
      descriptionAr: 'هذه الشهادة صالحة ونشطة'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`certificate-status certificate-status-${statusInfo.color} ${className}`}>
      <div className="certificate-status-badge">
        <span className="certificate-status-icon">{statusInfo.icon}</span>
        <span className="certificate-status-label">
          <span className="certificate-status-label-en">{statusInfo.label}</span>
          <span className="certificate-status-label-ar">{statusInfo.labelAr}</span>
        </span>
      </div>
      
      <div className="certificate-status-description">
        <p className="certificate-status-description-en">{statusInfo.description}</p>
        <p className="certificate-status-description-ar">{statusInfo.descriptionAr}</p>
      </div>

      {/* عرض تاريخ الانتهاء إذا كان موجوداً */}
      {expiryDate && statusInfo.status !== 'expired' && (
        <div className="certificate-status-expiry">
          <span className="certificate-status-expiry-label">
            Expires on / تنتهي في:
          </span>
          <span className="certificate-status-expiry-date">
            {new Date(expiryDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      )}

      {/* عرض سبب الإلغاء إذا كان موجوداً */}
      {statusInfo.status === 'revoked' && revocationReason && (
        <div className="certificate-status-revocation-reason">
          <span className="certificate-status-revocation-label">
            Reason / السبب:
          </span>
          <span className="certificate-status-revocation-text">
            {revocationReason}
          </span>
        </div>
      )}
    </div>
  );
};

export default CertificateStatus;
