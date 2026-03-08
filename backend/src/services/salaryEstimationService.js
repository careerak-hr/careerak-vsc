const SalaryData = require('../models/SalaryData');
const JobPosting = require('../models/JobPosting');

/**
 * Get salary estimate and comparison for a job
 * Requirements: 7.1
 */
exports.getSalaryEstimate = async (jobId) => {
  try {
    const job = await JobPosting.findById(jobId);
    if (!job || !job.salary || !job.salary.min) return null;

    const avgOffered = (job.salary.min + (job.salary.max || job.salary.min)) / 2;

    // Find market data for this title and experience level
    const marketData = await SalaryData.findOne({
      jobTitle: { $regex: job.title, $options: 'i' },
      experienceLevel: job.experienceLevel
    });

    if (!marketData) {
      // If no exact match, return general stats for the industry/level
      return {
        offered: avgOffered,
        marketAvg: null,
        status: 'N/A'
      };
    }

    const diff = ((avgOffered - marketData.avgSalary) / marketData.avgSalary) * 100;
    let status = 'Average';
    if (diff > 10) status = 'Above Average';
    if (diff < -10) status = 'Below Average';

    return {
      offered: avgOffered,
      marketAvg: marketData.avgSalary,
      min: marketData.minSalary,
      max: marketData.maxSalary,
      differencePercentage: Math.round(diff),
      status
    };
  } catch (error) {
    console.error('Error estimating salary:', error);
    return null;
  }
};
