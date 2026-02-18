import React from 'react';

/**
 * Skeleton loader for Course Listings Page
 * Matches the layout of course cards in a grid
 */
export const CourseListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          {/* Course Image */}
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
          
          {/* Course Content */}
          <div className="p-4 space-y-3">
            {/* Category Badge */}
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            
            {/* Course Title */}
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
            
            {/* Instructor */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            
            {/* Rating and Students */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            
            {/* Price and Duration */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseListSkeleton;
