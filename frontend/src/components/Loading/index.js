/**
 * Loading Components
 * 
 * Animated loading components using Framer Motion
 * All components respect prefers-reduced-motion setting
 * 
 * Features:
 * - Spinner: Rotating spinner (small, medium, large)
 * - ButtonSpinner: Compact spinner for buttons
 * - OverlaySpinner: Full-screen overlay with spinner
 * - ProgressBar: Animated progress bar
 * - SkeletonBox: Basic skeleton box with pulse/shimmer
 * - SkeletonText: Multi-line text skeleton
 * - SkeletonCard: Pre-built card skeleton
 * - SkeletonTable: Table skeleton with responsive card view
 * - DotsLoader: Three bouncing dots
 * - PulseLoader: Pulsing circle
 * - ImagePlaceholder: Image loading placeholder with animation
 * - RouteSuspenseFallback: Full-page skeleton for route-level Suspense
 * - ComponentSuspenseFallback: Lightweight skeleton for component-level Suspense
 * 
 * Requirements:
 * - FR-ANIM-5: Display animated skeleton loaders or spinners when content is loading
 * - FR-LOAD-1 to FR-LOAD-8: Unified loading states
 * - FR-LOAD-6: Display placeholder with loading animation for images
 * 
 * Usage:
 * import { Spinner, SkeletonCard, SkeletonTable, DotsLoader, ImagePlaceholder, RouteSuspenseFallback, ComponentSuspenseFallback } from '@/components/Loading';
 * 
 * <Spinner size="medium" color="primary" />
 * <SkeletonCard variant="job" />
 * <SkeletonTable rows={5} columns={4} showHeader={true} />
 * <DotsLoader size="small" color="accent" />
 * <ImagePlaceholder width={400} height={300} />
 * <RouteSuspenseFallback />
 * <ComponentSuspenseFallback variant="card" />
 */

export { default as Spinner } from './Spinner';
export { default as ButtonSpinner } from './ButtonSpinner';
export { default as OverlaySpinner } from './OverlaySpinner';
export { default as ProgressBar } from './ProgressBar';
export { default as SkeletonBox } from './SkeletonBox';
export { default as SkeletonText } from './SkeletonText';
export { default as SkeletonCard } from './SkeletonCard';
export { default as SkeletonTable } from './SkeletonTable';
export { default as DotsLoader } from './DotsLoader';
export { default as PulseLoader } from './PulseLoader';
export { default as ImagePlaceholder } from './ImagePlaceholder';
export { default as RouteSuspenseFallback } from './RouteSuspenseFallback';
export { default as ComponentSuspenseFallback } from './ComponentSuspenseFallback';
