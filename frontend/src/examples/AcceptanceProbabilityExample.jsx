/**
 * Acceptance Probability Usage Examples
 * 
 * أمثلة استخدام مكون احتمالية القبول
 */

import React from 'react';
import AcceptanceProbability from '../components/AcceptanceProbability/AcceptanceProbability';
import { 
  useAcceptanceProbability, 
  useBulkAcceptanceProbabilities,
  useAllJobsProbabilities 
} from '../hooks/useAcceptanceProbability';

/**
 * مثال 1: عرض احتمالية القبول لوظيفة واحدة (عرض كامل)
 */
export const SingleJobProbabilityExample = ({ jobId }) => {
  const { probability, loading, error } = useAcceptanceProbability(jobId);

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (error) {
    return <div>خطأ: {error}</div>;
  }

  if (!probability) {
    return null;
  }

  return (
    <div className="job-detail-page">
      <h1>تفاصيل الوظيفة</h1>
      
      {/* معلومات الوظيفة الأخرى... */}
      
      {/* احتمالية القبول */}
      <AcceptanceProbability
        probability={probability.probability}
        level={probability.level}
        factors={probability.factors}
        matchScore={probability.matchScore}
        details={probability.details}
        compact={false}
      />
    </div>
  );
};

/**
 * مثال 2: عرض احتمالية القبول في بطاقة الوظيفة (عرض مضغوط)
 */
export const JobCardWithProbabilityExample = ({ job }) => {
  const { probability, loading } = useAcceptanceProbability(job._id);

  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company.name}</p>
      <p>{job.location}</p>
      
      {/* احتمالية القبول المضغوطة */}
      {!loading && probability && (
        <AcceptanceProbability
          probability={probability.probability}
          level={probability.level}
          compact={true}
        />
      )}
      
      <button>عرض التفاصيل</button>
    </div>
  );
};

/**
 * مثال 3: عرض احتمالية القبول لعدة وظائف
 */
export const JobListWithProbabilitiesExample = ({ jobs }) => {
  const jobIds = jobs.map(job => job._id);
  const { probabilities, loading } = useBulkAcceptanceProbabilities(jobIds);

  // دمج البيانات
  const jobsWithProbabilities = jobs.map(job => {
    const prob = probabilities.find(p => p.jobId === job._id);
    return { ...job, probability: prob };
  });

  return (
    <div className="job-list">
      <h2>الوظائف المتاحة</h2>
      
      {loading && <div>جاري التحميل...</div>}
      
      <div className="jobs-grid">
        {jobsWithProbabilities.map(job => (
          <div key={job._id} className="job-card">
            <h3>{job.title}</h3>
            <p>{job.company.name}</p>
            
            {job.probability && (
              <AcceptanceProbability
                probability={job.probability.probability}
                level={job.probability.level}
                compact={true}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * مثال 4: صفحة كاملة مع pagination
 */
export const AllJobsWithProbabilitiesExample = () => {
  const [page, setPage] = React.useState(1);
  const { jobs, pagination, loading, error } = useAllJobsProbabilities({ 
    page, 
    limit: 20 
  });

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (error) {
    return <div>خطأ: {error}</div>;
  }

  return (
    <div className="jobs-page">
      <h1>جميع الوظائف مع احتمالية القبول</h1>
      
      <div className="jobs-grid">
        {jobs.map(item => (
          <div key={item.jobId} className="job-card">
            <h3>{item.job.title}</h3>
            <p>{item.job.company.name}</p>
            <p>{item.job.location}</p>
            
            <AcceptanceProbability
              probability={item.probability}
              level={item.level}
              compact={true}
            />
            
            <button>عرض التفاصيل</button>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="pagination">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            السابق
          </button>
          
          <span>صفحة {page} من {pagination.pages}</span>
          
          <button 
            disabled={page === pagination.pages}
            onClick={() => setPage(page + 1)}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * مثال 5: فلترة الوظائف حسب احتمالية القبول
 */
export const FilteredJobsByProbabilityExample = () => {
  const [filter, setFilter] = React.useState('all'); // all, high, medium, low
  const { jobs, loading } = useAllJobsProbabilities({ limit: 100 });

  const filteredJobs = React.useMemo(() => {
    if (filter === 'all') return jobs;
    return jobs.filter(item => item.level === filter);
  }, [jobs, filter]);

  return (
    <div className="filtered-jobs-page">
      <h1>الوظائف المناسبة لك</h1>
      
      {/* الفلاتر */}
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          الكل ({jobs.length})
        </button>
        <button 
          className={filter === 'high' ? 'active' : ''}
          onClick={() => setFilter('high')}
        >
          احتمالية عالية ({jobs.filter(j => j.level === 'high').length})
        </button>
        <button 
          className={filter === 'medium' ? 'active' : ''}
          onClick={() => setFilter('medium')}
        >
          احتمالية متوسطة ({jobs.filter(j => j.level === 'medium').length})
        </button>
        <button 
          className={filter === 'low' ? 'active' : ''}
          onClick={() => setFilter('low')}
        >
          احتمالية منخفضة ({jobs.filter(j => j.level === 'low').length})
        </button>
      </div>
      
      {/* النتائج */}
      {loading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(item => (
            <div key={item.jobId} className="job-card">
              <h3>{item.job.title}</h3>
              <p>{item.job.company.name}</p>
              
              <AcceptanceProbability
                probability={item.probability}
                level={item.level}
                factors={item.factors}
                compact={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * مثال 6: Badge بسيط في قائمة الوظائف
 */
export const SimpleProbabilityBadge = ({ jobId }) => {
  const { probability, loading } = useAcceptanceProbability(jobId);

  if (loading || !probability) return null;

  const getColor = (level) => {
    switch (level) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <span 
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        color: 'white',
        backgroundColor: getColor(probability.level)
      }}
    >
      {probability.probability}% احتمالية
    </span>
  );
};

export default {
  SingleJobProbabilityExample,
  JobCardWithProbabilityExample,
  JobListWithProbabilitiesExample,
  AllJobsWithProbabilitiesExample,
  FilteredJobsByProbabilityExample,
  SimpleProbabilityBadge
};
