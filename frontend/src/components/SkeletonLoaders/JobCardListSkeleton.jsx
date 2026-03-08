import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import './SkeletonLoaders.css';

/**
 * Skeleton loader for List view job cards
 * Requirements: 10.1
 */
const JobCardListSkeleton = () => {
  return (
    <div className="job-card-list skeleton-card">
      <div className="job-card-list-logo">
        <SkeletonLoader variant="rounded" width="64px" height="64px" />
      </div>

      <div className="job-card-list-content flex-1 ml-4">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <SkeletonLoader width="40%" height="24px" />
            <SkeletonLoader width="25%" height="16px" className="mt-2" />
          </div>
          <div className="flex gap-2">
            <SkeletonLoader width="60px" height="24px" variant="rounded" />
            <SkeletonLoader width="60px" height="24px" variant="rounded" />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <SkeletonLoader width="90%" height="14px" />
          <SkeletonLoader width="80%" height="14px" />
        </div>

        <div className="job-card-list-details mt-3 flex flex-wrap gap-4">
          <SkeletonLoader width="80px" height="12px" />
          <SkeletonLoader width="80px" height="12px" />
          <SkeletonLoader width="80px" height="12px" />
          <SkeletonLoader width="80px" height="12px" />
        </div>
      </div>

      <div className="job-card-list-actions min-w-[140px] ml-4">
        <SkeletonLoader width="100%" height="40px" variant="rounded" />
        <div className="flex gap-2 mt-3 justify-center">
          <SkeletonLoader width="40px" height="40px" variant="rounded" />
          <SkeletonLoader width="40px" height="40px" variant="rounded" />
        </div>
      </div>
    </div>
  );
};

export default JobCardListSkeleton;
