import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import './ApplicantCounter.css';

/**
 * ApplicantCounter Component
 * عرض عداد المتقدمين للوظيفة (إذا سمحت الشركة)
 * Requirements: 9.2 (عداد المتقدمين)
 */
const ApplicantCounter = ({ jobId, inline = false }) => {
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchApplicantCount = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/job-postings/${jobId}/applicant-count`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch applicant count');
        }

        const result = await response.json();
        
        if (result.success) {
          setApplicantData(result.data);
        }
      } catch (err) {
        console.error('Error fetching applicant count:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantCount();
  }, [jobId]);

  // إذا كان التحميل جارياً
  if (loading) {
    return (
      <div className={`applicant-counter ${inline ? 'inline' : ''} loading`}>
        <div className="skeleton-counter"></div>
      </div>
    );
  }

  // إذا حدث خطأ أو البيانات غير متاحة
  if (error || !applicantData) {
    return null;
  }

  // إذا كانت الشركة لا تريد إظهار العدد
  if (!applicantData.visible) {
    return null;
  }

  const count = applicantData.applicantCount || 0;

  // تحديد النص المناسب حسب العدد
  const getApplicantText = (count) => {
    if (count === 0) return 'لا يوجد متقدمين بعد';
    if (count === 1) return 'متقدم واحد';
    if (count === 2) return 'متقدمان';
    if (count >= 3 && count <= 10) return `${count} متقدمين`;
    return `${count} متقدم`;
  };

  // تحديد اللون حسب العدد
  const getCountClass = (count) => {
    if (count === 0) return 'zero';
    if (count < 5) return 'low';
    if (count < 20) return 'medium';
    return 'high';
  };

  return (
    <div className={`applicant-counter ${inline ? 'inline' : ''} ${getCountClass(count)}`}>
      <Users className="counter-icon" size={inline ? 16 : 20} />
      <span className="counter-text">{getApplicantText(count)}</span>
    </div>
  );
};

export default ApplicantCounter;
