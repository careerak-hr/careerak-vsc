/**
 * Similar Jobs Section Component
 * قسم الوظائف المشابهة
 * 
 * يعرض 4-6 وظائف مشابهة في Carousel
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './SimilarJobsSection.css';

const SimilarJobsSection = ({ jobId, limit = 6 }) => {
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useApp();
  const navigate = useNavigate();

  const translations = {
    ar: {
      title: 'وظائف مشابهة',
      similarity: 'نسبة التشابه',
      viewJob: 'عرض الوظيفة',
      noJobs: 'لا توجد وظائف مشابهة',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ في تحميل الوظائف المشابهة',
      previous: 'السابق',
      next: 'التالي'
    },
    en: {
      title: 'Similar Jobs',
      similarity: 'Similarity',
      viewJob: 'View Job',
      noJobs: 'No similar jobs found',
      loading: 'Loading...',
      error: 'Error loading similar jobs',
      previous: 'Previous',
      next: 'Next'
    },
    fr: {
      title: 'Emplois similaires',
      similarity: 'Similarité',
      viewJob: 'Voir l\'emploi',
      noJobs: 'Aucun emploi similaire trouvé',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement des emplois similaires',
      previous: 'Précédent',
      next: 'Suivant'
    }
  };

  const t = translations[language] || translations.ar;

  useEffect(() => {
    fetchSimilarJobs();
  }, [jobId]);

  const fetchSimilarJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/job-postings/${jobId}/similar?limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch similar jobs');
      }

      const data = await response.json();
      setSimilarJobs(data.data || []);
    } catch (err) {
      console.error('Error fetching similar jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? similarJobs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === similarJobs.length - 1 ? 0 : prev + 1));
  };

  const handleViewJob = (jobId) => {
    navigate(`/job-postings/${jobId}`);
  };

  const getSimilarityColor = (score) => {
    if (score >= 75) return '#10b981'; // أخضر
    if (score >= 60) return '#f59e0b'; // أصفر
    return '#ef4444'; // أحمر
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.min) return null;
    if (salary.max) {
      return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    return salary.min.toLocaleString();
  };

  if (loading) {
    return (
      <div className="similar-jobs-section">
        <h2 className="similar-jobs-title">{t.title}</h2>
        <div className="similar-jobs-loading">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="similar-jobs-section">
        <h2 className="similar-jobs-title">{t.title}</h2>
        <div className="similar-jobs-error">{t.error}</div>
      </div>
    );
  }

  if (similarJobs.length === 0) {
    return (
      <div className="similar-jobs-section">
        <h2 className="similar-jobs-title">{t.title}</h2>
        <div className="similar-jobs-empty">{t.noJobs}</div>
      </div>
    );
  }

  return (
    <div className="similar-jobs-section">
      <h2 className="similar-jobs-title">{t.title}</h2>

      <div className="similar-jobs-carousel">
        {/* Navigation Buttons */}
        {similarJobs.length > 1 && (
          <>
            <button
              className="carousel-button carousel-button-prev"
              onClick={handlePrevious}
              aria-label={t.previous}
            >
              {language === 'ar' ? '›' : '‹'}
            </button>
            <button
              className="carousel-button carousel-button-next"
              onClick={handleNext}
              aria-label={t.next}
            >
              {language === 'ar' ? '‹' : '›'}
            </button>
          </>
        )}

        {/* Jobs Container */}
        <div className="similar-jobs-container">
          <div
            className="similar-jobs-track"
            style={{
              transform: `translateX(${language === 'ar' ? currentIndex * 100 : -currentIndex * 100}%)`
            }}
          >
            {similarJobs.map((job) => (
              <div key={job._id} className="similar-job-card">
                {/* Similarity Badge */}
                <div
                  className="similarity-badge"
                  style={{ backgroundColor: getSimilarityColor(job.similarityScore) }}
                >
                  {t.similarity}: {job.similarityScore}%
                </div>

                {/* Job Content */}
                <div className="similar-job-content">
                  <h3 className="similar-job-title">{job.title}</h3>

                  {job.company && job.company.name && (
                    <p className="similar-job-company">{job.company.name}</p>
                  )}

                  {job.location && job.location.city && (
                    <p className="similar-job-location">
                      📍 {job.location.city}
                      {job.location.country && `, ${job.location.country}`}
                    </p>
                  )}

                  {job.salary && formatSalary(job.salary) && (
                    <p className="similar-job-salary">
                      💰 {formatSalary(job.salary)}
                    </p>
                  )}

                  {job.skills && job.skills.length > 0 && (
                    <div className="similar-job-skills">
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="skill-tag">+{job.skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  <button
                    className="view-job-button"
                    onClick={() => handleViewJob(job._id)}
                  >
                    {t.viewJob}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {similarJobs.length > 1 && (
          <div className="carousel-dots">
            {similarJobs.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to job ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarJobsSection;
