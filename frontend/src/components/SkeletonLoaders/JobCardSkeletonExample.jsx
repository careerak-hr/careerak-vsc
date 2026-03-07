import React, { useState, useEffect } from 'react';
import { JobCardGridSkeleton, JobCardListSkeleton } from './index';
import JobCardGrid from '../JobCard/JobCardGrid';
import JobCardList from '../JobCard/JobCardList';

/**
 * JobCardSkeleton Usage Example
 * 
 * Demonstrates how to use JobCardGridSkeleton and JobCardListSkeleton
 * with smooth transitions to actual content.
 * 
 * Requirements:
 * - Requirements 7.4: عرض 6-9 skeletons
 * - Requirements 7.5: انتقال سلس من skeleton إلى المحتوى الحقيقي
 * - Requirements 7.6: skeleton مختلف لـ Grid و List
 */
const JobCardSkeletonExample = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [jobs, setJobs] = useState([]);

  // Simulate loading jobs
  useEffect(() => {
    const timer = setTimeout(() => {
      setJobs([
        {
          id: 1,
          title: 'مطور Full Stack',
          company: { name: 'شركة التقنية', logo: null },
          location: { city: 'الرياض' },
          type: 'دوام كامل',
          salary: 15000,
          description: 'نبحث عن مطور Full Stack ذو خبرة في React و Node.js...',
          requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
          createdAt: new Date(),
          isNew: true,
          applicantCount: 12,
          matchPercentage: 85
        },
        {
          id: 2,
          title: 'مصمم UI/UX',
          company: { name: 'شركة التصميم', logo: null },
          location: { city: 'جدة' },
          type: 'دوام جزئي',
          salary: 8000,
          description: 'نبحث عن مصمم UI/UX مبدع لتصميم تطبيقات الموبايل...',
          requiredSkills: ['Figma', 'Adobe XD', 'Sketch'],
          createdAt: new Date(Date.now() - 86400000), // Yesterday
          isUrgent: true,
          applicantCount: 8,
          matchPercentage: 72
        },
        // Add more jobs...
      ]);
      setLoading(false);
    }, 2000); // 2 seconds loading

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Job Card Skeleton Example
        </h1>

        {/* View Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded-lg ${
              view === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
            className="px-4 py-2 rounded-lg bg-green-600 text-white"
          >
            Reload (Show Skeleton)
          </button>
        </div>

        {/* Grid View */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Show 6 skeletons while loading
              <JobCardGridSkeleton count={6} />
            ) : (
              // Show actual job cards
              jobs.map((job) => (
                <JobCardGrid
                  key={job.id}
                  job={job}
                  onBookmark={() => console.log('Bookmark', job.id)}
                  onShare={() => console.log('Share', job.id)}
                  onClick={() => console.log('View', job.id)}
                />
              ))
            )}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-4">
            {loading ? (
              // Show 6 skeletons while loading
              <JobCardListSkeleton count={6} />
            ) : (
              // Show actual job cards
              jobs.map((job) => (
                <JobCardList
                  key={job.id}
                  job={job}
                  onBookmark={() => console.log('Bookmark', job.id)}
                  onShare={() => console.log('Share', job.id)}
                  onClick={() => console.log('View', job.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Features Demonstrated:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>✅ Skeleton screens لبطاقات الوظائف (Requirements 7.1)</li>
            <li>✅ Skeleton يحاكي شكل البطاقة الحقيقية (Requirements 7.2)</li>
            <li>✅ تأثير shimmer/pulse للحركة (Requirements 7.3)</li>
            <li>✅ عرض 6-9 skeletons أثناء التحميل (Requirements 7.4)</li>
            <li>✅ انتقال سلس من skeleton إلى المحتوى الحقيقي (Requirements 7.5)</li>
            <li>✅ skeleton مختلف لـ Grid و List (Requirements 7.6)</li>
            <li>✅ لا spinners دوّارة (Requirements 7.7)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobCardSkeletonExample;
