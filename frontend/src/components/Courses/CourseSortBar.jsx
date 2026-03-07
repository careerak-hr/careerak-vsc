import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import './CourseSortBar.css';

const CourseSortBar = ({ sort, onSortChange, view, onViewChange, search, onSearchChange }) => {
  const { language } = useApp();
  const [searchInput, setSearchInput] = useState(search || '');
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const translations = {
    ar: {
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      popular: 'الأكثر شعبية',
      rating: 'الأعلى تقييماً',
      priceLow: 'السعر: من الأقل للأعلى',
      priceHigh: 'السعر: من الأعلى للأقل',
      search: 'بحث في الدورات...',
      gridView: 'عرض شبكي',
      listView: 'عرض قائمة'
    },
    en: {
      sortBy: 'Sort by',
      newest: 'Newest',
      popular: 'Most Popular',
      rating: 'Highest Rated',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      search: 'Search courses...',
      gridView: 'Grid View',
      listView: 'List View'
    },
    fr: {
      sortBy: 'Trier par',
      newest: 'Plus récent',
      popular: 'Plus populaire',
      rating: 'Mieux noté',
      priceLow: 'Prix: Croissant',
      priceHigh: 'Prix: Décroissant',
      search: 'Rechercher des cours...',
      gridView: 'Vue grille',
      listView: 'Vue liste'
    }
  };

  const t = translations[language] || translations.en;

  const sortOptions = [
    { value: 'newest', label: t.newest },
    { value: 'popular', label: t.popular },
    { value: 'rating', label: t.rating },
    { value: 'price_low', label: t.priceLow },
    { value: 'price_high', label: t.priceHigh }
  ];

  // Debounced search
  const handleSearchInput = useCallback((value) => {
    setSearchInput(value);

    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      onSearchChange(value);
    }, 500);

    setDebounceTimeout(timeout);
  }, [debounceTimeout, onSearchChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return (
    <div className="course-sort-bar" role="toolbar" aria-label="Course sorting and view options">
      {/* Search Input */}
      <div className="search-container">
        <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          className="search-input"
          placeholder={t.search}
          value={searchInput}
          onChange={(e) => handleSearchInput(e.target.value)}
          aria-label={t.search}
        />
      </div>

      {/* Sort Dropdown */}
      <div className="sort-container">
        <label htmlFor="sort-select" className="sort-label">
          {t.sortBy}:
        </label>
        <select
          id="sort-select"
          className="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label={t.sortBy}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* View Toggle */}
      <div className="view-toggle" role="group" aria-label="View options">
        <button
          className={`view-btn ${view === 'grid' ? 'active' : ''}`}
          onClick={() => onViewChange('grid')}
          aria-label={t.gridView}
          aria-pressed={view === 'grid'}
        >
          <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="view-text">{t.gridView}</span>
        </button>
        <button
          className={`view-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => onViewChange('list')}
          aria-label={t.listView}
          aria-pressed={view === 'list'}
        >
          <svg className="view-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="view-text">{t.listView}</span>
        </button>
      </div>
    </div>
  );
};

export default CourseSortBar;
