import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './CertificateVerificationPage.css';

/**
 * Certificate Verification Page
 * صفحة التحقق من الشهادات
 * 
 * Public page for verifying certificates by ID or QR code
 * صفحة عامة للتحقق من الشهادات بواسطة المعرف أو رمز QR
 */
const CertificateVerificationPage = () => {
  const { certificateId: urlCertificateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, fontFamily } = useApp();

  // State
  const [certificateId, setCertificateId] = useState(urlCertificateId || searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  // Translations
  const translations = {
    ar: {
      title: 'التحقق من الشهادة',
      subtitle: 'تحقق من صحة الشهادات الصادرة من Careerak',
      inputLabel: 'رقم الشهادة',
      inputPlaceholder: 'أدخل رقم الشهادة (UUID)',
      verifyButton: 'تحقق',
      verifying: 'جاري التحقق...',
      scanQR: 'أو امسح رمز QR الموجود على الشهادة',
      
      // Certificate Details
      certificateDetails: 'تفاصيل الشهادة',
      holder: 'الحاصل على الشهادة',
      course: 'الدورة',
      issueDate: 'تاريخ الإصدار',
      expiryDate: 'تاريخ الانتهاء',
      certificateNumber: 'رقم الشهادة',
      status: 'الحالة',
      category: 'الفئة',
      level: 'المستوى',
      instructor: 'المدرب',
      
      // Status Messages
      valid: 'صالحة',
      invalid: 'غير صالحة',
      revoked: 'ملغاة',
      expired: 'منتهية',
      active: 'نشطة',
      
      // Messages
      notFound: 'الشهادة غير موجودة',
      notFoundDesc: 'لم نتمكن من العثور على شهادة بهذا الرقم. يرجى التحقق من الرقم والمحاولة مرة أخرى.',
      validCertificate: 'شهادة صالحة',
      validCertificateDesc: 'هذه الشهادة صالحة وصادرة من Careerak.',
      revokedCertificate: 'شهادة ملغاة',
      revokedCertificateDesc: 'تم إلغاء هذه الشهادة.',
      expiredCertificate: 'شهادة منتهية',
      expiredCertificateDesc: 'انتهت صلاحية هذه الشهادة.',
      revocationReason: 'سبب الإلغاء',
      
      // Actions
      downloadPDF: 'تحميل PDF',
      viewProfile: 'عرض الملف الشخصي',
      verifyAnother: 'التحقق من شهادة أخرى',
      backToHome: 'العودة للرئيسية',
      
      // Errors
      errorOccurred: 'حدث خطأ',
      tryAgain: 'حاول مرة أخرى',
      invalidId: 'رقم الشهادة غير صحيح',
      
      // Additional Info
      age: 'العمر',
      days: 'يوم',
      daysUntilExpiry: 'أيام حتى الانتهاء',
      noExpiry: 'بدون تاريخ انتهاء'
    },
    en: {
      title: 'Verify Certificate',
      subtitle: 'Verify the authenticity of certificates issued by Careerak',
      inputLabel: 'Certificate Number',
      inputPlaceholder: 'Enter certificate number (UUID)',
      verifyButton: 'Verify',
      verifying: 'Verifying...',
      scanQR: 'Or scan the QR code on the certificate',
      
      // Certificate Details
      certificateDetails: 'Certificate Details',
      holder: 'Certificate Holder',
      course: 'Course',
      issueDate: 'Issue Date',
      expiryDate: 'Expiry Date',
      certificateNumber: 'Certificate Number',
      status: 'Status',
      category: 'Category',
      level: 'Level',
      instructor: 'Instructor',
      
      // Status Messages
      valid: 'Valid',
      invalid: 'Invalid',
      revoked: 'Revoked',
      expired: 'Expired',
      active: 'Active',
      
      // Messages
      notFound: 'Certificate Not Found',
      notFoundDesc: 'We could not find a certificate with this number. Please check the number and try again.',
      validCertificate: 'Valid Certificate',
      validCertificateDesc: 'This certificate is valid and issued by Careerak.',
      revokedCertificate: 'Revoked Certificate',
      revokedCertificateDesc: 'This certificate has been revoked.',
      expiredCertificate: 'Expired Certificate',
      expiredCertificateDesc: 'This certificate has expired.',
      revocationReason: 'Revocation Reason',
      
      // Actions
      downloadPDF: 'Download PDF',
      viewProfile: 'View Profile',
      verifyAnother: 'Verify Another Certificate',
      backToHome: 'Back to Home',
      
      // Errors
      errorOccurred: 'An Error Occurred',
      tryAgain: 'Try Again',
      invalidId: 'Invalid certificate number',
      
      // Additional Info
      age: 'Age',
      days: 'days',
      daysUntilExpiry: 'Days Until Expiry',
      noExpiry: 'No expiry date'
    },
    fr: {
      title: 'Vérifier le Certificat',
      subtitle: 'Vérifiez l\'authenticité des certificats délivrés par Careerak',
      inputLabel: 'Numéro de Certificat',
      inputPlaceholder: 'Entrez le numéro de certificat (UUID)',
      verifyButton: 'Vérifier',
      verifying: 'Vérification...',
      scanQR: 'Ou scannez le code QR sur le certificat',
      
      // Certificate Details
      certificateDetails: 'Détails du Certificat',
      holder: 'Titulaire du Certificat',
      course: 'Cours',
      issueDate: 'Date d\'Émission',
      expiryDate: 'Date d\'Expiration',
      certificateNumber: 'Numéro de Certificat',
      status: 'Statut',
      category: 'Catégorie',
      level: 'Niveau',
      instructor: 'Instructeur',
      
      // Status Messages
      valid: 'Valide',
      invalid: 'Invalide',
      revoked: 'Révoqué',
      expired: 'Expiré',
      active: 'Actif',
      
      // Messages
      notFound: 'Certificat Introuvable',
      notFoundDesc: 'Nous n\'avons pas pu trouver de certificat avec ce numéro. Veuillez vérifier le numéro et réessayer.',
      validCertificate: 'Certificat Valide',
      validCertificateDesc: 'Ce certificat est valide et délivré par Careerak.',
      revokedCertificate: 'Certificat Révoqué',
      revokedCertificateDesc: 'Ce certificat a été révoqué.',
      expiredCertificate: 'Certificat Expiré',
      expiredCertificateDesc: 'Ce certificat a expiré.',
      revocationReason: 'Raison de la Révocation',
      
      // Actions
      downloadPDF: 'Télécharger PDF',
      viewProfile: 'Voir le Profil',
      verifyAnother: 'Vérifier un Autre Certificat',
      backToHome: 'Retour à l\'Accueil',
      
      // Errors
      errorOccurred: 'Une Erreur s\'est Produite',
      tryAgain: 'Réessayer',
      invalidId: 'Numéro de certificat invalide',
      
      // Additional Info
      age: 'Âge',
      days: 'jours',
      daysUntilExpiry: 'Jours Jusqu\'à l\'Expiration',
      noExpiry: 'Pas de date d\'expiration'
    }
  };

  const t = translations[language] || translations.ar;

  // Auto-verify if certificate ID is in URL
  useEffect(() => {
    if (urlCertificateId) {
      handleVerify(urlCertificateId);
    }
  }, [urlCertificateId]);

  // Handle verification
  const handleVerify = async (idToVerify = certificateId) => {
    if (!idToVerify || idToVerify.trim().length === 0) {
      setError(t.invalidId);
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/verify/${idToVerify.trim()}`);
      const data = await response.json();

      if (response.ok) {
        setVerificationResult(data);
      } else {
        setError(data[`message${language.charAt(0).toUpperCase() + language.slice(1)}`] || data.message || t.errorOccurred);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t.noExpiry;
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge status-unknown';
    
    if (status.isValid && status.code === 'active') {
      return 'status-badge status-valid';
    } else if (status.code === 'revoked') {
      return 'status-badge status-revoked';
    } else if (status.code === 'expired') {
      return 'status-badge status-expired';
    } else {
      return 'status-badge status-invalid';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (!status) return '❓';
    
    if (status.isValid && status.code === 'active') {
      return '✅';
    } else if (status.code === 'revoked') {
      return '🚫';
    } else if (status.code === 'expired') {
      return '⏰';
    } else {
      return '❌';
    }
  };

  return (
    <div className="verification-page" style={{ fontFamily }}>
      <div className="verification-container">
        {/* Header */}
        <div className="verification-header">
          <div className="logo-section">
            <img src="/logo.jpg" alt="Careerak" className="verification-logo" />
          </div>
          <h1 className="verification-title">{t.title}</h1>
          <p className="verification-subtitle">{t.subtitle}</p>
        </div>

        {/* Search Form */}
        {!verificationResult && (
          <form className="verification-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="certificateId" className="form-label">
                {t.inputLabel}
              </label>
              <input
                type="text"
                id="certificateId"
                className="form-input"
                placeholder={t.inputPlaceholder}
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="verify-button"
              disabled={loading || !certificateId.trim()}
            >
              {loading ? t.verifying : t.verifyButton}
            </button>

            <p className="qr-hint">{t.scanQR}</p>
          </form>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-icon">❌</div>
            <h3>{t.errorOccurred}</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setError(null);
                setCertificateId('');
                setVerificationResult(null);
              }}
            >
              {t.tryAgain}
            </button>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className="verification-result">
            {/* Status Banner */}
            <div className={`status-banner ${verificationResult.valid ? 'status-banner-valid' : 'status-banner-invalid'}`}>
              <div className="status-icon-large">
                {getStatusIcon(verificationResult.certificate?.status)}
              </div>
              <h2>
                {verificationResult.valid ? t.validCertificate : 
                 verificationResult.certificate?.status?.code === 'revoked' ? t.revokedCertificate :
                 verificationResult.certificate?.status?.code === 'expired' ? t.expiredCertificate :
                 t.notFound}
              </h2>
              <p>
                {verificationResult.certificate?.status?.[`message${language.charAt(0).toUpperCase() + language.slice(1)}`] || 
                 verificationResult[`message${language.charAt(0).toUpperCase() + language.slice(1)}`] ||
                 verificationResult.message}
              </p>
            </div>

            {/* Certificate Details */}
            {verificationResult.certificate && (
              <div className="certificate-details">
                <h3 className="details-title">{t.certificateDetails}</h3>
                
                <div className="details-grid">
                  {/* Holder Info */}
                  <div className="detail-card">
                    <div className="detail-label">{t.holder}</div>
                    <div className="detail-value holder-info">
                      {verificationResult.certificate.holder.profileImage && (
                        <img 
                          src={verificationResult.certificate.holder.profileImage} 
                          alt={verificationResult.certificate.holder.name}
                          className="holder-avatar"
                        />
                      )}
                      <div>
                        <div className="holder-name">{verificationResult.certificate.holder.name}</div>
                        <div className="holder-email">{verificationResult.certificate.holder.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="detail-card">
                    <div className="detail-label">{t.course}</div>
                    <div className="detail-value">{verificationResult.certificate.course.name}</div>
                    {verificationResult.certificate.course.category && (
                      <div className="detail-meta">
                        {t.category}: {verificationResult.certificate.course.category}
                      </div>
                    )}
                    {verificationResult.certificate.course.level && (
                      <div className="detail-meta">
                        {t.level}: {verificationResult.certificate.course.level}
                      </div>
                    )}
                  </div>

                  {/* Issue Date */}
                  <div className="detail-card">
                    <div className="detail-label">{t.issueDate}</div>
                    <div className="detail-value">{formatDate(verificationResult.certificate.dates.issued)}</div>
                    {verificationResult.certificate.dates.ageInDays !== undefined && (
                      <div className="detail-meta">
                        {t.age}: {verificationResult.certificate.dates.ageInDays} {t.days}
                      </div>
                    )}
                  </div>

                  {/* Expiry Date */}
                  {verificationResult.certificate.dates.expiry && (
                    <div className="detail-card">
                      <div className="detail-label">{t.expiryDate}</div>
                      <div className="detail-value">{formatDate(verificationResult.certificate.dates.expiry)}</div>
                      {verificationResult.certificate.dates.daysUntilExpiry !== null && (
                        <div className="detail-meta">
                          {t.daysUntilExpiry}: {verificationResult.certificate.dates.daysUntilExpiry} {t.days}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Certificate Number */}
                  <div className="detail-card detail-card-full">
                    <div className="detail-label">{t.certificateNumber}</div>
                    <div className="detail-value certificate-id">{verificationResult.certificate.certificateId}</div>
                  </div>

                  {/* Status */}
                  <div className="detail-card">
                    <div className="detail-label">{t.status}</div>
                    <div className={getStatusBadgeClass(verificationResult.certificate.status)}>
                      {getStatusIcon(verificationResult.certificate.status)} {' '}
                      {verificationResult.certificate.status?.isValid ? t.valid : t.invalid}
                    </div>
                  </div>

                  {/* Revocation Info */}
                  {verificationResult.certificate.revocation && (
                    <div className="detail-card detail-card-full revocation-info">
                      <div className="detail-label">{t.revocationReason}</div>
                      <div className="detail-value">{verificationResult.certificate.revocation.reason}</div>
                      <div className="detail-meta">
                        {formatDate(verificationResult.certificate.revocation.revokedAt)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="verification-actions">
                  {verificationResult.certificate.links.pdf && (
                    <a 
                      href={verificationResult.certificate.links.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-button action-button-primary"
                    >
                      📄 {t.downloadPDF}
                    </a>
                  )}
                  
                  <button 
                    className="action-button action-button-secondary"
                    onClick={() => {
                      setCertificateId('');
                      setVerificationResult(null);
                      setError(null);
                    }}
                  >
                    🔍 {t.verifyAnother}
                  </button>
                  
                  <button 
                    className="action-button action-button-tertiary"
                    onClick={() => navigate('/')}
                  >
                    🏠 {t.backToHome}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateVerificationPage;
