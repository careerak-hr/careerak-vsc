import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './SearchPage.css';

// Import components (to be created)
// import SearchBar from '../components/Search/SearchBar';
// import FilterPanel from '../components/Search/FilterPanel';
// import ResultsList from '../components/Search/ResultsList';
// import MapView from '../components/Search/MapView';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  // Load view mode from URL on mount
  useEffect(() => {
    const urlViewMode = searchParams.get('view');
    if (urlViewMode === 'map' || urlViewMode === 'list') {
      setViewMode(urlViewMode);
    }
  }, []);

  // Toggle between list and map view
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    
    // Update URL with view mode
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', mode);
    setSearchParams(newParams);
  };

  return (
    <div className="search-page">
      {/* Search Bar */}
      <div className="search-header">
        <div className="search-bar-container">
          {/* <SearchBar onSearch={handleSearch} /> */}
          <div className="search-bar-placeholder">
            <input 
              type="text" 
              placeholder="ابحث عن وظائف..." 
              className="search-input"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => toggleViewMode('list')}
            aria-label="عرض القائمة"
            title="عرض القائمة"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>قائمة</span>
          </button>

          <button
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => toggleViewMode('map')}
            aria-label="عرض الخريطة"
            title="عرض الخريطة"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <span>خريطة</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="search-content">
        {/* Filter Panel */}
        <aside className="filter-panel">
          {/* <FilterPanel filters={filters} onFilterChange={setFilters} /> */}
          <div className="filter-placeholder">
            <h3>الفلاتر</h3>
            <p>لوحة الفلاتر ستظهر هنا</p>
          </div>
        </aside>

        {/* Results Area */}
        <main className="results-area">
          {/* Results Count */}
          <div className="results-header">
            <p className="results-count">
              {loading ? 'جاري البحث...' : `تم العثور على ${results.length} وظيفة`}
            </p>
          </div>

          {/* View Content */}
          <div className="view-content">
            {viewMode === 'list' ? (
              <div className="list-view">
                {/* <ResultsList results={results} loading={loading} /> */}
                <div className="list-placeholder">
                  <p>عرض القائمة - النتائج ستظهر هنا</p>
                  {results.length === 0 && !loading && (
                    <div className="no-results">
                      <svg 
                        width="64" 
                        height="64" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      <p>لا توجد نتائج</p>
                      <p className="hint">جرب تعديل معايير البحث</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="map-view">
                {/* <MapView results={results} /> */}
                <div className="map-placeholder">
                  <p>عرض الخريطة - الخريطة التفاعلية ستظهر هنا</p>
                  <div className="map-container">
                    <svg 
                      width="100" 
                      height="100" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <p>الخريطة التفاعلية</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
