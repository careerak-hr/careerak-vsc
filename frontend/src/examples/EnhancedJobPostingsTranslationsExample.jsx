/**
 * Enhanced Job Postings Translations Example
 * مثال استخدام الترجمات في صفحة الوظائف المحسّنة
 * 
 * يوضح كيفية استخدام نظام الترجمات في جميع المكونات
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useEnhancedJobPostingsTranslations } from '../i18n/enhancedJobPostingsTranslations';

// ============================================
// 1. View Toggle Component Example
// ============================================
function ViewToggleExample() {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);
  const [view, setView] = useState('grid');

  return (
    <div className="view-toggle">
      <button
        onClick={() => setView('grid')}
        className={view === 'grid' ? 'active' : ''}
        title={t('viewToggle.switchToGrid')}
      >
        {t('viewToggle.grid')}
      </button>
      <button
        onClick={() => setView('list')}
        className={view === 'list' ? 'active' : ''}
        title={t('viewToggle.switchToList')}
      >
        {t('viewToggle.list')}
      </button>
    </div>
  );
}

// ============================================
// 2. Bookmark Button Example
// ============================================
function BookmarkButtonExample({ jobId, isBookmarked }) {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleToggleBookmark = async () => {
    try {
      // API call here
      setBookmarked(!bookmarked);
      
      // Show success message
      const message = bookmarked 
        ? t('success.bookmarkRemoved')
        : t('success.bookmarkAdded');
      
      alert(message);
    } catch (error) {
      alert(t('errors.bookmarkFailed'));
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
      title={bookmarked ? t('bookmark.remove') : t('bookmark.save')}
    >
      {bookmarked ? '❤️' : '🤍'} {bookmarked ? t('bookmark.saved') : t('bookmark.save')}
    </button>
  );
}

// ============================================
// 3. Share Modal Example
// ============================================
function ShareModalExample({ job }) {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert(t('success.linkCopied'));
    } catch (error) {
      alert(t('errors.shareFailed'));
    }
  };

  const handleShare = (platform) => {
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(job.title + ' ' + window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(job.title)}&url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="share-btn">
        🔗 {t('share.title')}
      </button>
    );
  }

  return (
    <div className="share-modal">
      <h3>{t('share.title')}</h3>
      <p>{t('share.shareVia')}</p>
      
      <div className="share-options">
        <button onClick={handleCopyLink}>
          📋 {t('share.copyLink')}
        </button>
        <button onClick={() => handleShare('whatsapp')}>
          💬 {t('share.whatsapp')}
        </button>
        <button onClick={() => handleShare('linkedin')}>
          💼 {t('share.linkedin')}
        </button>
        <button onClick={() => handleShare('twitter')}>
          🐦 {t('share.twitter')}
        </button>
        <button onClick={() => handleShare('facebook')}>
          📘 {t('share.facebook')}
        </button>
      </div>
      
      <button onClick={() => setIsOpen(false)}>✕</button>
    </div>
  );
}

// ============================================
// 4. Similar Jobs Section Example
// ============================================
function SimilarJobsSectionExample({ jobId }) {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);
  const [loading, setLoading] = useState(true);
  const [similarJobs, setSimilarJobs] = useState([]);

  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSimilarJobs([
        { id: 1, title: 'Job 1', matchScore: 85 },
        { id: 2, title: 'Job 2', matchScore: 78 },
        { id: 3, title: 'Job 3', matchScore: 72 },
      ]);
      setLoading(false);
    }, 1000);
  }, [jobId]);

  if (loading) {
    return <div>{t('loading.similarJobs')}</div>;
  }

  if (similarJobs.length === 0) {
    return <div>{t('similarJobs.noSimilarJobs')}</div>;
  }

  return (
    <div className="similar-jobs">
      <h3>{t('similarJobs.title')}</h3>
      <div className="jobs-list">
        {similarJobs.map(job => (
          <div key={job.id} className="job-card">
            <h4>{job.title}</h4>
            <span className="match-score">
              {t('similarJobs.matchPercentage')}: {job.matchScore}%
            </span>
          </div>
        ))}
      </div>
      <button>{t('similarJobs.viewAll')}</button>
    </div>
  );
}

// ============================================
// 5. Salary Indicator Example
// ============================================
function SalaryIndicatorExample({ estimate }) {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);

  if (!estimate) {
    return <div>{t('salary.notAvailable')}</div>;
  }

  const comparisonConfig = {
    below: { color: '#ef4444', icon: '🔴' },
    average: { color: '#f59e0b', icon: '🟡' },
    above: { color: '#10b981', icon: '🟢' },
  };

  const { color, icon } = comparisonConfig[estimate.comparison];

  return (
    <div className="salary-indicator">
      <h4>{t('salary.estimation')}</h4>
      
      <div className="salary-details">
        <div className="salary-row">
          <span>{t('salary.provided')}:</span>
          <span>{estimate.provided} {t('salary.currency')}</span>
        </div>
        
        <div className="salary-row">
          <span>{t('salary.marketAverage')}:</span>
          <span>{estimate.market.average} {t('salary.currency')}</span>
        </div>
        
        <div className="salary-row">
          <span>{t('salary.range')}:</span>
          <span>{estimate.market.min} - {estimate.market.max} {t('salary.currency')}</span>
        </div>
        
        <div className="salary-comparison" style={{ color }}>
          {icon} {t(`salary.comparison.${estimate.comparison}`)}
          {estimate.percentageDiff > 0 && ` (${estimate.percentageDiff}%)`}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. Company Card Example
// ============================================
function CompanyCardExample({ company }) {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);

  return (
    <div className="company-card">
      <div className="company-header">
        <img src={company.logo} alt={company.name} />
        <div>
          <h3>{company.name}</h3>
          <p>{t(`company.size.${company.size}`)}</p>
          {company.employeeCount && (
            <p>{company.employeeCount} {t('company.employees')}</p>
          )}
        </div>
      </div>

      {company.rating && (
        <div className="company-rating">
          <span>⭐ {company.rating.average.toFixed(1)}</span>
          <span>({company.rating.count} {t('company.reviews')})</span>
        </div>
      )}

      <p className="company-description">
        {company.description || t('company.noDescription')}
      </p>

      <div className="company-stats">
        <span>{company.openPositions} {t('company.openPositions')}</span>
        {company.responseRate && (
          <span>
            {t('company.responseRate.label')}: {t(`company.responseRate.${company.responseRate.label}`)}
          </span>
        )}
      </div>

      <div className="company-actions">
        <button>{t('company.viewOtherJobs')}</button>
        {company.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer">
            {t('company.website')}
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================
// 7. Job Card Example
// ============================================
function JobCardExample({ job }) {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInMinutes = Math.floor((now - posted) / (1000 * 60));

    if (diffInMinutes < 60) {
      return t('time.minutesAgo', { count: diffInMinutes });
    } else if (diffInMinutes < 1440) {
      return t('time.hoursAgo', { count: Math.floor(diffInMinutes / 60) });
    } else if (diffInMinutes < 10080) {
      return t('time.daysAgo', { count: Math.floor(diffInMinutes / 1440) });
    } else if (diffInMinutes < 43200) {
      return t('time.weeksAgo', { count: Math.floor(diffInMinutes / 10080) });
    } else {
      return t('time.monthsAgo', { count: Math.floor(diffInMinutes / 43200) });
    }
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <img src={job.company.logo} alt={job.company.name} />
        <div>
          <h3>{job.title}</h3>
          <p>{job.company.name}</p>
        </div>
        {job.isUrgent && <span className="badge urgent">{t('jobCard.urgent')}</span>}
        {job.isNew && <span className="badge new">{t('jobCard.new')}</span>}
      </div>

      <p className="job-description">{job.description}</p>

      <div className="job-meta">
        <span>📍 {job.location}</span>
        <span>💼 {t(`jobCard.${job.type}`)}</span>
        <span>💰 {job.salary} {t('salary.currency')}</span>
      </div>

      <div className="job-footer">
        <div className="job-stats">
          <span>{getTimeAgo(job.postedDate)}</span>
          <span>{job.applicantCount} {t('jobCard.applicants')}</span>
        </div>
        
        <div className="job-actions">
          <BookmarkButtonExample jobId={job.id} isBookmarked={job.isBookmarked} />
          <button className="apply-btn">{t('jobCard.apply')}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 8. Filters Panel Example
// ============================================
function FiltersPanelExample() {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);
  const [filters, setFilters] = useState({
    field: '',
    location: '',
    jobType: '',
    experience: '',
    salary: '',
  });

  const handleClearFilters = () => {
    setFilters({
      field: '',
      location: '',
      jobType: '',
      experience: '',
      salary: '',
    });
  };

  return (
    <div className="filters-panel">
      <h3>{t('filters.title')}</h3>

      <div className="filter-group">
        <label>{t('filters.field')}</label>
        <select
          value={filters.field}
          onChange={(e) => setFilters({ ...filters, field: e.target.value })}
        >
          <option value="">All</option>
          <option value="it">IT</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      <div className="filter-group">
        <label>{t('filters.location')}</label>
        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        >
          <option value="">All</option>
          <option value="riyadh">Riyadh</option>
          <option value="jeddah">Jeddah</option>
        </select>
      </div>

      <div className="filter-group">
        <label>{t('filters.jobType')}</label>
        <select
          value={filters.jobType}
          onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
        >
          <option value="">All</option>
          <option value="fullTime">{t('jobCard.fullTime')}</option>
          <option value="partTime">{t('jobCard.partTime')}</option>
          <option value="remote">{t('jobCard.remote')}</option>
        </select>
      </div>

      <div className="filter-actions">
        <button onClick={handleClearFilters}>{t('filters.clearAll')}</button>
        <button className="primary">{t('filters.apply')}</button>
      </div>
    </div>
  );
}

// ============================================
// 9. Complete Page Example
// ============================================
export default function EnhancedJobPostingsTranslationsExample() {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);
  const [loading, setLoading] = useState(false);

  // Sample data
  const sampleJob = {
    id: 1,
    title: 'Senior Frontend Developer',
    company: {
      name: 'Tech Company',
      logo: '/logo.png',
    },
    description: 'We are looking for a senior frontend developer...',
    location: 'Riyadh',
    type: 'fullTime',
    salary: 15000,
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    applicantCount: 25,
    isUrgent: true,
    isNew: false,
    isBookmarked: false,
  };

  const sampleCompany = {
    name: 'Tech Company',
    logo: '/logo.png',
    size: 'medium',
    employeeCount: 250,
    rating: {
      average: 4.5,
      count: 120,
    },
    description: 'A leading technology company...',
    openPositions: 15,
    responseRate: {
      label: 'fast',
    },
    website: 'https://example.com',
  };

  const sampleSalaryEstimate = {
    provided: 15000,
    market: {
      average: 18000,
      min: 12000,
      max: 25000,
    },
    comparison: 'below',
    percentageDiff: 17,
  };

  return (
    <div className="enhanced-job-postings-example" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h1>Enhanced Job Postings - Translations Example</h1>
      <p>Current Language: {language}</p>

      <section>
        <h2>1. View Toggle</h2>
        <ViewToggleExample />
      </section>

      <section>
        <h2>2. Job Card</h2>
        <JobCardExample job={sampleJob} />
      </section>

      <section>
        <h2>3. Share Modal</h2>
        <ShareModalExample job={sampleJob} />
      </section>

      <section>
        <h2>4. Similar Jobs</h2>
        <SimilarJobsSectionExample jobId={sampleJob.id} />
      </section>

      <section>
        <h2>5. Salary Indicator</h2>
        <SalaryIndicatorExample estimate={sampleSalaryEstimate} />
      </section>

      <section>
        <h2>6. Company Card</h2>
        <CompanyCardExample company={sampleCompany} />
      </section>

      <section>
        <h2>7. Filters Panel</h2>
        <FiltersPanelExample />
      </section>

      <section>
        <h2>8. Loading States</h2>
        <div>
          <p>{t('loading.jobs')}</p>
          <p>{t('loading.details')}</p>
          <p>{t('loading.bookmarks')}</p>
        </div>
      </section>

      <section>
        <h2>9. Error Messages</h2>
        <div>
          <p style={{ color: 'red' }}>{t('errors.loadFailed')}</p>
          <p style={{ color: 'red' }}>{t('errors.bookmarkFailed')}</p>
          <p style={{ color: 'red' }}>{t('errors.networkError')}</p>
        </div>
      </section>

      <section>
        <h2>10. Success Messages</h2>
        <div>
          <p style={{ color: 'green' }}>{t('success.bookmarkAdded')}</p>
          <p style={{ color: 'green' }}>{t('success.linkCopied')}</p>
          <p style={{ color: 'green' }}>{t('success.applicationSubmitted')}</p>
        </div>
      </section>
    </div>
  );
}
