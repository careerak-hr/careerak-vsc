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
export { JobListSkeleton } from './JobListSkeleton';
export { CourseListSkeleton } from './CourseListSkeleton';
export { FormSkeleton } from './FormSkeleton';
export { DashboardSkeleton } from './DashboardSkeleton';
export { TableSkeleton } from './TableSkeleton';
