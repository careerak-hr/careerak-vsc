const redisCache = require('./redisCache');
const { User } = require('../models/User');
const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const EducationalCourse = require('../models/EducationalCourse');
const Review = require('../models/Review');

/**
 * Statistics Service for Admin Dashboard
 * 
 * Provides aggregation queries for real-time statistics and growth rates.
 * Uses Redis for distributed caching with node-cache fallback.
 * Implements Requirements 2.1-2.6, 11.2, 12.1, 12.2
 */

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
const getCacheStats = () => {
  return redisCache.getStats();
};

/**
 * Clear all cache entries
 */
const clearCache = async () => {
  await redisCache.flushAll();
  console.log('[Cache] All cache entries cleared');
};

/**
 * Invalidate specific cache key
 * @param {string} key - Cache key to invalidate
 */
const invalidateCache = async (key) => {
  const deleted = await redisCache.del(key);
  if (deleted) {
    console.log(`[Cache] Invalidated cache key: ${key}`);
  }
};

/**
 * Invalidate all statistics cache keys
 */
const invalidateAllStatistics = async () => {
  await redisCache.delPattern('*_stats_*');
  await redisCache.del('active_users_count');
  console.log('[Cache] Invalidated all statistics cache keys');
};

/**
 * Helper: Get cached data or fetch from database
 * @param {string} cacheKey - Unique cache key
 * @param {Function} fetchFunction - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds (default: 30)
 * @returns {Promise<any>} Cached or fresh data
 */
const getCachedOrFetch = async (cacheKey, fetchFunction, ttl = 30) => {
  return redisCache.getOrFetch(cacheKey, fetchFunction, ttl);
};

/**
 * Helper: Calculate growth rate comparing current vs previous period
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {number} Growth rate as percentage (e.g., 25.5 for 25.5% growth)
 */
const calculateGrowthRate = (current, previous) => {
  if (previous === 0) {
    // If previous is 0, return 100% if current > 0, else 0%
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Get user statistics with growth rates
 * Requirements: 2.1, 11.2, 12.1, 12.2
 * 
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for current period
 * @param {Date} options.endDate - End date for current period
 * @returns {Promise<Object>} User statistics
 */
const getUserStatistics = async ({ startDate, endDate } = {}) => {
  const now = endDate || new Date();
  const start = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Create cache key based on time range
  const cacheKey = `user_stats_${start.getTime()}_${now.getTime()}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      // Calculate previous period (same duration)
      const duration = now.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - duration);
      const previousEnd = start;
      
      // Current period counts
      const [currentTotal, currentByType, previousTotal, previousByType] = await Promise.all([
        // Total users in current period
        User.countDocuments({
          createdAt: { $gte: start, $lte: now }
        }),
        
        // Users by type in current period - OPTIMIZED with early $match and $project
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: now }
            }
          },
          {
            $project: {
              role: 1  // Only project needed fields
            }
          },
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Total users in previous period
        User.countDocuments({
          createdAt: { $gte: previousStart, $lt: previousEnd }
        }),
        
        // Users by type in previous period - OPTIMIZED with early $match and $project
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: previousStart, $lt: previousEnd }
            }
          },
          {
            $project: {
              role: 1  // Only project needed fields
            }
          },
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 }
            }
          }
        ])
      ]);
      
      // Format by type data
      const formatByType = (data) => {
        const result = { HR: 0, Employee: 0, Admin: 0 };
        data.forEach(item => {
          if (item._id) {
            result[item._id] = item.count;
          }
        });
        return result;
      };
      
      const currentByTypeFormatted = formatByType(currentByType);
      const previousByTypeFormatted = formatByType(previousByType);
      
      // Calculate growth rates
      const growthRate = calculateGrowthRate(currentTotal, previousTotal);
      const growthRateByType = {
        HR: calculateGrowthRate(currentByTypeFormatted.HR, previousByTypeFormatted.HR),
        Employee: calculateGrowthRate(currentByTypeFormatted.Employee, previousByTypeFormatted.Employee),
        Admin: calculateGrowthRate(currentByTypeFormatted.Admin, previousByTypeFormatted.Admin)
      };
      
      return {
        current: {
          total: currentTotal,
          byType: currentByTypeFormatted
        },
        previous: {
          total: previousTotal,
          byType: previousByTypeFormatted
        },
        growthRate,
        growthRateByType
      };
    } catch (error) {
      console.error('Error in getUserStatistics:', error);
      throw new Error('Failed to fetch user statistics');
    }
  });
};

/**
 * Get job statistics with application metrics
 * Requirements: 2.2, 11.2, 12.1, 12.2
 * 
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for current period
 * @param {Date} options.endDate - End date for current period
 * @returns {Promise<Object>} Job statistics
 */
const getJobStatistics = async ({ startDate, endDate } = {}) => {
  const now = endDate || new Date();
  const start = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const cacheKey = `job_stats_${start.getTime()}_${now.getTime()}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const duration = now.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - duration);
      const previousEnd = start;
      
      const [
        currentJobs,
        currentApplications,
        previousJobs,
        previousApplications,
        jobsByStatus,
        applicationsByStatus
      ] = await Promise.all([
        // Current period jobs
        JobPosting.countDocuments({
          createdAt: { $gte: start, $lte: now }
        }),
        
        // Current period applications
        JobApplication.countDocuments({
          appliedAt: { $gte: start, $lte: now }
        }),
        
        // Previous period jobs
        JobPosting.countDocuments({
          createdAt: { $gte: previousStart, $lt: previousEnd }
        }),
        
        // Previous period applications
        JobApplication.countDocuments({
          appliedAt: { $gte: previousStart, $lt: previousEnd }
        }),
        
        // Jobs by status - OPTIMIZED with $project
        JobPosting.aggregate([
          {
            $project: {
              status: 1  // Only project needed fields
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Applications by status - OPTIMIZED with $project
        JobApplication.aggregate([
          {
            $project: {
              status: 1  // Only project needed fields
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
      ]);
      
      // Format status data
      const formatJobsByStatus = (data) => {
        const result = { Open: 0, Closed: 0 };
        data.forEach(item => {
          if (item._id) {
            result[item._id] = item.count;
          }
        });
        return result;
      };
      
      const formatApplicationsByStatus = (data) => {
        const result = { Pending: 0, Reviewed: 0, Shortlisted: 0, Rejected: 0, Accepted: 0 };
        data.forEach(item => {
          if (item._id) {
            result[item._id] = item.count;
          }
        });
        return result;
      };
      
      const jobsGrowthRate = calculateGrowthRate(currentJobs, previousJobs);
      const applicationsGrowthRate = calculateGrowthRate(currentApplications, previousApplications);
      
      return {
        jobs: {
          current: currentJobs,
          previous: previousJobs,
          growthRate: jobsGrowthRate,
          byStatus: formatJobsByStatus(jobsByStatus)
        },
        applications: {
          current: currentApplications,
          previous: previousApplications,
          growthRate: applicationsGrowthRate,
          byStatus: formatApplicationsByStatus(applicationsByStatus)
        }
      };
    } catch (error) {
      console.error('Error in getJobStatistics:', error);
      throw new Error('Failed to fetch job statistics');
    }
  });
};

/**
 * Get course statistics with enrollment metrics
 * Requirements: 2.3, 11.2, 12.1, 12.2
 * 
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for current period
 * @param {Date} options.endDate - End date for current period
 * @returns {Promise<Object>} Course statistics
 */
const getCourseStatistics = async ({ startDate, endDate } = {}) => {
  const now = endDate || new Date();
  const start = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const cacheKey = `course_stats_${start.getTime()}_${now.getTime()}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const duration = now.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - duration);
      const previousEnd = start;
      
      const [
        currentCourses,
        previousCourses,
        coursesByStatus,
        enrollmentStats
      ] = await Promise.all([
        // Current period courses
        EducationalCourse.countDocuments({
          createdAt: { $gte: start, $lte: now }
        }),
        
        // Previous period courses
        EducationalCourse.countDocuments({
          createdAt: { $gte: previousStart, $lt: previousEnd }
        }),
        
        // Courses by status - OPTIMIZED with $project
        EducationalCourse.aggregate([
          {
            $project: {
              status: 1  // Only project needed fields
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Enrollment statistics - OPTIMIZED with early $match and $project
        EducationalCourse.aggregate([
          {
            $project: {
              enrollmentCount: { $size: { $ifNull: ['$enrolledParticipants', []] } },
              createdAt: 1
            }
          },
          {
            $facet: {
              totalEnrollments: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$enrollmentCount' }
                  }
                }
              ],
              currentPeriodEnrollments: [
                {
                  $match: {
                    createdAt: { $gte: start, $lte: now }
                  }
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$enrollmentCount' }
                  }
                }
              ],
              previousPeriodEnrollments: [
                {
                  $match: {
                    createdAt: { $gte: previousStart, $lt: previousEnd }
                  }
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$enrollmentCount' }
                  }
                }
              ]
            }
          }
        ])
      ]);
      
      // Format status data
      const formatCoursesByStatus = (data) => {
        const result = { Draft: 0, Published: 0, Archived: 0 };
        data.forEach(item => {
          if (item._id) {
            result[item._id] = item.count;
          }
        });
        return result;
      };
      
      const enrollmentData = enrollmentStats[0] ? {
        totalEnrollments: enrollmentStats[0].totalEnrollments[0]?.total || 0,
        currentPeriodEnrollments: enrollmentStats[0].currentPeriodEnrollments[0]?.total || 0,
        previousPeriodEnrollments: enrollmentStats[0].previousPeriodEnrollments[0]?.total || 0
      } : {
        totalEnrollments: 0,
        currentPeriodEnrollments: 0,
        previousPeriodEnrollments: 0
      };
      
      const coursesGrowthRate = calculateGrowthRate(currentCourses, previousCourses);
      const enrollmentsGrowthRate = calculateGrowthRate(
        enrollmentData.currentPeriodEnrollments,
        enrollmentData.previousPeriodEnrollments
      );
      
      return {
        courses: {
          current: currentCourses,
          previous: previousCourses,
          growthRate: coursesGrowthRate,
          byStatus: formatCoursesByStatus(coursesByStatus)
        },
        enrollments: {
          total: enrollmentData.totalEnrollments,
          current: enrollmentData.currentPeriodEnrollments,
          previous: enrollmentData.previousPeriodEnrollments,
          growthRate: enrollmentsGrowthRate
        }
      };
    } catch (error) {
      console.error('Error in getCourseStatistics:', error);
      throw new Error('Failed to fetch course statistics');
    }
  });
};

/**
 * Get review statistics with rating metrics
 * Requirements: 2.4, 11.2, 12.1, 12.2
 * 
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for current period
 * @param {Date} options.endDate - End date for current period
 * @returns {Promise<Object>} Review statistics
 */
const getReviewStatistics = async ({ startDate, endDate } = {}) => {
  const now = endDate || new Date();
  const start = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const cacheKey = `review_stats_${start.getTime()}_${now.getTime()}`;
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      const duration = now.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - duration);
      const previousEnd = start;
      
      const [
        currentReviews,
        previousReviews,
        reviewsByStatus,
        ratingStats
      ] = await Promise.all([
        // Current period reviews
        Review.countDocuments({
          createdAt: { $gte: start, $lte: now }
        }),
        
        // Previous period reviews
        Review.countDocuments({
          createdAt: { $gte: previousStart, $lt: previousEnd }
        }),
        
        // Reviews by status - OPTIMIZED with $project
        Review.aggregate([
          {
            $project: {
              status: 1  // Only project needed fields
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Rating statistics - OPTIMIZED with early $match and $project
        Review.aggregate([
          {
            $match: {
              status: 'approved'
            }
          },
          {
            $project: {
              rating: 1  // Only project needed fields
            }
          },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalRatings: { $sum: 1 },
              ratingDistribution: {
                $push: '$rating'
              }
            }
          }
        ])
      ]);
      
      // Format status data
      const formatReviewsByStatus = (data) => {
        const result = { pending: 0, approved: 0, rejected: 0, flagged: 0 };
        data.forEach(item => {
          if (item._id) {
            result[item._id] = item.count;
          }
        });
        return result;
      };
      
      // Calculate rating distribution
      const calculateRatingDistribution = (ratings) => {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(rating => {
          const roundedRating = Math.round(rating);
          if (roundedRating >= 1 && roundedRating <= 5) {
            distribution[roundedRating]++;
          }
        });
        return distribution;
      };
      
      const ratingData = ratingStats[0] || {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: []
      };
      
      const reviewsGrowthRate = calculateGrowthRate(currentReviews, previousReviews);
      
      return {
        reviews: {
          current: currentReviews,
          previous: previousReviews,
          growthRate: reviewsGrowthRate,
          byStatus: formatReviewsByStatus(reviewsByStatus)
        },
        ratings: {
          average: ratingData.averageRating ? Math.round(ratingData.averageRating * 10) / 10 : 0,
          total: ratingData.totalRatings,
          distribution: calculateRatingDistribution(ratingData.ratingDistribution)
        }
      };
    } catch (error) {
      console.error('Error in getReviewStatistics:', error);
      throw new Error('Failed to fetch review statistics');
    }
  });
};

/**
 * Get active users count (real-time tracking)
 * Requirements: 2.5, 11.2, 12.1
 * 
 * Note: This is a simplified implementation. For true real-time tracking,
 * consider using Redis with session tracking or WebSocket connections.
 * 
 * @returns {Promise<number>} Count of active users
 */
const getActiveUsersCount = async () => {
  const cacheKey = 'active_users_count';
  
  return getCachedOrFetch(cacheKey, async () => {
    try {
      // Define "active" as users who have activity in the last 15 minutes
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      // This is a placeholder implementation
      // In a real system, you would track active sessions/connections
      // For now, we'll count users with recent activity (if you have a lastActive field)
      
      // If User model has lastActive field:
      // const activeCount = await User.countDocuments({
      //   lastActive: { $gte: fifteenMinutesAgo }
      // });
      
      // Placeholder: Return 0 for now
      // TODO: Implement proper session tracking with Redis or similar
      const activeCount = 0;
      
      return activeCount;
    } catch (error) {
      console.error('Error in getActiveUsersCount:', error);
      throw new Error('Failed to fetch active users count');
    }
  });
};

/**
 * Get comprehensive overview statistics
 * Requirements: 2.1-2.6, 12.1, 12.2
 * 
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for current period
 * @param {Date} options.endDate - End date for current period
 * @returns {Promise<Object>} Overview statistics
 */
const getOverviewStatistics = async (options = {}) => {
  try {
    const [
      userStats,
      jobStats,
      courseStats,
      reviewStats,
      activeUsers
    ] = await Promise.all([
      getUserStatistics(options),
      getJobStatistics(options),
      getCourseStatistics(options),
      getReviewStatistics(options),
      getActiveUsersCount()
    ]);
    
    return {
      users: userStats,
      jobs: jobStats,
      courses: courseStats,
      reviews: reviewStats,
      activeUsers,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error in getOverviewStatistics:', error);
    throw new Error('Failed to fetch overview statistics');
  }
};

module.exports = {
  getUserStatistics,
  getJobStatistics,
  getCourseStatistics,
  getReviewStatistics,
  getActiveUsersCount,
  getOverviewStatistics,
  calculateGrowthRate, // Export for testing
  getCacheStats, // Export for monitoring
  clearCache, // Export for cache management
  invalidateCache, // Export for cache invalidation
  invalidateAllStatistics // Export for bulk cache invalidation
};
