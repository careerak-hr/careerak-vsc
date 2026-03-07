import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { JobCardGridSkeleton, JobCardListSkeleton } from '../SkeletonLoaders';
import './JobsContainer.css';
import './JobsContainerTransitions.css';

/**
 * JobsContainer Component
 * Container for displaying jobs in Grid or List view with smooth transitions
 * 
 * Features:
 * - Toggle between Grid and List views
 * - Smooth transitions between views (300ms)
 * - Different skeleton loaders for each view
 * - Display 6-9 skeletons during loading
 * - Prevent layout shifts
 * - Save view preference to localStorage
 * 
 * Requirements:
 * - FR-VIEW-1: Toggle between Grid/List views
 * - FR-VIEW-3: Save view preference
 * - FR-LOAD-4: Display 6-9 skeletons
 * - FR-LOAD-6: Different skeleton for Grid/List
 * - FR-LOAD-7: Smooth transitions (300ms)
 * - FR-LOAD-8: Prevent layout shifts
 */
const JobsContainer = ({ 
  jobs = [], 
  loading = false, 
  renderJobCard,
  skeletonCount = 9,
  className = ''
}) => {
  const VIEW_PREFERENCE_KEY = 'jobViewPreference';
  
  // Get view preference from localStorage
  const getViewPreference = () => {
    return localStorage.getItem(VIEW_PREFERENCE_KEY) || 'grid';
  };
  
  const [view, setView] = useState(getViewPreference);
  
  // Save view preference to localStorage
  const toggleView = () => {
    const newView = view === 'grid' ? 'list' : 'grid';
    setView(newView);
    localStorage.setItem(VIEW_PREFERENCE_KEY, newView);
  };
  
  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: 'easeInOut',
        staggerChildren: 0.05 // Stagger children animations
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: 'easeInOut'
      }
    }
  };
  
  // Card animation variants for staggered appearance
  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] // Custom easing for smooth feel
      }
    }
  };
  
  // Loading state - show skeletons
  if (loading) {
    return (
      <div className={className}>
        {/* View Toggle (disabled during loading) */}
        <div className="flex justify-end mb-4">
          <button
            disabled
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
            aria-label="View toggle disabled during loading"
          >
            {view === 'grid' ? '☷ Grid' : '☰ List'}
          </button>
        </div>
        
        {/* Skeleton Loaders */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`skeleton-${view}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {view === 'grid' ? (
              <JobCardGridSkeleton count={skeletonCount} />
            ) : (
              <JobCardListSkeleton count={skeletonCount} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }
  
  // Loaded state - show jobs
  return (
    <div className={className}>
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleView}
          className="px-4 py-2 bg-[#D48161] hover:bg-[#c07050] text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          aria-label={`Switch to ${view === 'grid' ? 'list' : 'grid'} view`}
        >
          {view === 'grid' ? (
            <>
              <span>☰</span>
              <span>List View</span>
            </>
          ) : (
            <>
              <span>☷</span>
              <span>Grid View</span>
            </>
          )}
        </button>
      </div>
      
      {/* Jobs Container with smooth transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={
            view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {jobs.map((job, index) => (
            <motion.div
              key={job.id || index}
              variants={cardVariants}
              custom={index}
            >
              {renderJobCard(job, view)}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
      
      {/* Empty state */}
      {jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">No jobs found</p>
          <p className="text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

JobsContainer.propTypes = {
  /** Array of job objects to display */
  jobs: PropTypes.array,
  
  /** Loading state */
  loading: PropTypes.bool,
  
  /** Function to render individual job card */
  renderJobCard: PropTypes.func.isRequired,
  
  /** Number of skeleton items to display during loading */
  skeletonCount: PropTypes.number,
  
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default JobsContainer;
