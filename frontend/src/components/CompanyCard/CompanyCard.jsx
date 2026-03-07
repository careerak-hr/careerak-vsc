import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CompanyCard.css';

const CompanyCard = ({ companyId, jobId }) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations = {
    ar: {
      employees: 'موظف',
      reviews: 'تقييم',
      openPositions: 'وظيفة مفتوحة',
      otherJobs: 'وظائف أخرى',
      website: 'الموقع الإلكتروني',
      responseRate: 'معدل الاستجابة',
      fast: 'سريع',
      medium: 'متوسط',
      slow: 'بطيء',
      small: 'صغيرة',
      medium_size: 'متوسطة',
      large: 'كبيرة',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ في تحميل معلومات الشركة'
    },
    en: {
      employees: 'employees',
      reviews: 'reviews',
      openPositions: 'open positions',
      otherJobs: 'Other Jobs',
      website: 'Website',
      responseRate: 'Response Rate',
      fast: 'Fast',
      medium: 'Medium',
      slow: 'Slow',
      small: 'Small',
      medium_size: 'Medium',
      large: 'Large',
      loading: 'Loading...',
      error: 'Error loading company information'
    },
    fr: {
      employees: 'employés',
      reviews: 'avis',
      openPositions: 'postes ouverts',
      otherJobs: 'Autres Emplois',
      website: 'Site Web',
      responseRate: 'Taux de Réponse',
      fast: 'Rapide',
      medium: 'Moyen',
      slow: 'Lent',
      small: 'Petite',
      medium_size: 'Moyenne',
      large: 'Grande',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement des informations de l\'entreprise'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchCompanyInfo();
  }, [companyId]);

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/companies/${companyId}/info`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch company info');
      }
      
      const data = await response.json();
      setCompanyInfo(data.data);
    } catch (err) {
      console.error('Error fetching company info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSizeLabel = (size) => {
    const labels = {
      small: t.small,
      medium: t.medium_size,
      large: t.large
    };
    return labels[size] || size;
  };

  const getResponseRateLabel = (label) => {
    const labels = {
      fast: t.fast,
      medium: t.medium,
      slow: t.slow
    };
    return labels[label] || label;
  };

  const getResponseRateClass = (label) => {
    const classes = {
      fast: 'response-rate-fast',
      medium: 'response-rate-medium',
      slow: 'response-rate-slow'
    };
    return classes[label] || 'response-rate-medium';
  };

  const viewCompanyJobs = () => {
    navigate(`/job-postings?company=${companyId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="star filled">★</span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="star half">★</span>
        );
      } else {
        stars.push(
          <span key={i} className="star empty">☆</span>
        );
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="company-card loading">
        <div className="loading-spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error || !companyInfo) {
    return (
      <div className="company-card error">
        <p>{t.error}</p>
      </div>
    );
  }

  return (
    <div className="company-card">
      <div className="company-card-header">
        <div className="company-logo">
          {companyInfo.logo ? (
            <img src={companyInfo.logo} alt={companyInfo.name} />
          ) : (
            <div className="company-logo-placeholder">
              {companyInfo.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="company-info">
          <h3 className="company-name">{companyInfo.name}</h3>
          
          <div className="company-meta">
            <span className="company-size">
              {getSizeLabel(companyInfo.size)}
            </span>
            {companyInfo.employeeCount && (
              <span className="employee-count">
                {companyInfo.employeeCount} {t.employees}
              </span>
            )}
          </div>
        </div>
      </div>

      {companyInfo.rating && companyInfo.rating.count > 0 && (
        <div className="company-rating">
          <div className="stars">
            {renderStars(companyInfo.rating.average)}
          </div>
          <span className="rating-text">
            {companyInfo.rating.average.toFixed(1)} ({companyInfo.rating.count} {t.reviews})
          </span>
        </div>
      )}

      {companyInfo.description && (
        <p className="company-description">{companyInfo.description}</p>
      )}

      <div className="company-stats">
        <div className="stat">
          <span className="stat-value">{companyInfo.openPositions}</span>
          <span className="stat-label">{t.openPositions}</span>
        </div>
        
        {companyInfo.responseRate && (
          <div className="stat">
            <span className={`response-rate-badge ${getResponseRateClass(companyInfo.responseRate.label)}`}>
              {getResponseRateLabel(companyInfo.responseRate.label)}
            </span>
            <span className="stat-label">{t.responseRate}</span>
          </div>
        )}
      </div>

      <div className="company-actions">
        <button 
          onClick={viewCompanyJobs}
          className="btn-secondary"
        >
          {t.otherJobs}
        </button>
        
        {companyInfo.website && (
          <a 
            href={companyInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            {t.website}
          </a>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
