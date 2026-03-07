/**
 * Responsive Job Postings Example
 * مثال كامل لصفحة الوظائف المتجاوبة
 * 
 * Features:
 * - Grid/List view toggle
 * - Mobile-friendly filter panel
 * - Responsive job cards
 * - Skeleton loading
 * - Empty states
 * - Touch-friendly buttons
 */

import React, { useState, useEffect } from 'react';
import '../styles/jobPostingsResponsive.css';

// Mock data
const mockJobs = [
  {
    id: 1,
    title: 'مطور Full Stack',
    company: 'شركة التقنية المتقدمة',
    logo: 'https://via.placeholder.com/72',
    description: 'نبحث عن مطور Full Stack ذو خبرة في React و Node.js للانضمام إلى فريقنا المتنامي.',
    salary: '8000 - 12000 ريال',
    location: 'الرياض، السعودية',
    tags: ['React', 'Node.js', 'MongoDB'],
    isBookmarked: false,
  },
  {
    id: 2,
    title: 'مصمم UI/UX',
    company: 'استوديو الإبداع',
    logo: 'https://via.placeholder.com/72',
    description: 'مصمم UI/UX محترف لتصميم تجارب مستخدم استثنائية لتطبيقاتنا الجديدة.',
    salary: '6000 - 9000 ريال',
    location: 'جدة، السعودية',
    tags: ['Figma', 'Adobe XD', 'Sketch'],
    isBookmarked: true,
  },
  {
    id: 3,
    title: 'مدير مشاريع تقنية',
    company: 'مجموعة الابتكار',
    logo: 'https://via.placeholder.com/72',
    description: 'مدير مشاريع تقنية لقيادة فريق من المطورين وتسليم المشاريع في الوقت المحدد.',
    salary: '10000 - 15000 ريال',
    location: 'دبي، الإمارات',
    tags: ['Agile', 'Scrum', 'JIRA'],
    isBookmarked: false,
  },
];

function ResponsiveJobPostingsExample() {
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1500);
  }, []);

  const toggleBookmark = (jobId) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="job-postings-page">
      {/* Search Bar */}
      <div className="search-bar-container">
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="ابحث عن وظيفة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button type="submit" className="search-button">
            بحث
          </button>
        </form>
      </div>

      {/* View Toggle */}
      <div className="view-toggle-container">
        <div className="view-toggle">
          <button
            className={`view-toggle-button ${view === 'grid' ? 'active' : ''}`}
            onClick={() => setView('grid')}
            aria-label="عرض شبكي"
          >
            ⊞
          </button>
          <button
            className={`view-toggle-button ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
            aria-label="عرض قائمة"
          >
            ☰
          </button>
        </div>
        <button
          className="search-button show-mobile"
          onClick={() => setIsFilterOpen(true)}
        >
          فلاتر
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`filter-panel ${isFilterOpen ? 'open' : ''}`}>
        <div className="filter-panel-header">
          <h2 className="filter-panel-title">الفلاتر</h2>
          <button
            className="filter-close-button"
            onClick={() => setIsFilterOpen(false)}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="filter-group">
          <h3 className="filter-group-title">المجال</h3>
          <div className="filter-options">
            <label className="filter-option">
              <input type="checkbox" />
              <span>تطوير البرمجيات</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" />
              <span>التصميم</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" />
              <span>إدارة المشاريع</span>
            </label>
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-group-title">الموقع</h3>
          <div className="filter-options">
            <label className="filter-option">
              <input type="checkbox" />
              <span>الرياض</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" />
              <span>جدة</span>
            </label>
            <label className="filter-option">
              <input type="checkbox" />
              <span>دبي</span>
            </label>
          </div>
        </div>

        <button className="filter-apply-button" onClick={() => setIsFilterOpen(false)}>
          تطبيق الفلاتر
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`backdrop ${isFilterOpen ? 'active' : ''}`}
        onClick={() => setIsFilterOpen(false)}
      />

      {/* Main Content */}
      <div className="jobs-content">
        {loading ? (
          // Skeleton Loading
          <div className={view === 'grid' ? 'jobs-grid' : 'jobs-list'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-header">
                  <div className="skeleton-logo" />
                  <div className="skeleton-info">
                    <div className="skeleton-title" />
                    <div className="skeleton-company" />
                  </div>
                </div>
                <div className="skeleton-body">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
                <div className="skeleton-tags">
                  <div className="skeleton-tag" />
                  <div className="skeleton-tag" />
                  <div className="skeleton-tag" />
                </div>
                <div className="skeleton-footer">
                  <div className="skeleton-salary" />
                  <div className="skeleton-button" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          // Empty State
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2 className="empty-state-title">لا توجد وظائف</h2>
            <p className="empty-state-description">
              لم نجد أي وظائف تطابق معايير البحث الخاصة بك.
            </p>
            <button className="empty-state-button">
              مسح الفلاتر
            </button>
          </div>
        ) : (
          // Job Cards
          <div className={view === 'grid' ? 'jobs-grid' : 'jobs-list'}>
            {jobs.map((job) => (
              <div
                key={job.id}
                className={view === 'grid' ? 'job-card' : 'job-card-list'}
              >
                <div className="job-card-header">
                  <img
                    src={job.logo}
                    alt={job.company}
                    className="company-logo"
                  />
                  <div className="job-card-info">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="company-name">{job.company}</p>
                  </div>
                  <div className="job-card-actions">
                    <button
                      className={`action-button ${job.isBookmarked ? 'bookmarked' : ''}`}
                      onClick={() => toggleBookmark(job.id)}
                      aria-label={job.isBookmarked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    >
                      {job.isBookmarked ? '★' : '☆'}
                    </button>
                    <button className="action-button" aria-label="مشاركة">
                      ⤴
                    </button>
                  </div>
                </div>

                <div className="job-card-body">
                  <p className="job-description">{job.description}</p>
                </div>

                <div className="job-tags">
                  {job.tags.map((tag, index) => (
                    <span key={index} className="job-tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="job-card-footer">
                  <div>
                    <div className="job-salary">{job.salary}</div>
                    <div className="job-location">📍 {job.location}</div>
                  </div>
                  <button className="apply-button">
                    تقديم
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponsiveJobPostingsExample;
