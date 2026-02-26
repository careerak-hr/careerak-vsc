const statisticsService = require('../services/statisticsService');
const { shortCacheHeaders } = require('../middleware/cacheHeaders');

/**
 * Statistics Controller for Admin Dashboard
 * 
 * Handles HTTP requests for statistics endpoints.
 * Uses cache headers middleware for optimal caching.
 * Implements Requirements 2.1-2.9, 11.2
 */

/**
 * Get overview statistics
 * GET /api/admin/statistics/overview
 * 
 * Requirements: 2.1-2.6, 11.2
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOverview = async (req, res) => {
  try {
    const stats = await statisticsService.getOverviewStatistics();
    
    res.status(200).json({
      success: true,
      data: {
        activeUsers: stats.activeUsers,
        jobsToday: stats.jobs.jobs.current,
        applicationsToday: stats.jobs.applications.current,
        enrollmentsToday: stats.courses.enrollments.current,
        reviewsToday: stats.reviews.reviews.current,
        growthRates: {
          users: {
            weekly: stats.users.growthRate,
            monthly: stats.users.growthRate // TODO: Calculate actual monthly rate
          },
          jobs: {
            weekly: stats.jobs.jobs.growthRate,
            monthly: stats.jobs.jobs.growthRate
          },
          applications: {
            weekly: stats.jobs.applications.growthRate,
            monthly: stats.jobs.applications.growthRate
          },
          enrollments: {
            weekly: stats.courses.enrollments.growthRate,
            monthly: stats.courses.enrollments.growthRate
          },
          reviews: {
            weekly: stats.reviews.reviews.growthRate,
            monthly: stats.reviews.reviews.growthRate
          }
        }
      },
      timestamp: stats.timestamp
    });
  } catch (error) {
    console.error('Error in getOverview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview statistics',
      message: error.message
    });
  }
};

/**
 * Get user statistics with time range
 * GET /api/admin/statistics/users?timeRange=daily|weekly|monthly
 * 
 * Requirements: 2.1, 11.2
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserStatistics = async (req, res) => {
  try {
    const { timeRange = 'daily' } = req.query;
    
    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'daily':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }
    
    const stats = await statisticsService.getUserStatistics({
      startDate,
      endDate: now
    });
    
    res.status(200).json({
      success: true,
      data: {
        timeRange,
        labels: generateLabels(startDate, now, timeRange),
        newUsers: stats.current.total,
        totalUsers: stats.current.total + stats.previous.total,
        byType: stats.current.byType,
        growthRate: stats.growthRate,
        growthRateByType: stats.growthRateByType
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in getUserStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
      message: error.message
    });
  }
};

/**
 * Get job statistics with time range
 * GET /api/admin/statistics/jobs?timeRange=daily|weekly|monthly
 * 
 * Requirements: 2.2, 11.2
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getJobStatistics = async (req, res) => {
  try {
    const { timeRange = 'daily' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'daily':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }
    
    const stats = await statisticsService.getJobStatistics({
      startDate,
      endDate: now
    });
    
    res.status(200).json({
      success: true,
      data: {
        timeRange,
        labels: generateLabels(startDate, now, timeRange),
        jobsPosted: stats.jobs.current,
        applications: stats.applications.current,
        jobsByStatus: stats.jobs.byStatus,
        applicationsByStatus: stats.applications.byStatus,
        growthRates: {
          jobs: stats.jobs.growthRate,
          applications: stats.applications.growthRate
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in getJobStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job statistics',
      message: error.message
    });
  }
};

/**
 * Get course statistics with time range
 * GET /api/admin/statistics/courses?timeRange=daily|weekly|monthly
 * 
 * Requirements: 2.3, 11.2
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCourseStatistics = async (req, res) => {
  try {
    const { timeRange = 'daily' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'daily':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }
    
    const stats = await statisticsService.getCourseStatistics({
      startDate,
      endDate: now
    });
    
    res.status(200).json({
      success: true,
      data: {
        timeRange,
        labels: generateLabels(startDate, now, timeRange),
        coursesPublished: stats.courses.current,
        enrollments: stats.enrollments.current,
        totalEnrollments: stats.enrollments.total,
        coursesByStatus: stats.courses.byStatus,
        growthRates: {
          courses: stats.courses.growthRate,
          enrollments: stats.enrollments.growthRate
        }
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in getCourseStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course statistics',
      message: error.message
    });
  }
};

/**
 * Get review statistics with time range
 * GET /api/admin/statistics/reviews?timeRange=daily|weekly|monthly
 * 
 * Requirements: 2.4, 11.2
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReviewStatistics = async (req, res) => {
  try {
    const { timeRange = 'daily' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'daily':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }
    
    const stats = await statisticsService.getReviewStatistics({
      startDate,
      endDate: now
    });
    
    res.status(200).json({
      success: true,
      data: {
        timeRange,
        labels: generateLabels(startDate, now, timeRange),
        reviewCount: stats.reviews.current,
        averageRating: stats.ratings.average,
        totalRatings: stats.ratings.total,
        ratingDistribution: stats.ratings.distribution,
        reviewsByStatus: stats.reviews.byStatus,
        growthRate: stats.reviews.growthRate
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error in getReviewStatistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review statistics',
      message: error.message
    });
  }
};

/**
 * Helper: Generate labels for charts based on time range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} timeRange - Time range (daily, weekly, monthly)
 * @returns {string[]} Array of labels
 */
const generateLabels = (startDate, endDate, timeRange) => {
  const labels = [];
  const current = new Date(startDate);
  
  switch (timeRange) {
    case 'daily':
      // Generate hourly labels for daily view
      while (current <= endDate) {
        labels.push(current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        current.setHours(current.getHours() + 1);
      }
      break;
      
    case 'weekly':
      // Generate daily labels for weekly view
      while (current <= endDate) {
        labels.push(current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        current.setDate(current.getDate() + 1);
      }
      break;
      
    case 'monthly':
      // Generate weekly labels for monthly view
      while (current <= endDate) {
        labels.push(current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        current.setDate(current.getDate() + 7);
      }
      break;
      
    default:
      labels.push('Current Period');
  }
  
  return labels;
};

module.exports = {
  getOverview,
  getUserStatistics,
  getJobStatistics,
  getCourseStatistics,
  getReviewStatistics
};
