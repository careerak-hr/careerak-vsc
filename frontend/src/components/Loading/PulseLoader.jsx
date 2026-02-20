import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';

/**
 * Pulse Loader Component
 * 
 * Pulsing circle animation for loading indication
 * 
 * Features:
 * - Scale and opacity pulse animation
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * - Customizable colors and sizes
 * 
 * Usage:
 * <PulseLoader size="large" color="accent" />
 */

const PulseLoader = ({ 
  size = 'medium',
  color = 'primary',
  className = '',
  ariaLabel = 'Loading...'
}) => {
  const { shouldAnimate } = useAnimation();

  // Size configurations
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  // Color configurations
  const colors = {
    primary: 'bg-[#304B60] dark:bg-[#e0e0e0]',
    accent: 'bg-[#D48161]',
    white: 'bg-white',
    gray: 'bg-gray-400 dark:bg-gray-600'
  };

  // Animation variants
  const pulseVariants = shouldAnimate ? {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.6, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {
    animate: { scale: 1, opacity: 1 }
  };

  return (
    <motion.div
      className={`rounded-full ${sizes[size]} ${colors[color]} ${className}`}
      variants={pulseVariants}
      animate="animate"
      role="status"
      aria-label={ariaLabel}
    />
  );
};

export default PulseLoader;
