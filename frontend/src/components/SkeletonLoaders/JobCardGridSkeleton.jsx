import React from 'react';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import './SkeletonLoaders.css';

/**
 * Skeleton loader for Grid view job cards
 * Requirements: 10.1
 */
const JobCardGridSkeleton = () => {
  return (
    <div className="job-card-grid skeleton-card">
      <div className="job-card-header">
        <SkeletonLoader variant="circular" width="48px" height="48px" />
        <div className="job-card-title-section">
          <SkeletonLoader width="70%" height="20px" />
          <SkeletonLoader width="40%" height="14px" className="mt-2" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <SkeletonLoader width="100%" height="14px" />
        <SkeletonLoader width="90%" height="14px" />
        <SkeletonLoader width="60%" height="14px" />
      </div>

      <div className="job-card-details mt-4">
        <SkeletonLoader width="80px" height="12px" />
        <SkeletonLoader width="80px" height="12px" />
        <SkeletonLoader width="80px" height="12px" />
        <SkeletonLoader width="80px" height="12px" />
      </div>

      <div className="job-card-footer mt-auto pt-4">
        <SkeletonLoader width="100px" height="40px" variant="rounded" />
        <div className="flex gap-2">
          <SkeletonLoader width="40px" height="40px" variant="rounded" />
          <SkeletonLoader width="40px" height="40px" variant="rounded" />
        </div>
      </div>
    </div>
  );
};

export default JobCardGridSkeleton;
