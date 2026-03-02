import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './InterviewFilters.css';

/**
 * مكون الفلترة والبحث المتقدم للمقابلات
 * Requirements: 8.6
 */
const InterviewFilters = ({ onFilter, onClear }) => {
  const { language, fontFamily } = useApp();
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: '',
    hasRecording: '',
    hasRating: '',
    minRating: '',
    maxRating: ''
  });

  const translations = {
    ar: {
      title: 'البحث والفلترة المتقدمة',
      status: 'الحالة',
      dateRange: 'نطاق التاريخ',
      from: 'من',
      to: 'إلى',
      search: 'البحث',
      searchPlaceholder: 'ابحث في الأسماء، الملاحظات...',
      recording: 'التسجيل',
      hasRecording: 'يحتوي على تسجيل',
      noRecording: 'بدون تسجيل',
      rating: 'التقييم',
      hasRating: 'يحتوي على تقييم',
      noRating: 'بدون تقييم',
      ratingRange: 'نطاق التقييم',
      minRating: 'الحد الأدنى',
      maxRating: 'الحد الأقصى',
      apply: 'تطبيق الفلاتر',
      clear: 'مسح الفلاتر',
      scheduled: 'مجدولة',
      waiting: 'في الانتظار',
      active: 'نشطة',
      ended: 'انتهت',
      cancelled: 'ملغاة',
      all: 'الكل'
    },
    en: {
      title: 'Advanced Search & Filter',
      status: 'Status',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      search: 'Search',
      searchPlaceholder: 'Search in names, notes...',
      recording: 'Recording',
      hasRecording: 'Has Recording',
      noRecording: 'No Recording',
      rating: 'Rating',
      hasRating: 'Has Rating',
      noRating: 'No Rating',
      ratingRange: 'Rating Range',
      minRating: 'Minimum',
      maxRating: 'Maximum',
      apply: 'Apply Filters',
      clear: 'Clear Filters',
      scheduled: 'Scheduled',
      waiting: 'Waiting',
      active: 'Active',
      ended: 'Ended',
      cancelled: 'Cancelled',
      all: 'All'
    },
    fr: {
      title: 'Recherche et filtre avancés',
      status: 'Statut',
      dateRange: 'Plage de dates',
      from: 'De',
      to: 'À',
      search: 'Recherche',
      searchPlaceholder: 'Rechercher dans les noms, notes...',
      recording: 'Enregistrement',
      hasRecording: 'A un enregistrement',
      noRecording: 'Sans enregistrement',
      rating: 'Évaluation',
      hasRating: 'A une évaluation',
      noRating: 'Sans évaluation',
      ratingRange: 'Plage d\'évaluation',
      minRating: 'Minimum',
      maxRating: 'Maximum',
      apply: 'Appliquer les filtres',
      clear: 'Effacer les filtres',
      scheduled: 'Prévu',
      waiting: 'En attente',
      active: 'Actif',
      ended: 'Terminé',
      cancelled: 'Annulé',
      all: 'Tous'
    }
  };

  const t = translations[language] || translations.ar;

  const handleChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    if (onFilter) {
      onFilter(filters);
    }
  };

  const handleClear = () => {
    const clearedFilters = {
      status: '',
      startDate: '',
      endDate: '',
      search: '',
      hasRecording: '',
      hasRating: '',
      minRating: '',
      maxRating: ''
    };
    setFilters(clearedFilters);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="interview-filters" style={{ fontFamily }}>
      <h3>{t.title}</h3>

      <div className="filters-grid">
        {/* Status Filter */}
        <div className="filter-group">
          <label>{t.status}</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">{t.all}</option>
            <option value="scheduled">{t.scheduled}</option>
            <option value="waiting">{t.waiting}</option>
            <option value="active">{t.active}</option>
            <option value="ended">{t.ended}</option>
            <option value="cancelled">{t.cancelled}</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="filter-group">
          <label>{t.dateRange}</label>
          <div className="date-range">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              placeholder={t.from}
            />
            <span className="date-separator">-</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              placeholder={t.to}
            />
          </div>
        </div>

        {/* Search Filter */}
        <div className="filter-group full-width">
          <label>{t.search}</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder={t.searchPlaceholder}
          />
        </div>

        {/* Recording Filter */}
        <div className="filter-group">
          <label>{t.recording}</label>
          <select
            value={filters.hasRecording}
            onChange={(e) => handleChange('hasRecording', e.target.value)}
          >
            <option value="">{t.all}</option>
            <option value="true">{t.hasRecording}</option>
            <option value="false">{t.noRecording}</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="filter-group">
          <label>{t.rating}</label>
          <select
            value={filters.hasRating}
            onChange={(e) => handleChange('hasRating', e.target.value)}
          >
            <option value="">{t.all}</option>
            <option value="true">{t.hasRating}</option>
            <option value="false">{t.noRating}</option>
          </select>
        </div>

        {/* Rating Range Filter */}
        <div className="filter-group">
          <label>{t.ratingRange}</label>
          <div className="rating-range">
            <select
              value={filters.minRating}
              onChange={(e) => handleChange('minRating', e.target.value)}
            >
              <option value="">{t.minRating}</option>
              <option value="1">1⭐</option>
              <option value="2">2⭐</option>
              <option value="3">3⭐</option>
              <option value="4">4⭐</option>
              <option value="5">5⭐</option>
            </select>
            <span className="range-separator">-</span>
            <select
              value={filters.maxRating}
              onChange={(e) => handleChange('maxRating', e.target.value)}
            >
              <option value="">{t.maxRating}</option>
              <option value="1">1⭐</option>
              <option value="2">2⭐</option>
              <option value="3">3⭐</option>
              <option value="4">4⭐</option>
              <option value="5">5⭐</option>
            </select>
          </div>
        </div>
      </div>

      <div className="filter-actions">
        <button className="apply-btn" onClick={handleApply}>
          {t.apply}
        </button>
        <button className="clear-btn" onClick={handleClear}>
          {t.clear}
        </button>
      </div>
    </div>
  );
};

export default InterviewFilters;
