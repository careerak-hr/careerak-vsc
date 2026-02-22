import React from 'react';
import CourseCardSkeleton from './CourseCardSkeleton';

/**
 * CourseCardSkeleton Usage Examples
 * 
 * This file demonstrates various use cases for the CourseCardSkeleton component.
 * The skeleton matches the exact layout of course cards in CoursesPage.
 */

const CourseCardSkeletonExample = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        CourseCardSkeleton Examples
      </h1>

      {/* Single Skeleton */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Single Course Card Skeleton
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Use this for loading a single course card.
        </p>
        
        <CourseCardSkeleton />
      </section>

      {/* Multiple Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Multiple Course Card Skeletons
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Use count prop to render multiple skeletons at once.
        </p>
        
        <div className="space-y-4">
          <CourseCardSkeleton count={3} />
        </div>
      </section>

      {/* Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          With Custom Styling
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add custom classes for additional styling.
        </p>
        
        <CourseCardSkeleton className="border-2 border-gray-300 dark:border-gray-600" />
      </section>

      {/* Grid Layout (Matching CoursesPage) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Grid Layout (CoursesPage Style)
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This matches the exact layout used in CoursesPage.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCardSkeleton count={6} />
        </div>
      </section>

      {/* Code Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Code Examples
        </h2>
        
        <div className="bg-gray-800 p-6 rounded-lg space-y-4 text-white font-mono text-sm">
          <div>
            <p className="text-gray-400 mb-2">// Single skeleton</p>
            <code className="text-green-400">
              {'<CourseCardSkeleton />'}
            </code>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">// Multiple skeletons</p>
            <code className="text-green-400">
              {'<CourseCardSkeleton count={6} />'}
            </code>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">// With custom class</p>
            <code className="text-green-400">
              {'<CourseCardSkeleton className="custom-class" />'}
            </code>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">// In CoursesPage</p>
            <code className="text-green-400">
              {`{loading ? (
  <CourseCardSkeleton count={6} />
) : (
  courses.map(course => <CourseCard key={course.id} course={course} />)
)}`}
            </code>
          </div>
        </div>
      </section>

      {/* Comparison with Actual Course Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Skeleton vs Actual Course Card
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skeleton */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              Loading State (Skeleton)
            </h3>
            <CourseCardSkeleton />
          </div>
          
          {/* Actual Course Card */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              Loaded State (Actual Card)
            </h3>
            <article className="course-card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Advanced React Development
              </h3>
              <div className="course-details text-gray-600 dark:text-gray-300 space-y-1">
                <p className="instructor">
                  <span className="font-medium">Instructor:</span> John Doe
                </p>
                <p className="duration">
                  <span className="font-medium">Duration:</span> 8 weeks
                </p>
                <p className="price">
                  <span className="font-medium">Price:</span> $299
                </p>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-[#D48161] text-white rounded hover:bg-[#c07050] transition-colors">
                Enroll Now
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Best Practices
        </h2>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ✅ Do
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Use CourseCardSkeleton while fetching course data</li>
              <li>Match the count to expected number of courses</li>
              <li>Use the same grid layout as the actual course cards</li>
              <li>Apply smooth transitions when replacing with actual content</li>
              <li>Test with slow network to verify skeleton appears</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ❌ Don't
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
              <li>Don't show skeleton for less than 100ms (too fast)</li>
              <li>Don't use different layout than actual course cards</li>
              <li>Don't forget to remove skeleton when data loads</li>
              <li>Don't use skeleton for instant/cached data</li>
              <li>Don't animate skeleton appearance (should be instant)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Performance Notes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Performance Notes
        </h2>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
          <ul className="text-gray-700 dark:text-gray-300 space-y-2">
            <li>
              <strong>CLS Prevention:</strong> Skeleton matches exact dimensions of course cards
            </li>
            <li>
              <strong>GPU Acceleration:</strong> Uses transform and opacity for animations
            </li>
            <li>
              <strong>Minimal Reflows:</strong> Fixed heights prevent layout shifts
            </li>
            <li>
              <strong>Dark Mode:</strong> Automatic dark mode support with Tailwind
            </li>
            <li>
              <strong>Accessibility:</strong> Proper ARIA labels for screen readers
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default CourseCardSkeletonExample;
