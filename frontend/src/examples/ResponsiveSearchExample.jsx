/**
 * مثال كامل لاستخدام التصميم المتجاوب لنظام البحث والفلترة
 * 
 * هذا المثال يوضح:
 * - استخدام جميع Classes المتجاوبة
 * - Toggle للفلاتر على Mobile/Tablet
 * - Results Grid متجاوب
 * - Pagination متجاوب
 * - Map View متجاوب
 */

import React, { useState } from 'react';
import '../styles/advancedSearchResponsive.css';

function ResponsiveSearchExample() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // بيانات تجريبية
  const mockResults = [
    {
      id: 1,
      title: 'مطور Full Stack',
      company: 'شركة التقنية',
      location: 'الرياض',
      salary: '15000 - 20000 ريال',
      matchScore: 85,
    },
    {
      id: 2,
      title: 'مصمم UI/UX',
      company: 'شركة التصميم',
      location: 'جدة',
      salary: '10000 - 15000 ريال',
      matchScore: 78,
    },
    // ... المزيد من النتائج
  ];

  return (
    <div className="search-page">
      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن وظائف، دورات، أو شركات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">
            🔍 بحث
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {searchQuery.length >= 3 && (
          <div className="autocomplete-suggestions">
            <div className="suggestion-item">مطور ويب</div>
            <div className="suggestion-item">مطور تطبيقات</div>
            <div className="suggestion-item">مطور Full Stack</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Filter Panel */}
        <FilterPanel 
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Results Container */}
        <div className="results-container">
          {/* Results Header */}
          <div className="results-header">
            <span className="results-count">
              {mockResults.length} نتيجة
            </span>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 قائمة
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ خريطة
              </button>
            </div>

            {/* Sort Dropdown */}
            <select className="sort-dropdown">
              <option>الأحدث</option>
              <option>الأعلى راتباً</option>
              <option>الأكثر مطابقة</option>
            </select>
          </div>

          {/* Results View */}
          {viewMode === 'list' ? (
            <ResultsList results={mockResults} />
          ) : (
            <MapView results={mockResults} />
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={5}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Overlay للموبايل */}
      {isFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
}

// ==================== Filter Panel Component ====================

function FilterPanel({ isOpen, onToggle }) {
  const [salaryRange, setSalaryRange] = useState([5000, 20000]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);

  return (
    <>
      {/* Toggle Button */}
      <button
        className="filter-toggle-btn"
        onClick={onToggle}
        aria-label="فتح الفلاتر"
      >
        🔧 الفلاتر
      </button>

      {/* Filter Panel */}
      <div className={`filter-panel ${isOpen ? 'open' : ''}`}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>
          الفلاتر
        </h3>

        {/* Salary Range */}
        <div className="filter-group">
          <h4 className="filter-group-title">نطاق الراتب</h4>
          <div className="salary-range-slider">
            <input
              type="range"
              min="0"
              max="50000"
              value={salaryRange[0]}
              onChange={(e) => setSalaryRange([+e.target.value, salaryRange[1]])}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span>{salaryRange[0]} ريال</span>
              <span>{salaryRange[1]} ريال</span>
            </div>
          </div>
        </div>

        {/* Work Type */}
        <div className="filter-group">
          <h4 className="filter-group-title">نوع العمل</h4>
          <div className="filter-options">
            {['دوام كامل', 'دوام جزئي', 'عن بعد', 'هجين'].map((type) => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={selectedWorkTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedWorkTypes([...selectedWorkTypes, type]);
                    } else {
                      setSelectedWorkTypes(selectedWorkTypes.filter(t => t !== type));
                    }
                  }}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="filter-group">
          <h4 className="filter-group-title">الموقع</h4>
          <select style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem' }}>
            <option>جميع المدن</option>
            <option>الرياض</option>
            <option>جدة</option>
            <option>الدمام</option>
          </select>
        </div>

        {/* Experience Level */}
        <div className="filter-group">
          <h4 className="filter-group-title">مستوى الخبرة</h4>
          <div className="filter-options">
            {['مبتدئ', 'متوسط', 'خبير'].map((level) => (
              <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="radio" name="experience" />
                {level}
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          className="clear-filters-btn"
          onClick={() => {
            setSalaryRange([5000, 20000]);
            setSelectedWorkTypes([]);
          }}
        >
          مسح جميع الفلاتر
        </button>
      </div>
    </>
  );
}

// ==================== Results List Component ====================

function ResultsList({ results }) {
  return (
    <div className="results-grid">
      {results.map((job) => (
        <div key={job.id} className="result-card">
          {/* Match Score Badge */}
          <div className="match-score">
            ⭐ {job.matchScore}% مطابقة
          </div>

          {/* Job Info */}
          <h3 style={{ fontSize: '1.25rem', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            {job.title}
          </h3>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            🏢 {job.company}
          </p>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            📍 {job.location}
          </p>
          <p style={{ color: '#D48161', fontWeight: '600' }}>
            💰 {job.salary}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button style={{ flex: 1, padding: '0.5rem', background: '#D48161', color: 'white', border: 'none', borderRadius: '0.5rem' }}>
              تقديم
            </button>
            <button style={{ flex: 1, padding: '0.5rem', background: 'transparent', color: '#D48161', border: '2px solid #D48161', borderRadius: '0.5rem' }}>
              حفظ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== Map View Component ====================

function MapView({ results }) {
  return (
    <div className="map-view-container">
      {/* Placeholder للخريطة */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#E3DAD1',
        borderRadius: '1rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <p>عرض الخريطة</p>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            {results.length} وظيفة على الخريطة
          </p>
        </div>
      </div>

      {/* Map Controls */}
      <div className="map-controls">
        <button style={{ padding: '0.5rem 1rem', background: 'white', border: '2px solid #D4816180', borderRadius: '0.5rem' }}>
          ➕
        </button>
        <button style={{ padding: '0.5rem 1rem', background: 'white', border: '2px solid #D4816180', borderRadius: '0.5rem' }}>
          ➖
        </button>
      </div>
    </div>
  );
}

// ==================== Pagination Component ====================

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← السابق
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i + 1}
          className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        التالي →
      </button>
    </div>
  );
}

export default ResponsiveSearchExample;
