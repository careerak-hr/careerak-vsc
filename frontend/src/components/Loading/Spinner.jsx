import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';

/**
 * Animated Spinner Component
 * 
 * Features:
 * - Framer Motion rotation animation
 * - Respects prefers-reduced-motion
 * - Multiple sizes (small, medium, large)
 * - Dark mode support
 * - Customizable colors
 * 
 * Usage:
 * <Spinner size="medium" color="primary" />
 */

const Spinner = ({ 
  size = 'medium', 
  color = 'primary',
  className = '',
  ariaLabel = 'Loading...'
}) => {
  const { shouldAnimate, variants } = useAnimation();

  // Size configurations
  const sizes = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3'
  };

  // Color configurations
  const colors = {
    primary: 'border-[#304B60] border-t-transparent dark:border-[#e0e0e0] dark:border-t-transparent',
    accent: 'border-[#D48161] border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent dark:border-gray-600 dark:border-t-transparent'
  };

  // Animation variants
  const spinnerVariants = shouldAnimate ? {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  } : {
    animate: { rotate: 0 }
  };

  return (
    <motion.div
      className={`rounded-full ${sizes[size]} ${colors[color]} ${className}`}
      variants={spinnerVariants}
      animate="animate"
      role="status"
      aria-label={ariaLabel}
    />
  );
};

export default Spinner;
