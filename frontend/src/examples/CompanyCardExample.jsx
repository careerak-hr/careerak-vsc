import React from 'react';
import CompanyCard from '../components/CompanyCard/CompanyCard';

/**
 * مثال على استخدام مكون CompanyCard
 * 
 * هذا المثال يوضح كيفية استخدام بطاقة معلومات الشركة
 * في صفحة تفاصيل الوظيفة
 */

// مثال 1: استخدام أساسي
function BasicExample() {
  const companyId = '507f1f77bcf86cd799439011';
  const jobId = '507f1f77bcf86cd799439012';

  return (
    <div className="job-detail-page">
      <h1>تفاصيل الوظيفة</h1>
      
      {/* معلومات الوظيفة */}
      <div className="job-info">
        <h2>مطور Full Stack</h2>
        <p>نبحث عن مطور متمرس...</p>
      </div>

      {/* بطاقة معلومات الشركة */}
      <CompanyCard 
        companyId={companyId} 
        jobId={jobId} 
      />
    </div>
  );
}

// مثال 2: مع بيانات من API
function WithAPIExample() {
  const [job, setJob] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchJobDetails();
  }, []);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/jobs/507f1f77bcf86cd799439012`
      );
      const data = await response.json();
      setJob(data.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (!job) {
    return <div>لم يتم العثور على الوظيفة</div>;
  }

  return (
    <div className="job-detail-page">
      <h1>{job.title}</h1>
      <p>{job.description}</p>

      {/* بطاقة معلومات الشركة */}
      <CompanyCard 
        companyId={job.company._id} 
        jobId={job._id} 
      />
    </div>
  );
}

// مثال 3: في قائمة وظائف
function JobListExample() {
  const jobs = [
    {
      _id: '507f1f77bcf86cd799439012',
      title: 'مطور Full Stack',
      company: { _id: '507f1f77bcf86cd799439011' }
    },
    {
      _id: '507f1f77bcf86cd799439013',
      title: 'مصمم UI/UX',
      company: { _id: '507f1f77bcf86cd799439014' }
    }
  ];

  return (
    <div className="job-list">
      {jobs.map(job => (
        <div key={job._id} className="job-item">
          <h3>{job.title}</h3>
          
          {/* بطاقة معلومات الشركة */}
          <CompanyCard 
            companyId={job.company._id} 
            jobId={job._id} 
          />
        </div>
      ))}
    </div>
  );
}

// مثال 4: مع معالجة الأخطاء
function WithErrorHandlingExample() {
  const [error, setError] = React.useState(null);

  const handleError = (err) => {
    setError(err.message);
    console.error('Company card error:', err);
  };

  return (
    <div className="job-detail-page">
      <h1>تفاصيل الوظيفة</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* بطاقة معلومات الشركة */}
      <CompanyCard 
        companyId="507f1f77bcf86cd799439011" 
        jobId="507f1f77bcf86cd799439012"
      />
    </div>
  );
}

// مثال 5: مع تخصيص CSS
function CustomStyledExample() {
  return (
    <div className="job-detail-page">
      <h1>تفاصيل الوظيفة</h1>

      {/* بطاقة معلومات الشركة مع تخصيص */}
      <div className="custom-company-card-wrapper">
        <CompanyCard 
          companyId="507f1f77bcf86cd799439011" 
          jobId="507f1f77bcf86cd799439012"
        />
      </div>

      <style jsx>{`
        .custom-company-card-wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .custom-company-card-wrapper .company-card {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

// مثال 6: مع Lazy Loading
function LazyLoadingExample() {
  const [showCard, setShowCard] = React.useState(false);

  React.useEffect(() => {
    // تحميل البطاقة بعد 1 ثانية
    const timer = setTimeout(() => {
      setShowCard(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="job-detail-page">
      <h1>تفاصيل الوظيفة</h1>

      {showCard ? (
        <CompanyCard 
          companyId="507f1f77bcf86cd799439011" 
          jobId="507f1f77bcf86cd799439012"
        />
      ) : (
        <div className="loading-placeholder">
          جاري تحميل معلومات الشركة...
        </div>
      )}
    </div>
  );
}

// مثال 7: مع Modal
function ModalExample() {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div className="job-detail-page">
      <h1>تفاصيل الوظيفة</h1>

      <button onClick={() => setShowModal(true)}>
        عرض معلومات الشركة
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <CompanyCard 
              companyId="507f1f77bcf86cd799439011" 
              jobId="507f1f77bcf86cd799439012"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #666;
        }
      `}</style>
    </div>
  );
}

// تصدير جميع الأمثلة
export {
  BasicExample,
  WithAPIExample,
  JobListExample,
  WithErrorHandlingExample,
  CustomStyledExample,
  LazyLoadingExample,
  ModalExample
};

// المثال الافتراضي
export default BasicExample;
