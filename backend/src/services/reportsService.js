const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const JobApplication = require('../models/JobApplication');
const TrainingCourse = require('../models/TrainingCourse');
const EducationalCourse = require('../models/EducationalCourse');
const Review = require('../models/Review');

/**
 * Reports Service
 * Generates comprehensive reports for admin dashboard
 */

/**
 * Generate users report with statistics
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 * @returns {Object} Users report with statistics
 */
const generateUsersReport = async (startDate, endDate) => {
  try {
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total users in date range
    const totalUsers = await User.countDocuments(dateFilter);

    // Users by type
    const usersByType = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    const byType = {};
    usersByType.forEach(item => {
      byType[item._id] = item.count;
    });

    // Calculate growth rate (compare with previous period)
    let growthRate = 0;
    if (startDate && endDate) {
      const periodLength = new Date(endDate) - new Date(startDate);
      const previousStartDate = new Date(new Date(startDate) - periodLength);
      const previousEndDate = new Date(startDate);

      const previousCount = await User.countDocuments({
        createdAt: {
          $gte: previousStartDate,
          $lt: previousEndDate
        }
      });

      if (previousCount > 0) {
        growthRate = ((totalUsers - previousCount) / previousCount) * 100;
      }
    }

    // Most active users (by job applications + course enrollments)
    const mostActive = await User.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'jobapplications',
          localField: '_id',
          foreignField: 'applicantId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          activityCount: { $size: '$applications' }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          userType: 1,
          activityCount: 1
        }
      }
    ]);

    // Inactive users (no activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactive = await User.find({
      ...dateFilter,
      lastLogin: { $lt: thirtyDaysAgo }
    })
      .select('_id name email userType lastLogin')
      .limit(10)
      .lean();

    return {
      totalUsers,
      byType,
      growthRate: Math.round(growthRate * 100) / 100,
      mostActive,
      inactive,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    };
  } catch (error) {
    console.error('Error generating users report:', error);
    throw new Error('Failed to generate users report');
  }
};

/**
 * Generate jobs report with field breakdown
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 * @returns {Object} Jobs report with statistics
 */
const generateJobsReport = async (startDate, endDate) => {
  try {
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total jobs in date range
    const totalJobs = await JobPosting.countDocuments(dateFilter);

    // Jobs by field
    const jobsByField = await JobPosting.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$field',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const byField = {};
    jobsByField.forEach(item => {
      byField[item._id] = item.count;
    });

    // Calculate application rate
    const totalApplications = await JobApplication.countDocuments({
      createdAt: dateFilter.createdAt || {}
    });

    const applicationRate = totalJobs > 0 
      ? Math.round((totalApplications / totalJobs) * 100) / 100 
      : 0;

    // Most popular jobs (by application count)
    const mostPopular = await JobPosting.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'jobapplications',
          localField: '_id',
          foreignField: 'jobId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationCount: { $size: '$applications' }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          title: 1,
          field: 1,
          companyId: 1,
          applicationCount: 1
        }
      }
    ]);

    // Most active companies (by job postings)
    const mostActiveCompanies = await JobPosting.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$companyId',
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'company'
        }
      },
      { $unwind: '$company' },
      {
        $project: {
          _id: 1,
          companyName: '$company.name',
          jobCount: 1
        }
      }
    ]);

    return {
      totalJobs,
      byField,
      applicationRate,
      mostPopular,
      mostActiveCompanies,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    };
  } catch (error) {
    console.error('Error generating jobs report:', error);
    throw new Error('Failed to generate jobs report');
  }
};

/**
 * Generate courses report with completion rates
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 * @returns {Object} Courses report with statistics
 */
const generateCoursesReport = async (startDate, endDate) => {
  try {
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Count training courses
    const trainingCoursesCount = await TrainingCourse.countDocuments(dateFilter);
    
    // Count educational courses
    const educationalCoursesCount = await EducationalCourse.countDocuments(dateFilter);
    
    const totalCourses = trainingCoursesCount + educationalCoursesCount;

    // Courses by field (training courses)
    const trainingByField = await TrainingCourse.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$field',
          count: { $sum: 1 }
        }
      }
    ]);

    // Courses by field (educational courses)
    const educationalByField = await EducationalCourse.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$field',
          count: { $sum: 1 }
        }
      }
    ]);

    // Merge field counts
    const byField = {};
    trainingByField.forEach(item => {
      byField[item._id] = (byField[item._id] || 0) + item.count;
    });
    educationalByField.forEach(item => {
      byField[item._id] = (byField[item._id] || 0) + item.count;
    });

    // Calculate enrollment rate (using enrolledUsers array)
    const trainingEnrollments = await TrainingCourse.aggregate([
      { $match: dateFilter },
      {
        $project: {
          enrollmentCount: { $size: { $ifNull: ['$enrolledUsers', []] } }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$enrollmentCount' }
        }
      }
    ]);

    const educationalEnrollments = await EducationalCourse.aggregate([
      { $match: dateFilter },
      {
        $project: {
          enrollmentCount: { $size: { $ifNull: ['$enrolledUsers', []] } }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$enrollmentCount' }
        }
      }
    ]);

    const totalEnrollments = 
      (trainingEnrollments[0]?.total || 0) + 
      (educationalEnrollments[0]?.total || 0);

    const enrollmentRate = totalCourses > 0 
      ? Math.round((totalEnrollments / totalCourses) * 100) / 100 
      : 0;

    // Calculate completion rate (using completedUsers array)
    const trainingCompletions = await TrainingCourse.aggregate([
      { $match: dateFilter },
      {
        $project: {
          completionCount: { $size: { $ifNull: ['$completedUsers', []] } }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$completionCount' }
        }
      }
    ]);

    const educationalCompletions = await EducationalCourse.aggregate([
      { $match: dateFilter },
      {
        $project: {
          completionCount: { $size: { $ifNull: ['$completedUsers', []] } }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$completionCount' }
        }
      }
    ]);

    const totalCompletions = 
      (trainingCompletions[0]?.total || 0) + 
      (educationalCompletions[0]?.total || 0);

    const completionRate = totalEnrollments > 0 
      ? Math.round((totalCompletions / totalEnrollments) * 100 * 100) / 100 
      : 0;

    // Most popular courses (by enrollment count)
    const popularTraining = await TrainingCourse.aggregate([
      { $match: dateFilter },
      {
        $addFields: {
          enrollmentCount: { $size: { $ifNull: ['$enrolledUsers', []] } }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          title: 1,
          field: 1,
          type: { $literal: 'training' },
          enrollmentCount: 1
        }
      }
    ]);

    const popularEducational = await EducationalCourse.aggregate([
      { $match: dateFilter },
      {
        $addFields: {
          enrollmentCount: { $size: { $ifNull: ['$enrolledUsers', []] } }
        }
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          title: 1,
          field: 1,
          type: { $literal: 'educational' },
          enrollmentCount: 1
        }
      }
    ]);

    const mostPopular = [...popularTraining, ...popularEducational]
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10);

    return {
      totalCourses,
      byField,
      enrollmentRate,
      completionRate,
      mostPopular,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    };
  } catch (error) {
    console.error('Error generating courses report:', error);
    throw new Error('Failed to generate courses report');
  }
};

/**
 * Generate reviews report with rating distribution
 * @param {Date} startDate - Start date for report
 * @param {Date} endDate - End date for report
 * @returns {Object} Reviews report with statistics
 */
const generateReviewsReport = async (startDate, endDate) => {
  try {
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total reviews in date range
    const totalReviews = await Review.countDocuments(dateFilter);

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const averageRating = ratingStats[0]?.averageRating 
      ? Math.round(ratingStats[0].averageRating * 100) / 100 
      : 0;

    // Flagged reviews count
    const flaggedCount = await Review.countDocuments({
      ...dateFilter,
      status: 'flagged'
    });

    // Rating distribution (by overall rating)
    const ratingDistribution = await Review.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const byRating = {};
    for (let i = 1; i <= 5; i++) {
      byRating[i] = 0;
    }
    ratingDistribution.forEach(item => {
      byRating[item._id] = item.count;
    });

    return {
      totalReviews,
      averageRating,
      flaggedCount,
      byRating,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      }
    };
  } catch (error) {
    console.error('Error generating reviews report:', error);
    throw new Error('Failed to generate reviews report');
  }
};

module.exports = {
  generateUsersReport,
  generateJobsReport,
  generateCoursesReport,
  generateReviewsReport
};
