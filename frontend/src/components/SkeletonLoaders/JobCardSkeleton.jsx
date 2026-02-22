import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import { useAnimation } from '../../context/AnimationContext';

/**
 * JobCardSkeleton Component
 * 
 * Skeleton loader for job cards that matches the JobPostingsPage job card layout.
 * 
 * Features:
 * - Matches exact layout of job cards
 * - Pulse animation
 * - 200ms fade transition
 * - Dark mode support
 * - Responsive design
 * - RTL support
 * - Prevents layout shifts
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-5: Display skeleton cards matching list item layout
 * - FR-LOAD-7: Apply smooth transitions (200ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 * - NFR-PERF-5: CLS < 0.1
 * 
 * Job Card Structure:
 * - Title (h3)
 * - Company name
 * - Location
 * - Salary
 * - Apply button
 * 
 * @example
 * // Single skeleton
 * <JobCardSkeleton />
 * 
 * @example
 * // Multiple skeletons
 * {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
 * 
 * @example
 * // With custom count
 * <JobCardSkeleton count={5} />
 */
const JobCardSkeleton = ({ count = 1, className = '' }) => {
  const { shouldAnimate } = useAnimation();

  // Fade animation variants (200ms)
  const fadeVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 }
  };

  // Render multiple skeletons if count > 1
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }, (_, i) => (
          <JobCardSkeleton key={i} className={className} />
        ))}
      </>
    );
  }

  return (
    <motion.div
      className={`job-card-skeleton bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4 ${className}`.trim()}
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="status"
      aria-busy="true"
      aria-label="Loading job posting"
    >
      {/* Title */}
      <div className="space-y-2">
        <SkeletonLoader 
          width="70%" 
          height="28px" 
          ariaLabel="Loading job title"
        />
      </div>

      {/* Job Details (Company, Location, Salary) */}
      <div className="job-details space-y-3">
        {/* Company */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <SkeletonLoader 
            width="80px" 
            height="16px" 
            ariaLabel="Loading company label"
          />
          <SkeletonLoader 
            width="150px" 
            height="16px" 
            ariaLabel="Loading company name"
          />
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <SkeletonLoader 
            width="70px" 
            height="16px" 
            ariaLabel="Loading location label"
          />
          <SkeletonLoader 
            width="120px" 
            height="16px" 
            ariaLabel="Loading location"
          />
        </div>

        {/* Salary */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <SkeletonLoader 
            width="60px" 
            height="16px" 
            ariaLabel="Loading salary label"
          />
          <SkeletonLoader 
            width="180px" 
            height="16px" 
            ariaLabel="Loading salary range"
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-4">
        <SkeletonLoader 
          variant="rounded" 
          width="120px" 
          height="40px" 
          ariaLabel="Loading apply button"
        />
      </div>
    </motion.div>
  );
};

JobCardSkeleton.propTypes = {
  /** Number of skeleton cards to render */
  count: PropTypes.number,
  
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default JobCardSkeleton;
