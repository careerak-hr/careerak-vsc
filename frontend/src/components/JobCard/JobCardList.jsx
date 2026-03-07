import React from 'react';
import { MapPin, Briefcase, DollarSign, Clock, Users, TrendingUp } from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import ShareButton from '../JobShare/ShareButton';
import './JobCard.css';

/**
 * مكون بطاقة الوظيفة - عرض List
 * يعرض الوظيفة في شكل صف مع تفاصيل أكثر
 * 
 * @param {Object} props
 * @param {Object} props.job - بيانات الوظيفة
 * @param {Function} props.onBookmark - دالة حفظ الوظيفة
 * @param {Function} props.onShare - دالة مشاركة الوظيفة
 * @param {Function} props.onClick - دالة عند النقر على البطاقة
 * @param {boolean} props.isBookmarked - هل الوظيفة محفوظة
 */
const JobCardList = ({ 
  job, 
  onBookmark, 
  onShare, 
  onClick,
  isBookmarked = false 
}) => {
  // حساب الوقت منذ النشر
  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'اليوم';
    if (diffInDays === 1) return 'أمس';
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسابيع`;
    return `منذ ${Math.floor(diffInDays / 30)} أشهر`;
  };

  // تنسيق الراتب
  const formatSalary = (salary) => {
    if (!salary) return 'غير محدد';
    return `${salary.toLocaleString('ar-SA')} ريال`;
  };

  const handleCardClick = () => {
    onClick?.(job);
  };

  return (
    <div 
      className="job-card-list"
      onClick={handleCardClick}
      role="article"
      aria-label={`وظيفة ${job.title} في ${job.company?.name}`}
    >
      {/* Right Section - Logo */}
      <div className="job-card-list-logo">
        {job.company?.logo ? (
          <img 
            src={job.company.logo} 
            alt={job.company.name}
            loading="lazy"
          />
        ) : (
          <div className="company-logo-placeholder">
            {job.company?.name?.charAt(0) || 'ش'}
          </div>
        )}
      </div>

      {/* Middle Section - Content */}
      <div className="job-card-list-content">
        {/* Title and Badges */}
        <div className="job-card-list-header">
          <div>
            <h3 className="job-card-list-title">{job.title}</h3>
            <p className="job-card-list-company">{job.company?.name}</p>
          </div>
          
          <div className="job-card-badges">
            {job.isUrgent && (
              <span className="badge badge-urgent">عاجل</span>
            )}
            {job.isNew && (
              <span className="badge badge-new">جديد</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="job-card-list-description">
          {job.description?.substring(0, 200)}
          {job.description?.length > 200 && '...'}
        </p>

        {/* Details Grid */}
        <div className="job-card-list-details">
          <div className="job-card-detail">
            <MapPin size={16} />
            <span>{job.location?.city || 'غير محدد'}</span>
          </div>
          
          <div className="job-card-detail">
            <Briefcase size={16} />
            <span>{job.type || 'دوام كامل'}</span>
          </div>
          
          <div className="job-card-detail">
            <DollarSign size={16} />
            <span>{formatSalary(job.salary)}</span>
          </div>
          
          <div className="job-card-detail">
            <Clock size={16} />
            <span>{getTimeAgo(job.createdAt)}</span>
          </div>

          {/* Additional Info */}
          {job.applicantCount !== undefined && (
            <div className="job-card-detail">
              <Users size={16} />
              <span>{job.applicantCount} متقدم</span>
            </div>
          )}

          {job.matchPercentage !== undefined && (
            <div className="job-card-detail job-card-match">
              <TrendingUp size={16} />
              <span className="match-percentage">{job.matchPercentage}% تطابق</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="job-card-skills">
            {job.requiredSkills.slice(0, 5).map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 5 && (
              <span className="skill-tag skill-tag-more">
                +{job.requiredSkills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Left Section - Actions */}
      <div className="job-card-list-actions">
        <button
          className="btn-apply btn-apply-list"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(job);
          }}
          aria-label={`التقديم على وظيفة ${job.title}`}
        >
          تقديم
        </button>

        <div className="job-card-actions-row">
          <BookmarkButton
            jobId={job.id}
            isBookmarked={isBookmarked}
            onToggle={onBookmark}
            size="medium"
            variant="icon"
          />

          <ShareButton
            job={job}
            size="medium"
            variant="icon"
            onShare={onShare}
          />
        </div>
      </div>
    </div>
  );
};

export default JobCardList;
