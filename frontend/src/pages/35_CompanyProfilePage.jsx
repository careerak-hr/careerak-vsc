import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import SEOHead from '../components/SEO/SEOHead';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import ShareButton from '../components/ShareButton/ShareButton';
import './35_CompanyProfilePage.css';

/**
 * CompanyProfilePage Component
 * 
 * Displays company profile with:
 * - Company information (logo, name, description)
 * - Company statistics (size, employees, rating)
 * - Open job positions
 * - Company reviews
 * 
 * Requirements:
 * - Requirements 6.3: اسم الشركة مع رابط للملف الشخصي
 */
const CompanyProfilePage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { language, translations } = useApp();
  const { shouldAnimate } = useAnimation();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch company info
      const companyResponse = await fetch(`/api/companies/${companyId}/info`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!companyResponse.ok) {
        throw new Error('Company not found');
      }

      const companyData = await companyResponse.json();
      setCompany(companyData);

      // Fetch company jobs
      const jobsResponse = await fetch(`/api/jobs?postedBy=${companyId}&status=Open`);
      const jobsData = await jobsResponse.json();
      setJobs(jobsData.jobs || []);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSizeLabel = (size) => {
    const labels = {
      ar: { small: 'صغيرة', medium: 'متوسطة', large: 'كبيرة' },
      en: { small: 'Small', medium: 'Medium', large: 'Large' },
      fr: { small: 'Petite', medium: 'Moyenne', large: 'Grande' }
    };
    return labels[language]?.[size] || size;
  };

  const getResponseRateLabel = (label) => {
    const labels = {
      ar: { fast: 'سريع', medium: 'متوسط', slow: 'بطيء' },
      en: { fast: 'Fast', medium: 'Medium', slow: 'Slow' },
      fr: { fast: 'Rapide', medium: 'Moyen', slow: 'Lent' }
    };
    return labels[language]?.[label] || label;
  };

  const getResponseRateClass = (label) => {
    return `response-rate-${label}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="company-profile-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="company-profile-page">
        <div className="error-container">
          <h2>Company Not Found</h2>
          <p>{error || 'The company you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/job-postings')}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary>
      <SEOHead
        title={`${company.name} - Company Profile | Careerak`}
        description={company.description || `View ${company.name} profile, open positions, and company information on Careerak.`}
        keywords={`${company.name}, company profile, jobs, careers, employment`}
        image={company.logo || `${window.location.origin}/logo.png`}
        url={`${window.location.origin}/company/${companyId}`}
      />

      <motion.div
        className="company-profile-page"
        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="company-profile-container">
          {/* Company Header */}
          <div className="company-header">
            {company.logo && (
              <img 
                src={company.logo} 
                alt={`${company.name} logo`}
                className="company-logo-large"
              />
            )}
            <div className="company-header-content">
              <h1>{company.name}</h1>

              <ShareButton
                content={company}
                contentType="company"
                variant="outline"
                size="medium"
              />
              
              {/* Company Stats */}
              <div className="company-stats">
                <div className="stat-item">
                  <span className="stat-label">Size:</span>
                  <span className="stat-value">{getSizeLabel(company.size)}</span>
                </div>
                
                {company.employeeCount && (
                  <div className="stat-item">
                    <span className="stat-label">Employees:</span>
                    <span className="stat-value">{company.employeeCount}</span>
                  </div>
                )}
                
                {company.rating && company.rating.count > 0 && (
                  <div className="stat-item rating-stat">
                    <div className="stars">
                      {renderStars(company.rating.average)}
                    </div>
                    <span className="rating-text">
                      {company.rating.average.toFixed(1)} ({company.rating.count} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Description */}
          {company.description && (
            <div className="company-section">
              <h2>About Us</h2>
              <p>{company.description}</p>
            </div>
          )}

          {/* Company Info Grid */}
          <div className="company-info-grid">
            {company.openPositions > 0 && (
              <div className="info-card">
                <div className="info-icon">💼</div>
                <div className="info-content">
                  <div className="info-label">Open Positions</div>
                  <div className="info-value">{company.openPositions}</div>
                </div>
              </div>
            )}

            {company.responseRate && (
              <div className="info-card">
                <div className="info-icon">⚡</div>
                <div className="info-content">
                  <div className="info-label">Response Rate</div>
                  <div className={`info-value ${getResponseRateClass(company.responseRate.label)}`}>
                    {getResponseRateLabel(company.responseRate.label)}
                  </div>
                </div>
              </div>
            )}

            {company.website && (
              <div className="info-card">
                <div className="info-icon">🌐</div>
                <div className="info-content">
                  <div className="info-label">Website</div>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="info-link"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Open Positions */}
          {jobs.length > 0 && (
            <div className="company-section">
              <h2>Open Positions ({jobs.length})</h2>
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <div 
                    key={job._id} 
                    className="job-card"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                      {job.location && <span className="location">📍 {job.location}</span>}
                      {job.jobType && <span className="job-type">{job.jobType}</span>}
                    </div>
                    {job.salary && (
                      <div className="job-salary">
                        {job.salary.min} - {job.salary.max} {job.salary.currency || 'SAR'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {jobs.length === 0 && (
            <div className="no-jobs">
              <p>No open positions at the moment.</p>
            </div>
          )}
        </div>
      </motion.div>
    </ComponentErrorBoundary>
  );
};

export default CompanyProfilePage;
