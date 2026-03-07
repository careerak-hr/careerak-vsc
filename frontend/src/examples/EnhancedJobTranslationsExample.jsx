/**
 * Enhanced Job Postings - Translations Example
 * مثال شامل لاستخدام نظام الترجمة
 */

import React, { useState } from 'react';
import { useEnhancedJobTranslations } from '../hooks/useEnhancedJobTranslations';

/**
 * Example: Job Card with Translations
 */
function JobCardExample() {
  const { t, formatTimeAgo, formatSalary, formatCount, isRTL } = useEnhancedJobTranslations();
  
  const job = {
    title: 'Senior Frontend Developer',
    company: 'Tech Company',
    location: 'Riyadh',
    salary: 15000,
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    applicants: 25,
    isUrgent: true,
    isNew: false
  };
  
  return (
    <div className={`job-card ${isRTL() ? 'rtl' : 'ltr'}`}>
      <div className="job-header">
        <h3>{job.title}</h3>
        <div className="badges">
          {job.isUrgent && (
            <span className="badge urgent">{t('jobCard.urgent')}</span>
          )}
          {job.isNew && (
            <span className="badge new">{t('jobCard.new')}</span>
          )}
        </div>
      </div>
      
      <div className="job-info">
        <p>{job.company} • {job.location}</p>
        <p>{formatSalary(job.salary)} {t('salary.perMonth')}</p>
        <p>{formatTimeAgo(job.postedDate)}</p>
        <p>{formatCount(job.applicants, 'jobCard.applicants')}</p>
      </div>
      
      <div className="job-actions">
        <button className="btn-primary">{t('jobCard.apply')}</button>
        <button className="btn-secondary">{t('jobCard.viewDetails')}</button>
      </div>
    </div>
  );
}

/**
 * Example: Bookmark Button with Translations
 */
function BookmarkButtonExample() {
  const { t } = useEnhancedJobTranslations();
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const handleToggle = () => {
    setIsBookmarked(!isBookmarked);
    // Show toast notification
    const message = !isBookmarked 
      ? t('bookmark.bookmarkAdded') 
      : t('bookmark.bookmarkRemoved');
    console.log(message);
  };
  
  return (
    <button 
      className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
      onClick={handleToggle}
      title={isBookmarked ? t('bookmark.remove') : t('bookmark.save')}
    >
      <i className={isBookmarked ? 'fas fa-heart' : 'far fa-heart'}></i>
      <span>{isBookmarked ? t('bookmark.saved') : t('bookmark.save')}</span>
    </button>
  );
}

/**
 * Example: Share Modal with Translations
 */
function ShareModalExample() {
  const { t } = useEnhancedJobTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  const platforms = [
    { name: 'whatsapp', icon: 'fab fa-whatsapp', color: '#25D366' },
    { name: 'linkedin', icon: 'fab fa-linkedin', color: '#0077B5' },
    { name: 'twitter', icon: 'fab fa-twitter', color: '#1DA1F2' },
    { name: 'facebook', icon: 'fab fa-facebook', color: '#1877F2' }
  ];
  
  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}>
        {t('share.title')}
      </button>
    );
  }
  
  return (
    <div className="share-modal">
      <div className="modal-header">
        <h3>{t('share.title')}</h3>
        <button onClick={() => setIsOpen(false)}>×</button>
      </div>
      
      <div className="modal-body">
        <button 
          className="copy-link-btn"
          onClick={handleCopyLink}
        >
          <i className="fas fa-link"></i>
          <span>{linkCopied ? t('share.linkCopied') : t('share.copyLink')}</span>
        </button>
        
        <div className="share-platforms">
          <p>{t('share.shareOn')}</p>
          {platforms.map(platform => (
            <button 
              key={platform.name}
              className="platform-btn"
              style={{ backgroundColor: platform.color }}
            >
              <i className={platform.icon}></i>
              <span>{t(`share.${platform.name}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Salary Indicator with Translations
 */
function SalaryIndicatorExample() {
  const { t, formatSalary } = useEnhancedJobTranslations();
  
  const estimate = {
    provided: 12000,
    market: {
      average: 15000,
      min: 10000,
      max: 20000
    },
    comparison: 'below', // 'below', 'average', 'above'
    percentageDiff: 20
  };
  
  const getComparisonColor = () => {
    switch (estimate.comparison) {
      case 'below': return '#ef4444';
      case 'average': return '#f59e0b';
      case 'above': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  const getComparisonIcon = () => {
    switch (estimate.comparison) {
      case 'below': return '🔴';
      case 'average': return '🟡';
      case 'above': return '🟢';
      default: return '⚪';
    }
  };
  
  return (
    <div className="salary-indicator">
      <div className="indicator-header">
        <span>{t('salary.estimation')}</span>
        <span>{getComparisonIcon()}</span>
      </div>
      
      <div className="indicator-body">
        <div className="salary-row">
          <span>{t('salary.provided')}:</span>
          <strong>{formatSalary(estimate.provided)}</strong>
        </div>
        
        <div className="salary-row">
          <span>{t('salary.marketAverage')}:</span>
          <span>{formatSalary(estimate.market.average)}</span>
        </div>
        
        <div className="salary-row">
          <span>{t('salary.range')}:</span>
          <span>
            {formatSalary(estimate.market.min)} - {formatSalary(estimate.market.max)}
          </span>
        </div>
        
        <div className="salary-comparison" style={{ color: getComparisonColor() }}>
          <strong>
            {t(`salary.${estimate.comparison}`)}
            {estimate.percentageDiff > 0 && (
              <span>
                {' '}({t(`salary.percent${estimate.comparison === 'above' ? 'Above' : 'Below'}`)} {estimate.percentageDiff}%)
              </span>
            )}
          </strong>
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Similar Jobs Section with Translations
 */
function SimilarJobsExample() {
  const { t, formatSalary } = useEnhancedJobTranslations();
  
  const similarJobs = [
    { id: 1, title: 'Frontend Developer', company: 'Company A', similarity: 85, salary: 14000 },
    { id: 2, title: 'React Developer', company: 'Company B', similarity: 78, salary: 13500 },
    { id: 3, title: 'UI Developer', company: 'Company C', similarity: 72, salary: 12000 }
  ];
  
  if (similarJobs.length === 0) {
    return (
      <div className="similar-jobs-empty">
        <p>{t('similarJobs.noSimilar')}</p>
      </div>
    );
  }
  
  return (
    <div className="similar-jobs">
      <div className="section-header">
        <h3>{t('similarJobs.title')}</h3>
        <button className="view-all-btn">{t('similarJobs.viewAll')}</button>
      </div>
      
      <div className="jobs-carousel">
        {similarJobs.map(job => (
          <div key={job.id} className="similar-job-card">
            <h4>{job.title}</h4>
            <p>{job.company}</p>
            <p>{formatSalary(job.salary)}</p>
            <div className="similarity-badge">
              {t('similarJobs.similarity')}: {job.similarity}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Filters Panel with Translations
 */
function FiltersPanelExample() {
  const { t, formatCount } = useEnhancedJobTranslations();
  const [resultsCount, setResultsCount] = useState(42);
  
  return (
    <div className="filters-panel">
      <div className="filters-header">
        <h3>{t('filters.title')}</h3>
        <button className="clear-btn">{t('filters.clear')}</button>
      </div>
      
      <div className="filters-body">
        <div className="filter-group">
          <label>{t('filters.field')}</label>
          <select>
            <option>Technology</option>
            <option>Marketing</option>
            <option>Sales</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>{t('filters.location')}</label>
          <select>
            <option>Riyadh</option>
            <option>Jeddah</option>
            <option>Dammam</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>{t('filters.jobType')}</label>
          <select>
            <option>{t('jobCard.fullTime')}</option>
            <option>{t('jobCard.partTime')}</option>
            <option>{t('jobCard.remote')}</option>
          </select>
        </div>
      </div>
      
      <div className="filters-footer">
        <p>{formatCount(resultsCount, 'filters.results')}</p>
        <button className="apply-btn">{t('filters.apply')}</button>
      </div>
    </div>
  );
}

/**
 * Main Example Component
 */
export default function EnhancedJobTranslationsExample() {
  return (
    <div className="translations-example">
      <h1>Enhanced Job Postings - Translations Example</h1>
      <p>مثال شامل لنظام الترجمة - دعم كامل للعربية والإنجليزية</p>
      
      <section>
        <h2>Job Card</h2>
        <JobCardExample />
      </section>
      
      <section>
        <h2>Bookmark Button</h2>
        <BookmarkButtonExample />
      </section>
      
      <section>
        <h2>Share Modal</h2>
        <ShareModalExample />
      </section>
      
      <section>
        <h2>Salary Indicator</h2>
        <SalaryIndicatorExample />
      </section>
      
      <section>
        <h2>Similar Jobs</h2>
        <SimilarJobsExample />
      </section>
      
      <section>
        <h2>Filters Panel</h2>
        <FiltersPanelExample />
      </section>
    </div>
  );
}
