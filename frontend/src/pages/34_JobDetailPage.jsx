import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { SEOHead } from '../components/SEO';
import ComponentErrorBoundary from '../components/ErrorBoundary/ComponentErrorBoundary';
import ShareButton from '../components/ShareButton/ShareButton';
import './34_JobDetailPage.css';

// Lazy load components
const SimilarJobsSection = lazy(() => import('../components/SimilarJobs/SimilarJobsSection'));
const SalaryIndicator = lazy(() => import('../components/SalaryIndicator/SalaryIndicator'));
const CompanyCard = lazy(() => import('../components/CompanyCard/CompanyCard'));

const JobDetailPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [salaryEstimate, setSalaryEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const [jobRes, salaryRes] = await Promise.all([
          axios.get(`/api/job-postings/${jobId}`),
          axios.get(`/api/job-postings/${jobId}/salary-estimate`)
        ]);
        setJob(jobRes.data);
        setSalaryEstimate(salaryRes.data.data);
      } catch (error) {
        console.error("Failed to fetch job details", error);
      } finally {
        setLoading(false);
      }
    };
    if(jobId) fetchJobDetails();
  }, [jobId]);

  if (loading) {
    // Replace with a proper skeleton loader in the future
    return <div className="page-loading">Loading job details...</div>;
  }

  if (!job) {
    return <div className="job-not-found">Job not found. <Link to="/job-postings">Go back to jobs</Link></div>;
  }

  return (
    <>
      <SEOHead title={`${job.title} | Careerak`} description={job.description.substring(0, 160)} />
      <div className="job-detail-container">
        <div className="job-detail-main-content">
          <header className="job-detail-header">
            <h1>{job.title}</h1>
            <p className="company-name">Posted by <Link to={`/company/${job.postedBy?._id}`}>{job.postedBy?.companyName || 'a company'}</Link></p>
            <ShareButton job={job} variant="outline" size="medium" />
          </header>

          <section className="job-description-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </section>

          <section className="job-requirements-section">
            <h2>Requirements</h2>
            <p>{job.requirements}</p>
          </section>
        </div>

        <aside className="job-detail-sidebar">
          <Suspense fallback={<div>Loading company info...</div>}>
            <ComponentErrorBoundary>
              <CompanyCard companyId={job.postedBy?._id} />
            </ComponentErrorBoundary>
          </Suspense>

          <Suspense fallback={<div>Loading salary insights...</div>}>
            <ComponentErrorBoundary>
              <SalaryIndicator estimate={salaryEstimate} />
            </ComponentErrorBoundary>
          </Suspense>

          <Suspense fallback={<div>Loading similar jobs...</div>}>
            <ComponentErrorBoundary>
              <SimilarJobsSection jobId={jobId} />
            </ComponentErrorBoundary>
          </Suspense>
        </aside>
      </div>
    </>
  );
};

export default JobDetailPage;
