import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * مثال على عرض إشعار تنبيه مع روابط مباشرة للوظائف
 * 
 * هذا المكون يوضح كيفية عرض إشعارات التنبيهات التي تحتوي على روابط مباشرة للوظائف
 */

const AlertNotificationWithLinks = ({ notification }) => {
  const navigate = useNavigate();
  const { language } = useApp();

  // استخراج البيانات من الإشعار
  const { title, message, relatedData, createdAt } = notification;
  const { jobLinks, searchName } = relatedData || {};

  // دالة للانتقال إلى صفحة الوظيفة
  const handleJobClick = (jobUrl) => {
    navigate(jobUrl);
  };

  // تنسيق التاريخ
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="alert-notification-card" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* رأس الإشعار */}
      <div className="notification-header">
        <div className="notification-icon">
          <span className="icon">🎯</span>
        </div>
        <div className="notification-info">
          <h3 className="notification-title">{title}</h3>
          <p className="notification-message">{message}</p>
          <span className="notification-time">{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* قائمة الوظائف مع الروابط */}
      {jobLinks && jobLinks.length > 0 && (
        <div className="job-links-container">
          <h4 className="job-links-title">
            {language === 'ar' ? 'الوظائف المتاحة:' : 'Available Jobs:'}
          </h4>
          
          <div className="job-links-list">
            {jobLinks.map((job, index) => (
              <div 
                key={job.jobId} 
                className="job-link-item"
                onClick={() => handleJobClick(job.jobUrl)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleJobClick(job.jobUrl);
                }}
              >
                <div className="job-number">{index + 1}</div>
                <div className="job-details">
                  <h5 className="job-title">{job.jobTitle}</h5>
                  <div className="job-meta">
                    <span className="job-company">
                      <span className="icon">🏢</span>
                      {job.company}
                    </span>
                    <span className="job-location">
                      <span className="icon">📍</span>
                      {job.location}
                    </span>
                  </div>
                </div>
                <div className="job-arrow">
                  {language === 'ar' ? '←' : '→'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* معلومات البحث المحفوظ */}
      {searchName && (
        <div className="search-info">
          <span className="search-label">
            {language === 'ar' ? 'البحث المحفوظ:' : 'Saved Search:'}
          </span>
          <span className="search-name">{searchName}</span>
        </div>
      )}
    </div>
  );
};

/**
 * مثال على استخدام المكون
 */
const AlertNotificationExample = () => {
  // مثال على بيانات إشعار من Backend
  const sampleNotification = {
    _id: 'notif123',
    recipient: 'user123',
    type: 'job_match',
    title: 'وظائف جديدة تطابق بحثك',
    message: 'تم العثور على 3 وظائف جديدة تطابق "مطور JavaScript"',
    relatedData: {
      savedSearchId: 'search123',
      searchName: 'مطور JavaScript',
      jobPostings: ['job1', 'job2', 'job3'],
      jobLinks: [
        {
          jobId: 'job1',
          jobTitle: 'مطور Frontend - React',
          jobUrl: '/job-postings/job1',
          company: 'شركة التقنية المتقدمة',
          location: 'القاهرة، مصر'
        },
        {
          jobId: 'job2',
          jobTitle: 'مطور Full Stack - MERN',
          jobUrl: '/job-postings/job2',
          company: 'شركة الابتكار الرقمي',
          location: 'دبي، الإمارات'
        },
        {
          jobId: 'job3',
          jobTitle: 'مطور Backend - Node.js',
          jobUrl: '/job-postings/job3',
          company: 'شركة الحلول الذكية',
          location: 'الرياض، السعودية'
        }
      ]
    },
    priority: 'high',
    isRead: false,
    createdAt: new Date().toISOString()
  };

  return (
    <div className="example-container">
      <h2>مثال على إشعار التنبيه مع الروابط المباشرة</h2>
      <AlertNotificationWithLinks notification={sampleNotification} />
    </div>
  );
};

/**
 * CSS للمكون (يمكن نقله إلى ملف CSS منفصل)
 */
const styles = `
.alert-notification-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  border-left: 4px solid #D48161;
}

.notification-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-icon .icon {
  font-size: 32px;
}

.notification-info {
  flex: 1;
}

.notification-title {
  font-size: 18px;
  font-weight: 600;
  color: #304B60;
  margin: 0 0 8px 0;
}

.notification-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.job-links-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E3DAD1;
}

.job-links-title {
  font-size: 16px;
  font-weight: 600;
  color: #304B60;
  margin: 0 0 16px 0;
}

.job-links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F9F9F9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.job-link-item:hover {
  background: #E3DAD1;
  transform: translateX(-4px);
}

.job-link-item:focus {
  outline: 2px solid #D48161;
  outline-offset: 2px;
}

.job-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #D48161;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 14px;
}

.job-details {
  flex: 1;
}

.job-title {
  font-size: 15px;
  font-weight: 600;
  color: #304B60;
  margin: 0 0 8px 0;
}

.job-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.job-meta .icon {
  margin-right: 4px;
}

.job-arrow {
  flex-shrink: 0;
  font-size: 20px;
  color: #D48161;
}

.search-info {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E3DAD1;
  font-size: 14px;
  color: #666;
}

.search-label {
  font-weight: 600;
  margin-right: 8px;
}

.search-name {
  color: #D48161;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 640px) {
  .alert-notification-card {
    padding: 16px;
  }

  .notification-header {
    gap: 12px;
  }

  .notification-icon .icon {
    font-size: 24px;
  }

  .notification-title {
    font-size: 16px;
  }

  .job-meta {
    flex-direction: column;
    gap: 4px;
  }

  .job-link-item:hover {
    transform: translateX(-2px);
  }
}

/* RTL Support */
[dir="rtl"] .job-link-item:hover {
  transform: translateX(4px);
}

[dir="rtl"] .job-meta .icon {
  margin-right: 0;
  margin-left: 4px;
}

[dir="rtl"] .search-label {
  margin-right: 0;
  margin-left: 8px;
}

@media (max-width: 640px) {
  [dir="rtl"] .job-link-item:hover {
    transform: translateX(2px);
  }
}
`;

// إضافة الأنماط إلى الصفحة
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default AlertNotificationExample;
export { AlertNotificationWithLinks };
