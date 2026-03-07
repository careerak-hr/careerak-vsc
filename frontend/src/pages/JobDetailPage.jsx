import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAnimation } from '../context/AnimationContext';
import SEOHead from '../components/SEO/SEOHead';
import StructuredData from '../components/SEO/StructuredData';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import './JobDetailPage.css';

/**
 * JobDetailPage Component
 * 
 * Displays detailed information about a specific job posting with:
 * - Complete Open Graph tags for social media sharing
 * - Twitter Card tags for Twitter sharing
 * - Structured data (JSON-LD) for search engines
 * - Dynamic meta tags based on job data
 * 
 * Requirements:
 * - FR-SEO-4: Open Graph tags
 * - FR-SEO-5: Twitter Card tags
 * - FR-SEO-6: Structured data (JobPosting schema)
 * - Requirements 3.4: معاينة جذابة عند المشاركة
 */
const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { language, translations } = useApp();
  const { shouldAnimate } = useAnimation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const response = await fetch(`/api/jobs/${jobId}`);
      
      if (!response.ok) {
        throw new Error('Job not found');
      }

      const data = await response.json();
      setJob(data);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate SEO-optimized title (50-60 characters)
  const generateTitle = () => {
    if (!job) return 'Job Details | Careerak';
    
    // Format: "Job Title at Company | Careerak"
    const title = `${job.title} at ${job.company.name} | Careerak`;
    
    // Truncate if too long (max 60 characters)
    return title.length > 60 ? title.substring(0, 57) + '...' : title;
  };

  // Generate SEO-optimized description (150-160 characters)
  const generateDescription = () => {
    if (!job) return 'Find your dream job on Careerak';
    
    // Format: "Job Title at Company in Location. Salary range. Apply now!"
    const parts = [
      `${job.title} at ${job.company.name}`,
      job.location ? `in ${job.location}` : '',
      job.salary ? `Salary: ${job.salary.min}-${job.salary.max} ${job.salary.currency}` : '',
      'Apply now on Careerak!'
    ].filter(Boolean);
    
    const description = parts.join('. ');
    
    // Truncate if too long (max 160 characters)
    return description.length > 160 ? description.substring(0, 157) + '...' : description;
  };

  // Generate keywords for SEO
  const generateKeywords = () => {
    if (!job) return 'jobs, careers, employment';
    
    const keywords = [
      job.title,
      job.company.name,
      job.location,
      job.field || 'technology',
      'jobs',
      'careers',
      'employment',
      'hiring'
    ].filter(Boolean);
    
    return keywords.join(', ');
  };

  // Generate Open Graph image URL
  const generateOGImage = () => {
    if (!job) return `${window.location.origin}/logo.png`;
    
    // Priority: Company logo > Job thumbnail > Default logo
    if (job.company?.logo) {
      // Ensure absolute URL
      return job.company.logo.startsWith('http') 
        ? job.company.logo 
        : `${window.location.origin}${job.company.logo}`;
    }
    
    if (job.thumbnail) {
      return job.thumbnail.startsWith('http')
        ? job.thumbnail
        : `${window.location.origin}${job.thumbnail}`;
    }
    
    return `${window.location.origin}/logo.png`;
  };

  // Generate canonical URL
  const generateCanonicalURL = () => {
    return `${window.location.origin}/jobs/${jobId}`;
  };

  // Transform job data to JobPosting schema for structured data
  const transformJobToSchema = (job) => {
    if (!job) return null;

    return {
      title: job.title,
      description: job.description,
      datePosted: job.createdAt,
      validThrough: job.validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      employmentType: job.jobType || 'FULL_TIME',
      hiringOrganization: {
        name: job.company?.name || 'Unknown Company',
        logo: job.company?.logo,
        sameAs: job.company?.website
      },
      jobLocation: {
        address: {
          addressLocality: job.location?.city || job.location,
          addressRegion: job.location?.region,
          addressCountry: job.location?.country || 'SA'
        }
      },
      baseSalary: job.salary ? {
        currency: job.salary.currency || 'SAR',
        value: {
          minValue: job.salary.min,
          maxValue: job.salary.max,
          unitText: 'YEAR'
        }
      } : undefined,
      skills: job.requiredSkills?.join(', '),
      experienceRequirements: job.experienceLevel,
      educationRequirements: job.educationLevel
    };
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-page">
        <div className="error-container">
          <h2>Job Not Found</h2>
          <p>{error || 'The job you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/job-postings')}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary>
      {/* SEO Head with Open Graph tags */}
      <SEOHead
        title={generateTitle()}
        description={generateDescription()}
        keywords={generateKeywords()}
        image={generateOGImage()}
        url={generateCanonicalURL()}
        type="article"
        siteName="Careerak"
        locale={language === 'ar' ? 'ar_SA' : language === 'en' ? 'en_US' : 'fr_FR'}
        alternateLocales={['ar_SA', 'en_US', 'fr_FR']}
        twitterCard="summary_large_image"
        twitterSite="@careerak"
        additionalMeta={{
          'article:published_time': job.createdAt,
          'article:modified_time': job.updatedAt || job.createdAt,
          'article:author': job.company?.name,
          'article:section': job.field || 'Jobs',
          'article:tag': job.requiredSkills?.join(', ') || ''
        }}
      />

      {/* Structured Data (JSON-LD) for search engines */}
      <StructuredData
        type="JobPosting"
        data={transformJobToSchema(job)}
      />

      {/* Job Detail Content */}
      <motion.div
        className="job-detail-page"
        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="job-detail-container">
          {/* Job Header */}
          <div className="job-header">
            {job.company?.logo && (
              <img 
                src={job.company.logo} 
                alt={`${job.company.name} logo`}
                className="company-logo"
              />
            )}
            <div className="job-header-content">
              <h1>{job.title}</h1>
              <div className="job-meta">
                {job.company?.name && job.postedBy && (
                  <a 
                    href={`/company/${job.postedBy}`}
                    className="company-name-link"
                    title={`View ${job.company.name} profile`}
                  >
                    <span className="company-name">{job.company.name}</span>
                  </a>
                )}
                {job.location && <span className="location">📍 {job.location}</span>}
                {job.jobType && <span className="job-type">{job.jobType}</span>}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="job-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </div>

          {/* Salary Information */}
          {job.salary && (
            <div className="job-section">
              <h2>Salary</h2>
              <p className="salary-range">
                {job.salary.min} - {job.salary.max} {job.salary.currency}
              </p>
            </div>
          )}

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="job-section">
              <h2>Required Skills</h2>
              <div className="skills-list">
                {job.requiredSkills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Level */}
          {job.experienceLevel && (
            <div className="job-section">
              <h2>Experience Level</h2>
              <p>{job.experienceLevel}</p>
            </div>
          )}

          {/* Education Level */}
          {job.educationLevel && (
            <div className="job-section">
              <h2>Education Level</h2>
              <p>{job.educationLevel}</p>
            </div>
          )}

          {/* Apply Button */}
          <div className="job-actions">
            <button className="apply-button">
              Apply Now
            </button>
            <button className="share-button">
              Share Job
            </button>
          </div>
        </div>
      </motion.div>
    </ComponentErrorBoundary>
  );
};

export default JobDetailPage;
