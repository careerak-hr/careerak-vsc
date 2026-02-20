import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import SkeletonBox from './SkeletonBox';
import SkeletonText from './SkeletonText';

/**
 * Skeleton Card Component
 * 
 * Pre-built skeleton loader for card layouts
 * 
 * Features:
 * - Image + text layout
 * - Fade-in animation
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * - Customizable layout
 * 
 * Usage:
 * <SkeletonCard variant="job" />
 */

const SkeletonCard = ({ 
  variant = 'default', // 'default' | 'job' | 'course' | 'profile'
  showImage = true,
  imageHeight = 'h-48',
  textLines = 3,
  className = ''
}) => {
  const { shouldAnimate } = useAnimation();

  // Fade-in animation for the card
  const cardVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  };

  // Variant-specific configurations
  const variants = {
    default: {
      showImage: true,
      imageHeight: 'h-48',
      textLines: 3
    },
    job: {
      showImage: false,
      imageHeight: 'h-0',
      textLines: 4
    },
    course: {
      showImage: true,
      imageHeight: 'h-40',
      textLines: 3
    },
    profile: {
      showImage: true,
      imageHeight: 'h-32',
      textLines: 2
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <motion.div
      className={`bg-white dark:bg-[#2d2d2d] rounded-lg shadow-md overflow-hidden ${className}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
    >
      {/* Image skeleton */}
      {(showImage || config.showImage) && (
        <SkeletonBox
          width="w-full"
          height={imageHeight || config.imageHeight}
          rounded="rounded-none"
          animationType="shimmer"
        />
      )}

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <SkeletonBox
          width="w-3/4"
          height="h-6"
          rounded="rounded"
          animationType="pulse"
        />

        {/* Text lines */}
        <SkeletonText
          lines={textLines || config.textLines}
          lineHeight="h-4"
          gap="gap-2"
          animationType="pulse"
        />

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <SkeletonBox
            width="w-24"
            height="h-10"
            rounded="rounded-lg"
            animationType="pulse"
          />
          <SkeletonBox
            width="w-24"
            height="h-10"
            rounded="rounded-lg"
            animationType="pulse"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SkeletonCard;
