import React from 'react';
import SkeletonLoader from './SkeletonLoader';

/**
 * SkeletonLoader Usage Examples
 * 
 * This file demonstrates various use cases for the base SkeletonLoader component.
 * Use these patterns to create custom skeleton loaders for your components.
 */

const SkeletonLoaderExamples = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        SkeletonLoader Examples
      </h1>

      {/* Basic Shapes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Basic Shapes
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rectangle (default)</p>
            <SkeletonLoader width="300px" height="20px" />
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Circle (avatar)</p>
            <SkeletonLoader variant="circle" width="64px" height="64px" />
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rounded (button)</p>
            <SkeletonLoader variant="rounded" width="120px" height="40px" />
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pill (tag)</p>
            <SkeletonLoader variant="pill" width="80px" height="28px" />
          </div>
        </div>
      </section>

      {/* Text Lines */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Text Lines
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-3">
          <SkeletonLoader width="100%" height="16px" />
          <SkeletonLoader width="100%" height="16px" />
          <SkeletonLoader width="80%" height="16px" />
        </div>
      </section>

      {/* Card Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Card Layout
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
          {/* Header with avatar and title */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <SkeletonLoader variant="circle" width="48px" height="48px" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader width="60%" height="20px" />
              <SkeletonLoader width="40%" height="16px" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <SkeletonLoader width="100%" height="16px" />
            <SkeletonLoader width="100%" height="16px" />
            <SkeletonLoader width="90%" height="16px" />
          </div>
          
          {/* Tags */}
          <div className="flex gap-2">
            <SkeletonLoader variant="pill" width="60px" height="24px" />
            <SkeletonLoader variant="pill" width="80px" height="24px" />
            <SkeletonLoader variant="pill" width="70px" height="24px" />
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <SkeletonLoader width="100px" height="16px" />
            <SkeletonLoader variant="rounded" width="100px" height="36px" />
          </div>
        </div>
      </section>

      {/* List Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          List Items
        </h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center space-x-4 rtl:space-x-reverse">
              <SkeletonLoader variant="circle" width="40px" height="40px" />
              <div className="flex-1 space-y-2">
                <SkeletonLoader width="70%" height="16px" />
                <SkeletonLoader width="50%" height="14px" />
              </div>
              <SkeletonLoader variant="rounded" width="80px" height="32px" />
            </div>
          ))}
        </div>
      </section>

      {/* Form Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Form Fields
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
          <div className="space-y-2">
            <SkeletonLoader width="100px" height="16px" />
            <SkeletonLoader width="100%" height="40px" variant="rounded" />
          </div>
          
          <div className="space-y-2">
            <SkeletonLoader width="120px" height="16px" />
            <SkeletonLoader width="100%" height="40px" variant="rounded" />
          </div>
          
          <div className="space-y-2">
            <SkeletonLoader width="80px" height="16px" />
            <SkeletonLoader width="100%" height="100px" variant="rounded" />
          </div>
          
          <SkeletonLoader variant="rounded" width="120px" height="44px" />
        </div>
      </section>

      {/* Table Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Table Rows
        </h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 dark:bg-gray-700">
            <SkeletonLoader width="80%" height="16px" />
            <SkeletonLoader width="80%" height="16px" />
            <SkeletonLoader width="80%" height="16px" />
            <SkeletonLoader width="80%" height="16px" />
          </div>
          
          {/* Rows */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
              <SkeletonLoader width="90%" height="16px" />
              <SkeletonLoader width="70%" height="16px" />
              <SkeletonLoader width="60%" height="16px" />
              <SkeletonLoader width="80%" height="16px" />
            </div>
          ))}
        </div>
      </section>

      {/* Profile Header Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Profile Header
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <div className="flex items-start space-x-6 rtl:space-x-reverse">
            <SkeletonLoader variant="circle" width="120px" height="120px" />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <SkeletonLoader width="250px" height="32px" />
                <SkeletonLoader width="180px" height="20px" />
              </div>
              <div className="space-y-2">
                <SkeletonLoader width="100%" height="16px" />
                <SkeletonLoader width="100%" height="16px" />
                <SkeletonLoader width="70%" height="16px" />
              </div>
              <div className="flex gap-2">
                <SkeletonLoader variant="rounded" width="100px" height="36px" />
                <SkeletonLoader variant="rounded" width="100px" height="36px" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SkeletonLoaderExamples;
