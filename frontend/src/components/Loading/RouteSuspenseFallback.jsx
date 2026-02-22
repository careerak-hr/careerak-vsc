import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Route-Level Suspense Fallback Component
 * 
 * Full-page skeleton loader displayed while lazy-loaded route components are loading.
 * Matches the general page layout to prevent layout shifts (CLS < 0.1).
 * 
 * Features:
 * - Full-page skeleton matching typical page structure
 * - Dark mode support
 * - Smooth fade-in animation (200ms)
 * - No layout shifts
 * - Accessible with aria-live announcement
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-7: Apply smooth transitions (200ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 * - NFR-PERF-5: Achieve CLS < 0.1
 */
const RouteSuspenseFallback = () => {
  const { isDark } = useTheme();

  return (
    <div 
      className={`min-h-screen ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#E3DAD1]'} transition-colors duration-200`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      {/* Navbar Skeleton */}
      <div className={`h-16 ${isDark ? 'bg-[#2d2d2d]' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} animate-pulse`}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo skeleton */}
          <div className={`h-8 w-32 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
          
          {/* Nav items skeleton */}
          <div className="flex gap-4">
            <div className={`h-8 w-20 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
            <div className={`h-8 w-20 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
            <div className={`h-8 w-20 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title Skeleton */}
        <div className={`h-10 w-64 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-6 animate-pulse`}></div>
        
        {/* Content Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div 
              key={item}
              className={`${isDark ? 'bg-[#2d2d2d]' : 'bg-white'} rounded-lg p-6 shadow-md animate-pulse`}
            >
              {/* Card image skeleton */}
              <div className={`h-40 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-4`}></div>
              
              {/* Card title skeleton */}
              <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-3`}></div>
              
              {/* Card description skeleton */}
              <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-2`}></div>
              <div className={`h-4 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-4`}></div>
              
              {/* Card button skeleton */}
              <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className={`mt-16 ${isDark ? 'bg-[#2d2d2d]' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} py-8 animate-pulse`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((col) => (
              <div key={col}>
                <div className={`h-6 w-32 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-4`}></div>
                <div className={`h-4 w-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-2`}></div>
                <div className={`h-4 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
              </div>
            ))}
          </div>
        </div>
      </footer>

      {/* Screen reader announcement */}
      <span className="sr-only">Loading page content, please wait...</span>
    </div>
  );
};

export default RouteSuspenseFallback;
