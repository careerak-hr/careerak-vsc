import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import ReportModal from '../components/modals/ReportModal';
import jobPostingsTranslations from '../data/jobPostingsTranslations.json';
import './09_JobPostingsPage.css';

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [reportModalData, setReportModalData] = useState(null);
  const navigate = useNavigate();
  const { language, startBgMusic } = useAuth();
  const isRTL = language === 'ar';

  useEffect(() => {
    setIsVisible(true);
    
    const audioEnabled = localStorage.getItem('audioConsent') === 'true' || localStorage.getItem('audio_enabled') === 'true';
    if (audioEnabled && startBgMusic) {
      startBgMusic();
    }
    
    const fetchJobs = async () => {
      try {
        const res = await api.get('/job-postings');
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [startBgMusic]);

  const t = jobPostingsTranslations[language || 'ar'];

  return (
    <div className={`job-postings-page-container ${isVisible ? 'opacity-100' : 'opacity-0'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      
      <main className="job-postings-page-main">
        <div className="job-postings-header">
          <h2 className="job-postings-title">{t.title}</h2>
          <p className="job-postings-subtitle">{t.sub}</p>
        </div>

        {loading ? (
          <div className="job-postings-loading-container">
            <div className="job-postings-loading-spinner"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="job-postings-no-jobs-container">
             <span className="job-postings-no-jobs-icon">📂</span>
             <p className="job-postings-no-jobs-text">{t.noJobs}</p>
          </div>
        ) : (
          <div className="job-postings-grid">
            {jobs.map(job => (
              <div key={job._id} className="job-card">
                <div className="job-card-header">
                  <div className="job-card-icon-container">
                    🏢
                  </div>
                  <span className="job-card-type-badge">
                    {job.jobType || 'Full Time'}
                  </span>
                </div>

                <div className="job-card-body">
                  <div className="job-card-body-content">
                    <div className="flex-1">
                      <h3 className="job-card-title">{job.title}</h3>
                      <p className="job-card-company">{job.companyName || 'Careerak Partner'}</p>

                      <div className="job-card-details">
                        <div className="job-card-detail-item">
                          <span>📍</span> {job.location || 'Remote'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setReportModalData({ type: 'job_post', id: job.id, name: job.title })}
                      className="job-card-report-btn"
                      title={t.report_job}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/apply/${job._id}`)}
                  className="job-card-apply-btn"
                >
                  {t.apply}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <ReportModal
        isOpen={!!reportModalData}
        onClose={() => setReportModalData(null)}
        targetType={reportModalData?.type}
        targetId={reportModalData?.id}
        targetName={reportModalData?.name}
      />
    </div>
  );
}