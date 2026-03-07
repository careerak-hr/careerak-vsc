import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './ApplicantCountToggle.css';

/**
 * ApplicantCountToggle Component
 * مكون للشركات للتحكم في إظهار/إخفاء عداد المتقدمين
 * Requirements: 9.2 (عداد المتقدمين - إذا سمحت الشركة)
 */
const ApplicantCountToggle = ({ jobId, initialValue = true, onToggle }) => {
  const [showCount, setShowCount] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleToggle = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/job-postings/${jobId}/applicant-count-visibility`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            showApplicantCount: !showCount
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      const result = await response.json();

      if (result.success) {
        setShowCount(result.data.showApplicantCount);
        
        // استدعاء callback إذا كان موجوداً
        if (onToggle) {
          onToggle(result.data.showApplicantCount);
        }
      }
    } catch (err) {
      console.error('Error toggling applicant count visibility:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="applicant-count-toggle">
      <div className="toggle-header">
        <label className="toggle-label">
          {showCount ? (
            <>
              <Eye size={18} />
              <span>عرض عدد المتقدمين للجمهور</span>
            </>
          ) : (
            <>
              <EyeOff size={18} />
              <span>إخفاء عدد المتقدمين عن الجمهور</span>
            </>
          )}
        </label>
        
        <button
          className={`toggle-button ${showCount ? 'active' : ''}`}
          onClick={handleToggle}
          disabled={loading}
          aria-label={showCount ? 'إخفاء العداد' : 'إظهار العداد'}
        >
          <span className="toggle-slider"></span>
        </button>
      </div>

      <p className="toggle-description">
        {showCount
          ? 'الباحثون عن عمل يمكنهم رؤية عدد المتقدمين لهذه الوظيفة'
          : 'عدد المتقدمين مخفي عن الباحثين عن عمل'}
      </p>

      {error && (
        <div className="toggle-error">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
};

export default ApplicantCountToggle;
