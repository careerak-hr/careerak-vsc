import React from 'react';
import {
  ProfileSkeleton,
  JobListSkeleton,
  CourseListSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  TableSkeleton
} from './SkeletonLoaders';
import { RouteSuspenseFallback } from './Loading';

/**
 * مكون شاشة التحميل العامة
 * Global Loading Screen Component
 */
export const GlobalLoader = () => (
  <div className="fixed inset-0 bg-[#E3DAD0] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#304B60]"></div>
  </div>
);

/**
 * مكون Suspense مع شاشة التحميل المخصصة
 * Custom Suspense Component with Loading Screen
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - المحتوى المراد تحميله
 * @param {string} props.skeleton - نوع الـ skeleton loader (profile, jobList, courseList, form, dashboard, table, route)
 * @param {Object} props.skeletonProps - خصائص إضافية للـ skeleton loader
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-7: Apply smooth transitions (200ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 * - Design Section 9.3: Route level uses full-page skeleton
 */
export const SuspenseWrapper = ({ children, skeleton, skeletonProps = {} }) => {
  // اختيار الـ skeleton المناسب بناءً على النوع
  const getSkeletonLoader = () => {
    switch (skeleton) {
      case 'profile':
        return <ProfileSkeleton {...skeletonProps} />;
      case 'jobList':
        return <JobListSkeleton {...skeletonProps} />;
      case 'courseList':
        return <CourseListSkeleton {...skeletonProps} />;
      case 'form':
        return <FormSkeleton {...skeletonProps} />;
      case 'dashboard':
        return <DashboardSkeleton {...skeletonProps} />;
      case 'table':
        return <TableSkeleton {...skeletonProps} />;
      case 'route':
        return <RouteSuspenseFallback />;
      default:
        // Default to route-level skeleton for better UX
        return <RouteSuspenseFallback />;
    }
  };

  return (
    <React.Suspense fallback={getSkeletonLoader()}>
      {children}
    </React.Suspense>
  );
};

export default GlobalLoader;