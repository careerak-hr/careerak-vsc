import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getRelatedLinks } from '../../utils/internalLinking';
import './RelatedLinks.css';

/**
 * RelatedLinks Component
 * Displays contextual internal links to related content for SEO
 */
const RelatedLinks = () => {
  const location = useLocation();
  const { language } = useApp();
  const relatedLinks = getRelatedLinks(location.pathname, language);

  if (relatedLinks.length === 0) {
    return null;
  }

  const titles = {
    ar: 'قد يهمك أيضاً',
    en: 'You might also be interested in',
    fr: 'Vous pourriez également être intéressé par',
  };

  return (
    <aside 
      className="related-links-container"
      aria-labelledby="related-links-title"
    >
      <h2 id="related-links-title" className="related-links-title">
        {titles[language] || titles.en}
      </h2>
      <nav className="related-links-grid">
        {relatedLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="related-link-card"
            aria-label={`${link.label}: ${link.description}`}
          >
            <h3 className="related-link-label">{link.label}</h3>
            {link.description && (
              <p className="related-link-description">{link.description}</p>
            )}
            <span className="related-link-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default RelatedLinks;
