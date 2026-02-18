import React from 'react';

/**
 * Skeleton loader for Form Pages
 * Matches the layout of login, auth, and settings forms
 */
export const FormSkeleton = ({ fields = 4, hasTitle = true }) => {
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg animate-pulse">
        {/* Form Title */}
        {hasTitle && (
          <div className="mb-6 space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        )}
        
        {/* Form Fields */}
        <div className="space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              {/* Label */}
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              {/* Input */}
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Submit Button */}
        <div className="mt-6">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        
        {/* Additional Links */}
        <div className="mt-4 flex justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default FormSkeleton;
