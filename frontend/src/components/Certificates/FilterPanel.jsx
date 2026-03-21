import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './FilterPanel.css';

const FilterPanel = ({ onFilterChange, totalCount }) => {
  const { language } = useApp();
  
  // State for filters
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  
  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('certificateFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSelectedTypes(filters.types || []);
        setSelectedYears(filters.years || []);
        setSelectedStatuses(filters.statuses || []);
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);
  
  // Save filters to localStorage and notify parent
  useEffect(() => {
    const filters = {
      types: selectedTypes,
      years: selectedYears,
      statuses: selectedStatuses
    };
    
    localStorage.setItem('certificateFilters', JSON.stringify(filters));
    onFilterChange(filters);
  }, [selectedTypes, selectedYears, selectedStatuses, onFilterChange]);
  
  // Translation object
  const translations = {
    ar: {
      filterTitle: 'تصفية الشهادات',
      type: 'النوع',
      year: 'السنة',
      status: 'الحالة',
      clearAll: 'مسح الفلاتر',
      results: 'نتيجة',
      types: {
        'Programming': 'برمجة',
        'Design': 'تصميم',
        'Business': 'أعمال',
        'Marketing': 'تسويق',
        'Data Science': 'علوم البيانات',
        'Other': 'أخرى'
      },
      statuses: {
        active: 'صالحة',
        revoked: 'ملغاة',
        expired: 'منتهية'
      }
    },
    en: {
      filterTitle: 'Filter Certificates',
      type: 'Type',
      year: 'Year',
      status: 'Status',
      clearAll: 'Clear Filters',
      results: 'results',
      types: {
        'Programming': 'Programming',
        'Design': 'Design',
        'Business': 'Business',
        'Marketing': 'Marketing',
        'Data Science': 'Data Science',
        'Other': 'Other'
      },
      statuses: {
        active: 'Active',
        revoked: 'Revoked',
        expired: 'Expired'
      }
    },
    fr: {
      filterTitle: 'Filtrer les Certificats',
      type: 'Type',
      year: 'Année',
      status: 'Statut',
      clearAll: 'Effacer les Filtres',
      results: 'résultats',
      types: {
        'Programming': 'Programmation',
        'Design': 'Design',
        'Business': 'Affaires',
        'Marketing': 'Marketing',
        'Data Science': 'Science des Données',
        'Other': 'Autre'
      },
      statuses: {
        active: 'Actif',
        revoked: 'Révoqué',
        expired: 'Expiré'
      }
    }
  };
  
  const t = translations[language] || translations.en;
  
  // Available filter options
  const typeOptions = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other'];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const statusOptions = ['active', 'revoked', 'expired'];
  
  // Toggle filter selection
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  
  const toggleYear = (year) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };
  
  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedYears([]);
    setSelectedStatuses([]);
  };
  
  // Remove single filter
  const removeFilter = (filterType, value) => {
    if (filterType === 'type') {
      setSelectedTypes(prev => prev.filter(t => t !== value));
    } else if (filterType === 'year') {
      setSelectedYears(prev => prev.filter(y => y !== value));
    } else if (filterType === 'status') {
      setSelectedStatuses(prev => prev.filter(s => s !== value));
    }
  };
  
  // Count active filters
  const activeFilterCount = selectedTypes.length + selectedYears.length + selectedStatuses.length;
  
  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3 className="filter-title">{t.filterTitle}</h3>
        {activeFilterCount > 0 && (
          <button className="clear-all-btn" onClick={clearAllFilters}>
            {t.clearAll}
          </button>
        )}
      </div>
      
      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="active-filters">
          {selectedTypes.map(type => (
            <span key={type} className="filter-chip">
              {t.types[type] || type}
              <button 
                className="remove-chip-btn"
                onClick={() => removeFilter('type', type)}
                aria-label={`Remove ${type} filter`}
              >
                ×
              </button>
            </span>
          ))}
          {selectedYears.map(year => (
            <span key={year} className="filter-chip">
              {year}
              <button 
                className="remove-chip-btn"
                onClick={() => removeFilter('year', year)}
                aria-label={`Remove ${year} filter`}
              >
                ×
              </button>
            </span>
          ))}
          {selectedStatuses.map(status => (
            <span key={status} className="filter-chip">
              {t.statuses[status] || status}
              <button 
                className="remove-chip-btn"
                onClick={() => removeFilter('status', status)}
                aria-label={`Remove ${status} filter`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Results Count */}
      <div className="results-count">
        {totalCount} {t.results}
      </div>
      
      {/* Type Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">{t.type}</h4>
        <div className="filter-options">
          {typeOptions.map(type => (
            <label key={type} className="filter-option">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
              />
              <span className="filter-option-label">
                {t.types[type] || type}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Year Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">{t.year}</h4>
        <div className="filter-options">
          {yearOptions.map(year => (
            <label key={year} className="filter-option">
              <input
                type="checkbox"
                checked={selectedYears.includes(year)}
                onChange={() => toggleYear(year)}
              />
              <span className="filter-option-label">{year}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Status Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">{t.status}</h4>
        <div className="filter-options">
          {statusOptions.map(status => (
            <label key={status} className="filter-option">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => toggleStatus(status)}
              />
              <span className="filter-option-label">
                {t.statuses[status] || status}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
