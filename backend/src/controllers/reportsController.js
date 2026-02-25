const reportsService = require('../services/reportsService');

/**
 * Reports Controller
 * Handles admin report generation requests
 */

/**
 * Generate users report
 * GET /api/admin/reports/users
 */
const getUsersReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const report = await reportsService.generateUsersReport(startDate, endDate);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getUsersReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate users report',
      error: error.message
    });
  }
};

/**
 * Generate jobs report
 * GET /api/admin/reports/jobs
 */
const getJobsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const report = await reportsService.generateJobsReport(startDate, endDate);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getJobsReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate jobs report',
      error: error.message
    });
  }
};

/**
 * Generate courses report
 * GET /api/admin/reports/courses
 */
const getCoursesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const report = await reportsService.generateCoursesReport(startDate, endDate);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getCoursesReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate courses report',
      error: error.message
    });
  }
};

/**
 * Generate reviews report
 * GET /api/admin/reports/reviews
 */
const getReviewsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    const report = await reportsService.generateReviewsReport(startDate, endDate);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error in getReviewsReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate reviews report',
      error: error.message
    });
  }
};

module.exports = {
  getUsersReport,
  getJobsReport,
  getCoursesReport,
  getReviewsReport
};
