import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import './VerificationPage.css';

/**
 * صفحة التحقق من الشهادات
 * Certificate Verification Page
 * 
 * Features:
 * - التحقق من صحة الشهادة
 * - عرض تفاصيل الشهادة
 * - QR Code للمشاركة السريعة
 * - دعم متعدد اللغات
 */
const VerificationPage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { language } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);

  // الترجمات
  const translations = {
    ar: {
      title: 'التحقق من الشهادة',
      loading: 'جاري التحقق...',
      notFound: 'الشهادة غير موجودة',
      valid: 'شهادة صالحة',
      invalid: 'شهادة غير صالحة',
      revoked: 'تم إلغاء الشهادة',
      expired: 'انتهت صلاحية الشهادة',
      holder: 'حامل الشهادة',
      course: 'الدورة',
      issueDate: 'تاريخ الإصدار',
      expiryDate: 'تاريخ الانتهاء',
      certificateId: 'رقم الشهادة',
      status: 'الحالة',
      downloadPdf: 'تحميل PDF',
      shareQr: 'مشاركة QR Code',
      hideQr: 'إخفاء QR Code',
      scanQr: 'امسح هذا الرمز للتحقق من الشهادة',
      backToHome: 'العودة للرئيسية',
      verificationUrl: 'رابط التحقق',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ الرابط',
      instructor: 'المدرب',
      category: 'الفئة',
      level: 'المستوى'
    },
    en: {
      title: 'Certificate Verification',
      loading: 'Verifying...',
      notFound: 'Certificate not found',
      valid: 'Valid Certificate',
      invalid: 'Invalid Certificate',
      revoked: 'Certificate Revoked',
      expired: 'Certificate Expired',
      holder: 'Certificate Holder',
      course: 'Course',
      issueDate: 'Issue Date',
      expiryDate: 'Expiry Date',
      certificateId: 'Certificate ID',
      status: 'Status',
      downloadPdf: 'Download PDF',
      shareQr: 'Share QR Code',
      hideQr: 'Hide QR Code',
      scanQr: 'Scan this code to verify the certificate',
      backToHome: 'Back to Home',
      verificationUrl: 'Verification URL',
      copyLink: 'Copy Link',
      linkCopied: 'Link Copied',
      instructor: 'Instructor',
      category: 'Category',
      level: 'Level'
    },
    fr: {
      title: 'Vérification du Certificat',
      loading: 'Vérification en cours...',
      notFound: 'Certificat introuvable',
      valid: 'Certificat Valide',
      invalid: 'Certificat Invalide',
      revoked: 'Certificat Révoqué',
      expired: 'Certificat Expiré',
      holder: 'Titulaire du Certificat',
      course: 'Cours',
      issueDate: 'Date d\'émission',
      expiryDate: 'Date d\'expiration',
      certificateId: 'ID du Certificat',
      status: 'Statut',
      downloadPdf: 'Télécharger PDF',
      shareQr: 'Partager QR Code',
      hideQr: 'Masquer QR Code',
      scanQr: 'Scannez ce code pour vérifier le certificat',
      backToHome: 'Retour à l\'accueil',
      verificationUrl: 'URL de Vérification',
      copyLink: 'Copier le Lien',
      linkCopied: 'Lien Copié',
      instructor: 'Instructeur',
      category: 'Catégorie',
      level: 'Niveau'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/verify/${certificateId}`);
      const data = await response.json();

      if (data.success && data.found) {
        setCertificate(data.certificate);
        
        // توليد QR Code
        const verificationUrl = data.certificate.links.verification;
        const qrUrl = await QRCode.toDataURL(verificationUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#304B60',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } else {
        setError(data.message || t.notFound);
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('حدث خطأ أثناء التحقق من الشهادة');
    } finally {
      setLoading(false);
    }
  };

  const copyVerificationLink = () => {
    if (certificate?.links?.verification) {
      navigator.clipboard.writeText(certificate.links.verification);
      alert(t.linkCopied);
    }
  };

  const downloadQrCode = () => {
    const link = document.createElement('a');
    link.download = `certificate-qr-${certificateId}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="verification-page">
        <div className="verification-container">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="verification-page">
        <div className="verification-container error">
          <div className="error-icon">❌</div>
          <h1>{t.notFound}</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  const isValid = certificate.status.isValid;
  const statusClass = isValid ? 'valid' : 'invalid';

  return (
    <div className="verification-page">
      <div className="verification-container">
        {/* Header */}
        <div className={`verification-header ${statusClass}`}>
          <div className="status-icon">
            {isValid ? '✅' : '❌'}
          </div>
          <h1>{certificate.status[`message${language === 'ar' ? 'Ar' : language === 'en' ? 'En' : 'Fr'}`]}</h1>
          <p className="certificate-id">{t.certificateId}: {certificate.certificateId}</p>
        </div>

        {/* Certificate Details */}
        <div className="certificate-details">
          {/* Holder Info */}
          <div className="detail-section">
            <h2>{t.holder}</h2>
            <div className="holder-info">
              {certificate.holder.profileImage && (
                <img 
                  src={certificate.holder.profileImage} 
                  alt={certificate.holder.name}
                  className="holder-avatar"
                />
              )}
              <div>
                <p className="holder-name">{certificate.holder.name}</p>
                <p className="holder-email">{certificate.holder.email}</p>
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="detail-section">
            <h2>{t.course}</h2>
            <p className="course-name">{certificate.course.name}</p>
            {certificate.course.category && (
              <p className="course-meta">
                <span>{t.category}:</span> {certificate.course.category}
              </p>
            )}
            {certificate.course.level && (
              <p className="course-meta">
                <span>{t.level}:</span> {certificate.course.level}
              </p>
            )}
            {certificate.course.instructor && (
              <p className="course-meta">
                <span>{t.instructor}:</span> {certificate.course.instructor}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="detail-section">
            <div className="dates-grid">
              <div>
                <h3>{t.issueDate}</h3>
                <p>{new Date(certificate.dates.issued).toLocaleDateString(language)}</p>
              </div>
              {certificate.dates.expiry && (
                <div>
                  <h3>{t.expiryDate}</h3>
                  <p>{new Date(certificate.dates.expiry).toLocaleDateString(language)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Verification URL */}
          <div className="detail-section">
            <h2>{t.verificationUrl}</h2>
            <div className="url-container">
              <input 
                type="text" 
                value={certificate.links.verification} 
                readOnly 
                className="url-input"
              />
              <button onClick={copyVerificationLink} className="btn-copy">
                {t.copyLink}
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="detail-section qr-section">
            <button 
              onClick={() => setShowQrCode(!showQrCode)} 
              className="btn-qr"
            >
              {showQrCode ? t.hideQr : t.shareQr}
            </button>
            
            {showQrCode && (
              <div className="qr-code-container">
                <p className="qr-instruction">{t.scanQr}</p>
                <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                <button onClick={downloadQrCode} className="btn-download-qr">
                  تحميل QR Code
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="actions">
            {certificate.links.pdf && (
              <a 
                href={certificate.links.pdf} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {t.downloadPdf}
              </a>
            )}
            <button onClick={() => navigate('/')} className="btn-secondary">
              {t.backToHome}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
