import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCardGrid from '../JobCard/JobCardGrid';
import JobCardList from '../JobCard/JobCardList';
import ViewToggle from '../ViewToggle/ViewToggle';
import JobCardGridSkeleton from '../SkeletonLoaders/JobCardGridSkeleton';
import JobCardListSkeleton from '../SkeletonLoaders/JobCardListSkeleton';
import useViewPreference from '../../hooks/useViewPreference';
import './JobPostings.css';

/**
 * Main container for job postings
 * Requirements: 1.1, 7.4, 7.5
 */
const JobsContainer = () => {
  const { view, setView } = useViewPreference();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/job-postings');
        setJobs(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleBookmark = (jobId) => {
    // Logic for bookmarking will be added in step 3
    console.log('Bookmarking job:', jobId);
  };

  const handleShare = (job) => {
    // Logic for sharing will be added in step 5
    console.log('Sharing job:', job.title);
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>الوظائف المتاحة</h2>
        <ViewToggle view={view} onToggle={setView} />
      </div>

      {loading ? (
        <div className={`jobs-grid ${view === 'grid' ? 'grid-layout' : 'list-layout'}`}>
          {Array(6).fill(0).map((_, index) => (
            view === 'grid' ? <JobCardGridSkeleton key={index} /> : <JobCardListSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className={`jobs-grid ${view === 'grid' ? 'grid-layout' : 'list-layout'}`}>
          {jobs.length > 0 ? (
            jobs.map(job => (
              view === 'grid' ? (
                <JobCardGrid
                  key={job.id || job._id}
                  job={job}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              ) : (
                <JobCardList
                  key={job.id || job._id}
                  job={job}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              )
            ))
          ) : (
            <div className="no-jobs">لا توجد وظائف متاحة حالياً.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsContainer;
