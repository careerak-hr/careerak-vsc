import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import ShareButton from '../ShareButton/ShareButton';
import './JobCard.css';

/**
 * مكون بطاقة الوظيفة - عرض Grid
 * يعرض الوظيفة في شكل بطاقة مع تصميم متجاوب (3-2-1 أعمدة)
 * 
 * @param {Object} props
 * @param {Object} props.job - بيانات الوظيفة
 * @param {Function} props.onBookmark - دالة حفظ الوظيفة
 * @param {Function} props.onShare - دالة مشاركة الوظيفة
 * @param {Function} props.onClick - دالة عند النقر على البطاقة
 * @param {boolean} props.isBookmarked - هل الوظيفة محفوظة
 */
const JobCardGrid = ({ 
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
    <motion.div
      className="job-card-grid"
      onClick={handleCardClick}
      role="article"
      aria-label={`وظيفة ${job.title} في ${job.company?.name}`}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Header - شعار الشركة والعنوان */}
      <div className="job-card-header">
        <div className="company-logo">
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
        
        <div className="job-card-title-section">
          <h3 className="job-card-title">{job.title}</h3>
          <p className="job-card-company">{job.company?.name}</p>
        </div>

        {/* Badges */}
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
      <p className="job-card-description">
        {job.description?.substring(0, 120)}
        {job.description?.length > 120 && '...'}
      </p>

      {/* Details */}
      <div className="job-card-details">
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
      </div>

      {/* Skills */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div className="job-card-skills">
          {job.requiredSkills.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span className="skill-tag skill-tag-more">
              +{job.requiredSkills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer - Actions */}
      <div className="job-card-footer">
        <motion.button
          className="btn-apply"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(job);
          }}
          aria-label={`التقديم على وظيفة ${job.title}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          تقديم
        </motion.button>

        <div className="job-card-actions">
          <BookmarkButton
            jobId={job.id}
            isBookmarked={isBookmarked}
            onToggle={onBookmark}
            size="medium"
            variant="icon"
          />

          <ShareButton
            job={job}
            contentType="job"
            size="medium"
            variant="icon-only"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default JobCardGrid;
