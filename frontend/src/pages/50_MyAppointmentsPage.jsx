import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AppointmentsList from '../components/Appointments/AppointmentsList';
import AppointmentDetails from '../components/Appointments/AppointmentDetails';
import AppointmentNotesRating from '../components/Appointments/AppointmentNotesRating';
import ReminderSettings from '../components/Appointments/ReminderSettings';
import './50_MyAppointmentsPage.css';

/**
 * MyAppointmentsPage - صفحة "مواعيدي" الشاملة للباحثين عن عمل
 * Requirements: User Story 7 - إدارة المواعيد للباحثين
 * - عرض جميع المواعيد القادمة والسابقة
 * - تفاصيل كل موعد
 * - ملاحظات تحضيرية
 * - رفع مستندات
 * - روابط سريعة لمعلومات الشركة
 */

const t = {
  ar: {
    title: 'مواعيدي',
    subtitle: 'إدارة مواعيد مقابلاتك',
    back: 'رجوع',
    tabs: {
      appointments: 'المواعيد',
      details: 'التفاصيل',
      notes: 'الملاحظات والتقييم',
      documents: 'المستندات',
      reminders: 'التذكيرات',
    },
    tabIcons: {
      appointments: '📅',
      details: '📋',
      notes: '📝',
      documents: '📎',
      reminders: '🔔',
    },
    selectAppointment: 'اختر موعداً لعرض تفاصيله',
    uploadTitle: 'رفع مستندات للمقابلة',
    uploadText: 'اسحب الملفات هنا أو انقر للاختيار (CV، Portfolio، إلخ)',
    uploadBtn: 'اختر ملفاً',
    companyLinksTitle: 'روابط سريعة',
    noAppointmentSelected: 'لم يتم اختيار موعد بعد',
    goToAppointments: 'اذهب إلى المواعيد',
  },
  en: {
    title: 'My Appointments',
    subtitle: 'Manage your interview appointments',
    back: 'Back',
    tabs: {
      appointments: 'Appointments',
      details: 'Details',
      notes: 'Notes & Rating',
      documents: 'Documents',
      reminders: 'Reminders',
    },
    tabIcons: {
      appointments: '📅',
      details: '📋',
      notes: '📝',
      documents: '📎',
      reminders: '🔔',
    },
    selectAppointment: 'Select an appointment to view details',
    uploadTitle: 'Upload Interview Documents',
    uploadText: 'Drag files here or click to select (CV, Portfolio, etc.)',
    uploadBtn: 'Choose File',
    companyLinksTitle: 'Quick Links',
    noAppointmentSelected: 'No appointment selected yet',
    goToAppointments: 'Go to Appointments',
  },
  fr: {
    title: 'Mes rendez-vous',
    subtitle: 'Gérez vos rendez-vous d\'entretien',
    back: 'Retour',
    tabs: {
      appointments: 'Rendez-vous',
      details: 'Détails',
      notes: 'Notes & Évaluation',
      documents: 'Documents',
      reminders: 'Rappels',
    },
    tabIcons: {
      appointments: '📅',
      details: '📋',
      notes: '📝',
      documents: '📎',
      reminders: '🔔',
    },
    selectAppointment: 'Sélectionnez un rendez-vous pour voir les détails',
    uploadTitle: 'Télécharger des documents',
    uploadText: 'Glissez les fichiers ici ou cliquez pour sélectionner (CV, Portfolio, etc.)',
    uploadBtn: 'Choisir un fichier',
    companyLinksTitle: 'Liens rapides',
    noAppointmentSelected: 'Aucun rendez-vous sélectionné',
    goToAppointments: 'Aller aux rendez-vous',
  },
};

const TABS = ['appointments', 'details', 'notes', 'documents', 'reminders'];

const MyAppointmentsPage = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const tr = t[language] || t.ar;
  const isRTL = language === 'ar';
  const fontFamily =
    language === 'ar'
      ? 'Amiri, Cairo, serif'
      : language === 'fr'
      ? 'EB Garamond, serif'
      : 'Cormorant Garamond, serif';

  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // عند اختيار موعد من القائمة، الانتقال لتبويب التفاصيل
  const handleSelectAppointment = (id, status) => {
    setSelectedAppointmentId(id);
    if (status) setSelectedAppointmentStatus(status);
    setActiveTab('details');
  };

  // رفع ملف
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, size: f.size, file: f })),
    ]);
    e.target.value = '';
  };

  const handleRemoveFile = (idx) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name, size: f.size, file: f })),
    ]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointments':
        return (
          <AppointmentsList
            onSelectAppointment={(id) => handleSelectAppointment(id)}
          />
        );

      case 'details':
        if (!selectedAppointmentId) {
          return (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#304B60', fontFamily }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <p style={{ opacity: 0.65, marginBottom: '1rem' }}>{tr.selectAppointment}</p>
              <button
                style={{
                  background: '#304B60', color: '#E3DAD1', border: 'none',
                  borderRadius: '0.5rem', padding: '0.5rem 1.25rem',
                  fontFamily, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}
                onClick={() => setActiveTab('appointments')}
              >
                {tr.goToAppointments}
              </button>
            </div>
          );
        }
        return (
          <AppointmentDetails
            appointmentId={selectedAppointmentId}
            onBack={() => setActiveTab('appointments')}
          />
        );

      case 'notes':
        if (!selectedAppointmentId) {
          return (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#304B60', fontFamily }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
              <p style={{ opacity: 0.65, marginBottom: '1rem' }}>{tr.noAppointmentSelected}</p>
              <button
                style={{
                  background: '#304B60', color: '#E3DAD1', border: 'none',
                  borderRadius: '0.5rem', padding: '0.5rem 1.25rem',
                  fontFamily, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}
                onClick={() => setActiveTab('appointments')}
              >
                {tr.goToAppointments}
              </button>
            </div>
          );
        }
        return (
          <AppointmentNotesRating
            appointmentId={selectedAppointmentId}
            appointmentStatus={selectedAppointmentStatus}
          />
        );

      case 'documents':
        return (
          <div className="map-upload-section" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily }}>
            <h3 className="map-upload-title">{tr.uploadTitle}</h3>
            <div
              className="map-upload-area"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="map-upload-icon">📎</div>
              <p className="map-upload-text">{tr.uploadText}</p>
              <button
                type="button"
                className="map-upload-btn"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                {tr.uploadBtn}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="map-upload-input"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            {uploadedFiles.length > 0 && (
              <div className="map-uploaded-files">
                {uploadedFiles.map((f, idx) => (
                  <div key={idx} className="map-file-item">
                    <span>📄</span>
                    <span className="map-file-name">{f.name}</span>
                    <button
                      className="map-file-remove"
                      onClick={() => handleRemoveFile(idx)}
                      aria-label="remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'reminders':
        return (
          <ReminderSettings reminderId={selectedAppointmentId} />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`map-page${isRTL ? ' map-rtl' : ' map-ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ fontFamily }}
    >
      {/* Header */}
      <div className="map-header">
        <div className="map-header-top">
          <button className="map-back-btn" onClick={() => navigate(-1)}>
            {isRTL ? '→' : '←'} {tr.back}
          </button>
          <h1 className="map-title">{tr.title}</h1>
        </div>
        <p className="map-subtitle">{tr.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="map-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`map-tab${activeTab === tab ? ' map-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="map-tab-icon">{tr.tabIcons[tab]}</span>
            {tr.tabs[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="map-content" role="tabpanel">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MyAppointmentsPage;
