import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';

/**
 * Dots Loader Component
 * 
 * Three animated dots for loading indication
 * 
 * Features:
 * - Bouncing animation
 * - Staggered timing
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * - Customizable colors and sizes
 * 
 * Usage:
 * <DotsLoader size="medium" color="primary" />
 */

const DotsLoader = ({ 
  size = 'medium',
  color = 'primary',
  gap = 'gap-1',
  className = '',
  ariaLabel = 'Loading...'
}) => {
  const { shouldAnimate } = useAnimation();

  // Size configurations
  const sizes = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  // Color configurations
  const colors = {
    primary: 'bg-[#304B60] dark:bg-[#e0e0e0]',
    accent: 'bg-[#D48161]',
    white: 'bg-white',
    gray: 'bg-gray-400 dark:bg-gray-600'
  };

  // Animation variants for each dot
  const dotVariants = shouldAnimate ? {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {
    animate: { y: 0 }
  };

  // Stagger delays for each dot
  const delays = [0, 0.1, 0.2];

  return (
    <div 
      className={`flex items-center ${gap} ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      {delays.map((delay, index) => (
        <motion.div
          key={index}
          className={`rounded-full ${sizes[size]} ${colors[color]}`}
          variants={dotVariants}
          animate="animate"
          transition={{ delay }}
        />
      ))}
    </div>
  );
};

export default DotsLoader;
