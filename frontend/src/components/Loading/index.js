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
 * - DotsLoader: Three bouncing dots
 * - PulseLoader: Pulsing circle
 * 
 * Requirements:
 * - FR-ANIM-5: Display animated skeleton loaders or spinners when content is loading
 * - FR-LOAD-1 to FR-LOAD-8: Unified loading states
 * 
 * Usage:
 * import { Spinner, SkeletonCard, DotsLoader } from '@/components/Loading';
 * 
 * <Spinner size="medium" color="primary" />
 * <SkeletonCard variant="job" />
 * <DotsLoader size="small" color="accent" />
 */

export { default as Spinner } from './Spinner';
export { default as ButtonSpinner } from './ButtonSpinner';
export { default as OverlaySpinner } from './OverlaySpinner';
export { default as ProgressBar } from './ProgressBar';
export { default as SkeletonBox } from './SkeletonBox';
export { default as SkeletonText } from './SkeletonText';
export { default as SkeletonCard } from './SkeletonCard';
export { default as DotsLoader } from './DotsLoader';
export { default as PulseLoader } from './PulseLoader';
