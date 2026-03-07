import React from 'react';
import { JobBadges, TimeSincePosted } from '../components/JobBadges';

/**
 * JobBadges Usage Example
 * مثال على استخدام مكونات badges الوظائف
 */

// مثال 1: بطاقة وظيفة في Grid View
function JobCardGrid({ job }) {
  return (
    <div className="job-card-grid">
      {/* Header */}
      <div className="job-card-header">
        <img src={job.company.logo} alt={job.company.name} />
        <div>
          <h3>{job.title}</h3>
          <p>{job.company.name}</p>
        </div>
      </div>
      
      {/* Badges - في الأعلى */}
      <JobBadges job={job} className="mb-3" />
      
      {/* Description */}
      <p className="job-description">{job.description}</p>
      
      {/* Footer */}
      <div className="job-card-footer">
        <TimeSincePosted job={job} />
        <span className="job-location">{job.location.city}</span>
      </div>
    </div>
  );
}

// مثال 2: بطاقة وظيفة في List View
function JobCardList({ job }) {
  return (
    <div className="job-card-list">
      <img src={job.company.logo} alt={job.company.name} />
      
      <div className="job-card-content">
        <div className="job-card-header">
          <h3>{job.title}</h3>
          <JobBadges job={job} />
        </div>
        
        <p className="job-company">{job.company.name}</p>
        <p className="job-description">{job.description}</p>
        
        <div className="job-card-meta">
          <TimeSincePosted job={job} />
          <span className="job-location">{job.location.city}</span>
          <span className="job-type">{job.jobType}</span>
        </div>
      </div>
      
      <div className="job-card-actions">
        <button className="btn-primary">تقديم</button>
        <button className="btn-secondary">حفظ</button>
      </div>
    </div>
  );
}

// مثال 3: صفحة تفاصيل الوظيفة
function JobDetailPage({ job }) {
  return (
    <div className="job-detail-page">
      <div className="job-detail-header">
        <div className="job-detail-title">
          <h1>{job.title}</h1>
          <JobBadges job={job} className="mt-2" />
        </div>
        
        <div className="job-detail-meta">
          <TimeSincePosted job={job} showIcon={true} />
          <span className="separator">•</span>
          <span className="job-location">{job.location.city}</span>
          <span className="separator">•</span>
          <span className="job-applicants">{job.applicantCount} متقدم</span>
        </div>
      </div>
      
      {/* باقي محتوى الصفحة */}
      <div className="job-detail-content">
        {/* ... */}
      </div>
    </div>
  );
}

// مثال 4: قائمة الوظائف مع Badges
function JobsList({ jobs }) {
  return (
    <div className="jobs-list">
      {jobs.map(job => (
        <div key={job._id} className="job-item">
          <div className="job-item-header">
            <h4>{job.title}</h4>
            <JobBadges job={job} />
          </div>
          
          <div className="job-item-meta">
            <span className="job-company">{job.company.name}</span>
            <TimeSincePosted job={job} showIcon={false} />
          </div>
        </div>
      ))}
    </div>
  );
}

// مثال 5: استخدام مع بيانات وهمية
function ExampleWithMockData() {
  const mockJobs = [
    {
      _id: '1',
      title: 'مطور Full Stack',
      company: { name: 'شركة التقنية', logo: '/logo1.png' },
      description: 'نبحث عن مطور متمرس...',
      location: { city: 'الرياض' },
      jobType: 'Full-time',
      applicantCount: 15,
      isNew: true,        // وظيفة جديدة (< 3 أيام)
      isUrgent: false,
      timeSincePosted: {
        ar: 'منذ يومين',
        en: '2 days ago',
        fr: 'Il y a 2 jours'
      }
    },
    {
      _id: '2',
      title: 'مصمم UI/UX',
      company: { name: 'شركة الإبداع', logo: '/logo2.png' },
      description: 'فرصة رائعة للمصممين...',
      location: { city: 'جدة' },
      jobType: 'Full-time',
      applicantCount: 8,
      isNew: false,
      isUrgent: true,     // وظيفة عاجلة (تنتهي خلال 7 أيام)
      timeSincePosted: {
        ar: 'منذ أسبوع',
        en: '1 week ago',
        fr: 'Il y a 1 semaine'
      }
    },
    {
      _id: '3',
      title: 'مدير مشاريع',
      company: { name: 'شركة النجاح', logo: '/logo3.png' },
      description: 'نبحث عن مدير مشاريع خبير...',
      location: { city: 'الدمام' },
      jobType: 'Full-time',
      applicantCount: 25,
      isNew: true,        // جديد
      isUrgent: true,     // وعاجل
      timeSincePosted: {
        ar: 'منذ يوم',
        en: '1 day ago',
        fr: 'Il y a 1 jour'
      }
    }
  ];
  
  return (
    <div className="example-container">
      <h2>أمثلة على استخدام Job Badges</h2>
      
      <section>
        <h3>Grid View</h3>
        <div className="grid grid-cols-3 gap-6">
          {mockJobs.map(job => (
            <JobCardGrid key={job._id} job={job} />
          ))}
        </div>
      </section>
      
      <section>
        <h3>List View</h3>
        <div className="space-y-4">
          {mockJobs.map(job => (
            <JobCardList key={job._id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ExampleWithMockData;
export { JobCardGrid, JobCardList, JobDetailPage, JobsList };
