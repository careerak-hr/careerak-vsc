import React from 'react';

/**
 * Skeleton loader for Profile Page
 * Matches the layout of user profile with avatar, bio, and stats
 */
export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex items-center space-x-4 rtl:space-x-reverse animate-pulse">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
          
          {/* Name and Bio */}
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>

      {/* Skills/Tags Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
