const CompanyInfo = require('../models/CompanyInfo');
const { Company } = require('../models/User');
const Review = require('../models/Review');
const JobPosting = require('../models/JobPosting');

/**
 * Get enhanced company information
 * Requirements: 9.1
 */
exports.getCompanyInfo = async (companyId) => {
  try {
    // 1. Get or create basic company info
    let info = await CompanyInfo.findOne({ company: companyId });
    const company = await Company.findById(companyId);

    if (!company) return null;

    if (!info) {
      info = new CompanyInfo({ company: companyId });
      await info.save();
    }

    // 2. Get active job postings count
    const activeJobs = await JobPosting.countDocuments({ postedBy: companyId, status: 'Open' });
    const totalJobs = await JobPosting.countDocuments({ postedBy: companyId });

    // 3. Update response rate (simplified logic)
    // In a real app, this would be calculated from application interactions

    info.activeJobPostings = activeJobs;
    info.totalJobPostings = totalJobs;
    await info.save();

    return {
      ...info.toObject(),
      companyName: company.companyName,
      industry: company.companyIndustry,
      rating: company.reviewStats?.averageRating || 0,
      totalReviews: company.reviewStats?.totalReviews || 0
    };
  } catch (error) {
    console.error('Error getting company info:', error);
    return null;
  }
};
