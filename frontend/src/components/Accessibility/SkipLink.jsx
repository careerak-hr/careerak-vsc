import React from 'react';
import './SkipLink.css';

/**
 * SkipLink Component
 * 
 * Provides a "Skip to main content" link for keyboard users
 * Meets WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)
 * 
 * Usage:
 * <SkipLink targetId="main-content" />
 * 
 * Then add id="main-content" to your main content element:
 * <main id="main-content">...</main>
 */
const SkipLink = ({ targetId = 'main-content', language = 'ar' }) => {
  const labels = {
    ar: 'تخطي إلى المحتوى الرئيسي',
    en: 'Skip to main content',
    fr: 'Passer au contenu principal'
  };

  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={handleClick}
      aria-label={labels[language] || labels.ar}
    >
      {labels[language] || labels.ar}
    </a>
  );
};

export default SkipLink;
