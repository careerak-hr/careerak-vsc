import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import { useAnimation } from '../../context/AnimationContext';

/**
 * ProfileSkeleton Component
 * 
 * Skeleton loader for profile page that matches the ProfilePage layout.
 * 
 * Features:
 * - Matches exact layout of profile page
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
 * Profile Page Structure:
 * - Profile header (avatar, name, bio)
 * - Stats section (3 stat cards)
 * - Content sections (about, experience, etc.)
 * - Skills/Tags section
 * - Action buttons
 * 
 * @example
 * // Basic usage
 * <ProfileSkeleton />
 * 
 * @example
 * // With custom className
 * <ProfileSkeleton className="custom-class" />
 */
export const ProfileSkeleton = ({ className = '' }) => {
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

  return (
    <motion.div 
      className={`max-w-4xl mx-auto p-4 space-y-6 ${className}`.trim()}
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="status"
      aria-busy="true"
      aria-label="Loading profile"
    >
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Avatar */}
          <SkeletonLoader 
            variant="circle" 
            width="96px" 
            height="96px" 
            className="flex-shrink-0"
            ariaLabel="Loading profile picture"
          />
          
          {/* Name and Bio */}
          <div className="flex-1 space-y-3">
            <SkeletonLoader 
              width="33%" 
              height="24px" 
              ariaLabel="Loading user name"
            />
            <SkeletonLoader 
              width="50%" 
              height="16px" 
              ariaLabel="Loading user title"
            />
            <SkeletonLoader 
              width="66%" 
              height="16px" 
              ariaLabel="Loading user bio"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md space-y-2"
          >
            <SkeletonLoader 
              width="100%" 
              height="32px" 
              ariaLabel={`Loading stat ${i} value`}
            />
            <SkeletonLoader 
              width="66%" 
              height="16px" 
              ariaLabel={`Loading stat ${i} label`}
            />
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
        <SkeletonLoader 
          width="25%" 
          height="24px" 
          className="mb-4"
          ariaLabel="Loading section title"
        />
        <div className="space-y-2">
          <SkeletonLoader 
            width="100%" 
            height="16px" 
            ariaLabel="Loading content line 1"
          />
          <SkeletonLoader 
            width="100%" 
            height="16px" 
            ariaLabel="Loading content line 2"
          />
          <SkeletonLoader 
            width="83%" 
            height="16px" 
            ariaLabel="Loading content line 3"
          />
        </div>
      </div>

      {/* Skills/Tags Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4">
        <SkeletonLoader 
          width="25%" 
          height="24px" 
          className="mb-4"
          ariaLabel="Loading skills section title"
        />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonLoader 
              key={i}
              variant="pill" 
              width="80px" 
              height="32px" 
              ariaLabel={`Loading skill ${i}`}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex flex-wrap gap-4">
          <SkeletonLoader 
            variant="rounded" 
            width="140px" 
            height="40px" 
            ariaLabel="Loading action button 1"
          />
          <SkeletonLoader 
            variant="rounded" 
            width="120px" 
            height="40px" 
            ariaLabel="Loading action button 2"
          />
        </div>
      </div>
    </motion.div>
  );
};

ProfileSkeleton.propTypes = {
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ProfileSkeleton;
