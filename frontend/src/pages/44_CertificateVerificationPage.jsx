import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificateStatus from '../components/Certificates/CertificateStatus';
import './CertificateVerificationPage.css';

/**
 * صفحة التحقق من الشهادة
 * صفحة عامة لا تحتاج تسجيل دخول
 */
const CertificateVerificationPage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchId, setSearchId] = useState(certificateId || '');

  /**
   * التحقق من الشهادة
   */
  const verifyCertificate = async (id) => {
    if (!id || id.trim() === '') {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const response = await fetch(`/api/certificates/verify/${id}`);
      const data = await response.json();

      if (data.success && data.valid !== false) {
        setCertificate(data.certificate);
      } else {
        setError(data.message || 'Certificate not found');
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError('An error occurred while verifying the certificate');
    } finally {
      setLoading(false);
    }
  };

  // التحقق التلقائي إذا كان certificateId موجود في URL
  useEffect(() => {
    if (certificateId) {
      verifyCertificate(certificateId);
    }
  }, [certificateId]);

  /**
   * معالجة البحث
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${searchId.trim()}`);
    }
  };

  return (
    <div className="certificate-verification-page">
      <div className="verification-container">
        {/* Header */}
        <header className="verification-header">
          <h1 className="verification-title">
            <span className="verification-title-ar">التحقق من الشهادة</span>
            <span className="verification-title-en">Certificate Verification</span>
          </h1>
          <p className="verification-subtitle">
            <span className="verification-subtitle-ar">
              تحقق من صحة الشهادة باستخدام رقم الشهادة أو مسح رمز QR
            </span>
            <span className="verification-subtitle-en">
              Verify certificate authenticity using certificate ID or QR code
            </span>
          </p>
        </header>

        {/* Search Form */}
        <form className="verification-search-form" onSubmit={handleSearch}>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="أدخل رقم الشهادة / Enter Certificate ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={loading || !searchId.trim()}
            >
              {loading ? (
                <>
                  <span className="search-button-text-ar">جاري التحقق...</span>
                  <span className="search-button-text-en">Verifying...</span>
                </>
              ) : (
                <>
                  <span className="search-button-text-ar">تحقق</span>
                  <span className="search-button-text-en">Verify</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="verification-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">
              <span className="loading-text-ar">جاري التحقق من الشهادة...</span>
              <span className="loading-text-en">Verifying certificate...</span>
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="verification-error">
            <span className="error-icon">❌</span>
            <p className="error-message">{error}</p>
          </div>
        )}

        {/* Certificate Details */}
        {certificate && !loading && !error && (
          <div className="verification-result">
            {/* Certificate Status */}
            <CertificateStatus
              status={certificate.status}
              expiryDate={certificate.expiryDate}
              revocationReason={certificate.revocationReason}
              className="verification-status"
            />

            {/* Certificate Information */}
            <div className="certificate-info-card">
              <h2 className="certificate-info-title">
                <span className="certificate-info-title-ar">معلومات الشهادة</span>
                <span className="certificate-info-title-en">Certificate Information</span>
              </h2>

              <div className="certificate-info-grid">
                {/* Certificate ID */}
                <div className="info-item">
                  <span className="info-label">
                    <span className="info-label-ar">رقم الشهادة</span>
                    <span className="info-label-en">Certificate ID</span>
                  </span>
                  <span className="info-value certificate-id">{certificate.certificateId}</span>
                </div>

                {/* Recipient Name */}
                <div className="info-item">
                  <span className="info-label">
                    <span className="info-label-ar">اسم الحاصل على الشهادة</span>
                    <span className="info-label-en">Recipient Name</span>
                  </span>
                  <span className="info-value">{certificate.userName}</span>
                </div>

                {/* Course Name */}
                <div className="info-item">
                  <span className="info-label">
                    <span className="info-label-ar">اسم الدورة</span>
                    <span className="info-label-en">Course Name</span>
                  </span>
                  <span className="info-value">{certificate.courseName}</span>
                </div>

                {/* Issue Date */}
                <div className="info-item">
                  <span className="info-label">
                    <span className="info-label-ar">تاريخ الإصدار</span>
                    <span className="info-label-en">Issue Date</span>
                  </span>
                  <span className="info-value">
                    {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Expiry Date (if exists) */}
                {certificate.expiryDate && (
                  <div className="info-item">
                    <span className="info-label">
                      <span className="info-label-ar">تاريخ الانتهاء</span>
                      <span className="info-label-en">Expiry Date</span>
                    </span>
                    <span className="info-value">
                      {new Date(certificate.expiryDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {certificate.pdfUrl && certificate.status === 'active' && (
              <div className="certificate-actions">
                <a
                  href={certificate.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-button download-button"
                >
                  <span className="action-button-icon">📥</span>
                  <span className="action-button-text">
                    <span className="action-button-text-ar">تحميل الشهادة</span>
                    <span className="action-button-text-en">Download Certificate</span>
                  </span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <footer className="verification-footer">
          <p className="footer-text">
            <span className="footer-text-ar">
              هذه الصفحة للتحقق من صحة الشهادات الصادرة من منصة Careerak
            </span>
            <span className="footer-text-en">
              This page is for verifying certificates issued by Careerak platform
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default CertificateVerificationPage;
