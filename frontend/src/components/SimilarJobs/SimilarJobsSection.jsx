import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers } from 'lucide-react';
import JobCardGrid from '../JobCard/JobCardGrid';
import './SimilarJobsSection.css';

/**
 * Section to display similar jobs for a specific job
 * Requirements: 4.1, 4.4, 4.5
 */
const SimilarJobsSection = ({ jobId }) => {
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchSimilarJobs();
    }
  }, [jobId]);

  const fetchSimilarJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/job-postings/${jobId}/similar`);
      setSimilarJobs(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching similar jobs:', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="similar-jobs-loading">جاري تحميل وظائف مشابهة...</div>;
  if (similarJobs.length === 0) return null;

  return (
    <div className="similar-jobs-section">
      <div className="section-header">
        <Layers size={20} className="section-icon" />
        <h3>وظائف مشابهة قد تهمك</h3>
      </div>

      <div className="similar-jobs-carousel">
        {similarJobs.map(job => (
          <div key={job.id || job._id} className="similar-job-item">
            <JobCardGrid job={job} />
            {job.similarityScore && (
              <div className="similarity-badge">
                {job.similarityScore}% تطابق
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarJobsSection;
