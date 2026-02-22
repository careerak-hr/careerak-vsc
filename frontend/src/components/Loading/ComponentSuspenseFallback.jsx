import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAnimation } from '../../context/AnimationContext';

/**
 * Component-Level Suspense Fallback
 * 
 * Lightweight skeleton loader for individual lazy-loaded components.
 * Smaller and more focused than route-level fallback.
 * 
 * Features:
 * - Compact skeleton for component loading
 * - Dark mode support
 * - Smooth fade-in animation (200ms)
 * - Respects prefers-reduced-motion
 * - Minimal layout impact
 * - Accessible with aria-live announcement
 * 
 * Props:
 * - variant: 'card' | 'list' | 'form' | 'minimal' (default: 'minimal')
 * - height: Custom height (default: auto based on variant)
 * - className: Additional CSS classes
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-7: Apply smooth transitions (200ms fade)
 * - FR-LOAD-8: Prevent layout shifts
 * - NFR-PERF-5: Achieve CLS < 0.1
 * 
 * Usage:
 * <Suspense fallback={<ComponentSuspenseFallback variant="card" />}>
 *   <LazyComponent />
 * </Suspense>
 */
const ComponentSuspenseFallback = ({ 
  variant = 'minimal',
  height,
  className = ''
}) => {
  const { isDark } = useTheme();
  const { shouldAnimate } = useAnimation();

  // Animation variants
  const fadeInVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.2 }
    }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  };

  // Variant configurations
  const variants = {
    minimal: {
      height: height || 'h-20',
      content: (
        <div className="flex items-center justify-center h-full">
          <div className={`w-8 h-8 border-4 ${isDark ? 'border-gray-600' : 'border-gray-300'} border-t-[#D48161] rounded-full animate-spin`}></div>
        </div>
      )
    },
    card: {
      height: height || 'h-64',
      content: (
        <div className="p-4 space-y-3">
          {/* Image skeleton */}
          <div className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
          
          {/* Title skeleton */}
          <div className={`h-6 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
          
          {/* Text skeleton */}
          <div className={`h-4 w-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
          <div className={`h-4 w-5/6 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
        </div>
      )
    },
    list: {
      height: height || 'h-auto',
      content: (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3">
              {/* Avatar skeleton */}
              <div className={`w-12 h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full animate-pulse flex-shrink-0`}></div>
              
              {/* Content skeleton */}
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
                <div className={`h-3 w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    form: {
      height: height || 'h-auto',
      content: (
        <div className="space-y-4 p-4">
          {/* Form field skeletons */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              {/* Label skeleton */}
              <div className={`h-4 w-24 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
              
              {/* Input skeleton */}
              <div className={`h-10 w-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded animate-pulse`}></div>
            </div>
          ))}
          
          {/* Button skeleton */}
          <div className={`h-12 w-32 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg animate-pulse mt-6`}></div>
        </div>
      )
    }
  };

  const config = variants[variant] || variants.minimal;

  return (
    <motion.div
      className={`${isDark ? 'bg-[#2d2d2d]' : 'bg-white'} rounded-lg ${config.height} ${className}`}
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      role="status"
      aria-live="polite"
      aria-label="Loading component"
    >
      {config.content}
      
      {/* Screen reader announcement */}
      <span className="sr-only">Loading component, please wait...</span>
    </motion.div>
  );
};

export default ComponentSuspenseFallback;
