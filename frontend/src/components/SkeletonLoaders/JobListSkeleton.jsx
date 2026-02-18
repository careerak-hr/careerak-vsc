import React from 'react';

/**
 * Skeleton loader for Job Listings Page
 * Matches the layout of job cards in a list
 */
export const JobListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            {/* Company Logo */}
            <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
              
              {/* Job Title and Company */}
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            
            {/* Bookmark Icon */}
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Job Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            ))}
          </div>

          {/* Footer with Date and Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobListSkeleton;
