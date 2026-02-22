import React from 'react';
import JobCardSkeleton from './JobCardSkeleton';

/**
 * JobCardSkeleton Usage Examples
 * 
 * This file demonstrates various use cases for the JobCardSkeleton component.
 * The skeleton matches the exact layout of job cards in JobPostingsPage.
 */

const JobCardSkeletonExample = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        JobCardSkeleton Examples
      </h1>

      {/* Single Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Single Job Card Skeleton
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Used when loading a single job posting
        </p>
        
        <JobCardSkeleton />
      </section>

      {/* Multiple Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Multiple Job Card Skeletons
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Used when loading a list of job postings (e.g., JobPostingsPage)
        </p>
        
        <div className="space-y-4">
          <JobCardSkeleton count={3} />
        </div>
      </section>

      {/* With Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          With Custom Styling
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You can add custom classes for additional styling
        </p>
        
        <JobCardSkeleton className="border-2 border-gray-300 dark:border-gray-600" />
      </section>

      {/* In Grid Layout */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          In Grid Layout
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Skeletons work well in grid layouts for responsive designs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <JobCardSkeleton count={6} />
        </div>
      </section>

      {/* Usage Example Code */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Usage Examples
        </h2>
        
        <div className="bg-gray-800 text-gray-100 p-6 rounded-lg space-y-4 font-mono text-sm">
          <div>
            <p className="text-gray-400 mb-2">// Single skeleton</p>
            <code className="text-green-400">
              {'<JobCardSkeleton />'}
            </code>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">// Multiple skeletons</p>
            <code className="text-green-400">
              {'<JobCardSkeleton count={6} />'}
            </code>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">// With custom class</p>
            <code className="text-green-400">
              {'<JobCardSkeleton className="custom-class" />'}
            </code>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">// In loading state</p>
            <code className="text-green-400">
              {`{loading ? (
  <JobCardSkeleton count={6} />
) : (
  jobs.map(job => <JobCard key={job.id} job={job} />)
)}`}
            </code>
          </div>
        </div>
      </section>

      {/* Structure Breakdown */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Structure Breakdown
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The skeleton matches the exact structure of a job card:
        </p>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Job Title (70% width, 28px height)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Company Label + Name (80px + 150px)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Location Label + Value (70px + 120px)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Salary Label + Range (60px + 180px)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Apply Button (120px width, 40px height)</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✅ Pulse Animation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Smooth pulse animation using Tailwind's animate-pulse
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✅ Dark Mode Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Automatically adapts to light and dark themes
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✅ RTL Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Supports right-to-left layouts for Arabic
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✅ No Layout Shifts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Prevents CLS by matching exact content dimensions
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✅ Accessibility
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Proper ARIA labels for screen readers
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✅ Smooth Transitions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              200ms fade transition when content loads
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobCardSkeletonExample;
