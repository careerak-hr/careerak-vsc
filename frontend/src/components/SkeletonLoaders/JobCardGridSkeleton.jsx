import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loader for Job Card in Grid View
 * Matches the layout of job cards in a grid (3 columns on desktop, 2 on tablet, 1 on mobile)
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-4: Display 6-9 skeletons during loading
 * - FR-LOAD-7: Apply smooth transitions (300ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 * 
 * @param {number} count - Number of skeleton cards to display (default: 9)
 */
const JobCardGridSkeleton = ({ count = 9 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse relative overflow-hidden"
          role="status"
          aria-busy="true"
          aria-label="Loading job card"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 skeleton-shimmer pointer-events-none" />
          
          {/* Company Logo and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
          </div>

          {/* Footer with Salary and Button */}
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8" />
          </div>
        </div>
      ))}
    </div>
  );
};

JobCardGridSkeleton.propTypes = {
  /** Number of skeleton cards to display */
  count: PropTypes.number,
};

export default JobCardGridSkeleton;
