import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getBreadcrumbs } from '../../utils/internalLinking';
import './Breadcrumbs.css';

/**
 * Breadcrumbs Component
 * Displays breadcrumb navigation for SEO and user navigation
 */
const Breadcrumbs = () => {
  const location = useLocation();
  const { language } = useApp();
  const breadcrumbs = getBreadcrumbs(location.pathname, language);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav 
      className="breadcrumbs-container"
      aria-label={language === 'ar' ? 'التنقل التفصيلي' : language === 'fr' ? 'Fil d\'Ariane' : 'Breadcrumb navigation'}
    >
      <ol className="breadcrumbs-list">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={index} className="breadcrumb-item">
              {!isLast ? (
                <>
                  <Link 
                    to={crumb.path} 
                    className="breadcrumb-link"
                    aria-label={crumb.label}
                  >
                    {crumb.label}
                  </Link>
                  <span className="breadcrumb-separator" aria-hidden="true">/</span>
                </>
              ) : (
                <span className="breadcrumb-current" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
