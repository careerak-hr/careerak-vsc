import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';

/**
 * Skeleton loader for Table Pages
 * Matches the layout of data tables with rows and columns
 * 
 * Features:
 * - 200ms fade transition
 * - Respects prefers-reduced-motion
 * - Dark mode support
 */
export const TableSkeleton = ({ rows = 5, columns = 5, hasActions = true }) => {
  const { shouldAnimate } = useAnimation();

  // Fade animation variants (200ms)
  const fadeVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Table Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="grid gap-4 p-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns + (hasActions ? 1 : 0)}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
          {hasActions && <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div 
            key={i} 
            className="grid gap-4 p-4 animate-pulse" 
            style={{ gridTemplateColumns: `repeat(${columns + (hasActions ? 1 : 0)}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
            {hasActions && (
              <div className="flex space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TableSkeleton;
