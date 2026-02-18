import React, { useState } from 'react';
import {
  ProfileSkeleton,
  JobListSkeleton,
  CourseListSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  TableSkeleton
} from './index';

/**
 * مكون عرض توضيحي لجميع Skeleton Loaders
 * يمكن استخدامه للاختبار والمعاينة
 * 
 * للاستخدام: أضف هذا المسار في AppRoutes.jsx (للتطوير فقط)
 * <Route path="/skeleton-demo" element={<SkeletonDemo />} />
 */
export const SkeletonDemo = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'jobList', label: 'Job List' },
    { id: 'courseList', label: 'Course List' },
    { id: 'form', label: 'Form' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'table', label: 'Table' }
  ];

  const renderSkeleton = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSkeleton />;
      case 'jobList':
        return <JobListSkeleton count={5} />;
      case 'courseList':
        return <CourseListSkeleton count={6} />;
      case 'form':
        return <FormSkeleton fields={4} hasTitle={true} />;
      case 'dashboard':
        return <DashboardSkeleton />;
      case 'table':
        return <TableSkeleton rows={5} columns={5} hasActions={true} />;
      default:
        return <ProfileSkeleton />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Skeleton Loaders Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          عرض توضيحي لجميع أنواع Skeleton Loaders المتاحة
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#304B60] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skeleton Display */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {tabs.find(t => t.id === activeTab)?.label} Skeleton
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              هذا مثال على skeleton loader لـ {tabs.find(t => t.id === activeTab)?.label}
            </p>
          </div>
          
          {/* Render Selected Skeleton */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {renderSkeleton()}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 كيفية الاستخدام
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              <strong>في SuspenseWrapper:</strong>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded mx-1">
                {`<SuspenseWrapper skeleton="${activeTab}">...</SuspenseWrapper>`}
              </code>
            </p>
            <p>
              <strong>استخدام مباشر:</strong>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded mx-1">
                {`<${tabs.find(t => t.id === activeTab)?.label.replace(' ', '')}Skeleton />`}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonDemo;
