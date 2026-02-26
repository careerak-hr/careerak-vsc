import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './ExportModal.css';

/**
 * ExportModal Component
 * 
 * Modal for configuring and executing data exports.
 * Supports multiple data types (users, jobs, applications, courses, activity log)
 * and formats (Excel, CSV, PDF).
 * 
 * Requirements: 3.1-3.9
 */
const ExportModal = ({ isOpen, onClose, dataType, onExport }) => {
  const { language } = useApp();
  const isRTL = language === 'ar';

  const [format, setFormat] = useState('excel');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [filters, setFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  // Translations
  const translations = {
    ar: {
      title: 'تصدير البيانات',
      dataType: 'نوع البيانات',
      format: 'صيغة التصدير',
      dateRange: 'نطاق التاريخ',
      startDate: 'تاريخ البداية',
      endDate: 'تاريخ النهاية',
      filters: 'التصفية',
      export: 'تصدير',
      cancel: 'إلغاء',
      exporting: 'جاري التصدير...',
      users: 'المستخدمون',
      jobs: 'الوظائف',
      applications: 'الطلبات',
      courses: 'الدورات',
      activity_log: 'سجل النشاطات',
      excel: 'Excel',
      csv: 'CSV',
      pdf: 'PDF',
      userType: 'نوع المستخدم',
      status: 'الحالة',
      field: 'المجال',
      all: 'الكل',
      jobSeeker: 'باحث عن عمل',
      company: 'شركة',
      freelancer: 'مستقل',
      active: 'نشط',
      inactive: 'غير نشط',
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      errorDateRange: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
      errorExport: 'فشل التصدير. يرجى المحاولة مرة أخرى.'
    },
    en: {
      title: 'Export Data',
      dataType: 'Data Type',
      format: 'Export Format',
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      filters: 'Filters',
      export: 'Export',
      cancel: 'Cancel',
      exporting: 'Exporting...',
      users: 'Users',
      jobs: 'Jobs',
      applications: 'Applications',
      courses: 'Courses',
      activity_log: 'Activity Log',
      excel: 'Excel',
      csv: 'CSV',
      pdf: 'PDF',
      userType: 'User Type',
      status: 'Status',
      field: 'Field',
      all: 'All',
      jobSeeker: 'Job Seeker',
      company: 'Company',
      freelancer: 'Freelancer',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      errorDateRange: 'End date must be after start date',
      errorExport: 'Export failed. Please try again.'
    },
    fr: {
      title: 'Exporter les données',
      dataType: 'Type de données',
      format: 'Format d\'exportation',
      dateRange: 'Plage de dates',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      filters: 'Filtres',
      export: 'Exporter',
      cancel: 'Annuler',
      exporting: 'Exportation en cours...',
      users: 'Utilisateurs',
      jobs: 'Emplois',
      applications: 'Candidatures',
      courses: 'Cours',
      activity_log: 'Journal d\'activité',
      excel: 'Excel',
      csv: 'CSV',
      pdf: 'PDF',
      userType: 'Type d\'utilisateur',
      status: 'Statut',
      field: 'Domaine',
      all: 'Tous',
      jobSeeker: 'Chercheur d\'emploi',
      company: 'Entreprise',
      freelancer: 'Freelance',
      active: 'Actif',
      inactive: 'Inactif',
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      errorDateRange: 'La date de fin doit être après la date de début',
      errorExport: 'L\'exportation a échoué. Veuillez réessayer.'
    }
  };

  const t = translations[language] || translations.en;

  // Get filter options based on data type
  const getFilterOptions = () => {
    switch (dataType) {
      case 'users':
        return (
          <div className="export-filter-group">
            <label>{t.userType}</label>
            <select
              value={filters.userType || 'all'}
              onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
            >
              <option value="all">{t.all}</option>
              <option value="jobSeeker">{t.jobSeeker}</option>
              <option value="company">{t.company}</option>
              <option value="freelancer">{t.freelancer}</option>
            </select>
          </div>
        );
      case 'jobs':
      case 'courses':
        return (
          <div className="export-filter-group">
            <label>{t.status}</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">{t.all}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
            </select>
          </div>
        );
      case 'applications':
        return (
          <div className="export-filter-group">
            <label>{t.status}</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">{t.all}</option>
              <option value="pending">{t.pending}</option>
              <option value="approved">{t.approved}</option>
              <option value="rejected">{t.rejected}</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  // Validate date range
  const validateDateRange = () => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      if (end < start) {
        setError(t.errorDateRange);
        return false;
      }
    }
    setError('');
    return true;
  };

  // Handle export
  const handleExport = async () => {
    if (!validateDateRange()) {
      return;
    }

    setIsExporting(true);
    setError('');

    try {
      // Prepare export config
      const config = {
        format,
        dateRange: {
          start: dateRange.start || undefined,
          end: dateRange.end || undefined
        },
        filters: Object.keys(filters).reduce((acc, key) => {
          if (filters[key] !== 'all') {
            acc[key] = filters[key];
          }
          return acc;
        }, {})
      };

      // Call export handler
      await onExport(config);

      // Close modal on success
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      setError(t.errorExport);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div
        className={`export-modal ${isRTL ? 'rtl' : 'ltr'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="export-modal-header">
          <h2>{t.title}</h2>
          <button
            className="export-modal-close"
            onClick={onClose}
            aria-label={t.cancel}
          >
            ×
          </button>
        </div>

        <div className="export-modal-body">
          {/* Data Type Display */}
          <div className="export-form-group">
            <label>{t.dataType}</label>
            <div className="export-data-type">
              {t[dataType] || dataType}
            </div>
          </div>

          {/* Format Selection */}
          <div className="export-form-group">
            <label>{t.format}</label>
            <div className="export-format-options">
              <button
                className={`export-format-btn ${format === 'excel' ? 'active' : ''}`}
                onClick={() => setFormat('excel')}
              >
                <span className="format-icon">📊</span>
                {t.excel}
              </button>
              <button
                className={`export-format-btn ${format === 'csv' ? 'active' : ''}`}
                onClick={() => setFormat('csv')}
              >
                <span className="format-icon">📄</span>
                {t.csv}
              </button>
              <button
                className={`export-format-btn ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
              >
                <span className="format-icon">📕</span>
                {t.pdf}
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="export-form-group">
            <label>{t.dateRange}</label>
            <div className="export-date-range">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                placeholder={t.startDate}
              />
              <span className="date-separator">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                placeholder={t.endDate}
              />
            </div>
          </div>

          {/* Filters */}
          {getFilterOptions() && (
            <div className="export-form-group">
              <label>{t.filters}</label>
              {getFilterOptions()}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="export-error">
              {error}
            </div>
          )}
        </div>

        <div className="export-modal-footer">
          <button
            className="export-btn-cancel"
            onClick={onClose}
            disabled={isExporting}
          >
            {t.cancel}
          </button>
          <button
            className="export-btn-submit"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? t.exporting : t.export}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
