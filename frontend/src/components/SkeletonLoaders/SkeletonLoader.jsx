import React from 'react';
import PropTypes from 'prop-types';

/**
 * Base SkeletonLoader Component
 * 
 * A flexible, reusable skeleton loader component that can be used to create
 * loading placeholders matching content layout.
 * 
 * Features:
 * - Pulse animation (Tailwind animate-pulse)
 * - Dark mode support (bg-gray-200/dark:bg-gray-700)
 * - Customizable dimensions (width, height)
 * - Multiple shape variants (rectangle, circle, rounded)
 * - Responsive design
 * - RTL support
 * - Accessibility (aria-busy, aria-label)
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-7: Apply smooth transitions (200ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 * - NFR-PERF-5: CLS < 0.1
 * - NFR-USE-3: Display loading states within 100ms
 * 
 * @example
 * // Basic rectangle
 * <SkeletonLoader width="100%" height="20px" />
 * 
 * @example
 * // Circle (avatar)
 * <SkeletonLoader variant="circle" width="48px" height="48px" />
 * 
 * @example
 * // Rounded rectangle (button)
 * <SkeletonLoader variant="rounded" width="120px" height="40px" />
 */
const SkeletonLoader = ({
  width = '100%',
  height = '16px',
  variant = 'rectangle',
  className = '',
  style = {},
  ariaLabel = 'Loading content',
  ...props
}) => {
  // Variant-specific classes
  const variantClasses = {
    rectangle: 'rounded',
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    pill: 'rounded-full',
  };

  // Base classes for skeleton
  const baseClasses = [
    'bg-gray-200',
    'dark:bg-gray-700',
    'animate-pulse',
    'transition-opacity',
    'duration-200',
    variantClasses[variant] || variantClasses.rectangle,
  ].join(' ');

  // Combine with custom classes
  const combinedClasses = `${baseClasses} ${className}`.trim();

  // Combine inline styles
  const combinedStyle = {
    width,
    height,
    minHeight: height, // Prevent layout shift
    ...style,
  };

  return (
    <div
      className={combinedClasses}
      style={combinedStyle}
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      {...props}
    />
  );
};

SkeletonLoader.propTypes = {
  /** Width of the skeleton (CSS value: px, %, rem, etc.) */
  width: PropTypes.string,
  
  /** Height of the skeleton (CSS value: px, %, rem, etc.) */
  height: PropTypes.string,
  
  /** Shape variant of the skeleton */
  variant: PropTypes.oneOf(['rectangle', 'circle', 'rounded', 'pill']),
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** Inline styles */
  style: PropTypes.object,
  
  /** Accessibility label for screen readers */
  ariaLabel: PropTypes.string,
};

export default SkeletonLoader;
