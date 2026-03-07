import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loader for Job Card in List View
 * Matches the layout of job cards in a list (1 column with more details)
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-4: Display 6-9 skeletons during loading
 * - FR-LOAD-6: Different skeleton for Grid/List views
 * - FR-LOAD-7: Apply smooth transitions (300ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 * 
 * @param {number} count - Number of skeleton cards to display (default: 9)
 */
const JobCardListSkeleton = ({ count = 9 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse"
          role="status"
          aria-busy="true"
          aria-label="Loading job card"
        >
          <div className="flex gap-6">
            {/* Company Logo */}
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
            
            {/* Job Details */}
            <div className="flex-1">
              {/* Title and Company */}
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
              
              {/* Description */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
              </div>
              
              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

JobCardListSkeleton.propTypes = {
  /** Number of skeleton cards to display */
  count: PropTypes.number,
};

export default JobCardListSkeleton;
