const CompanyInfo = require('../models/CompanyInfo');
const JobPosting = require('../models/JobPosting');
const Review = require('../models/Review');
const JobApplication = require('../models/JobApplication');
const companyResponseRateService = require('./companyResponseRateService');

class CompanyInfoService {
  /**
   * Get company information by company ID
   */
  async getCompanyInfo(companyId) {
    try {
      let companyInfo = await CompanyInfo.findOne({ companyId })
        .populate('companyId', 'name email profilePicture');
      
      if (!companyInfo) {
        // Create default company info if not exists
        const company = await require('../models/User').findById(companyId);
        if (!company) {
          throw new Error('Company not found');
        }
        
        companyInfo = await CompanyInfo.create({
          companyId,
          name: company.name || 'شركة',
          logo: company.profilePicture || null
        });
      }
      
      // Update open positions count
      const openPositionsCount = await JobPosting.countDocuments({
        company: companyId,
        status: 'active'
      });
      
      companyInfo.openPositions = openPositionsCount;
      
      // Update rating from reviews if needed
      // Check if rating was updated in the last 24 hours
      const lastUpdate = companyInfo.updatedAt;
      const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate > 24 || companyInfo.rating.count === 0) {
        // Update rating from reviews
        await this.updateCompanyRating(companyId);
        // Reload company info to get updated rating
        companyInfo = await CompanyInfo.findOne({ companyId });
      }
      
      await companyInfo.save();
      
      return companyInfo;
    } catch (error) {
      throw new Error(`Error getting company info: ${error.message}`);
    }
  }

  /**
   * Update company information
   */
  async updateCompanyInfo(companyId, updateData) {
    try {
      // Auto-determine size if employeeCount is provided
      if (updateData.employeeCount !== undefined) {
        updateData.size = this.determineCompanySize(updateData.employeeCount);
      }
      
      const companyInfo = await CompanyInfo.findOneAndUpdate(
        { companyId },
        {
          ...updateData,
          updatedAt: Date.now()
        },
        { new: true, upsert: true }
      );
      
      return companyInfo;
    } catch (error) {
      throw new Error(`Error updating company info: ${error.message}`);
    }
  }

  /**
   * Calculate and update company rating from reviews
   */
  async updateCompanyRating(companyId) {
    try {
      // Get reviews where employees reviewed the company
      const reviews = await Review.find({
        reviewee: companyId,
        reviewType: 'employee_to_company',
        status: 'approved'
      });
      
      if (reviews.length === 0) {
        // No reviews yet, set defaults
        const companyInfo = await CompanyInfo.findOneAndUpdate(
          { companyId },
          {
            'rating.average': 0,
            'rating.count': 0,
            'rating.breakdown.culture': 0,
            'rating.breakdown.salary': 0,
            'rating.breakdown.management': 0,
            'rating.breakdown.workLife': 0,
            updatedAt: Date.now()
          },
          { new: true, upsert: true }
        );
        return companyInfo;
      }
      
      // Calculate averages from detailed ratings
      let totalOverall = 0;
      let totalCulture = 0;
      let totalSalary = 0;
      let totalManagement = 0;
      let totalWorkLife = 0;
      let countWithDetails = 0;
      
      reviews.forEach(review => {
        // Use overall rating
        totalOverall += review.rating || 0;
        
        // Use detailed ratings if available
        if (review.detailedRatings) {
          if (review.detailedRatings.workEnvironment) {
            totalCulture += review.detailedRatings.workEnvironment;
            countWithDetails++;
          }
          if (review.detailedRatings.benefits) {
            totalSalary += review.detailedRatings.benefits;
          }
          if (review.detailedRatings.management) {
            totalManagement += review.detailedRatings.management;
          }
          if (review.detailedRatings.careerGrowth) {
            totalWorkLife += review.detailedRatings.careerGrowth;
          }
        }
      });
      
      const count = reviews.length;
      const detailCount = countWithDetails || count;
      
      const companyInfo = await CompanyInfo.findOneAndUpdate(
        { companyId },
        {
          'rating.average': Math.round((totalOverall / count) * 10) / 10,
          'rating.count': count,
          'rating.breakdown.culture': Math.round((totalCulture / detailCount) * 10) / 10,
          'rating.breakdown.salary': Math.round((totalSalary / detailCount) * 10) / 10,
          'rating.breakdown.management': Math.round((totalManagement / detailCount) * 10) / 10,
          'rating.breakdown.workLife': Math.round((totalWorkLife / detailCount) * 10) / 10,
          updatedAt: Date.now()
        },
        { new: true, upsert: true }
      );
      
      return companyInfo;
    } catch (error) {
      throw new Error(`Error updating company rating: ${error.message}`);
    }
  }

  /**
   * Calculate and update company response rate
   */
  async updateCompanyResponseRate(companyId) {
    try {
      // استخدام الخدمة الجديدة لحساب معدل الاستجابة
      const responseRate = await companyResponseRateService.calculateResponseRate(companyId);
      
      if (!responseRate.label) {
        // لا توجد بيانات كافية
        return null;
      }
      
      // تحديث CompanyInfo
      const companyInfo = await CompanyInfo.findOneAndUpdate(
        { companyId },
        {
          'responseRate.percentage': responseRate.percentage,
          'responseRate.label': responseRate.label,
          'responseRate.averageResponseTime': responseRate.averageResponseTime,
          'responseRate.lastUpdated': new Date(),
          updatedAt: Date.now()
        },
        { new: true, upsert: true }
      );
      
      return companyInfo;
    } catch (error) {
      throw new Error(`Error updating company response rate: ${error.message}`);
    }
  }

  /**
   * Get company statistics
   */
  async getCompanyStatistics(companyId) {
    try {
      const [
        companyInfo,
        totalJobs,
        activeJobs,
        totalApplications,
        acceptedApplications
      ] = await Promise.all([
        this.getCompanyInfo(companyId),
        JobPosting.countDocuments({ company: companyId }),
        JobPosting.countDocuments({ company: companyId, status: 'active' }),
        JobApplication.countDocuments({ 'job.company': companyId }),
        JobApplication.countDocuments({ 'job.company': companyId, status: 'accepted' })
      ]);
      
      return {
        companyInfo,
        statistics: {
          totalJobs,
          activeJobs,
          totalApplications,
          acceptedApplications,
          acceptanceRate: totalApplications > 0 
            ? ((acceptedApplications / totalApplications) * 100).toFixed(2) 
            : 0
        }
      };
    } catch (error) {
      throw new Error(`Error getting company statistics: ${error.message}`);
    }
  }

  /**
   * Get other jobs from the same company
   */
  async getCompanyJobs(companyId, currentJobId = null, limit = 5) {
    try {
      const query = {
        company: companyId,
        status: 'active'
      };
      
      if (currentJobId) {
        query._id = { $ne: currentJobId };
      }
      
      const jobs = await JobPosting.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title location salary experienceLevel createdAt');
      
      return jobs;
    } catch (error) {
      throw new Error(`Error getting company jobs: ${error.message}`);
    }
  }

  /**
   * Determine company size based on employee count
   */
  determineCompanySize(employeeCount) {
    if (employeeCount < 50) return 'small';
    if (employeeCount <= 500) return 'medium';
    return 'large';
  }

  /**
   * Update all company metrics (rating, response rate, open positions)
   */
  async updateAllCompanyMetrics(companyId) {
    try {
      await Promise.all([
        this.updateCompanyRating(companyId),
        this.updateCompanyResponseRate(companyId)
      ]);
      
      return await this.getCompanyInfo(companyId);
    } catch (error) {
      throw new Error(`Error updating all company metrics: ${error.message}`);
    }
  }
}

module.exports = new CompanyInfoService();
