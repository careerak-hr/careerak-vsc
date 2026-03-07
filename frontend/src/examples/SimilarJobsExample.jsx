/**
 * Similar Jobs Section - Usage Example
 * مثال استخدام قسم الوظائف المشابهة
 * 
 * يوضح كيفية استخدام مكون SimilarJobsSection في صفحة تفاصيل الوظيفة
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import SimilarJobsSection from '../components/SimilarJobs/SimilarJobsSection';

/**
 * مثال 1: استخدام أساسي في صفحة تفاصيل الوظيفة
 */
const JobDetailPage = () => {
  const { jobId } = useParams();

  return (
    <div className="job-detail-page">
      {/* محتوى الوظيفة الرئيسي */}
      <div className="job-header">
        <h1>Software Engineer</h1>
        <p>Company Name</p>
      </div>

      <div className="job-description">
        <h2>Job Description</h2>
        <p>Lorem ipsum dolor sit amet...</p>
      </div>

      {/* قسم الوظائف المشابهة */}
      <SimilarJobsSection jobId={jobId} />
    </div>
  );
};

/**
 * مثال 2: استخدام مع عدد مخصص من الوظائف
 */
const JobDetailPageWithCustomLimit = () => {
  const { jobId } = useParams();

  return (
    <div className="job-detail-page">
      {/* محتوى الوظيفة */}
      <div className="job-content">
        {/* ... */}
      </div>

      {/* عرض 4 وظائف مشابهة فقط */}
      <SimilarJobsSection jobId={jobId} limit={4} />
    </div>
  );
};

/**
 * مثال 3: استخدام في Modal
 */
const JobDetailModal = ({ jobId, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <button onClick={onClose}>Close</button>

        {/* محتوى الوظيفة */}
        <div className="job-content">
          {/* ... */}
        </div>

        {/* الوظائف المشابهة */}
        <SimilarJobsSection jobId={jobId} limit={6} />
      </div>
    </div>
  );
};

/**
 * مثال 4: استخدام مع Lazy Loading
 */
const JobDetailPageWithLazyLoading = () => {
  const { jobId } = useParams();
  const [showSimilar, setShowSimilar] = React.useState(false);

  React.useEffect(() => {
    // عرض الوظائف المشابهة بعد 2 ثانية
    const timer = setTimeout(() => {
      setShowSimilar(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="job-detail-page">
      {/* محتوى الوظيفة */}
      <div className="job-content">
        {/* ... */}
      </div>

      {/* عرض الوظائف المشابهة بعد تحميل المحتوى الرئيسي */}
      {showSimilar && <SimilarJobsSection jobId={jobId} />}
    </div>
  );
};

/**
 * مثال 5: استخدام مع Conditional Rendering
 */
const JobDetailPageWithConditional = () => {
  const { jobId } = useParams();
  const [job, setJob] = React.useState(null);

  React.useEffect(() => {
    // جلب تفاصيل الوظيفة
    fetchJobDetails(jobId).then(setJob);
  }, [jobId]);

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="job-detail-page">
      {/* محتوى الوظيفة */}
      <div className="job-content">
        <h1>{job.title}</h1>
        <p>{job.description}</p>
      </div>

      {/* عرض الوظائف المشابهة فقط للوظائف المفتوحة */}
      {job.status === 'Open' && <SimilarJobsSection jobId={jobId} />}
    </div>
  );
};

// Helper function (مثال فقط)
const fetchJobDetails = async (jobId) => {
  const response = await fetch(`/api/job-postings/${jobId}`);
  return response.json();
};

/**
 * ملاحظات الاستخدام:
 * 
 * 1. المكون يتطلب jobId فقط
 * 2. limit اختياري (افتراضي: 6)
 * 3. يدعم RTL/LTR تلقائياً
 * 4. يدعم Dark Mode
 * 5. متجاوب على جميع الأجهزة
 * 6. يحترم prefers-reduced-motion
 * 7. يعمل مع جميع المتصفحات الحديثة
 * 
 * API Endpoint المستخدم:
 * GET /api/job-postings/:id/similar?limit=6
 * 
 * Response Format:
 * {
 *   success: true,
 *   count: 4,
 *   data: [
 *     {
 *       _id: "...",
 *       title: "...",
 *       company: { name: "..." },
 *       location: { city: "...", country: "..." },
 *       salary: { min: 5000, max: 8000 },
 *       skills: ["JavaScript", "React"],
 *       similarityScore: 85
 *     }
 *   ]
 * }
 */

export {
  JobDetailPage,
  JobDetailPageWithCustomLimit,
  JobDetailModal,
  JobDetailPageWithLazyLoading,
  JobDetailPageWithConditional
};
