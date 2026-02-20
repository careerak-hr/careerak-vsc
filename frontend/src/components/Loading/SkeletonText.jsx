import React from 'react';
import SkeletonBox from './SkeletonBox';

/**
 * Skeleton Text Component
 * 
 * Animated skeleton loader for text content
 * 
 * Features:
 * - Multiple lines support
 * - Varying widths for natural look
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * 
 * Usage:
 * <SkeletonText lines={3} />
 */

const SkeletonText = ({ 
  lines = 1,
  lineHeight = 'h-4',
  gap = 'gap-2',
  lastLineWidth = '75%', // Width of last line (for natural look)
  animationType = 'pulse',
  className = ''
}) => {
  // Generate array of lines
  const lineArray = Array.from({ length: lines }, (_, i) => i);

  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {lineArray.map((index) => {
        // Last line is shorter for natural look
        const isLastLine = index === lines - 1 && lines > 1;
        const width = isLastLine ? lastLineWidth : 'w-full';
        
        return (
          <SkeletonBox
            key={index}
            width={width}
            height={lineHeight}
            rounded="rounded"
            animationType={animationType}
          />
        );
      })}
    </div>
  );
};

export default SkeletonText;
