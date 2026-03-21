import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import CertificateDesignEditor from './CertificateDesignEditor';
import SignatureUpload from './SignatureUpload';
import IssuedCertificatesList from './IssuedCertificatesList';
import './CertificateManagement.css';

const translations = {
  ar: {
    title: 'إدارة الشهادات',
    subtitle: 'تخصيص تصميم الشهادات وإدارة الشهادات الصادرة',
    tabDesign: 'محرر التصميم',
    tabSignature: 'التوقيع الرقمي',
    tabIssued: 'الشهادات الصادرة',
    loading: 'جاري التحميل...',
    errorLoad: 'حدث خطأ أثناء تحميل البيانات',
  },
  en: {
    title: 'Certificate Management',
    subtitle: 'Customize certificate design and manage issued certificates',
    tabDesign: 'Design Editor',
    tabSignature: 'Digital Signature',
    tabIssued: 'Issued Certificates',
    loading: 'Loading...',
    errorLoad: 'Error loading data',
  },
  fr: {
    title: 'Gestion des Certificats',
    subtitle: 'Personnalisez le design et gérez les certificats émis',
    tabDesign: 'Éditeur de Design',
    tabSignature: 'Signature Numérique',
    tabIssued: 'Certificats Émis',
    loading: 'Chargement...',
    errorLoad: 'Erreur lors du chargement',
  },
};

const TABS = ['design', 'signature', 'issued'];

const CertificateManagementDashboard = () => {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';
  const fontFamily = language === 'ar' ? "'Amiri', 'Cairo', serif"
    : language === 'fr' ? "'EB Garamond', serif"
    : "'Cormorant Garamond', serif";

  const [activeTab, setActiveTab] = useState('design');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const fontStyle = { fontFamily };

  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/certificates/management/templates`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const tabLabels = {
    design: t.tabDesign,
    signature: t.tabSignature,
    issued: t.tabIssued,
  };

  return (
    <div
      className={`cert-mgmt-dashboard ${isRTL ? 'rtl' : 'ltr'}`}
      style={fontStyle}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="cert-mgmt-header">
        <h1 className="cert-mgmt-title">{t.title}</h1>
        <p className="cert-mgmt-subtitle">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="cert-mgmt-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`cert-mgmt-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'design' && (
          loadingTemplates ? (
            <div className="loading-spinner">⏳ {t.loading}</div>
          ) : (
            <CertificateDesignEditor
              templates={templates}
              onTemplatesChange={fetchTemplates}
            />
          )
        )}

        {activeTab === 'signature' && (
          loadingTemplates ? (
            <div className="loading-spinner">⏳ {t.loading}</div>
          ) : (
            <SignatureUpload
              templates={templates}
              onTemplatesChange={fetchTemplates}
            />
          )
        )}

        {activeTab === 'issued' && (
          <IssuedCertificatesList />
        )}
      </div>
    </div>
  );
};

export default CertificateManagementDashboard;
