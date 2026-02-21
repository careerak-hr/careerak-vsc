import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import AriaLiveRegion from '../Accessibility/AriaLiveRegion';

/**
 * Progress Bar Component
 * 
 * Animated progress bar for page loads and long operations
 * 
 * Features:
 * - Smooth width animation
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * - Customizable colors
 * - Top-of-page positioning option
 * - Screen reader announcements with aria-live
 * 
 * Usage:
 * <ProgressBar progress={75} position="top" />
 */

const ProgressBar = ({ 
  progress = 0,
  position = 'relative', // 'relative' | 'top' | 'bottom'
  height = 'h-1',
  color = 'accent',
  showPercentage = false,
  className = '',
  announceToScreenReader = true,
  loadingMessage = 'Loading'
}) => {
  const { shouldAnimate } = useAnimation();

  // Position configurations
  const positions = {
    relative: '',
    top: 'fixed top-0 left-0 right-0 z-50',
    bottom: 'fixed bottom-0 left-0 right-0 z-50'
  };

  // Color configurations
  const colors = {
    primary: 'bg-[#304B60]',
    accent: 'bg-[#D48161]',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  // Background colors
  const bgColors = {
    primary: 'bg-[#304B60]/20',
    accent: 'bg-[#D48161]/20',
    success: 'bg-green-500/20',
    warning: 'bg-yellow-500/20',
    error: 'bg-red-500/20'
  };

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Animation variants
  const progressVariants = shouldAnimate ? {
    initial: { width: '0%' },
    animate: { 
      width: `${clampedProgress}%`,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  } : {
    initial: { width: `${clampedProgress}%` },
    animate: { width: `${clampedProgress}%` }
  };

  return (
    <>
      {/* Announce progress to screen readers */}
      {announceToScreenReader && (
        <AriaLiveRegion 
          message={`${loadingMessage}: ${Math.round(clampedProgress)}%`}
          politeness="polite"
          role="status"
        />
      )}
      
      <div className={`${positions[position]} ${className}`}>
        <div 
          className={`w-full ${height} ${bgColors[color]} overflow-hidden`}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`${loadingMessage}: ${clampedProgress}%`}
        >
          <motion.div
            className={`h-full ${colors[color]}`}
            variants={progressVariants}
            initial="initial"
            animate="animate"
          />
        </div>
        
        {showPercentage && (
          <div className="text-center text-xs text-[#304B60] dark:text-[#e0e0e0] mt-1">
            {Math.round(clampedProgress)}%
          </div>
        )}
      </div>
    </>
  );
};

export default ProgressBar;
