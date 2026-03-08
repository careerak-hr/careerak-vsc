/**
 * Skeleton Loaders
 * Route-specific skeleton loaders that match content layout
 * 
 * Features:
 * - Match actual content layout
 * - Pulse animation (Tailwind animate-pulse)
 * - Dark mode support
 * - Smooth transition to actual content
 */

// Base skeleton loader component
export { default as SkeletonLoader } from './SkeletonLoader';

// Route-specific skeleton loaders
export { ProfileSkeleton } from './ProfileSkeleton';
// export { JobListSkeleton } from './JobListSkeleton'; // File not found
// export { CourseListSkeleton } from './CourseListSkeleton'; // File not found
// export { FormSkeleton } from './FormSkeleton'; // File not found
// export { DashboardSkeleton } from './DashboardSkeleton'; // File not found
// export { TableSkeleton } from './TableSkeleton'; // File not found

// Card-specific skeleton loaders
export { default as JobCardSkeleton } from './JobCardSkeleton';
export { default as JobCardGridSkeleton } from './JobCardGridSkeleton';
export { default as JobCardListSkeleton } from './JobCardListSkeleton';
export { default as CourseCardSkeleton } from './CourseCardSkeleton';
