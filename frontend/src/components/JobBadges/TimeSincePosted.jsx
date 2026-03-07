import React from 'react';
import { useApp } from '../../context/AppContext';
import './TimeSincePosted.css';

/**
 * TimeSincePosted Component
 * عرض الوقت منذ نشر الوظيفة
 */
const TimeSincePosted = ({ job, className = '', showIcon = true }) => {
  const { language } = useApp();
  
  if (!job || !job.timeSincePosted) return null;
  
  const timeText = job.timeSincePosted[language] || job.timeSincePosted.ar;
  
  return (
    <div className={`time-since-posted ${className}`}>
      {showIcon && (
        <span className="time-since-posted-icon">🕒</span>
      )}
      <span className="time-since-posted-text">{timeText}</span>
    </div>
  );
};

export default TimeSincePosted;
