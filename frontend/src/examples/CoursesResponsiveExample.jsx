/**
 * Courses Page - Responsive Design Example
 * 
 * This example demonstrates how to use the responsive design
 * and accessibility features for the courses page.
 */

import React, { useState, useEffect } from 'react';
import '../styles/coursesResponsive.css';

// Example: Complete Courses Page with Responsive Design
export default function CoursesResponsiveExample() {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    isFree: null,
    minRating: 0
  });
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  
  // Detect language and set direction
  const [language, setLanguage] = useState('ar');
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  
  // Mock courses data
  const mockCourses = [
    {
      id: '1',
      title: 'أساسيات React',
      description: 'تعلم أساسيات React من الصفر',
      thumbnail: 'https://via.placeholder.com/400x200',
      level: 'Beginner',
      duration: 10,
      totalLessons: 25,
      price: { amount: 99, currency: 'USD', isFree: false },
      stats: {
        averageRating: 4.5,
        totalReviews: 120,
        totalEnrollments: 500
      },
      badges: [{ type: 'most_popular' }, { type: 'new' }]
    },
    {
      id: '2',
      title: 'JavaScript المتقدم',
      description: 'تعمق في JavaScript وتعلم المفاهيم المتقدمة',
      thumbnail: 'https://via.placeholder.com/400x200',
      level: 'Advanced',
      duration: 15,
      totalLessons: 40,
      price: { amount: 0, currency: 'USD', isFree: true },
      stats: {
        averageRating: 4.8,
        totalReviews: 200,
        totalEnrollments: 800
      },
      badges: [{ type: 'top_rated' }, { type: 'recommended' }]
    }
  ];
  
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, [filters, sort, page]);
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(1); // Reset to first page
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      level: '',
      category: '',
      isFree: null,
      minRating: 0
    });
  };
  
  // Toggle filters (mobile/tablet)
  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };
  
  return (
    <div className="courses-page" dir={direction} lang={language}>
      {/* Skip to main content link (Accessibility) */}
      <a href="#main-content" className="skip-to-main">
        {language === 'ar' ? 'تخطى إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      
      {/* Page Header */}
      <header className="courses-header">
        <h1>
          {language === 'ar' ? 'الدورات التدريبية' : 'Courses'}
        </h1>
        
        {/* Language Switcher */}
        <div className="language-switcher">
          <button onClick={() => setLanguage('ar')}>العربية</button>
          <button onClick={() => setLanguage('en')}>English</button>
        </div>
      </header>
      
      {/* Main Container */}
      <div className="courses-container">
        
        {/* Filters Sidebar */}
        <aside 
          className={`courses-filters ${filtersOpen ? 'open' : ''}`}
          role="complementary"
          aria-label={language === 'ar' ? 'فلاتر الدورات' : 'Course filters'}
        >
          <h3>{language === 'ar' ? 'الفلاتر' : 'Filters'}</h3>
          
          {/* Level Filter */}
          <div className="filter-group">
            <label htmlFor="level-filter">
              {language === 'ar' ? 'المستوى' : 'Level'}
            </label>
            <div>
              <label>
                <input
                  type="checkbox"
                  value="Beginner"
                  checked={filters.level === 'Beginner'}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  aria-label={language === 'ar' ? 'مبتدئ' : 'Beginner'}
                />
                {language === 'ar' ? 'مبتدئ' : 'Beginner'}
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Intermediate"
                  checked={filters.level === 'Intermediate'}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  aria-label={language === 'ar' ? 'متوسط' : 'Intermediate'}
                />
                {language === 'ar' ? 'متوسط' : 'Intermediate'}
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Advanced"
                  checked={filters.level === 'Advanced'}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  aria-label={language === 'ar' ? 'متقدم' : 'Advanced'}
                />
                {language === 'ar' ? 'متقدم' : 'Advanced'}
              </label>
            </div>
          </div>
          
          {/* Price Filter */}
          <div className="filter-group">
            <label>{language === 'ar' ? 'السعر' : 'Price'}</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="price"
                  value="all"
                  checked={filters.isFree === null}
                  onChange={() => handleFilterChange('isFree', null)}
                  aria-label={language === 'ar' ? 'الكل' : 'All'}
                />
                {language === 'ar' ? 'الكل' : 'All'}
              </label>
              <label>
                <input
                  type="radio"
                  name="price"
                  value="free"
                  checked={filters.isFree === true}
                  onChange={() => handleFilterChange('isFree', true)}
                  aria-label={language === 'ar' ? 'مجاني' : 'Free'}
                />
                {language === 'ar' ? 'مجاني' : 'Free'}
              </label>
              <label>
                <input
                  type="radio"
                  name="price"
                  value="paid"
                  checked={filters.isFree === false}
                  onChange={() => handleFilterChange('isFree', false)}
                  aria-label={language === 'ar' ? 'مدفوع' : 'Paid'}
                />
                {language === 'ar' ? 'مدفوع' : 'Paid'}
              </label>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
            aria-label={language === 'ar' ? 'مسح جميع الفلاتر' : 'Clear all filters'}
          >
            {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
          </button>
        </aside>
        
        {/* Main Content */}
        <main 
          id="main-content" 
          className="courses-main"
          role="main"
          tabIndex="-1"
        >
          
          {/* Sort Bar */}
          <div className="courses-sort-bar">
            {/* Search Input */}
            <div className="search-input-container">
              <input
                type="search"
                className="search-input"
                placeholder={language === 'ar' ? 'ابحث عن دورة...' : 'Search for a course...'}
                aria-label={language === 'ar' ? 'البحث عن الدورات' : 'Search courses'}
              />
            </div>
            
            {/* Sort Select */}
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label={language === 'ar' ? 'ترتيب حسب' : 'Sort by'}
            >
              <option value="newest">
                {language === 'ar' ? 'الأحدث' : 'Newest'}
              </option>
              <option value="popular">
                {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
              </option>
              <option value="rating">
                {language === 'ar' ? 'الأعلى تقييماً' : 'Highest Rated'}
              </option>
            </select>
            
            {/* View Toggle */}
            <div className="view-toggle" role="group" aria-label={language === 'ar' ? 'عرض' : 'View'}>
              <button
                className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
                onClick={() => setView('grid')}
                aria-label={language === 'ar' ? 'عرض شبكي' : 'Grid view'}
                aria-pressed={view === 'grid'}
              >
                ⊞
              </button>
              <button
                className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
                aria-label={language === 'ar' ? 'عرض قائمة' : 'List view'}
                aria-pressed={view === 'list'}
              >
                ☰
              </button>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="courses-loading" role="status" aria-live="polite">
              <div className="loading-spinner" aria-hidden="true"></div>
              <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          )}
          
          {/* Courses Grid */}
          {!loading && courses.length > 0 && (
            <div 
              className={`courses-grid ${view === 'list' ? 'list-view' : ''}`}
              role="list"
            >
              {courses.map(course => (
                <CourseCardExample 
                  key={course.id} 
                  course={course} 
                  language={language}
                />
              ))}
            </div>
          )}
          
          {/* Empty State */}
          {!loading && courses.length === 0 && (
            <div className="courses-empty" role="status">
              <h3>{language === 'ar' ? 'لا توجد دورات' : 'No courses found'}</h3>
              <p>
                {language === 'ar' 
                  ? 'جرب تغيير الفلاتر أو البحث بكلمات مختلفة' 
                  : 'Try changing filters or search with different keywords'}
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && courses.length > 0 && (
            <div className="courses-pagination" role="navigation" aria-label="Pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label={language === 'ar' ? 'الصفحة السابقة' : 'Previous page'}
              >
                {language === 'ar' ? '←' : '→'}
              </button>
              
              <button className="pagination-btn active" aria-current="page">
                {page}
              </button>
              
              <button
                className="pagination-btn"
                onClick={() => setPage(page + 1)}
                aria-label={language === 'ar' ? 'الصفحة التالية' : 'Next page'}
              >
                {language === 'ar' ? '→' : '←'}
              </button>
            </div>
          )}
        </main>
      </div>
      
      {/* Filter Toggle Button (Mobile/Tablet) */}
      <button
        className="filter-toggle-btn"
        onClick={toggleFilters}
        aria-label={language === 'ar' ? 'فتح الفلاتر' : 'Open filters'}
        aria-expanded={filtersOpen}
      >
        {language === 'ar' ? 'الفلاتر' : 'Filters'}
      </button>
      
      {/* Filters Overlay (Mobile/Tablet) */}
      {filtersOpen && (
        <div 
          className="filters-overlay open"
          onClick={toggleFilters}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// Course Card Component
function CourseCardExample({ course, language }) {
  const [wishlisted, setWishlisted] = useState(false);
  
  return (
    <article className="course-card" role="listitem">
      {/* Course Image */}
      <img
        src={course.thumbnail}
        alt={`${course.title} - ${language === 'ar' ? 'صورة الدورة' : 'Course thumbnail'}`}
        className="course-card-image"
        loading="lazy"
      />
      
      {/* Course Content */}
      <div className="course-card-content">
        {/* Badges */}
        {course.badges && course.badges.length > 0 && (
          <div className="course-card-badges" aria-label={language === 'ar' ? 'شارات الدورة' : 'Course badges'}>
            {course.badges.map((badge, index) => (
              <span key={index} className={`course-badge ${badge.type}`}>
                {getBadgeText(badge.type, language)}
              </span>
            ))}
          </div>
        )}
        
        {/* Title */}
        <h3 className="course-card-title">{course.title}</h3>
        
        {/* Description */}
        <p className="course-card-description">{course.description}</p>
        
        {/* Stats */}
        <div className="course-card-stats">
          <div className="course-rating" aria-label={`${language === 'ar' ? 'التقييم' : 'Rating'}: ${course.stats.averageRating}`}>
            <span aria-hidden="true">★</span>
            <span>{course.stats.averageRating}</span>
            <span className="sr-only">{language === 'ar' ? 'من 5' : 'out of 5'}</span>
          </div>
          <span>({course.stats.totalReviews} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
          <span>{course.stats.totalEnrollments} {language === 'ar' ? 'طالب' : 'students'}</span>
        </div>
        
        {/* Details */}
        <div className="course-card-details">
          <span>{course.level}</span>
          <span>{course.duration}h</span>
          <span>{course.totalLessons} {language === 'ar' ? 'درس' : 'lessons'}</span>
        </div>
        
        {/* Price */}
        <div className={`course-card-price ${course.price.isFree ? 'free' : ''}`}>
          {course.price.isFree 
            ? (language === 'ar' ? 'مجاني' : 'Free')
            : `$${course.price.amount}`
          }
        </div>
        
        {/* Actions */}
        <div className="course-card-actions">
          <button className="course-card-btn primary">
            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </button>
          <button
            className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
            onClick={() => setWishlisted(!wishlisted)}
            aria-label={wishlisted 
              ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist')
              : (language === 'ar' ? 'إضافة إلى المفضلة' : 'Add to wishlist')
            }
            aria-pressed={wishlisted}
          >
            {wishlisted ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </article>
  );
}

// Helper function to get badge text
function getBadgeText(type, language) {
  const badges = {
    most_popular: { ar: 'الأكثر شعبية', en: 'Most Popular' },
    new: { ar: 'جديد', en: 'New' },
    recommended: { ar: 'موصى به', en: 'Recommended' },
    top_rated: { ar: 'الأعلى تقييماً', en: 'Top Rated' }
  };
  
  return badges[type]?.[language] || type;
}
