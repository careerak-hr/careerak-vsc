import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './CourseFilters.css';

const CourseFilters = ({ filters, onChange, onClear }) => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    ar: {
      filters: 'الفلاتر',
      level: 'المستوى',
      beginner: 'مبتدئ',
      intermediate: 'متوسط',
      advanced: 'متقدم',
      category: 'التصنيف',
      selectCategory: 'اختر التصنيف',
      duration: 'المدة (ساعات)',
      price: 'السعر',
      all: 'الكل',
      free: 'مجاني',
      paid: 'مدفوع',
      minRating: 'الحد الأدنى للتقييم',
      clearAll: 'مسح الكل',
      apply: 'تطبيق'
    },
    en: {
      filters: 'Filters',
      level: 'Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      category: 'Category',
      selectCategory: 'Select Category',
      duration: 'Duration (hours)',
      price: 'Price',
      all: 'All',
      free: 'Free',
      paid: 'Paid',
      minRating: 'Minimum Rating',
      clearAll: 'Clear All',
      apply: 'Apply'
    },
    fr: {
      filters: 'Filtres',
      level: 'Niveau',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
      category: 'Catégorie',
      selectCategory: 'Sélectionner la catégorie',
      duration: 'Durée (heures)',
      price: 'Prix',
      all: 'Tous',
      free: 'Gratuit',
      paid: 'Payant',
      minRating: 'Note minimale',
      clearAll: 'Tout effacer',
      apply: 'Appliquer'
    }
  };

  const t = translations[language] || translations.en;

  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Data Science',
    'Personal Development'
  ];

  const handleLevelChange = (level) => {
    onChange({ ...filters, level: filters.level === level ? '' : level });
  };

  const handleCategoryChange = (e) => {
    onChange({ ...filters, category: e.target.value });
  };

  const handleDurationChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const handleDurationSliderChange = (e) => {
    const value = parseInt(e.target.value);
    // Update maxDuration when slider changes
    onChange({ ...filters, maxDuration: value });
  };

  const handlePriceChange = (value) => {
    onChange({ ...filters, isFree: value });
  };

  const handleRatingChange = (rating) => {
    onChange({ ...filters, minRating: filters.minRating === rating ? '' : rating });
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile: Toggle Button */}
      <button
        className="filter-toggle-btn md:hidden"
        onClick={toggleDrawer}
        aria-label={t.filters}
        aria-expanded={isOpen}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {t.filters}
      </button>

      {/* Filter Panel */}
      <aside
        className={`course-filters ${isOpen ? 'open' : ''}`}
        role="complementary"
        aria-label={t.filters}
      >
        {/* Mobile: Close Button */}
        <button
          className="filter-close-btn md:hidden"
          onClick={toggleDrawer}
          aria-label="Close filters"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="filter-header">
          <h2>{t.filters}</h2>
        </div>

        <div className="filter-content">
          {/* Level Filter */}
          <div className="filter-group">
            <h3>{t.level}</h3>
            <div className="filter-options">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <label key={level} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.level === level}
                    onChange={() => handleLevelChange(level)}
                  />
                  <span>{t[level.toLowerCase()]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h3>{t.category}</h3>
            <select
              value={filters.category || ''}
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="">{t.selectCategory}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div className="filter-group">
            <h3>{t.duration}</h3>
            <div className="duration-slider-container">
              <div className="duration-range-display">
                <span>{filters.minDuration || 0}h</span>
                <span>-</span>
                <span>{filters.maxDuration || 100}h</span>
              </div>
              <input
                type="range"
                name="maxDuration"
                min="0"
                max="100"
                step="5"
                value={filters.maxDuration || 100}
                onChange={handleDurationSliderChange}
                className="duration-slider"
                aria-label={t.duration}
              />
              <div className="duration-inputs-advanced">
                <input
                  type="number"
                  name="minDuration"
                  placeholder="Min"
                  value={filters.minDuration || ''}
                  onChange={handleDurationChange}
                  min="0"
                  max={filters.maxDuration || 100}
                  className="duration-input"
                />
                <span>-</span>
                <input
                  type="number"
                  name="maxDuration"
                  placeholder="Max"
                  value={filters.maxDuration || ''}
                  onChange={handleDurationChange}
                  min={filters.minDuration || 0}
                  max="100"
                  className="duration-input"
                />
              </div>
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-group">
            <h3>{t.price}</h3>
            <div className="filter-options">
              <label className="filter-radio">
                <input
                  type="radio"
                  name="price"
                  checked={filters.isFree === undefined}
                  onChange={() => handlePriceChange(undefined)}
                />
                <span>{t.all}</span>
              </label>
              <label className="filter-radio">
                <input
                  type="radio"
                  name="price"
                  checked={filters.isFree === 'true'}
                  onChange={() => handlePriceChange('true')}
                />
                <span>{t.free}</span>
              </label>
              <label className="filter-radio">
                <input
                  type="radio"
                  name="price"
                  checked={filters.isFree === 'false'}
                  onChange={() => handlePriceChange('false')}
                />
                <span>{t.paid}</span>
              </label>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-group">
            <h3>{t.minRating}</h3>
            <div className="rating-filter">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  className={`rating-btn ${filters.minRating === rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange(rating)}
                  aria-label={`${rating} stars and above`}
                >
                  {[...Array(rating)].map((_, i) => (
                    <svg key={i} className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="rating-text">& up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear All Button */}
          <button
            className="clear-filters-btn"
            onClick={onClear}
            disabled={Object.keys(filters).length === 0}
          >
            {t.clearAll}
          </button>
        </div>
      </aside>

      {/* Mobile: Overlay */}
      {isOpen && (
        <div
          className="filter-overlay md:hidden"
          onClick={toggleDrawer}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default CourseFilters;
