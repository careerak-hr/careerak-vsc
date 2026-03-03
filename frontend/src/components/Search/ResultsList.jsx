import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useApp } from '../../context/AppContext';
import { useAnimation } from '../../context/AnimationContext';
import { listVariants } from '../../utils/animationVariants';
import './ResultsList.css';

/**
 * مكون عرض نتائج البحث مع نسبة المطابقة
 * @component
 */
const ResultsList = ({ 
  results = [], 
  loading = false, 
  onJobClick, 
  showMatchScore = true,
  viewMode = 'list' // 'list' or 'grid'
}) => {
  const { language } = useApp();
  const { shouldAnimate } = useAnimation();

  // Get animation variants based on shouldAnimate
  const containerVariants = shouldAnimate ? listVariants.container : { initial: {}, animate: {} };
  const itemVariants = shouldAnimate ? listVariants.item : { initial: {}, animate: {} };

  // Translations
  const translations = {
    ar: {
      match: 'مطابقة',
      company: 'الشركة',
      location: 'الموقع',
      salary: 'الراتب',
      negotiable: 'قابل للتفاوض',
      applyNow: 'تقديم الآن',
      viewDetails: 'عرض التفاصيل',
      noResults: 'لا توجد نتائج',
      noResultsDesc: 'جرب تعديل معايير البحث أو الفلاتر'
    },
    en: {
      match: 'Match',
      company: 'Company',
      location: 'Location',
      salary: 'Salary',
      negotiable: 'Negotiable',
      applyNow: 'Apply Now',
      viewDetails: 'View Details',
      noResults: 'No Results Found',
      noResultsDesc: 'Try adjusting your search criteria or filters'
    },
    fr: {
      match: 'Correspondance',
      company: 'Entreprise',
      location: 'Lieu',
      salary: 'Salaire',
      negotiable: 'Négociable',
      applyNow: 'Postuler',
      viewDetails: 'Voir les détails',
      noResults: 'Aucun résultat',
      noResultsDesc: 'Essayez d\'ajuster vos critères de recherche ou filtres'
    }
  };

  const t = translations[language] || translations.en;

  /**
   * تحديد لون شارة المطابقة بناءً على النسبة
   */
  const getMatchBadgeClass = (percentage) => {
    if (percentage >= 80) return 'match-badge-excellent';
    if (percentage >= 60) return 'match-badge-good';
    if (percentage >= 40) return 'match-badge-fair';
    return 'match-badge-low';
  };

  /**
   * تنسيق الراتب
   */
  const formatSalary = (salary) => {
    if (!salary || !salary.min || !salary.max) return t.negotiable;
    return `${salary.currency || 'SAR'} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  };

  // Empty state
  if (!loading && results.length === 0) {
    return (
      <div className="results-empty">
        <div className="empty-icon">🔍</div>
        <h3>{t.noResults}</h3>
        <p>{t.noResultsDesc}</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`results-list results-${viewMode}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {results.map((result) => {
        const job = result.job || result;
        const matchScore = result.matchScore?.percentage || result.matchPercentage || 0;
        const hasMatchScore = showMatchScore && matchScore > 0;

        return (
          <motion.article
            key={job._id || job.id}
            className="result-card"
            variants={itemVariants}
            onClick={() => onJobClick && onJobClick(job)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onJobClick && onJobClick(job);
              }
            }}
          >
            {/* Match Score Badge */}
            {hasMatchScore && (
              <div className={`match-badge ${getMatchBadgeClass(matchScore)}`}>
                <span className="match-percentage">{matchScore}%</span>
                <span className="match-label">{t.match}</span>
              </div>
            )}

            {/* Job Content */}
            <div className="result-content">
              <h3 className="result-title">{job.title}</h3>
              
              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-icon">🏢</span>
                  <span className="detail-label">{t.company}:</span>
                  <span className="detail-value">{job.company || job.postedBy?.companyName}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span className="detail-label">{t.location}:</span>
                  <span className="detail-value">{job.location}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span className="detail-label">{t.salary}:</span>
                  <span className="detail-value">{formatSalary(job.salary)}</span>
                </div>
              </div>

              {/* Description Preview */}
              {job.description && (
                <p className="result-description">
                  {job.description.substring(0, 150)}
                  {job.description.length > 150 ? '...' : ''}
                </p>
              )}

              {/* Match Reasons (if available) */}
              {result.reasons && result.reasons.length > 0 && (
                <div className="match-reasons">
                  <h4 className="reasons-title">
                    {language === 'ar' ? 'لماذا هذه الوظيفة مناسبة؟' : 
                     language === 'fr' ? 'Pourquoi ce poste?' : 
                     'Why this job?'}
                  </h4>
                  <ul className="reasons-list">
                    {result.reasons.slice(0, 3).map((reason, index) => (
                      <li key={index} className={`reason-item reason-${reason.strength}`}>
                        {reason.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="result-actions">
                <button 
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle apply action
                  }}
                >
                  {t.applyNow}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobClick && onJobClick(job);
                  }}
                >
                  {t.viewDetails}
                </button>
              </div>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
};

ResultsList.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    job: PropTypes.object,
    matchScore: PropTypes.shape({
      percentage: PropTypes.number,
      overall: PropTypes.number
    }),
    matchPercentage: PropTypes.number,
    reasons: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string,
      strength: PropTypes.string
    }))
  })),
  loading: PropTypes.bool,
  onJobClick: PropTypes.func,
  showMatchScore: PropTypes.bool,
  viewMode: PropTypes.oneOf(['list', 'grid'])
};

export default ResultsList;
