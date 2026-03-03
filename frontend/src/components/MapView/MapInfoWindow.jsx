import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './MapInfoWindow.css';

// Translations for info window
const translations = {
  ar: {
    company: 'الشركة:',
    location: 'الموقع:',
    salary: 'الراتب:',
    workType: 'نوع العمل:',
    publishDate: 'تاريخ النشر:',
    skills: 'المهارات:',
    viewDetails: 'عرض التفاصيل',
    notSpecified: 'غير محدد',
    workTypes: {
      'full-time': 'دوام كامل',
      'part-time': 'دوام جزئي',
      'remote': 'عن بعد',
      'hybrid': 'هجين',
      'contract': 'عقد',
      'freelance': 'عمل حر'
    }
  },
  en: {
    company: 'Company:',
    location: 'Location:',
    salary: 'Salary:',
    workType: 'Work Type:',
    publishDate: 'Published:',
    skills: 'Skills:',
    viewDetails: 'View Details',
    notSpecified: 'Not specified',
    workTypes: {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'contract': 'Contract',
      'freelance': 'Freelance'
    }
  },
  fr: {
    company: 'Entreprise:',
    location: 'Lieu:',
    salary: 'Salaire:',
    workType: 'Type de travail:',
    publishDate: 'Publié:',
    skills: 'Compétences:',
    viewDetails: 'Voir les détails',
    notSpecified: 'Non spécifié',
    workTypes: {
      'full-time': 'Temps plein',
      'part-time': 'Temps partiel',
      'remote': 'À distance',
      'hybrid': 'Hybride',
      'contract': 'Contrat',
      'freelance': 'Freelance'
    }
  }
};

/**
 * MapInfoWindow Component - نافذة معلومات الوظيفة
 * 
 * @param {Object} job - بيانات الوظيفة
 * @param {Object} position - موقع النافذة {lat, lng}
 * @param {Function} onClose - callback عند الإغلاق
 */
const MapInfoWindow = ({ job, position, onClose }) => {
  const navigate = useNavigate();
  const { language } = useApp();

  // Get translations for current language
  const t = translations[language] || translations.ar;

  const handleViewDetails = () => {
    navigate(`/job-postings/${job._id}`);
  };

  const formatSalary = (salary) => {
    if (!salary) return t.notSpecified;
    if (salary.min && salary.max) {
      return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency || 'SAR'}`;
    }
    return t.notSpecified;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const locale = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    return d.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWorkTypeLabel = (workType) => {
    return t.workTypes[workType] || workType;
  };

  return (
    <InfoWindow
      position={position}
      onCloseClick={onClose}
      options={{
        pixelOffset: new window.google.maps.Size(0, -40)
      }}
    >
      <div className="map-info-window" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="info-header">
          <h3 className="job-title">{job.title}</h3>
          {job.company?.logo && (
            <img 
              src={job.company.logo} 
              alt={job.company.name}
              className="company-logo"
            />
          )}
        </div>

        <div className="info-body">
          <div className="info-item">
            <span className="info-label">{t.company}</span>
            <span className="info-value">{job.company?.name || t.notSpecified}</span>
          </div>

          <div className="info-item">
            <span className="info-label">{t.location}</span>
            <span className="info-value">
              {job.location?.city}, {job.location?.country}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">{t.salary}</span>
            <span className="info-value">{formatSalary(job.salary)}</span>
          </div>

          <div className="info-item">
            <span className="info-label">{t.workType}</span>
            <span className="info-value">
              {getWorkTypeLabel(job.workType)}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">{t.publishDate}</span>
            <span className="info-value">{formatDate(job.createdAt)}</span>
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="info-item skills">
              <span className="info-label">{t.skills}</span>
              <div className="skills-list">
                {job.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="skill-tag more">
                    +{job.skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="info-footer">
          <button 
            className="btn-view-details"
            onClick={handleViewDetails}
          >
            {t.viewDetails}
          </button>
        </div>
      </div>
    </InfoWindow>
  );
};

export default MapInfoWindow;
