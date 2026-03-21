import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaGraduationCap, FaUser, FaBuilding, FaExternalLinkAlt } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import './SharedContentPreview.css';

const CONTENT_ICONS = {
  job: FaBriefcase,
  course: FaGraduationCap,
  profile: FaUser,
  company: FaBuilding,
};

const CONTENT_PATHS = {
  job: 'job-postings',
  course: 'courses',
  profile: 'profile',
  company: 'companies',
};

const translations = {
  ar: {
    view: 'عرض',
    sharedContent: 'محتوى مشترك',
    job: 'وظيفة',
    course: 'دورة تدريبية',
    profile: 'ملف شخصي',
    company: 'شركة',
  },
  en: {
    view: 'View',
    sharedContent: 'Shared Content',
    job: 'Job',
    course: 'Course',
    profile: 'Profile',
    company: 'Company',
  },
  fr: {
    view: 'Voir',
    sharedContent: 'Contenu partagé',
    job: 'Emploi',
    course: 'Formation',
    profile: 'Profil',
    company: 'Entreprise',
  },
};

const SharedContentPreview = ({ sharedContent }) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  const isRTL = language === 'ar';

  if (!sharedContent) return null;

  const { contentType, contentId, title, description, imageUrl, url } = sharedContent;
  const Icon = CONTENT_ICONS[contentType] || FaExternalLinkAlt;
  const typeLabel = t[contentType] || t.sharedContent;

  const handleClick = () => {
    if (contentId && CONTENT_PATHS[contentType]) {
      navigate(`/${CONTENT_PATHS[contentType]}/${contentId}`);
    } else if (url) {
      if (url.startsWith('http')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        navigate(url);
      }
    }
  };

  return (
    <button
      className={`shared-content-preview${imageUrl ? ' has-image' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={handleClick}
      aria-label={`${t.view}: ${title || typeLabel}`}
    >
      {/* Type badge */}
      <div className="shared-content-badge">
        <Icon className="shared-content-badge-icon" />
        <span>{typeLabel}</span>
      </div>

      {/* Body */}
      <div className="shared-content-body">
        {imageUrl && (
          <div className="shared-content-thumbnail">
            <img src={imageUrl} alt={title || typeLabel} loading="lazy" />
          </div>
        )}
        <div className="shared-content-info">
          {!imageUrl && (
            <div className="shared-content-icon">
              <Icon />
            </div>
          )}
          <div className="shared-content-text">
            <span className="shared-content-title">{title || url}</span>
            {description && (
              <span className="shared-content-description">{description}</span>
            )}
          </div>
        </div>
        <FaExternalLinkAlt className="shared-content-arrow" />
      </div>
    </button>
  );
};

export default SharedContentPreview;
