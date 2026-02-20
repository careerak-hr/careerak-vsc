import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';

/**
 * Skeleton Box Component
 * 
 * Animated skeleton loader box with pulse/shimmer effect
 * 
 * Features:
 * - Pulse animation using Framer Motion
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * - Customizable dimensions
 * - Multiple animation types (pulse, shimmer)
 * 
 * Usage:
 * <SkeletonBox width="w-full" height="h-20" rounded="rounded-lg" />
 */

const SkeletonBox = ({ 
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded',
  animationType = 'pulse', // 'pulse' | 'shimmer' | 'none'
  className = ''
}) => {
  const { shouldAnimate } = useAnimation();

  // Base skeleton styles
  const baseStyles = 'bg-gray-200 dark:bg-gray-700';

  // Animation variants
  const pulseVariants = shouldAnimate ? {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {
    animate: { opacity: 1 }
  };

  const shimmerVariants = shouldAnimate ? {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  } : {
    animate: { backgroundPosition: '0% 0' }
  };

  // Shimmer gradient style
  const shimmerStyle = animationType === 'shimmer' ? {
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    backgroundSize: '200% 100%'
  } : {};

  // Choose animation based on type
  const getAnimation = () => {
    if (!shouldAnimate || animationType === 'none') {
      return {};
    }

    if (animationType === 'shimmer') {
      return {
        variants: shimmerVariants,
        animate: "animate",
        style: shimmerStyle
      };
    }

    // Default to pulse
    return {
      variants: pulseVariants,
      animate: "animate"
    };
  };

  const animation = getAnimation();

  return (
    <motion.div
      className={`${baseStyles} ${width} ${height} ${rounded} ${className}`}
      {...animation}
      role="status"
      aria-label="Loading..."
    />
  );
};

export default SkeletonBox;
