import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import SkeletonBox from './SkeletonBox';
import AriaLiveRegion from '../Accessibility/AriaLiveRegion';

/**
 * Skeleton Table Component
 * 
 * Animated skeleton loader for table layouts
 * 
 * Features:
 * - Configurable rows and columns
 * - Header row support
 * - Stagger animation for rows
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * - Responsive design
 * - Screen reader announcements
 * 
 * Requirements:
 * - FR-LOAD-1: Display skeleton loaders matching content layout
 * - FR-LOAD-5: Display skeleton cards matching list item layout
 * - Task 8.1.5: Create skeleton for tables
 * 
 * Usage:
 * <SkeletonTable rows={5} columns={4} showHeader={true} />
 */

const SkeletonTable = ({ 
  rows = 5,
  columns = 4,
  showHeader = true,
  columnWidths = [], // Array of widths for each column (e.g., ['w-1/4', 'w-1/2', 'w-1/4'])
  cellHeight = 'h-12',
  headerHeight = 'h-14',
  animationType = 'pulse', // 'pulse' | 'shimmer' | 'none'
  className = '',
  ariaLabel = 'Loading table data...',
  announceToScreenReader = true,
  responsive = true // Convert to cards on mobile
}) => {
  const { shouldAnimate } = useAnimation();

  // Stagger animation for rows
  const containerVariants = shouldAnimate ? {
    animate: {
      transition: {
        staggerChildren: 0.05 // 50ms delay between rows
      }
    }
  } : {};

  const rowVariants = shouldAnimate ? {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  } : {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 }
  };

  // Generate column widths if not provided
  const getColumnWidth = (index) => {
    if (columnWidths.length > 0 && columnWidths[index]) {
      return columnWidths[index];
    }
    // Default: distribute evenly
    return `w-1/${columns}`;
  };

  // Generate array of rows
  const rowArray = Array.from({ length: rows }, (_, i) => i);
  const columnArray = Array.from({ length: columns }, (_, i) => i);

  return (
    <>
      {/* Announce loading to screen readers */}
      {announceToScreenReader && (
        <AriaLiveRegion 
          message={ariaLabel}
          politeness="polite"
          role="status"
        />
      )}

      {/* Desktop Table View */}
      <div 
        className={`${responsive ? 'hidden md:block' : ''} ${className}`}
        role="status"
        aria-label={ariaLabel}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-[#2d2d2d] rounded-lg overflow-hidden shadow-md">
            {/* Header */}
            {showHeader && (
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {columnArray.map((colIndex) => (
                    <th 
                      key={`header-${colIndex}`}
                      className="px-4 py-3 text-left"
                    >
                      <SkeletonBox
                        width="w-3/4"
                        height="h-5"
                        rounded="rounded"
                        animationType={animationType}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {/* Body */}
            <motion.tbody
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              {rowArray.map((rowIndex) => (
                <motion.tr
                  key={`row-${rowIndex}`}
                  variants={rowVariants}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  {columnArray.map((colIndex) => (
                    <td 
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="px-4 py-3"
                    >
                      <SkeletonBox
                        width={colIndex === 0 ? 'w-full' : 'w-5/6'}
                        height="h-4"
                        rounded="rounded"
                        animationType={animationType}
                      />
                    </td>
                  ))}
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Responsive) */}
      {responsive && (
        <motion.div 
          className="md:hidden space-y-3"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          role="status"
          aria-label={ariaLabel}
        >
          {rowArray.map((rowIndex) => (
            <motion.div
              key={`card-${rowIndex}`}
              variants={rowVariants}
              className="bg-white dark:bg-[#2d2d2d] rounded-lg shadow-md p-4 space-y-3"
            >
              {columnArray.map((colIndex) => (
                <div key={`card-field-${rowIndex}-${colIndex}`}>
                  {/* Field label */}
                  <SkeletonBox
                    width="w-1/3"
                    height="h-3"
                    rounded="rounded"
                    animationType={animationType}
                    className="mb-2"
                  />
                  {/* Field value */}
                  <SkeletonBox
                    width="w-full"
                    height="h-4"
                    rounded="rounded"
                    animationType={animationType}
                  />
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default SkeletonTable;
