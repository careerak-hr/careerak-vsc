import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import { useAnimation } from '../../context/AnimationContext';

/**
 * CourseCardSkeleton Component
 * 
 * Skeleton loader for course cards that matches the CoursesPage course card layout.
 * 
 * Features:
 * - Matches exact layout of course cards
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
 * Course Card Structure:
 * - Title (h3)
 * - Instructor name
 * - Duration
 * - Price
 * - Enroll button
 * 
 * @example
 * // Single skeleton
 * <CourseCardSkeleton />
 * 
 * @example
 * // Multiple skeletons
 * {[1, 2, 3].map(i => <CourseCardSkeleton key={i} />)}
 * 
 * @example
 * // With custom count
 * <CourseCardSkeleton count={6} />
 */
const CourseCardSkeleton = ({ count = 1, className = '' }) => {
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
          <CourseCardSkeleton key={i} className={className} />
        ))}
      </>
    );
  }

  return (
    <motion.div
      className={`course-card-skeleton bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4 ${className}`.trim()}
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="status"
      aria-busy="true"
      aria-label="Loading course"
    >
      {/* Title */}
      <div className="space-y-2">
        <SkeletonLoader 
          width="85%" 
          height="28px" 
          ariaLabel="Loading course title"
        />
      </div>

      {/* Course Details (Instructor, Duration, Price) */}
      <div className="course-details space-y-3">
        {/* Instructor */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <SkeletonLoader 
            width="90px" 
            height="16px" 
            ariaLabel="Loading instructor label"
          />
          <SkeletonLoader 
            width="140px" 
            height="16px" 
            ariaLabel="Loading instructor name"
          />
        </div>

        {/* Duration */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <SkeletonLoader 
            width="80px" 
            height="16px" 
            ariaLabel="Loading duration label"
          />
          <SkeletonLoader 
            width="100px" 
            height="16px" 
            ariaLabel="Loading duration"
          />
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <SkeletonLoader 
            width="50px" 
            height="16px" 
            ariaLabel="Loading price label"
          />
          <SkeletonLoader 
            width="80px" 
            height="16px" 
            ariaLabel="Loading price"
          />
        </div>
      </div>

      {/* Enroll Button */}
      <div className="mt-4">
        <SkeletonLoader 
          variant="rounded" 
          width="100%" 
          height="40px" 
          ariaLabel="Loading enroll button"
        />
      </div>
    </motion.div>
  );
};

CourseCardSkeleton.propTypes = {
  /** Number of skeleton cards to render */
  count: PropTypes.number,
  
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default CourseCardSkeleton;
