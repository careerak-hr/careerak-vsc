/**
 * Certificate Visibility Example
 * 
 * مثال كامل لاستخدام ميزة إخفاء/إظهار الشهادات
 * Requirements: 4.4 (خيار إخفاء/إظهار شهادات معينة)
 * 
 * الميزات:
 * - عرض جميع الشهادات مع حالة الإخفاء
 * - تبديل حالة الإخفاء بنقرة واحدة
 * - مؤشرات بصرية للشهادات المخفية
 * - دعم متعدد اللغات (ar, en, fr)
 * - تصميم متجاوب
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './CertificateVisibilityExample.css';

const CertificateVisibilityExample = () => {
  const { language, fontFamily } = useApp();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHidden, setShowHidden] = useState(true);

  const translations = {
    ar: {
      title: 'إدارة رؤية الشهادات',
      description: 'يمكنك إخفاء أو إظهار شهاداتك في ملفك الشخصي',
      showHidden: 'إظهار الشهادات المخفية',
      hideHidden: 'إخفاء الشهادات المخفية',
      visible: 'مرئية',
      hidden: 'مخفية',
      hide: 'إخفاء',
      show: 'إظهار',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      noCertificates: 'لا توجد شهادات',
      visibleCount: 'شهادة مرئية',
      hiddenCount: 'شهادة مخفية',
      toggleSuccess: 'تم تحديث رؤية الشهادة بنجاح',
      toggleError: 'فشل تحديث رؤية الشهادة'
    },
    en: {
      title: 'Manage Certificate Visibility',
      description: 'You can hide or show your certificates in your profile',
      showHidden: 'Show Hidden Certificates',
      hideHidden: 'Hide Hidden Certificates',
      visible: 'Visible',
      hidden: 'Hidden',
      hide: 'Hide',
      show: 'Show',
      loading: 'Loading...',
      error: 'An error occurred',
      noCertificates: 'No certificates',
      visibleCount: 'visible certificate(s)',
      hiddenCount: 'hidden certificate(s)',
      toggleSuccess: 'Certificate visibility updated successfully',
      toggleError: 'Failed to update certificate visibility'
    },
    fr: {
      title: 'Gérer la Visibilité des Certificats',
      description: 'Vous pouvez masquer ou afficher vos certificats dans votre profil',
      showHidden: 'Afficher les Certificats Masqués',
      hideHidden: 'Masquer les Certificats Masqués',
      visible: 'Visible',
      hidden: 'Masqué',
      hide: 'Masquer',
      show: 'Afficher',
      loading: 'Chargement...',
      error: 'Une erreur est survenue',
      noCertificates: 'Aucun certificat',
      visibleCount: 'certificat(s) visible(s)',
      hiddenCount: 'certificat(s) masqué(s)',
      toggleSuccess: 'Visibilité du certificat mise à jour avec succès',
      toggleError: 'Échec de la mise à jour de la visibilité du certificat'
    }
  };

  const t = translations[language] || translations.ar;

  const fontStyle = {
    fontFamily: fontFamily,
    fontWeight: 'inherit',
    fontStyle: 'inherit'
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates?userId=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (certificateId, currentVisibility) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/${certificateId}/visibility`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isHidden: !currentVisibility })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      const data = await response.json();

      // Update local state
      setCertificates(prev => prev.map(cert => 
        cert.certificateId === certificateId 
          ? { ...cert, isHidden: !currentVisibility }
          : cert
      ));

      // Show success message
      showNotification(t.toggleSuccess, 'success');
    } catch (err) {
      console.error('Error toggling visibility:', err);
      showNotification(t.toggleError, 'error');
    }
  };

  const showNotification = (message, type) => {
    // Simple notification (you can replace with your notification system)
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const getVisibleCount = () => {
    return certificates.filter(c => !c.isHidden).length;
  };

  const getHiddenCount = () => {
    return certificates.filter(c => c.isHidden).length;
  };

  const getFilteredCertificates = () => {
    if (showHidden) {
      return certificates;
    }
    return certificates.filter(c => !c.isHidden);
  };

  if (loading) {
    return (
      <div className="visibility-example" style={fontStyle}>
        <div className="loading-state">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visibility-example" style={fontStyle}>
        <div className="error-state">{t.error}: {error}</div>
      </div>
    );
  }

  const filteredCertificates = getFilteredCertificates();

  return (
    <div className="visibility-example" style={fontStyle}>
      {/* Header */}
      <div className="example-header">
        <div className="header-content">
          <h2 className="example-title">{t.title}</h2>
          <p className="example-description">{t.description}</p>
        </div>

        {/* Stats */}
        <div className="visibility-stats">
          <div className="stat-item visible">
            <span className="stat-number">{getVisibleCount()}</span>
            <span className="stat-label">{t.visibleCount}</span>
          </div>
          <div className="stat-item hidden">
            <span className="stat-number">{getHiddenCount()}</span>
            <span className="stat-label">{t.hiddenCount}</span>
          </div>
        </div>

        {/* Toggle Filter */}
        <div className="filter-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            <span className="toggle-text">
              {showHidden ? t.showHidden : t.hideHidden}
            </span>
          </label>
        </div>
      </div>

      {/* Certificates List */}
      {filteredCertificates.length === 0 ? (
        <div className="empty-state">{t.noCertificates}</div>
      ) : (
        <div className="certificates-list">
          {filteredCertificates.map((certificate) => (
            <div
              key={certificate._id}
              className={`certificate-item ${certificate.isHidden ? 'is-hidden' : 'is-visible'}`}
            >
              <div className="certificate-content">
                <div className="certificate-icon">
                  <i className={`fas ${certificate.isHidden ? 'fa-eye-slash' : 'fa-certificate'}`}></i>
                </div>
                
                <div className="certificate-details">
                  <h3 className="certificate-name">{certificate.courseName}</h3>
                  <p className="certificate-date">
                    {new Date(certificate.issueDate).toLocaleDateString(
                      language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US'
                    )}
                  </p>
                  <span className={`visibility-badge ${certificate.isHidden ? 'hidden' : 'visible'}`}>
                    {certificate.isHidden ? t.hidden : t.visible}
                  </span>
                </div>
              </div>

              <button
                className={`toggle-btn ${certificate.isHidden ? 'show' : 'hide'}`}
                onClick={() => toggleVisibility(certificate.certificateId, certificate.isHidden)}
              >
                <i className={`fas ${certificate.isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                <span>{certificate.isHidden ? t.show : t.hide}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="info-box">
        <i className="fas fa-info-circle"></i>
        <div className="info-content">
          <h4>ℹ️ {language === 'ar' ? 'معلومة' : language === 'fr' ? 'Information' : 'Info'}</h4>
          <p>
            {language === 'ar' 
              ? 'الشهادات المخفية لن تظهر في ملفك الشخصي العام، لكن يمكنك رؤيتها دائماً في لوحة التحكم الخاصة بك.'
              : language === 'fr'
              ? 'Les certificats masqués n\'apparaîtront pas dans votre profil public, mais vous pouvez toujours les voir dans votre tableau de bord.'
              : 'Hidden certificates will not appear in your public profile, but you can always see them in your dashboard.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVisibilityExample;
