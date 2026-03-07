import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  SearchBar, 
  FilterPanel, 
  ResultsList, 
  AlertsManager 
} from '../components/Search';
import { SavedSearchesPanel } from '../components/SavedSearchesPanel';
import './AdvancedSearchExample.css';

/**
 * مثال شامل لاستخدام نظام البحث والفلترة المتقدم
 * يوضح كيفية دمج جميع المكونات معاً
 * @component
 */
const AdvancedSearchExample = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [filterCounts, setFilterCounts] = useState({}); // ✅ جديد: عدادات الفلاتر
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showFilters, setShowFilters] = useState(true);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedSavedSearch, setSelectedSavedSearch] = useState(null);

  // Available filters (يمكن جلبها من API)
  const [availableFilters, setAvailableFilters] = useState({
    skills: [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java',
      'TypeScript', 'Vue.js', 'Angular', 'MongoDB', 'SQL',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'REST API'
    ]
  });

  // Translations
  const translations = {
    ar: {
      title: 'البحث المتقدم عن الوظائف',
      toggleFilters: 'إظهار/إخفاء الفلاتر',
      savedSearches: 'عمليات البحث المحفوظة',
      saveSearch: 'حفظ البحث',
      viewList: 'عرض قائمة',
      viewGrid: 'عرض شبكة',
      loading: 'جاري التحميل...',
      noResults: 'لا توجد نتائج',
      results: 'نتيجة'
    },
    en: {
      title: 'Advanced Job Search',
      toggleFilters: 'Toggle Filters',
      savedSearches: 'Saved Searches',
      saveSearch: 'Save Search',
      viewList: 'List View',
      viewGrid: 'Grid View',
      loading: 'Loading...',
      noResults: 'No Results',
      results: 'results'
    },
    fr: {
      title: 'Recherche avancée d\'emplois',
      toggleFilters: 'Basculer les filtres',
      savedSearches: 'Recherches enregistrées',
      saveSearch: 'Enregistrer la recherche',
      viewList: 'Vue liste',
      viewGrid: 'Vue grille',
      loading: 'Chargement...',
      noResults: 'Aucun résultat',
      results: 'résultats'
    }
  };

  const t = translations[language] || translations.ar;

  /**
   * تحميل الفلاتر من URL عند التحميل الأولي
   */
  useEffect(() => {
    const filtersFromURL = {
      location: searchParams.get('location') || '',
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')) : undefined,
      salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')) : undefined,
      workType: searchParams.get('workType')?.split(',').filter(Boolean) || [],
      experienceLevel: searchParams.get('experienceLevel')?.split(',').filter(Boolean) || [],
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
      skillsLogic: searchParams.get('skillsLogic') || 'OR',
      datePosted: searchParams.get('datePosted') || 'all',
      companySize: searchParams.get('companySize')?.split(',').filter(Boolean) || []
    };

    setFilters(filtersFromURL);

    // إذا كان هناك query في URL، قم بالبحث
    if (query) {
      performSearch(query, filtersFromURL);
    }
  }, []);

  /**
   * تحديث URL عند تغيير الفلاتر
   */
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (filters.location) params.set('location', filters.location);
    if (filters.salaryMin) params.set('salaryMin', filters.salaryMin);
    if (filters.salaryMax) params.set('salaryMax', filters.salaryMax);
    if (filters.workType?.length) params.set('workType', filters.workType.join(','));
    if (filters.experienceLevel?.length) params.set('experienceLevel', filters.experienceLevel.join(','));
    if (filters.skills?.length) params.set('skills', filters.skills.join(','));
    if (filters.skillsLogic) params.set('skillsLogic', filters.skillsLogic);
    if (filters.datePosted && filters.datePosted !== 'all') params.set('datePosted', filters.datePosted);
    if (filters.companySize?.length) params.set('companySize', filters.companySize.join(','));

    setSearchParams(params);
  }, [filters, query]);

  /**
   * تنفيذ البحث
   */
  const performSearch = async (searchQuery, searchFilters = filters) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        q: searchQuery,
        ...searchFilters,
        limit: 20
      });

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/jobs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.data?.results || []);
      setResultCount(data.data?.total || 0);
      setFilterCounts(data.data?.filters?.counts || {}); // ✅ جديد: حفظ عدادات الفلاتر
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setResultCount(0);
      setFilterCounts({}); // ✅ جديد: مسح العدادات عند الخطأ
    } finally {
      setLoading(false);
    }
  };

  /**
   * معالجة البحث
   */
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
  };

  /**
   * معالجة تغيير الفلاتر
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (query) {
      performSearch(query, newFilters);
    }
  };

  /**
   * معالجة مسح الفلاتر
   */
  const handleClearFilters = () => {
    setFilters({});
    if (query) {
      performSearch(query, {});
    }
  };

  /**
   * معالجة النقر على وظيفة
   */
  const handleJobClick = (job) => {
    navigate(`/jobs/${job._id}`);
  };

  /**
   * معالجة حفظ البحث
   */
  const handleSaveSearch = async () => {
    const searchName = prompt('أدخل اسم البحث:');
    if (!searchName) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/saved`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: searchName,
            searchType: 'jobs',
            searchParams: {
              query,
              ...filters
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save search');
      }

      alert('تم حفظ البحث بنجاح!');
    } catch (error) {
      console.error('Save search error:', error);
      alert('فشل حفظ البحث');
    }
  };

  return (
    <div className="advanced-search-example">
      {/* Header */}
      <div className="search-header">
        <h1>{t.title}</h1>
        
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={() => setShowFilters(!showFilters)}
            title={t.toggleFilters}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            className="btn-icon"
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            title={t.savedSearches}
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>

          <button
            className="btn-primary"
            onClick={handleSaveSearch}
            disabled={!query}
          >
            {t.saveSearch}
          </button>

          <div className="view-toggle">
            <button
              className={`btn-view ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title={t.viewList}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              className={`btn-view ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t.viewGrid}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <SearchBar
          initialValue={query}
          onSearch={handleSearch}
          type="jobs"
          autoFocus={true}
        />
      </div>

      {/* Main Content */}
      <div className="search-content">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="filters-sidebar">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              resultCount={resultCount}
              filterCounts={filterCounts}
              availableFilters={availableFilters}
              type="jobs"
            />
          </aside>
        )}

        {/* Results */}
        <main className="results-main">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{t.loading}</p>
            </div>
          ) : (
            <ResultsList
              results={results}
              loading={loading}
              onJobClick={handleJobClick}
              showMatchScore={true}
              viewMode={viewMode}
            />
          )}
        </main>

        {/* Saved Searches Panel */}
        {showSavedSearches && (
          <aside className="saved-searches-sidebar">
            <SavedSearchesPanel />
          </aside>
        )}
      </div>

      {/* Alerts Manager Modal */}
      {showAlerts && selectedSavedSearch && (
        <div className="modal-overlay" onClick={() => setShowAlerts(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AlertsManager
              savedSearchId={selectedSavedSearch}
              onClose={() => setShowAlerts(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchExample;
