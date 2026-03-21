import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './CertificatePublicVerifyPage.css';

/**
 * صفحة التحقق العامة من الشهادات
 * Public Certificate Verification Landing Page
 * 
 * للشركات ومسؤولي التوظيف للتحقق من شهادات المرشحين
 * For companies and HR to verify candidate certificates
 */
const CertificatePublicVerifyPage = () => {
  const navigate = useNavigate();
  const { language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [bulkIds, setBulkIds] = useState('');
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);

  const t = {
    ar: {
      pageTitle: 'التحقق من الشهادات',
      pageSubtitle: 'تحقق من صحة شهادات المرشحين بسهولة وأمان',
      singleTab: 'شهادة واحدة',
      bulkTab: 'تحقق متعدد',
      singlePlaceholder: 'أدخل رقم الشهادة...',
      verifyBtn: 'تحقق الآن',
      bulkPlaceholder: 'أدخل أرقام الشهادات (كل رقم في سطر منفصل)...',
      verifyBulkBtn: 'تحقق من الكل',
      bulkResults: 'نتائج التحقق',
      valid: 'صالحة',
      invalid: 'غير صالحة',
      notFound: 'غير موجودة',
      total: 'الإجمالي',
      howTitle: 'كيف يعمل التحقق؟',
      step1: 'أدخل رقم الشهادة',
      step1Desc: 'احصل على رقم الشهادة من المرشح أو امسح رمز QR',
      step2: 'اضغط تحقق',
      step2Desc: 'سيتم التحقق الفوري من صحة الشهادة',
      step3: 'اطلع على النتائج',
      step3Desc: 'ستظهر جميع تفاصيل الشهادة وحالتها',
      featuresTitle: 'مميزات التحقق',
      feat1: 'تحقق فوري بدون تسجيل دخول',
      feat2: 'عرض كامل لتفاصيل الشهادة',
      feat3: 'التحقق من عدة شهادات دفعة واحدة',
      feat4: 'تحميل تقرير التحقق',
      errorEmpty: 'يرجى إدخال رقم الشهادة',
      errorBulkEmpty: 'يرجى إدخال رقم شهادة واحد على الأقل',
      errorBulkMax: 'الحد الأقصى 50 شهادة في المرة الواحدة',
      loading: 'جاري التحقق...',
      downloadReport: 'تحميل التقرير',
      viewDetails: 'عرض التفاصيل',
      certId: 'رقم الشهادة',
      holder: 'الحامل',
      course: 'الدورة',
      status: 'الحالة'
    },
    en: {
      pageTitle: 'Certificate Verification',
      pageSubtitle: 'Verify candidate certificates easily and securely',
      singleTab: 'Single Certificate',
      bulkTab: 'Bulk Verification',
      singlePlaceholder: 'Enter certificate ID...',
      verifyBtn: 'Verify Now',
      bulkPlaceholder: 'Enter certificate IDs (one per line)...',
      verifyBulkBtn: 'Verify All',
      bulkResults: 'Verification Results',
      valid: 'Valid',
      invalid: 'Invalid',
      notFound: 'Not Found',
      total: 'Total',
      howTitle: 'How does verification work?',
      step1: 'Enter Certificate ID',
      step1Desc: 'Get the certificate ID from the candidate or scan the QR code',
      step2: 'Click Verify',
      step2Desc: 'Instant verification of certificate authenticity',
      step3: 'View Results',
      step3Desc: 'All certificate details and status will be displayed',
      featuresTitle: 'Verification Features',
      feat1: 'Instant verification without login',
      feat2: 'Full certificate details display',
      feat3: 'Verify multiple certificates at once',
      feat4: 'Download verification report',
      errorEmpty: 'Please enter a certificate ID',
      errorBulkEmpty: 'Please enter at least one certificate ID',
      errorBulkMax: 'Maximum 50 certificates per request',
      loading: 'Verifying...',
      downloadReport: 'Download Report',
      viewDetails: 'View Details',
      certId: 'Certificate ID',
      holder: 'Holder',
      course: 'Course',
      status: 'Status'
    },
    fr: {
      pageTitle: 'Vérification des Certificats',
      pageSubtitle: 'Vérifiez les certificats des candidats facilement et en toute sécurité',
      singleTab: 'Certificat Unique',
      bulkTab: 'Vérification Multiple',
      singlePlaceholder: 'Entrez l\'ID du certificat...',
      verifyBtn: 'Vérifier Maintenant',
      bulkPlaceholder: 'Entrez les IDs des certificats (un par ligne)...',
      verifyBulkBtn: 'Tout Vérifier',
      bulkResults: 'Résultats de Vérification',
      valid: 'Valide',
      invalid: 'Invalide',
      notFound: 'Introuvable',
      total: 'Total',
      howTitle: 'Comment fonctionne la vérification?',
      step1: 'Entrez l\'ID du Certificat',
      step1Desc: 'Obtenez l\'ID du certificat du candidat ou scannez le QR code',
      step2: 'Cliquez sur Vérifier',
      step2Desc: 'Vérification instantanée de l\'authenticité du certificat',
      step3: 'Voir les Résultats',
      step3Desc: 'Tous les détails et le statut du certificat seront affichés',
      featuresTitle: 'Fonctionnalités de Vérification',
      feat1: 'Vérification instantanée sans connexion',
      feat2: 'Affichage complet des détails du certificat',
      feat3: 'Vérifier plusieurs certificats à la fois',
      feat4: 'Télécharger le rapport de vérification',
      errorEmpty: 'Veuillez entrer un ID de certificat',
      errorBulkEmpty: 'Veuillez entrer au moins un ID de certificat',
      errorBulkMax: 'Maximum 50 certificats par requête',
      loading: 'Vérification en cours...',
      downloadReport: 'Télécharger le Rapport',
      viewDetails: 'Voir les Détails',
      certId: 'ID du Certificat',
      holder: 'Titulaire',
      course: 'Cours',
      status: 'Statut'
    }
  };

  const tr = t[language] || t.ar;

  const handleSingleVerify = (e) => {
    e.preventDefault();
    const id = searchQuery.trim();
    if (!id) return;
    navigate(`/verify/${id}`);
  };

  const handleBulkVerify = async (e) => {
    e.preventDefault();
    const ids = bulkIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (ids.length === 0) {
      setBulkError(tr.errorBulkEmpty);
      return;
    }
    if (ids.length > 50) {
      setBulkError(tr.errorBulkMax);
      return;
    }

    setBulkLoading(true);
    setBulkError(null);
    setBulkResults(null);

    try {
      const response = await fetch('/verify/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateIds: ids })
      });
      const data = await response.json();
      if (data.success) {
        setBulkResults(data);
      } else {
        setBulkError(data.messageAr || data.message || 'حدث خطأ');
      }
    } catch {
      setBulkError('حدث خطأ أثناء التحقق');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDownloadReport = async (certId) => {
    try {
      const response = await fetch(`/verify/${certId}/report`);
      const data = await response.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `verification-report-${certId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      console.error('Failed to download report');
    }
  };

  return (
    <div className="cpv-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="cpv-hero">
        <div className="cpv-hero-content">
          <div className="cpv-hero-badge">🔐 Careerak</div>
          <h1 className="cpv-hero-title">{tr.pageTitle}</h1>
          <p className="cpv-hero-subtitle">{tr.pageSubtitle}</p>
        </div>
      </section>

      {/* Main Verification Card */}
      <section className="cpv-main">
        <div className="cpv-card">
          {/* Tabs */}
          <div className="cpv-tabs">
            <button
              className={`cpv-tab ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => setActiveTab('single')}
            >
              🔍 {tr.singleTab}
            </button>
            <button
              className={`cpv-tab ${activeTab === 'bulk' ? 'active' : ''}`}
              onClick={() => setActiveTab('bulk')}
            >
              📋 {tr.bulkTab}
            </button>
          </div>

          {/* Single Verification */}
          {activeTab === 'single' && (
            <form className="cpv-form" onSubmit={handleSingleVerify}>
              <div className="cpv-input-row">
                <input
                  type="text"
                  className="cpv-input"
                  placeholder={tr.singlePlaceholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="cpv-btn-primary"
                  disabled={!searchQuery.trim()}
                >
                  {tr.verifyBtn}
                </button>
              </div>
            </form>
          )}

          {/* Bulk Verification */}
          {activeTab === 'bulk' && (
            <form className="cpv-form" onSubmit={handleBulkVerify}>
              <textarea
                className="cpv-textarea"
                placeholder={tr.bulkPlaceholder}
                value={bulkIds}
                onChange={e => setBulkIds(e.target.value)}
                rows={6}
              />
              {bulkError && <p className="cpv-error">{bulkError}</p>}
              <button
                type="submit"
                className="cpv-btn-primary"
                disabled={bulkLoading || !bulkIds.trim()}
              >
                {bulkLoading ? tr.loading : tr.verifyBulkBtn}
              </button>

              {/* Bulk Results */}
              {bulkResults && (
                <div className="cpv-bulk-results">
                  <h3 className="cpv-bulk-title">{tr.bulkResults}</h3>
                  <div className="cpv-bulk-summary">
                    <span className="cpv-summary-item total">
                      {tr.total}: {bulkResults.summary.total}
                    </span>
                    <span className="cpv-summary-item valid">
                      ✅ {tr.valid}: {bulkResults.summary.valid}
                    </span>
                    <span className="cpv-summary-item invalid">
                      ❌ {tr.invalid}: {bulkResults.summary.invalid}
                    </span>
                    <span className="cpv-summary-item notfound">
                      ❓ {tr.notFound}: {bulkResults.summary.notFound}
                    </span>
                  </div>
                  <div className="cpv-bulk-table-wrap">
                    <table className="cpv-bulk-table">
                      <thead>
                        <tr>
                          <th>{tr.certId}</th>
                          <th>{tr.holder}</th>
                          <th>{tr.course}</th>
                          <th>{tr.status}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResults.results.map((r, i) => (
                          <tr key={i} className={r.valid ? 'row-valid' : 'row-invalid'}>
                            <td className="cert-id-cell">
                              {r.found ? r.certificate.certificateId : '—'}
                            </td>
                            <td>{r.found ? r.certificate.holder.name : '—'}</td>
                            <td>{r.found ? r.certificate.course.name : '—'}</td>
                            <td>
                              <span className={`cpv-status-badge ${r.valid ? 'valid' : r.found ? 'invalid' : 'notfound'}`}>
                                {r.valid ? tr.valid : r.found ? tr.invalid : tr.notFound}
                              </span>
                            </td>
                            <td>
                              {r.found && (
                                <div className="cpv-row-actions">
                                  <button
                                    className="cpv-btn-sm"
                                    onClick={() => navigate(`/verify/${r.certificate.certificateId}`)}
                                  >
                                    {tr.viewDetails}
                                  </button>
                                  <button
                                    className="cpv-btn-sm outline"
                                    onClick={() => handleDownloadReport(r.certificate.certificateId)}
                                  >
                                    {tr.downloadReport}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="cpv-how">
        <h2 className="cpv-section-title">{tr.howTitle}</h2>
        <div className="cpv-steps">
          <div className="cpv-step">
            <div className="cpv-step-num">1</div>
            <h3>{tr.step1}</h3>
            <p>{tr.step1Desc}</p>
          </div>
          <div className="cpv-step-arrow">→</div>
          <div className="cpv-step">
            <div className="cpv-step-num">2</div>
            <h3>{tr.step2}</h3>
            <p>{tr.step2Desc}</p>
          </div>
          <div className="cpv-step-arrow">→</div>
          <div className="cpv-step">
            <div className="cpv-step-num">3</div>
            <h3>{tr.step3}</h3>
            <p>{tr.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="cpv-features">
        <h2 className="cpv-section-title">{tr.featuresTitle}</h2>
        <div className="cpv-features-grid">
          {[tr.feat1, tr.feat2, tr.feat3, tr.feat4].map((feat, i) => (
            <div key={i} className="cpv-feature-item">
              <span className="cpv-feature-icon">✅</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CertificatePublicVerifyPage;
